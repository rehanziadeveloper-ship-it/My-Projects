import { Component, useCallback, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { callDashboardAction } from './lib/api';
import LoginView from './components/LoginView';
import ResetPasswordView from './components/ResetPasswordView';
import Layout from './components/Layout';
import BookingSlideOver from './components/BookingSlideOver';
import BookingsPage from './pages/BookingsPage';
import CalendarPage from './pages/CalendarPage';
import CustomersPage from './pages/CustomersPage';
import DriversPage from './pages/DriversPage';
import FleetPage from './pages/FleetPage';
import RoutesFaresPage from './pages/RoutesFaresPage';
import PaymentsPage from './pages/PaymentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import ActivityLogPage from './pages/ActivityLogPage';

class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#F4F8FD] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-3">
            <h2 className="text-base font-bold text-[#1E293B]">Dashboard Display Error</h2>
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
              {this.state.error.message || 'An unexpected UI error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="w-full py-2 rounded-lg bg-[#3B82F6] text-white text-xs font-semibold cursor-pointer"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DashboardApp() {
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState(null);
  const [recoveryMode, setRecoveryMode] = useState(
    () => window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')
  );
  const [activePage, setActivePage] = useState('bookings');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [whatsappState, setWhatsappState] = useState('checking');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState(null);

  const [data, setData] = useState({
    bookings: [],
    customers: [],
    conversations: [],
    messages: [],
    drivers: [],
    vehicles: [],
    routes: [],
    fareRules: [],
    payments: [],
    events: [],
    workflowErrors: [],
    analytics: null,
    settings: [],
    botMessages: [],
  });

  const notify = useCallback((type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      setSession(initial);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
      setSession(nextSession);
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadAllData = useCallback(async () => {
    if (!session?.user) return;
    setRefreshing(true);
    try {
      const [
        bookingsRes,
        customersRes,
        convosRes,
        messagesRes,
        driversRes,
        vehiclesRes,
        routesRes,
        faresRes,
        paymentsRes,
        eventsRes,
        errorsRes,
        analyticsRes,
        settingsRes,
        botMsgRes,
      ] = await Promise.all([
        supabase.from('v_booking_dashboard').select('*').order('id', { ascending: false }).limit(200),
        supabase.from('customers').select('*').order('id', { ascending: false }).limit(200),
        supabase.from('conversations').select('*').order('updated_at', { ascending: false }).limit(200),
        supabase.from('messages').select('*').order('id', { ascending: false }).limit(300),
        supabase.from('drivers').select('*').order('id', { ascending: true }),
        supabase.from('vehicles').select('*').order('id', { ascending: true }),
        supabase.from('routes').select('*').order('id', { ascending: true }),
        supabase.from('fare_rules').select('*').order('id', { ascending: true }),
        supabase.from('payments').select('*').order('id', { ascending: false }).limit(200),
        supabase.from('booking_events').select('*').order('id', { ascending: false }).limit(200),
        supabase.from('workflow_errors').select('*').order('id', { ascending: false }).limit(100),
        supabase.from('v_analytics_summary').select('*').limit(1).maybeSingle(),
        supabase.from('settings').select('*').order('key', { ascending: true }),
        supabase.from('bot_messages').select('*').order('key', { ascending: true }),
      ]);

      setData({
        bookings: bookingsRes.data || [],
        customers: customersRes.data || [],
        conversations: convosRes.data || [],
        messages: messagesRes.data || [],
        drivers: driversRes.data || [],
        vehicles: vehiclesRes.data || [],
        routes: routesRes.data || [],
        fareRules: faresRes.data || [],
        payments: paymentsRes.data || [],
        events: eventsRes.data || [],
        workflowErrors: errorsRes.data || [],
        analytics: analyticsRes.data || null,
        settings: settingsRes.data || [],
        botMessages: botMsgRes.data || [],
      });
      setLastUpdated(new Date());

      callDashboardAction('get_whatsapp_state')
        .then((res) => setWhatsappState(res.state || 'offline'))
        .catch(() => setWhatsappState('offline'));
    } catch (err) {
      notify('error', err.message || 'Failed to sync dashboard data.');
    } finally {
      setRefreshing(false);
    }
  }, [session, notify]);

  useEffect(() => {
    if (!session?.user) return;
    loadAllData();
    const timer = setInterval(loadAllData, 15000);
    return () => clearInterval(timer);
  }, [session, loadAllData]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSelectedBookingId(null);
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F4F8FD] flex items-center justify-center text-xs text-[#64748B]">
        Loading session...
      </div>
    );
  }

  if (!session?.user) {
    return <LoginView />;
  }

  if (recoveryMode) {
    return (
      <ResetPasswordView
        email={session.user.email}
        onDone={() => {
          setRecoveryMode(false);
          notify('success', 'Password updated successfully.');
        }}
      />
    );
  }

  const selectedBooking = data.bookings.find((b) => b.id === selectedBookingId) || null;
  const pendingPaymentsCount = data.payments.filter((p) => p.status === 'pending_confirmation').length;
  const takeoverCount = data.conversations.filter((c) => c.state === 'TAKEOVER').length;

  return (
    <Layout
      activePage={activePage}
      onNavigate={setActivePage}
      userEmail={session.user.email}
      onSignOut={handleSignOut}
      whatsappState={whatsappState}
      lastUpdated={lastUpdated}
      refreshing={refreshing}
      onRefresh={loadAllData}
      badges={{ payments: pendingPaymentsCount, customers: takeoverCount }}
    >
      {toast && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          <span>{toast.text}</span>
          <button type="button" onClick={() => setToast(null)} className="ml-4 font-bold cursor-pointer">
            ×
          </button>
        </div>
      )}

      {activePage === 'bookings' && (
        <BookingsPage bookings={data.bookings} onSelectBooking={(b) => setSelectedBookingId(b.id)} />
      )}
      {activePage === 'calendar' && (
        <CalendarPage bookings={data.bookings} onSelectBooking={(b) => setSelectedBookingId(b.id)} />
      )}
      {activePage === 'customers' && (
        <CustomersPage
          customers={data.customers}
          conversations={data.conversations}
          messages={data.messages}
          onRefresh={loadAllData}
          notify={notify}
        />
      )}
      {activePage === 'drivers' && (
        <DriversPage drivers={data.drivers} onRefresh={loadAllData} notify={notify} />
      )}
      {activePage === 'fleet' && (
        <FleetPage vehicles={data.vehicles} drivers={data.drivers} onRefresh={loadAllData} notify={notify} />
      )}
      {activePage === 'routes' && (
        <RoutesFaresPage routes={data.routes} fareRules={data.fareRules} onRefresh={loadAllData} notify={notify} />
      )}
      {activePage === 'payments' && (
        <PaymentsPage
          payments={data.payments}
          bookings={data.bookings}
          onRefresh={loadAllData}
          notify={notify}
        />
      )}
      {activePage === 'analytics' && (
        <AnalyticsPage summary={data.analytics} bookings={data.bookings} drivers={data.drivers} />
      )}
      {activePage === 'settings' && (
        <SettingsPage
          settings={data.settings}
          botMessages={data.botMessages}
          onRefresh={loadAllData}
          notify={notify}
        />
      )}
      {activePage === 'activity' && (
        <ActivityLogPage events={data.events} workflowErrors={data.workflowErrors} bookings={data.bookings} />
      )}

      <BookingSlideOver
        booking={selectedBooking}
        drivers={data.drivers}
        events={data.events}
        conversations={data.conversations}
        onClose={() => setSelectedBookingId(null)}
        onActionSuccess={loadAllData}
        notify={notify}
      />
    </Layout>
  );
}

export default function App() {
  return (
    <DashboardErrorBoundary>
      <DashboardApp />
    </DashboardErrorBoundary>
  );
}
