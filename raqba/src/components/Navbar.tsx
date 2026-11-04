import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Phone, MessageSquare, Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onOpenInquiry?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenInquiry }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Buy', href: '#featured' },
    { name: 'Rent', href: '#featured' },
    { name: 'Sell', href: '#contact' },
    { name: 'Invest', href: '#cities' },
    { name: 'Our Brokers', href: '#brokers' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full h-[72px] transition-all duration-300 ${
        isScrolled
          ? 'bg-white text-slate-900 shadow-md border-b border-slate-200'
          : 'bg-[#090d16]/95 text-slate-100 border-b border-gold-500/20 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between whitespace-nowrap">
        
        {/* Left: Raqba Logo & Tagline */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-gold-500/20 group-hover:scale-105 transition-transform duration-200">
            <Home className="w-5 h-5 text-slate-950 stroke-[2.4]" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className={`font-serif font-bold text-2xl tracking-wide transition-colors ${
              isScrolled ? 'text-slate-950' : 'text-slate-100'
            }`}>
              Raqba
            </span>
            <span className={`text-[10px] tracking-wider uppercase font-medium transition-colors ${
              isScrolled ? 'text-slate-500' : 'text-gold-400/90'
            }`}>
              Your trusted property partner
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links (Buy, Rent, Sell, Invest, Our Brokers, Contact) */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-semibold tracking-wide">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`transition-colors whitespace-nowrap ${
                isScrolled
                  ? 'text-slate-700 hover:text-amber-700'
                  : 'text-slate-300 hover:text-gold-400'
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right: Actions (Phone/WhatsApp Icon, Primary Button, Broker Portal) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Phone / WhatsApp Icon */}
          <a
            href="https://wa.me/923008492910"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp (+92 300 8492910)"
            className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-center transition-all"
          >
            <MessageSquare className="w-4 h-4" />
          </a>

          <a
            href="tel:+923008492910"
            title="Call +92 300 8492910"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
              isScrolled
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <Phone className="w-4 h-4" />
          </a>

          {/* Primary Action Button: "Talk to us" */}
          <button
            onClick={() => {
              if (onOpenInquiry) onOpenInquiry();
              else {
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <span>Talk to us</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Admin / Broker Workspace Link */}
          <Link
            to={isAdmin ? "/" : "/admin"}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isScrolled
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            {isAdmin ? "Website" : "Broker Portal"}
          </Link>
        </div>

        {/* Mobile: Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          <a
            href="https://wa.me/923008492910"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className={`p-2 rounded-xl border transition-colors ${
              isScrolled
                ? 'bg-slate-100 text-slate-900 border-slate-300'
                : 'bg-slate-900 text-slate-200 border-slate-800'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] bg-[#0c1220] border-b border-slate-800 shadow-2xl p-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-200 hover:text-gold-400 py-2 border-b border-slate-800/80"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenInquiry) onOpenInquiry();
                else {
                  const el = document.getElementById('contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs uppercase tracking-wider text-center"
            >
              Talk to us
            </button>

            <Link
              to={isAdmin ? "/" : "/admin"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold text-center border border-slate-800"
            >
              {isAdmin ? "Public Website" : "Broker Portal"}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
