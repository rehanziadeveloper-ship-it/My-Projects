"use client";

import React, { useState, useEffect } from "react";
import { Project, ProjectCategory } from "@/lib/types";
import { ExternalLink, Sparkles, Server, CheckCircle2, RefreshCw, Cpu, Layers, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function ProjectsShowcase({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>("All Systems");
  const [isLoading, setIsLoading] = useState(false);
  const [showAllSolutions, setShowAllSolutions] = useState(false);

  const categories: ProjectCategory[] = [
    "All Systems",
    "Full-Stack OS Portals",
    "Voice AI Agents",
    "n8n Orchestration"
  ];

  // Refresh projects from /api/projects dynamically
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success && data.projects) {
        setProjects(data.projects);
      }
    } catch (e) {
      console.error("Failed to refresh live projects:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = selectedCategory === "All Systems"
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  // Exactly 6 solutions displayed initially
  const displayedProjects = showAllSolutions ? filteredProjects : filteredProjects.slice(0, 6);
  const hasMoreSolutions = filteredProjects.length > 6;

  return (
    <section id="projects" className="py-24 bg-dot-matrix relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE AGENCY SOLUTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
              Battle-Tested Solutions Built for Live Production.
            </h2>
            <p className="mt-3 text-base text-slate-600 max-w-2xl">
              Real-world systems actively solving client bottlenecks. Tested with live traffic, zero dummy data, and full API integration.
            </p>
          </div>

          {/* Live Sync Status */}
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-2xs flex items-center gap-3">
              <div className="text-left">
                <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  Auto-Publish Webhook
                </div>
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Live Sync Active
                </div>
              </div>
              <button
                onClick={fetchProjects}
                disabled={isLoading}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Refresh projects list"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setShowAllSolutions(false);
              }}
              className={`text-xs font-medium px-4 py-2 rounded-full border transition-all ${
                selectedCategory === cat
                  ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100/70"
              }`}
            >
              {cat}
              {cat === "All Systems" && ` (${projects.length})`}
            </button>
          ))}
        </div>

        {/* Dynamic Solutions Grid (Showing 6 initially) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-soft-card hover:shadow-soft-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Image of the Solution */}
                <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 border border-slate-200/80 bg-slate-900 relative group/img">
                  <img
                    src={project.image || "/images/solutions/kpk-tours.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                  />
                  {/* Category Pill Overlay */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80 text-[10px] font-mono text-slate-200">
                    {project.category}
                  </div>
                  {/* Status Badge Overlay */}
                  <div className="absolute top-3 right-3 bg-emerald-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-600/60 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{project.badge || "Live Verified"}</span>
                  </div>
                </div>

                {/* Solution Title */}
                <h3 className="text-base font-bold text-slate-950 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-1">
                  {project.title}
                </h3>

                {/* Exactly Two-Line Description About Solution (NOT tools) */}
                <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2 h-9 font-normal">
                  {project.description}
                </p>

                {/* Performance Metrics */}
                {project.metrics && project.metrics.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                    {project.metrics.slice(0, 2).map((m, idx) => (
                      <div key={idx} className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-2 text-center">
                        <div className="text-xs font-mono font-bold text-slate-900">{m.value}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: Watch Live System with GitHub Link */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-indigo-600 text-white text-xs font-medium py-2.5 px-4 rounded-xl shadow-xs transition-colors group/btn"
                >
                  <span>Watch Live System</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                    title="View GitHub Repository"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Button to See More Solutions */}
        {hasMoreSolutions && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAllSolutions(!showAllSolutions)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-2xs hover:shadow-xs transition-all text-xs font-semibold group"
            >
              {showAllSolutions ? (
                <>
                  <span>Show Fewer Solutions</span>
                  <ChevronUp className="w-4 h-4 text-slate-500 group-hover:-translate-y-0.5 transition-transform" />
                </>
              ) : (
                <>
                  <span>See More Solutions ({filteredProjects.length - 6} more)</span>
                  <ChevronDown className="w-4 h-4 text-slate-500 group-hover:translate-y-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Admin Auto-Upload Notice Box */}
        <div className="mt-14 bg-white border border-dashed border-indigo-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Connected to Muhammad Rehan&apos;s Deployment Pipeline
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Whenever a new system is built, it automatically publishes to this live showcase via the n8n webhook API.
              </div>
            </div>
          </div>

          <a
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            <span>Admin Panel (/admin)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
