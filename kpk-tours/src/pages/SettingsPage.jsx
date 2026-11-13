import { useEffect, useState } from 'react';
import { KeyRound, Save, Globe } from 'lucide-react';
import { callDashboardAction } from '../lib/api';
import { supabase } from '../lib/supabase';

const SUPPORTED_LANGS = [
  { code: 'roman_ur', label: 'Roman Urdu (Default)' },
  { code: 'ur', label: 'Urdu (اردو)' },
  { code: 'en', label: 'English' },
  { code: 'ps', label: 'Pashto (پښتو)' },
  { code: 'pa', label: 'Punjabi (پنجابی)' },
  { code: 'skr', label: 'Saraiki (سرائیکی)' }
];

export default function SettingsPage({ settings, botMessages, onRefresh, notify }) {
  const [settingValues, setSettingValues] = useState({});
  const [selectedLang, setSelectedLang] = useState('roman_ur');
  const [msgValues, setMsgValues] = useState({});
  const [savingKey, setSavingKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    const sMap = {};
    for (const s of settings || []) sMap[s.key] = s.value ?? '';
    setSettingValues(sMap);
  }, [settings]);

  useEffect(() => {
    const mMap = {};
    for (const m of botMessages || []) {
      const mLang = m.lang || 'roman_ur';
      if (mLang === selectedLang) {
        mMap[m.key] = m.text ?? '';
      }
    }
    setMsgValues(mMap);
  }, [botMessages, selectedLang]);

  async function saveSetting(key) {
    const val = settingValues[key] ?? '';
    // Numeric validation for delay/timing settings
    if (
      key.includes('minutes') ||
      key.includes('hours') ||
      key.includes('hour') ||
      key.includes('percent')
    ) {
      if (val !== '' && isNaN(Number(val))) {
        notify('error', `Setting "${key}" must be a valid number.`);
        return;
      }
    }

    setSavingKey(`s:${key}`);
    try {
      await callDashboardAction('update_settings', { key, value: val });
      notify('success', `Setting "${key}" saved.`);
      await onRefresh();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setSavingKey('');
    }
  }

  async function saveMessage(key, desc) {
    setSavingKey(`m:${key}`);
    try {
      await callDashboardAction('update_bot_messages', {
        key,
        lang: selectedLang,
        text: msgValues[key] ?? '',
        description: desc
      });
      notify('success', `Bot template "${key}" (${selectedLang}) saved.`);
      await onRefresh();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setSavingKey('');
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      notify('error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify('error', 'Passwords do not match.');
      return;
    }
    setSavingPass(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      notify('success', 'Operator password updated successfully.');
    } catch (err) {
      notify('error', err.message || 'Could not update password.');
    } finally {
      setSavingPass(false);
    }
  }

  // Deduplicate bot message keys across languages for editing
  const uniqueMessageKeys = Array.from(new Set((botMessages || []).map((m) => m.key)));

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] space-y-3">
        <div>
          <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#3B82F6]" />
            Operator Password
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Update your dashboard login password directly without waiting for email links.
          </p>
        </div>
        <form onSubmit={handleChangePassword} className="grid sm:grid-cols-3 gap-2.5">
          <input
            type="password"
            minLength={6}
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 6 chars)"
            className="px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg"
          />
          <input
            type="password"
            minLength={6}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg"
          />
          <button
            type="submit"
            disabled={savingPass}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {savingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#1E293B]">Business, Dispatch & Payment Settings</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Update operator alert phone (<code>923XXXXXXXXX</code>), payment accounts, and round-2 dispatch parameters.
          </p>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {(settings || []).map((s) => (
            <div key={s.key} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="sm:w-1/3">
                <div className="text-xs font-bold text-[#1E293B]">{s.key}</div>
                <div className="text-[11px] text-[#64748B]">{s.description}</div>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={settingValues[s.key] ?? ''}
                  onChange={(e) => setSettingValues({ ...settingValues, [s.key]: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg"
                />
                <button
                  type="button"
                  disabled={savingKey === `s:${s.key}`}
                  onClick={() => saveSetting(s.key)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#3B82F6]" />
              WhatsApp Bot Message Templates
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Select a language to edit or translate templates. Missing messages automatically fall back to Roman Urdu.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#64748B]">Language:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-[#E2E8F0] rounded-lg bg-white text-[#1E293B]"
            >
              {SUPPORTED_LANGS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {uniqueMessageKeys.map((k) => {
            const row = (botMessages || []).find((m) => m.key === k && (m.lang || 'roman_ur') === selectedLang);
            const desc = row?.description || (botMessages || []).find((m) => m.key === k)?.description;
            const isNativeReview = desc && desc.includes('NEEDS NATIVE REVIEW');

            return (
              <div key={k} className="p-4 rounded-xl bg-[#F4F8FD] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1E293B]">{k}</span>
                    {isNativeReview && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-300">
                        NEEDS NATIVE REVIEW
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-semibold text-[#64748B] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                      {selectedLang}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={savingKey === `m:${k}`}
                    onClick={() => saveMessage(k, desc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
                <div className="text-[11px] text-[#64748B]">{desc}</div>
                <textarea
                  rows={3}
                  value={msgValues[k] ?? ''}
                  onChange={(e) => setMsgValues({ ...msgValues, [k]: e.target.value })}
                  placeholder={`Enter ${selectedLang} translation (or leave empty to fall back to Roman Urdu)...`}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-white"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
