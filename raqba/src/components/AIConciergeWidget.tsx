import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Send, 
  X, 
  Headphones, 
  Paperclip, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw,
  Clock,
  Phone,
  FileText
} from 'lucide-react';
import { queryAIConcierge } from '../lib/n8n';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  quickReplies?: string[];
  isSummary?: boolean;
  summary?: any;
  referenceId?: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
}

export const AIConciergeWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Session & slot state
  const [sessionId, setSessionId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<string>('greeting');
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [referenceId, setReferenceId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize or restore session from localStorage & Supabase
  useEffect(() => {
    const saved = localStorage.getItem('raqba_chat_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessionId(parsed.sessionId || '');
        setCurrentStep(parsed.currentStep || 'greeting');
        setCollectedData(parsed.collectedData || {});
        setReferenceId(parsed.referenceId || '');
        if (parsed.messages && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse saved chat session:', e);
      }
    }

    // New conversation opening
    const initialGreeting: Message = {
      id: 'init-1',
      sender: 'bot',
      text: "Hi! I'm Raqba's virtual assistant. I can help you find, buy, rent, or list a property in Pakistan. May I ask a few quick questions to assist you?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: ["Yes, let's start", "I want to buy", "I want to sell", "Talk to an agent"]
    };
    setMessages([initialGreeting]);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('raqba_chat_session', JSON.stringify({
        sessionId,
        currentStep,
        collectedData,
        referenceId,
        messages
      }));
    }
  }, [sessionId, currentStep, collectedData, referenceId, messages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Send message to n8n + Supabase sync
  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() && !fileInputRef.current?.files?.length) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Call n8n Raqba Concierge Webhook
      const response = await queryAIConcierge({
        message: text,
        currentStep,
        collectedData,
        session: { sessionId, currentStep, collectedData }
      });

      const updatedData = { ...collectedData, ...(response.collectedData || {}) };
      setCollectedData(updatedData);
      if (response.currentStep) setCurrentStep(response.currentStep);
      if (response.referenceId) setReferenceId(response.referenceId);

      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: response.quickReplies,
        isSummary: response.isSummary,
        summary: response.summary,
        referenceId: response.referenceId
      };

      setMessages(prev => [...prev, botMsg]);

      // If inquiry is confirmed, save final record to Supabase leads table
      if (response.isComplete && updatedData.full_name && updatedData.phone) {
        saveLeadToSupabase(updatedData, response.referenceId);
      }
    } catch (err) {
      console.error('Error querying concierge:', err);
      const fallbackMsg: Message = {
        id: 'bot-err-' + Date.now(),
        sender: 'bot',
        text: "Thank you. Our senior broker Chaudhry Kamran (+92 300 8492910) has been alerted and will reach out to you directly.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: ["Call Helpline", "Browse Properties"]
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Save Lead and Property Submission to Supabase
  const saveLeadToSupabase = async (data: Record<string, any>, refId?: string) => {
    try {
      const budgetMax = data.budget_max || data.asking_price || 35000000;
      const { data: newLead } = await supabase.from('leads').insert({
        full_name: data.full_name || 'Raqba Inquirer',
        phone: data.phone || '+92 300 0000000',
        email: data.email && data.email !== 'skipped' ? data.email : `${(data.full_name || 'client').toLowerCase().replace(/\\s+/g, '.')}@client.pk`,
        lead_source: 'chatbot',
        buyer_seller_type: (data.intent === 'Sell' || data.intent === 'Rent out') ? 'Seller' : 'Buyer',
        budget_max: budgetMax,
        financing_type: data.payment_method === 'Installments' ? 'Developer Installment Plan' : (data.payment_method === 'Bank loan' ? 'Bank Financing' : 'Cash'),
        timeline_months: data.timeline === 'Immediate' ? 1 : 3,
        intent: data.intent,
        property_type: data.property_type,
        city: data.city || 'Lahore',
        area_name: data.area_name || 'DHA',
        area_value: data.area_value || 1,
        area_unit: data.area_unit || 'Kanal',
        bedrooms: data.bedrooms || null,
        payment_method: data.payment_method,
        timeline: data.timeline,
        appointment_at: data.appointment_at ? new Date(Date.now() + 86400000).toISOString() : null,
        preferred_contact_method: data.preferred_contact_method || 'WhatsApp',
        reference_id: refId || referenceId,
        data_consent: true,
        verbatim_quote: `Inquiry submitted via Raqba Chatbot for ${data.property_type || 'Property'} in ${data.area_name || 'DHA'} ${data.city || 'Lahore'}.`,
        status: 'new',
        deal_stage: 'new',
        deal_payment_status: 'None'
      }).select().single();

      if (newLead?.id) {
        // Run silent scoring & dispatch RPC
        await supabase.rpc('raqba_score_and_dispatch', { p_lead_id: newLead.id });

        // If Seller or Landlord, insert into property_submissions
        if (data.intent === 'Sell' || data.intent === 'Rent out') {
          await supabase.from('property_submissions').insert({
            reference_id: refId || referenceId,
            lead_id: newLead.id,
            owner_name: data.full_name,
            owner_phone: data.phone,
            owner_email: data.email !== 'skipped' ? data.email : null,
            intent: data.intent,
            property_type: data.property_type || 'House',
            city: data.city || 'Lahore',
            address: data.address || `${data.area_name || 'DHA'}, ${data.city || 'Lahore'}`,
            area_value: data.area_value || 1,
            area_unit: data.area_unit || 'Kanal',
            asking_price: budgetMax,
            ownership_status: data.ownership_status || 'Clear Title',
            status: 'pending_review'
          });
        }
      }
    } catch (e) {
      console.warn('Failed to sync lead record to Supabase:', e);
    }
  };

  // File Upload (Images & PDF up to 10MB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10 MB limit.');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data: uploadData, error } = await supabase.storage
        .from('raqba-documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('raqba-documents')
        .getPublicUrl(fileName);

      const fileUrl = publicUrlData?.publicUrl || '';
      const uploadNotice: Message = {
        id: 'upload-' + Date.now(),
        sender: 'user',
        text: `Uploaded attachment: ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachments: [{ name: file.name, url: fileUrl, type: file.type }]
      };

      setMessages(prev => [...prev, uploadNotice]);
      await handleSend(`[Uploaded Document: ${file.name} - ${fileUrl}]`);
    } catch (err: any) {
      console.error('File upload error:', err);
      alert('Upload failed: ' + (err.message || 'Please try again.'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Immediate Human Handoff Button
  const handleTriggerHumanHandoff = async () => {
    await handleSend("I want to speak with a human agent directly.");
  };

  // Reset / Clear Conversation
  const handleResetSession = () => {
    localStorage.removeItem('raqba_chat_session');
    setSessionId('');
    setCurrentStep('greeting');
    setCollectedData({});
    setReferenceId('');
    setMessages([
      {
        id: 'init-' + Date.now(),
        sender: 'bot',
        text: "Hi! I'm Raqba's virtual assistant. How can I help you with Pakistani real estate today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: ["Buy a House", "Invest in Plot", "Sell my property", "Rent a flat"]
      }
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button (Always visible in bottom corner) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="relative group p-4 rounded-full bg-gradient-to-r from-gold-500 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-2xl shadow-gold-500/30 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
              aria-label="Open Raqba Virtual Assistant"
            >
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
              <Home className="w-6 h-6 stroke-[2.4]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-2 bottom-2 top-2 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[620px] bg-[#0c1220] border border-gold-500/30 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-[#0d1527] to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400">
                  <Home className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-slate-100">Raqba Assistant</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-400">Verified Pakistan Real Estate</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Talk to Human Agent button */}
                <button
                  onClick={handleTriggerHumanHandoff}
                  title="Connect with Human Agent"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Headphones className="w-3.5 h-3.5 text-gold-400" />
                  <span>Agent</span>
                </button>

                <button
                  onClick={handleResetSession}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-gold-500 text-slate-950 font-medium rounded-br-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Summary Card (Confirmation Step) */}
                    {m.isSummary && m.summary && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-gold-500/30 space-y-1.5 text-[11px] text-slate-300 font-mono">
                        <div className="text-gold-400 font-bold border-b border-slate-800 pb-1 font-serif">
                          Inquiry Recap
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Client:</span>
                          <strong>{m.summary.name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Contact:</span>
                          <span>{m.summary.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Intent:</span>
                          <span className="text-gold-400">{m.summary.intent} ({m.summary.property_type})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Location:</span>
                          <span>{m.summary.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Budget:</span>
                          <span className="text-emerald-400">{m.summary.budget}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Timeline:</span>
                          <span>{m.summary.timeline}</span>
                        </div>
                      </div>
                    )}

                    {/* Attachments Display */}
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {m.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[11px] text-gold-400 hover:underline bg-slate-950 px-2 py-1 rounded"
                          >
                            <FileText className="w-3 h-3" />
                            <span className="truncate">{att.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {m.time}
                  </span>

                  {/* Quick-reply chip buttons */}
                  {m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                      {m.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(qr)}
                          className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-gold-500/20 border border-slate-700/80 hover:border-gold-500/50 text-slate-200 hover:text-gold-300 text-[11px] font-medium transition-all"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 w-16">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                {/* File Upload Trigger */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  title="Upload property photo or document (max 10MB)"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-gold-400 transition-colors shrink-0"
                >
                  <Paperclip className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                </button>

                <input
                  type="text"
                  placeholder="Type in English or Roman Urdu..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-slate-950 transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 px-1">
                <span>Raqba AI Assistant</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Sub-15s Broker Dispatch Active
                </span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
