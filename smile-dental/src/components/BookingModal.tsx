import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import type { Service, AvailableSlot } from '../types';
import { fetchAvailableSlots } from '../lib/supabase';
import { submitBooking, generateIcsCalendar } from '../lib/n8n';
import { formatPakistanDateTime } from '../lib/dictionary';
import { Link } from 'react-router-dom';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  initialService?: Service | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services,
  initialService,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 4 = Success
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Date selection (default today or tomorrow)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [consent, setConsent] = useState(true);
  const [honeypot, setHoneypot] = useState(''); // Anti-bot field

  // Status & Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
      setStep(2);
    } else if (services.length > 0 && !selectedService) {
      setSelectedService(services[0]);
    }
  }, [initialService, services]);

  // Load available slots whenever date or service changes
  useEffect(() => {
    if (step === 2 && selectedService && selectedDate) {
      loadSlots(selectedDate, selectedService.id);
    }
  }, [step, selectedDate, selectedService]);

  const loadSlots = async (dateStr: string, serviceId: string) => {
    setIsLoadingSlots(true);
    setErrorMessage(null);
    try {
      const slots = await fetchAvailableSlots(dateStr, serviceId);
      setAvailableSlots(slots);
      if (slots.length > 0) {
        setSelectedSlot(slots[0]);
      } else {
        setSelectedSlot(null);
      }
    } catch {
      setErrorMessage('Could not load slots for this date. Please try another date.');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Mask Pakistani phone number: 03XX-XXXXXXX
  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.length > 11) digits = digits.slice(0, 11);
    
    if (digits.length <= 4) {
      setPhone(digits);
    } else {
      setPhone(`${digits.slice(0, 4)}-${digits.slice(4)}`);
    }
  };

  // Handle Form Submission
  const handleSubmitBooking = async () => {
    setErrorMessage(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter a valid full name.');
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10 || cleanDigits.length > 11) {
      setErrorMessage('Please enter a valid Pakistani mobile number (03XX-XXXXXXX).');
      return;
    }

    if (!selectedSlot || !selectedService) {
      setErrorMessage('Please select a valid appointment slot.');
      return;
    }

    if (!consent) {
      setErrorMessage('Please agree to receive booking updates to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitBooking({
        name: fullName.trim(),
        phone: cleanDigits,
        service_id: selectedService.id,
        starts_at: selectedSlot.slot_start,
        reason: reason.trim() || undefined,
        language: 'en',
        honeypot: honeypot || undefined,
      });

      if (response.ok && response.data) {
        setBookingResult(response.data);
        setStep(4); // Success screen
      } else if (response.error?.code === 'slot_taken') {
        setErrorMessage('This slot was just booked by another patient! Refreshing free times below...');
        setStep(2);
        await loadSlots(selectedDate, selectedService.id);
      } else {
        setErrorMessage(response.error?.message || 'Booking could not be finalized. Please try again.');
      }
    } catch {
      setErrorMessage('Booking server network error. Please try again or call clinic.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Generate date options for the next 14 days
  const dateOptions = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const isSunday = d.getDay() === 0;
    const label = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return { iso, label, isSunday };
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-forest-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-4xl shadow-2xl border border-clinic-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Strip */}
        <div className="px-6 sm:px-8 py-5 border-b border-clinic-border/60 flex items-center justify-between bg-clinic-bg">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-clinic-primary">
              Step {step} of 3
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-forest-800">
              {step === 1 && 'Select Your Treatment'}
              {step === 2 && 'Choose Date & Available Time'}
              {step === 3 && 'Patient Details'}
              {step === 4 && 'Booking Confirmed'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-clinic-border hover:bg-clinic-lightGreen/40 flex items-center justify-center text-forest-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* STEP 1: CHOOSE SERVICE */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-clinic-muted">
                Please select the treatment you wish to receive from Dr. Zeeshan Ahmad:
              </p>

              <div className="grid grid-cols-1 gap-3">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedService?.id === svc.id
                        ? 'border-clinic-primary bg-clinic-lightGreen/30 shadow-xs'
                        : 'border-clinic-border hover:border-clinic-primary/40 bg-clinic-bg/40'
                    }`}
                  >
                    <div>
                      <h4 className="text-base font-bold text-forest-800">
                        {svc.name_en}
                      </h4>
                      <p className="text-xs text-clinic-muted mt-0.5">
                        {svc.description_en}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-medium text-forest-800/80">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-clinic-primary" />
                          {svc.duration_min} mins
                        </span>
                        {svc.price_from_pkr && (
                          <span className="font-semibold text-clinic-primary">
                            PKR {svc.price_from_pkr.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedService?.id === svc.id
                          ? 'border-clinic-primary bg-clinic-primary'
                          : 'border-clinic-border'
                      }`}
                    >
                      {selectedService?.id === svc.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE DATE & TIME */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-2">
                  Select Day (Next 14 Days)
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.iso}
                      disabled={opt.isSunday}
                      onClick={() => setSelectedDate(opt.iso)}
                      className={`flex-shrink-0 px-4 py-3 rounded-2xl text-xs font-semibold text-center transition-all ${
                        opt.isSunday
                          ? 'opacity-40 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedDate === opt.iso
                          ? 'bg-clinic-primary text-white shadow-soft'
                          : 'bg-clinic-bg text-forest-800 hover:bg-clinic-lightGreen/50 border border-clinic-border'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {opt.isSunday && <span className="block text-[10px]">Closed</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-forest-800">
                    Available Time Slots (Asia/Karachi PKT)
                  </label>
                  <span className="text-xs text-clinic-muted font-normal">
                    {selectedService?.duration_min} mins duration
                  </span>
                </div>

                {isLoadingSlots ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-11 rounded-xl skeleton-box" />
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-8 text-center bg-clinic-bg rounded-2xl border border-clinic-border">
                    <p className="text-sm font-medium text-forest-800">
                      No available slots on this day.
                    </p>
                    <p className="text-xs text-clinic-muted mt-1">
                      Doctor is fully booked or clinic is closed. Please pick another date above.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot?.slot_start === slot.slot_start;
                      return (
                        <button
                          key={slot.slot_start}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-clinic-primary text-white shadow-soft'
                              : 'bg-white hover:bg-clinic-lightGreen/40 border border-clinic-border text-forest-800'
                          }`}
                        >
                          {slot.slot_start_pkt}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: PATIENT DETAILS */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Selected Summary Card */}
              <div className="p-4 rounded-2xl bg-clinic-lightGreen/40 border border-clinic-primary/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-forest-800 block">{selectedService?.name_en}</span>
                  <span className="text-clinic-muted">{selectedSlot?.slot_start_pkt} • {selectedDate}</span>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-clinic-primary font-bold hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-forest-800 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-clinic-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Muhammad Rehan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-clinic-border focus:outline-none focus:ring-2 focus:ring-clinic-primary/40 text-sm text-forest-800"
                  />
                </div>
              </div>

              {/* Pakistani Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-forest-800 mb-1.5">
                  Pakistani Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-clinic-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-clinic-border focus:outline-none focus:ring-2 focus:ring-clinic-primary/40 text-sm text-forest-800 font-mono"
                  />
                </div>
                <p className="text-[11px] text-clinic-muted mt-1">
                  Format: 03XX-XXXXXXX (Confirmation & reminder link will be sent here)
                </p>
              </div>

              {/* Reason / Short Note */}
              <div>
                <label className="block text-xs font-bold text-forest-800 mb-1.5">
                  Symptoms or Reason for Visit (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Lower molar pain since 2 days, previous filling came loose..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-clinic-border focus:outline-none focus:ring-2 focus:ring-clinic-primary/40 text-sm text-forest-800"
                />
              </div>

              {/* Hidden Honeypot */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 rounded text-clinic-primary focus:ring-clinic-primary"
                />
                <label htmlFor="consent" className="text-xs text-forest-800/80 leading-relaxed">
                  I consent to Smile Dental Clinic storing my contact info for appointment reminders and agree to the{' '}
                  <Link to="/privacy" target="_blank" className="text-clinic-primary font-bold underline">
                    Privacy Policy
                  </Link>. No payment or credit card is required.
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && bookingResult && (
            <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-clinic-lightGreen text-clinic-primary flex items-center justify-center mx-auto shadow-soft">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-forest-800">
                  Appointment Confirmed!
                </h4>
                <p className="text-sm text-clinic-muted">
                  Your appointment has been registered in the clinic schedule with Dr. Zeeshan Ahmad.
                </p>
              </div>

              {/* Appointment Card */}
              <div className="p-6 rounded-3xl bg-clinic-bg border border-clinic-border/80 text-left space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-clinic-border/60">
                  <span className="text-xs text-clinic-muted uppercase font-bold">Treatment</span>
                  <span className="text-sm font-bold text-forest-800">{selectedService?.name_en}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-clinic-border/60">
                  <span className="text-xs text-clinic-muted uppercase font-bold">Date & Time</span>
                  <span className="text-sm font-bold text-clinic-primary font-mono">
                    {formatPakistanDateTime(bookingResult.starts_at || selectedSlot?.slot_start || '')}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-clinic-border/60">
                  <span className="text-xs text-clinic-muted uppercase font-bold">Doctor</span>
                  <span className="text-sm font-semibold text-forest-800">Dr. Zeeshan Ahmad</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-clinic-muted uppercase font-bold">Location</span>
                  <span className="text-xs text-forest-800 max-w-[200px] text-right">
                    Plot 14-B, Sector F-7 Markaz, Islamabad
                  </span>
                </div>
              </div>

              {/* WhatsApp Notification Note */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                📲 A confirmation message with full address has been sent to your WhatsApp number.
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    generateIcsCalendar({
                      title: `Smile Dental: ${selectedService?.name_en}`,
                      description: `Dental appointment with Dr. Zeeshan Ahmad at Smile Dental Clinic.`,
                      location: 'Plot 14-B, Sector F-7 Markaz, Islamabad, Pakistan',
                      startsAt: bookingResult.starts_at || selectedSlot?.slot_start,
                      endsAt: bookingResult.ends_at || selectedSlot?.slot_end,
                    });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold text-forest-800 bg-white border border-clinic-border hover:bg-clinic-lightGreen/40 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Add to Calendar (.ics)</span>
                </button>

                <Link
                  to={`/appointment/${bookingResult.manage_token}`}
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover shadow-soft"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Manage Appointment Link</span>
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {step < 4 && (
          <div className="px-6 sm:px-8 py-4 border-t border-clinic-border/60 bg-clinic-bg flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-forest-800 hover:bg-clinic-lightGreen/50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                disabled={step === 1 ? !selectedService : !selectedSlot}
                onClick={() => setStep((step + 1) as any)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover disabled:opacity-40 transition-all shadow-soft"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={isSubmitting || !fullName || !phone || !consent}
                onClick={handleSubmitBooking}
                className="flex items-center gap-2 px-8 py-3 rounded-full text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover disabled:opacity-40 transition-all shadow-soft"
              >
                {isSubmitting ? (
                  <span>Securing Slot...</span>
                ) : (
                  <>
                    <span>Confirm Booking</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
