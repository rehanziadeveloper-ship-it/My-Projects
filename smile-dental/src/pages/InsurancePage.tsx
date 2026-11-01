import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, CheckCircle } from 'lucide-react';

export const InsurancePage: React.FC = () => {
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
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-clinic-primary">
                Information & Reimbursement Guide
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-forest-800">
                Dental Insurance in Pakistan
              </h1>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-forest-800/80 leading-relaxed pt-2">
            <p>
              In Pakistan, dental treatments (scaling, restorations, extractions, and root canals) are covered under several corporate health policies and private insurance underwriters on a <strong>reimbursement basis</strong>.
            </p>
            <p>
              Smile Dental Clinic provides complete, itemized clinical receipts with doctor PMDC registration details, diagnosis notes, and stamped claims documentation for your insurance provider.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-clinic-bg border border-clinic-border space-y-2">
              <div className="flex items-center gap-2 text-clinic-primary font-bold text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Accepted Insurance Providers</span>
              </div>
              <ul className="text-xs text-clinic-muted space-y-1.5 list-disc list-inside">
                <li>Jubilee Life Insurance</li>
                <li>EFU Life & General Insurance</li>
                <li>TPL Insurance & Adamjee Insurance</li>
                <li>Askari General Insurance</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-clinic-bg border border-clinic-border space-y-2">
              <div className="flex items-center gap-2 text-clinic-primary font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>Documentation We Provide</span>
              </div>
              <ul className="text-xs text-clinic-muted space-y-1.5 list-disc list-inside">
                <li>Official Stamped Treatment Invoice</li>
                <li>Dr. Zeeshan Ahmad PMDC Registration</li>
                <li>Pre & Post Digital Assessment Notes</li>
                <li>Formal Claim Form Attestation</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-clinic-lightGreen/50 border border-clinic-primary/20 text-xs text-forest-800">
            <strong>Need assistance with your claim form?</strong> Bring your corporate health insurance form during your visit, and our desk will prepare the complete paperwork immediately following your treatment.
          </div>
        </div>

      </div>
    </div>
  );
};
