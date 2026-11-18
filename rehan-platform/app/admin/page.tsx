"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import { 
  Lock, 
  KeyRound, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ArrowLeft, 
  Upload, 
  Zap, 
  RefreshCw, 
  Sparkles, 
  LogOut, 
  ShieldCheck,
  Search,
  Check,
  Image as ImageIcon
} from "lucide-react";

// Inline Github Icon for consistency
function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// Hardcoded Master Admin Passcode (Must remain 2092007)
const MASTER_ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PIN || "2092007";

// Preset Available Solution Screenshots
const PRESET_IMAGES = [
  { label: "KPK Tours (Fleet & Reservation)", value: "/images/solutions/kpk-tours.png" },
  { label: "Smile Dental Clinic (Practice OS)", value: "/images/solutions/smile-dental.png" },
  { label: "Raqba (Real Estate Brokerage)", value: "/images/solutions/raqba.png" },
  { label: "Post-Call Intelligence (Triage)", value: "/images/solutions/post-call-intelligence.png" },
  { label: "Apex Realty (Buyer Voice Agent)", value: "/images/solutions/apex-realty.png" },
  { label: "Heritage Bistro (Table Reservations)", value: "/images/solutions/heritage-bistro.png" },
  { label: "Lead Hunter (B2B Lead Acquisition)", value: "/images/solutions/lead-hunter.png" }
];

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string>("");
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Copy Feedback States
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showCurlModal, setShowCurlModal] = useState(false);

  // Form State
  const [formState, setFormState] = useState({
    title: "",
    category: "Full-Stack OS Portals",
    liveUrl: "",
    githubUrl: "",
    image: "/images/solutions/kpk-tours.png",
    description: "",
    badge: "Production Live",
    techStack: "Voice AI, Next.js, Supabase",
    metric1Label: "Response Time",
    metric1Value: "< 1 Ring",
    metric2Label: "Lead Capture",
    metric2Value: "100%",
    featured: false
  });

  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Check session storage on mount
  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem("rehan_admin_unlocked");
      if (storedAuth === "true") {
        setIsAuthenticated(true);
      }
    } catch (e) {
      // In SSR or restricted storage
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  // Fetch projects on load when authenticated
  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  // Handle Passcode Submission
  const handlePasscodeUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError("");

    if (passcodeInput.trim() === MASTER_ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem("rehan_admin_unlocked", "true");
      } catch (err) {}
    } else {
      setPasscodeError("Invalid security code. Please enter the correct master passkey.");
      setPasscodeInput("");
    }
  };

  const handleLockPanel = () => {
    try {
      sessionStorage.removeItem("rehan_admin_unlocked");
    } catch (err) {}
    setIsAuthenticated(false);
    setPasscodeInput("");
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setFeedback(null);

    const payload = {
      title: formState.title,
      category: formState.category,
      liveUrl: formState.liveUrl,
      githubUrl: formState.githubUrl || "https://github.com/rehanziadeveloper-ship-it/My-Projects",
      image: formState.image,
      description: formState.description,
      badge: formState.badge,
      techStack: formState.techStack.split(",").map(s => s.trim()).filter(Boolean),
      metrics: [
        { label: formState.metric1Label, value: formState.metric1Value },
        { label: formState.metric2Label, value: formState.metric2Value }
      ],
      featured: formState.featured
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "rehan_voiceai_secret_key_2026"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({ type: "success", message: `"${formState.title}" uploaded and live on the website!` });
        setFormState({
          title: "",
          category: "Full-Stack OS Portals",
          liveUrl: "",
          githubUrl: "",
          image: "/images/solutions/kpk-tours.png",
          description: "",
          badge: "Production Live",
          techStack: "Voice AI, Next.js, Supabase",
          metric1Label: "Response Time",
          metric1Value: "< 1 Ring",
          metric2Label: "Lead Capture",
          metric2Value: "100%",
          featured: false
        });
        loadProjects();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to publish." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Network error." });
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the live website?`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        loadProjects();
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert("Failed to delete project.");
    }
  };

  // Filtered projects for the table
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === "All" || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // -------------------------------------------------------------
  // RENDER: Lock Screen if not authenticated
  // -------------------------------------------------------------
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-slate-500 font-medium text-xs flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 bg-dot-matrix">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 shadow-soft-card text-center relative overflow-hidden">
          {/* Avatar Header */}
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs">
              <img
                src="/images/rehan.jpg"
                alt="Muhammad Rehan"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white shadow-xs">
              <Lock className="w-3 h-3" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Admin Panel Access
          </h1>
          <p className="text-xs text-slate-600 mt-2 mb-6">
            Restricted control center for Muhammad Rehan. Enter your security code to manage live solutions.
          </p>

          <form onSubmit={handlePasscodeUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter Security Code..."
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                className="w-full text-center tracking-widest text-base font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal"
              />
            </div>

            {passcodeError && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                {passcodeError}
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-indigo-600 text-white font-medium text-xs py-3.5 px-6 rounded-xl shadow-xs transition-all"
            >
              <KeyRound className="w-4 h-4 text-indigo-300" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900 flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </Link>
            <span className="text-[11px] text-slate-400 font-medium">
              PIN Protected
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Full Admin Panel (When Unlocked)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navbar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl px-5 py-3.5 shadow-2xs flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Live Website</span>
          </Link>

          {/* Center Identity */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200">
              <img src="/images/rehan.jpg" alt="Muhammad Rehan" className="w-full h-full object-cover object-top" />
            </div>
            <span className="text-xs font-bold text-slate-900">Muhammad Rehan</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Admin Session Active
            </span>
          </div>

          <button
            onClick={handleLockPanel}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-3.5 py-1.5 rounded-xl transition-all"
            title="Lock Admin Panel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Panel</span>
          </button>
        </div>

        {/* Dashboard Header & Overview Metric Cards */}
        <div>
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-indigo-600" />
              <span>Admin Control Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Easily manage live agency solutions, preview screenshots, or publish new systems with automatic live sync.
            </p>
          </div>

          {/* 4 Clean Metric Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Live Solutions</div>
              <div className="text-2xl font-bold text-slate-950 mt-1">{projects.length} Systems</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Displayed on Homepage
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Automated Sync</div>
              <div className="text-2xl font-bold text-slate-950 mt-1">n8n Ready</div>
              <div className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 mt-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Webhook Listening
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Security Gate</div>
              <div className="text-2xl font-bold text-slate-950 mt-1">Passcode</div>
              <div className="text-[11px] text-slate-600 font-medium mt-1">
                PIN Protected Access
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Founder Photo</div>
              <div className="text-2xl font-bold text-slate-950 mt-1">Verified</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <Check className="w-3 h-3" />
                Active Across Site
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2.5 ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Main Grid: Publish Form (Left) & Automation Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Simplified & Clean Publish Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-soft-card">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  <span>Publish New Solution</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fill in these details to showcase a new live client system on your homepage.
                </p>
              </div>
            </div>

            <form onSubmit={handlePublish} className="space-y-5">
              
              {/* Section 1: Core System Info */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    Solution Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Voice AI Front Desk"
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 mb-1">
                      Category *
                    </label>
                    <select
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option>Full-Stack OS Portals</option>
                      <option>Voice AI Agents</option>
                      <option>n8n Orchestration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-900 mb-1">
                      Status Badge
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Production Live, Live Demo"
                      value={formState.badge}
                      onChange={(e) => setFormState({ ...formState, badge: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 mb-1">
                      Live System Website URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://your-client-site.vercel.app"
                      value={formState.liveUrl}
                      onChange={(e) => setFormState({ ...formState, liveUrl: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-900 mb-1">
                      GitHub Repository Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/rehanziadeveloper-ship-it/..."
                      value={formState.githubUrl}
                      onChange={(e) => setFormState({ ...formState, githubUrl: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Screenshot Image with Live Thumbnail Preview */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Solution Screenshot (Real Browser Image)</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Live Preview</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-full sm:w-2/3">
                    <select
                      value={formState.image}
                      onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {PRESET_IMAGES.map((img) => (
                        <option key={img.value} value={img.value}>
                          {img.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Selected: <code className="text-slate-700">{formState.image}</code>
                    </p>
                  </div>

                  {/* Thumbnail Preview Box */}
                  <div className="w-full sm:w-1/3 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={formState.image}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Two-Line Business Description (No Tools) */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Business Description (Client Outcome, No Tools) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Answers 24/7 patient inquiries, schedules appointments on live clinic calendars, and cuts no-shows."
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Section 4: Key Metrics */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Key Results / Metrics
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Value: < 1 Ring"
                      value={formState.metric1Value}
                      onChange={(e) => setFormState({ ...formState, metric1Value: e.target.value })}
                      className="w-1/2 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Label: Speed"
                      value={formState.metric1Label}
                      onChange={(e) => setFormState({ ...formState, metric1Label: e.target.value })}
                      className="w-1/2 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Value: 100%"
                      value={formState.metric2Value}
                      onChange={(e) => setFormState({ ...formState, metric2Value: e.target.value })}
                      className="w-1/2 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Label: Inbound"
                      value={formState.metric2Label}
                      onChange={(e) => setFormState({ ...formState, metric2Label: e.target.value })}
                      className="w-1/2 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={publishing}
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-3.5 px-6 rounded-xl shadow-xs transition-all"
              >
                {publishing ? (
                  <span>Publishing to Website...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload &amp; Publish Project to Website</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Clear Automation Card (Zero Code Jargon) (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Clean Light-Themed Automation Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-soft-card">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span>Automatic Upload (n8n Webhook)</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Whenever you finish building a system in <strong>n8n</strong> or deploy a new client project, it can automatically publish directly to your website with zero manual typing.
              </p>

              {/* Clean Copyable Fields (No ugly code block!) */}
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Webhook POST URL
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/projects`);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-xs font-medium text-slate-900 break-all select-all">
                    /api/projects
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      API Authorization Key
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("rehan_voiceai_secret_key_2026");
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-xs font-medium text-slate-900 select-all">
                    rehan_voiceai_secret_key_2026
                  </div>
                </div>
              </div>

              {/* Optional cURL toggle for technical reference */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCurlModal(!showCurlModal)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                >
                  <span>{showCurlModal ? "Hide Technical Details" : "Show cURL Command Example"}</span>
                </button>

                {showCurlModal && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto">
                    curl -X POST https://your-domain.vercel.app/api/projects \<br/>
                    &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \<br/>
                    &nbsp;&nbsp;-H &quot;x-api-key: rehan_voiceai_secret_key_2026&quot; \<br/>
                    &nbsp;&nbsp;-d &apos;&#123;&quot;title&quot;: &quot;New System&quot;, &quot;liveUrl&quot;: &quot;https://...&quot;&#125;&apos;
                  </div>
                )}
              </div>
            </div>

            {/* Founder Profile Photo Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft-card">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Founder Profile: Synchronized</span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-2xs shrink-0">
                  <img
                    src="/images/rehan.jpg"
                    alt="Muhammad Rehan"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="text-xs text-slate-600">
                  <div className="font-bold text-slate-950">Muhammad Rehan</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Official portrait active across Navbar, Founder Section, and Footer.
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-1">
                    Available Worldwide • Remote (UTC+5)
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM SECTION: Redesigned Active Live Solutions Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-card">
          
          {/* Table Header with Search and Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <span>Active Published Solutions</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {projects.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All client systems actively visible to visitors on your live website.
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search solutions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44 sm:w-56"
                />
              </div>

              {/* Category Filter Chips */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Full-Stack OS Portals">Full-Stack OS Portals</option>
                <option value="Voice AI Agents">Voice AI Agents</option>
                <option value="n8n Orchestration">n8n Orchestration</option>
              </select>

              <button
                onClick={loadProjects}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Refresh live list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
              </button>
            </div>
          </div>

          {/* Clean Modern SaaS Table (No Raw Monospace Typewriter Font!) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="pb-3.5 pr-4">Solution</th>
                  <th className="pb-3.5 pr-4">Category</th>
                  <th className="pb-3.5 pr-4">Live Status</th>
                  <th className="pb-3.5 pr-4">Live Deployment</th>
                  <th className="pb-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No solutions found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors group">
                      
                      {/* Column 1: Image Thumbnail + Title & Description */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200/80 bg-slate-900 shrink-0">
                            <img
                              src={proj.image || "/images/solutions/kpk-tours.png"}
                              alt={proj.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <div className="font-semibold text-slate-950 group-hover:text-indigo-600 transition-colors truncate">
                              {proj.title}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {proj.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Category Pill */}
                      <td className="py-4 pr-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60 whitespace-nowrap">
                          {proj.category}
                        </span>
                      </td>

                      {/* Column 3: Live Status Badge */}
                      <td className="py-4 pr-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{proj.badge || "Production Live"}</span>
                        </span>
                      </td>

                      {/* Column 4: Live Link Button */}
                      <td className="py-4 pr-4">
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 text-xs font-medium transition-all"
                        >
                          <span>Visit Live</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                        </a>
                      </td>

                      {/* Column 5: Action Buttons (GitHub + Delete) */}
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="View GitHub Repository"
                            >
                              <GithubIcon className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(proj.id, proj.title)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete solution from website"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
