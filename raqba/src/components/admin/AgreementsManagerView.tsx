import React, { useState } from 'react';
import { Agreement } from '../../types';
import { 
  FileSignature, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { AgreementSigningModal } from '../AgreementSigningModal';

interface AgreementsManagerViewProps {
  agreements: Agreement[];
  onRefresh: () => void;
}

export const AgreementsManagerView: React.FC<AgreementsManagerViewProps> = ({
  agreements,
  onRefresh,
}) => {
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenSignModal = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Legal Compliance Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-amber-300 block">
            Pakistan Legal Framework: Electronic Transactions Ordinance (ETO) 2002
          </span>
          <p className="text-slate-300 leading-relaxed">
            All digital signatures captured here are legally recognized for client representation and non-disclosure agreements under Section 3 of the ETO 2002.
            <strong className="text-amber-200 block mt-1">
              *Statutory Notice: Under Section 17 & 49 of the Registration Act 1908 and Stamp Act 1899, the ultimate conveyance of immovable property (Sale Deed / Registry) requires physical non-judicial stamp paper and biometric registration before the Sub-Registrar. This system executes preliminary representation and NDA documents.
            </strong>
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-xl text-slate-100 flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-purple-400" />
            Representation & Non-Disclosure Agreements
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Pre-filled standard legal instruments for high-net-worth property representations.
          </p>
        </div>
      </div>

      {/* Agreements Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agreements.map((agreement) => {
          const isSigned = agreement.sign_status === 'executed' || agreement.sign_status === 'signed';

          return (
            <div
              key={agreement.id}
              className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 hover:border-gold-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                    {agreement.envelope_id}
                  </span>

                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isSigned
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {isSigned ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Executed & Locked
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-amber-400" />
                        Awaiting Signature
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-slate-100">
                    {agreement.agreement_type}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target: {agreement.property?.title || 'Exclusive Portfolio Listing'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Signer Legal Name:</span>
                    <strong className="text-slate-200">{agreement.signer_name || agreement.lead?.full_name || 'Designated Client'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Broker:</span>
                    <span>{agreement.agent?.name || 'Chaudhry Kamran'}</span>
                  </div>
                  {agreement.signed_at && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                      <span>Executed On:</span>
                      <span className="text-emerald-400 font-mono">
                        {new Date(agreement.signed_at).toLocaleString('en-PK')}
                      </span>
                    </div>
                  )}
                  {agreement.signer_ip && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Digital Hash / IP:</span>
                      <span className="font-mono text-slate-400">{agreement.signer_ip}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenSignModal(agreement)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isSigned
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-purple-600 hover:bg-purple-500 text-slate-100 shadow-lg shadow-purple-600/20'
                  }`}
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  {isSigned ? 'View Executed Instrument' : 'Review & E-Sign Now'}
                </button>
              </div>
            </div>
          );
        })}

        {agreements.length === 0 && (
          <div className="col-span-2 p-12 text-center rounded-2xl bg-[#0d1424] border border-slate-800 text-slate-400 text-xs">
            No agreements generated yet. Agreements are auto-created when clients advance to offer review or request exclusive representation.
          </div>
        )}
      </div>

      {/* E-Signing Modal */}
      {modalOpen && selectedAgreement && (
        <AgreementSigningModal
          agreement={selectedAgreement}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAgreementExecuted={() => {
            setModalOpen(false);
            onRefresh();
          }}
        />
      )}

    </div>
  );
};
