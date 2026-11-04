import React, { useState } from 'react';
import { Lead, Agent, DealStage, Priority, PaymentStatus } from '../../types';
import { formatPKR } from '../../lib/formatters';
import { supabase } from '../../lib/supabase';
import { 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  Phone, 
  Mail, 
  ChevronRight, 
  Check, 
  Sparkles,
  ShieldCheck,
  Edit2,
  FileText,
  Bot,
  ExternalLink
} from 'lucide-react';

interface PipelineKanbanViewProps {
  leads: Lead[];
  agents: Agent[];
  currentAgentId?: string;
  onRefresh: () => void;
  selectedLeadForDossier?: Lead | null;
  onOpenLeadDetail?: (lead: Lead) => void;
}

export const PipelineKanbanView: React.FC<PipelineKanbanViewProps> = ({
  leads,
  agents,
  currentAgentId,
  onRefresh,
  selectedLeadForDossier,
  onOpenLeadDetail,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDossierLeadId, setActiveDossierLeadId] = useState<string | null>(
    selectedLeadForDossier ? selectedLeadForDossier.id : null
  );

  // Editing state for commission and payment
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editCommissionRate, setEditCommissionRate] = useState<number>(1.5);
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('None');
  const [editPaymentNotes, setEditPaymentNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Kanban Stage definitions
  const columns: { id: DealStage; label: string; color: string; bgBadge: string }[] = [
    { id: 'new', label: '1. New Inquiries', color: 'border-slate-500', bgBadge: 'bg-slate-500/20 text-slate-300' },
    { id: 'budget_verified', label: '2. Budget Verified', color: 'border-blue-500', bgBadge: 'bg-blue-500/20 text-blue-300' },
    { id: 'showing_scheduled', label: '3. Showing Scheduled', color: 'border-emerald-500', bgBadge: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'offer', label: '4. Offer in Review', color: 'border-amber-500', bgBadge: 'bg-amber-500/20 text-amber-300' },
    { id: 'closing', label: '5. Escrow & Closing', color: 'border-purple-500', bgBadge: 'bg-purple-500/20 text-purple-300' },
  ];

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    const matchesSearch = 
      searchQuery === '' ||
      lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.reference_id && lead.reference_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.property?.title && lead.property.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesSearch;
  });

  // Action: Toggle Budget Verification
  const handleToggleBudgetVerification = async (lead: Lead) => {
    try {
      const newStatus = !lead.budget_verified;
      const agentId = currentAgentId || agents[0]?.id || 'a1111111-1111-1111-1111-111111111111';

      await supabase.rpc('raqba_verify_budget', {
        p_lead_id: lead.id,
        p_agent_id: agentId,
        p_verified: newStatus,
        p_notes: newStatus ? 'Verified via broker phone inquiry & declaration.' : 'Verification revoked.'
      });

      onRefresh();
    } catch (err) {
      console.error('Error verifying budget:', err);
    }
  };

  // Action: Move stage
  const handleMoveStage = async (leadId: string, newStage: DealStage) => {
    try {
      await supabase.from('leads').update({
        deal_stage: newStage,
        status: newStage
      }).eq('id', leadId);

      onRefresh();
    } catch (err) {
      console.error('Error changing stage:', err);
    }
  };

  // Action: Save Deal Terms
  const handleOpenEditDeal = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setEditCommissionRate(lead.commission_rate || 1.5);
    setEditPaymentStatus(lead.deal_payment_status || 'None');
    setEditPaymentNotes(lead.payment_notes || '');
  };

  const handleSaveDealTerms = async (leadId: string) => {
    setIsSaving(true);
    try {
      await supabase.from('leads').update({
        commission_rate: Number(editCommissionRate),
        deal_payment_status: editPaymentStatus,
        payment_notes: editPaymentNotes
      }).eq('id', leadId);

      setEditingLeadId(null);
      onRefresh();
    } catch (err) {
      console.error('Error saving deal terms:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by buyer name, phone, or reference ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Priority:
          </span>
          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            {['all', 'P0 Critical', 'P1 High', 'P2 Routine'].map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  priorityFilter === priority
                    ? 'bg-gold-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {priority === 'all' ? 'All Leads' : priority}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colLeads = filteredLeads.filter(l => (l.deal_stage || l.status) === col.id);
          return (
            <div
              key={col.id}
              className="bg-[#090d16]/80 rounded-2xl border border-slate-800/90 flex flex-col min-w-[280px]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-200">
                  {col.label}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${col.bgBadge}`}>
                  {colLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="p-3 space-y-3 flex-1 min-h-[300px]">
                {colLeads.map((lead) => {
                  const isDossierOpen = activeDossierLeadId === lead.id;
                  const isEditing = editingLeadId === lead.id;

                  return (
                    <div
                      key={lead.id}
                      className="p-3.5 rounded-xl bg-[#0f172a]/90 border border-slate-800 hover:border-gold-500/40 transition-all space-y-2.5 shadow-sm"
                    >
                      {/* Top Badges: Reference ID, Temperature, Intent */}
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          {lead.reference_id && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-gold-400 border border-gold-500/20">
                              {lead.reference_id}
                            </span>
                          )}
                          {lead.temperature && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                              lead.temperature === 'Hot'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : lead.temperature === 'Warm'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-700/40 text-slate-400 border border-slate-700/50'
                            }`}>
                              {lead.temperature}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {lead.intent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-300 font-semibold border border-gold-500/20">
                              {lead.intent}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400 capitalize">
                            {lead.lead_source === 'chatbot' ? '🤖 Chatbot' : lead.lead_source.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Lead Name & Contact */}
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-100">
                            {lead.full_name}
                          </h4>
                          {lead.language_last && (
                            <span className="text-[9px] font-mono text-slate-400 uppercase">
                              [{lead.language_last}]
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                      </div>

                      {/* Budget in PKR */}
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-mono block">
                            Declared Budget
                          </span>
                          <span className="text-xs font-serif font-bold text-gold-400">
                            {formatPKR(lead.budget_max)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block">Financing</span>
                          <span className="text-[10px] text-slate-300 font-medium">
                            {lead.financing_type}
                          </span>
                        </div>
                      </div>

                      {/* Manual Budget Verification Badge / Button */}
                      <div className="pt-1">
                        {lead.budget_verified ? (
                          <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded-lg">
                            <span className="flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Budget Verified
                            </span>
                            <button
                              onClick={() => handleToggleBudgetVerification(lead)}
                              className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToggleBudgetVerification(lead)}
                            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            Verify Budget (Phone/Statement)
                          </button>
                        )}
                      </div>

                      {/* View Full Dossier & Transcript Trigger */}
                      {onOpenLeadDetail && (
                        <button
                          onClick={() => onOpenLeadDetail(lead)}
                          className="w-full py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
                        >
                          <FileText className="w-3.5 h-3.5 text-gold-400" />
                          <span>View Transcript & Dossier</span>
                        </button>
                      )}

                      {/* Deal Payment & Commission Quick Row */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Payment: <strong className="text-slate-300">{lead.deal_payment_status || 'None'}</strong></span>
                        <button
                          onClick={() => handleOpenEditDeal(lead)}
                          className="text-gold-400 hover:text-gold-300 flex items-center gap-0.5"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          Edit Deal
                        </button>
                      </div>

                      {/* Modal/Inline Editor for Deal Terms */}
                      {isEditing && (
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-gold-500/30 space-y-2 text-xs">
                          <div className="text-[11px] font-semibold text-gold-400">
                            Edit Deal Terms
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">Commission Rate (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editCommissionRate}
                              onChange={(e) => setEditCommissionRate(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">Payment Status</label>
                            <select
                              value={editPaymentStatus}
                              onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                            >
                              <option value="None">None</option>
                              <option value="Token Received">Token Received</option>
                              <option value="Advance Received">Advance Received</option>
                              <option value="Balance Pending">Balance Pending</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">Payment Notes</label>
                            <input
                              type="text"
                              placeholder="e.g. Rs 10 Lakh token cheque received"
                              value={editPaymentNotes}
                              onChange={(e) => setEditPaymentNotes(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleSaveDealTerms(lead.id)}
                              disabled={isSaving}
                              className="px-2.5 py-1 rounded bg-gold-500 text-slate-950 font-bold text-[10px]"
                            >
                              Save Terms
                            </button>
                            <button
                              onClick={() => setEditingLeadId(null)}
                              className="px-2 py-1 rounded text-slate-400 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Stage Mover Selector */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px]">
                        <span className="text-slate-400">Move to:</span>
                        <select
                          value={lead.deal_stage || col.id}
                          onChange={(e) => handleMoveStage(lead.id, e.target.value as DealStage)}
                          className="bg-slate-900 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                        >
                          <option value="new">New</option>
                          <option value="budget_verified">Budget Verified</option>
                          <option value="showing_scheduled">Showing</option>
                          <option value="offer">Offer</option>
                          <option value="closing">Closing</option>
                        </select>
                      </div>

                    </div>
                  );
                })}

                {colLeads.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    No leads in this stage.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
