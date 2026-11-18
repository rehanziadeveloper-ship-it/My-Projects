"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, Calendar, ArrowRight, Menu, X, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand: Clean Personal Brand "Muhammad Rehan" */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border-2 border-slate-200/90 overflow-hidden shadow-xs shrink-0 group-hover:scale-105 transition-transform bg-slate-100">
              <img
                src="/images/rehan.jpg"
                alt="Muhammad Rehan"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <span className="font-bold text-slate-950 tracking-tight text-lg font-sans">
                Muhammad Rehan
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-white/70 border border-slate-200/80 rounded-full px-4 py-1.5 shadow-xs backdrop-blur-sm">
            <a
              href="#solutions"
              className="text-xs font-medium text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              Solutions
            </a>
            <a
              href="#projects"
              className="text-xs font-medium text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              Live Systems
              <span className="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.2 rounded-full border border-indigo-200/50">
                7 Active
              </span>
            </a>
            <a
              href="#simulator"
              className="text-xs font-medium text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              Interactive Demo
            </a>
            <a
              href="#calculator"
              className="text-xs font-medium text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              ROI Engine
            </a>
            <a
              href="#architecture"
              className="text-xs font-medium text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              Architecture
            </a>
            <a
              href="#founder"
              className="text-xs font-medium text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              About
            </a>
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 px-3.5 py-1.5 rounded-full transition-all"
              title="Admin Panel for Project Management"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin Panel</span>
            </Link>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all group"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>Partner With Us</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-700"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 mt-3 shadow-lg">
          <a
            href="#solutions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Solutions
          </a>
          <a
            href="#projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Live Systems
          </a>
          <a
            href="#simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Interactive Voice Demo
          </a>
          <a
            href="#calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            ROI Engine
          </a>
          <a
            href="#founder"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            About Muhammad Rehan
          </a>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-700 bg-slate-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Admin Panel</span>
            </Link>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center px-4 py-2.5 rounded-xl bg-slate-950 text-white text-sm font-medium"
            >
              Book Technical Fit Call
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
