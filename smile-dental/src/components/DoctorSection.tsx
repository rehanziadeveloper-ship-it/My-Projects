import React from 'react';
import { Award, CheckCircle, GraduationCap } from 'lucide-react';
import type { Doctor } from '../types';

interface DoctorSectionProps {
  doctor: Doctor;
  onOpenBooking: () => void;
}

export const DoctorSection: React.FC<DoctorSectionProps> = ({
  doctor,
  onOpenBooking,
}) => {
  return (
    <section id="doctor" className="py-24 bg-forest-900 text-white relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-clinic-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-20 w-80 h-80 bg-clinic-lightGreen/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Doctor Portrait / Badge Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative">
              {/* Outer Decorative Border */}
              <div className="w-72 sm:w-80 h-96 rounded-4xl bg-gradient-to-b from-forest-700 to-forest-800 p-2 border border-forest-600/60 shadow-soft-lg flex flex-col justify-end overflow-hidden relative group">
                
                {/* Doctor Headshot Placeholder / Stylized Graphic */}
                <div className="absolute inset-0 bg-forest-800 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-28 h-28 rounded-full bg-clinic-primary/40 border-2 border-clinic-lightGreen flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold font-serif text-clinic-lightGreen">ZA</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">{doctor.full_name}</h4>
                  <p className="text-xs text-clinic-lightGreen/80 mt-1">{doctor.title}</p>
                </div>

                {/* Bottom Overlay Badge */}
                <div className="relative z-10 bg-forest-900/90 backdrop-blur-md p-4 rounded-3xl border border-forest-700/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-clinic-lightGreen">
                    <Award className="w-4 h-4 text-clinic-primary" />
                    <span>Gold Medalist In Dentistry</span>
                  </div>
                </div>
              </div>

              {/* Floating Verified Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white text-forest-800 px-4 py-2.5 rounded-2xl shadow-soft flex items-center gap-2 border border-clinic-border">
                <CheckCircle className="w-4 h-4 text-clinic-primary" />
                <span className="text-xs font-bold">PMDC Certified</span>
              </div>
            </div>
          </div>

          {/* Doctor Bio and Credentials */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-800 border border-forest-700">
              <GraduationCap className="w-4 h-4 text-clinic-lightGreen" />
              <span className="text-xs font-semibold text-clinic-lightGreen">
                Meet Your Dental Surgeon
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              {doctor.full_name}{' '}
              <span className="font-serif italic font-normal text-clinic-lightGreen block text-2xl sm:text-3xl mt-1">
                {doctor.title}
              </span>
            </h2>

            {/* Verified Qualifications */}
            <div className="inline-block px-4 py-2 rounded-xl bg-forest-800/80 border border-forest-700 text-sm font-mono text-clinic-lightGreen">
              {doctor.qualifications}
            </div>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed">
              {doctor.bio}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-forest-800/60 border border-forest-700/60">
                <h4 className="text-sm font-bold text-white">Conservative Dental Approach</h4>
                <p className="text-xs text-white/70 mt-1">Focusing on saving teeth rather than unneeded prosthetic extraction.</p>
              </div>

              <div className="p-4 rounded-2xl bg-forest-800/60 border border-forest-700/60">
                <h4 className="text-sm font-bold text-white">Personal Attention</h4>
                <p className="text-xs text-white/70 mt-1">Every patient receives dedicated unhurried clinical time.</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onOpenBooking}
                className="px-8 py-3.5 rounded-full text-sm font-semibold text-forest-900 bg-clinic-lightGreen hover:bg-white shadow-soft transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Schedule Consultation with Dr. Zeeshan
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
