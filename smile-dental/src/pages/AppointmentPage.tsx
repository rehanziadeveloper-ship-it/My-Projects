import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Download, RotateCcw } from 'lucide-react';
import { fetchAppointmentByToken, cancelAppointment, rescheduleAppointment, generateIcsCalendar } from '../lib/n8n';
import { fetchAvailableSlots } from '../lib/supabase';
import { formatPakistanDateTime } from '../lib/dictionary';
import type { AvailableSlot } from '../types';

export const AppointmentPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (token) {
      loadAppointment(token);
    }
  }, [token]);

  const loadAppointment = async (manageToken: string) => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await fetchAppointmentByToken(manageToken);
      if (res.ok && res.data) {
        setAppointment(res.data);
      } else {
        setActionError(res.error?.message || 'Appointment not found. Please verify your link or contact the clinic.');
        setAppointment(null);
      }
    } catch {
      setActionError('Unable to load appointment details. Please check your link or contact the clinic.');
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  // Load slots for reschedule date
  useEffect(() => {
    if (isRescheduling && appointment?.service_id) {
      setLoadingSlots(true);
      fetchAvailableSlots(rescheduleDate, appointment.service_id)
        .then((slots) => {
          setAvailableSlots(slots);
          if (slots.length > 0) setSelectedSlot(slots[0]);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [isRescheduling, rescheduleDate, appointment]);

  const handleCancel = async () => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to cancel this dental appointment?')) return;

    setCancelling(true);
    setActionError(null);
    try {
      const res = await cancelAppointment(token);
      if (res.ok) {
        setActionSuccess('Your appointment has been cancelled successfully.');
        setAppointment((prev: any) => ({ ...prev, status: 'cancelled' }));
      } else {
        setActionError(res.error?.message || 'Could not cancel appointment.');
      }
    } catch {
      setActionError('Network error while cancelling. Please call clinic directly.');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!token || !selectedSlot) return;

    setSubmittingReschedule(true);
    setActionError(null);
    try {
      const res = await rescheduleAppointment(token, selectedSlot.slot_start);
      if (res.ok) {
        setActionSuccess('Appointment rescheduled successfully!');
        setIsRescheduling(false);
        setAppointment((prev: any) => ({
          ...prev,
          starts_at: selectedSlot.slot_start,
          ends_at: selectedSlot.slot_end,
          status: 'booked',
        }));
      } else {
        setActionError(res.error?.message || 'Failed to reschedule. That slot might have been taken.');
      }
    } catch {
      setActionError('Network error while rescheduling. Please try another slot.');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-clinic-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-3xl border border-clinic-border shadow-soft space-y-4">
          <div className="h-6 w-32 skeleton-box rounded-lg" />
          <div className="h-12 w-full skeleton-box rounded-xl" />
          <div className="h-24 w-full skeleton-box rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-clinic-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-clinic-border shadow-soft text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-forest-800">Appointment Not Found</h2>
          <p className="text-sm text-clinic-muted">
            The manage link appears to be invalid or expired.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover shadow-soft"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Clinic Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = appointment.status === 'cancelled';
  const isCompleted = appointment.status === 'completed';

  return (
    <div className="min-h-screen bg-clinic-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-clinic-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Smile Dental Clinic</span>
        </Link>

        {/* Card Header */}
        <div className="bg-white rounded-4xl p-6 sm:p-8 border border-clinic-border shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-clinic-border/60 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-clinic-primary">
                Patient Self-Service Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-forest-800">
                Your Appointment
              </h1>
              <p className="text-xs text-clinic-muted mt-0.5">
                Manage your visit with Dr. Zeeshan Ahmad without needing an account.
              </p>
            </div>

            {/* Status Badge */}
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
                appointment.status === 'booked'
                  ? 'bg-clinic-lightGreen text-forest-800'
                  : appointment.status === 'confirmed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : appointment.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Status: {appointment.status}
            </span>
          </div>

          {/* Feedback Messages */}
          {actionError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Appointment Details Grid */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-clinic-bg border border-clinic-border/70 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-clinic-primary flex-shrink-0" />
              <div>
                <span className="text-[11px] text-clinic-muted uppercase font-bold block">
                  Scheduled Time (Asia/Karachi PKT)
                </span>
                <span className="text-base font-bold text-forest-800">
                  {formatPakistanDateTime(appointment.starts_at)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-clinic-bg border border-clinic-border/70 flex items-center gap-3">
                <Clock className="w-5 h-5 text-clinic-primary flex-shrink-0" />
                <div>
                  <span className="text-[11px] text-clinic-muted uppercase font-bold block">
                    Treatment
                  </span>
                  <span className="text-sm font-semibold text-forest-800">
                    {appointment.service_name || 'Dental Consultation'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-clinic-bg border border-clinic-border/70 flex items-center gap-3">
                <User className="w-5 h-5 text-clinic-primary flex-shrink-0" />
                <div>
                  <span className="text-[11px] text-clinic-muted uppercase font-bold block">
                    Patient Name
                  </span>
                  <span className="text-sm font-semibold text-forest-800">
                    {appointment.patient_name || 'Registered Patient'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-clinic-bg border border-clinic-border/70 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-clinic-primary flex-shrink-0" />
              <div>
                <span className="text-[11px] text-clinic-muted uppercase font-bold block">
                  Clinic Location
                </span>
                <span className="text-sm font-medium text-forest-800">
                  {appointment.clinic_address || 'Plot 14-B, Sector F-7 Markaz, Islamabad, Pakistan'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Add to Calendar, Reschedule, Cancel */}
          {!isCancelled && !isCompleted && !isRescheduling && (
            <div className="pt-4 border-t border-clinic-border/60 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  generateIcsCalendar({
                    title: `Smile Dental: ${appointment.service_name || 'Appointment'}`,
                    description: `Dental visit with Dr. Zeeshan Ahmad`,
                    location: 'Plot 14-B, Sector F-7 Markaz, Islamabad, Pakistan',
                    startsAt: appointment.starts_at,
                    endsAt: appointment.ends_at,
                  });
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-full text-xs font-semibold text-forest-800 bg-white border border-clinic-border hover:bg-clinic-lightGreen/40 flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Add to Calendar (.ics)</span>
              </button>

              <button
                onClick={() => setIsRescheduling(true)}
                className="w-full sm:flex-1 py-3 px-4 rounded-full text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover flex items-center justify-center gap-2 shadow-soft transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reschedule</span>
              </button>

              <button
                disabled={cancelling}
                onClick={handleCancel}
                className="w-full sm:w-auto py-3 px-6 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>{cancelling ? 'Cancelling...' : 'Cancel'}</span>
              </button>
            </div>
          )}

          {/* Reschedule Inline Interface */}
          {isRescheduling && (
            <div className="pt-6 border-t border-clinic-border/60 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-forest-800">
                  Select New Date & Time
                </h3>
                <button
                  onClick={() => setIsRescheduling(false)}
                  className="text-xs text-clinic-muted hover:underline"
                >
                  Cancel Reschedule
                </button>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full sm:w-64 px-4 py-2 rounded-xl border border-clinic-border text-sm"
                />
              </div>

              {/* Slots */}
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-2">
                  Available Slots
                </label>
                {loadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-10 skeleton-box rounded-xl" />
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs text-clinic-muted">No free slots on this date. Please pick another day.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.slot_start}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                          selectedSlot?.slot_start === slot.slot_start
                            ? 'bg-clinic-primary text-white border-clinic-primary'
                            : 'bg-white hover:bg-clinic-lightGreen/40 border-clinic-border text-forest-800'
                        }`}
                      >
                        {slot.slot_start_pkt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  disabled={submittingReschedule || !selectedSlot}
                  onClick={handleConfirmReschedule}
                  className="py-3 px-6 rounded-full text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover disabled:opacity-40 transition-colors shadow-soft"
                >
                  {submittingReschedule ? 'Rescheduling...' : 'Confirm New Time'}
                </button>
                <button
                  onClick={() => setIsRescheduling(false)}
                  className="py-3 px-4 rounded-full text-xs font-semibold text-forest-800 hover:bg-clinic-lightGreen/40"
                >
                  Keep Current Time
                </button>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              This appointment has been cancelled. If you need dental care, please schedule a new appointment from our homepage.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
