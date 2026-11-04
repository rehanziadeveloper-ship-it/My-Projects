import React, { useState } from 'react';
import { Property, Language, FinancingType } from '../types';
import { submitLeadToN8N } from '../lib/n8n';
import { supabase } from '../lib/supabase';
import { translations } from '../lib/i18n';
import { formatPKR } from '../lib/formatters';
import { Send, CheckCircle2, ShieldCheck, Sparkles, Building2, Phone } from 'lucide-react';

interface ContactInquiryFormProps {
  properties: Property[];
  selectedProperty?: Property | null;
  currentLang: Language;
}

export const ContactInquiryForm: React.FC<ContactInquiryFormProps> = ({
  properties,
  selectedProperty,
  currentLang
}) => {
  const t = translations[currentLang];
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Lahore');
  const [budgetMax, setBudgetMax] = useState<number>(50000000); // 5 Crore default
  const [financingType, setFinancingType] = useState<FinancingType>('Cash');
  const [propertyId, setPropertyId] = useState<string>(selectedProperty?.id || (properties[0]?.id || ''));
  const [message, setMessage] = useState('');
  const [dataConsent, setDataConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [assignedBrokerName, setAssignedBrokerName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataConsent) return;
    setLoading(true);

    try {
      const targetProp = properties.find(p => p.id === propertyId);

      // 1. Submit to n8n Webhook
      const n8nRes = await submitLeadToN8N({
        fullName,
        email: email || 'inquiry@realtypulse.pk',
        phone,
        buyerSellerType: 'Buyer',
        budgetMin: Math.round(budgetMax * 0.75),
        budgetMax,
        financingType,
        targetPropertySlug: targetProp?.slug || '1-kanal-spanish-villa-dha-phase-6-lahore',
        timelineMonths: 1,
        city,
        verbatimQuote: message || 'Inquiry submitted for private walkthrough.',
        dataConsent: true
      });

      // 2. Insert into Supabase database & execute silent 4-vector score & dispatch
      const { data: leadData } = await supabase
        .from('leads')
        .insert({
          full_name: fullName,
          email: email || 'inquiry@realtypulse.pk',
          phone,
          lead_source: 'website_form',
          buyer_seller_type: 'Buyer',
          budget_min: Math.round(budgetMax * 0.75),
          budget_max: budgetMax,
          financing_type: financingType,
          target_property_id: propertyId || null,
          timeline_months: 1,
          verbatim_quote: message || 'Direct inquiry submitted via website form.',
          status: 'new',
          deal_stage: 'new',
          budget_verified: false,
          data_consent: true
        })
        .select()
        .single();

      if (leadData?.id) {
        const { data: scoreRes } = await supabase.rpc('realtypulse_score_and_dispatch', {
          p_lead_id: leadData.id
        });
        if (scoreRes?.assigned_agent?.name) {
          setAssignedBrokerName(scoreRes.assigned_agent.name);
        }
      } else if (n8nRes?.dispatch?.broker?.name) {
        setAssignedBrokerName(n8nRes.dispatch.broker.name);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setSubmitted(true); // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#060a12]/80 border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-3xl font-serif font-bold text-slate-100">
            {t.contactTitle}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {t.contactSubtitle}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-10 border border-gold-500/30 shadow-2xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.nameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.phoneLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.emailLabel} (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tariq@gmail.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.financingLabel}
                  </label>
                  <select
                    value={financingType}
                    onChange={e => setFinancingType(e.target.value as FinancingType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value="Cash">Cash (Immediate / Habib/Meezan Bank)</option>
                    <option value="Developer Installment Plan">Developer Installment Plan</option>
                    <option value="Bank Financing">Bank Home Financing</option>
                  </select>
                </div>
              </div>

              {/* Budget Capacity in PKR */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
                  <span>{t.budgetLabel}</span>
                  <span className="text-gold-400 font-mono font-bold text-sm">
                    {formatPKR(budgetMax)}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000000"
                  max="350000000"
                  step="5000000"
                  value={budgetMax}
                  onChange={e => setBudgetMax(Number(e.target.value))}
                  className="w-full accent-gold-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>Rs 2 Crore</span>
                  <span>Rs 15 Crore</span>
                  <span>Rs 35 Crore+</span>
                </div>
              </div>

              {/* Property of Interest */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.propertyInterestLabel}
                </label>
                <select
                  value={propertyId}
                  onChange={e => setPropertyId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} — {formatPKR(p.price)} ({p.area_name || p.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Requirements Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.messageLabel}
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="e.g. Looking for a ready-to-move Spanish villa in DHA Phase 6. Need to arrange showing this weekend."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Data Consent Checkbox (Legal requirement) */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="data-consent"
                  checked={dataConsent}
                  onChange={e => setDataConsent(e.target.checked)}
                  required
                  className="mt-0.5 rounded bg-slate-900 border-slate-700 text-gold-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="data-consent" className="text-xs text-slate-400 cursor-pointer">
                  {t.consentCheckbox}
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading || !dataConsent}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-gold-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Assigning Local Territory Specialist...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.submitInquiry}</span>
                  </>
                )}
              </button>

            </form>
          ) : (
            /* Friendly Confirmation Message */
            <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-100">
                {t.inquirySuccessTitle}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                {t.inquirySuccessMsg}
              </p>
              {assignedBrokerName && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-gold-400 inline-block font-mono">
                  Assigned Partner: <b>{assignedBrokerName}</b> (Sub-15m Call Guarantee)
                </div>
              )}
              <div className="pt-4">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
