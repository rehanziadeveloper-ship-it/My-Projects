"use client";

import React, { useState } from "react";
import { Calendar, Mail, Send, CheckCircle2, Clock, MessageSquare, ArrowRight, Phone } from "lucide-react";

export default function LeadIntakeAndCal() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    agency: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || "Failed to send message. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-dot-matrix relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>LET&apos;S CONNECT</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            Ready to Automate Your Inbound Leads?
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Send a quick message below or book a 15-minute intro directly on Muhammad Rehan&apos;s calendar.
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-soft-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick, Simple Form (7 cols) */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="text-center py-12 px-6 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you! Muhammad Rehan has received your message and will reach out to your email or WhatsApp within 2 hours.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", agency: "", message: "" });
                    }}
                    className="text-xs font-semibold text-emerald-700 underline"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Email or WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="alex@agency.com or +1 555-0192"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Agency or Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Media (or your website)"
                    value={formData.agency}
                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    What can we help you build? *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. 24/7 AI Voice Receptionist for my agency clients, lead follow-ups, or custom client portal..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {errorMessage && (
                  <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-medium text-xs py-3.5 px-6 rounded-xl shadow-xs hover:shadow-md transition-all group"
                >
                  {isSubmitting ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <span>Send Message &amp; Request Free Audit</span>
                      <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Direct Channels & Instant Booking (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Prefer to Speak Directly?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Book a quick 15-minute technical intro call directly on Muhammad Rehan&apos;s live calendar.
              </p>

              <div className="mt-5 space-y-3">
                <a
                  href="https://cal.com/rehan-zia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition-all group"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book 15-Min Fit Call on Cal.com</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* Direct 1-Click WhatsApp Button */}
                <a
                  href="https://wa.me/923471098310"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition-all group"
                >
                  <Phone className="w-4 h-4" />
                  <span>Chat on WhatsApp (+92 347 1098310)</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Or email: </span>
                <a
                  href="mailto:rehanziadeveloper@gmail.com"
                  className="font-medium text-slate-800 hover:text-indigo-600 underline"
                >
                  rehanziadeveloper@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
