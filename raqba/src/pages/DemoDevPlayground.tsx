import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VoiceHotlineModal } from '../components/VoiceHotlineModal';
import { simulateVoiceHotlineToN8N, simulatePortalLeadToN8N } from '../lib/n8n';
import { supabase } from '../lib/supabase';
import { PhoneCall, ArrowUpRight, Shield, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export const DemoDevPlayground: React.FC = () => {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulatePortalLead = async () => {
    setLoading(true);
    setStatusMsg('Dispatching simulated Zameen.com lead...');
    try {
      await simulatePortalLeadToN8N({
        portalName: 'Zameen.com',
        leadName: 'Nadeem Akhtar',
        leadPhone: '+92 321 9928172',
        priceMax: 95000000,
        financingType: 'Cash',
        listingSlug: '1-kanal-spanish-villa-dha-phase-6-lahore',
        city: 'Lahore',
        message: 'Calling regarding Phase 6 Spanish villa walkthrough.'
      });

      // Insert directly to Supabase
      const { data: lead } = await supabase.from('leads').insert({
        full_name: 'Nadeem Akhtar',
        email: 'nadeem@akhtar-textiles.pk',
        phone: '+92 321 9928172',
        lead_source: 'portal_lead',
        budget_max: 95000000,
        financing_type: 'Cash',
        timeline_months: 1,
        verbatim_quote: 'Calling regarding Phase 6 Spanish villa walkthrough.',
        status: 'new',
        deal_stage: 'new',
        data_consent: true
      }).select().single();

      if (lead) {
        await supabase.rpc('realtypulse_score_and_dispatch', { p_lead_id: lead.id });
      }

      setStatusMsg('✅ Zameen.com lead dispatched & scored in under 10 seconds!');
    } catch (e: any) {
      setStatusMsg('Error: ' + e.message);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-serif font-bold text-gold-400">
                Hidden Developer Playground (/demo)
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Voice Hotline & Portal Ingestion Simulator Deck
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
            DEV ONLY ROUTE
          </span>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-400 animate-spin" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-slate-100">Voice Hotline Simulator</h3>
                <p className="text-xs text-slate-400">Multi-channel voice transcript ingestion</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulates a live inbound buyer call with live speech recognition, waveform visualizer, and sub-15s broker dispatch alert.
            </p>
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110"
            >
              Launch Voice Simulator Modal
            </button>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-slate-100">Portal Webhook Ingest</h3>
                <p className="text-xs text-slate-400">Zameen.com / OLX lead payload</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Triggers the generic portal webhook, normalizes the payload, calculates the 4-vector score, and notifies the assigned broker.
            </p>
            <button
              onClick={handleSimulatePortalLead}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50"
            >
              {loading ? 'Dispatching...' : 'Dispatch Portal Lead Webhook'}
            </button>
          </div>

        </div>

      </div>

      <VoiceHotlineModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </div>
  );
};
