import React from 'react';
import { Language } from '../types';
import { translations } from '../lib/i18n';
import { Search, CalendarCheck, FileSignature } from 'lucide-react';

interface HowItWorksProps {
  currentLang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  const steps = [
    {
      number: "01",
      icon: Search,
      title: t.step1Title,
      desc: t.step1Desc
    },
    {
      number: "02",
      icon: CalendarCheck,
      title: t.step2Title,
      desc: t.step2Desc
    },
    {
      number: "03",
      icon: FileSignature,
      title: t.step3Title,
      desc: t.step3Desc
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#060a12]/70 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
            {t.howItWorksTitle}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {t.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl p-8 relative space-y-4 hover:border-gold-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-serif font-bold text-slate-800">
                    {st.number}
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-slate-100">
                  {st.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
