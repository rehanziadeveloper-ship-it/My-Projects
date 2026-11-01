import React from 'react';
import { ShieldCheck, Award, Smile } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-clinic-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Card with Patient-First Philosophy */}
          <div className="lg:col-span-5 relative">
            <div className="bg-forest-800 text-white p-8 sm:p-10 rounded-4xl shadow-soft-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-clinic-primary/20 rounded-full blur-2xl" />
              
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-clinic-lightGreen text-forest-800 flex items-center justify-center font-bold">
                  <Smile className="w-6 h-6 text-clinic-primary" />
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                  Calm atmosphere.{' '}
                  <span className="font-serif italic font-normal text-clinic-lightGreen block">
                    Zero clinical anxiety.
                  </span>
                </h3>

                <p className="text-sm text-clinic-lightGreen/90 leading-relaxed">
                  We designed our clinic from the ground up to eliminate the fear of visiting the dentist. With modern local anesthetics and patient pacing, your comfort comes first.
                </p>

                <div className="pt-6 border-t border-forest-700/60 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-forest-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-clinic-lightGreen" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Class-B Autoclave Sterilization</p>
                    <p className="text-[11px] text-clinic-lightGreen/70">100% individual sealed instrument pouches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission and Clinical Integrity */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-clinic-primary">
              About Smile Dental Clinic
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-forest-800 tracking-tight leading-tight">
              One dedicated doctor.{' '}
              <span className="font-serif italic font-normal text-clinic-primary">
                Uncompromising patient continuity.
              </span>
            </h2>

            <div className="space-y-4 text-base text-forest-800/80 leading-relaxed">
              <p>
                Unlike corporate dental chains where you see a different junior resident on every visit, Smile Dental Clinic is built entirely around Dr. Zeeshan Ahmad. Every examination, diagnosis, and procedure is performed directly by the principal surgeon.
              </p>
              <p>
                We believe in ethical, conservative dentistry — preserving your natural enamel and saving teeth whenever possible, rather than rushing into unnecessary aggressive treatments.
              </p>
            </div>

            {/* Core Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white border border-clinic-border/80 shadow-xs">
                <Award className="w-5 h-5 text-clinic-primary mb-2" />
                <h4 className="text-sm font-bold text-forest-800">Clear Explanations</h4>
                <p className="text-xs text-clinic-muted mt-1">We show your digital X-rays and explain every option in English or Urdu before starting.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-clinic-border/80 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-clinic-primary mb-2" />
                <h4 className="text-sm font-bold text-forest-800">No Hidden Costs</h4>
                <p className="text-xs text-clinic-muted mt-1">Clear upfront PKR pricing with zero surprises during or after treatment.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
