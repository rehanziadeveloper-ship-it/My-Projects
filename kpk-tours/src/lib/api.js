import { supabase } from './supabase';

const ACTION_URL = import.meta.env.VITE_N8N_ACTION_URL;

export async function callDashboardAction(action, payload = {}) {
  const { data: { session }, error: sessErr } = await supabase.auth.getSession();
  if (sessErr || !session?.access_token) {
    throw new Error('Operator session expired. Please sign in again.');
  }
  if (!ACTION_URL) {
    throw new Error('Missing n8n action endpoint URL.');
  }

  const res = await fetch(ACTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });

  const json = await res.json().catch(() => ({ ok: false, error: 'Invalid server response' }));
  if (!res.ok || json.ok === false) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json;
}

export function formatPKR(amount) {
  const num = Number(amount || 0);
  return `PKR ${num.toLocaleString('en-PK')}`;
}

export function formatPhoneDisplay(raw) {
  if (!raw) return '—';
  const cleaned = String(raw).replace(/@.*$/, '');
  return cleaned;
}

export const STATUS_STYLES = {
  PENDING_PAYMENT: { label: 'Pending Payment', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  PAYMENT_VERIFIED: { label: 'Payment Verified', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  PENDING_DRIVER: { label: 'Pending Driver', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETED: { label: 'Completed', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  NO_DRIVER: { label: 'No Driver', cls: 'bg-red-50 text-red-700 border-red-200' },
};

export function getStatusBadge(status) {
  return STATUS_STYLES[status] || { label: status || 'Unknown', cls: 'bg-slate-100 text-slate-600 border-slate-200' };
}
