import React from 'react';
import { Language } from '../types';
import { translations } from '../lib/i18n';
import { ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

interface WhyChooseUsProps {
  currentLang: Language;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  const points = [
    {
      icon: ShieldCheck,
      title: t.point1Title,
      desc: t.point1Desc,
      tag: "Zero Legal Risk"
    },
    {
      icon: UserCheck,
      title: t.point2Title,
      desc: t.point2Desc,
      tag: "Direct Partner Handling"
    },
    {
      icon: KeyRound,
      title: t.point3Title,
      desc: t.point3Desc,
      tag: "Clearance & Security Access"
    }
  ];

  return (
    <section id="why-us" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
          {t.whyUsTitle}
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          {t.whyUsSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {points.map((pt, idx) => {
          const Icon = pt.icon;
          return (
            <div
              key={idx}
              className="glass-card rounded-2xl p-8 hover:border-gold-500/40 transition-all duration-300 relative group space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono text-gold-400/90 font-bold tracking-wider uppercase">
                  {pt.tag}
                </span>
                <h3 className="text-lg font-serif font-bold text-slate-100 mt-1">
                  {pt.title}
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {pt.desc}
              </p>
            </div>
          );
        })}
      </div>

    </section>
  );
};
