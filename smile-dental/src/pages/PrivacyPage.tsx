import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck, Database } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-clinic-bg py-12 px-4 sm:px-6 lg:px-8 text-clinic-text">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-clinic-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Smile Dental Clinic</span>
        </Link>

        <div className="bg-white rounded-4xl p-8 sm:p-10 border border-clinic-border shadow-soft space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-clinic-lightGreen text-clinic-primary flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-clinic-primary">
                Patient Data Protection
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-forest-800">
                Privacy Policy & Consent
              </h1>
            </div>
          </div>

          <div className="space-y-4 text-sm text-forest-800/80 leading-relaxed pt-2">
            <p>
              At <strong>Smile Dental Clinic</strong>, patient privacy and medical confidentiality are fundamental clinical principles. This policy explains what information we collect, why we collect it, and how it is secured.
            </p>

            <h3 className="text-base font-bold text-forest-800 pt-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-clinic-primary" />
              <span>1. Strict Data Minimization</span>
            </h3>
            <p>
              We only collect the absolute minimum details required to schedule your appointment with Dr. Zeeshan Ahmad:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs sm:text-sm text-clinic-muted">
              <li><strong>Patient Full Name:</strong> To address you personally and identify your appointment slot.</li>
              <li><strong>Pakistani Mobile Number:</strong> To send WhatsApp confirmations, address pins, and 24-hour reminders.</li>
              <li><strong>Symptom / Reason for Visit (Optional):</strong> In your own words to prepare clinical instruments.</li>
              <li><strong>Language Preference (English or Roman Urdu):</strong> To communicate in your preferred dialect.</li>
            </ul>
            <p className="text-xs font-semibold text-forest-800 bg-clinic-lightGreen/40 p-3 rounded-xl border border-clinic-primary/20">
              🚫 What We NEVER Collect: We do NOT store credit cards, bank account details, online payments, national ID card scans, or full medical insurance history on our public servers.
            </p>

            <h3 className="text-base font-bold text-forest-800 pt-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-clinic-primary" />
              <span>2. Technical & Architectural Isolation</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-clinic-muted">
              <li><strong>Zero Public Database Writes:</strong> Anonymous web browsers cannot insert or query patient database records directly. All patient booking actions are mediated through secure backend n8n webhooks.</li>
              <li><strong>Postgres Row Level Security (RLS):</strong> Staff administrative tables are strictly isolated and protected by encrypted JWT authentication.</li>
              <li><strong>Private Logging:</strong> Patient phone numbers, names, and conversational chat messages are never logged into public browser consoles or execution error logs.</li>
            </ul>

            <h3 className="text-base font-bold text-forest-800 pt-2">
              3. Patient Rights & Self-Service
            </h3>
            <p>
              Every patient receives a unique, unguessable manage token (sent via WhatsApp / SMS). You can view, reschedule, or cancel your appointment at any time without creating a user account or password.
            </p>

            <h3 className="text-base font-bold text-forest-800 pt-2">
              4. Contact the Clinic
            </h3>
            <p>
              If you have any questions regarding your data or wish to have your contact details updated or purged from our records, please reach us directly at:
            </p>
            <div className="p-4 rounded-2xl bg-clinic-bg border border-clinic-border text-xs text-forest-800 space-y-1 font-mono">
              <p>Smile Dental Clinic</p>
              <p>Plot 14-B, Sector F-7 Markaz, Islamabad, Pakistan</p>
              <p>Phone / WhatsApp: +92 300 1234567</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
