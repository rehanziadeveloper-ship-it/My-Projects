import React, { useState, useEffect } from 'react';
import { Lead, Showing, Agreement, Agent, Property, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { DashboardView } from '../components/admin/DashboardView';
import { PipelineKanbanView } from '../components/admin/PipelineKanbanView';
import { PropertiesManagerView } from '../components/admin/PropertiesManagerView';
import { PropertySubmissionsView } from '../components/admin/PropertySubmissionsView';
import { ShowingsManagerView } from '../components/admin/ShowingsManagerView';
import { CalendarView } from '../components/admin/CalendarView';
import { AgreementsManagerView } from '../components/admin/AgreementsManagerView';
import { ManualLeadEntryView } from '../components/admin/ManualLeadEntryView';
import { LeadDetailModal } from '../components/admin/LeadDetailModal';
import { sendP0BrokerNotification } from '../lib/notifications';
import { 
  Building2, 
  RefreshCw, 
  Menu, 
  X, 
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminControlRoom: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [showings, setShowings] = useState<Showing[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected lead for opening dossier directly
  const [selectedLeadForDossier, setSelectedLeadForDossier] = useState<Lead | null>(null);
  // Selected lead for opening detail modal with full transcript
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [pendingSubmissionsCount, setPendingSubmissionsCount] = useState<number>(0);

  // Mobile sidebar open
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [leadsRes, showingsRes, agreementsRes, agentsRes, propertiesRes, submissionsRes] = await Promise.all([
        supabase
          .from('leads')
          .select('*, agent:agents(*), property:properties(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('showings')
          .select('*, property:properties(*), lead:leads(*), agent:agents(*)')
          .order('showing_time', { ascending: true }),
        supabase
          .from('agreements')
          .select('*, lead:leads(*), property:properties(*), agent:agents(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('agents')
          .select('*')
          .order('closed_volume_ytd', { ascending: false }),
        supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('property_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending_review')
      ]);

      if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
      if (showingsRes.data) setShowings(showingsRes.data as Showing[]);
      if (agreementsRes.data) setAgreements(agreementsRes.data as Agreement[]);
      if (agentsRes.data) {
        const loadedAgents = agentsRes.data as Agent[];
        setAgents(loadedAgents);
        if (!selectedAgentId && loadedAgents.length > 0) {
          setSelectedAgentId(loadedAgents[0].id);
        }
      }
      if (propertiesRes.data) setProperties(propertiesRes.data as Property[]);
      if (typeof submissionsRes.count === 'number') {
        setPendingSubmissionsCount(submissionsRes.count);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Supabase Realtime Channel
    const channel = supabase
      .channel('raqba-admin-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newLead = payload.new as Lead;
          if (newLead.priority === 'P0 Critical') {
            sendP0BrokerNotification(
              newLead,
              '+92 300 8492910',
              'kamran@raqba.pk'
            );
          }
        }
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'showings' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agreements' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'property_submissions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter items based on active role
  const isBroker = currentRole === 'broker';
  const visibleLeads = isBroker && selectedAgentId
    ? leads.filter(l => l.assigned_agent_id === selectedAgentId)
    : leads;

  const visibleShowings = isBroker && selectedAgentId
    ? showings.filter(s => s.agent_id === selectedAgentId || s.lead?.assigned_agent_id === selectedAgentId)
    : showings;

  const visibleAgreements = isBroker && selectedAgentId
    ? agreements.filter(a => a.agent_id === selectedAgentId || a.lead?.assigned_agent_id === selectedAgentId)
    : agreements;

  // Counts for sidebar badges
  const pendingShowingsCount = visibleShowings.filter(s => !s.broker_confirmed).length;
  const p0LeadsCount = visibleLeads.filter(l => l.priority === 'P0 Critical').length;
  const newLeadsCount = visibleLeads.filter(l => l.status === 'new' || l.deal_stage === 'new').length;

  // Handler for confirming showing
  const handleConfirmShowing = async (showingId: string) => {
    try {
      const agentId = selectedAgentId || agents[0]?.id || 'a1111111-1111-1111-1111-111111111111';
      await supabase.rpc('realtypulse_confirm_showing', {
        p_showing_id: showingId,
        p_agent_id: agentId,
        p_notes: 'Confirmed directly from Dashboard.'
      });
      fetchData();
    } catch (err) {
      console.error('Error confirming showing:', err);
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col lg:flex-row font-sans">
      
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-[#090d16] border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-sm tracking-wide text-slate-100">
            Raqba
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          selectedAgentId={selectedAgentId}
          setSelectedAgentId={setSelectedAgentId}
          agents={agents}
          pendingShowingsCount={pendingShowingsCount}
          pendingSubmissionsCount={pendingSubmissionsCount}
          p0LeadsCount={p0LeadsCount}
          newLeadsCount={newLeadsCount}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Control Bar */}
        <header className="bg-[#090d16]/90 border-b border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg text-slate-100 capitalize">
                  {activeTab.replace('_', ' ')}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REALTIME
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isBroker && selectedAgent ? (
                  <span className="text-gold-400 font-medium flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Broker Workspace: {selectedAgent.name} ({selectedAgent.city_specialization})
                  </span>
                ) : (
                  <span>Master Administrator View • All Pakistani Properties & Leads</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-colors"
              title="Refresh Realtime Pipeline"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-400' : ''}`} />
            </button>

            <Link
              to="/"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
              <span>Public Portal</span>
            </Link>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="p-6 max-w-7xl w-full mx-auto flex-1">
          {activeTab === 'dashboard' && (
            <DashboardView
              leads={visibleLeads}
              showings={visibleShowings}
              agents={agents}
              properties={properties}
              onSelectLead={(lead) => {
                setSelectedLeadForDossier(lead);
                setActiveTab('pipeline');
              }}
              onConfirmShowing={handleConfirmShowing}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'pipeline' && (
            <PipelineKanbanView
              leads={visibleLeads}
              agents={agents}
              currentAgentId={selectedAgentId}
              onRefresh={fetchData}
              selectedLeadForDossier={selectedLeadForDossier}
              onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
            />
          )}

          {activeTab === 'properties' && (
            <PropertiesManagerView
              properties={properties}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'submissions' && (
            <PropertySubmissionsView
              agents={agents}
              currentAgentId={selectedAgentId}
              onRefreshProperties={fetchData}
            />
          )}

          {activeTab === 'showings' && (
            <ShowingsManagerView
              showings={visibleShowings}
              agents={agents}
              currentAgentId={selectedAgentId}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              showings={visibleShowings}
              agents={agents}
              currentAgentId={selectedAgentId}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'agreements' && (
            <AgreementsManagerView
              agreements={visibleAgreements}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'manual_lead' && (
            <ManualLeadEntryView
              properties={properties}
              onLeadCreated={() => {
                fetchData();
                setActiveTab('pipeline');
              }}
            />
          )}
        </div>

      </main>

      {/* Full Transcript & Dossier Modal */}
      <LeadDetailModal
        lead={selectedLeadForDetail}
        isOpen={!!selectedLeadForDetail}
        onClose={() => setSelectedLeadForDetail(null)}
      />

    </div>
  );
};
