import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Tag, ExternalLink } from 'lucide-react';
import type { Service } from '../types';

interface ServicesSectionProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectService,
}) => {
  const getServiceBadge = (index: number) => {
    return String(index + 1).padStart(2, '0');
  };

  return (
    <section id="services" className="py-20 bg-white border-y border-clinic-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-clinic-primary">
              Our Clinical Specialties
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-forest-800 tracking-tight">
              Find your care.{' '}
              <span className="font-serif italic font-normal text-clinic-primary">
                Gentle & specialized treatments.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-clinic-muted">
              Select any treatment below to see real clinical details, step-by-step procedures, transparent PKR fees, or schedule directly with Dr. Zeeshan Ahmad.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-clinic-primary bg-clinic-lightGreen/50 px-4 py-2 rounded-full self-start md:self-auto">
            <span>Click any card to explore treatment</span>
          </div>
        </div>

        {/* Services Grid with Real Authentic Dental Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, idx) => (
            <div
              key={service.id}
              className="group bg-clinic-bg rounded-3xl overflow-hidden border border-clinic-border/80 hover:border-clinic-primary/40 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Real High-Resolution Treatment Image */}
                <div className="relative h-48 w-full overflow-hidden bg-forest-900">
                  <img
                    src={service.image_url}
                    alt={service.name_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Card Number Pill */}
                  <span className="absolute top-4 left-4 font-serif text-lg font-bold text-white bg-forest-900/80 backdrop-blur-md px-3 py-1 rounded-xl shadow-xs">
                    {getServiceBadge(idx)}
                  </span>

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-semibold text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-clinic-lightGreen" />
                    <span>{service.duration_min} mins</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <Link
                    to={`/service/${service.slug || service.id}`}
                    className="block group-hover:text-clinic-primary transition-colors"
                  >
                    <h3 className="text-xl font-bold text-forest-800 leading-snug mb-1">
                      {service.name_en}
                    </h3>
                  </Link>

                  <p className="text-xs text-clinic-muted italic mb-3">
                    {service.name_roman}
                  </p>

                  <p className="text-sm text-forest-800/80 leading-relaxed line-clamp-3 mb-4">
                    {service.description_en}
                  </p>
                </div>
              </div>

              {/* Price & Actions Strip */}
              <div className="px-6 pb-6 pt-2 border-t border-clinic-border/60 flex items-center justify-between gap-3">
                <div>
                  {service.price_from_pkr ? (
                    <div className="flex items-center gap-1.5 text-sm font-bold text-forest-800">
                      <Tag className="w-3.5 h-3.5 text-clinic-primary" />
                      <span>From PKR {service.price_from_pkr.toLocaleString()}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-clinic-muted font-medium">Consultation Based</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Dedicated Page Link */}
                  <Link
                    to={`/service/${service.slug || service.id}`}
                    className="p-2 rounded-xl text-forest-800 hover:text-clinic-primary hover:bg-clinic-lightGreen/50 transition-colors"
                    title="View treatment details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {/* Direct Book Button */}
                  <button
                    onClick={() => onSelectService(service)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
