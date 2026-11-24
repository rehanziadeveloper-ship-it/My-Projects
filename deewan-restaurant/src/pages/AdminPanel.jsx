import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Settings, Utensils, QrCode, FileText, ToggleLeft, ToggleRight, Search, Printer, DollarSign, Image as ImageIcon, Bell, CheckCircle, Clock, Volume2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { sound } from '../utils/audio';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'qr', 'orders'
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [selectedTableForQr, setSelectedTableForQr] = useState(1);

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();

    // 1. Subscribe to Supabase Realtime for orders table
    const ordersChannel = supabase
      .channel('admin_orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            sound.playNewOrderChime();
            setNewOrderAlert(payload.new);
            setOrders((prev) => [payload.new, ...prev.filter((o) => o.id !== payload.new.id)]);
            setTimeout(() => setNewOrderAlert(null), 8000);
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

    // 2. Subscribe to Supabase Realtime for waiter_calls table (captures dual-broadcast orders)
    const waiterCallsChannel = supabase
      .channel('admin_waiter_calls_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waiter_calls' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.call_type === 'order') {
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
                notes: JSON.stringify(parsed.items || []),
                created_at: payload.new.created_at
              };
              sound.playNewOrderChime();
              setNewOrderAlert(orderObj);
              setOrders((prev) => {
                if (prev.some((o) => o.order_no === orderObj.order_no)) return prev;
                return [orderObj, ...prev];
              });
              setTimeout(() => setNewOrderAlert(null), 8000);
            } catch (e) {
              console.warn('Error parsing realtime order from waiter_calls:', e);
            }
          } else if (payload.eventType === 'UPDATE' && payload.new.call_type === 'order') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, status: payload.new.status } : o))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(waiterCallsChannel);
    };
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('item_number', { ascending: true });

      if (data && !error) {
        setMenuItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      // 1. Fetch direct orders
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      // 2. Fetch waiter_calls orders (broadcasted orders)
      const { data: wcOrders } = await supabase
        .from('waiter_calls')
        .select('*')
        .eq('call_type', 'order')
        .order('created_at', { ascending: false })
        .limit(30);

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
                notes: JSON.stringify(parsed.items || []),
                created_at: wc.created_at
              });
            }
          } catch (e) {
            console.warn('Error parsing order note:', e);
          }
        });
      }

      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(combined);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      await supabase.from('waiter_calls').update({ status: newStatus }).eq('id', orderId);
    } catch (err) {
      console.warn('Status update note:', err);
    }
  };

  const toggleAvailability = async (itemId, currentVal) => {
    const newVal = !currentVal;
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, is_available: newVal } : item))
    );

    try {
      await supabase
        .from('menu_items')
        .update({ is_available: newVal })
        .eq('id', itemId);
    } catch (e) {
      console.error('Failed to toggle availability:', e);
    }
  };

  const handlePrintQr = () => {
    window.print();
  };

  const filteredItems = menuItems.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(i.item_number).includes(searchQuery);
    return matchSearch;
  });

  const qrUrl = `${window.location.origin}/chat?table=${selectedTableForQr}`;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <nav className="bg-stone-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight">Deewan-E-Khaas Admin</h1>
            <p className="text-xs text-stone-400">Namak Mandi Manager & QR Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'menu'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Menu & Stock ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'qr'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Table QR Generator
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'orders'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Recent Orders ({orders.length})
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Realtime New Order Alert Banner */}
        {newOrderAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-orange-600 text-white shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">🔔 New Order Received: {newOrderAlert.order_no}</h3>
                <p className="text-xs text-orange-100">
                  Table #{newOrderAlert.table_no} • {newOrderAlert.customer_name} • PKR {Number(newOrderAlert.total).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setActiveTab('orders'); setNewOrderAlert(null); }}
              className="px-3.5 py-1.5 bg-white text-orange-800 font-bold text-xs rounded-xl shadow hover:bg-orange-50 active:scale-95 transition"
            >
              View Orders
            </button>
          </div>
        )}

        {/* 1. Menu Items Management */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Menu Items & Stock Control</h2>
                <p className="text-xs text-stone-500">Toggle dish availability instantly. Unavailable items are politely refused by the AI chatbot.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dish or item #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Price (PKR)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-stone-500">
                        {item.item_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-orange-600">
                        PKR {Number(item.price).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.is_available
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.is_available ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toggleAvailability(item.id, item.is_available)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition active:scale-95 ${
                            item.is_available
                              ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {item.is_available ? 'Set Out of Stock' : 'Make Available'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. QR Code Generator */}
        {activeTab === 'qr' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-stone-900">Printable Table QR Placards</h2>
              <p className="text-xs text-stone-500 mt-1">
                Select a table number to generate a QR code linking directly to the guest chat.
              </p>
            </div>

            {/* Table Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedTableForQr(num)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                    selectedTableForQr === num
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Table {num}
                </button>
              ))}
            </div>

            {/* Printable Card Area */}
            <div
              id="printable-card"
              className="border-4 border-stone-900 rounded-3xl p-8 bg-gradient-to-b from-orange-50 to-white text-center shadow-lg max-w-sm mx-auto"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-600 flex items-center justify-center text-white text-2xl">
                🍖
              </div>
              <h3 className="text-2xl font-black tracking-tight text-stone-900">DEEWAN-E-KHAAS</h3>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-widest mb-6">
                Namak Mandi • Dine-In
              </p>

              <div className="bg-white p-4 rounded-2xl shadow-inner border border-stone-200 inline-block mb-4">
                <QRCodeSVG value={qrUrl} size={180} level="H" includeMargin={true} />
              </div>

              <div className="mt-2">
                <span className="inline-block px-5 py-1.5 rounded-full bg-stone-900 text-white font-black text-lg">
                  TABLE #{selectedTableForQr}
                </span>
                <p className="text-xs text-stone-600 mt-3 font-medium">
                  Scan QR with your phone camera to browse the menu and order by chat!
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handlePrintQr}
                className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 mx-auto active:scale-95 transition"
              >
                <Printer className="w-4 h-4" />
                Print Table {selectedTableForQr} Placard
              </button>
            </div>
          </div>
        )}

        {/* 3. Recent Orders Audit */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Live Dine-In Orders ({orders.length})</h2>
                <p className="text-xs text-stone-500">Realtime order stream with customer details, item quantities, and status synchronizer.</p>
              </div>
              <button
                onClick={fetchOrders}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                Refresh Orders
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <FileText className="w-12 h-12 mx-auto mb-2 text-stone-300" />
                <p className="font-semibold text-sm">No orders yet</p>
                <p className="text-xs">New dine-in orders placed through the chatbot will appear here in real time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Table</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items Ordered</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status & Sync</th>
                      <th className="py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {orders.map((o) => {
                      let itemsDisplay = [];
                      try {
                        if (o.notes && o.notes.startsWith('[')) {
                          const parsed = JSON.parse(o.notes);
                          itemsDisplay = parsed.map((it) => `${it.quantity}x ${it.name}`);
                        }
                      } catch (e) {}

                      const statusColors = {
                        received: 'bg-amber-100 text-amber-800 border-amber-300',
                        preparing: 'bg-blue-100 text-blue-800 border-blue-300',
                        ready: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                        served: 'bg-purple-100 text-purple-800 border-purple-300',
                        cancelled: 'bg-red-100 text-red-800 border-red-300'
                      };

                      return (
                        <tr key={o.id || o.order_no} className="hover:bg-stone-50/80 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-stone-900">{o.order_no}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                              Table {o.table_no}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-stone-900">{o.customer_name}</div>
                            <div className="font-mono text-[11px] text-stone-500">{o.customer_phone}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            {itemsDisplay.length > 0 ? (
                              <div className="space-y-0.5">
                                {itemsDisplay.map((itemStr, idx) => (
                                  <div key={idx} className="text-stone-700 truncate font-medium">
                                    • {itemStr}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">{o.notes || 'Dine-in items'}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-extrabold text-stone-900 whitespace-nowrap">
                            PKR {Number(o.total).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={o.status || 'received'}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border cursor-pointer focus:outline-none ${
                                statusColors[o.status] || 'bg-stone-100 text-stone-800 border-stone-300'
                              }`}
                            >
                              <option value="received">New Order (Received)</option>
                              <option value="preparing">Preparing (Cooking)</option>
                              <option value="ready">Ready (For Waiter)</option>
                              <option value="served">Served (Completed)</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-stone-400 whitespace-nowrap font-mono text-[11px]">
                            {o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
