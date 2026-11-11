import { useState } from 'react';
import { Car, Pencil, Plus, Power, X } from 'lucide-react';
import { callDashboardAction } from '../lib/api';

const VEHICLE_TYPES = ['corolla', 'revo', 'hiace', 'coaster'];
const EMPTY_FORM = { type: 'corolla', model: '', plate_no: '', seats: 4, driver_id: '', active: true };

export default function FleetPage({ vehicles, drivers, onRefresh, notify }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const driverName = (id) => (drivers || []).find((d) => d.id === id)?.name || 'Unassigned';

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(v) {
    setEditingId(v.id);
    setForm({
      type: v.type || 'corolla',
      model: v.model || '',
      plate_no: v.plate_no || '',
      seats: v.seats || 4,
      driver_id: v.driver_id ? String(v.driver_id) : '',
      active: Boolean(v.active),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        type: form.type,
        model: form.model.trim(),
        plate_no: form.plate_no.trim(),
        seats: Number(form.seats || 4),
        driver_id: form.driver_id ? Number(form.driver_id) : null,
        active: Boolean(form.active),
      };
      await callDashboardAction('manage_vehicle', {
        op: editingId ? 'update' : 'create',
        id: editingId || undefined,
        data: payload,
      });
      notify('success', editingId ? 'Vehicle updated.' : 'Vehicle added.');
      setModalOpen(false);
      await onRefresh();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(v) {
    setBusy(true);
    try {
      await callDashboardAction('manage_vehicle', {
        op: 'update',
        id: v.id,
        data: { active: !v.active },
      });
      notify('success', `Vehicle ${!v.active ? 'activated' : 'deactivated'}.`);
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
        <p className="text-xs text-[#64748B]">Manage fleet vehicles, seating capacities, and default driver assignments.</p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(vehicles || []).map((v) => (
          <div key={v.id} className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#E0EEFF] text-[#3B82F6] flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1E293B]">{v.model}</div>
                  <div className="text-xs text-[#64748B]">
                    <span className="uppercase font-semibold">{v.type}</span> · {v.plate_no}
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                  v.active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-[#64748B] border-slate-200'
                }`}
              >
                {v.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="text-xs text-[#64748B] flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
              <span>{v.seats} seats</span>
              <span>Driver: {driverName(v.driver_id)}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => openEdit(v)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#1E293B] hover:bg-[#F4F8FD] cursor-pointer"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => toggleActive(v)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#1E293B] hover:bg-[#F4F8FD] cursor-pointer"
              >
                <Power className="w-3 h-3" /> {v.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E293B]">{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1 text-[#64748B] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">Vehicle Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white uppercase"
                >
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">Model</label>
                <input
                  required
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="Toyota Corolla 2022"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1E293B] mb-1">Plate Number</label>
                  <input
                    required
                    value={form.plate_no}
                    onChange={(e) => setForm({ ...form, plate_no: e.target.value })}
                    placeholder="PEW-4521"
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1E293B] mb-1">Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={form.seats}
                    onChange={(e) => setForm({ ...form, seats: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">Default Driver</label>
                <select
                  value={form.driver_id}
                  onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
                >
                  <option value="">None</option>
                  {(drivers || []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#1E293B]">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Active in fleet
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
                  {busy ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
