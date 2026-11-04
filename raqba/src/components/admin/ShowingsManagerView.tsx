import React, { useState } from 'react';
import { Showing, Agent } from '../../types';
import { supabase } from '../../lib/supabase';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  Key, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface ShowingsManagerViewProps {
  showings: Showing[];
  agents: Agent[];
  currentAgentId?: string;
  onRefresh: () => void;
}

export const ShowingsManagerView: React.FC<ShowingsManagerViewProps> = ({
  showings,
  agents,
  currentAgentId,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleConfirmShowing = async (showing: Showing) => {
    setConfirmingId(showing.id);
    try {
      const agentId = currentAgentId || showing.agent_id || agents[0]?.id || 'a1111111-1111-1111-1111-111111111111';

      await supabase.rpc('realtypulse_confirm_showing', {
        p_showing_id: showing.id,
        p_agent_id: agentId,
        p_notes: 'Walkthrough confirmed by assigned broker. Location pin and security pass dispatched.'
      });

      onRefresh();
    } catch (err) {
      console.error('Error confirming showing:', err);
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredShowings = showings.filter(s => {
    if (filter === 'pending') return !s.broker_confirmed;
    if (filter === 'confirmed') return s.broker_confirmed;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-xl text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Showing Logistics & Gate Clearance
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Private walkthroughs are verified by licensed brokers before location pin and gated society entry passes are issued.
          </p>
        </div>

        <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs self-start sm:self-auto">
          {(['all', 'pending', 'confirmed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-gold-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all' ? `All (${showings.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Showings List */}
      <div className="space-y-4">
        {filteredShowings.map((showing) => {
          const isPending = !showing.broker_confirmed;
          const property = showing.property;
          const lead = showing.lead;

          // WhatsApp confirmation link
          const waMessage = encodeURIComponent(
            `Assalam-o-Alaikum ${lead?.full_name || 'Client'},\n\nYour private walkthrough for "${property?.title || 'Property'}" is CONFIRMED for ${new Date(showing.showing_time).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}.\n\n` +
            `📍 Location: ${showing.google_maps_pin || property?.google_maps_url || property?.address}\n` +
            (showing.gate_pin_code ? `🔑 Security Gate Pass: ${showing.gate_pin_code}\n\n` : '\n') +
            `Our licensed specialist will meet you at the property. Let us know if you need to adjust timing.\n- RealtyPulse 360`
          );
          const cleanPhone = (lead?.phone || '').replace(/[^0-9]/g, '');
          const waLink = `https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '')}?text=${waMessage}`;

          return (
            <div
              key={showing.id}
              className={`p-5 rounded-2xl bg-[#0d1424] border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                isPending ? 'border-amber-500/40' : 'border-slate-800 hover:border-gold-500/40'
              }`}
            >
              {/* Left Info */}
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif font-bold text-base text-slate-100">
                    {property?.title || 'Luxury Property'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                    showing.broker_confirmed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {showing.broker_confirmed ? 'Confirmed by Broker' : 'Pending Broker Review'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold-400" />
                    <span>{new Date(showing.showing_time).toLocaleString('en-PK', { dateStyle: 'full', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{property?.area_name}, {property?.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                  <span>Buyer: <strong>{lead?.full_name || 'Anonymous Buyer'}</strong></span>
                  <span>•</span>
                  <span>Phone: <strong>{lead?.phone || 'N/A'}</strong></span>
                </div>

                {/* Logistics details if confirmed */}
                {showing.broker_confirmed && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Logistics Dispatched to Client</span>
                    </div>
                    {showing.gate_pin_code && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Key className="w-3.5 h-3.5 text-gold-400" />
                        <span>Society Gate Clearance Code: <strong className="font-mono text-gold-300 text-sm">{showing.gate_pin_code}</strong></span>
                      </div>
                    )}
                    {showing.google_maps_pin && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <a
                          href={showing.google_maps_pin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          Google Maps Pin Location <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-2 shrink-0">
                {isPending ? (
                  <button
                    onClick={() => handleConfirmShowing(showing)}
                    disabled={confirmingId === showing.id}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {confirmingId === showing.id ? 'Confirming...' : 'Confirm Walkthrough'}
                  </button>
                ) : (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Send WhatsApp Pass
                  </a>
                )}

                <a
                  href={`tel:${lead?.phone}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Buyer
                </a>
              </div>
            </div>
          );
        })}

        {filteredShowings.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#0d1424] border border-slate-800 text-slate-400 text-xs">
            No showings match the selected filter.
          </div>
        )}
      </div>

    </div>
  );
};
