import { useMemo, useState } from 'react';
import { CheckCircle2, Eye, X, XCircle } from 'lucide-react';
import { callDashboardAction, formatPKR } from '../lib/api';

export default function PaymentsPage({ payments, bookings, onRefresh, notify }) {
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);

  const bookingMap = useMemo(() => {
    const map = {};
    for (const b of bookings || []) map[b.id] = b;
    return map;
  }, [bookings]);

  const sorted = useMemo(() => {
    return (payments || [])
      .filter((p) => (filter === 'all' ? true : p.status === filter))
      .sort((a, b) => {
        if (a.status === 'pending_confirmation' && b.status !== 'pending_confirmation') return -1;
        if (b.status === 'pending_confirmation' && a.status !== 'pending_confirmation') return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [payments, filter]);

  async function viewReceipt(p) {
    if (!p.receipt_path) {
      notify('error', 'No receipt image stored for this payment.');
      return;
    }
    try {
      const res = await callDashboardAction('get_receipt_url', { path: p.receipt_path });
      setPreviewModal({ payment: p, url: res.signedUrl });
    } catch (err) {
      notify('error', err.message || 'Could not load signed receipt URL.');
    }
  }

  async function handleAction(action, payment) {
    setBusyId(payment.id);
    try {
      await callDashboardAction(action, { payment_id: payment.id, booking_id: payment.booking_id });
      notify('success', action === 'approve_payment' ? 'Payment approved & dispatch started.' : 'Payment rejected.');
      await onRefresh();
    } catch (err) {
      notify('error', err.message || 'Payment action failed.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Payments' },
          { id: 'pending_confirmation', label: 'Pending Review' },
          { id: 'verified', label: 'Verified' },
          { id: 'rejected', label: 'Rejected' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
              filter === f.id ? 'bg-[#3B82F6] text-white' : 'bg-[#F4F8FD] text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
            No payment receipts match this filter.
          </div>
        ) : (
          sorted.map((p) => {
            const b = bookingMap[p.booking_id];
            const isPending = p.status === 'pending_confirmation';
            return (
              <div
                key={p.id}
                className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#3B82F6]">{b?.booking_code || `Booking #${p.booking_id}`}</span>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                        isPending
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : p.status === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#1E293B]">
                    {formatPKR(p.amount)} · <span className="uppercase">{p.method || 'transfer'}</span> · TXN{' '}
                    {p.transaction_id || 'N/A'}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {b ? `${b.customer_name || 'Customer'} (${b.pickup} → ${b.destination})` : ''} ·{' '}
                    {new Date(p.created_at).toLocaleString()}
                    {p.verified_by ? ` · Reviewed by ${p.verified_by}` : ''}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {p.receipt_path && (
                    <button
                      type="button"
                      onClick={() => viewReceipt(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#1E293B] hover:bg-[#F4F8FD] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Receipt
                    </button>
                  )}
                  {isPending && (
                    <>
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => handleAction('approve_payment', p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => handleAction('reject_payment', p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm text-[#1E293B]">
                Payment Receipt · {formatPKR(previewModal.payment.amount)}
              </div>
              <button type="button" onClick={() => setPreviewModal(null)} className="p-1 text-[#64748B] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={previewModal.url}
              alt="Payment receipt screenshot"
              className="w-full max-h-[70vh] object-contain rounded-lg border border-[#E2E8F0] bg-slate-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
