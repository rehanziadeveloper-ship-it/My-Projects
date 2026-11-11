import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { callDashboardAction } from '../lib/api';

export default function SettingsPage({ settings, botMessages, onRefresh, notify }) {
  const [settingValues, setSettingValues] = useState({});
  const [msgValues, setMsgValues] = useState({});
  const [savingKey, setSavingKey] = useState('');

  useEffect(() => {
    const sMap = {};
    for (const s of settings || []) sMap[s.key] = s.value ?? '';
    setSettingValues(sMap);
  }, [settings]);

  useEffect(() => {
    const mMap = {};
    for (const m of botMessages || []) mMap[m.key] = m.text ?? '';
    setMsgValues(mMap);
  }, [botMessages]);

  async function saveSetting(key) {
    setSavingKey(`s:${key}`);
    try {
      await callDashboardAction('update_settings', { key, value: settingValues[key] ?? '' });
      notify('success', `Setting "${key}" saved.`);
      await onRefresh();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setSavingKey('');
    }
  }

  async function saveMessage(key) {
    setSavingKey(`m:${key}`);
    try {
      await callDashboardAction('update_bot_messages', { key, text: msgValues[key] ?? '' });
      notify('success', `Bot template "${key}" saved.`);
      await onRefresh();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setSavingKey('');
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#1E293B]">Business, Dispatch & Payment Settings</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Update operator alert phone (`923XXXXXXXXX`), payment accounts (replace DEMO placeholders before launch), and dispatch timings.
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
        <div>
          <h2 className="text-sm font-bold text-[#1E293B]">WhatsApp Bot Message Templates</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Keep placeholders like <code>{'{booking_code}'}</code> intact when customizing messages.
          </p>
        </div>

        <div className="space-y-4">
          {(botMessages || []).map((m) => (
            <div key={m.key} className="p-4 rounded-xl bg-[#F4F8FD] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-[#1E293B]">{m.key}</div>
                  <div className="text-[11px] text-[#64748B]">{m.description}</div>
                </div>
                <button
                  type="button"
                  disabled={savingKey === `m:${m.key}`}
                  onClick={() => saveMessage(m.key)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
              <textarea
                rows={3}
                value={msgValues[m.key] ?? ''}
                onChange={(e) => setMsgValues({ ...msgValues, [m.key]: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-white"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
