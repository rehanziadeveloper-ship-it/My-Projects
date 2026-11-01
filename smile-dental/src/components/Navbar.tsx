import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, Phone, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import type { Service } from '../types';
import { FALLBACK_SERVICES } from '../lib/supabase';

interface NavbarProps {
  onOpenBooking: () => void;
  services?: Service[];
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, services = FALLBACK_SERVICES }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
    setIsServicesOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', href: '/#hero' },
    { label: 'About Us', href: '/#about' },
    { label: 'Why Choose Us', href: '/#why-us' },
    { label: 'Our Doctor', href: '/#doctor' },
    { label: 'Reviews', href: '/#reviews' },
    { label: 'Contact Us', href: '/#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-clinic-bg/95 backdrop-blur-md shadow-soft py-3 border-b border-clinic-border/60'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center p-2 shadow-xs group-hover:bg-forest-900 transition-colors">
              <svg viewBox="0 0 48 48" className="w-full h-full fill-white" fill="none">
                <path d="M24 6C18 6 13 11 13 17.5C13 22.5 15.5 25 17 30C18.5 35 20 38 22 38C23.5 38 23.5 34.5 24 33C24.5 34.5 24.5 38 26 38C28 38 29.5 35 31 30C32.5 25 35 22.5 35 17.5C35 11 30 6 24 6Z" fill="currentColor" />
                <path d="M19 18C21 21 27 21 29 18" stroke="#10201A" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl text-forest-800 tracking-tight leading-tight">
                Smile Dental Clinic
              </span>
              <span className="text-xs text-clinic-muted font-normal">
                Dr. Zeeshan Ahmad
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            <a
              href="/#hero"
              className="text-sm font-medium text-forest-800 transition-colors hover:text-clinic-primary"
            >
              Home
            </a>

            <a
              href="/#about"
              className="text-sm font-medium text-forest-800 transition-colors hover:text-clinic-primary"
            >
              About Us
            </a>

            {/* Services with Hover/Click Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors py-2 ${
                  isServicesOpen || location.pathname.startsWith('/service')
                    ? 'text-clinic-primary font-semibold'
                    : 'text-forest-800 hover:text-clinic-primary'
                }`}
                aria-expanded={isServicesOpen}
              >
                <span>Services</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180 text-clinic-primary' : 'text-forest-800/60'}`} />
              </button>

              {/* Dropdown Menu */}
              {isServicesOpen && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-3xl shadow-xl border border-clinic-border/80 p-3 mt-1 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="px-3 py-2 border-b border-clinic-border/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-clinic-primary">
                      All Dental Treatments
                    </span>
                  </div>

                  {services.map((svc) => (
                    <Link
                      key={svc.id}
                      to={`/service/${svc.slug || svc.id}`}
                      onClick={() => setIsServicesOpen(false)}
                      className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-clinic-lightGreen/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-clinic-bg border border-clinic-border/60 mt-0.5">
                        <img
                          src={svc.image_url}
                          alt={svc.name_en}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-forest-800 group-hover:text-clinic-primary truncate">
                          {svc.name_en}
                        </p>
                        <p className="text-[11px] text-clinic-muted truncate">
                          {svc.name_roman}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-clinic-muted group-hover:text-clinic-primary group-hover:translate-x-0.5 transition-all self-center flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <a
              href="/#why-us"
              className="text-sm font-medium text-forest-800 transition-colors hover:text-clinic-primary"
            >
              Why Choose Us
            </a>

            <a
              href="/#doctor"
              className="text-sm font-medium text-forest-800 transition-colors hover:text-clinic-primary"
            >
              Our Doctor
            </a>

            <a
              href="/#reviews"
              className="text-sm font-medium text-forest-800 transition-colors hover:text-clinic-primary"
            >
              Reviews
            </a>

            <a
              href="/#contact"
              className="text-sm font-medium text-forest-800 transition-colors hover:text-clinic-primary"
            >
              Contact Us
            </a>
          </nav>

          {/* Desktop Right CTAs: STRICTLY HIDDEN on mobile (lg:flex only) */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {/* Phone link directly opens mobile/desktop dialer */}
            <a
              href="tel:+923001234567"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-clinic-primary bg-clinic-lightGreen/50 hover:bg-clinic-lightGreen transition-all shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0300-1234567</span>
            </a>

            <button
              onClick={onOpenBooking}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-clinic-primary hover:bg-clinic-primaryHover shadow-soft transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Right Controls: STRICTLY VISIBLE on mobile only (lg:hidden) */}
          {/* Note: NO duplicate 'Book' button! Clean call button + single hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href="tel:+923001234567"
              aria-label="Call clinic directly"
              className="p-2.5 rounded-full bg-clinic-lightGreen/60 text-clinic-primary"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={onOpenBooking}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-clinic-primary shadow-sm active:scale-95 transition-transform"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-forest-800 hover:bg-clinic-lightGreen/40 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-clinic-bg/98 backdrop-blur-lg border-b border-clinic-border/80 px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col space-y-2">
            <a
              href="/#hero"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-forest-800 hover:text-clinic-primary py-1.5 border-b border-clinic-border/40"
            >
              Home
            </a>

            <a
              href="/#about"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-forest-800 hover:text-clinic-primary py-1.5 border-b border-clinic-border/40"
            >
              About Us
            </a>

            {/* Mobile Services Accordion */}
            <div className="py-1.5 border-b border-clinic-border/40">
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="w-full flex items-center justify-between text-base font-medium text-forest-800"
              >
                <span>Services ({services.length})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180 text-clinic-primary' : ''}`} />
              </button>

              {isServicesOpen && (
                <div className="mt-3 pl-3 space-y-2 border-l-2 border-clinic-primary/40">
                  {services.map((svc) => (
                    <Link
                      key={svc.id}
                      to={`/service/${svc.slug || svc.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block text-sm text-forest-800 hover:text-clinic-primary py-1"
                    >
                      {svc.name_en}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <a
              href="/#why-us"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-forest-800 hover:text-clinic-primary py-1.5 border-b border-clinic-border/40"
            >
              Why Choose Us
            </a>

            <a
              href="/#doctor"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-forest-800 hover:text-clinic-primary py-1.5 border-b border-clinic-border/40"
            >
              Our Doctor
            </a>

            <a
              href="/#reviews"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-forest-800 hover:text-clinic-primary py-1.5 border-b border-clinic-border/40"
            >
              Reviews
            </a>

            <a
              href="/#contact"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-forest-800 hover:text-clinic-primary py-1.5"
            >
              Contact Us
            </a>
          </nav>

          <div className="pt-3 border-t border-clinic-border/60 flex flex-col gap-3">
            <a
              href="tel:+923001234567"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold text-clinic-primary bg-clinic-lightGreen/50"
            >
              <Phone className="w-4 h-4" />
              <span>Call Dial: 0300-1234567</span>
            </a>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3.5 rounded-full text-sm font-semibold text-white bg-clinic-primary shadow-soft"
            >
              Book Appointment Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
