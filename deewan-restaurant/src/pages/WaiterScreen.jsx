import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Droplets, Receipt, HelpCircle, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabase';
import { sound } from '../utils/audio';
import { getRestaurantProfile, onSyncChange } from '../services/restaurantService';

export default function WaiterScreen() {
  const [profile, setProfile] = useState({
    name: 'Deewan-E-Khaas (Namak Mandi)',
    logo_url: ''
  });
  const [calls, setCalls] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [history, setHistory] = useState([]);

  // Sync Restaurant Name & Logo across all screens
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const p = await getRestaurantProfile();
        if (p) setProfile(p);
      } catch (e) {
        console.warn('Failed to load profile in waiter screen:', e);
      }
    };
    loadProfile();
    const unsub = onSyncChange(() => {
      loadProfile();
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetchActiveCalls();

    const channel = supabase
      .channel('waiter_screen_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waiter_calls' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.status === 'pending' && payload.new.call_type !== 'order') {
            sound.playWaiterBuzzer();
            if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
            setCalls((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'resolved') {
              setCalls((prev) => prev.filter((c) => c.id !== payload.new.id));
              setHistory((prev) => [payload.new, ...prev.slice(0, 9)]);
            } else {
              setCalls((prev) =>
                prev.map((c) => (c.id === payload.new.id ? payload.new : c))
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('waiter_calls')
        .select('*')
        .neq('call_type', 'order')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setCalls(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const enableAudio = () => {
    sound.init();
    sound.playWaiterBuzzer();
    setSoundEnabled(true);
  };

  const handleResolve = async (callId) => {
    // Optimistic UI
    const resolvedItem = calls.find((c) => c.id === callId);
    setCalls((prev) => prev.filter((c) => c.id !== callId));
    if (resolvedItem) {
      setHistory((prev) => [{ ...resolvedItem, status: 'resolved' }, ...prev.slice(0, 9)]);
    }

    try {
      await supabase
        .from('waiter_calls')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', callId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mobile Header - Red, Black, White */}
      <header className="flex items-center justify-between pb-4 border-b-2 border-red-600 bg-stone-950/80 -mx-4 -mt-4 px-4 pt-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 mb-6">
        <div className="flex items-center gap-3">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt="Logo"
              className="w-11 h-11 rounded-2xl object-cover border border-red-600/40 shadow-lg shrink-0"
            />
          ) : (
            <div className="p-2.5 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-600/30 animate-pulse">
              <Bell className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {profile.name || 'Deewan-E-Khaas'} <span className="text-red-500">Floor Staff</span>
            </h1>
            <p className="text-xs text-stone-400">Live Waiter Bell Alerts • Realtime</p>
          </div>
        </div>

        {!soundEnabled ? (
          <button
            onClick={enableAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition"
          >
            <Volume2 className="w-4 h-4 animate-bounce" />
            Enable Sound
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 text-red-400 rounded-xl text-xs font-semibold border border-red-600/30">
            <Volume2 className="w-4 h-4" />
            Sound Active
          </div>
        )}
      </header>

      {/* Main Calls Section */}
      <div className="mt-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-400">
            Active Table Calls ({calls.length})
          </h2>
          {calls.length > 0 && (
            <span className="text-xs font-bold text-red-500 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Urgent Attention Needed
            </span>
          )}
        </div>

        {calls.length === 0 ? (
          <div className="bg-stone-950 border border-stone-800 rounded-3xl p-8 sm:p-12 text-center my-6">
            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-white">All Tables Attended</h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-md mx-auto">
              Whenever a customer taps "Waiter Bulao", this screen will ring and vibrate instantly with the table number.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {calls.map((call) => (
              <WaiterCallCard key={call.id} call={call} onResolve={handleResolve} />
            ))}
          </div>
        )}
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <div className="mt-10 pt-6 border-t border-stone-800 max-w-4xl mx-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            Recently Attended
          </h3>
          <div className="space-y-2">
            {history.map((h, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800/80 text-xs text-stone-400"
              >
                <span>Table #{h.table_no} • {h.call_type}</span>
                <span className="text-white font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-red-500" /> Resolved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WaiterCallCard({ call, onResolve }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const createdAt = new Date(call.created_at).getTime();
    const update = () => {
      setSeconds(Math.floor((Date.now() - createdAt) / 1000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [call.created_at]);

  const getReasonMeta = (type) => {
    switch (type) {
      case 'water':
        return { label: 'Pani / Extra Cutlery', icon: Droplets, color: 'text-white' };
      case 'bill':
        return { label: 'Bill Mangwayein', icon: Receipt, color: 'text-red-400' };
      default:
        return { label: 'Bhai Table Pe Aayein', icon: HelpCircle, color: 'text-red-500' };
    }
  };

  const meta = getReasonMeta(call.call_type);
  const Icon = meta.icon;

  return (
    <div className="bg-stone-950 border-2 border-red-600 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
      <div className="flex-1">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl sm:text-3xl font-black text-white">Table #{call.table_no}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
            Buzzer Active
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Icon className={`w-5 h-5 ${meta.color}`} />
          <span className={`text-sm font-bold ${meta.color}`}>{meta.label}</span>
        </div>

        {call.notes && (
          <p className="text-xs text-stone-300 mt-2 bg-stone-900 p-2.5 rounded-xl border border-stone-800">
            "{call.notes}"
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 font-mono text-xs font-bold">
          <Clock className="w-3.5 h-3.5 text-red-500" />
          <span>{seconds}s ago</span>
        </div>

        <button
          onClick={() => onResolve(call.id)}
          className="flex-1 sm:flex-initial px-5 py-2.5 bg-white hover:bg-stone-100 active:scale-95 text-black font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4 text-red-600 stroke-[3]" />
          Mark Attended
        </button>
      </div>
    </div>
  );
}
