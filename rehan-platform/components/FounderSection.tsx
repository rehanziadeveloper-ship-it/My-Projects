"use client";

import React from "react";
import { Mail, Phone, Globe, Award, CheckCircle, Sparkles, ArrowUpRight } from "lucide-react";

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function FounderSection() {
  return (
    <section id="founder" className="py-24 bg-dot-matrix relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-soft-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Founder Avatar / Photo Slot (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-48 h-56 rounded-3xl bg-slate-50 border border-slate-200/90 p-1.5 shadow-md flex items-center justify-center overflow-hidden relative">
                  <div className="w-full h-full rounded-[20px] overflow-hidden bg-slate-100 relative">
                    <img
                      src="/images/rehan.jpg"
                      alt="Muhammad Rehan"
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    />

                    {/* Live status ping */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">AVAILABLE</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-emerald-700 font-mono font-medium flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Verified Senior AI Engineer</span>
                </div>
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-950">
                Muhammad Rehan
              </h3>
              <p className="text-xs font-medium text-indigo-600">
                Founder &amp; Lead AI Architect, ZeroLoss AI
              </p>
              
              {/* Clean, Global Location Indicator */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-full">
                <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Available Worldwide • Remote (UTC+5)</span>
              </div>

              {/* Social / Contact Badges */}
              <div className="mt-5 flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/in/rehan-zia-voiceai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-2xs"
                  title="LinkedIn Profile"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/rehanziadeveloper-ship-it/My-Projects"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors shadow-2xs"
                  title="GitHub Architecture Repository"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
                <a
                  href="mailto:rehanziadeveloper@gmail.com"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-2xs"
                  title="Direct Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/923471098310"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-emerald-600 hover:bg-slate-50 transition-colors shadow-2xs"
                  title="Direct WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right: Technical Dossier & Mission (8 cols) */}
            <div className="lg:col-span-8 lg:border-l lg:border-slate-100 lg:pl-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 mb-4">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>EXECUTIVE PROFILE &amp; PHILOSOPHY</span>
              </div>

              <blockquote className="text-xl sm:text-2xl font-semibold text-slate-900 leading-snug tracking-tight">
                &ldquo;Helping businesses to never miss another inbound call &mdash; booking 30% more appointments without hiring extra staff.&rdquo;
              </blockquote>

              <p className="mt-4 text-sm text-slate-600 leading-relaxed font-normal">
                I operate as a dedicated technical partner and white-label automation engineer for digital marketing, SEO, and lead-gen agencies worldwide. Rather than selling surface-level chatbots, I deploy 24/7 autonomous Voice AI phone receptionists and automated booking systems that turn missed inquiries into guaranteed client revenue.
              </p>

              {/* Core Non-Negotiables */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Zero Missed Calls</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    100% first-ring answer rate 24/7 with instant triage and calendar slot booking.
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Production Reliability</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Sub-second instant response times and automated error recovery built in.
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>White-Label Native</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Everything we deploy is branded under your agency. You own the client relationship.
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>High Execution Velocity</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    7 to 14-day turnkey sprint deliveries for your client onboarding pipelines.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
