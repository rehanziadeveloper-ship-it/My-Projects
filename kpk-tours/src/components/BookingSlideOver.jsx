import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  RefreshCcw,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { callDashboardAction, formatPKR, formatPhoneDisplay, getStatusBadge } from '../lib/api';

export default function BookingSlideOver({
  booking,
  drivers,
  events,
  conversations,
  onClose,
  onActionSuccess,
  notify,
}) {
  const [busy, setBusy] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [reschedDate, setReschedDate] = useState('');
  const [reschedEndDate, setReschedEndDate] = useState('');
  const [reschedTime, setReschedTime] = useState('09:00');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showReschedForm, setShowReschedForm] = useState(false);

  useEffect(() => {
    if (!booking) return;
    setSelectedDriverId(booking.driver_id ? String(booking.driver_id) : '');
    setReschedDate(booking.trip_date || '');
    setReschedEndDate(booking.end_date || booking.trip_date || '');
    setReschedTime((booking.trip_time || '09:00:00').slice(0, 5));
    setCancelReason('');
    setShowCancelForm(false);
    setShowReschedForm(false);
    setReceiptUrl('');

    if (booking.payment_receipt_path) {
      setLoadingReceipt(true);
      callDashboardAction('get_receipt_url', { path: booking.payment_receipt_path })
        .then((res) => setReceiptUrl(res.signedUrl || ''))
        .catch(() => setReceiptUrl(''))
        .finally(() => setLoadingReceipt(false));
    }
  }, [booking]);

  if (!booking) return null;

  const badge = getStatusBadge(booking.status);
  const bookingEvents = (events || []).filter((e) => e.booking_id === booking.id);
  const customerConvo = (conversations || []).find((c) => c.customer_id === booking.customer_id);
  const isTakeover = customerConvo?.state === 'TAKEOVER';
  const activeDrivers = (drivers || []).filter((d) => d.active);
  const canModify = !['CANCELLED', 'COMPLETED'].includes(booking.status);

  async function runAction(action, payload, successMsg) {
    setBusy(true);
    try {
      await callDashboardAction(action, payload);
      notify('success', successMsg);
      await onActionSuccess();
    } catch (err) {
      notify('error', err.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full shadow-xl border-l border-[#E2E8F0] flex flex-col z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-[#1E293B]">{booking.booking_code}</h2>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Created {new Date(booking.created_at).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Needs operator alert */}
          {(booking.needs_operator || isTakeover) && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {isTakeover
                    ? 'Customer is in Human Takeover mode (bot paused).'
                    : 'This booking requires operator review.'}
                </span>
              </div>
              {isTakeover && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    runAction('resume_bot', { customer_id: booking.customer_id }, 'WhatsApp bot resumed for customer.')
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#3B82F6] text-white text-xs font-semibold hover:bg-blue-600 cursor-pointer shrink-0"
                >
                  Resume Bot
                </button>
              )}
            </div>
          )}

          {/* Trip & Fare Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F4F8FD] p-4 rounded-xl border border-[#E2E8F0]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Route</span>
              </div>
              <div className="text-sm font-semibold text-[#1E293B]">
                {booking.pickup} → {booking.destination}
              </div>
              <div className="text-xs text-[#64748B]">
                {booking.return_trip ? 'Return Trip' : 'One-Way'} · {booking.passengers} passengers ·{' '}
                <span className="uppercase font-medium text-[#1E293B]">{booking.vehicle_type}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Schedule</span>
              </div>
              <div className="text-sm font-semibold text-[#1E293B]">
                {booking.trip_date}
                {booking.end_date && booking.end_date !== booking.trip_date ? ` to ${booking.end_date}` : ''}
              </div>
              <div className="text-xs text-[#64748B] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {String(booking.trip_time || '').slice(0, 5)} PKT
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]">
              <div className="text-xs text-[#64748B]">Total Fare</div>
              <div className="text-base font-bold text-[#1E293B]">{formatPKR(booking.fare_total)}</div>
            </div>
            <div className="pt-2 border-t border-[#E2E8F0]">
              <div className="text-xs text-[#64748B]">Advance (Paid / Required)</div>
              <div className="text-base font-bold text-[#1E293B]">
                {formatPKR(booking.advance_paid)} / {formatPKR(booking.advance_required)}
              </div>
            </div>
          </div>

          {/* Customer & Assigned Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#E2E8F0]">
              <div className="text-xs font-semibold text-[#64748B] uppercase mb-2">Customer</div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1E293B]">
                <User className="w-4 h-4 text-[#3B82F6]" />
                {booking.customer_name || 'Customer'}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1">
                <Phone className="w-3.5 h-3.5" />
                {formatPhoneDisplay(booking.customer_phone)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E2E8F0]">
              <div className="text-xs font-semibold text-[#64748B] uppercase mb-2">Assigned Driver & Vehicle</div>
              <div className="text-sm font-semibold text-[#1E293B]">
                {booking.driver_name || 'Unassigned'}
              </div>
              <div className="text-xs text-[#64748B] mt-1">
                {booking.driver_phone ? formatPhoneDisplay(booking.driver_phone) : 'No driver assigned'}
              </div>
              {booking.vehicle_model && (
                <div className="text-xs text-[#64748B] mt-1">
                  {booking.vehicle_model} ({booking.vehicle_plate})
                </div>
              )}
            </div>
          </div>

          {/* Payment Receipt Section */}
          {booking.payment_id && (
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
          )}

          {/* Operator Actions */}
          {canModify && (
            <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-4">
              <div className="text-xs font-semibold text-[#64748B] uppercase">Dispatch & Booking Actions</div>

              {/* Reassign Driver */}
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
                      `Dispatch offer sent to selected driver.`
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Assign Driver
                </button>
              </div>

              {/* Action buttons */}
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
          )}

          {/* Event Timeline */}
          <div>
            <div className="text-xs font-semibold text-[#64748B] uppercase mb-3">Booking Audit Timeline</div>
            {bookingEvents.length === 0 ? (
              <p className="text-xs text-[#64748B]">No events logged yet.</p>
            ) : (
              <div className="space-y-2.5">
                {bookingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg border border-[#E2E8F0] bg-white text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-[#1E293B]">{ev.event_type}</div>
                      <div className="text-[#64748B] mt-0.5">Actor: {ev.actor || 'system'}</div>
                    </div>
                    <div className="text-[11px] text-[#64748B] whitespace-nowrap">
                      {new Date(ev.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
