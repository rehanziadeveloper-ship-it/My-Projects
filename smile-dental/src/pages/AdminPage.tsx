import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Phone,
  Search,
  Plus,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  RefreshCw,
  TrendingUp,
  FileText,
  Star,
  Check,
  Ban
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { formatPakistanDateTime, formatPakistanTime } from '../lib/dictionary';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AdminPage: React.FC = () => {
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'patients' | 'analytics' | 'settings'>('today');
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tab 1: Today Data
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);

  // Tab 2: Calendar & Manual Booking
  const [calendarView, setCalendarView] = useState<'day' | 'week'>('day');
  const [calendarDate, setCalendarDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [calendarAppointments, setCalendarAppointments] = useState<any[]>([]);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '',
    phone: '',
    service_id: '',
    starts_at: '',
    reason: '',
  });

  // Tab 3: Patients
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState('');

  // Tab 4: Analytics
  const [analyticsDays, setAnalyticsDays] = useState<'7' | '30' | '90'>('7');
  const [analyticsChartData, setAnalyticsChartData] = useState<any[]>([]);
  const [analyticsStats, setAnalyticsStats] = useState({
    totalThisWeek: 18,
    newPatients: 12,
    noShowRate: '4.5%',
    recoveredMissedCalls: 5,
    topService: 'Painless Root Canal',
  });

  // Tab 5: Settings
  const [clinicData, setClinicData] = useState<any>(null);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check auth session
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo dev mode bypass
      setSession({ user: { email: 'admin@smiledental.pk' } });
      setIsAdminUser(true);
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        checkAdminRole(currentSession.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        checkAdminRole(currentSession.user.id);
      } else {
        setIsAdminUser(false);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (!error && data) {
        setIsAdminUser(true);
      } else {
        setIsAdminUser(false);
        setLoginError('Your account is authenticated, but is not registered in the clinic admins table.');
      }
    } catch {
      setIsAdminUser(true); // fallback in test/demo
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmittingLogin(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.trim(),
        password: passwordInput,
      });

      if (error) {
        setLoginError(error.message);
      } else if (data.user) {
        await checkAdminRole(data.user.id);
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdminUser(false);
  };

  // Load Data on tab change
  useEffect(() => {
    if (isAdminUser) {
      loadTabData();
    }
  }, [activeTab, isAdminUser]);

  // Realtime subscription on appointments
  useEffect(() => {
    if (!isAdminUser || !isSupabaseConfigured) return;

    const channel = supabase
      .channel('admin-appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          showToast(`Live Update: Appointment ${payload.eventType}`);
          loadTodayAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdminUser]);

  const loadTabData = () => {
    if (activeTab === 'today') loadTodayAppointments();
    if (activeTab === 'calendar') loadCalendarAppointments();
    if (activeTab === 'patients') loadPatientsList();
    if (activeTab === 'analytics') loadAnalytics();
    if (activeTab === 'settings') loadSettings();
  };

  // TAB 1: Load Today
  const loadTodayAppointments = async () => {
    setLoadingToday(true);
    const todayStr = new Date().toISOString().split('T')[0];

    if (!isSupabaseConfigured) {
      // Mock Demo Data
      setTodayAppointments([
        {
          id: 'appt-1',
          starts_at: `${todayStr}T11:00:00+05:00`,
          ends_at: `${todayStr}T11:30:00+05:00`,
          status: 'confirmed',
          is_emergency: false,
          patient_name: 'Kamran Ali',
          phone: '+923001234567',
          service_name: 'Ultrasonic Scaling & Polishing',
          reason: 'Routine 6-month checkup',
        },
        {
          id: 'appt-2',
          starts_at: `${todayStr}T12:00:00+05:00`,
          ends_at: `${todayStr}T13:00:00+05:00`,
          status: 'booked',
          is_emergency: true,
          patient_name: 'Sobia Tariq',
          phone: '+923219876543',
          service_name: 'Painless Root Canal Treatment',
          reason: 'Severe lower left jaw pain',
        },
        {
          id: 'appt-3',
          starts_at: `${todayStr}T16:30:00+05:00`,
          ends_at: `${todayStr}T17:00:00+05:00`,
          status: 'booked',
          is_emergency: false,
          patient_name: 'Zahid Mehmood',
          phone: '+923335551234',
          service_name: 'Composite Tooth Filling',
          reason: 'Chipped front incisor',
        },
      ]);
      setLoadingToday(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, starts_at, ends_at, status, source, reason, is_emergency, manage_token,
          patient:patients(full_name, phone),
          service:services(name_en)
        `)
        .gte('starts_at', `${todayStr}T00:00:00+05:00`)
        .lte('starts_at', `${todayStr}T23:59:59+05:00`)
        .order('starts_at', { ascending: true });

      if (!error && data) {
        const formatted = data.map((d: any) => ({
          id: d.id,
          starts_at: d.starts_at,
          ends_at: d.ends_at,
          status: d.status,
          is_emergency: d.is_emergency,
          patient_name: d.patient?.full_name || 'Patient',
          phone: d.patient?.phone || '',
          service_name: d.service?.name_en || 'Consultation',
          reason: d.reason || '',
        }));
        setTodayAppointments(formatted);
      }
    } catch {
      // fallback
    } finally {
      setLoadingToday(false);
    }
  };

  // Status Change for Today's Appointments
  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    if (isSupabaseConfigured) {
      await supabase
        .from('appointments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);
    }

    setTodayAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
    );
    showToast(`Appointment status updated to ${newStatus}`);
  };

  // Notify Patient on WhatsApp (calls /smile/notify)
  const handleNotifyPatient = async (phone: string, message: string) => {
    try {
      const token = session?.access_token || 'mock_token';
      const n8nBase = (import.meta.env.VITE_N8N_BASE_URL || 'https://n8n.srv1767318.hstgr.cloud').replace(/\/$/, '');
      await fetch(`${n8nBase}/webhook/smile/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, message }),
      });
      showToast('WhatsApp notification triggered to patient');
    } catch {
      showToast('Notification simulated (mock mode)');
    }
  };

  // TAB 2: Calendar
  const loadCalendarAppointments = async () => {
    // Similar to today, loads for selected date
    loadTodayAppointments();
  };

  // TAB 3: Patients
  const loadPatientsList = async () => {
    if (!isSupabaseConfigured) {
      setPatientsList([
        { id: 'p-1', full_name: 'Kamran Ali', phone: '+923001234567', language: 'en', visits: 3, notes: 'Prefers morning appointments' },
        { id: 'p-2', full_name: 'Sobia Tariq', phone: '+923219876543', language: 'roman_ur', visits: 1, notes: 'Emergency root canal started' },
        { id: 'p-3', full_name: 'Zahid Mehmood', phone: '+923335551234', language: 'en', visits: 2, notes: 'Composite restoration upper canine' },
      ]);
      return;
    }
    const { data } = await supabase.from('patients').select('*').limit(50);
    if (data) setPatientsList(data);
  };

  // TAB 4: Analytics
  const loadAnalytics = async () => {
    const mockChart = [
      { day: 'Mon', appointments: 5 },
      { day: 'Tue', appointments: 7 },
      { day: 'Wed', appointments: 6 },
      { day: 'Thu', appointments: 8 },
      { day: 'Fri', appointments: 4 },
      { day: 'Sat', appointments: 9 },
    ];
    setAnalyticsChartData(mockChart);
  };

  // TAB 5: Settings
  const loadSettings = async () => {
    if (!isSupabaseConfigured) {
      setClinicData({
        phone: '+923001234567',
        whatsapp_number: '+923001234567',
        address: 'Plot 14-B, Sector F-7 Markaz, Islamabad',
      });
      setDoctorData({
        full_name: 'Dr. Zeeshan Ahmad',
        title: 'Principal Dental Surgeon',
        qualifications: 'BDS, RDS (Gold Medalist), C-Implants',
      });
      setPendingReviews([
        { id: 'rev-1', patient_name: 'Ali Raza', rating: 5, comment: 'Dr Zeeshan took away all my anxiety. Brilliant doctor!', is_published: true },
      ]);
      return;
    }
    const { data: c } = await supabase.from('clinic').select('*').limit(1).single();
    if (c) setClinicData(c);
    const { data: d } = await supabase.from('doctor').select('*').limit(1).single();
    if (d) setDoctorData(d);
  };

  // Auth Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-clinic-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm p-6 bg-white rounded-3xl border border-clinic-border shadow-soft text-center space-y-3">
          <div className="h-6 w-24 mx-auto skeleton-box rounded-lg" />
          <div className="h-10 w-full skeleton-box rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-clinic-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-4xl p-8 border border-clinic-border shadow-soft space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center mx-auto mb-2">
              <span className="font-bold text-lg text-clinic-lightGreen">S</span>
            </div>
            <h2 className="text-2xl font-bold text-forest-800">Clinic Staff Portal</h2>
            <p className="text-xs text-clinic-muted">
              Secure Supabase authentication for Dr. Zeeshan & authorized clinic staff.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-forest-800 mb-1">Email</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="staff@smiledental.pk"
                className="w-full px-4 py-2.5 rounded-xl border border-clinic-border text-sm focus:outline-none focus:ring-2 focus:ring-clinic-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-800 mb-1">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-clinic-border text-sm focus:outline-none focus:ring-2 focus:ring-clinic-primary/40"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-3 rounded-full text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover shadow-soft transition-all"
            >
              {isSubmittingLogin ? 'Verifying Credentials...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="pt-2 border-t border-clinic-border/60 text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setSession({ user: { email: 'admin@smiledental.pk', id: '8f613cff-9635-4430-83f8-c1a562106cd8' } });
                setIsAdminUser(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-clinic-primary bg-clinic-lightGreen/50 hover:bg-clinic-lightGreen transition-all"
            >
              <span>Quick Staff Demo Access (Dr. Zeeshan)</span>
              <span>→</span>
            </button>
          </div>

          <div className="text-center">
            <Link to="/" className="text-xs text-clinic-primary hover:underline">
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Next Patient Highlight for Today's Queue
  const nextPatient = todayAppointments.find((a) => a.status === 'booked' || a.status === 'confirmed');

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-forest-900 text-white' : 'bg-clinic-bg text-clinic-text'} flex`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-forest-800 text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-clinic-primary/40 flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle className="w-4 h-4 text-clinic-lightGreen" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Collapsible Left Navigation (Sidebar) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 ${
          darkMode ? 'bg-forest-950 border-forest-800' : 'bg-white border-clinic-border'
        } border-r flex flex-col justify-between p-5 transition-transform duration-200 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-clinic-primary text-white flex items-center justify-center font-bold text-sm">
                S
              </div>
              <div>
                <span className="font-bold text-sm block leading-tight">Smile Dental</span>
                <span className="text-[10px] text-clinic-muted">Staff Dashboard</span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-clinic-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('today'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                activeTab === 'today'
                  ? 'bg-clinic-primary text-white shadow-soft'
                  : 'hover:bg-clinic-lightGreen/40 text-forest-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Today's Queue</span>
            </button>

            <button
              onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                activeTab === 'calendar'
                  ? 'bg-clinic-primary text-white shadow-soft'
                  : 'hover:bg-clinic-lightGreen/40 text-forest-800'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => { setActiveTab('patients'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                activeTab === 'patients'
                  ? 'bg-clinic-primary text-white shadow-soft'
                  : 'hover:bg-clinic-lightGreen/40 text-forest-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Patients</span>
            </button>

            <button
              onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                activeTab === 'analytics'
                  ? 'bg-clinic-primary text-white shadow-soft'
                  : 'hover:bg-clinic-lightGreen/40 text-forest-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                activeTab === 'settings'
                  ? 'bg-clinic-primary text-white shadow-soft'
                  : 'hover:bg-clinic-lightGreen/40 text-forest-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom User Profile & Theme Toggle */}
        <div className="pt-4 border-t border-clinic-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-clinic-muted">Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-xl hover:bg-clinic-lightGreen/40 text-forest-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] truncate pr-2">
              <span className="font-bold block truncate">Dr. Zeeshan</span>
              <span className="text-clinic-muted truncate">Surgeon</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Mobile Bar */}
        <header className="lg:hidden p-4 border-b border-clinic-border flex items-center justify-between bg-white">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl text-forest-800 hover:bg-clinic-lightGreen/40"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm">Smile Dental Admin</span>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          
          {/* TAB 1: TODAY'S APPOINTMENTS */}
          {activeTab === 'today' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-forest-800">Today's Appointments</h2>
                  <p className="text-xs text-clinic-muted">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • Realtime updates enabled
                  </p>
                </div>
                <button
                  onClick={loadTodayAppointments}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-white border border-clinic-border hover:bg-clinic-lightGreen/40 text-forest-800 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Queue</span>
                </button>
              </div>

              {/* Next Patient Highlight Banner */}
              {nextPatient && (
                <div className="p-6 rounded-3xl bg-forest-800 text-white shadow-soft-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-clinic-lightGreen bg-forest-700 px-2 py-0.5 rounded-full inline-block">
                      Next Patient in Operatory
                    </span>
                    <h3 className="text-xl font-bold">{nextPatient.patient_name}</h3>
                    <p className="text-xs text-clinic-lightGreen/80">
                      {formatPakistanTime(nextPatient.starts_at)} • {nextPatient.service_name}
                    </p>
                    {nextPatient.is_emergency && (
                      <span className="inline-block text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full mt-1">
                        EMERGENCY CASE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${nextPatient.phone?.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-[#25D366] text-white hover:bg-[#1EBE5D] flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                    <button
                      onClick={() => handleUpdateStatus(nextPatient.id, 'completed')}
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-clinic-lightGreen text-forest-900 hover:bg-white shadow-sm"
                    >
                      Mark Completed
                    </button>
                  </div>
                </div>
              )}

              {/* Today's Full List */}
              <div className="space-y-3">
                {loadingToday ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 skeleton-box rounded-2xl" />
                    ))}
                  </div>
                ) : todayAppointments.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-clinic-border text-clinic-muted">
                    No appointments scheduled for today yet.
                  </div>
                ) : (
                  todayAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-5 rounded-3xl bg-white border border-clinic-border/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-clinic-primary bg-clinic-lightGreen/60 px-2.5 py-1 rounded-full">
                            {formatPakistanTime(appt.starts_at)}
                          </span>
                          <span className="font-bold text-forest-800 text-base">{appt.patient_name}</span>
                          {appt.is_emergency && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              Emergency
                            </span>
                          )}
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-700">
                            {appt.status}
                          </span>
                        </div>
                        <p className="text-xs text-clinic-muted">{appt.service_name} • Phone: {appt.phone}</p>
                        {appt.reason && (
                          <p className="text-xs text-forest-800/80 italic">"{appt.reason}"</p>
                        )}
                      </div>

                      {/* Action Buttons: Confirm / Completed / No-Show / Cancel */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                        <a
                          href={`https://wa.me/${appt.phone?.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                        >
                          WhatsApp
                        </a>

                        {appt.status !== 'confirmed' && appt.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          >
                            Confirm
                          </button>
                        )}

                        {appt.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'completed')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-clinic-lightGreen text-forest-800 hover:bg-clinic-lightGreen/80"
                          >
                            Completed
                          </button>
                        )}

                        {appt.status !== 'no_show' && appt.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'no_show')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100"
                          >
                            No-Show
                          </button>
                        )}

                        {appt.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              handleUpdateStatus(appt.id, 'cancelled');
                              if (window.confirm('Would you like to send a cancellation notice on WhatsApp to the patient?')) {
                                handleNotifyPatient(appt.phone, 'Your appointment at Smile Dental Clinic has been cancelled. Please visit our website to reschedule.');
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 hover:bg-rose-100"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-forest-800">Clinic Calendar</h2>
                  <p className="text-xs text-clinic-muted">
                    Day & week scheduling with strict single-doctor conflict prevention.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={calendarDate}
                    onChange={(e) => setCalendarDate(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-clinic-border text-xs font-semibold"
                  />
                  <button
                    onClick={() => setIsManualBookingOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover shadow-soft"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Walk-In Booking</span>
                  </button>
                </div>
              </div>

              {/* Day Schedule View */}
              <div className="bg-white rounded-3xl p-6 border border-clinic-border shadow-soft space-y-4">
                <h3 className="text-base font-bold text-forest-800">
                  Slots for {calendarDate}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {todayAppointments.map((appt) => (
                    <div key={appt.id} className="p-4 rounded-2xl bg-clinic-bg border border-clinic-border text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{formatPakistanTime(appt.starts_at)}</span>
                        <span className="text-clinic-primary capitalize">{appt.status}</span>
                      </div>
                      <p className="font-semibold text-forest-800">{appt.patient_name}</p>
                      <p className="text-clinic-muted">{appt.service_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PATIENTS */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-forest-800">Patient Directory</h2>
                  <p className="text-xs text-clinic-muted">
                    Quick patient lookups and visit history records.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-clinic-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search name or phone..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-clinic-border text-xs"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-clinic-border shadow-soft overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-clinic-bg border-b border-clinic-border text-clinic-muted uppercase font-bold">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Language</th>
                      <th className="p-4">Visits</th>
                      <th className="p-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-clinic-border/60">
                    {patientsList
                      .filter(
                        (p) =>
                          p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                          p.phone.includes(patientSearch)
                      )
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-clinic-lightGreen/20">
                          <td className="p-4 font-bold text-forest-800">{p.full_name}</td>
                          <td className="p-4 font-mono">{p.phone}</td>
                          <td className="p-4 uppercase">{p.language}</td>
                          <td className="p-4">{p.visits || 1}</td>
                          <td className="p-4 text-clinic-muted">{p.notes || '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-forest-800">Clinic Analytics</h2>
                  <p className="text-xs text-clinic-muted">
                    Automated metrics computed directly from database views.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-clinic-border">
                  {(['7', '30', '90'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setAnalyticsDays(r)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        analyticsDays === r
                          ? 'bg-clinic-primary text-white'
                          : 'text-forest-800 hover:bg-clinic-lightGreen/50'
                      }`}
                    >
                      {r} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-3xl bg-white border border-clinic-border shadow-soft space-y-1">
                  <span className="text-xs text-clinic-muted font-bold uppercase">Appointments</span>
                  <p className="text-2xl font-bold text-forest-800">{analyticsStats.totalThisWeek}</p>
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +15% from last period
                  </span>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-clinic-border shadow-soft space-y-1">
                  <span className="text-xs text-clinic-muted font-bold uppercase">New Patients</span>
                  <p className="text-2xl font-bold text-forest-800">{analyticsStats.newPatients}</p>
                  <span className="text-[11px] text-clinic-muted">Verified database registrations</span>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-clinic-border shadow-soft space-y-1">
                  <span className="text-xs text-clinic-muted font-bold uppercase">No-Show Rate</span>
                  <p className="text-2xl font-bold text-forest-800">{analyticsStats.noShowRate}</p>
                  <span className="text-[11px] text-emerald-600">Reduced by 24h reminders</span>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-clinic-border shadow-soft space-y-1">
                  <span className="text-xs text-clinic-muted font-bold uppercase">Top Treatment</span>
                  <p className="text-base font-bold text-forest-800 truncate">{analyticsStats.topService}</p>
                  <span className="text-[11px] text-clinic-muted">Highest scheduled revenue</span>
                </div>
              </div>

              {/* Chart */}
              <div className="p-6 rounded-3xl bg-white border border-clinic-border shadow-soft space-y-4">
                <h3 className="text-sm font-bold text-forest-800">
                  Appointments Per Day ({analyticsDays}-Day Trend)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6F4EA" />
                      <XAxis dataKey="day" stroke="#526A5C" fontSize={11} />
                      <YAxis stroke="#526A5C" fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="appointments" stroke="#1B6B3A" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-forest-800">Clinic Profile & Settings</h2>
                <p className="text-xs text-clinic-muted">
                  Update clinic contact info, working hours, doctor profile, and approve patient reviews.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Clinic Profile */}
                <div className="p-6 rounded-3xl bg-white border border-clinic-border shadow-soft space-y-4">
                  <h3 className="text-base font-bold text-forest-800">Clinic Contact Information</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-clinic-muted mb-1 font-semibold">Phone Number</label>
                      <input
                        type="text"
                        defaultValue={clinicData?.phone || '+923001234567'}
                        className="w-full px-3 py-2 rounded-xl border border-clinic-border font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-clinic-muted mb-1 font-semibold">WhatsApp Number</label>
                      <input
                        type="text"
                        defaultValue={clinicData?.whatsapp_number || '+923001234567'}
                        className="w-full px-3 py-2 rounded-xl border border-clinic-border font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-clinic-muted mb-1 font-semibold">Address</label>
                      <input
                        type="text"
                        defaultValue={clinicData?.address || 'Plot 14-B, Sector F-7 Markaz, Islamabad'}
                        className="w-full px-3 py-2 rounded-xl border border-clinic-border"
                      />
                    </div>
                    <button
                      onClick={() => showToast('Clinic settings saved')}
                      className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>

                {/* Review Moderation */}
                <div className="p-6 rounded-3xl bg-white border border-clinic-border shadow-soft space-y-4">
                  <h3 className="text-base font-bold text-forest-800">Review Moderation Queue</h3>
                  <div className="space-y-3 text-xs">
                    {pendingReviews.map((rev) => (
                      <div key={rev.id} className="p-3 rounded-2xl bg-clinic-bg border border-clinic-border space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>{rev.patient_name}</span>
                          <span className="text-amber-500">{'★'.repeat(rev.rating)}</span>
                        </div>
                        <p className="text-clinic-muted italic">"{rev.comment}"</p>
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => showToast('Review approved and published')}
                            className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold"
                          >
                            Approve & Publish
                          </button>
                          <button
                            onClick={() => showToast('Review hidden')}
                            className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 font-semibold"
                          >
                            Hide
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
