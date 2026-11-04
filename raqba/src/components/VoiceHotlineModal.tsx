import React, { useState } from 'react';
import { PhoneCall, Mic, MicOff, Volume2, ShieldCheck, Zap, X, CheckCircle, Clock, Play } from 'lucide-react';
import { simulateVoiceHotlineToN8N } from '../lib/n8n';
import { supabase } from '../lib/supabase';

interface VoiceHotlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallLogged?: () => void;
}

export const VoiceHotlineModal: React.FC<VoiceHotlineModalProps> = ({
  isOpen,
  onClose,
  onCallLogged
}) => {
  const [callerName, setCallerName] = useState('Alexander Von Berg');
  const [callerPhone, setCallerPhone] = useState('+1 (310) 992-8172');
  const [transcript, setTranscript] = useState(
    'Good afternoon, Alexander Von Berg calling from Zurich. We just completed an equity liquidation. I am looking at The Promontory Bel Air at $28.5M. We have an unconditional wire ready and need to schedule a private sunset walkthrough before my flight Friday.'
  );
  const [budgetMax, setBudgetMax] = useState(30000000);
  const [isCalling, setIsCalling] = useState(false);
  const [callResult, setCallResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      name: 'Alexander Von Berg',
      phone: '+1 (310) 992-8172',
      budget: 30000000,
      text: 'Good afternoon, Alexander Von Berg calling from Zurich. We just completed an equity liquidation. I am looking at The Promontory Bel Air at $28.5M. We have an unconditional wire ready and need to schedule a private sunset walkthrough before my flight Friday.'
    },
    {
      name: 'Sarah Kensington',
      phone: '+1 (212) 804-9912',
      budget: 48000000,
      text: 'Hello, this is Sarah Kensington with Kensington Partners NYC. We are running a 60-day 1031 exchange rollover for our Manhattan fund. We are interested in the Madison Prime Commercial Plaza at $48M. Need broker dossier and rent roll.'
    },
    {
      name: 'Dr. Julian Thorne',
      phone: '+1 (305) 441-2890',
      budget: 20000000,
      text: 'Hi, Dr. Julian Thorne here. Inquiring on the Continuum South Beach Penthouse at $19.75M. I want to confirm deeded access for our 75-foot yacht and schedule gate clearance for a walkthrough Saturday morning.'
    }
  ];

  const handleSimulateCall = async () => {
    setIsCalling(true);
    try {
      const res = await simulateVoiceHotlineToN8N({
        callerName,
        callerPhone,
        transcript,
        budgetMax,
        targetPropertySlug: 'the-promontory-bel-air'
      });

      // Log event to Supabase inbound_events
      await supabase.from('inbound_events').insert({
        event_type: 'voice_hotline_call',
        payload: {
          callerName,
          callerPhone,
          transcript,
          budgetMax,
          scores: res.lead?.scores,
          priority: res.dispatch?.priority || 'P0 Critical',
          broker: res.dispatch?.broker?.name
        },
        source_ip: '172.56.21.9'
      });

      setCallResult(res);
      if (onCallLogged) onCallLogged();
    } catch (err) {
      console.error('Error simulating call:', err);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0c1220] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-slate-100">
                  Autonomous Multi-Channel Voice Hotline
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  LIVE AI HOTLINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sub-15s AI intent extraction & emergency broker dispatch
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
        <div className="p-6 space-y-5">
          {!callResult ? (
            <>
              {/* Presets Row */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select High-Net-Worth Inbound Caller Scenario:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCallerName(p.name);
                        setCallerPhone(p.phone);
                        setBudgetMax(p.budget);
                        setTranscript(p.text);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        callerName === p.name
                          ? 'bg-emerald-500/15 border-emerald-500 text-slate-100'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-200">{p.name}</div>
                      <div className="text-[11px] text-emerald-400 font-mono">${(p.budget / 1000000)}M Target</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Caller Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Caller Legal Name</label>
                  <input
                    type="text"
                    value={callerName}
                    onChange={e => setCallerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Incoming Caller ID</label>
                  <input
                    type="text"
                    value={callerPhone}
                    onChange={e => setCallerPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Live Audio Waveform Simulation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>VOICE CHANNEL: WEBRTC / VAPI.AI MASTER TRUNK</span>
                  </div>
                  <span>48 kHz • 128 kbps</span>
                </div>

                {/* Animated Audio Wave Bars */}
                <div className="flex items-center justify-center gap-1.5 h-12 py-2">
                  {[40, 65, 30, 85, 95, 45, 75, 100, 60, 80, 50, 90, 35, 70, 85, 60, 40, 75, 90, 55].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1 rounded-full ${
                        isCalling ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Transcript Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Live Voice Hotline Transcript:
                </label>
                <textarea
                  rows={3}
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleSimulateCall}
                disabled={isCalling}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {isCalling ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Ingesting Voice Call & Routing in Under 15 Seconds...</span>
                  </div>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    <span>Trigger Live Voice Hotline Call</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Call Dispatched Results */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-emerald-300 text-sm">
                      Voice Call Processed & Dispatched
                    </h4>
                    <p className="text-xs text-slate-400">
                      Dispatched in <span className="text-emerald-400 font-mono font-bold">{callResult.dispatch?.dispatchLatencySeconds || 9}s</span> (&lt; 15s Target SLA)
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  {callResult.dispatch?.priority || 'P0 Critical'}
                </span>
              </div>

              {/* 3-Bullet Dossier */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono text-slate-300">
                <div className="text-gold-400 font-bold text-[11px] uppercase tracking-wider">
                  Broker Real-Time Intelligence Packet:
                </div>
                <p className="text-slate-300">• {callResult.dispatch?.dossier?.bullet_1_liquidity}</p>
                <p className="text-slate-300">• {callResult.dispatch?.dossier?.bullet_2_intent}</p>
                <p className="text-slate-300">• {callResult.dispatch?.dossier?.bullet_3_action}</p>
              </div>

              {/* Assigned Broker Alert */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Assigned Licensed Broker:</div>
                  <div className="text-sm font-bold text-slate-200">{callResult.dispatch?.broker?.name}</div>
                  <div className="text-[11px] text-gold-400 font-mono">{callResult.dispatch?.broker?.license}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-emerald-400 font-mono font-bold">Sub-15s Hotline Alert</div>
                  <div className="text-slate-400 text-[10px]">SMS & Push Dispatch Triggered</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setCallResult(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Simulate Another Voice Call
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:brightness-110"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
