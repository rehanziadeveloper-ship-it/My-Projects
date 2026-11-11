import { useState } from 'react';
import { CarFront, CheckCircle2, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPasswordView({ email, onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      window.history.replaceState({}, document.title, window.location.pathname);
      onDone();
    } catch (err) {
      setError(err.message || 'Could not update password. Request a fresh reset link.');
    } finally {
      setSaving(false);
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
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Set New Password</h1>
            <p className="text-xs text-[#64748B]">{email || 'Operator account'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-xs font-medium text-[#1E293B] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-medium text-[#1E293B] mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <CheckCircle2 className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Saving Password...' : 'Save Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
