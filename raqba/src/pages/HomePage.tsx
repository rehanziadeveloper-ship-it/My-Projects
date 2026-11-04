import React, { useState, useEffect } from 'react';
import { Property, Agent } from '../types';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { FeaturedProperties } from '../components/FeaturedProperties';
import { BrowseByCity } from '../components/BrowseByCity';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { HowItWorks } from '../components/HowItWorks';
import { BrokerTeam } from '../components/BrokerTeam';
import { ContactInquiryForm } from '../components/ContactInquiryForm';
import { PropertyDetailModal } from '../components/PropertyDetailModal';
import { AIConciergeWidget } from '../components/AIConciergeWidget';
import { Footer } from '../components/Footer';

export const HomePage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Search state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propsRes, agentsRes] = await Promise.all([
        supabase.from('properties').select('*').eq('status', 'active').order('price', { ascending: false }),
        supabase.from('agents').select('*').eq('active', true).order('closed_volume_ytd', { ascending: false })
      ]);

      if (propsRes.data) {
        setProperties(propsRes.data as Property[]);
        setFilteredProperties(propsRes.data as Property[]);
      }
      if (agentsRes.data) {
        setAgents(agentsRes.data as Agent[]);
      }
    } catch (err) {
      console.warn('Error fetching homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (city: string, type: string, budget: string) => {
    let result = [...properties];

    if (city !== 'all') {
      result = result.filter(p => p.city.toLowerCase() === city.toLowerCase());
    }

    if (type !== 'all') {
      result = result.filter(p => 
        p.property_category?.toLowerCase() === type.toLowerCase() ||
        p.property_type?.toLowerCase() === type.toLowerCase()
      );
    }

    if (budget === 'under-5-crore') {
      result = result.filter(p => p.price < 50000000);
    } else if (budget === '5-to-15-crore') {
      result = result.filter(p => p.price >= 50000000 && p.price <= 150000000);
    } else if (budget === 'above-15-crore') {
      result = result.filter(p => p.price > 150000000);
    }

    setFilteredProperties(result);
  };

  const handleSelectCity = (cityName: string) => {
    handleSearch(cityName, 'all', 'all');
    const elem = document.getElementById('featured');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenPropertyDetail = (prop: Property) => {
    setSelectedProperty(prop);
    setDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans" dir="ltr">
      
      {/* 1. Header (Strict Single Horizontal Row, Fixed 72px) */}
      <Navbar
        onOpenInquiry={() => {
          const elem = document.getElementById('contact');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content with strict 8-section layout */}
      <main className="flex-1">
        
        {/* Section 1: Hero + Search */}
        <Hero
          onSearch={handleSearch}
        />

        {/* Section 2: Featured Properties (Database Driven) */}
        {loading ? (
          <div className="py-24 text-center">
            <span className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin inline-block" />
            <p className="text-xs text-slate-400 mt-3 font-mono">Loading verified Raqba properties...</p>
          </div>
        ) : (
          <FeaturedProperties
            properties={filteredProperties.length > 0 ? filteredProperties : properties}
            currentLang="en"
            onSelectProperty={handleOpenPropertyDetail}
          />
        )}

        {/* Section 3: Browse By City / Type */}
        <BrowseByCity
          currentLang="en"
          onSelectCity={handleSelectCity}
        />

        {/* Section 4: Why Choose Us (3 Short Points) */}
        <WhyChooseUs
          currentLang="en"
        />

        {/* Section 5: How It Works (3 Steps) */}
        <HowItWorks
          currentLang="en"
        />

        {/* Section 6: Meet Our Brokers */}
        <BrokerTeam
          agents={agents}
          currentLang="en"
        />

        {/* Section 7: Contact / Inquiry Form (Silent Background 4-Vector Scoring) */}
        <ContactInquiryForm
          properties={properties}
          selectedProperty={selectedProperty}
          currentLang="en"
        />

      </main>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        currentLang="en"
      />

      {/* Raqba AI Chatbot (Slot-filling, auto-language detection, human handoff) */}
      <AIConciergeWidget />

      {/* Section 8: Footer */}
      <Footer />

    </div>
  );
};
