"use client";

import React, { useState, useEffect } from "react";
import { PhoneCall, Play, Square, Volume2, Sparkles, Check, CheckCircle, RefreshCw, Send, ArrowRight } from "lucide-react";

interface ScriptStep {
  speaker: "agent" | "caller" | "system";
  text: string;
  delayMs: number;
}

const SCENARIOS = [
  {
    id: "agency",
    title: "Agency Strategy Fit Call",
    callerDesc: "Marketing Agency Owner looking to automate client intake",
    dialogue: [
      { speaker: "agent", text: "Thanks for calling ZeroLoss AI! I'm the agency automation concierge. Are you looking to eliminate missed calls for your agency's clients, or automate internal pipelines?", delayMs: 1200 },
      { speaker: "caller", text: "We have 15 local business clients and they keep missing calls from our Google Ads campaigns. We need a 24/7 front desk.", delayMs: 2500 },
      { speaker: "agent", text: "Understood. ZeroLoss AI answers in under 1 ring, qualifies the lead, and books straight into your client's calendar. Would you like to schedule a 15-minute technical demo with our engineering team?", delayMs: 2800 },
      { speaker: "caller", text: "Yes, tomorrow at 3 PM PKT / 10 AM GMT works great.", delayMs: 2200 },
      { speaker: "agent", text: "Locked in! I've reserved tomorrow at 3 PM. You'll receive a Cal.com calendar invite and WhatsApp confirmation in under 15 seconds.", delayMs: 2400 },
      { speaker: "system", text: "⚡ [Webhook Triggered] Cal.com event created. P0 High Urgency Dossier dispatched to WhatsApp (+92 347 1098310).", delayMs: 1000 }
    ]
  },
  {
    id: "dental",
    title: "Smile Dental Clinic (Healthcare)",
    callerDesc: "Emergency tooth pain patient requesting urgent appointment",
    dialogue: [
      { speaker: "agent", text: "Smile Dental Clinic, this is Sarah, your AI receptionist. Are you calling for a routine checkup or an emergency?", delayMs: 1200 },
      { speaker: "caller", text: "I have severe tooth pain on my lower molar, can I come in today?", delayMs: 2200 },
      { speaker: "agent", text: "I'm so sorry you're in pain. Dr. Sarah has an emergency slot open at 4:15 PM today. Can you make it at that time?", delayMs: 2500 },
      { speaker: "caller", text: "Yes please, 4:15 PM works.", delayMs: 1800 },
      { speaker: "agent", text: "Perfect. I have reserved 4:15 PM for your emergency triage. Please arrive 10 minutes early with your ID.", delayMs: 2200 },
      { speaker: "system", text: "⚡ [Supabase Realtime Sync] New patient slot registered. SMS reminder queued via Twilio.", delayMs: 1000 }
    ]
  },
  {
    id: "realty",
    title: "Raqba Real Estate Brokerage",
    callerDesc: "Investor looking to buy commercial property in Islamabad",
    dialogue: [
      { speaker: "agent", text: "Assalam-o-alaikum! Welcome to Raqba Real Estate. Are you looking to Buy, Rent, or Invest today?", delayMs: 1200 },
      { speaker: "caller", text: "I want to invest in a commercial plot in Islamabad, budget around 3.5 Crore.", delayMs: 2400 },
      { speaker: "agent", text: "Excellent! We have 2 verified commercial inventory options in Blue Area and DHA Phase 2 matching your 3.5 Crore bracket. Let me book a private broker walkthrough.", delayMs: 2900 },
      { speaker: "caller", text: "Book it for Saturday morning.", delayMs: 1800 },
      { speaker: "agent", text: "Done! Saturday at 11:00 AM is scheduled with Lead Commercial Broker. Ref: RQB-2026-4891.", delayMs: 2300 },
      { speaker: "system", text: "⚡ [n8n Master Workflow] Slot-filling verified: Budget=3.5 Cr, City=Islamabad. Google Calendar 1-Click Sync complete.", delayMs: 1000 }
    ]
  }
];

export default function LiveVoiceSimulator() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [audioWaves, setAudioWaves] = useState([20, 45, 75, 30, 85, 60, 40, 90, 50, 30, 70, 45]);

  const activeScenario = SCENARIOS[selectedScenarioIndex];

  // Simulation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIndex < activeScenario.dialogue.length) {
      const step = activeScenario.dialogue[currentStepIndex];
      timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, step.delayMs);
    } else if (isPlaying && currentStepIndex >= activeScenario.dialogue.length) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, activeScenario]);

  // Audio wave animation jitter
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAudioWaves(prev => prev.map(() => Math.floor(Math.random() * 85) + 15));
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const startSimulation = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const stopSimulation = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  return (
    <section id="simulator" className="py-20 bg-white border-y border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>INTERACTIVE TEST ENVIRONMENT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            Hear What Your Clients&apos; Inbound Callers Experience.
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Zero robot monotone. Human-like conversational pacing, instant objection handling, and automatic calendar dispatch.
          </p>

          {/* Scenario Selector Tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {SCENARIOS.map((scenario, idx) => (
              <button
                key={scenario.id}
                onClick={() => {
                  stopSimulation();
                  setSelectedScenarioIndex(idx);
                }}
                className={`text-xs font-medium px-4 py-2 rounded-full border transition-all ${
                  selectedScenarioIndex === idx
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-100/70 text-slate-600 border-slate-200 hover:bg-slate-200/60"
                }`}
              >
                {scenario.title}
              </button>
            ))}
          </div>
        </div>

        {/* The Simulation Console */}
        <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-card">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {activeScenario.title}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {activeScenario.callerDesc}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isPlaying ? (
                <button
                  onClick={stopSimulation}
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium px-4 py-2 rounded-full shadow-xs transition-all"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop Simulation</span>
                </button>
              ) : (
                <button
                  onClick={startSimulation}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-5 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all group"
                >
                  <Play className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
                  <span>Start Live Call Simulation</span>
                </button>
              )}
            </div>
          </div>

          {/* Audio Waveform Visualizer */}
          <div className="py-6 flex items-center justify-center gap-1.5 h-20 bg-white border border-slate-200/90 rounded-2xl my-6">
            {isPlaying ? (
              audioWaves.map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className="w-1.5 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full transition-all duration-100"
                />
              ))
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <span>Click &quot;Start Live Call Simulation&quot; to test conversation flow</span>
              </div>
            )}
          </div>

          {/* Live Transcript Log */}
          <div className="space-y-3 min-h-[220px]">
            {activeScenario.dialogue.slice(0, currentStepIndex).map((step, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl text-xs leading-relaxed transition-all animate-fadeIn ${
                  step.speaker === "agent"
                    ? "bg-indigo-50/70 border border-indigo-100 text-indigo-950 ml-0 mr-12"
                    : step.speaker === "caller"
                    ? "bg-white border border-slate-200 text-slate-800 ml-12 mr-0"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono"
                }`}
              >
                <div className="font-semibold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  {step.speaker === "agent" && (
                    <span className="text-indigo-600">🤖 Autonomous Voice AI</span>
                  )}
                  {step.speaker === "caller" && (
                    <span className="text-slate-500">📞 Agency Client / Inbound Caller</span>
                  )}
                  {step.speaker === "system" && (
                    <span className="text-emerald-700">⚡ Automated Infrastructure Telemetry</span>
                  )}
                </div>
                <div>{step.text}</div>
              </div>
            ))}

            {currentStepIndex === 0 && !isPlaying && (
              <div className="text-center py-8 text-xs text-slate-400 font-mono">
                [Audio channel idle. Waiting for simulation trigger.]
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
