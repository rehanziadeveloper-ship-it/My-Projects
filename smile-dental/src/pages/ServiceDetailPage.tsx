import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Banknote, 
  CheckCircle2, 
  ArrowLeft, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  Star, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BookingModal } from '../components/BookingModal';
import { FloatingActions } from '../components/FloatingActions';
import { WebChatbot } from '../components/WebChatbot';
import { FALLBACK_SERVICES, FALLBACK_CLINIC, fetchServices, fetchClinicProfile } from '../lib/supabase';
import type { Service, Clinic } from '../types';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [clinic, setClinic] = useState<Clinic>(FALLBACK_CLINIC);
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
      try {
        const [c, sList] = await Promise.all([fetchClinicProfile(), fetchServices()]);
        setClinic(c);
        setServices(sList);

        const found = sList.find(
          (s) => s.slug === slug || s.id === slug || s.slug === slug?.toLowerCase()
        );
        setCurrentService(found || null);
      } catch (err) {
        console.error('Error loading service detail:', err);
        const fallback = FALLBACK_SERVICES.find(
          (s) => s.slug === slug || s.id === slug
        );
        setCurrentService(fallback || null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-clinic-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-clinic-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-forest-800">Loading treatment details...</p>
        </div>
      </div>
    );
  }

  if (!currentService) {
    return (
      <div className="min-h-screen bg-clinic-bg flex flex-col justify-between">
        <Navbar onOpenBooking={() => setIsBookingOpen(true)} services={services} />
        <div className="max-w-xl mx-auto px-4 py-32 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-forest-800">Treatment Not Found</h1>
          <p className="text-sm text-clinic-muted">
            The dental service you are looking for might have been updated or moved.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover transition-all shadow-soft"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Clinic Home</span>
            </Link>
          </div>
        </div>
        <Footer clinic={clinic} services={services} onOpenBooking={() => setIsBookingOpen(true)} />
      </div>
    );
  }

  const cleanWa = clinic.whatsapp_number.replace(/\D/g, '');
  const waMessage = encodeURIComponent(
    `Assalam-o-Alaikum Dr. Zeeshan, I am inquiring about ${currentService.name_en} (${currentService.name_roman}) at Smile Dental Clinic.`
  );

  return (
    <div className="min-h-screen bg-clinic-bg text-forest-800 selection:bg-clinic-lightGreen selection:text-forest-900 flex flex-col justify-between">
      <Navbar onOpenBooking={() => setIsBookingOpen(true)} services={services} />

      <main className="pt-28 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <nav className="flex items-center gap-2 text-xs text-clinic-muted">
            <Link to="/" className="hover:text-clinic-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-clinic-border" />
            <a href="/#services" className="hover:text-clinic-primary transition-colors">
              Treatments
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-clinic-border" />
            <span className="text-forest-800 font-semibold truncate">
              {currentService.name_en}
            </span>
          </nav>
        </div>

        {/* Hero Header Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-soft border border-clinic-border/60">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-clinic-lightGreen/50 text-clinic-primary border border-clinic-lightGreen">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Painless Dental Procedure</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-800 tracking-tight leading-tight">
                  {currentService.name_en}
                </h1>
                <p className="text-lg sm:text-xl font-medium text-clinic-primary mt-1">
                  {currentService.name_roman}
                </p>
              </div>

              <p className="text-base text-clinic-muted leading-relaxed">
                {currentService.description_en}
              </p>

              {/* Meta stats pills */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-clinic-bg border border-clinic-border/80">
                  <Clock className="w-5 h-5 text-clinic-primary" />
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-clinic-muted">Duration</span>
                    <span className="text-sm font-bold text-forest-800">
                      Approx. {currentService.duration_min} mins
                    </span>
                  </div>
                </div>

                {currentService.price_from_pkr && (
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-clinic-bg border border-clinic-border/80">
                    <Banknote className="w-5 h-5 text-clinic-primary" />
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider text-clinic-muted">Investment</span>
                      <span className="text-sm font-bold text-forest-800">
                        From Rs. {currentService.price_from_pkr.toLocaleString()} PKR
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-clinic-bg border border-clinic-border/80">
                  <ShieldCheck className="w-5 h-5 text-clinic-primary" />
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-clinic-muted">Doctor</span>
                    <span className="text-sm font-bold text-forest-800">
                      Dr. Zeeshan Ahmad
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover shadow-soft transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book This Treatment</span>
                </button>

                <a
                  href={`tel:${clinic.phone}`}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm font-semibold text-forest-800 bg-clinic-lightGreen/50 hover:bg-clinic-lightGreen border border-clinic-lightGreen transition-all"
                >
                  <Phone className="w-4 h-4 text-clinic-primary" />
                  <span>Call {clinic.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${cleanWa}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-4 rounded-full text-sm font-semibold text-[#128C7E] bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Inquiries</span>
                </a>
              </div>
            </div>

            {/* Right Clinical Photography */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-lg border border-clinic-border aspect-4/3 group">
                <img
                  src={currentService.image_url}
                  alt={currentService.name_en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs uppercase tracking-wider font-semibold text-clinic-lightGreen">
                    Smile Dental Clinic • Islamabad
                  </span>
                  <p className="text-sm font-medium mt-0.5">
                    100% Sterilized Operatory & International Protocol
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Deep Overview & Roman Urdu Explanation */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-clinic-border/60 space-y-6">
              <h2 className="text-2xl font-bold text-forest-800">
                Clinical Overview & Treatment Details
              </h2>
              
              <div className="prose prose-forest text-sm sm:text-base text-clinic-muted leading-relaxed space-y-4">
                <p>
                  {currentService.detailed_overview || currentService.description_en}
                </p>
                {currentService.detailed_overview_roman && (
                  <div className="bg-clinic-bg rounded-2xl p-4 border-l-4 border-clinic-primary space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-clinic-primary">
                      Roman Urdu Wazaahat:
                    </span>
                    <p className="text-sm text-forest-800 italic">
                      "{currentService.detailed_overview_roman}"
                    </p>
                  </div>
                )}
              </div>

              {/* Procedure Steps */}
              {currentService.procedure_steps && currentService.procedure_steps.length > 0 && (
                <div className="pt-6 border-t border-clinic-border/60 space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-clinic-primary">
                      Step-by-Step Procedure
                    </span>
                    <h3 className="text-xl font-bold text-forest-800 mt-1">
                      How Dr. Zeeshan Performs This Treatment
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {currentService.procedure_steps.map((step) => (
                      <div 
                        key={step.step}
                        className="bg-clinic-bg rounded-2xl p-5 border border-clinic-border/80 flex flex-col justify-between space-y-3 hover:border-clinic-primary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-8 h-8 rounded-full bg-forest-800 text-white font-bold text-sm flex items-center justify-center">
                            {step.step}
                          </span>
                          <span className="text-[11px] font-semibold uppercase text-clinic-primary">
                            Phase {step.step}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-forest-800">
                            {step.title}
                          </h4>
                          <p className="text-xs text-clinic-muted mt-1 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar: Who Needs This & Benefits */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Who Needs This Card */}
              {currentService.who_needs_this && currentService.who_needs_this.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-soft border border-clinic-border/60 space-y-4">
                  <h3 className="text-base font-bold text-forest-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-clinic-primary" />
                    <span>Who Needs This Treatment?</span>
                  </h3>
                  <ul className="space-y-3">
                    {currentService.who_needs_this.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-forest-800 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-clinic-primary mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits Card */}
              {currentService.benefits && currentService.benefits.length > 0 && (
                <div className="bg-clinic-lightGreen/30 rounded-3xl p-6 border border-clinic-lightGreen/80 space-y-4">
                  <h3 className="text-base font-bold text-forest-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-clinic-primary" />
                    <span>Key Clinical Advantages</span>
                  </h3>
                  <ul className="space-y-3">
                    {currentService.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-forest-800 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-clinic-primary flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Google Reviews Badge */}
              <div className="bg-white rounded-3xl p-6 shadow-soft border border-clinic-border/60 text-center space-y-3">
                <div className="flex justify-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <h4 className="text-sm font-bold text-forest-800">
                  5.0 Stars Patient Satisfaction
                </h4>
                <p className="text-xs text-clinic-muted">
                  Islamabad patients trust Dr. Zeeshan Ahmad for genuine, gentle dental procedures.
                </p>
                <a
                  href={clinic.google_review_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-clinic-primary hover:underline"
                >
                  <span>Read or write a Google Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>
        </section>

        {/* Bottom Booking Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-forest-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 relative overflow-hidden shadow-xl">
            <div className="max-w-2xl mx-auto space-y-3 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-clinic-lightGreen">
                Next-Day & Same-Day Appointments Available
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to Schedule Your {currentService.name_en}?
              </h2>
              <p className="text-sm text-white/75">
                Book online in 60 seconds. Our automated calendar checks live availability with zero doctor double-booking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold text-forest-900 bg-clinic-lightGreen hover:bg-white shadow-soft transition-all transform hover:-translate-y-0.5"
              >
                Book Appointment Online
              </button>

              <a
                href={`tel:${clinic.phone}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-forest-800 hover:bg-forest-700 border border-forest-700 transition-all"
              >
                <Phone className="w-4 h-4 text-clinic-lightGreen" />
                <span>Call Clinic: {clinic.phone}</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer
        clinic={clinic}
        services={services}
        onOpenBooking={() => setIsBookingOpen(true)}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        services={services}
        initialService={currentService}
      />

      <FloatingActions
        onOpenChat={() => setIsChatOpen(true)}
        phone={clinic.phone}
        whatsappNumber={clinic.whatsapp_number}
      />

      <WebChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};
