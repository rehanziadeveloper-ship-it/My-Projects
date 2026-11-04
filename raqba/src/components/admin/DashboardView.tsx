import React from 'react';
import { Lead, Showing, Agent, Property } from '../../types';
import { formatPKR, formatArea } from '../../lib/formatters';
import { 
  Users, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowUpRight, 
  Phone,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  leads: Lead[];
  showings: Showing[];
  agents: Agent[];
  properties: Property[];
  onSelectLead: (lead: Lead) => void;
  onConfirmShowing: (showingId: string) => void;
  onNavigateToTab: (tab: 'pipeline' | 'showings' | 'manual_lead') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  showings,
  agents,
  properties,
  onSelectLead,
  onConfirmShowing,
  onNavigateToTab,
}) => {
  // Calculations
  const newLeads = leads.filter(l => l.status === 'new' || l.deal_stage === 'new');
  const p0Leads = leads.filter(l => l.priority === 'P0 Critical');
  const upcomingShowings = showings.filter(s => s.status === 'pending_confirmation' || s.status === 'confirmed');
  
  const totalPipelineVolume = leads.reduce((sum, l) => sum + (Number(l.budget_max) || 0), 0);
  const totalClosedVolumeYTD = agents.reduce((sum, a) => sum + (Number(a.closed_volume_ytd) || 0), 0);
  
  // Forecasted commissions at average 1.5% brokerage fee
  const forecastedCommission = totalPipelineVolume * 0.015;

  return (
    <div className="space-y-6">
      
      {/* Top 4 Quick Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's New Inquiries */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 shadow-sm relative overflow-hidden group hover:border-gold-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              New Inquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-slate-100">
              {newLeads.length}
            </span>
            <span className="text-xs text-slate-400">uncontacted</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-gold-400" />
            Sub-15s auto-dispatch SLA
          </p>
        </div>

        {/* Card 2: P0 Critical Action Alerts */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-rose-500/30 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              P0 Urgent Alerts
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-rose-300">
              {p0Leads.length}
            </span>
            <span className="text-xs text-rose-400/80">high-intent</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Cash / ready buyers requiring immediate call
          </p>
        </div>

        {/* Card 3: Upcoming Showings */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Upcoming Walkthroughs
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-slate-100">
              {upcomingShowings.length}
            </span>
            <span className="text-xs text-emerald-400">
              ({showings.filter(s => s.status === 'pending_confirmation').length} pending)
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Private visits & society clearances
          </p>
        </div>

        {/* Card 4: Total Pipeline Volume in PKR */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 shadow-sm relative overflow-hidden group hover:border-gold-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
              Active Pipeline
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-gold-300">
              {formatPKR(totalPipelineVolume)}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Across {leads.length} active qualified buyer leads
          </p>
        </div>

      </div>

      {/* Main Grid: Urgent P0 Leads & Upcoming Showings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: P0 Urgent Leads + Today's Inquiries */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Urgent Leads Attention Box */}
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <h3 className="font-serif font-bold text-base text-slate-100">
                  Priority Action Board (P0 & P1 Leads)
                </h3>
              </div>
              <button 
                onClick={() => onNavigateToTab('pipeline')}
                className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-medium"
              >
                View Full Pipeline
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {leads.filter(l => l.priority === 'P0 Critical' || l.priority === 'P1 High').slice(0, 4).map((lead) => (
                <div 
                  key={lead.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-gold-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-100">
                        {lead.full_name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                        lead.priority === 'P0 Critical' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {lead.priority}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {lead.lead_source.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                      <span className="text-gold-400 font-semibold">
                        Budget: {formatPKR(lead.budget_max)}
                      </span>
                      <span>•</span>
                      <span>{lead.financing_type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        {lead.phone}
                      </span>
                    </div>

                    {lead.summary_dossier && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic pt-1 border-t border-slate-800/60 mt-1">
                        "{lead.verbatim_quote || lead.summary_dossier.bullet_3_action}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${lead.phone}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      Call Now
                    </a>
                    <button
                      onClick={() => {
                        onSelectLead(lead);
                        onNavigateToTab('pipeline');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/40 text-gold-300 text-xs font-semibold transition-colors"
                    >
                      Dossier
                    </button>
                  </div>
                </div>
              ))}

              {leads.filter(l => l.priority === 'P0 Critical' || l.priority === 'P1 High').length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No urgent alerts at this moment. All leads are in active communication.
                </div>
              )}
            </div>
          </div>

          {/* Quick Showings Schedule List */}
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Upcoming Private Walkthroughs
              </h3>
              <button 
                onClick={() => onNavigateToTab('showings')}
                className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-medium"
              >
                All Showings ({showings.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {showings.slice(0, 3).map((showing) => (
                <div
                  key={showing.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {showing.property?.title || 'Prime Property'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        showing.broker_confirmed 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {showing.broker_confirmed ? 'Confirmed' : 'Pending Confirmation'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gold-400" />
                      <span>{new Date(showing.showing_time).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>•</span>
                      <span className="text-slate-300">Client: {showing.lead?.full_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!showing.broker_confirmed ? (
                      <button
                        onClick={() => onConfirmShowing(showing.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirm Walkthrough
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pass Issued {showing.gate_pin_code && `(${showing.gate_pin_code})`}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {showings.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No showings scheduled. Inquiries will appear here when buyers request walkthroughs.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Column 3: The Unified "Performance" Card (Combining Forecasting + Agent Rankings) */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-gold-500/30 shadow-lg space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-gold-400 uppercase tracking-widest font-mono font-semibold">
                  Executive Suite
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-100">
                  Performance & Forecasting
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Top Financial Breakdown */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Closed Deals Volume (YTD)
                </span>
                <span className="text-xl font-serif font-bold text-emerald-400">
                  {formatPKR(totalClosedVolumeYTD)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Actual closed sale deeds in current fiscal year
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Forecasted Commission (1.5% Brokerage)
                </span>
                <span className="text-xl font-serif font-bold text-gold-400">
                  {formatPKR(forecastedCommission)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Projected from {formatPKR(totalPipelineVolume)} total qualified pipeline
                </span>
              </div>
            </div>

            {/* Broker Leaderboard */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Licensed Broker Rankings
              </span>

              <div className="space-y-2">
                {agents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <img
                        src={agent.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                        alt={agent.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          {agent.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {agent.city_specialization?.split(' ')[0] || 'Broker'} • {agent.active_pipeline_count || 0} active deals
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-serif font-bold text-gold-300 block">
                        {formatPKR(agent.closed_volume_ytd)}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-mono">
                        YTD Volume
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
