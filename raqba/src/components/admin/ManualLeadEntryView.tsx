import React, { useState } from 'react';
import { Property, Lead, FinancingType } from '../../types';
import { supabase } from '../../lib/supabase';
import { formatPKR } from '../../lib/formatters';
import { 
  UserPlus, 
  CheckCircle2, 
  Phone, 
  Mail, 
  DollarSign, 
  Clock, 
  Building2, 
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface ManualLeadEntryViewProps {
  properties: Property[];
  onLeadCreated: (lead: Lead) => void;
}

export const ManualLeadEntryView: React.FC<ManualLeadEntryViewProps> = ({
  properties,
  onLeadCreated,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+92 300 ');
  const [email, setEmail] = useState('');
  const [leadSource, setLeadSource] = useState<'walk_in' | 'portal_lead' | 'website_form' | 'social_ad' | 'voice_hotline'>('walk_in');
  const [clientType, setClientType] = useState<'Buyer' | 'Seller' | 'Commercial Investor'>('Buyer');
  const [budgetMax, setBudgetMax] = useState<number>(45000000);
  const [financingType, setFinancingType] = useState<FinancingType>('Cash');
  const [timelineMonths, setTimelineMonths] = useState<number>(1);
  const [targetPropertyId, setTargetPropertyId] = useState<string>('');
  const [city, setCity] = useState('Lahore');
  const [areaPreference, setAreaPreference] = useState('DHA');
  const [verbatimQuote, setVerbatimQuote] = useState('');
  const [dataConsent, setDataConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataConsent) {
      alert('Data consent is mandatory to store and process client inquiry records.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Insert into Supabase
      const { data: newLead, error } = await supabase.from('leads').insert({
        full_name: fullName,
        phone,
        email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@client.pk`,
        lead_source: leadSource,
        buyer_seller_type: clientType,
        budget_max: Number(budgetMax),
        financing_type: financingType,
        timeline_months: Number(timelineMonths),
        target_property_id: targetPropertyId || null,
        verbatim_quote: verbatimQuote || `Manual intake from ${leadSource}. Interested in ${city} ${areaPreference}.`,
        data_consent: true,
        status: 'new',
        deal_stage: 'new',
        deal_payment_status: 'None'
      }).select().single();

      if (error) throw error;

      // 2. Run silent backend 4-vector scoring & round-robin dispatch RPC
      if (newLead?.id) {
        await supabase.rpc('realtypulse_score_and_dispatch', { p_lead_id: newLead.id });
      }

      setSuccessMessage(`Lead logged & round-robin dispatched to specialist broker!`);
      
      // Reset form
      setFullName('');
      setPhone('+92 300 ');
      setEmail('');
      setVerbatimQuote('');

      if (newLead) {
        onLeadCreated(newLead as Lead);
      }
    } catch (err) {
      console.error('Error creating manual lead:', err);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      
      <div>
        <h3 className="font-serif font-bold text-xl text-slate-100 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-gold-400" />
          Direct Lead Intake (Walk-in / Phone / Portals)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Log client interactions from Zameen.com, OLX, WhatsApp hotlines, or office walk-ins. 4-Vector intent scoring and round-robin broker assignment will execute silently in the background.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-5">
        
        {/* Source and Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Lead Source</label>
            <select
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value="walk_in">Office Walk-In / Front Desk</option>
              <option value="portal_lead">Zameen.com / OLX Portal</option>
              <option value="voice_hotline">Direct Phone Hotline</option>
              <option value="social_ad">Facebook / Instagram Ads</option>
              <option value="website_form">Website Direct</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Inquirer Type</label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value="Buyer">End-User Buyer</option>
              <option value="Commercial Investor">Commercial Investor</option>
              <option value="Seller">Property Seller / Owner</option>
            </select>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Mian Bilal Hassan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">WhatsApp / Phone</label>
            <input
              type="text"
              required
              placeholder="+92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email (Optional)</label>
            <input
              type="email"
              placeholder="client@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {/* Budget & Financing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Declared Budget (PKR)
            </label>
            <input
              type="number"
              required
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500 font-mono"
            />
            <span className="text-[10px] text-gold-400 mt-0.5 block">
              Displays: {formatPKR(budgetMax)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Financing Mode</label>
            <select
              value={financingType}
              onChange={(e) => setFinancingType(e.target.value as FinancingType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value="Cash">All Cash / Ready Wire</option>
              <option value="Developer Installment Plan">Developer Installment Plan</option>
              <option value="Bank Financing">Commercial / Islamic Home Loan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Purchase Timeline</label>
            <select
              value={timelineMonths}
              onChange={(e) => setTimelineMonths(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value={1}>Immediate (Within 30 Days)</option>
              <option value={3}>1 to 3 Months</option>
              <option value={6}>3 to 6 Months</option>
            </select>
          </div>
        </div>

        {/* Target Property / Area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value="Lahore">Lahore</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Karachi">Karachi</option>
              <option value="Rawalpindi">Rawalpindi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Preferred Society / Sector</label>
            <input
              type="text"
              placeholder="e.g. DHA Phase 6, Bahria Town, E-7"
              value={areaPreference}
              onChange={(e) => setAreaPreference(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Target Property (Optional)</label>
            <select
              value={targetPropertyId}
              onChange={(e) => setTargetPropertyId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500 truncate"
            >
              <option value="">-- General Search / No Specific Listing --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({formatPKR(p.price)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verbatim Quote */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Buyer Requirements & Verbatim Notes
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Seeking 1 Kanal corner plot or ready house with basement in DHA Phase 6. Cash buyer ready to transfer token."
            value={verbatimQuote}
            onChange={(e) => setVerbatimQuote(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* Data Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={dataConsent}
              onChange={(e) => setDataConsent(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-gold-500 focus:ring-0"
            />
            <span className="text-xs text-slate-300">
              Client has given consent to store contact details and property inquiry records for brokerage representation.
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? 'Scoring & Dispatching...' : 'Save & Dispatch to Broker'}
          </button>
        </div>

      </form>

    </div>
  );
};
