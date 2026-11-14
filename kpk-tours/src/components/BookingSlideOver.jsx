import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Calendar, Clock, ExternalLink, MapPin, Phone, Star, User, X } from 'lucide-react';
import { callDashboardAction, formatPKR, formatPhoneDisplay, getStatusBadge } from '../lib/api';
import { BookingActionsSection, BookingPaymentSection } from './BookingSlideOverSections';

function formatMinutesAgo(dateStr) {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (diffMs < 0) return 'Just now';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

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

  const bookingEvents = useMemo(() => {
    if (!booking) return [];
    return (events || []).filter((e) => e.booking_id === booking.id);
  }, [events, booking]);

  const lastDriverUpdate = useMemo(() => {
    if (!bookingEvents.length) return null;
    const driverEvts = bookingEvents.filter(
      (e) =>
        e.actor === 'driver' ||
        ['DRIVER_EN_ROUTE', 'DRIVER_PICKUP_CONFIRMED', 'DRIVER_ARRIVED_DESTINATION', 'TRIP_COMPLETED', 'DRIVER_LOCATION_SHARED', 'DRIVER_LOCATION_RECEIVED'].includes(e.event_type)
    );
    if (!driverEvts.length) return null;
    return driverEvts[0];
  }, [bookingEvents]);

  if (!booking) return null;

  const badge = getStatusBadge(booking.status);
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
              {booking.customer_language && (
                <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                  {booking.customer_language}
                </span>
              )}
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
                <span>Route & Passengers</span>
              </div>
              <div className="text-sm font-semibold text-[#1E293B]">
                {booking.pickup} → {booking.destination}
              </div>
              <div className="text-xs text-[#64748B]">
                {booking.return_trip ? 'Return Trip' : 'One-Way'} · {booking.passengers} passengers · Saaman:{' '}
                <span className="font-semibold text-[#1E293B]">{booking.luggage || 'N/A'}</span> ·{' '}
                <span className="uppercase font-semibold text-[#1E293B]">{booking.vehicle_type}</span>
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
                  ? ` → Return: ${booking.end_date}`
                  : ''}
              </div>
              <div className="text-xs text-[#64748B] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {String(booking.trip_time || '').slice(0, 5)} PKT
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]">
              <div className="text-xs text-[#64748B] flex items-center gap-1.5">
                Total Locked Fare
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-mono">locked</span>
              </div>
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
              {booking.customer_rating && (
                <div className="mt-2 pt-2 border-t border-[#E2E8F0] flex items-center gap-1 text-xs text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Customer Rating: {booking.customer_rating} / 5
                </div>
              )}
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
              {lastDriverUpdate && (
                <div className="mt-2 pt-2 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
                  Last driver update:{' '}
                  <span className="font-semibold text-[#1E293B]">
                    {formatMinutesAgo(lastDriverUpdate.created_at)}
                  </span>{' '}
                  ({lastDriverUpdate.event_type.replace(/_/g, ' ')})
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

          {/* Trip Status & Audit Timeline */}
          <div>
            <div className="text-xs font-semibold text-[#64748B] uppercase mb-3 flex items-center justify-between">
              <span>Trip Status & Audit Timeline</span>
              <span className="text-[11px] font-normal lowercase">{bookingEvents.length} events logged</span>
            </div>
            {bookingEvents.length === 0 ? (
              <p className="text-xs text-[#64748B]">No events logged yet.</p>
            ) : (
              <div className="space-y-2.5">
                {bookingEvents.map((ev) => {
                  const details = ev.details || {};
                  const isMapLink = details.map_url || (typeof details.lat === 'number' && typeof details.lng === 'number');
                  const mapUrl = details.map_url || (isMapLink ? `https://www.google.com/maps?q=${details.lat},${details.lng}` : null);
                  const isOperatorSkipped = ev.event_type === 'OPERATOR_ALERT_SKIPPED';

                  return (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                        isOperatorSkipped
                          ? 'border-amber-200 bg-amber-50/50'
                          : 'border-[#E2E8F0] bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#1E293B] flex items-center gap-1.5">
                            {ev.event_type}
                            {isOperatorSkipped && (
                              <span className="px-1.5 py-0.2 text-[10px] font-bold text-amber-800 bg-amber-100 rounded">
                                DEMO SKIPPED
                              </span>
                            )}
                          </div>
                          <div className="text-[#64748B] mt-0.5">
                            Actor: <span className="font-medium text-[#1E293B]">{ev.actor || 'system'}</span>
                            {booking.driver_name && (ev.actor === 'driver' || ev.event_type.startsWith('DRIVER_')) && (
                              <span> · Driver: {booking.driver_name}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-[11px] text-[#64748B] whitespace-nowrap">
                          {new Date(ev.created_at).toLocaleString()}
                        </div>
                      </div>

                      {/* Map link for shared locations */}
                      {mapUrl && (
                        <div className="pt-1">
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3B82F6] hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-200"
                          >
                            <MapPin className="w-3 h-3 text-[#3B82F6]" />
                            View Shared Location on Google Maps <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Details snippet */}
                      {details && Object.keys(details).length > 0 && !mapUrl && (
                        <div className="text-[11px] text-[#64748B] font-mono bg-slate-50 p-1.5 rounded border border-slate-200 truncate">
                          {JSON.stringify(details)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
