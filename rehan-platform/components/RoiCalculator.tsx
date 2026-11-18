"use client";

import React, { useState } from "react";
import { Calculator, DollarSign, TrendingUp, Sparkles, ArrowRight } from "lucide-react";

export default function RoiCalculator() {
  const [clientCount, setClientCount] = useState<number>(5);
  const [monthlyCallsPerClient, setMonthlyCallsPerClient] = useState<number>(180);
  const [dealValue, setDealValue] = useState<number>(850);
  const [missedCallRate, setMissedCallRate] = useState<number>(25);

  // Calculations
  const missedCallsPerClient = Math.round((monthlyCallsPerClient * missedCallRate) / 100);
  const totalAgencyMissedCalls = missedCallsPerClient * clientCount;
  
  // Assuming a conservative 15% conversion on answered inbound leads
  const lostDealsPerMonth = Math.round(totalAgencyMissedCalls * 0.15);
  const monthlyLeakedRevenue = lostDealsPerMonth * dealValue;
  const annualLeakedRevenue = monthlyLeakedRevenue * 12;

  // Potential revenue saved by 24/7 AI answering (estimated 80% capture)
  const rescuedRevenue = Math.round(monthlyLeakedRevenue * 0.8);

  return (
    <section id="calculator" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
            <Calculator className="w-3.5 h-3.5 text-indigo-600" />
            <span>AGENCY REVENUE IMPACT MODEL</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            Calculate How Much Revenue Your Clients Are Losing to Voicemail.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Adjust the sliders below to see the hidden pipeline leak across your agency&apos;s client portfolio.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="max-w-5xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-soft-card grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Slider 1: Active Clients */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold text-slate-900 mb-2">
                <span>Active Agency Clients</span>
                <span className="font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                  {clientCount} Clients
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={clientCount}
                onChange={(e) => setClientCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>1 Client</span>
                <span>25 Clients</span>
                <span>50 Clients</span>
              </div>
            </div>

            {/* Slider 2: Inbound Calls */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold text-slate-900 mb-2">
                <span>Monthly Inbound Calls (per client)</span>
                <span className="font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                  {monthlyCallsPerClient} Calls
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={monthlyCallsPerClient}
                onChange={(e) => setMonthlyCallsPerClient(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>50</span>
                <span>500</span>
                <span>1,000</span>
              </div>
            </div>

            {/* Slider 3: Average Deal / Client Lifetime Value */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold text-slate-900 mb-2">
                <span>Client&apos;s Average Customer Deal Value</span>
                <span className="font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                  ${dealValue.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={dealValue}
                onChange={(e) => setDealValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>$100</span>
                <span>$2,500</span>
                <span>$5,000</span>
              </div>
            </div>

            {/* Slider 4: Missed Call Rate */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold text-slate-900 mb-2">
                <span>Estimated Inbound Call Miss Rate</span>
                <span className="font-mono text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-100">
                  {missedCallRate}% (Industry avg: 24%)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={missedCallRate}
                onChange={(e) => setMissedCallRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>10%</span>
                <span>35%</span>
                <span>60%</span>
              </div>
            </div>
          </div>

          {/* Results Column (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
                PIPELINE RECOVERY ESTIMATE
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 tracking-tight">
                +${rescuedRevenue.toLocaleString()}
                <span className="text-xs font-sans font-normal text-slate-500"> / month</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Estimated monthly pipeline rescued across your {clientCount} clients by capturing calls in &lt;1 ring.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Missed Inbound Calls:</span>
                  <span className="font-mono font-semibold text-slate-800">{totalAgencyMissedCalls} calls/mo</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Estimated Lost Deals:</span>
                  <span className="font-mono font-semibold text-rose-600">~{lostDealsPerMonth} deals/mo</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Annual Pipeline Leaked:</span>
                  <span className="font-mono font-semibold text-slate-800">${annualLeakedRevenue.toLocaleString()}/yr</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <a
                href="#contact"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-medium py-3 px-4 rounded-xl shadow-xs transition-all"
              >
                <span>Rescue This Revenue for Your Agency</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
