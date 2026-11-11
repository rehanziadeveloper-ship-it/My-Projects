import { useState } from 'react';
import { Pencil, Plus, Power, Star, X } from 'lucide-react';
import { callDashboardAction, formatPhoneDisplay } from '../lib/api';

const EMPTY_FORM = { name: '', phone: '', rating: '5.0', active: true };

export default function DriversPage({ drivers, onRefresh, notify }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(driver) {
    setEditingId(driver.id);
    setForm({
      name: driver.name || '',
      phone: driver.phone || '',
      rating: String(driver.rating ?? 5.0),
      active: Boolean(driver.active),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, ''),
        rating: Number(form.rating || 5.0),
        active: Boolean(form.active),
      };
      await callDashboardAction('manage_driver', {
        op: editingId ? 'update' : 'create',
        id: editingId || undefined,
        data: payload,
      });
      notify('success', editingId ? 'Driver updated.' : 'Driver added.');
      setModalOpen(false);
      await onRefresh();
    } catch (err) {
      notify('error', err.message || 'Failed to save driver.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(driver) {
    setBusy(true);
    try {
      await callDashboardAction('manage_driver', {
        op: 'update',
        id: driver.id,
        data: { active: !driver.active },
      });
      notify('success', `Driver ${!driver.active ? 'activated' : 'deactivated'}.`);
      await onRefresh();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#64748B]">
          Active drivers receive WhatsApp dispatch requests ranked by rating then fewest trips.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(drivers || []).map((d) => (
          <div key={d.id} className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-sm text-[#1E293B]">{d.name}</div>
                <div className="text-xs text-[#64748B] mt-0.5">{formatPhoneDisplay(d.phone)}</div>
              </div>
              <span
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                  d.active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-[#64748B] border-slate-200'
                }`}
              >
                {d.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
              <span className="inline-flex items-center gap-1 font-semibold text-[#1E293B]">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> {Number(d.rating || 5).toFixed(1)}
              </span>
              <span>{d.total_trips || 0} completed trips</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => openEdit(d)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#1E293B] hover:bg-[#F4F8FD] cursor-pointer"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => toggleActive(d)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#1E293B] hover:bg-[#F4F8FD] cursor-pointer"
              >
                <Power className="w-3 h-3" /> {d.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E293B]">{editingId ? 'Edit Driver' : 'Add Driver'}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1 text-[#64748B] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">WhatsApp Phone (923XXXXXXXXX)</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="923001234567"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">Rating (1.0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-[#1E293B]">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Active for dispatch
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-xs font-semibold hover:bg-blue-600 cursor-pointer disabled:opacity-50"
                >
                  {busy ? 'Saving...' : 'Save Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
