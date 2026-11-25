import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle, Flame, Bell, Volume2, VolumeX, Check, AlertTriangle, RefreshCw, Sun, Moon } from 'lucide-react';
import { supabase } from '../services/supabase';
import { updateKitchenOrderStatus } from '../services/n8n';
import { sound } from '../utils/audio';
import { getRestaurantProfile, onSyncChange, subscribeToProfileRealtime } from '../services/restaurantService';

export default function KitchenScreen() {
  const [profile, setProfile] = useState({
    name: 'Deewan-E-Khaas (Namak Mandi)',
    logo_url: ''
  });
  const [orders, setOrders] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'ready', 'all'
  const [loading, setLoading] = useState(false);

  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deewan_kitchen_theme') || 'dark';
    }
    return 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('deewan_kitchen_theme', nextTheme);
  };

  // Sync Restaurant Name & Logo across all screens via Realtime
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const p = await getRestaurantProfile();
        if (p) setProfile(p);
      } catch (e) {
        console.warn('Failed to load restaurant profile in kitchen:', e);
      }
    };
    loadProfile();
    const unsubRealtime = subscribeToProfileRealtime((p) => {
      if (p) setProfile((prev) => ({ ...prev, ...p }));
    });
    const unsubLocal = onSyncChange(() => {
      loadProfile();
    });
    return () => {
      unsubRealtime();
      unsubLocal();
    };
  }, []);

  // Initial Fetch & Supabase Realtime Subscription
  useEffect(() => {
    fetchOrders();
    fetchWaiterCalls();

    // Subscribe to Orders Table
    const ordersChannel = supabase
      .channel('kitchen_orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            sound.playNewOrderChime();
            setOrders((prev) => [payload.new, ...prev.filter((o) => o.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? payload.new : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to Waiter Calls Table (Floor Buzzer + Dual Order Broadcast)
    const waiterChannel = supabase
      .channel('kitchen_waiter_calls_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waiter_calls' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            if (payload.new.call_type === 'order') {
              try {
                const parsed = JSON.parse(payload.new.notes);
                const orderObj = {
                  id: payload.new.id,
                  order_no: parsed.order_no || '#' + payload.new.id.slice(0, 4),
                  table_no: payload.new.table_no,
                  customer_name: parsed.customer_name || 'Guest',
                  customer_phone: parsed.customer_phone || '',
                  total: parsed.total || 0,
                  status: payload.new.status === 'pending' ? 'received' : payload.new.status,
                  items: parsed.items || [],
                  notes: payload.new.notes,
                  created_at: payload.new.created_at
                };
                sound.playNewOrderChime();
                setOrders((prev) => {
                  if (prev.some((o) => o.order_no === orderObj.order_no)) return prev;
                  return [orderObj, ...prev];
                });
              } catch (e) {
                console.warn('Error parsing realtime order ticket:', e);
              }
            } else if (payload.new.status === 'pending') {
              sound.playWaiterBuzzer();
              setWaiterCalls((prev) => [payload.new, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.call_type === 'order') {
              setOrders((prev) =>
                prev.map((o) => (o.id === payload.new.id ? { ...o, status: payload.new.status } : o))
              );
            } else {
              setWaiterCalls((prev) =>
                prev.map((w) => (w.id === payload.new.id ? payload.new : w))
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(waiterChannel);
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: wcOrders } = await supabase
        .from('waiter_calls')
        .select('*')
        .eq('call_type', 'order')
        .order('created_at', { ascending: false })
        .limit(50);

      const combined = [...(dbOrders || [])];

      if (wcOrders && wcOrders.length > 0) {
        wcOrders.forEach((wc) => {
          try {
            const parsed = JSON.parse(wc.notes);
            const ordNo = parsed.order_no || '#' + wc.id.slice(0, 4);
            if (!combined.some((o) => o.order_no === ordNo)) {
              combined.push({
                id: wc.id,
                order_no: ordNo,
                table_no: wc.table_no,
                customer_name: parsed.customer_name || 'Guest',
                customer_phone: parsed.customer_phone || '',
                total: parsed.total || 0,
                status: wc.status === 'pending' ? 'received' : wc.status,
                items: parsed.items || [],
                notes: wc.notes,
                created_at: wc.created_at
              });
            }
          } catch (e) {
            console.warn('Error parsing order note in fetch:', e);
          }
        });
      }

      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaiterCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('waiter_calls')
        .select('*')
        .neq('call_type', 'order')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setWaiterCalls(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const enableSound = () => {
    sound.init();
    sound.playNewOrderChime();
    setSoundEnabled(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      await supabase.from('waiter_calls').update({ status: newStatus }).eq('id', orderId);
      await updateKitchenOrderStatus({ order_id: orderId, new_status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveWaiterCall = async (callId) => {
    setWaiterCalls((prev) => prev.filter((c) => c.id !== callId));
    try {
      await supabase
        .from('waiter_calls')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', callId);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter orders according to active tab
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'active') return o.status === 'received' || o.status === 'preparing';
    if (activeTab === 'ready') return o.status === 'ready';
    return true;
  });

  return (
    <div className={`min-h-screen p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200 ${
      theme === 'dark' ? 'bg-black text-stone-100' : 'bg-slate-100 text-stone-900'
    }`}>
      {/* Top Header - Red, Black, White */}
      <header className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-red-600 -mx-4 -mt-4 px-4 pt-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 mb-6 transition-colors ${
        theme === 'dark' ? 'bg-stone-950/90 text-white' : 'bg-white/95 text-stone-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt="Logo"
              className="w-11 h-11 rounded-2xl object-cover border border-red-600/40 shadow-lg shrink-0"
            />
          ) : (
            <div className="w-11 h-11 bg-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-red-600/30 shrink-0 text-white">
              🍖
            </div>
          )}
          <div>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-stone-900'
            }`}>
              {profile.name || 'Deewan-E-Khaas'} <span className="text-red-600">KDS</span>
            </h1>
            <p className={`text-xs ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
              Kitchen Display System • Live Supabase Realtime
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Light / Dark Mode Toggle Button - Highly Visible & Unmissable */}
          <button
            onClick={toggleTheme}
            className={`px-3 py-2 rounded-xl border-2 flex items-center gap-2 text-xs font-black transition-all shadow-md active:scale-95 ${
              theme === 'dark'
                ? 'bg-white text-stone-950 border-white hover:bg-stone-100 shadow-white/10'
                : 'bg-stone-900 text-white border-stone-900 hover:bg-black shadow-stone-900/10'
            }`}
            title={theme === 'dark' ? 'Switch Kitchen to Light Theme' : 'Switch Kitchen to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
            )}
            <span className="font-black text-xs uppercase tracking-wider">
              {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            </span>
          </button>

          {!soundEnabled ? (
            <button
              onClick={enableSound}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-600/20 active:scale-95 transition"
            >
              <Volume2 className="w-4 h-4 animate-bounce" />
              Enable Sound Alerts
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 text-red-500 rounded-xl text-xs font-semibold border border-red-600/30">
              <Volume2 className="w-4 h-4" />
              Sound Active
            </div>
          )}

          <button
            onClick={() => {
              fetchOrders();
              fetchWaiterCalls();
            }}
            className={`p-2.5 rounded-xl border transition ${
              theme === 'dark'
                ? 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-800'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300 shadow-sm'
            }`}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Active Waiter Calls Alert Bar */}
      {waiterCalls.length > 0 && (
        <div className="mb-6 p-4 bg-red-600 text-white rounded-2xl shadow-xl border border-red-500 flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full animate-bounce">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                🛎️ WAITER CALL: Table #{waiterCalls[0].table_no}
              </h3>
              <p className="text-xs text-red-100">
                Reason: <b>{waiterCalls[0].call_type.toUpperCase()}</b> • {waiterCalls[0].notes || 'Staff needed at table'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleResolveWaiterCall(waiterCalls[0].id)}
            className="px-4 py-2 bg-white text-red-700 rounded-xl font-bold text-xs hover:bg-stone-100 active:scale-95 shadow transition"
          >
            ✓ Mark Attended
          </button>
        </div>
      )}

      {/* Filter Tabs - Red, Black, White */}
      <div className={`p-1.5 rounded-2xl flex flex-wrap gap-2 mb-6 border ${
        theme === 'dark' ? 'bg-stone-900/90 border-stone-800' : 'bg-stone-200/90 border-stone-300'
      }`}>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'active'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : theme === 'dark'
                ? 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          Active Orders ({orders.filter((o) => o.status === 'received' || o.status === 'preparing').length})
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'ready'
              ? theme === 'dark'
                ? 'bg-white text-black font-extrabold shadow-lg'
                : 'bg-stone-900 text-white font-extrabold shadow-lg'
              : theme === 'dark'
                ? 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          Ready to Serve ({orders.filter((o) => o.status === 'ready').length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'all'
              ? 'bg-red-700 text-white shadow'
              : theme === 'dark'
                ? 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          All Orders ({orders.length})
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-20 rounded-3xl border transition-colors ${
          theme === 'dark'
            ? 'bg-stone-950 border-stone-900 text-stone-500'
            : 'bg-white border-stone-200 text-stone-400 shadow-sm'
        }`}>
          <ChefHat className={`w-16 h-16 stroke-[1.5] mb-3 ${theme === 'dark' ? 'text-stone-700' : 'text-stone-300'}`} />
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-stone-400' : 'text-stone-700'}`}>No active kitchen orders</p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-stone-600' : 'text-stone-500'}`}>
            Orders placed by guests will appear here live with sound alerts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => (
            <OrderTicketCard
              key={order.id}
              order={order}
              theme={theme}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Subcomponent: Live Order Ticket Card with Timer & Theme Support
function OrderTicketCard({ order, theme = 'dark', onStatusChange }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const createdAt = new Date(order.created_at).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - createdAt) / 1000));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  let timerBadgeColor = theme === 'dark' 
    ? 'bg-stone-900 text-stone-300 border-stone-800' 
    : 'bg-stone-100 text-stone-700 border-stone-300';
  let cardBorder = theme === 'dark' ? 'border-stone-800' : 'border-stone-200';

  if (order.status !== 'served' && order.status !== 'ready') {
    if (minutes >= 20) {
      timerBadgeColor = 'bg-red-600 text-white animate-pulse border-red-500';
      cardBorder = 'border-red-600 shadow-xl shadow-red-600/20';
    } else if (minutes >= 10) {
      timerBadgeColor = 'bg-red-900/60 text-red-200 border-red-700 font-bold';
      cardBorder = 'border-red-600/60 shadow-lg';
    }
  }

  // Parse items from order_items, order.items, or order.notes
  let items = order.order_items || order.items;
  if ((!items || items.length === 0) && order.notes) {
    try {
      if (order.notes.startsWith('[')) {
        items = JSON.parse(order.notes);
      } else {
        const parsed = JSON.parse(order.notes);
        if (parsed.items) items = parsed.items;
      }
    } catch (e) {}
  }
  items = items || [];

  return (
    <div className={`rounded-2xl p-4 border-2 ${cardBorder} flex flex-col justify-between transition-all duration-200 ${
      theme === 'dark' ? 'bg-stone-950 text-stone-100' : 'bg-white text-stone-900 shadow-md'
    }`}>
      <div>
        {/* Card Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          theme === 'dark' ? 'border-stone-800' : 'border-stone-200'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                {order.order_no || '#101'}
              </span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white">
                Table #{order.table_no}
              </span>
            </div>
            <p className={`text-xs mt-1 font-medium ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
              {order.customer_name || 'Guest'} {order.customer_phone ? `• ${order.customer_phone}` : ''}
            </p>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${timerBadgeColor}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeFormatted}</span>
          </div>
        </div>

        {/* Items List */}
        <div className="py-3 space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between text-sm">
              <div className={`flex items-center gap-2 font-semibold ${
                theme === 'dark' ? 'text-stone-100' : 'text-stone-800'
              }`}>
                <span className="w-6 h-6 rounded-md bg-red-600/10 border border-red-600/30 flex items-center justify-center text-xs font-black text-red-600">
                  {item.quantity}x
                </span>
                <span>{item.name || item.item_name}</span>
              </div>
              <span className={`text-xs font-mono ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                Rs. {item.line_total || item.subtotal || ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card Actions */}
      <div className={`pt-3 border-t mt-2 ${theme === 'dark' ? 'border-stone-800' : 'border-stone-200'}`}>
        <div className="flex items-center gap-2">
          {order.status === 'received' && (
            <button
              onClick={() => onStatusChange(order.id, 'preparing')}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 transition"
            >
              <Flame className="w-4 h-4" />
              Start Preparing
            </button>
          )}

          {order.status === 'preparing' && (
            <button
              onClick={() => onStatusChange(order.id, 'ready')}
              className={`flex-1 py-2.5 active:scale-95 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition ${
                theme === 'dark'
                  ? 'bg-white hover:bg-stone-100 text-black'
                  : 'bg-stone-900 hover:bg-black text-white'
              }`}
            >
              <Check className="w-4 h-4 text-red-600 stroke-[3]" />
              Mark Ready to Serve
            </button>
          )}

          {order.status === 'ready' && (
            <button
              onClick={() => onStatusChange(order.id, 'served')}
              className={`flex-1 py-2.5 active:scale-95 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border ${
                theme === 'dark'
                  ? 'bg-stone-900 hover:bg-stone-800 text-white border-stone-700'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border-stone-300'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-red-600" />
              Mark Served
            </button>
          )}

          {order.status === 'served' && (
            <div className={`w-full py-2 rounded-xl text-xs font-bold text-center border ${
              theme === 'dark'
                ? 'bg-stone-900 text-stone-400 border-stone-800'
                : 'bg-stone-100 text-stone-600 border-stone-200'
            }`}>
              ✓ Served to Table #{order.table_no}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
