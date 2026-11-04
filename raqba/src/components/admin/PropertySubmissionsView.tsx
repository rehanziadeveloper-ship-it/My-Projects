import React, { useState, useEffect } from 'react';
import { PropertySubmission, Agent } from '../../types';
import { supabase } from '../../lib/supabase';
import { formatPKR, formatArea } from '../../lib/formatters';
import { 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  FileText, 
  Building2,
  AlertCircle
} from 'lucide-react';

interface PropertySubmissionsViewProps {
  agents: Agent[];
  currentAgentId?: string;
  onRefreshProperties?: () => void;
}

export const PropertySubmissionsView: React.FC<PropertySubmissionsViewProps> = ({
  agents,
  currentAgentId,
  onRefreshProperties,
}) => {
  const [submissions, setSubmissions] = useState<PropertySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('property_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setSubmissions(data as PropertySubmission[]);
    } catch (e) {
      console.warn('Error fetching property submissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (sub: PropertySubmission) => {
    setProcessingId(sub.id);
    try {
      const slug = sub.address.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const agentId = currentAgentId || agents[0]?.id || null;

      // 1. Insert into properties catalog
      await supabase.from('properties').insert({
        title: `${sub.area_value} ${sub.area_unit} ${sub.property_type}`,
        slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
        property_category: sub.property_type === 'House' ? 'House' : (sub.property_type === 'Apartment' ? 'Apartment' : 'Plot'),
        property_type: `${sub.area_value} ${sub.area_unit} ${sub.property_type}`,
        city: sub.city,
        area_name: sub.address.split(',')[0] || 'DHA',
        address: sub.address,
        price: sub.asking_price,
        area_size: sub.area_value,
        area_unit: sub.area_unit as any,
        sqft: sub.area_unit === 'Kanal' ? sub.area_value * 4500 : sub.area_value * 225,
        beds: sub.bedrooms || 4,
        baths: sub.bathrooms || 5,
        gated_community: true,
        images: sub.photo_urls && sub.photo_urls.length > 0 ? sub.photo_urls : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
        description: `Direct owner listing for ${sub.intent}. Ownership verified: ${sub.ownership_status || 'Clear Title'}.`,
        status: 'active',
        listing_agent_id: agentId
      });

      // 2. Mark submission as approved
      await supabase.from('property_submissions').update({
        status: 'approved',
        reviewed_by: agentId,
        reviewed_at: new Date().toISOString()
      }).eq('id', sub.id);

      fetchSubmissions();
      if (onRefreshProperties) onRefreshProperties();
    } catch (err) {
      console.error('Error approving property submission:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (subId: string) => {
    const reason = prompt('Please enter the reason for rejection (e.g. Incomplete title documents, unrealistic valuation):');
    if (!reason) return;

    try {
      await supabase.from('property_submissions').update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString()
      }).eq('id', subId);

      fetchSubmissions();
    } catch (err) {
      console.error('Error rejecting submission:', err);
    }
  };

  const filtered = submissions.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-xl text-slate-100 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-gold-400" />
            <span>Owner Property Submissions</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Properties submitted by sellers and landlords via the Raqba chatbot. Review title documents, approve to publish as live listings, or reject with feedback.
          </p>
        </div>

        <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs self-start sm:self-auto">
          {(['all', 'pending_review', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-gold-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Cards */}
      <div className="space-y-4">
        {filtered.map((sub) => {
          const isPending = sub.status === 'pending_review';

          return (
            <div
              key={sub.id}
              className={`p-5 rounded-2xl bg-[#0d1424] border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                isPending ? 'border-purple-500/40' : 'border-slate-800'
              }`}
            >
              {/* Left Info */}
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif font-bold text-base text-slate-100">
                    {sub.area_value} {sub.area_unit} {sub.property_type} ({sub.intent})
                  </span>
                  {sub.reference_id && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-gold-400 border border-gold-500/30">
                      {sub.reference_id}
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                    sub.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : sub.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>{sub.address}, {sub.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Demand: <strong className="text-gold-400 font-serif">{formatPKR(sub.asking_price)}</strong></span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Owner Name:</span>
                    <strong className="text-slate-200">{sub.owner_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <a href={`tel:${sub.owner_phone}`} className="text-emerald-400 hover:underline">{sub.owner_phone}</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ownership Status:</span>
                    <span>{sub.ownership_status || 'Clear Title'}</span>
                  </div>
                  {sub.rejection_reason && (
                    <div className="text-rose-400 pt-1 text-[11px]">
                      Reason: {sub.rejection_reason}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-2 shrink-0">
                {isPending && (
                  <>
                    <button
                      onClick={() => handleApprove(sub)}
                      disabled={processingId === sub.id}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{processingId === sub.id ? 'Publishing...' : 'Approve & Publish'}</span>
                    </button>

                    <button
                      onClick={() => handleReject(sub.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                <a
                  href={`tel:${sub.owner_phone}`}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  <span>Call Owner</span>
                </a>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#0d1424] border border-slate-800 text-slate-400 text-xs">
            {loading ? 'Loading property submissions...' : 'No property submissions in this category.'}
          </div>
        )}
      </div>

    </div>
  );
};
