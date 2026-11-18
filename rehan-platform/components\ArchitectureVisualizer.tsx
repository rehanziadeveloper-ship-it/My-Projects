"use client";

import React, { useState } from "react";
import { PhoneCall, Calendar, CheckCircle2, MessageSquare, ShieldCheck, Sparkles, Clock, ArrowRight, UserCheck } from "lucide-react";

const SYSTEM_PILLARS = [
  {
    id: "capture",
    step: "01",
    tabTitle: "100% Inbound Lead Capture",
    tabDesc: "Never miss a customer call",
    headline: "Zero Missed Calls, Day or Night",
    description: "Every inbound call, weekend inquiry, or evening form submission is answered on the very first ring. Your clients never lose another prospect to a local competitor again.",
    benefits: [
      "Answers within 1 ring — 24 hours a day, 7 days a week",
      "Handles multiple incoming callers at the exact same time",
      "Eliminates voicemail hang-ups and lost revenue"
    ],
    preview: {
      tag: "INBOUND CALL STATUS",
      title: "Incoming Customer Call",
      metric1Label: "Answer Speed",
      metric1Value: "0.8 Seconds",
      metric2Label: "Voicemail Rate",
      metric2Value: "0%",
      detail: "Answered on 1st ring with personalized greeting.",
      status: "Call Answered Instantly"
    }
  },
  {
    id: "conversation",
    step: "02",
    tabTitle: "Natural Human Conversations",
    tabDesc: "Friendly, intelligent screening",
    headline: "Natural Receptionist Quality",
    description: "Speaks with human warmth and natural conversational pauses. Understands caller intent, answers common service questions, and verifies the caller is a qualified customer.",
    benefits: [
      "Natural conversational voice with human pacing",
      "Answers pricing, location, and service questions accurately",
      "Filters out spam calls and non-serious inquiries"
    ],
    preview: {
      tag: "CONVERSATION QUALITY",
      title: "Friendly Triage & Screening",
      metric1Label: "Intent Accuracy",
      metric1Value: "99.4%",
      metric2Label: "Voice Pacing",
      metric2Value: "Natural Human",
      detail: "Qualified customer need & verified appointment readiness.",
      status: "Lead Pre-Qualified"
    }
  },
  {
    id: "booking",
    step: "03",
    tabTitle: "Direct Calendar Booking",
    tabDesc: "Zero back-and-forth scheduling",
    headline: "Real-Time Appointment Scheduling",
    description: "Directly locks qualified appointments into your client's existing Google or Outlook calendar. Automatically sends email and SMS confirmation reminders to prevent no-shows.",
    benefits: [
      "Checks available open times in real time",
      "Locks the booking directly on your client's calendar",
      "Automated reminder sequences eliminate client no-shows"
    ],
    preview: {
      tag: "CALENDAR SYNCHRONIZATION",
      title: "Confirmed Appointment",
      metric1Label: "Calendar Sync",
      metric1Value: "Instant Direct",
      metric2Label: "No-Show Shield",
      metric2Value: "SMS Queued",
      detail: "Slot reserved with automated calendar invite sent to customer.",
      status: "Appointment Confirmed"
    }
  },
  {
    id: "dispatch",
    step: "04",
    tabTitle: "Sub-15s Client Alerts",
    tabDesc: "Instant WhatsApp & CRM briefings",
    headline: "Instant WhatsApp & Mobile Dossier",
    description: "The moment an appointment is booked, your client receives a clean WhatsApp or SMS briefing with the customer's name, phone number, service requested, and full call summary.",
    benefits: [
      "Dispatched to your client's mobile phone in under 15 seconds",
      "Clear 3-bullet briefing on what the customer wants",
      "Includes 1-tap button to call or message the client back"
    ],
    preview: {
      tag: "INSTANT NOTIFICATION",
      title: "Client WhatsApp Dossier",
      metric1Label: "Alert Time",
      metric1Value: "< 15 Seconds",
      metric2Label: "Summary Format",
      metric2Value: "3-Bullet Brief",
      detail: "Full lead details and recording delivered to business owner.",
      status: "Dispatched to WhatsApp"
    }
  }
];

export default function ArchitectureVisualizer() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const activePillar = SYSTEM_PILLARS[activeStageIndex];

  return (
    <section id="architecture" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>OUR 4 DELIVERY GUARANTEES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            How We Guarantee Every Lead Is Captured &amp; Booked.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Engineered for 100% reliability. Every solution we deploy for your agency is built to deliver these four outcomes without fail.
          </p>
        </div>

        {/* 4 Interactive Guarantee Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto mb-8">
          {SYSTEM_PILLARS.map((pillar, idx) => (
            <button
              key={pillar.id}
              onClick={() => setActiveStageIndex(idx)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeStageIndex === idx
                  ? "bg-slate-950 text-white border-slate-950 shadow-md"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="text-[11px] font-bold opacity-60 mb-1">
                STEP {pillar.step}
              </div>
              <div className="text-sm font-bold truncate">
                {pillar.tabTitle}
              </div>
              <div className={`text-xs mt-1 truncate ${activeStageIndex === idx ? "text-indigo-300" : "text-slate-500"}`}>
                {pillar.tabDesc}
              </div>
            </button>
          ))}
        </div>

        {/* Deep Dive Card: Clean, Visual, Non-Technical */}
        <div className="max-w-5xl mx-auto bg-slate-50 rounded-3xl p-6 sm:p-10 shadow-soft-card grid grid-cols-1 lg:grid-cols-12 gap-8 border border-slate-200">
          {/* Left Column: Outcome & Benefits (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  GUARANTEE {activePillar.step}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {activePillar.tabDesc}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                {activePillar.headline}
              </h3>

              <p className="mt-4 text-sm text-slate-600 leading-relaxed font-normal">
                {activePillar.description}
              </p>

              <div className="mt-6 space-y-3">
                {activePillar.benefits.map((benefit, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Included in every agency deployment with zero maintenance headaches</span>
            </div>
          </div>

          {/* Right Column: Visual Live Outcome Box (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <span className="text-[11px] font-bold text-indigo-600 tracking-wider uppercase">
                  {activePillar.preview.tag}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {activePillar.preview.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 mb-2">
                {activePillar.preview.title}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activePillar.preview.detail}
              </p>

              {/* Visual Metric Pillars */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-center">
                  <div className="text-base font-bold text-slate-900">
                    {activePillar.preview.metric1Value}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {activePillar.preview.metric1Label}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-center">
                  <div className="text-base font-bold text-emerald-600">
                    {activePillar.preview.metric2Value}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {activePillar.preview.metric2Label}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Automatic Client Delivery</span>
              <span className="font-semibold text-slate-900">100% Autonomous</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
