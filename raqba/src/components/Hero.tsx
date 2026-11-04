import React, { useState } from 'react';
import { Search, MapPin, Home, DollarSign, Shield, ArrowRight } from 'lucide-react';

interface HeroProps {
  onSearch: (city: string, type: string, budget: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [city, setCity] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [budget, setBudget] = useState('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(city, propertyType, budget);
    const elem = document.getElementById('featured');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
      
      {/* High-Resolution Real Architectural Home Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85')`
        }}
      />

      {/* Soft Dark Gradient Overlay for Maximum Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/75 to-[#070b14]/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/85 via-transparent to-[#070b14]/85 pointer-events-none" />

      {/* Main Container */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        
        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-gold-500/30 text-gold-300 text-xs font-semibold backdrop-blur-md shadow-lg">
          <Shield className="w-3.5 h-3.5 text-gold-400" />
          <span>100% Title Verified • Dedicated Senior Broker • Private Guided Showings</span>
        </div>

        {/* Plain Language Headline */}
        <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-white leading-[1.15]">
          Find your dream home in <span className="text-gold-400">Pakistan</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-200 font-light max-w-2xl mx-auto leading-relaxed drop-shadow">
          Raqba connects you with luxury houses, apartments, plots, and commercial properties across Lahore, Islamabad, Karachi, and Rawalpindi.
        </p>

        {/* One Clear Search Bar (City/Area, Property Type, Budget in Lakh/Crore) */}
        <div className="pt-4 max-w-4xl mx-auto">
          <form 
            onSubmit={handleSearchSubmit}
            className="p-3 sm:p-4 rounded-2xl bg-slate-950/90 border border-gold-500/30 backdrop-blur-xl shadow-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-left"
          >
            {/* City Selector */}
            <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
              <label className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>City / Area</span>
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Cities</option>
                <option value="Lahore" className="bg-slate-900">Lahore (DHA, Gulberg)</option>
                <option value="Islamabad" className="bg-slate-900">Islamabad (E-7, F-7)</option>
                <option value="Rawalpindi" className="bg-slate-900">Rawalpindi (Bahria Town)</option>
                <option value="Karachi" className="bg-slate-900">Karachi (Clifton, DHA)</option>
              </select>
            </div>

            {/* Property Type Selector */}
            <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
              <label className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Home className="w-3 h-3" />
                <span>Property Type</span>
              </label>
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Property Types</option>
                <option value="House" className="bg-slate-900">Houses & Villas</option>
                <option value="Apartment" className="bg-slate-900">Luxury Apartments</option>
                <option value="Plot" className="bg-slate-900">Residential Plots</option>
                <option value="Commercial" className="bg-slate-900">Commercial Plazas</option>
              </select>
            </div>

            {/* Budget Selector in PKR */}
            <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
              <label className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>Budget (PKR)</span>
              </label>
              <select
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-slate-100 focus:outline-none cursor-pointer font-mono"
              >
                <option value="all" className="bg-slate-900">Any Budget</option>
                <option value="under-5-crore" className="bg-slate-900">Under Rs 5 Crore</option>
                <option value="5-to-15-crore" className="bg-slate-900">Rs 5 - 15 Crore</option>
                <option value="above-15-crore" className="bg-slate-900">Rs 15 Crore+</option>
              </select>
            </div>

            {/* Search Submit Button */}
            <div className="flex items-center">
              <button
                type="submit"
                className="w-full h-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Properties</span>
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
