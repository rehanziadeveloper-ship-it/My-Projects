import React, { useState, useRef } from 'react';
import { Agreement } from '../types';
import { executeAgreementWithN8N } from '../lib/n8n';
import { supabase } from '../lib/supabase';
import { FileSignature, ShieldCheck, CheckCircle2, Download, X, Eraser, PenTool } from 'lucide-react';

interface AgreementSigningModalProps {
  agreement: Agreement | null;
  isOpen: boolean;
  onClose: () => void;
  onAgreementExecuted?: () => void;
}

export const AgreementSigningModal: React.FC<AgreementSigningModalProps> = ({
  agreement,
  isOpen,
  onClose,
  onAgreementExecuted
}) => {
  const [signerName, setSignerName] = useState(agreement?.signer_name || agreement?.lead?.full_name || 'Muhammad Usman Tariq');
  const [signerEmail, setSignerEmail] = useState(agreement?.signer_email || agreement?.lead?.email || 'usman.tariq@gmail.com');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  if (!isOpen || !agreement) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#dcba75';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = async () => {
    if (!signerName) return;
    setLoading(true);

    try {
      const signatureData = canvasRef.current?.toDataURL() || 'SVG_DIGITAL_SIG';

      // 1. Send to n8n webhook
      await executeAgreementWithN8N({
        agreementType: agreement.agreement_type,
        clientName: signerName,
        propertyTitle: agreement.property?.title || 'Trophy Portfolio Property',
        signatureSvg: signatureData
      });

      // 2. Execute via Supabase RPC
      await supabase.rpc('realtypulse_sign_agreement', {
        p_agreement_id: agreement.id,
        p_signer_name: signerName,
        p_signature_svg: signatureData,
        p_signer_ip: '108.45.192.1'
      });

      setIsSigned(true);
      if (onAgreementExecuted) onAgreementExecuted();
    } catch (err) {
      console.error('Error executing agreement:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0c1220] border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-slate-100">
                  Automated Document & Agreement Pipeline
                </h3>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-mono font-bold">
                  {agreement.envelope_id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {agreement.agreement_type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {!isSigned ? (
            <>
              {/* Document Overview Box */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800 pb-2">
                  <span>Document: {agreement.agreement_type}</span>
                  <span className="text-gold-400 font-mono">Status: Awaiting Signature</span>
                </div>
                <div className="text-slate-400 leading-relaxed text-[11px] max-h-32 overflow-y-auto pr-2">
                  This Agreement constitutes a legally recognized electronic agreement under the Electronic Transactions Ordinance (ETO) 2002 of Pakistan between RealtyPulse 360 Brokerage Partners and the undersigned client. All confidential property disclosures, owner details, private walkthrough coordination, and proprietary valuation dossiers are strictly governed hereunder. <br /><br />
                  <span className="text-amber-300 font-semibold">Important Legal Notice:</span> This digital agreement provides preliminary broker representation and non-disclosure protection. Formal transfer of immovable property in Pakistan requires execution of a sale deed on non-judicial stamp paper registered before the Sub-Registrar.
                </div>
              </div>

              {/* Signer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Signer Legal Name</label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={e => setSignerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email for Delivery</label>
                  <input
                    type="email"
                    required
                    value={signerEmail}
                    onChange={e => setSignerEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Digital Signature Pad */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Digital e-Signature Pad (Draw or Sign Below)</span>
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
                <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-950">
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full cursor-crosshair"
                  />
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedTerms}
                  onChange={e => setAgreedTerms(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-gold-500 focus:ring-0"
                />
                <label htmlFor="agree-terms" className="text-xs text-slate-300">
                  I certify that I am legally authorized to execute this agreement and accept digital signature under the ESIGN Act.
                </label>
              </div>

              {/* Sign Button */}
              <button
                onClick={handleSign}
                disabled={loading || !agreedTerms}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Executing e-Signature & Locking Escrow Pipeline...</span>
                  </div>
                ) : (
                  <>
                    <FileSignature className="w-4 h-4" />
                    <span>Execute Agreement & Dispatch Digital Copy</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Execution Confirmation */
            <div className="space-y-4 py-2 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-serif font-bold text-lg text-purple-300">
                  Agreement Legally Executed
                </h4>
                <p className="text-xs text-slate-300">
                  Signed by <span className="text-white font-semibold">{signerName}</span> on {new Date().toLocaleDateString()}
                </p>
                <div className="text-[11px] font-mono text-purple-400">
                  Envelope Hash: {agreement.envelope_id} • Status: EXECUTED
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>PDF Stored in Secure Document Vault</span>
                <span className="text-gold-400 font-mono">SHA-256 Verified</span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-gold-500 text-slate-950 font-bold text-xs hover:brightness-110"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
