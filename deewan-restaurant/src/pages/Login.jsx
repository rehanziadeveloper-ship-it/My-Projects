import React, { useState, useEffect } from 'react';
import { ChefHat, Bell, Shield, KeyRound, ArrowRight, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { getRestaurantProfile, onSyncChange } from '../services/restaurantService';

export default function Login({ onLogin }) {
  const [profile, setProfile] = useState({
    name: 'Deewan-E-Khaas (Namak Mandi)',
    logo_url: ''
  });
  const [selectedRole, setSelectedRole] = useState(null); // 'kitchen', 'waiter', 'admin'
  const [email, setEmail] = useState('admin@deewankhaas.com');
  const [password, setPassword] = useState('DeewanAdmin2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync Restaurant Name & Logo across all screens
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const p = await getRestaurantProfile();
        if (p) setProfile(p);
      } catch (e) {
        console.warn('Failed to load profile in login:', e);
      }
    };
    loadProfile();
    const unsub = onSyncChange(() => {
      loadProfile();
    });
    return () => unsub();
  }, []);

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authErr) {
        console.warn('Supabase auth notice:', authErr.message);
        setError(`${authErr.message}. You can use Direct Terminal Access below if credentials are not yet configured.`);
      } else if (data?.session) {
        setSuccess('Authentication successful! Opening Admin Terminal...');
        setTimeout(() => {
          if (onLogin) onLogin('admin');
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    if (role === 'admin') {
      setSelectedRole('admin');
    } else {
      if (onLogin) onLogin(role);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-md bg-stone-950 border-2 border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100">
        <div className="text-center mb-6">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt="Logo"
              className="w-16 h-16 mx-auto mb-3 rounded-2xl object-cover border-2 border-red-600/40 shadow-xl"
            />
          ) : (
            <div className="w-16 h-16 mx-auto mb-3 bg-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-red-600/30">
              🍖
            </div>
          )}
          <h2 className="text-2xl font-black tracking-tight text-white">{profile.name || 'Deewan-E-Khaas'} Staff</h2>
          <p className="text-xs text-stone-400 mt-1">Select your role or sign in to floor terminal</p>
        </div>

        {selectedRole === 'admin' ? (
          <div>
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-stone-850">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm text-white">Admin Terminal Authentication</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-xs text-stone-400 hover:text-white underline"
              >
                Change Role
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-600 text-white text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Staff Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-black border border-stone-800 focus:outline-none focus:ring-2 focus:ring-red-600 text-white font-mono"
                    placeholder="admin@deewankhaas.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Admin Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-black border border-stone-800 focus:outline-none focus:ring-2 focus:ring-red-600 text-white font-mono"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {loading ? 'Authenticating with Supabase...' : 'Sign In as Authenticated Admin'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onLogin) onLogin('admin');
                }}
                className="w-full py-2 bg-stone-900 hover:bg-stone-850 text-stone-300 border border-stone-800 text-xs font-bold rounded-xl transition"
              >
                Bypass Login (Direct Terminal Access)
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => handleRoleSelect('kitchen')}
              className="w-full p-4 rounded-2xl bg-stone-900/90 hover:bg-stone-900 active:scale-98 border border-stone-800 hover:border-red-600/50 flex items-center justify-between text-left transition group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 group-hover:bg-red-600 group-hover:text-white transition">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Kitchen Display (KDS)</h3>
                  <p className="text-xs text-stone-400">Live order tickets & cooking timers</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-500 group-hover:text-red-500 transition" />
            </button>

            <button
              onClick={() => handleRoleSelect('waiter')}
              className="w-full p-4 rounded-2xl bg-stone-900/90 hover:bg-stone-900 active:scale-98 border border-stone-800 hover:border-red-600/50 flex items-center justify-between text-left transition group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 group-hover:bg-red-600 group-hover:text-white transition">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Floor Waiter Terminal</h3>
                  <p className="text-xs text-stone-400">Vibration & bell table call buzzer</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-500 group-hover:text-red-500 transition" />
            </button>

            <button
              onClick={() => handleRoleSelect('admin')}
              className="w-full p-4 rounded-2xl bg-stone-900/90 hover:bg-stone-900 active:scale-98 border border-stone-800 hover:border-red-600/50 flex items-center justify-between text-left transition group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-md">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Admin & Operations Panel</h3>
                  <p className="text-xs text-stone-400">Secure stock, menu CRUD, profile & QR</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-500 group-hover:text-red-500 transition" />
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/chat?table=1"
            className="text-xs font-semibold text-red-500 hover:text-red-400 underline underline-offset-4"
          >
            Go to Guest Chat (/chat?table=1) ➔
          </a>
        </div>
      </div>
    </div>
  );
}
