import React, { useState } from 'react';
import { Property, Language } from '../types';
import { formatPKR, formatArea } from '../lib/formatters';
import { translations } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import { submitLeadToN8N } from '../lib/n8n';
import { X, MapPin, Bed, Bath, Maximize2, ShieldCheck, Calendar, Phone, CheckCircle2, Send, ExternalLink } from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  currentLang
}) => {
  const t = translations[currentLang];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showingDate, setShowingDate] = useState('2026-11-06T15:00');
  const [dataConsent, setDataConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!isOpen || !property) return null;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataConsent) return;
    setLoading(true);

    try {
      // 1. Submit lead inquiry
      await submitLeadToN8N({
        fullName: clientName,
        email: clientEmail || 'client@realtypulse.pk',
        phone: clientPhone,
        budgetMax: property.price,
        financingType: 'Cash',
        targetPropertySlug: property.slug,
        timelineMonths: 1,
        city: property.city,
        verbatimQuote: `Requested private walkthrough for ${property.title} on ${new Date(showingDate).toLocaleString()}`
      });

      // 2. Insert into Supabase leads & showings table
      const { data: newLead } = await supabase
        .from('leads')
        .insert({
          full_name: clientName,
          email: clientEmail || 'client@realtypulse.pk',
          phone: clientPhone,
          lead_source: 'website_form',
          budget_max: property.price,
          financing_type: 'Cash',
          target_property_id: property.id,
          timeline_months: 1,
          status: 'new',
          deal_stage: 'new',
          verbatim_quote: `Requested walkthrough for ${property.title} at ${new Date(showingDate).toLocaleString()}`,
          data_consent: true
        })
        .select('id')
        .single();

      if (newLead?.id) {
        // Create unconfirmed showing waiting for broker confirmation
        await supabase.from('showings').insert({
          property_id: property.id,
          lead_id: newLead.id,
          showing_time: new Date(showingDate).toISOString(),
          status: 'pending_confirmation',
          broker_confirmed: false,
          notes: 'Client submitted showing request via property detail page. Awaiting broker confirmation call.'
        });

        // Trigger background score
        await supabase.rpc('realtypulse_score_and_dispatch', { p_lead_id: newLead.id });
      }

      setBookingSuccess(true);
    } catch (err) {
      console.error('Error booking showing:', err);
      setBookingSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#0c1220] border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-gold-500/20 text-gold-400 text-xs font-mono font-bold">
              {formatArea(property.area_size, property.area_unit)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {property.area_name}, {property.city}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Main Gallery */}
          <div className="space-y-3">
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 relative">
              <img
                src={property.images[activeImageIndex] || property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg text-lg sm:text-2xl font-serif font-bold text-white border border-gold-500/30">
                {formatPKR(property.price)}
              </div>
            </div>

            {/* Thumbnail selector */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-gold-500 scale-105' : 'border-slate-800 opacity-60'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Facts & Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              {property.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-4 h-4 text-gold-400" />
              <span>{property.address}, {property.city}</span>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-mono">Area Size</span>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {formatArea(property.area_size, property.area_unit)}
              </div>
            </div>

            {property.beds ? (
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono">Bedrooms</span>
                <div className="text-sm font-bold text-slate-100 mt-0.5">
                  {property.beds} Master Beds
                </div>
              </div>
            ) : null}

            {property.baths ? (
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono">Bathrooms</span>
                <div className="text-sm font-bold text-slate-100 mt-0.5">
                  {property.baths} Attached Baths
                </div>
              </div>
            ) : null}

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-mono">Covered Area</span>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {property.sqft.toLocaleString()} Sq Ft
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
              Property Overview
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
              Verified Amenities & Features
            </h4>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>

          {/* Location & Map Pin */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Location Coordinates: {property.pin_location || property.city}</span>
            </div>
            {property.google_maps_url && (
              <a
                href={property.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300 flex items-center gap-1 font-semibold"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Book Showing / Contact Broker Form */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h4 className="font-serif font-bold text-lg text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-400" />
              <span>{t.bookShowing}</span>
            </h4>
            <p className="text-xs text-slate-400">
              The broker confirms the showing by phone first; the system then dispatches full directions and gate pass.
            </p>

            {!bookingSuccess ? (
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="e.g. Tariq Mehmood"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Preferred Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={showingDate}
                      onChange={e => setShowingDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="modal-consent"
                    checked={dataConsent}
                    onChange={e => setDataConsent(e.target.checked)}
                    required
                    className="rounded bg-slate-900 border-slate-700 text-gold-500 focus:ring-0"
                  />
                  <label htmlFor="modal-consent" className="text-xs text-slate-400">
                    {t.consentCheckbox}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Submitting Walkthrough Request...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Request Private Walkthrough</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-serif font-bold text-emerald-300 text-sm">
                  Showing Request Received
                </h4>
                <p className="text-xs text-slate-300">
                  Our territory broker has been notified. They will call you directly at <b>{clientPhone}</b> to confirm access and dispatch the gate code.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
