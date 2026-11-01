import React from 'react';
import { MapPin, Phone, Clock, AlertCircle } from 'lucide-react';
import type { Clinic } from '../types';

interface ContactSectionProps {
  clinic: Clinic;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ clinic }) => {
  const cleanDigits = clinic.phone.replace(/\D/g, '');
  const dialNumber = clinic.phone.startsWith('+')
    ? `+${cleanDigits}`
    : cleanDigits.startsWith('92')
      ? `+${cleanDigits}`
      : cleanDigits.startsWith('03')
        ? `+92${cleanDigits.slice(1)}`
        : `+92${cleanDigits}`;
  const cleanWa = clinic.whatsapp_number.replace(/\D/g, '');

  const schedule = [
    { day: 'Monday – Thursday', hours: '10:00 AM – 08:00 PM', note: 'Continuous appointments' },
    { day: 'Friday', hours: '10:00 AM – 08:00 PM', note: 'Break: 01:00 PM – 02:30 PM (Jumma Prayer)' },
    { day: 'Saturday', hours: '10:00 AM – 06:00 PM', note: 'Early evening close' },
    { day: 'Sunday', hours: 'Closed', note: 'Emergency on-call only' },
  ];

  return (
    <section id="contact" className="py-20 bg-clinic-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-clinic-primary">
            Visit Our Clinic
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-forest-800 tracking-tight">
            Convenient central location.{' '}
            <span className="font-serif italic font-normal text-clinic-primary">
              Ready to welcome you.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-clinic-muted">
            Easy parking, accessible elevator access, and a calm clinic environment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Clinic Contact Info & Hours */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Address Card */}
            <div className="p-7 rounded-3xl bg-white border border-clinic-border/80 shadow-soft flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-clinic-lightGreen text-clinic-primary flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-forest-800">Clinic Address</h3>
                <p className="text-sm text-forest-800/80 leading-relaxed">
                  {clinic.address}
                </p>
                <div className="pt-2">
                  <a
                    href={clinic.google_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-clinic-primary hover:underline"
                  >
                    <span>Open in Google Maps</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Calls & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white border border-clinic-border/80 shadow-soft space-y-2">
                <div className="flex items-center gap-2 text-clinic-primary">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Phone Calls</span>
                </div>
                <p className="text-lg font-bold text-forest-800 font-mono">
                  {clinic.phone}
                </p>
                <a
                  href={`tel:${dialNumber}`}
                  className="inline-block text-xs font-semibold text-clinic-primary hover:underline pt-1"
                >
                  Call Now →
                </a>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-clinic-border/80 shadow-soft space-y-2">
                <div className="flex items-center gap-2 text-[#25D366]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider">WhatsApp</span>
                </div>
                <p className="text-lg font-bold text-forest-800 font-mono">
                  {clinic.whatsapp_number}
                </p>
                <a
                  href={`https://wa.me/${cleanWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs font-semibold text-[#25D366] hover:underline pt-1"
                >
                  Message On WhatsApp →
                </a>
              </div>
            </div>

            {/* Emergency Hotline Banner */}
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="text-xs text-red-900">
                <span className="font-bold">Severe Dental Emergency?</span> We hold dedicated same-day triage slots for acute trauma, bleeding, and unbearable toothache.
              </div>
            </div>

          </div>

          {/* Working Hours Schedule Card */}
          <div className="lg:col-span-6 bg-white rounded-4xl p-8 border border-clinic-border/80 shadow-soft-lg space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-clinic-border/60">
              <div className="w-10 h-10 rounded-xl bg-clinic-lightGreen text-clinic-primary flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-forest-800">Weekly Clinical Hours</h3>
                <p className="text-xs text-clinic-muted">Pakistan Standard Time (Asia/Karachi, UTC+5)</p>
              </div>
            </div>

            <div className="space-y-4">
              {schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-clinic-border/40 last:border-0 gap-1"
                >
                  <div>
                    <span className="text-sm font-bold text-forest-800 block">
                      {item.day}
                    </span>
                    <span className="text-xs text-clinic-muted font-normal">
                      {item.note}
                    </span>
                  </div>

                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full self-start sm:self-auto ${
                      item.hours === 'Closed'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-clinic-lightGreen/50 text-forest-800'
                    }`}
                  >
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-clinic-bg border border-clinic-border text-xs text-clinic-muted leading-relaxed">
              <strong>Public Holidays:</strong> The clinic remains closed on Eid-ul-Fitr, Eid-ul-Adha, and declared national holidays. Pre-scheduled appointments receive advance notification.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
