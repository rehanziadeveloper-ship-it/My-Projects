import React from 'react';
import { Home, Scale, MapPin, MessageSquare, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-[#05080f] text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-bold text-slate-100 text-lg">Raqba</span>
                <p className="text-[10px] text-gold-400/90 font-medium">Your trusted property partner</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Premier real estate brokerage operating system for verified residential, luxury villa, and commercial property transactions across Pakistan.
            </p>
            <div className="text-[11px] text-slate-300 font-mono">
              Lahore • Islamabad • Karachi • Rawalpindi
            </div>
          </div>

          {/* Office Locations */}
          <div className="space-y-2">
            <div className="font-serif font-bold text-slate-200 text-sm">Brokerage Offices</div>
            <div className="space-y-2 text-slate-400 text-xs">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                <span>Lahore: Plaza 42, Main Boulevard, DHA Phase 6</span>
              </div>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                <span>Islamabad: Executive Block, Jinnah Avenue, Sector F-7/2</span>
              </div>
            </div>
          </div>

          {/* Brokerage Licenses */}
          <div className="space-y-2">
            <div className="font-serif font-bold text-slate-200 text-sm">Regulatory Licensing</div>
            <ul className="space-y-1 text-slate-400 text-[11px] font-mono">
              <li>Lahore Chamber / DHA: LCCI / DEF-8491</li>
              <li>Islamabad Real Estate: REA-ISB-1040</li>
              <li>Rawalpindi Development: RDA-RAW-3291</li>
              <li>Karachi Development: KDA-KHI-9021</li>
            </ul>
          </div>

          {/* Pakistan Legal Disclosures */}
          <div className="space-y-2">
            <div className="font-serif font-bold text-slate-200 text-sm">Legal & Compliance Notice</div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              All electronic representation agreements and NDAs executed via Raqba are legally recognized under the Electronic Transactions Ordinance (ETO) 2002. Title conveyance deeds require physical stamp paper registered with the Sub-Registrar.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-300">
              <Scale className="w-3.5 h-3.5 text-gold-400" />
              <span>100% Title Verified & Transparent Dealing</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 text-slate-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} Raqba Pakistan. All rights reserved.
          </div>
          <div className="font-mono text-slate-400 text-[10px] flex items-center gap-4">
            <a href="https://wa.me/923008492910" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct WhatsApp Broker Support: +92 300 8492910</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
