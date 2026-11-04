import React, { useState } from 'react';
import { Property } from '../types';
import { Bed, Bath, Maximize2, MapPin, KeyRound, Sparkles, Shield, ArrowUpRight } from 'lucide-react';

interface PropertyShowcaseProps {
  properties: Property[];
  onSelectPropertyForShowing: (property: Property) => void;
  onSelectPropertyForQualifier: (property: Property) => void;
}

export const PropertyShowcase: React.FC<PropertyShowcaseProps> = ({
  properties,
  onSelectPropertyForShowing,
  onSelectPropertyForQualifier
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPropertyModal, setSelectedPropertyModal] = useState<Property | null>(null);

  const categories = [
    { id: 'all', label: 'All Portfolio' },
    { id: 'Ultra-Luxury Villa', label: 'Trophy Villas' },
    { id: 'Waterfront Penthouse', label: 'Waterfront Penthouses' },
    { id: 'Commercial Prime', label: 'Commercial Prime' },
  ];

  const filtered = activeCategory === 'all' 
    ? properties 
    : properties.filter(p => p.property_type === activeCategory || (activeCategory === 'Ultra-Luxury Villa' && p.property_type === 'Architectural Estate'));

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <section id="collection" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>OFF-MARKET & PRIVATE ASSET ARCHIVE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
            Exclusive Luxury Listings
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Trophy residential and institutional commercial assets requiring 4-vector financial clearance prior to private walkthrough access.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-gold-500 text-slate-950 font-bold shadow-md shadow-gold-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(property => (
          <div
            key={property.id}
            className="group glass-card rounded-2xl overflow-hidden hover:border-gold-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-gold-500/10 flex flex-col"
          >
            {/* Image Cover */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
              <img
                src={property.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Badges on Top */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-gold-500/30 text-gold-300 text-[11px] font-semibold">
                  {property.property_type}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-medium">
                  Min POF: {formatPrice(property.proof_of_funds_required_min)}
                </span>
              </div>

              {/* Price Tag Overlay */}
              <div className="absolute bottom-3 left-4 right-4 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-serif font-bold text-slate-100 drop-shadow-md">
                    {formatPrice(property.price)}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-400" />
                  <span>{property.city}, {property.state}</span>
                </div>
              </div>
            </div>

            {/* Card Content Body */}
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
                      <Bed className="w-3.5 h-3.5 text-slate-400" />
                      <span>{property.beds} Beds</span>
                    </div>
                  ) : null}
                  {property.baths ? (
                    <div className="flex items-center gap-1.5">
                      <Bath className="w-3.5 h-3.5 text-slate-400" />
                      <span>{property.baths} Baths</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{property.sqft.toLocaleString()} Sq Ft</span>
                  </div>
                </div>

                {/* Feature Chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {property.features.slice(0, 3).map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                  {property.features.length > 3 && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-gold-400">
                      +{property.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => onSelectPropertyForShowing(property)}
                  className="px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gate Clearance</span>
                </button>

                <button
                  onClick={() => onSelectPropertyForQualifier(property)}
                  className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-gold-500/90 to-amber-600/90 hover:brightness-110 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-gold-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>4-Vector Qualify</span>
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
