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
            <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden shrink-0">
              <img
                src="/images/rehan.jpg"
                alt="Muhammad Rehan"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <span className="font-bold text-slate-950 text-sm">
                Muhammad Rehan
              </span>
              <p className="text-xs text-slate-500">
                Agency Automation &amp; Voice AI Infrastructure
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
              Muhammad Rehan
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
            <span>© 2026 Muhammad Rehan. All rights reserved.</span>
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
