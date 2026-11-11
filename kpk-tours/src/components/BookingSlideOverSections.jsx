import { CheckCircle2, ExternalLink, RefreshCcw, XCircle } from 'lucide-react';
import { formatPKR, formatPhoneDisplay } from '../lib/api';

export function BookingPaymentSection({
  booking,
  busy,
  receiptUrl,
  loadingReceipt,
  runAction,
}) {
  if (!booking.payment_id) return null;

  return (
    <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-[#64748B] uppercase">Advance Payment Receipt</div>
          <div className="text-sm font-semibold text-[#1E293B] mt-0.5">
            {formatPKR(booking.payment_amount)} · {String(booking.payment_method || '').toUpperCase()} · TXN{' '}
            {booking.payment_transaction_id || 'N/A'}
          </div>
        </div>
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-[#1E293B]">
          {booking.payment_status}
        </span>
      </div>

      {loadingReceipt && <p className="text-xs text-[#64748B]">Loading signed receipt image...</p>}
      {receiptUrl && (
        <div className="space-y-2">
          <img
            src={receiptUrl}
            alt="Payment Receipt"
            className="max-h-64 w-auto rounded-lg border border-[#E2E8F0] object-contain bg-slate-50"
          />
          <a
            href={receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#3B82F6] hover:underline"
          >
            Open full receipt <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {booking.payment_status === 'pending_confirmation' && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              runAction(
                'approve_payment',
                { payment_id: booking.payment_id },
                `Payment approved for ${booking.booking_code}.`
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Payment
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              runAction(
                'reject_payment',
                { payment_id: booking.payment_id, booking_id: booking.id },
                `Payment rejected for ${booking.booking_code}.`
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject Payment
          </button>
        </div>
      )}
    </div>
  );
}

export function BookingActionsSection({
  booking,
  busy,
  activeDrivers,
  selectedDriverId,
  setSelectedDriverId,
  showReschedForm,
  setShowReschedForm,
  showCancelForm,
  setShowCancelForm,
  reschedDate,
  setReschedDate,
  reschedEndDate,
  setReschedEndDate,
  reschedTime,
  setReschedTime,
  cancelReason,
  setCancelReason,
  runAction,
}) {
  return (
    <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-4">
      <div className="text-xs font-semibold text-[#64748B] uppercase">Dispatch & Booking Actions</div>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white"
        >
          <option value="">Select active driver...</option>
          {activeDrivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({formatPhoneDisplay(d.phone)}) · {d.rating}★ · {d.total_trips} trips
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={busy || !selectedDriverId}
          onClick={() =>
            runAction(
              'reassign_driver',
              { booking_id: booking.id, driver_id: Number(selectedDriverId) },
              'Dispatch offer sent to selected driver.'
            )
          }
          className="px-3.5 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
        >
          Assign Driver
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setShowReschedForm((v) => !v);
            setShowCancelForm(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#1E293B] hover:bg-[#F4F8FD] cursor-pointer"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Reschedule
        </button>
        <button
          type="button"
          onClick={() => {
            setShowCancelForm((v) => !v);
            setShowReschedForm(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-medium text-rose-700 hover:bg-rose-50 cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" /> Cancel Booking
        </button>
      </div>

      {showReschedForm && (
        <div className="p-3 rounded-lg bg-[#F4F8FD] border border-[#E2E8F0] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-[#64748B] mb-1">New Trip Date</label>
              <input
                type="date"
                value={reschedDate}
                onChange={(e) => setReschedDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#64748B] mb-1">End Date</label>
              <input
                type="date"
                value={reschedEndDate}
                onChange={(e) => setReschedEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#64748B] mb-1">Time</label>
              <input
                type="time"
                value={reschedTime}
                onChange={(e) => setReschedTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={busy || !reschedDate}
            onClick={() =>
              runAction(
                'reschedule_booking',
                {
                  booking_id: booking.id,
                  trip_date: reschedDate,
                  end_date: reschedEndDate || reschedDate,
                  trip_time: reschedTime.length === 5 ? `${reschedTime}:00` : reschedTime,
                },
                `Booking ${booking.booking_code} rescheduled.`
              )
            }
            className="px-3.5 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            Confirm Reschedule
          </button>
        </div>
      )}

      {showCancelForm && (
        <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-200 space-y-2">
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Cancellation reason (required)"
            className="w-full px-3 py-1.5 text-xs border border-rose-200 rounded-lg bg-white"
          />
          <button
            type="button"
            disabled={busy || !cancelReason.trim()}
            onClick={() =>
              runAction(
                'cancel_booking',
                { booking_id: booking.id, reason: cancelReason.trim() },
                `Booking ${booking.booking_code} cancelled.`
              )
            }
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            Confirm Cancellation
          </button>
        </div>
      )}
    </div>
  );
}
