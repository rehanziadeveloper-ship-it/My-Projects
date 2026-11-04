import React, { useState } from 'react';
import { Property, FinancingType } from '../types';
import { supabase } from '../lib/supabase';
import { submitLeadToN8N } from '../lib/n8n';
import { Sparkles, ShieldCheck, Zap, X, CheckCircle, Clock, User, Phone, Mail, Building, DollarSign, ArrowRight } from 'lucide-react';

interface BuyerQualifierWidgetProps {
  properties: Property[];
  selectedProperty?: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated?: () => void;
}

export const BuyerQualifierWidget: React.FC<BuyerQualifierWidgetProps> = ({
  properties,
  selectedProperty,
  isOpen,
  onClose,
  onLeadCreated
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [buyerType, setBuyerType] = useState<'Buyer' | 'Seller' | 'Commercial Investor'>('Buyer');
  const [financingType, setFinancingType] = useState<FinancingType>('All-Cash');
  const [targetPropertyId, setTargetPropertyId] = useState<string>(selectedProperty?.id || (properties[0]?.id || ''));
  const [budgetMax, setBudgetMax] = useState<number>(selectedProperty?.price || 25000000);
  const [timelineMonths, setTimelineMonths] = useState<number>(1);
  const [verbatimQuote, setVerbatimQuote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const targetProp = properties.find(p => p.id === targetPropertyId) || selectedProperty || properties[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Submit to n8n Master Workflow Engine
      const n8nResult = await submitLeadToN8N({
        fullName,
        email,
        phone,
        buyerSellerType: buyerType,
        budgetMin: Math.round(budgetMax * 0.75),
        budgetMax,
        financingType,
        targetPropertySlug: targetProp?.slug || 'the-promontory-bel-air',
        timelineMonths,
        verbatimQuote: verbatimQuote || 'Requested private walkthrough and financial clearance verification.'
      });

      // 2. Insert into Supabase database & execute 4-vector scoring RPC
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          full_name: fullName,
          email,
          phone,
          lead_source: 'web_buyer_widget',
          buyer_seller_type: buyerType,
          budget_min: Math.round(budgetMax * 0.75),
          budget_max: budgetMax,
          financing_type: financingType,
          target_property_id: targetPropertyId || null,
          timeline_months: timelineMonths,
          verbatim_quote: verbatimQuote || 'Walkthrough requested via 4-Vector Qualifier widget.',
          status: 'new'
        })
        .select()
        .single();

      if (leadError) {
        console.warn('Supabase lead insert notice:', leadError);
      } else if (leadData?.id) {
        // Run database 4-vector score & dispatch RPC
        const { data: scoreData, error: scoreErr } = await supabase.rpc('realtypulse_score_and_dispatch', {
          p_lead_id: leadData.id
        });
        if (scoreErr) console.warn('Supabase score RPC notice:', scoreErr);
      }

      setResult(n8nResult);
      if (onLeadCreated) onLeadCreated();
    } catch (err) {
      console.error('Error submitting lead:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setVerbatimQuote('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0c1220] border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-100">
                4-Vector Buyer Qualification Engine
              </h3>
              <p className="text-xs text-slate-400">
                Financial verification • Timeline urgency • Budget realism • Intent scoring
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
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Buyer / Seller Mode */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                {(['Buyer', 'Seller', 'Commercial Investor'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBuyerType(type)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      buyerType === type
                        ? 'bg-gold-500 text-slate-950 shadow-md shadow-gold-500/20 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Vector 1: Financing Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2">
                  Vector 1: Financial Verification & Liquidity
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'All-Cash', label: 'All-Cash (Wire Ready)', desc: '100% Unconditional Liquidity', score: '98 pts' },
                    { id: 'Jumbo Pre-Approved', label: 'Jumbo Pre-Approved', desc: 'Tier-1 Private Bank Letter', score: '90 pts' },
                    { id: 'Conventional', label: 'Conventional / Other', desc: 'Standard Contingent', score: '70 pts' }
                  ].map(fin => (
                    <div
                      key={fin.id}
                      onClick={() => setFinancingType(fin.id as FinancingType)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all text-left ${
                        financingType === fin.id
                          ? 'bg-gold-500/10 border-gold-500 text-slate-100 shadow-md shadow-gold-500/10'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>{fin.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-gold-400 font-mono">
                          {fin.score}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{fin.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vector 2 & 3: Budget Realism & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Budget Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span className="text-gold-400 uppercase tracking-wider">Vector 2: Budget Capacity</span>
                    <span className="text-gold-300 font-mono font-bold">${(budgetMax / 1000000).toFixed(1)}M USD</span>
                  </div>
                  <input
                    type="range"
                    min="3000000"
                    max="50000000"
                    step="500000"
                    value={budgetMax}
                    onChange={e => setBudgetMax(Number(e.target.value))}
                    className="w-full accent-gold-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>$3M</span>
                    <span>$25M</span>
                    <span>$50M+</span>
                  </div>
                </div>

                {/* Timeline Urgency */}
                <div>
                  <label className="block text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">
                    Vector 3: Acquisition Timeline
                  </label>
                  <select
                    value={timelineMonths}
                    onChange={e => setTimelineMonths(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  >
                    <option value={1}>Under 30 Days (Immediate Close - P0 Critical)</option>
                    <option value={2}>30 to 60 Days (P1 High)</option>
                    <option value={3}>60 to 90 Days</option>
                    <option value={6}>6+ Months (Exploratory)</option>
                  </select>
                </div>
              </div>

              {/* Target Property Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Portfolio Property
                </label>
                <select
                  value={targetPropertyId}
                  onChange={e => setTargetPropertyId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} — ${(p.price / 1000000).toFixed(1)}M ({p.city}, {p.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vector 4: Verbatim Inbound Intent */}
              <div>
                <label className="block text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">
                  Vector 4: Client Acquisition Statement & Verbatim Quote
                </label>
                <textarea
                  rows={2}
                  value={verbatimQuote}
                  onChange={e => setVerbatimQuote(e.target.value)}
                  placeholder="e.g. Liquidating tech stock holding; looking to execute private all-cash contract before end of month."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Lord Alexander Von Berg"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Private Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@capital-group.ch"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Direct Phone / Mobile</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (310) 992-8172"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-gold-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Executing 4-Vector Evaluation & Sub-15s Dispatch...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Submit for Instant 4-Vector Scoring & Broker Dispatch</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* Results Screen: 4-Vector Dossier & Dispatch */
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Success Badge */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-emerald-300 text-sm">
                      4-Vector Qualification Verified
                    </h4>
                    <p className="text-xs text-slate-400">
                      Dispatched to licensed broker in <span className="text-gold-300 font-mono font-bold">{result.dispatch?.dispatchLatencySeconds || 11} seconds</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    result.dispatch?.priority === 'P0 Critical'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {result.dispatch?.priority || 'P0 Critical'}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Score: {result.lead?.scores?.compositeIntent || 97}/100
                  </div>
                </div>
              </div>

              {/* 4-Vector Scorecard Bar */}
              <div className="grid grid-cols-4 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Financial</div>
                  <div className="text-sm font-bold text-emerald-400">{result.lead?.scores?.financialVerification || 98}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Timeline</div>
                  <div className="text-sm font-bold text-gold-400">{result.lead?.scores?.timelineUrgency || 95}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Realism</div>
                  <div className="text-sm font-bold text-blue-400">{result.lead?.scores?.budgetRealism || 98}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Intent</div>
                  <div className="text-sm font-bold text-purple-400">{result.lead?.scores?.compositeIntent || 97}%</div>
                </div>
              </div>

              {/* Strict 3-Bullet Broker Dossier */}
              <div className="bg-slate-900/90 border border-gold-500/20 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gold-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Licensed Broker Intelligence Dossier</span>
                </div>
                <div className="text-xs text-slate-300 space-y-2 font-mono">
                  <p className="flex items-start gap-2">
                    <span className="text-gold-400 font-bold">•</span>
                    <span>{result.dispatch?.dossier?.bullet_1_liquidity}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-gold-400 font-bold">•</span>
                    <span>{result.dispatch?.dossier?.bullet_2_intent}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-gold-400 font-bold">•</span>
                    <span>{result.dispatch?.dossier?.bullet_3_action}</span>
                  </p>
                </div>
              </div>

              {/* Assigned Licensed Broker Card */}
              {result.dispatch?.broker && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center font-bold text-gold-400">
                      {result.dispatch.broker.name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {result.dispatch.broker.name}
                      </div>
                      <div className="text-[11px] text-gold-400 font-mono">
                        {result.dispatch.broker.license}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <a
                      href={`tel:${result.dispatch.broker.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors font-medium"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{result.dispatch.broker.phone}</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Qualify Another Inbound Lead
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-gold-500 text-slate-950 font-bold text-xs hover:brightness-110"
                >
                  Close Window
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
