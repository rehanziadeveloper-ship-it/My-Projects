import React from 'react';
import { Calendar, Sparkles, ShieldCheck, HeartHandshake, Phone } from 'lucide-react';
import { MolarToothGraphic } from './MolarToothGraphic';

interface HeroProps {
  onOpenBooking: () => void;
  whatsappNumber?: string;
  phone?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenBooking,
  whatsappNumber = '+923001234567',
  phone = '+923001234567',
}) => {
  const cleanWa = whatsappNumber.replace(/\D/g, '');
  const cleanDigits = phone.replace(/\D/g, '');
  const dialNumber = phone.startsWith('+')
    ? `+${cleanDigits}`
    : cleanDigits.startsWith('92')
      ? `+${cleanDigits}`
      : cleanDigits.startsWith('03')
        ? `+92${cleanDigits.slice(1)}`
        : `+92${cleanDigits}`;

  return (
    <section id="hero" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline, sublines, CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-5 sm:space-y-7 z-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-clinic-lightGreen/60 border border-clinic-primary/20 shadow-xs">
              <Sparkles className="w-4 h-4 text-clinic-primary" />
              <span className="text-xs sm:text-sm font-semibold text-forest-800 tracking-wide">
                Specialized Gentle Dental Care in Pakistan
              </span>
            </div>

            {/* Main Headline with Serif Italic Accent */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-forest-800 leading-[1.12]">
              A healthier smile.{' '}
              <span className="font-serif italic font-normal text-clinic-primary block sm:inline">
                A more confident you.
              </span>
            </h1>

            {/* Two Short Sublines */}
            <div className="space-y-2 max-w-xl text-base sm:text-lg text-forest-800/80 leading-relaxed">
              <p>
                Experience painless dentistry with Dr. Zeeshan Ahmad. From routine cleanings to advanced root canals, we prioritize your long-term comfort.
              </p>
              <p className="text-sm sm:text-base text-clinic-muted font-normal">
                Transparent Pakistani pricing. Strict sterilization protocols. Zero waiting times.
              </p>
            </div>

            {/* Call to Actions (Mobile Friendly Layout) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-2">
              <button
                onClick={onOpenBooking}
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-base font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover shadow-soft-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
              </button>

              <a
                href={`https://wa.me/${cleanWa}?text=Assalam-o-Alaikum%20Smile%20Dental%20Clinic,%20I%20would%20like%20to%20book%20an%20appointment.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-full text-base font-semibold text-forest-800 bg-white hover:bg-clinic-lightGreen/30 border border-clinic-border shadow-soft transition-all duration-200"
              >
                <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WhatsApp Us</span>
              </a>

              {/* Direct Call Dialer */}
              <a
                href={`tel:${dialNumber}`}
                className="sm:hidden flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-clinic-primary bg-clinic-lightGreen/50"
              >
                <Phone className="w-4 h-4" />
                <span>Call Clinic Directly</span>
              </a>
            </div>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs sm:text-sm text-forest-800/80 font-medium border-t border-clinic-border/80 w-full">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-clinic-primary" />
                <span>Single-Doctor Dedicated Care</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-clinic-primary" />
                <span>English & Roman Urdu Support</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Molar Tooth Visual (No 3D Model Lag) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <MolarToothGraphic />
          </div>

        </div>
      </div>
    </section>
  );
};
