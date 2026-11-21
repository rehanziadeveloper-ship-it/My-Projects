"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight, Clock, DollarSign, Users, Zap } from "lucide-react";

export default function ProblemVsSolution() {
  return (
    <section id="solutions" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>THE REAL AGENCY BOTTLENECK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            Why Agency Clients Churn Even When Your Ads Generate Leads.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            You drive 200+ leads for your client, but their front desk misses calls, takes 3 hours to reply to forms, and blames your agency for &quot;bad lead quality.&quot; Here is how we fix it.
          </p>
        </div>

        {/* Side-by-side Bento Contrast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: The Leaky Status Quo */}
          <div className="bg-rose-50/40 border border-rose-200/80 rounded-3xl p-8 relative shadow-2xs">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700">
                WITHOUT AUTOMATION (THE LEAKY FUNNEL)
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Inbound Calls Hit Voicemail</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Up to 35% of inbound callers hang up and call the next competitor on Google. Voicemails are checked 4+ hours later.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Slow Follow-Up Destroys Conversion</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Studies prove speed-to-lead drops 391% if not contacted within 5 minutes. Most agency clients take 45+ minutes to email back.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">High Payroll & Fragile Freelancers</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Full-time US receptionists cost $4,000/mo and only work 9-5. Cheap freelancers write fragile code that breaks the moment API specs change.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Client Blames Your Agency</div>
                  <div className="text-xs text-slate-600 mt-1">
                    The client churns after 60 days, telling you &quot;Facebook leads don&apos;t convert,&quot; when in reality, their sales intake failed.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: The Nexus AI Infrastructure Layer */}
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-3xl p-8 relative shadow-2xs">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                WITH ZEROLOSS AI INFRASTRUCTURE
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">100% Inbound Capture on 1st Ring</div>
                  <div className="text-xs text-slate-600 mt-1">
                    24/7 conversational voice agent answers instantly. Speaks naturally, answers FAQs, and qualifies the prospect on the spot.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Sub-15s Speed-to-Lead Triage</div>
                  <div className="text-xs text-slate-600 mt-1">
                    The moment a form or call comes in, n8n triages sentiment, validates urgency (P0/P1/P2), and alerts the client via WhatsApp with a 1-tap call button.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Direct Calendar Booking (Cal.com / Google)</div>
                  <div className="text-xs text-slate-600 mt-1">
                    The voice bot checks open slots in real-time, books the appointment directly into the client&apos;s schedule, and sends automated reminder SMS.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">White-Label Agency Retention</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Your agency sells this as your proprietary &quot;AI Front Desk OS&quot;. You retain the client for years and boost your monthly retainer fees.
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
