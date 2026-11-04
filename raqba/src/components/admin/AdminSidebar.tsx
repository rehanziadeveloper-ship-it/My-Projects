import React from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  Building2, 
  Calendar, 
  FileSignature, 
  UserPlus, 
  ExternalLink, 
  Shield, 
  UserCheck, 
  ChevronRight,
  Sparkles,
  Sliders,
  Home,
  Inbox
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Agent, UserRole } from '../../types';

export type AdminTab = 'dashboard' | 'pipeline' | 'properties' | 'submissions' | 'showings' | 'agreements' | 'manual_lead';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
  agents: Agent[];
  pendingShowingsCount: number;
  pendingSubmissionsCount?: number;
  p0LeadsCount: number;
  newLeadsCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  selectedAgentId,
  setSelectedAgentId,
  agents,
  pendingShowingsCount,
  pendingSubmissionsCount = 0,
  p0LeadsCount,
  newLeadsCount,
}) => {
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: p0LeadsCount > 0 ? `${p0LeadsCount} P0` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    {
      id: 'pipeline' as AdminTab,
      label: 'Leads & Pipeline',
      icon: Kanban,
      badge: newLeadsCount > 0 ? `${newLeadsCount} New` : undefined,
      badgeColor: 'bg-gold-500/20 text-gold-400 border border-gold-500/30',
    },
    {
      id: 'properties' as AdminTab,
      label: 'Properties Manager',
      icon: Building2,
    },
    {
      id: 'submissions' as AdminTab,
      label: 'Property Submissions',
      icon: Inbox,
      badge: pendingSubmissionsCount > 0 ? `${pendingSubmissionsCount} Pending` : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    },
    {
      id: 'showings' as AdminTab,
      label: 'Showings & Logistics',
      icon: Calendar,
      badge: pendingShowingsCount > 0 ? `${pendingShowingsCount} Pending` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'agreements' as AdminTab,
      label: 'Agreements & Legal',
      icon: FileSignature,
    },
    {
      id: 'manual_lead' as AdminTab,
      label: 'Manual Lead Entry',
      icon: UserPlus,
    },
  ];

  return (
    <aside className="w-full lg:w-72 bg-[#090d16] border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between shrink-0">
      <div className="p-5 space-y-6">
        
        {/* Brand */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-wide text-slate-100 flex items-center gap-1.5">
                Raqba
              </span>
              <p className="text-[10px] text-gold-400/90 font-medium tracking-wide">
                Your trusted property partner
              </p>
            </div>
          </Link>
        </div>

        {/* Auth Role Switcher */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Shield className="w-3.5 h-3.5 text-gold-400" />
              <span>Access Level</span>
            </div>
            <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
              <button
                onClick={() => setCurrentRole('admin')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  currentRole === 'admin'
                    ? 'bg-gold-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setCurrentRole('broker')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  currentRole === 'broker'
                    ? 'bg-gold-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Broker
              </button>
            </div>
          </div>

          {currentRole === 'broker' ? (
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                Active Broker Identity
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors"
              >
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.city_specialization?.split(' ')[0] || 'Broker'})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 italic">
                *Viewing only assigned leads & showings
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 leading-tight">
              Full brokerage view: managing all Pakistani properties, brokers, and deals.
            </p>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Footer Controls */}
      <div className="p-5 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
        <Link
          to="/"
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Public Website Portal
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        </Link>

        <Link
          to="/demo"
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" />
            Dev Simulation Hub
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 font-mono">
            DEV
          </span>
        </Link>

        <div className="pt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
          <span>Raqba Engine</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>
      </div>
    </aside>
  );
};
