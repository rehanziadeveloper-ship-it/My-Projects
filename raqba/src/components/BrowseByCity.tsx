import React from 'react';
import { Language } from '../types';
import { translations } from '../lib/i18n';
import { MapPin, ArrowRight } from 'lucide-react';

interface BrowseByCityProps {
  currentLang: Language;
  onSelectCity: (city: string) => void;
}

export const BrowseByCity: React.FC<BrowseByCityProps> = ({ currentLang, onSelectCity }) => {
  const t = translations[currentLang];

  const cities = [
    {
      name: 'Lahore',
      areas: 'DHA Phase 5 & 6, Gulberg III',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
      count: 'DHA & Commercial Hubs'
    },
    {
      name: 'Islamabad',
      areas: 'Sector E-7, F-7 & Margalla Hills',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      count: 'Embassy Enclaves & Farmhouses'
    },
    {
      name: 'Rawalpindi',
      areas: 'Bahria Town Phase 8, Safari Valley',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      count: 'Modern Gated Communities'
    },
    {
      name: 'Karachi',
      areas: 'Clifton Beach & DHA Creek Vistas',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      count: 'Waterfront Penthouses'
    }
  ];

  return (
    <section id="cities" className="py-16 bg-[#060a12]/70 border-y border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-serif font-bold text-slate-100">
            {t.browseCityTitle}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {t.browseCitySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((c, idx) => (
            <div
              key={idx}
              onClick={() => onSelectCity(c.name)}
              className="group cursor-pointer relative h-64 rounded-2xl overflow-hidden border border-slate-800 hover:border-gold-500/50 transition-all duration-300 shadow-xl"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-xl text-white group-hover:text-gold-300 transition-colors">
                    {c.name}
                  </h3>
                  <div className="w-7 h-7 rounded-full bg-slate-900/80 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-slate-950 transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {c.areas}
                </p>
                <div className="text-[10px] text-gold-400/90 font-mono">
                  {c.count}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
