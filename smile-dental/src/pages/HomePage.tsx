import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ServicesSection } from '../components/ServicesSection';
import { AboutSection } from '../components/AboutSection';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { DoctorSection } from '../components/DoctorSection';
import { ResultsSection } from '../components/ResultsSection';
import { ReviewsSection } from '../components/ReviewsSection';
import { ContactSection } from '../components/ContactSection';
import { Footer } from '../components/Footer';
import { FloatingActions } from '../components/FloatingActions';
import { BookingModal } from '../components/BookingModal';
import { WebChatbot } from '../components/WebChatbot';

import {
  fetchClinicProfile,
  fetchDoctorProfile,
  fetchServices,
  fetchPublishedReviews,
  FALLBACK_CLINIC,
  FALLBACK_DOCTOR,
  FALLBACK_SERVICES,
  FALLBACK_REVIEWS,
} from '../lib/supabase';
import type { Clinic, Doctor, Service, Review } from '../types';

export const HomePage: React.FC = () => {
  const [clinic, setClinic] = useState<Clinic>(FALLBACK_CLINIC);
  const [doctor, setDoctor] = useState<Doctor>(FALLBACK_DOCTOR);
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES);
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);

  // Modals & Chat state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [c, d, s, r] = await Promise.all([
          fetchClinicProfile(),
          fetchDoctorProfile(),
          fetchServices(),
          fetchPublishedReviews(),
        ]);
        setClinic(c);
        setDoctor(d);
        setServices(s);
        setReviews(r);
      } catch (err) {
        console.warn('Using baseline clinic cache:', err);
      }
    }
    loadData();
  }, []);

  const handleOpenBooking = (service?: Service) => {
    setSelectedServiceForBooking(service || null);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-clinic-bg text-clinic-text">
      {/* Navigation Bar */}
      <Navbar onOpenBooking={() => handleOpenBooking()} services={services} />

      {/* Main Page Sections */}
      <main className="flex-1">
        <Hero
          onOpenBooking={() => handleOpenBooking()}
          whatsappNumber={clinic.whatsapp_number}
        />

        <ServicesSection
          services={services}
          onSelectService={(svc) => handleOpenBooking(svc)}
        />

        <AboutSection />

        <WhyChooseUs />

        <DoctorSection
          doctor={doctor}
          onOpenBooking={() => handleOpenBooking()}
        />

        <ResultsSection />

        <ReviewsSection
          reviews={reviews}
          googleReviewUrl={clinic.google_review_url}
        />

        <ContactSection clinic={clinic} />
      </main>

      {/* Footer */}
      <Footer
        clinic={clinic}
        services={services}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Persistent Floating Quick Actions (Chat, WhatsApp, Call) */}
      <FloatingActions
        onOpenChat={() => setIsChatOpen(true)}
        phone={clinic.phone}
        whatsappNumber={clinic.whatsapp_number}
      />

      {/* 3-Step Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedServiceForBooking(null);
        }}
        services={services}
        initialService={selectedServiceForBooking}
      />

      {/* Web Chatbot Panel */}
      <WebChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpenBooking={() => {
          setIsChatOpen(false);
          handleOpenBooking();
        }}
        clinicPhone={clinic.phone}
      />
    </div>
  );
};
