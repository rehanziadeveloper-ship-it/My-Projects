import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, ArrowUpRight } from 'lucide-react';
import type { Clinic, Service } from '../types';

interface FooterProps {
  clinic: Clinic;
  services: Service[];
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  clinic,
  services,
  onOpenBooking,
}) => {
  const currentYear = new Date().getFullYear();
  const cleanWa = clinic.whatsapp_number.replace(/\D/g, '');

  return (
    <footer className="bg-forest-900 text-white pt-16 pb-12 border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-forest-800">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="Smile Dental Clinic" className="w-10 h-10" />
              <div>
                <span className="font-bold text-xl text-white tracking-tight">
                  Smile Dental Clinic
                </span>
                <span className="block text-xs text-clinic-lightGreen/70">
                  Dr. Zeeshan Ahmad
                </span>
              </div>
            </Link>

            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              Dedicated single-doctor dental practice in Islamabad, Pakistan. Providing gentle root canals, composite restorations, scaling, and cosmetic smiles.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-forest-900 bg-clinic-lightGreen hover:bg-white transition-all shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Now</span>
              </button>

              <a
                href={clinic.google_review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-forest-800 hover:bg-forest-700 transition-all border border-forest-700"
              >
                <MessageSquare className="w-3.5 h-3.5 text-clinic-lightGreen" />
                <span>Leave a Google Review</span>
                <ArrowUpRight className="w-3 h-3 text-white/60" />
              </a>
            </div>
          </div>

          {/* Col 2: Services List */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-clinic-lightGreen">
              Dental Treatments
            </h4>
            <ul className="space-y-2 text-sm text-white/75">
              {services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/service/${service.slug || service.id}`}
                    className="hover:text-clinic-lightGreen transition-colors text-left block"
                  >
                    {service.name_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-clinic-lightGreen">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <a href="/#about" className="hover:text-clinic-lightGreen transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#why-us" className="hover:text-clinic-lightGreen transition-colors">
                  Why Choose Us
                </a>
              </li>
              <li>
                <a href="/#doctor" className="hover:text-clinic-lightGreen transition-colors">
                  Our Doctor
                </a>
              </li>
              <li>
                <a href="/#reviews" className="hover:text-clinic-lightGreen transition-colors">
                  Patient Reviews
                </a>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-clinic-lightGreen transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-clinic-lightGreen transition-colors text-xs text-white/50">
                  Staff Login (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-clinic-lightGreen">
              Clinic Contact
            </h4>
            <div className="text-sm text-white/75 space-y-2">
              <p>{clinic.address}</p>
              <a
                href={`tel:${clinic.phone}`}
                className="font-mono text-white font-semibold hover:text-clinic-lightGreen block transition-colors"
              >
                Phone: {clinic.phone}
              </a>
              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:underline"
              >
                <span>WhatsApp: {clinic.whatsapp_number}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <div className="pt-2 text-xs text-clinic-lightGreen/70">
                Mon - Sat: 10:00 AM – 08:00 PM<br />
                Friday Break: 01:00 PM – 02:30 PM (Jumma)
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© {currentYear} Smile Dental Clinic. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy & Patient Consent
            </Link>
            <Link to="/insurance" className="hover:text-white transition-colors">
              Insurance Guide
            </Link>
            <span>Asia/Karachi (PKT)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
