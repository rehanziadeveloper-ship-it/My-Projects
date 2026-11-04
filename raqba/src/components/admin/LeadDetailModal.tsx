import React, { useState, useEffect } from 'react';
import { Lead, ChatMessage } from '../../types';
import { supabase } from '../../lib/supabase';
import { formatPKR, formatArea } from '../../lib/formatters';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Bot
} from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    if (lead && isOpen) {
      loadChatTranscript();
    }
  }, [lead, isOpen]);

  const loadChatTranscript = async () => {
    if (!lead) return;
    setLoadingChat(true);
    try {
      // Find chat session by lead_id or reference_id
      let query = supabase.from('chat_sessions').select('id');
      if (lead.reference_id) {
        query = query.eq('reference_id', lead.reference_id);
      } else {
        query = query.eq('lead_id', lead.id);
      }

      const { data: session } = await query.limit(1).single();

      if (session?.id) {
        const { data: chatMsgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true });

        if (chatMsgs) setMessages(chatMsgs as ChatMessage[]);
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.warn('Could not fetch chat transcript:', e);
    } finally {
      setLoadingChat(false);
    }
  };

  if (!isOpen || !lead) return null;

  const isHandoff = lead.status === 'handoff' || lead.verbatim_quote?.includes('Human Handoff');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-[#0c1220] border border-gold-500/30 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-slate-100">{lead.full_name}</h3>
                {lead.reference_id && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-gold-400 border border-gold-500/30">
                    {lead.reference_id}
                  </span>
                )}
                {lead.temperature && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                    lead.temperature === 'Hot'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : lead.temperature === 'Warm'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-700/40 text-slate-300'
                  }`}>
                    {lead.temperature}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Source: <span className="text-slate-300 capitalize">{lead.lead_source.replace('_', ' ')}</span> • Registered: {new Date(lead.created_at).toLocaleString('en-PK')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Handoff Requested Alert Banner */}
        {isHandoff && (
          <div className="bg-rose-950/60 border-b border-rose-500/40 px-6 py-2.5 flex items-center gap-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Immediate Attention Required:</strong> Client requested direct broker contact or human escalation.
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Declared Budget</span>
              <span className="text-base font-serif font-bold text-gold-400">
                {formatPKR(lead.budget_max)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Mode: {lead.financing_type}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Intent & Target</span>
              <span className="text-sm font-semibold text-slate-200">
                {lead.intent || lead.buyer_seller_type} ({lead.property_type || 'Property'})
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Location: {lead.area_name || 'DHA'}, {lead.city || 'Lahore'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Contact Details</span>
              <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-emerald-400 hover:underline block">
                {lead.phone}
              </a>
              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{lead.email}</span>
            </div>
          </div>

          {/* 3-Bullet Broker Dossier */}
          {lead.summary_dossier && (
            <div className="p-4 rounded-xl bg-slate-950 border border-gold-500/20 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-gold-400 block">
                3-Bullet Intelligence Dossier
              </span>
              <div className="space-y-1.5 text-slate-300">
                <p className="text-gold-300/90">• {lead.summary_dossier.bullet_1_liquidity}</p>
                <p className="text-slate-300">• {lead.summary_dossier.bullet_2_intent}</p>
                <p className="text-slate-400 italic">• {lead.summary_dossier.bullet_3_action}</p>
              </div>
            </div>
          )}

          {/* Chatbot Transcript Section */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-gold-400" />
              <span>Full Chat Conversation Transcript</span>
            </span>

            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5 max-h-60 overflow-y-auto">
              {loadingChat ? (
                <div className="text-center py-6 text-slate-400">Loading conversation history...</div>
              ) : messages.length > 0 ? (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === 'customer' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                        m.role === 'customer'
                          ? 'bg-gold-500 text-slate-950 font-medium'
                          : 'bg-slate-900 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {m.language?.toUpperCase() || 'EN'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 italic">
                  Inquiry logged through direct form intake. Verbatim: "{lead.verbatim_quote || 'N/A'}"
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-gold-400" />
              <span>Call Client</span>
            </a>
            <a
              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
