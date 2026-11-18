"use client";

import React from "react";
import { Check, Shield, Zap, Sparkles, ArrowRight } from "lucide-react";

const TIERS = [
  {
    name: "White-Label Execution Partner",
    badge: "Most Popular for Agencies",
    price: "Custom / Per Client",
    description: "We embed inside your agency Slack as your dedicated AI engineering department. You bill the client $1,500–$3,500/mo; we handle 100% of the build & maintenance.",
    features: [
      "White-labeled under your agency brand",
      "24/7 Voice AI phone receptionists",
      "n8n workflow architecture & monitoring",
      "Twilio / WebRTC telephony configuration",
      "Client CRM & Google Calendar synchronization",
      "Dedicated Slack / WhatsApp communication"
    ],
    cta: "Apply for Agency Partnership",
    highlight: true
  },
  {
    name: "14-Day Rapid Build Sprint",
    badge: "Fixed-Scope Turnkey",
    price: "Fixed Project Fee",
    description: "Need a high-impact AI solution deployed for a specific client fast? We design, test, and ship complete custom systems in two weeks flat.",
    features: [
      "Complete custom system delivery in 14 days",
      "Production-hardened n8n workflows",
      "Full integration with client's CRM/database",
      "Custom voice prompts & objection handling",
      "Staff onboarding & video documentation",
      "30-day post-launch warranty & tuning"
    ],
    cta: "Book Sprint Discovery Call",
    highlight: false
  },
  {
    name: "Fractional Technical Lead",
    badge: "For Established Agencies",
    price: "Monthly Retainer",
    description: "Ongoing senior engineering leadership for agencies scaling beyond 10+ clients. We build proprietary agency OS tools, audit pipelines, and train your junior team.",
    features: [
      "Dedicated weekly engineering sprint hours",
      "Proprietary agency dashboard & portal development",
      "Priority emergency bug fixes (<2h turnaround)",
      "Architecture reviews & token cost optimization",
      "Direct technical presence on high-ticket client calls"
    ],
    cta: "Inquire for Retainer Availability",
    highlight: false
  }
];

export default function PartnershipModels() {
  return (
    <section className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>FLEXIBLE ENGAGEMENT MODELS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            How Agencies Work With Us.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Zero payroll overhead, zero equity dilution. Just plug-and-play elite engineering capacity whenever your agency needs it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                tier.highlight
                  ? "bg-slate-950 text-white shadow-soft-hover border-2 border-indigo-500 scale-105 z-10"
                  : "bg-slate-50 text-slate-900 border border-slate-200/90 shadow-soft-card"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[11px] font-mono font-medium px-2.5 py-1 rounded-full ${
                      tier.highlight
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200/80 text-slate-700"
                    }`}
                  >
                    {tier.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold tracking-tight mb-2">
                  {tier.name}
                </h3>
                <div className={`text-2xl font-mono font-extrabold mb-4 ${tier.highlight ? "text-indigo-300" : "text-slate-900"}`}>
                  {tier.price}
                </div>
                <p className={`text-xs leading-relaxed mb-6 ${tier.highlight ? "text-slate-300" : "text-slate-600"}`}>
                  {tier.description}
                </p>

                <div className={`pt-6 border-t ${tier.highlight ? "border-slate-800" : "border-slate-200"} space-y-3`}>
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tier.highlight ? "text-indigo-400" : "text-emerald-600"}`} />
                      <span className={tier.highlight ? "text-slate-200" : "text-slate-700"}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6">
                <a
                  href="#contact"
                  className={`w-full inline-flex items-center justify-center gap-2 text-xs font-semibold py-3 px-4 rounded-xl transition-all shadow-xs ${
                    tier.highlight
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
