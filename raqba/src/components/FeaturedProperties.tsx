import React from 'react';
import { Property, Language } from '../types';
import { formatPKR, formatArea } from '../lib/formatters';
import { translations } from '../lib/i18n';
import { Bed, Bath, Maximize2, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

interface FeaturedPropertiesProps {
  properties: Property[];
  currentLang: Language;
  onSelectProperty: (property: Property) => void;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  currentLang,
  onSelectProperty
}) => {
  const t = translations[currentLang];

  return (
    <section id="featured" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED PAKISTAN PROPERTIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
            {t.featuredTitle}
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            {t.featuredSubtitle}
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-gold-400 font-bold">{properties.length}</span> Verified Listings
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map(property => (
          <div
            key={property.id}
            onClick={() => onSelectProperty(property)}
            className="group cursor-pointer glass-card rounded-2xl overflow-hidden hover:border-gold-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-gold-500/10 flex flex-col"
          >
            {/* Big High-Resolution Real Photograph */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
              <img
                src={property.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'}
                alt={property.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Area & Category Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md border border-gold-500/30 text-gold-300 text-[11px] font-semibold">
                  {formatArea(property.area_size, property.area_unit)}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700 text-slate-300 text-[11px]">
                  {property.property_category || property.property_type}
                </span>
              </div>

              {property.gated_community && (
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Gated Society</span>
                  </span>
                </div>
              )}

              {/* Price in PKR (Lakh / Crore) */}
              <div className="absolute bottom-3 left-4 right-4 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-serif font-bold text-white drop-shadow-md">
                    {formatPKR(property.price)}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-400" />
                  <span>{property.area_name || property.city}</span>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-100 group-hover:text-gold-300 transition-colors">
                  {property.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {property.description}
                </p>

                {/* Specs Row */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  {property.beds ? (
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-gold-400" />
                      <span>{property.beds} Beds</span>
                    </div>
                  ) : null}
                  {property.baths ? (
                    <div className="flex items-center gap-1.5">
                      <Bath className="w-3.5 h-3.5 text-gold-400" />
                      <span>{property.baths} Baths</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-gold-400" />
                    <span>{property.sqft.toLocaleString()} Sq Ft</span>
                  </div>
                </div>

                {/* Features Pills */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {property.features.slice(0, 3).map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Single Clear View Details CTA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProperty(property);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-gold-500 hover:text-slate-950 border border-gold-500/30 hover:border-gold-500 text-gold-300 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200"
              >
                <span>{t.viewDetails}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};
