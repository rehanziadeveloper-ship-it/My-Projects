"use client";

import React from "react";
import Link from "next/link";
import { Terminal, Shield, ArrowUp, Heart } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-slate-200/80 py-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-slate-800">
              0<span className="text-emerald-400">L</span>
            </div>
            <div>
              <span className="font-extrabold text-slate-950 text-sm tracking-tight">
                ZeroLoss<span className="text-indigo-600">.ai</span>
              </span>
              <p className="text-xs text-slate-500">
                Zero Missed Calls. Zero Lost Revenue.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
            <a href="#solutions" className="hover:text-slate-950 transition-colors">
              Solutions
            </a>
            <a href="#projects" className="hover:text-slate-950 transition-colors">
              Live Systems
            </a>
            <a href="#simulator" className="hover:text-slate-950 transition-colors">
              Voice Demo
            </a>
            <a href="#calculator" className="hover:text-slate-950 transition-colors">
              ROI Engine
            </a>
            <a href="#founder" className="hover:text-slate-950 transition-colors">
              Founder (Muhammad Rehan)
            </a>
            <Link
              href="/admin"
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>Admin Panel</span>
            </Link>
          </div>

          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
            title="Back to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 ZeroLoss AI. All rights reserved. Founded by Muhammad Rehan.</span>
            <span>•</span>
            <span className="font-mono text-emerald-600">All Systems Operational</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Orchestrated with Next.js 15, n8n &amp; Supabase
          </div>
        </div>
      </div>
    </footer>
  );
}
