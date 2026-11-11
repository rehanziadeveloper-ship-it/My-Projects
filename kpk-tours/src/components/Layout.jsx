import { useState } from 'react';
import {
  Activity,
  BarChart3,
  CalendarDays,
  Car,
  ClipboardList,
  CreditCard,
  LogOut,
  Map,
  Menu,
  RefreshCw,
  Settings,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'drivers', label: 'Drivers', icon: UserCheck },
  { id: 'fleet', label: 'Fleet', icon: Car },
  { id: 'routes', label: 'Routes & Fares', icon: Map },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'activity', label: 'Activity Log', icon: Activity },
];

export default function Layout({
  activePage,
  onNavigate,
  userEmail,
  onSignOut,
  whatsappState,
  lastUpdated,
  refreshing,
  onRefresh,
  badges = {},
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isWaOnline = whatsappState === 'open';
  const waBadgeText =
    whatsappState === 'open'
      ? 'WhatsApp Online'
      : whatsappState === 'checking'
      ? 'Checking WhatsApp...'
      : 'WhatsApp Offline';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            KT
          </div>
          <div>
            <div className="text-sm font-bold text-[#1E293B] leading-tight">KPK TOURS</div>
            <div className="text-[11px] text-[#64748B]">Dispatch Console</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:bg-slate-100"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          const badge = badges[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                active
                  ? 'bg-[#E0EEFF] text-[#3B82F6]'
                  : 'text-[#64748B] hover:bg-[#F4F8FD] hover:text-[#1E293B]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </span>
              {badge > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E2E8F0] space-y-3">
        <div className="text-xs text-[#64748B] truncate" title={userEmail}>
          Signed in as <span className="font-medium text-[#1E293B] block truncate">{userEmail}</span>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#1E293B] hover:bg-slate-50 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F8FD] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-[#E2E8F0] z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-white h-full border-r border-[#E2E8F0] z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#E2E8F0] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#E2E8F0] text-[#1E293B] hover:bg-slate-50"
              aria-label="Open navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-[#1E293B]">
              {NAV_ITEMS.find((n) => n.id === activePage)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isWaOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isWaOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{waBadgeText}</span>
              <span className="sm:hidden">{isWaOnline ? 'Online' : 'Offline'}</span>
            </div>

            {lastUpdated && (
              <span className="hidden md:inline text-[11px] text-[#64748B]">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}

            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F4F8FD] text-xs font-medium text-[#1E293B] transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#3B82F6]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
