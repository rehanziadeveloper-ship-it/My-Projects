import React from 'react';
import { Agent, Language } from '../types';
import { translations } from '../lib/i18n';
import { Phone, MessageCircle, ShieldCheck } from 'lucide-react';

interface BrokerTeamProps {
  agents: Agent[];
  currentLang: Language;
}

export const BrokerTeam: React.FC<BrokerTeamProps> = ({ agents, currentLang }) => {
  const t = translations[currentLang];

  return (
    <section id="brokers" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
          {t.brokersTitle}
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          {t.brokersSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {agents.map(agent => (
          <div
            key={agent.id}
            className="glass-card rounded-2xl overflow-hidden hover:border-gold-500/40 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-square overflow-hidden bg-slate-900">
                <img
                  src={agent.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'}
                  alt={agent.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-gold-500/30 text-[10px] font-mono text-gold-300">
                    {agent.license_number}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-1">
                <h3 className="font-serif font-bold text-lg text-slate-100">
                  {agent.name}
                </h3>
                <p className="text-xs text-gold-400 font-medium">
                  {agent.role}
                </p>
                <p className="text-[11px] text-slate-400 font-sans">
                  Specialization: {agent.city_specialization || 'Prime Residential'}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 grid grid-cols-2 gap-2">
              <a
                href={`tel:${agent.phone}`}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-gold-400" />
                <span>Call</span>
              </a>

              <a
                href={`https://wa.me/${agent.whatsapp_number ? agent.whatsapp_number.replace(/\D/g, '') : '923008492910'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};
