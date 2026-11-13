import { useState } from 'react';
import { MapPin, Pencil, Plus, Power, Trash2, X } from 'lucide-react';
import { callDashboardAction, formatPKR } from '../lib/api';

const VEHICLE_TYPES = ['corolla', 'revo', 'hiace', 'coaster'];

export default function RoutesFaresPage({ routes, fareRules, onRefresh, notify }) {
  const [routeModal, setRouteModal] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState(null);
  const [routeForm, setRouteForm] = useState({
    origin: 'Peshawar',
    destination: '',
    distance_km: '',
    duration_hours: '',
    active: true,
  });

  const [fareModal, setFareModal] = useState(false);
  const [editingFareId, setEditingFareId] = useState(null);
  const [fareForm, setFareForm] = useState({
    route_id: '',
    vehicle_type: 'corolla',
    one_way_fare: '',
    return_fare: '',
  });
  const [busy, setBusy] = useState(false);

  function openNewRoute() {
    setEditingRouteId(null);
    setRouteForm({ origin: 'Peshawar', destination: '', distance_km: '', duration_hours: '', active: true });
    setRouteModal(true);
  }

  function openEditRoute(r) {
    setEditingRouteId(r.id);
    setRouteForm({
      origin: r.origin || '',
      destination: r.destination || '',
      distance_km: r.distance_km ?? '',
      duration_hours: r.duration_hours ?? '',
      active: Boolean(r.active),
    });
    setRouteModal(true);
  }

  function openNewFare(routeId) {
    setEditingFareId(null);
    setFareForm({ route_id: String(routeId), vehicle_type: 'corolla', one_way_fare: '', return_fare: '' });
    setFareModal(true);
  }

  function openEditFare(rule) {
    setEditingFareId(rule.id);
    setFareForm({
      route_id: String(rule.route_id),
      vehicle_type: rule.vehicle_type,
      one_way_fare: String(rule.one_way_fare),
      return_fare: String(rule.return_fare),
    });
    setFareModal(true);
  }

  async function saveRoute(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await callDashboardAction('manage_route', {
        op: editingRouteId ? 'update' : 'create',
        id: editingRouteId || undefined,
        data: {
          origin: routeForm.origin.trim(),
          destination: routeForm.destination.trim(),
          distance_km: routeForm.distance_km ? Number(routeForm.distance_km) : null,
          duration_hours: routeForm.duration_hours ? Number(routeForm.duration_hours) : null,
          active: Boolean(routeForm.active),
        },
      });
      notify('success', editingRouteId ? 'Route updated.' : 'Route created.');
      setRouteModal(false);
      await onRefresh();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleRouteActive(r) {
    setBusy(true);
    try {
      await callDashboardAction('manage_route', {
        op: 'update',
        id: r.id,
        data: { active: !r.active },
      });
      notify('success', `Route ${!r.active ? 'activated' : 'deactivated'}.`);
      await onRefresh();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveFare(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await callDashboardAction('manage_fare_rule', {
        op: editingFareId ? 'update' : 'create',
        id: editingFareId || undefined,
        data: {
          route_id: Number(fareForm.route_id),
          vehicle_type: fareForm.vehicle_type,
          one_way_fare: Number(fareForm.one_way_fare),
          return_fare: Number(fareForm.return_fare),
        },
      });
      notify('success', editingFareId ? 'Fare rule updated.' : 'Fare rule added.');
      setFareModal(false);
      await onRefresh();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteFare(id) {
    setBusy(true);
    try {
      await callDashboardAction('manage_fare_rule', { op: 'delete', id });
      notify('success', 'Fare rule deleted.');
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
        <p className="text-xs text-[#64748B]">Configure routes and per-vehicle PKR one-way / return fares used in WhatsApp quotes.</p>
        <button
          type="button"
          onClick={openNewRoute}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Route
        </button>
      </div>

      <div className="space-y-4">
        {(routes || []).map((r) => {
          const rules = (fareRules || []).filter((f) => f.route_id === r.id);
          return (
            <div key={r.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E0EEFF] text-[#3B82F6] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1E293B]">
                        {r.origin} → {r.destination}
                      </span>
                      {r.notes && r.notes.includes('[PLACEHOLDER]') && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-300">
                          PLACEHOLDER
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                          r.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-[#64748B] border-slate-200'
                        }`}
                      >
                        {r.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B] mt-0.5">
                      {r.distance_km ? `${r.distance_km} km` : 'Distance N/A'} ·{' '}
                      {r.duration_hours ? `${r.duration_hours} hrs` : 'Duration N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openNewFare(r.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#E0EEFF] text-[#3B82F6] text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Fare
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditRoute(r)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#1E293B] hover:bg-[#F4F8FD] cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleRouteActive(r)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#1E293B] hover:bg-[#F4F8FD] cursor-pointer"
                  >
                    <Power className="w-3 h-3" /> {r.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>

              <div className="p-4">
                {rules.length === 0 ? (\n                  <p className=\"text-xs text-[#64748B]\">No vehicle fares configured for this route yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {rules.map((rule) => (
                      <div key={rule.id} className="p-3 rounded-lg bg-[#F4F8FD] border border-[#E2E8F0] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="uppercase text-xs font-bold text-[#1E293B]">{rule.vehicle_type}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditFare(rule)}
                              className="p-1 text-[#64748B] hover:text-[#3B82F6] cursor-pointer"
                              title="Edit fare"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => deleteFare(rule.id)}
                              className="p-1 text-[#64748B] hover:text-rose-600 cursor-pointer"
                              title="Delete fare"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-[#64748B]">
                          One-Way: <span className="font-semibold text-[#1E293B]">{formatPKR(rule.one_way_fare)}</span>
                        </div>
                        <div className="text-xs text-[#64748B]">
                          Return: <span className="font-semibold text-[#1E293B]">{formatPKR(rule.return_fare)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {routeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E293B]">{editingRouteId ? 'Edit Route' : 'Add Route'}</h3>
              <button type="button" onClick={() => setRouteModal(false)} className="p-1 text-[#64748B] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveRoute} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">Origin</label>
                <input
                  required
                  value={routeForm.origin}
                  onChange={(e) => setRouteForm({ ...routeForm, origin: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">Destination</label>
                <input
                  required
                  value={routeForm.destination}
                  onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1E293B] mb-1">Distance (km)</label>
                  <input
                    type="number"
                    value={routeForm.distance_km}
                    onChange={(e) => setRouteForm({ ...routeForm, distance_km: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1E293B] mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={routeForm.duration_hours}
                    onChange={(e) => setRouteForm({ ...routeForm, duration_hours: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#1E293B]">
                <input
                  type="checkbox"
                  checked={routeForm.active}
                  onChange={(e) => setRouteForm({ ...routeForm, active: e.target.checked })}
                />
                Active route
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRouteModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-xs font-semibold hover:bg-blue-600 cursor-pointer"
                >
                  {busy ? 'Saving...' : 'Save Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {fareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E293B]">{editingFareId ? 'Edit Fare Rule' : 'Add Fare Rule'}</h3>
              <button type="button" onClick={() => setFareModal(false)} className="p-1 text-[#64748B] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveFare} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">Vehicle Type</label>
                <select
                  value={fareForm.vehicle_type}
                  onChange={(e) => setFareForm({ ...fareForm, vehicle_type: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white uppercase"
                >
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1E293B] mb-1">One-Way Fare (PKR)</label>
                  <input
                    required
                    type="number"
                    min="100"
                    value={fareForm.one_way_fare}
                    onChange={(e) => setFareForm({ ...fareForm, one_way_fare: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1E293B] mb-1">Return Fare (PKR)</label>
                  <input
                    required
                    type="number"
                    min="100"
                    value={fareForm.return_fare}
                    onChange={(e) => setFareForm({ ...fareForm, return_fare: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFareModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-xs font-semibold hover:bg-blue-600 cursor-pointer"
                >
                  {busy ? 'Saving...' : 'Save Fare'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
