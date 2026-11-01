import React, { useState, useEffect, useRef } from 'react';
import { X, Send, RotateCcw, Globe, Phone, AlertCircle, Bot, User } from 'lucide-react';
import type { ChatMessage, SupportedLanguage } from '../types';
import { DICTIONARY } from '../lib/dictionary';
import { sendChatMessage } from '../lib/n8n';

interface WebChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking?: () => void;
  clinicPhone?: string;
}

export const WebChatbot: React.FC<WebChatbotProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
  clinicPhone = '+923001234567',
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Retrieve or create persistent session ID in sessionStorage
  const [sessionId] = useState<string>(() => {
    let sid = sessionStorage.getItem('smile_chat_session_id');
    if (!sid) {
      sid = 'web_' + Math.random().toString(36).substring(2, 12);
      sessionStorage.setItem('smile_chat_session_id', sid);
    }
    return sid;
  });

  const dict = DICTIONARY[language];

  // Initialize bot greeting
  useEffect(() => {
    if (messages.length === 0) {
      resetChat(language);
    }
  }, [language]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const resetChat = (lang: SupportedLanguage) => {
    const currentDict = DICTIONARY[lang];
    const initialGreeting: ChatMessage = {
      id: 'msg-init',
      sender: 'bot',
      text: currentDict.botWelcome,
      buttons: [
        { label: currentDict.botIntentBooking, value: 'intent_book' },
        { label: currentDict.botIntentServices, value: 'intent_services' },
        { label: currentDict.botIntentHours, value: 'intent_hours' },
        { label: currentDict.botIntentEmergency, value: 'intent_emergency' },
        { label: currentDict.botIntentManage, value: 'intent_manage' },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialGreeting]);
  };

  const handleLanguageToggle = () => {
    const nextLang: SupportedLanguage = language === 'en' ? 'roman_ur' : 'en';
    setLanguage(nextLang);
    resetChat(nextLang);
  };

  // Mask Pakistani phone number in chat input if digits are typed
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // If looks like phone number typing
    if (/^03[0-9-]*$/.test(val)) {
      let digits = val.replace(/\D/g, '');
      if (digits.length > 11) digits = digits.slice(0, 11);
      if (digits.length <= 4) {
        setInputText(digits);
      } else {
        setInputText(`${digits.slice(0, 4)}-${digits.slice(4)}`);
      }
    } else {
      setInputText(val);
    }
  };

  const handleSendMessage = async (textToSend?: string, buttonId?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && !buttonId) return;

    // Emergency keyword check in client for instantaneous triage
    const lower = text.toLowerCase();
    const isEmergency =
      lower.includes('pain') ||
      lower.includes('dard') ||
      lower.includes('bohat dard') ||
      lower.includes('swelling') ||
      lower.includes('soojan') ||
      lower.includes('bleeding') ||
      lower.includes('khoon') ||
      lower.includes('broken') ||
      lower.includes('tuta');

    // Append user message to view
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text || (buttonId ? buttonId.replace('btn_', '').replace('_', ' ') : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // 1. Direct client-side handling for standard buttons & inquiries to guarantee zero greeting loop
      const isInfoQuery = 
        buttonId === 'intent_services' || 
        buttonId === 'intent_hours' || 
        buttonId === 'intent_manage' || 
        buttonId === 'call_now' ||
        lower.includes('price') ||
        lower.includes('fee') ||
        lower.includes('paisa') ||
        lower.includes('timing') ||
        lower.includes('auqaat') ||
        lower.includes('hours') ||
        lower.includes('cancel') ||
        lower.includes('reschedule');

      if (isInfoQuery) {
        handleLocalChatFallback(text, buttonId, isEmergency);
        setIsTyping(false);
        return;
      }

      // Call n8n webhook
      const res = await sendChatMessage(sessionId, text, buttonId);

      const isGenericGreeting = 
        res.data?.message?.includes('Welcome to Smile Dental Clinic') || 
        res.data?.message?.includes('khush-amdeed');

      if (res.ok && res.data && (!isGenericGreeting || (!buttonId && !text))) {
        const botReply: ChatMessage = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: res.data.message || res.data.text || 'Thank you.',
          buttons: res.data.buttons || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEmergencyNotice: res.data.is_emergency || isEmergency,
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        handleLocalChatFallback(text, buttonId, isEmergency);
      }
    } catch {
      handleLocalChatFallback(text, buttonId, isEmergency);
    } finally {
      setIsTyping(false);
    }
  };

  // Graceful state machine fallback when n8n is offline or during testing
  const handleLocalChatFallback = (text: string, buttonId?: string, isEmergency?: boolean) => {
    let replyText = '';
    let buttons: Array<{ label: string; value: string }> = [];
    const lower = text.toLowerCase();

    if (buttonId === 'call_now' || lower.includes('call') || lower.includes('phone')) {
      window.location.href = `tel:${clinicPhone}`;
      replyText = language === 'en'
        ? `Opening mobile dialer for Dr. Zeeshan Ahmad (${clinicPhone}). You can also book online below:`
        : `Dr. Zeeshan Ahmad ko call karne ke liye dialer khol diya gaya hai (${clinicPhone}). Aap online bhi book kar sakte hain:`;
      buttons = [{ label: dict.botIntentBooking, value: 'intent_book' }];
    } else if (buttonId === 'intent_emergency' || isEmergency) {
      replyText = dict.botEmergencyResponse;
      buttons = [
        { label: dict.emergencyCallBtn, value: 'call_now' },
        { label: dict.botIntentBooking, value: 'intent_book' },
      ];
    } else if (buttonId === 'intent_services' || lower.includes('price') || lower.includes('fee') || lower.includes('paisa') || lower.includes('cost') || lower.includes('service')) {
      replyText =
        language === 'en'
          ? '🦷 Smile Dental Clinic - Treatment Charges:\n\n• Dental Checkup & Consultation: PKR 2,000 (30 mins)\n• Ultrasonic Scaling & Polishing: PKR 5,000 (45 mins)\n• Composite Tooth Filling: PKR 4,500 (30 mins)\n• Painless Root Canal (RCT): PKR 12,000 (60 mins)\n• Laser Teeth Whitening: PKR 18,000 (45 mins)\n• Gentle Tooth Extraction: PKR 4,000 (30 mins)\n\nAll treatments performed personally by Dr. Zeeshan Ahmad with 100% sterilized instruments.'
          : '🦷 Smile Dental Clinic - Ilaaj Ki Fees:\n\n• Checkup Aur Mashwara: PKR 2,000 (30 mins)\n• Danton Ki Safai (Scaling): PKR 5,000 (45 mins)\n• Dant Ki Filling: PKR 4,500 (30 mins)\n• Root Canal (RCT): PKR 12,000 (60 mins)\n• Danton Ki Whitening: PKR 18,000 (45 mins)\n• Dant Nikalna: PKR 4,000 (30 mins)\n\nTamaam ilaaj Dr. Zeeshan Ahmad khud mukammal safai aur sterilization ke sath karte hain.';
      buttons = [
        { label: dict.botIntentBooking, value: 'intent_book' },
        { label: dict.botIntentHours, value: 'intent_hours' }
      ];
    } else if (buttonId === 'intent_hours' || lower.includes('timing') || lower.includes('hours') || lower.includes('auqaat') || lower.includes('time') || lower.includes('address') || lower.includes('location')) {
      replyText =
        language === 'en'
          ? '📍 Clinic Location & Working Hours:\n\n• Monday – Thursday: 10:00 AM – 08:00 PM\n• Friday: 10:00 AM – 08:00 PM (Jumma Prayer Break: 01:00 PM – 02:30 PM)\n• Saturday: 10:00 AM – 06:00 PM\n• Sunday: Closed (Emergency on-call)\n\nAddress: Plot 14-B, Sector F-7 Markaz, Islamabad (Accessible parking & elevator).'
          : '📍 Clinic Ka Pata Aur Auqaat:\n\n• Peer ta Jumerat: 10:00 AM – 08:00 PM\n• Jumma: 10:00 AM – 08:00 PM (Jumma Namaz Break: 01:00 PM – 02:30 PM)\n• Hafta: 10:00 AM – 06:00 PM\n• Itwaar: Chutti (Emergency on-call)\n\nPata: Plot 14-B, Sector F-7 Markaz, Islamabad.';
      buttons = [
        { label: dict.botIntentBooking, value: 'intent_book' },
        { label: dict.emergencyCallBtn, value: 'call_now' }
      ];
    } else if (buttonId === 'intent_manage' || lower.includes('cancel') || lower.includes('reschedule')) {
      replyText =
        language === 'en'
          ? 'To cancel or reschedule an existing visit:\n1. Check your SMS or WhatsApp booking confirmation for your private link (e.g. /appointment/YOUR_TOKEN).\n2. Click Reschedule to pick a new date/time with zero penalty.\n3. Or call clinic staff directly at 0300-1234567.'
          : 'Apna appointment cancel ya reschedule karne ke liye:\n1. Apne WhatsApp ya SMS mein bhejay gaye link par click karein.\n2. \"Reschedule\" par click kar ke naya waqt chunain.\n3. Ya seedha clinic ko call karein: 0300-1234567.';
      buttons = [
        { label: dict.callNow, value: 'call_now' },
        { label: dict.botIntentBooking, value: 'intent_book' }
      ];
    } else if (buttonId === 'intent_book' || lower.includes('book') || lower.includes('appointment')) {
      replyText = dict.botAskService;
      buttons = [
        { label: 'Checkup & Consultation', value: 'srv_checkup' },
        { label: 'Scaling & Polishing', value: 'srv_scaling' },
        { label: 'Root Canal Treatment', value: 'srv_rct' },
        { label: 'Teeth Whitening', value: 'srv_whitening' },
      ];
    } else if (buttonId?.startsWith('srv_')) {
      replyText = dict.botAskDate;
      buttons = [
        { label: 'Today / Aaj', value: 'date_today' },
        { label: 'Tomorrow / Kal', value: 'date_tomorrow' },
        { label: 'Day after / Parso', value: 'date_day_after' },
      ];
    } else if (buttonId?.startsWith('date_')) {
      replyText = dict.botAskTime;
      buttons = [
        { label: '11:00 AM', value: 'time_1100' },
        { label: '03:00 PM', value: 'time_1500' },
        { label: '05:30 PM', value: 'time_1730' },
        { label: '07:00 PM', value: 'time_1900' },
      ];
    } else if (buttonId?.startsWith('time_')) {
      replyText = dict.botAskName;
    } else {
      replyText =
        language === 'en'
          ? `Thank you. How can Dr. Zeeshan assist you? You can choose an option below or type your question:`
          : `Shukriya. Dr. Zeeshan aap ki kya madad kar sakte hain? Aap darj zail options chun sakte hain:`;
      buttons = [
        { label: dict.botIntentBooking, value: 'intent_book' },
        { label: dict.botIntentServices, value: 'intent_services' },
        { label: dict.botIntentHours, value: 'intent_hours' }
      ];
    }

    const botFallback: ChatMessage = {
      id: 'bot-' + Date.now(),
      sender: 'bot',
      text: replyText,
      buttons,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEmergencyNotice: Boolean(isEmergency),
    };
    setMessages((prev) => [...prev, botFallback]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[620px] z-50 flex flex-col bg-white sm:rounded-4xl shadow-2xl border border-clinic-border overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
      
      {/* Chatbot Header */}
      <div className="px-5 py-4 bg-forest-900 text-white flex items-center justify-between border-b border-forest-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-clinic-primary flex items-center justify-center border border-clinic-lightGreen text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">
              Smile Dental AI Assistant
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-clinic-lightGreen">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online • English & Roman Urdu</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switch Pill */}
          <button
            onClick={handleLanguageToggle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-forest-800 hover:bg-forest-700 text-clinic-lightGreen border border-forest-700 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3 h-3" />
            <span>{language === 'en' ? 'Urdu' : 'English'}</span>
          </button>

          {/* Reset Chat */}
          <button
            onClick={() => resetChat(language)}
            className="p-1.5 rounded-full hover:bg-forest-800 text-white/70 hover:text-white transition-colors"
            title="Start Over"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-forest-800 text-white/70 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-clinic-bg">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Sender Label & Avatar */}
            <div className="flex items-center gap-1.5 text-[10px] text-clinic-muted mb-1 px-1">
              {msg.sender === 'bot' ? (
                <>
                  <Bot className="w-3 h-3 text-clinic-primary" />
                  <span>Smile Assistant</span>
                </>
              ) : (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-forest-800" />
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-clinic-primary text-white rounded-br-none'
                  : msg.isEmergencyNotice
                  ? 'bg-rose-50 border border-rose-200 text-rose-950 rounded-bl-none font-medium'
                  : 'bg-white border border-clinic-border text-forest-800 rounded-bl-none'
              }`}
            >
              {msg.isEmergencyNotice && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>EMERGENCY ASSISTANCE</span>
                </div>
              )}
              {msg.text}
            </div>

            {/* Quick Reply Pills */}
            {msg.buttons && msg.buttons.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                {msg.buttons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => {
                      if (btn.value === 'intent_book' && typeof onOpenBooking === 'function') {
                        onOpenBooking();
                      } else {
                        handleSendMessage(btn.label, btn.value);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-clinic-lightGreen text-forest-800 border border-clinic-border/80 shadow-xs transition-all hover:border-clinic-primary/40 active:scale-95"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-clinic-border w-20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-clinic-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-clinic-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-clinic-primary animate-bounce" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Direct Call Trigger */}
      <div className="p-3 bg-white border-t border-clinic-border/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={
              language === 'en'
                ? 'Type message or phone (0300-1234567)...'
                : 'Pehgham ya number likhein...'
            }
            className="flex-1 px-4 py-2.5 rounded-full bg-clinic-bg border border-clinic-border text-xs sm:text-sm text-forest-800 focus:outline-none focus:ring-2 focus:ring-clinic-primary/30"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-clinic-primary text-white flex items-center justify-center hover:bg-clinic-primaryHover disabled:opacity-40 transition-colors shadow-soft"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-clinic-muted pt-2 px-1">
          <span>Replies in your selected language</span>
          <a
            href={`tel:${clinicPhone}`}
            className="flex items-center gap-1 font-semibold text-clinic-primary hover:underline"
          >
            <Phone className="w-3 h-3" />
            <span>Emergency: 0300-1234567</span>
          </a>
        </div>
      </div>

    </div>
  );
};
