/**
 * Apex Realty AI — Dumb Frontend Client
 * 100% of intelligence, slot-filling, state transitions, calendar bookings,
 * and CRM storage are handled exclusively by the n8n Master Brain.
 */

// Global State (Lightweight Dumb UI)
let clientSessionId = sessionStorage.getItem('apex_session_id') || ('sess_' + Math.floor(Math.random() * 1000000));
sessionStorage.setItem('apex_session_id', clientSessionId);

let currentSessionState = null;
let selectedTargetProperty = '';
let voiceOutputEnabled = true;
let isChatWindowOpen = false;
let listings = [];
let recognition = null;
let isListening = false;
let isBrokerAuthenticated = false;

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  fetchListings();
  initSpeechRecognition();
  setupEventListeners();
});

function setupEventListeners() {
  const input = document.getElementById('chatWidgetInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserSendMessage();
    });
  }
}

// -----------------------------------------------------------------
// 1. FLOATING CHAT WIDGET TOGGLING
// -----------------------------------------------------------------
function toggleChatWidget(forceState) {
  const win = document.getElementById('apexChatWindow');
  const trigger = document.getElementById('apexChatTrigger');
  const triggerIcon = document.getElementById('triggerIcon');

  if (typeof forceState === 'boolean') {
    isChatWindowOpen = forceState;
  } else {
    isChatWindowOpen = !isChatWindowOpen;
  }

  if (isChatWindowOpen) {
    win.classList.remove('closed');
    win.classList.add('open');
    if (triggerIcon) triggerIcon.setAttribute('data-lucide', 'x');
    setTimeout(() => {
      const input = document.getElementById('chatWidgetInput');
      if (input) input.focus();
    }, 200);
  } else {
    win.classList.remove('open');
    win.classList.add('closed');
    if (triggerIcon) triggerIcon.setAttribute('data-lucide', 'message-square');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }
  if (window.lucide) lucide.createIcons();
}

// -----------------------------------------------------------------
// 2. CHATBOT COMMUNICATION (DUMB CLIENT -> n8n MASTER BRAIN)
// -----------------------------------------------------------------
async function handleUserSendMessage(overrideText) {
  const input = document.getElementById('chatWidgetInput');
  const msg = (overrideText || (input ? input.value : '')).trim();
  if (!msg) return;

  if (input) input.value = '';

  // Append user bubble
  appendChatMessage(msg, true);
  showTypingIndicator();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: clientSessionId,
        userMessage: msg,
        message: msg,
        targetProperty: selectedTargetProperty || '',
        sessionState: currentSessionState
      })
    });

    removeTypingIndicator();

    if (res.ok) {
      const data = await res.json();
      
      // Update session state from n8n
      if (data.sessionState) currentSessionState = data.sessionState;
      else if (data.state) currentSessionState = data.state;

      if (data.reply) {
        appendChatMessage(data.reply, false);
        if (voiceOutputEnabled) {
          speakResponse(data.reply);
        }
      }

      // Hide opening chips if conversation progressed
      const chips = document.getElementById('openingChips');
      if (chips && currentSessionState && currentSessionState.phase > 1) {
        chips.style.display = 'none';
      }
    } else {
      appendChatMessage("Connection error with advisory desk. Please retry.", false);
    }
  } catch (err) {
    removeTypingIndicator();
    console.error('Chat error:', err);
    appendChatMessage("Network error connecting to private advisory desk.", false);
  }
}

function sendChipMessage(text) {
  handleUserSendMessage(text);
}

function appendChatMessage(text, isUser) {
  const container = document.getElementById('chatWidgetMessages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = isUser ? 'chat-bubble-user' : 'chat-bubble-bot';

  // Format line breaks and bullet points cleanly
  const formatted = text
    .replace(/\n/g, '<br>')
    .replace(/•/g, '&bull;');

  div.innerHTML = formatted;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chatWidgetMessages');
  if (!container) return;
  const ind = document.createElement('div');
  ind.id = 'typingIndicator';
  ind.className = 'chat-bubble-bot text-xs text-amber-300 flex items-center space-x-1.5';
  ind.innerHTML = `<span class="animate-pulse">Thinking</span><span class="animate-ping">•</span>`;
  container.appendChild(ind);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const ind = document.getElementById('typingIndicator');
  if (ind) ind.remove();
}

function resetSession() {
  currentSessionState = null;
  selectedTargetProperty = '';
  clientSessionId = 'sess_' + Math.floor(Math.random() * 1000000);
  sessionStorage.setItem('apex_session_id', clientSessionId);

  const container = document.getElementById('chatWidgetMessages');
  if (container) {
    container.innerHTML = `
      <div class="chat-bubble-bot">
        Hi! I’m the virtual assistant for Apex Realty. I can help you find or list a property. What are you looking to do? (Buy / Rent / Sell / Rent out / Invest)
      </div>
    `;
  }

  const chips = document.getElementById('openingChips');
  if (chips) chips.style.display = 'flex';

  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// -----------------------------------------------------------------
// 3. PROPERTY INQUIRY SHORTCUT
// -----------------------------------------------------------------
function inquireProperty(propertyName) {
  selectedTargetProperty = propertyName;
  toggleChatWidget(true);
  const msg = `I am inquiring about acquiring ${propertyName}.`;
  handleUserSendMessage(msg);
}

// -----------------------------------------------------------------
// 4. WEB SPEECH API (Voice Input & Output)
// -----------------------------------------------------------------
function toggleVoiceOutput() {
  voiceOutputEnabled = !voiceOutputEnabled;
  const icon = document.getElementById('voiceMuteIcon');
  if (icon) {
    icon.className = voiceOutputEnabled ? "w-4 h-4 text-amber-400" : "w-4 h-4 text-slate-500";
  }
  if (!voiceOutputEnabled && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function speakResponse(text) {
  if (!window.speechSynthesis || !voiceOutputEnabled) return;
  window.speechSynthesis.cancel();

  // Strip symbols for natural speech
  const cleanText = text
    .replace(/[•*#_~`=]/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/---/g, '')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.05;
  utterance.pitch = 0.95;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith('en') && (
    v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Guy')
  ));
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Web Speech API not supported in this browser.');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    const btn = document.getElementById('widgetMicBtn');
    if (btn) btn.className = "p-2 rounded-lg bg-red-600 text-white pulsing-mic flex-shrink-0";
    const status = document.getElementById('widgetMicStatus');
    if (status) status.textContent = "Listening... Speak clearly.";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('chatWidgetInput');
    if (input) input.value = transcript;
    handleUserSendMessage(transcript);
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition notice:', event.error);
    stopListening();
  };

  recognition.onend = () => {
    stopListening();
  };
}

function toggleSpeechRecognition() {
  if (!recognition) {
    alert("Speech recognition is not supported in this browser. Please use text input.");
    return;
  }
  if (isListening) {
    recognition.stop();
    stopListening();
  } else {
    recognition.start();
  }
}

function stopListening() {
  isListening = false;
  const btn = document.getElementById('widgetMicBtn');
  if (btn) btn.className = "p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex-shrink-0 transition-all";
  const status = document.getElementById('widgetMicStatus');
  if (status) status.textContent = "Click mic to speak hands-free";
}

// -----------------------------------------------------------------
// 5. FETCH & RENDER LISTINGS
// -----------------------------------------------------------------
async function fetchListings() {
  try {
    const res = await fetch('/api/listings');
    const data = await res.json();
    if (data.listings && data.listings.length > 0) {
      listings = data.listings;
      renderListings(listings);
    }
  } catch (err) {
    console.error('Listings error:', err);
  }
}

function renderListings(items) {
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;

  grid.innerHTML = items.map(p => `
    <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/40 transition-all group flex flex-col shadow-xl">
      <div class="relative h-64 overflow-hidden">
        <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30">
          $${(p.price / 1000000).toFixed(2)}M
        </div>
        <div class="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-black/60 backdrop-blur-md text-slate-300">
          ${p.type}
        </div>
      </div>
      <div class="p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 class="font-serif-luxury text-lg font-bold text-white group-hover:text-amber-400 transition-colors">${p.title}</h3>
          <p class="text-xs text-slate-400 mt-1 flex items-center space-x-1">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-500/70 inline"></i>
            <span>${p.address}</span>
          </p>
          <div class="grid grid-cols-3 gap-2 py-4 border-y border-slate-800/80 my-4 text-center">
            <div>
              <span class="block text-xs font-bold text-slate-200">${p.beds}</span>
              <span class="text-[10px] text-slate-500 uppercase">Beds</span>
            </div>
            <div>
              <span class="block text-xs font-bold text-slate-200">${p.baths}</span>
              <span class="text-[10px] text-slate-500 uppercase">Baths</span>
            </div>
            <div>
              <span class="block text-xs font-bold text-slate-200">${p.sqft.toLocaleString()}</span>
              <span class="text-[10px] text-slate-500 uppercase">Sq Ft</span>
            </div>
          </div>
        </div>
        <button onclick="inquireProperty('${p.title}')" class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center justify-center space-x-2 transition-all">
          <i data-lucide="message-square-plus" class="w-4 h-4 text-amber-400"></i>
          <span>Inquire with AI Advisor</span>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function filterListings(category) {
  const buttons = document.querySelectorAll('.filter-tab-btn');
  buttons.forEach(b => {
    b.classList.remove('bg-amber-500/20', 'text-amber-300', 'border-amber-500/50');
    b.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
  });

  const activeBtn = document.getElementById('filterBtn-' + category);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
    activeBtn.classList.add('bg-amber-500/20', 'text-amber-300', 'border-amber-500/50');
  }

  if (category === 'all') {
    renderListings(listings);
  } else {
    const filtered = listings.filter(l => l.address.toLowerCase().includes(category.toLowerCase()));
    renderListings(filtered);
  }
}

// -----------------------------------------------------------------
// 6. BROKER CRM MODAL & DATA FETCHING
// -----------------------------------------------------------------
function openBrokerPortal() {
  const modal = document.getElementById('brokerPortalModal');
  if (modal) modal.classList.remove('hidden');
  if (!isBrokerAuthenticated) {
    document.getElementById('brokerAuthView').classList.remove('hidden');
    document.getElementById('brokerDashboardView').classList.add('hidden');
  } else {
    document.getElementById('brokerAuthView').classList.add('hidden');
    document.getElementById('brokerDashboardView').classList.remove('hidden');
    fetchCrmLeads();
  }
}

function closeBrokerPortal() {
  const modal = document.getElementById('brokerPortalModal');
  if (modal) modal.classList.add('hidden');
}

function verifyBrokerAuth() {
  const input = document.getElementById('brokerPassInput');
  const err = document.getElementById('brokerPassErr');
  if (input && input.value === 'broker123') {
    isBrokerAuthenticated = true;
    if (err) err.classList.add('hidden');
    document.getElementById('brokerAuthView').classList.add('hidden');
    document.getElementById('brokerDashboardView').classList.remove('hidden');
    fetchCrmLeads();
  } else {
    if (err) err.classList.remove('hidden');
  }
}

async function fetchCrmLeads() {
  const tbody = document.getElementById('crmLeadsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/leads');
    const data = await res.json();
    const leads = data.leads || [];

    // Calculate metrics
    const totalCount = leads.length;
    const hotCount = leads.filter(l => l.leadTier === 'HOT').length;
    const warmCount = leads.filter(l => l.leadTier === 'WARM').length;

    const totalEl = document.getElementById('crmTotalLeads');
    if (totalEl) totalEl.textContent = totalCount;
    const hotEl = document.getElementById('crmHotLeads');
    if (hotEl) hotEl.textContent = hotCount;
    const warmEl = document.getElementById('crmWarmLeads');
    if (warmEl) warmEl.textContent = warmCount;

    tbody.innerHTML = leads.map(l => {
      const isHot = l.leadTier === 'HOT';
      const isWarm = l.leadTier === 'WARM';
      const badgeClass = isHot
        ? 'bg-red-500/20 text-red-400 border-red-500/40'
        : isWarm
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          : 'bg-blue-500/20 text-blue-300 border-blue-500/40';

      return `
        <tr class="border-b border-slate-800/80 hover:bg-slate-900/50 transition-colors text-xs">
          <td class="py-3 px-4 font-mono font-bold text-amber-400">${l.leadId}</td>
          <td class="py-3 px-4 font-semibold text-white">${l.fullName}</td>
          <td class="py-3 px-4 text-slate-300 font-mono">${l.phone}</td>
          <td class="py-3 px-4 text-slate-300">${l.propertyInterest}</td>
          <td class="py-3 px-4 font-mono text-emerald-400 font-bold">${l.budgetRange}</td>
          <td class="py-3 px-4 text-slate-300">${l.purchaseTimeline}</td>
          <td class="py-3 px-4 font-mono font-bold text-center">${l.leadScore}/100</td>
          <td class="py-3 px-4 text-center">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}">
              ${l.leadTier}
            </span>
          </td>
          <td class="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">${l.recommendedAction}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('CRM leads fetch error:', err);
  }
}
