"use client";

import React from "react";
import { ArrowRight, PhoneCall, CheckCircle2, MessageSquare, Calendar, Sparkles, Clock, ShieldCheck, Users } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-dot-matrix">
      {/* Diffused Ambient Glow Behind Hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-100/70 via-cyan-50/50 to-emerald-50/40 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Eyebrow Kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs mb-6 text-xs font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-indigo-600 font-semibold tracking-wide uppercase text-[11px]">
              ZEROLOSS AI INFRASTRUCTURE
            </span>
            <span className="text-slate-300">|</span>
            <span>Built Specifically For Marketing &amp; Growth Agencies</span>
          </div>

          {/* Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-950 leading-[1.08]">
            Never Lose Another Inbound Lead to <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 bg-clip-text text-transparent">Voicemail</span> or Slow Follow-ups.
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-normal">
            We partner with agencies as your white-label technical team. We deploy 
            <strong className="text-slate-900 font-semibold"> 24/7 AI Voice Receptionists</strong> that answer every call in under one ring, qualify prospects naturally, and book appointments directly on your clients&apos; calendars.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-medium px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all group text-sm"
            >
              <span>Book Technical Fit Call</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#simulator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 font-medium px-6 py-3.5 rounded-full shadow-2xs transition-all text-sm group"
            >
              <PhoneCall className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" />
              <span>Test Live Voice Front Desk</span>
            </a>
          </div>

          {/* Social Proof / Trust Matrix */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
              <div className="text-2xl font-bold font-mono text-slate-900">&lt; 1 Ring</div>
              <div className="text-xs text-slate-500 mt-0.5">24/7 Instant Answer</div>
            </div>
            <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
              <div className="text-2xl font-bold font-mono text-indigo-600">&lt; 15 Sec</div>
              <div className="text-xs text-slate-500 mt-0.5">Instant WhatsApp Alert</div>
            </div>
            <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
              <div className="text-2xl font-bold font-mono text-slate-900">+30%</div>
              <div className="text-xs text-slate-500 mt-0.5">More Booked Appointments</div>
            </div>
            <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
              <div className="text-2xl font-bold font-mono text-emerald-600">100%</div>
              <div className="text-xs text-slate-500 mt-0.5">Under Your Agency Brand</div>
            </div>
          </div>
        </div>

        {/* Clean, Easy-to-Understand 4-Step Customer Journey Card */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-card p-6 sm:p-8 relative overflow-hidden">
            {/* Header of Preview Box: Clear and Non-Technical */}
            <div className="flex flex-wrap items-center justify-between pb-5 mb-6 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-bold text-slate-900">
                  How It Works: From First Ring to Confirmed Booking
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Automated • Zero Human Delay
                </span>
              </div>
            </div>

            {/* 4 Simple, Human-Friendly Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-indigo-200 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase">
                    Step 1
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  Customer Calls
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  A potential customer calls your client. The AI answers in under 1 ring &mdash; day, night, or weekend.
                </p>
                <div className="mt-4 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg inline-block">
                  ✓ Never hits voicemail
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-amber-200 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase">
                    Step 2
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  AI Speaks &amp; Qualifies
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Speaks with a natural human voice, answers common questions, and checks what service they need.
                </p>
                <div className="mt-4 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg inline-block">
                  ✓ Natural human voice
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-indigo-200 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase">
                    Step 3
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  Instant Calendar Booking
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Checks available times and books the appointment directly on your client&apos;s Google or Outlook calendar.
                </p>
                <div className="mt-4 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-lg inline-block">
                  ✓ Locked on calendar
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-cyan-200 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold tracking-wider text-cyan-600 uppercase">
                    Step 4
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  Instant Client Alert
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Sends full caller summary and phone number to your client&apos;s WhatsApp and CRM in under 15 seconds.
                </p>
                <div className="mt-4 text-[11px] font-medium text-cyan-800 bg-cyan-50 border border-cyan-200/60 px-2.5 py-1 rounded-lg inline-block">
                  ✓ WhatsApp &amp; CRM alert
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
