import React, { useState } from 'react';
import { Bell, X, Droplets, Receipt, HelpCircle, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../services/supabase';
import { triggerWaiterCall } from '../services/n8n';

export default function WaiterCallModal({ tableNo, onClose, onCallSuccess, cooldownRemaining }) {
  const [loading, setLoading] = useState(false);
  const [customTable, setCustomTable] = useState(tableNo || '');
  const [selectedReason, setSelectedReason] = useState('general');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const options = [
    {
      id: 'general',
      title: 'Bhai Table Pe Aa Jayein',
      subtitle: 'General service & assistance',
      icon: HelpCircle,
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    {
      id: 'water',
      title: 'Pani / Extra Tissues',
      subtitle: 'Drinking water, glasses, napkins',
      icon: Droplets,
      color: 'bg-stone-100 text-stone-900 border-stone-300'
    },
    {
      id: 'bill',
      title: 'Bill Mangwayein',
      subtitle: 'Bill receipt & payment collection',
      icon: Receipt,
      color: 'bg-red-50 text-red-700 border-red-300'
    }
  ];

  const handleCall = async () => {
    if (cooldownRemaining > 0) return;
    setLoading(true);
    const targetTable = customTable || tableNo || '1';
    try {
      // 1. Direct real-time insert into Supabase waiter_calls table
      await supabase.from('waiter_calls').insert([
        {
          table_no: targetTable,
          call_type: selectedReason,
          status: 'pending',
          notes: notes || 'Floor assistance requested'
        }
      ]);

      // 2. Also notify n8n webhook asynchronously if configured
      triggerWaiterCall({
        table_no: targetTable,
        call_type: selectedReason,
        notes
      }).catch((e) => console.warn('n8n waiter webhook note:', e));

      setSubmitted(true);
      if (onCallSuccess) onCallSuccess();
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (e) {
      console.error('Waiter call failed:', e);
      setSubmitted(true);
      if (onCallSuccess) onCallSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-stone-100 animate-in slide-in-from-bottom-6 duration-200 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-0 max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 bg-black text-white border-b-2 border-red-600 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 rounded-full animate-bounce shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">Bulao Waiter (Call Staff)</h3>
              <p className="text-xs text-stone-300">
                {customTable ? `Table #${customTable} • Instant Alert` : 'Dine-In • Instant Staff Alert'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-3 bg-red-100 text-red-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-stone-900">Waiter Alert Sent!</h4>
              <p className="text-sm text-stone-600 mt-1">
                Floor staff ko Table #{customTable || tableNo || '1'} par notify kar diya gaya hai. Staff foran aa raha hai.
              </p>
            </div>
          ) : (
            <>
              {cooldownRemaining > 0 ? (
                <div className="bg-stone-100 border border-stone-300 rounded-xl p-4 mb-4 flex items-center gap-3 text-stone-900">
                  <Clock className="w-5 h-5 flex-shrink-0 animate-spin text-red-600" />
                  <div className="text-xs">
                    <span className="font-bold">Wait karein:</span> Staff notify ho chuka hai. Dobara alert bhejne ke liye <b>{cooldownRemaining}s</b> baqi hain.
                  </div>
                </div>
              ) : null}

              {/* Table Number Input */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Aap kis Table par hain? (Table Number):
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1, 2, 5, 8, 12..."
                  value={customTable}
                  onChange={(e) => setCustomTable(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-base sm:text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-600 bg-stone-50 font-bold text-stone-900"
                  disabled={cooldownRemaining > 0}
                />
              </div>

              <p className="text-sm font-semibold text-stone-700 mb-2.5">Kis cheez ki zaroorat hai?</p>

              <div className="space-y-2.5 mb-4">
                {options.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedReason === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedReason(opt.id)}
                      disabled={cooldownRemaining > 0}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition ${
                        isSelected
                          ? `${opt.color} ring-2 ring-red-600 font-semibold shadow-sm`
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      } ${cooldownRemaining > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-white shadow-xs' : 'bg-stone-200'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold">{opt.title}</div>
                        <div className="text-xs text-stone-500">{opt.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mb-5">
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Koi khas baat? (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2 extra spoons, normal pani..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-600 bg-stone-50"
                  disabled={cooldownRemaining > 0}
                />
              </div>

              <button
                onClick={handleCall}
                disabled={loading || cooldownRemaining > 0}
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 active:scale-98 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <Bell className="w-5 h-5" />
                {loading ? 'Alert Bhaij Rahe Hain...' : '🛎️ Waiter Ko Bulao'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
