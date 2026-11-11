import { useEffect, useState } from 'react';
import { AlertTriangle, Calendar, Clock, MapPin, Phone, User, X } from 'lucide-react';
import { callDashboardAction, formatPKR, formatPhoneDisplay, getStatusBadge } from '../lib/api';
import { BookingActionsSection, BookingPaymentSection } from './BookingSlideOverSections';

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
                {booking.return_trip ? 'Return Trip' : 'One-Way'} · {booking.passengers} passengers · Saaman:{' '}
                <span className="font-medium text-[#1E293B]">{booking.luggage || 'N/A'}</span> ·{' '}
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
                {booking.return_trip && booking.end_date && booking.end_date !== booking.trip_date
                  ? ` → Wapsi: ${booking.end_date}`
                  : ''}
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
                {formatPhoneDisplay(booking.customer_contact_number || booking.customer_phone)}
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

          <BookingPaymentSection
            booking={booking}
            busy={busy}
            receiptUrl={receiptUrl}
            loadingReceipt={loadingReceipt}
            runAction={runAction}
          />

          {canModify && (
            <BookingActionsSection
              booking={booking}
              busy={busy}
              activeDrivers={activeDrivers}
              selectedDriverId={selectedDriverId}
              setSelectedDriverId={setSelectedDriverId}
              showReschedForm={showReschedForm}
              setShowReschedForm={setShowReschedForm}
              showCancelForm={showCancelForm}
              setShowCancelForm={setShowCancelForm}
              reschedDate={reschedDate}
              setReschedDate={setReschedDate}
              reschedEndDate={reschedEndDate}
              setReschedEndDate={setReschedEndDate}
              reschedTime={reschedTime}
              setReschedTime={setReschedTime}
              cancelReason={cancelReason}
              setCancelReason={setCancelReason}
              runAction={runAction}
            />
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
