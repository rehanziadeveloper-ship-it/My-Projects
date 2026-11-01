import React from 'react';
import { UserCheck, Sparkles, Clock, MessageCircle, ShieldCheck, Heart } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const points = [
    {
      icon: UserCheck,
      title: 'Direct Care with Dr. Zeeshan',
      description: 'You are never passed to an inexperienced assistant or intern. The principal surgeon attends to every patient personally.',
    },
    {
      icon: ShieldCheck,
      title: 'Hospital-Grade Sterilization',
      description: 'Medical autoclave cycle for every single instrument set. Pouches are opened right in front of you.',
    },
    {
      icon: Clock,
      title: 'Dedicated Appointment Slots',
      description: 'Strict one-patient-at-a-time scheduling ensures you are never kept waiting in a crowded waiting lounge.',
    },
    {
      icon: Sparkles,
      title: 'Modern Rotary & LED Equipment',
      description: 'Digital imaging and motorized rotary endodontics for faster, quieter, and truly painless root canals.',
    },
    {
      icon: MessageCircle,
      title: 'Bilingual Patient Communication',
      description: 'Receive all guidance, post-op instructions, and WhatsApp reminders in fluent English or Roman Urdu.',
    },
    {
      icon: Heart,
      title: 'Transparent Pricing in PKR',
      description: 'Honest fee schedule shared before any procedure begins. No hidden treatment markups.',
    },
  ];

  return (
    <section id="why-us" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-clinic-primary">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-forest-800 tracking-tight">
            Designed for patient comfort.{' '}
            <span className="font-serif italic font-normal text-clinic-primary block sm:inline">
              Built on clinical trust.
            </span>
          </h2>
          <p className="text-base text-clinic-muted">
            Here is why families across Islamabad trust Smile Dental Clinic for their routine and specialized oral care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-clinic-bg border border-clinic-border/80 hover:border-clinic-primary/30 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-clinic-lightGreen text-clinic-primary flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-forest-800 mb-2">
                    {pt.title}
                  </h3>
                  <p className="text-sm text-forest-800/80 leading-relaxed">
                    {pt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
