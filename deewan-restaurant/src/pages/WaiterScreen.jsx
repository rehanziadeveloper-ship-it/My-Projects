import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Droplets, Receipt, HelpCircle, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabase';
import { sound } from '../utils/audio';

export default function WaiterScreen() {
  const [calls, setCalls] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [history, setHistory] = useState([]);

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
    <div className="min-h-screen bg-stone-950 text-white p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mobile Header */}
      <header className="flex items-center justify-between pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600 rounded-2xl text-white shadow-lg animate-pulse">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Deewan Floor Staff</h1>
            <p className="text-xs text-stone-400">Live Waiter Bell Alerts</p>
          </div>
        </div>

        {!soundEnabled ? (
          <button
            onClick={enableAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-stone-900 font-bold text-xs rounded-xl shadow active:scale-95 transition"
          >
            <Volume2 className="w-4 h-4" />
            Enable Sound
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold">
            <Volume2 className="w-4 h-4" />
            Active
          </div>
        )}
      </header>

      {/* Main Calls Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">
            Active Table Calls ({calls.length})
          </h2>
          {calls.length > 0 && (
            <span className="text-xs font-bold text-red-400 animate-pulse">
              ● Urgent Attention Needed
            </span>
          )}
        </div>

        {calls.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center my-6">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-lg text-white">All Tables Attended</h3>
            <p className="text-xs text-stone-400 mt-1">
              Whenever a customer taps "Waiter Bulao", your phone will ring and vibrate instantly.
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
        <div className="mt-10 pt-6 border-t border-stone-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            Recently Attended
          </h3>
          <div className="space-y-2">
            {history.map((h, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 text-xs text-stone-400"
              >
                <span>Table #{h.table_no} • {h.call_type}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Resolved
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
        return { label: 'Pani / Extra Cutlery', icon: Droplets, color: 'text-blue-400' };
      case 'bill':
        return { label: 'Bill Mangwayein', icon: Receipt, color: 'text-emerald-400' };
      default:
        return { label: 'Bhai Table Pe Aayein', icon: HelpCircle, color: 'text-orange-400' };
    }
  };

  const meta = getReasonMeta(call.call_type);
  const Icon = meta.icon;

  return (
    <div className="bg-stone-900 border-2 border-red-500 rounded-3xl p-5 shadow-2xl flex flex-col justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-3xl font-black text-white">Table {call.table_no}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
              Calling
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Icon className={`w-5 h-5 ${meta.color}`} />
            <span className={`text-sm font-bold ${meta.color}`}>{meta.label}</span>
          </div>

          {call.notes && (
            <p className="text-xs text-stone-300 mt-2 bg-stone-800/80 p-2.5 rounded-xl border border-stone-700">
              "{call.notes}"
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-800 text-stone-300 font-mono text-xs font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>{seconds}s ago</span>
        </div>
      </div>

      <button
        onClick={() => onResolve(call.id)}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
      >
        <Check className="w-5 h-5 stroke-[3]" />
        Pohanch Gaya / Attended
      </button>
    </div>
  );
}
