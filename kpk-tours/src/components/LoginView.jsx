import { useState } from 'react';
import { CarFront, Lock, Mail, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LoginView() {
  const [email, setEmail] = useState('rehanziadeveloper@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) throw err;
    } catch (err) {
      setError(err.message || 'Sign in failed. Verify your email and password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Enter your operator email first.');
      return;
    }
    setMagicLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (err) throw err;
      setInfo('A one-click sign-in link has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Could not send magic link.');
    } finally {
      setMagicLoading(false);
    }
  }

  async function handleResetPassword() {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Enter your operator email first.');
      return;
    }
    setMagicLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (err) throw err;
      setInfo('Password setup/reset instructions sent to your email.');
    } catch (err) {
      setError(err.message || 'Could not send reset email.');
    } finally {
      setMagicLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F8FD] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#E0EEFF] text-[#3B82F6] flex items-center justify-center">
            <CarFront className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">KPK TOURS</h1>
            <p className="text-xs text-[#64748B]">Dispatch & Booking Operations Console</p>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="operator-email" className="block text-xs font-medium text-[#1E293B] mb-1.5">Operator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="operator-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                placeholder="rehanziadeveloper@gmail.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="operator-password" className="block text-xs font-medium text-[#1E293B] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="operator-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}
          {info && (
            <div className="p-3 rounded-lg bg-[#E0EEFF] border border-blue-200 text-xs text-[#1E293B]">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-[#E2E8F0] flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            disabled={magicLoading}
            onClick={handleMagicLink}
            className="inline-flex items-center gap-1.5 text-[#3B82F6] hover:underline font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Email Sign-In Link
          </button>
          <button
            type="button"
            disabled={magicLoading}
            onClick={handleResetPassword}
            className="text-[#64748B] hover:text-[#1E293B] cursor-pointer"
          >
            Set / Reset Password
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs text-[#64748B]">
        Protected operator workspace · All actions audited
      </p>
    </div>
  );
}
