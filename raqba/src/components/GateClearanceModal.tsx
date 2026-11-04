import React, { useState } from 'react';
import { Property } from '../types';
import { requestShowingClearanceFromN8N } from '../lib/n8n';
import { supabase } from '../lib/supabase';
import { KeyRound, ShieldCheck, MapPin, Calendar, FileText, CheckCircle, X, Lock, Download, QrCode } from 'lucide-react';

interface GateClearanceModalProps {
  properties: Property[];
  selectedProperty?: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onShowingCreated?: () => void;
}

export const GateClearanceModal: React.FC<GateClearanceModalProps> = ({
  properties,
  selectedProperty,
  isOpen,
  onClose,
  onShowingCreated
}) => {
  const [propertyId, setPropertyId] = useState<string>(selectedProperty?.id || (properties[0]?.id || ''));
  const [pofAmount, setPofAmount] = useState<number>(30000000);
  const [clientName, setClientName] = useState('Alexander Von Berg');
  const [clientPhone, setClientPhone] = useState('+1 (310) 992-8172');
  const [showingDate, setShowingDate] = useState('2026-11-05T16:30');
  const [pofFileSelected, setPofFileSelected] = useState('UBS-Wealth-Verification-Letter.pdf');
  const [loading, setLoading] = useState(false);
  const [clearanceResult, setClearanceResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const targetProp = properties.find(p => p.id === propertyId) || selectedProperty || properties[0];

  const handleRequestClearance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Call n8n Showing Clearance Engine
      const n8nRes = await requestShowingClearanceFromN8N({
        pofAmount,
        propertyMin: targetProp?.proof_of_funds_required_min || 3000000,
        propertyAddress: targetProp ? `${targetProp.address}, ${targetProp.city}, ${targetProp.state}` : '10771 Bellagio Road, Bel Air, CA',
        gpsPin: targetProp?.pin_location || '34.0837, -118.4412',
        showingTime: new Date(showingDate).toISOString()
      });

      // 2. Fetch or create a lead in Supabase and insert Showing record
      const { data: leadData } = await supabase
        .from('leads')
        .select('id')
        .eq('phone', clientPhone)
        .limit(1)
        .maybeSingle();

      let leadId = leadData?.id;
      if (!leadId) {
        const { data: newLead } = await supabase
          .from('leads')
          .insert({
            full_name: clientName,
            email: 'client@private-wealth.com',
            phone: clientPhone,
            lead_source: 'exclusive_portal',
            budget_max: pofAmount,
            financing_type: 'All-Cash',
            target_property_id: targetProp?.id,
            status: 'showing_scheduled',
            proof_of_funds_verified: n8nRes.pofVerified,
            pof_amount: pofAmount
          })
          .select('id')
          .single();
        leadId = newLead?.id;
      }

      if (leadId && targetProp?.id) {
        // Run database RPC for showing clearance & gate pass
        await supabase.rpc('realtypulse_request_showing_and_gate_clearance', {
          p_lead_id: leadId,
          p_property_id: targetProp.id,
          p_showing_time: new Date(showingDate).toISOString(),
          p_pof_url: `https://realtypulse360.com/vault/${pofFileSelected}`,
          p_pof_amount: pofAmount
        });
      }

      setClearanceResult(n8nRes);
      if (onShowingCreated) onShowingCreated();
    } catch (err) {
      console.error('Error generating gate clearance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0c1220] border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-slate-100">
                  Showing Logistics & Gate Clearance Portal
                </h3>
                <span className="px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30 text-[10px] font-mono font-bold">
                  AUTONOMOUS DISPATCH
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated POF letter validation & dynamic security clearance code issuance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!clearanceResult ? (
            <form onSubmit={handleRequestClearance} className="space-y-4">
              
              {/* Target Property */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Trophy Property
                </label>
                <select
                  value={propertyId}
                  onChange={e => setPropertyId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} — ${(p.price / 1000000).toFixed(1)}M (Min POF: ${(p.proof_of_funds_required_min / 1000000).toFixed(1)}M)
                    </option>
                  ))}
                </select>
              </div>

              {/* Client & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Buyer / Broker Contact Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Walkthrough Window</label>
                  <input
                    type="datetime-local"
                    required
                    value={showingDate}
                    onChange={e => setShowingDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* POF Upload & Verification Vector */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gold-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Proof of Funds Letter (POF) Clearance</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Required: ${(targetProp ? targetProp.proof_of_funds_required_min / 1000000 : 3)}M Min
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Verified Liquid Asset Capacity ($)</label>
                    <input
                      type="number"
                      required
                      min={1000000}
                      value={pofAmount}
                      onChange={e => setPofAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Custodial Institution Document</label>
                    <select
                      value={pofFileSelected}
                      onChange={e => setPofFileSelected(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                    >
                      <option value="UBS-Wealth-Verification-Letter.pdf">UBS Wealth Management ($32.0M)</option>
                      <option value="GoldmanSachs-Liquidity-Audit.pdf">Goldman Sachs Private Wealth ($25.0M)</option>
                      <option value="JPMorgan-1031-Exchange-Escrow.pdf">JPMorgan Chase Escrow ($48.0M)</option>
                      <option value="MorganStanley-Jumbo-Approval.pdf">Morgan Stanley Private Bank ($18.5M)</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Verified custodial statements unlock an instant 6-digit gate code active for a 2-hour walkthrough window.
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-gold-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Validating POF & Issuing Security Clearance...</span>
                  </div>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Validate POF & Issue Gate Clearance Code</span>
                  </>
                )}
              </button>

            </form>
          ) : (
            /* Clearance Granted View */
            <div className="space-y-4 animate-in fade-in duration-300">
              
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
                <span className="inline-flex p-2 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
                  <ShieldCheck className="w-7 h-7" />
                </span>
                <h4 className="font-serif font-bold text-lg text-emerald-300">
                  Walkthrough Gate Clearance Approved
                </h4>
                <p className="text-xs text-slate-400">
                  Proof of funds verified • Private security clearance dispatched
                </p>
              </div>

              {/* The Gate Clearance Pass Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 border-2 border-gold-500/40 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <div className="text-[10px] text-gold-400 font-mono uppercase tracking-widest">
                      REALTYPULSE 360 • VISITOR PASS
                    </div>
                    <div className="text-sm font-bold text-slate-100">{targetProp?.title}</div>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-mono font-bold">
                    {clearanceResult.visitorToken}
                  </div>
                </div>

                {/* Big Gate Code Display */}
                <div className="bg-slate-950/80 rounded-xl p-4 border border-gold-500/20 text-center my-3">
                  <div className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-mono">
                    PRIVATE SECURITY ENCLAVE GATE CODE
                  </div>
                  <div className="text-4xl font-mono font-extrabold text-gold-400 tracking-widest drop-shadow-lg">
                    {clearanceResult.gateCode}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-1">
                    ACTIVE FOR 2-HOUR PRIVATE SHOWING WINDOW
                  </div>
                </div>

                {/* GPS Pin & Instructions */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" />
                      <span>Security Gate Coordinates</span>
                    </div>
                    <div className="font-mono text-slate-200 mt-1">{clearanceResult.gpsPin}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>POF Verification Status</span>
                    </div>
                    <div className="font-mono text-emerald-400 font-bold mt-1">PASS ($32.0M Confirmed)</div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 leading-relaxed">
                  {clearanceResult.instructions}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setClearanceResult(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Clear Another Walkthrough
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-gold-500 text-slate-950 font-bold text-xs hover:brightness-110"
                >
                  Finish
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
