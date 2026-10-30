/**
 * PulseAI — Day 7 Post-Call Intelligence & Sentiment Analysis Client
 * Powered by n8n Master Cloud Brain & Google Sheets CRM
 */

let sampleCalls = [];
let currentCall = null;
let currentIntelligence = null;
let isAudioPlaying = false;
let audioWaveInterval = null;
let allCallLogs = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();
  buildWaveformBars();
  await loadSampleCalls();
  await fetchCallLogs();
  setupAudioListeners();
});

// -----------------------------------------------------------------
// 1. DATA INITIALIZATION & SAMPLE CALLS
// -----------------------------------------------------------------
async function loadSampleCalls() {
  try {
    const res = await fetch('/api/sample-calls');
    if (res.ok) {
      const data = await res.json();
      sampleCalls = data.calls || [];
      if (sampleCalls.length > 0) {
        selectSampleCall(sampleCalls[0].id);
      }
    }
  } catch (err) {
    console.error('Failed to load sample calls:', err);
  }
}

function selectSampleCall(callId) {
  const call = sampleCalls.find(c => c.id === callId);
  if (!call) return;

  currentCall = call;

  // Update scenario pills
  document.querySelectorAll('.scenario-pill').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`btnCall-${callId.replace('CALL-', '')}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update Player UI
  document.getElementById('playerCallBadge').innerText = call.id;
  document.getElementById('playerCallerName').innerText = call.callerName;
  document.getElementById('playerDuration').innerText = `0:00 / ${call.duration}`;

  // Audio setup
  const audio = document.getElementById('audioElement');
  if (audio) {
    audio.src = call.audioUrl || 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
    audio.currentTime = 0;
    pauseAudio();
  }

  // Populate Transcript
  renderTranscript(call.rawTranscript);

  // Automatically run intelligence analysis for seamless UX
  runIntelligenceAnalysis(call);
}

// -----------------------------------------------------------------
// 2. AUDIO PLAYBACK & WAVEFORM CONTROLS
// -----------------------------------------------------------------
function buildWaveformBars() {
  const container = document.getElementById('waveformBars');
  if (!container) return;
  container.innerHTML = '';

  const barCount = 38;
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'wave-bar';
    const height = Math.floor(Math.random() * 55) + 15;
    bar.style.height = `${height}%`;
    container.appendChild(bar);
  }
}

function setupAudioListeners() {
  const audio = document.getElementById('audioElement');
  const scrubber = document.getElementById('audioScrubber');
  if (!audio) return;

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const progress = (audio.currentTime / audio.duration) * 100;
      if (scrubber) scrubber.value = progress;

      // Update waveform bars progress
      const bars = document.querySelectorAll('.wave-bar');
      const activeIndex = Math.floor((progress / 100) * bars.length);
      bars.forEach((b, idx) => {
        if (idx <= activeIndex) b.classList.add('active');
        else b.classList.remove('active');
      });

      // Update time text
      const curM = Math.floor(audio.currentTime / 60);
      const curS = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
      const durM = Math.floor(audio.duration / 60);
      const durS = Math.floor(audio.duration % 60).toString().padStart(2, '0');
      const durElem = document.getElementById('playerDuration');
      if (durElem) durElem.innerText = `${curM}:${curS} / ${durM}:${durS}`;
    }
  });

  audio.addEventListener('ended', () => {
    pauseAudio();
    if (scrubber) scrubber.value = 0;
  });
}

function toggleAudioPlay() {
  const audio = document.getElementById('audioElement');
  if (!audio) return;

  if (isAudioPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function playAudio() {
  const audio = document.getElementById('audioElement');
  const icon = document.getElementById('playIcon');
  if (audio) {
    audio.play().then(() => {
      isAudioPlaying = true;
      if (icon) icon.setAttribute('data-lucide', 'pause');
      document.querySelectorAll('.wave-bar').forEach(b => b.classList.add('playing'));
      if (window.lucide) lucide.createIcons();
    }).catch(e => console.warn('Audio playback notice:', e));
  }
}

function pauseAudio() {
  const audio = document.getElementById('audioElement');
  const icon = document.getElementById('playIcon');
  if (audio) {
    audio.pause();
    isAudioPlaying = false;
    if (icon) icon.setAttribute('data-lucide', 'play');
    document.querySelectorAll('.wave-bar').forEach(b => b.classList.remove('playing'));
    if (window.lucide) lucide.createIcons();
  }
}

function restartAudio() {
  const audio = document.getElementById('audioElement');
  if (audio) {
    audio.currentTime = 0;
    playAudio();
  }
}

function scrubAudio(val) {
  const audio = document.getElementById('audioElement');
  if (audio && audio.duration) {
    audio.currentTime = (val / 100) * audio.duration;
  }
}

// -----------------------------------------------------------------
// 3. TRANSCRIPT DISPLAY & CUSTOM INPUT
// -----------------------------------------------------------------
function renderTranscript(text) {
  const container = document.getElementById('transcriptViewArea');
  if (!container) return;
  container.innerHTML = '';

  const lines = (text || '').split('\n').filter(l => l.trim().length > 0);
  lines.forEach(line => {
    const div = document.createElement('div');
    const isAgent = line.toLowerCase().startsWith('agent:') || line.toLowerCase().startsWith('receptionist:') || line.toLowerCase().startsWith('host:');

    div.className = isAgent ? 'transcript-bubble-agent' : 'transcript-bubble-caller';

    const parts = line.split(':');
    const speaker = parts[0];
    const speech = parts.slice(1).join(':').trim();

    div.innerHTML = `
      <span class="font-bold font-mono text-[11px] ${isAgent ? 'text-cyan-400' : 'text-amber-400'}">${speaker}:</span>
      <span class="text-slate-200 ml-1">${speech}</span>
    `;

    container.appendChild(div);
  });
}

function toggleCustomInputMode() {
  const viewArea = document.getElementById('transcriptViewArea');
  const inputArea = document.getElementById('customInputArea');
  const btn = document.getElementById('btnCustomMode');

  if (inputArea.classList.contains('hidden')) {
    inputArea.classList.remove('hidden');
    viewArea.classList.add('hidden');
    btn.innerText = 'Back to Transcript View';
  } else {
    inputArea.classList.add('hidden');
    viewArea.classList.remove('hidden');
    btn.innerText = 'Paste Custom Transcript';
  }
}

// -----------------------------------------------------------------
// 4. INTELLIGENCE ANALYSIS PIPELINE (PROXIES TO n8n CLOUD)
// -----------------------------------------------------------------
async function runIntelligenceAnalysis(overrideCall) {
  const btnText = document.getElementById('btnRunPipelineText');
  if (btnText) btnText.innerText = 'Analyzing Call Intelligence with n8n...';

  let payload = {};

  const inputArea = document.getElementById('customInputArea');
  const isCustomMode = inputArea && !inputArea.classList.contains('hidden');

  if (isCustomMode) {
    const rawText = document.getElementById('customTranscriptInput').value.trim();
    if (!rawText) {
      alert('Please paste a call transcript first.');
      if (btnText) btnText.innerText = 'Run Post-Call Intelligence Pipeline';
      return;
    }
    payload = {
      transcript: rawText,
      callerName: document.getElementById('customCallerName').value.trim() || 'Custom Prospect',
      phoneNumber: document.getElementById('customCallerPhone').value.trim() || '+1 (555) 019-2831',
      callType: 'Custom Call Audit',
      duration: '2m 45s'
    };
    renderTranscript(rawText);
  } else {
    payload = overrideCall || currentCall;
  }

  try {
    const res = await fetch('/api/analyze-call', {\n      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      currentIntelligence = data;
      renderIntelligenceDossier(data);
      // Refresh CRM logs
      fetchCallLogs();
    } else {
      console.error('Pipeline error:', res.statusText);
    }
  } catch (err) {
    console.error('Failed to run intelligence analysis:', err);
  } finally {
    if (btnText) btnText.innerText = 'Run Post-Call Intelligence Pipeline';
  }
}

// -----------------------------------------------------------------
// 5. RENDER INTELLIGENCE DOSSIER (RIGHT COLUMN)
// -----------------------------------------------------------------
function renderIntelligenceDossier(data) {
  const intel = data.intelligence || {};
  const meta = data.metadata || {};

  // 1. Call Meta & Header
  document.getElementById('dossierCallId').innerText = data.callId || 'CALL-701';
  document.getElementById('dossierCallType').innerText = meta.callType || 'General Inbound Call';
  document.getElementById('dossierCallerName').innerText = meta.callerName || 'Private Client';
  document.getElementById('dossierMeta').innerText = `${meta.company || 'Private Client'} • ${meta.phoneNumber || 'On file'} • Analyzed via ${data.processedVia === 'n8n_cloud_workflow' ? 'n8n Cloud Brain' : 'AI Engine'}`;

  // 2. Urgency Badge
  const badge = document.getElementById('dossierUrgencyBadge');
  const badgeText = document.getElementById('dossierUrgencyText');
  const isP0 = (intel.urgencyLevel || '').includes('P0');
  const isP1 = (intel.urgencyLevel || '').includes('P1');

  if (isP0) {
    badge.className = 'px-3.5 py-1.5 rounded-xl text-xs font-extrabold font-mono flex items-center space-x-2 bg-red-500/10 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10 animate-pulse';
    badgeText.innerText = '🚨 P0 - CRITICAL (<15 min)';
  } else if (isP1) {
    badge.className = 'px-3.5 py-1.5 rounded-xl text-xs font-extrabold font-mono flex items-center space-x-2 bg-amber-500/10 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10';
    badgeText.innerText = '⚡ P1 - HIGH PRIORITY (<2 hr)';
  } else {
    badge.className = 'px-3.5 py-1.5 rounded-xl text-xs font-extrabold font-mono flex items-center space-x-2 bg-slate-800 text-slate-300 border border-slate-700';
    badgeText.innerText = 'ℹ️ P2 - ROUTINE (<24h)';
  }

  // 3. Sentiment Gauge
  const scoreElem = document.getElementById('dossierSentimentScore');
  const catElem = document.getElementById('dossierSentimentCategory');
  const detailElem = document.getElementById('dossierSentimentDetail');
  const score = intel.sentimentScore || 0;

  scoreElem.innerText = `${score > 0 ? '+' : ''}${score} / 100`;
  catElem.innerText = intel.sentiment || 'Neutral';
  detailElem.innerText = intel.sentimentReasoning || 'Standard communication tone.';

  if (score >= 50) {
    scoreElem.className = 'font-mono font-bold text-emerald-400 text-sm';
  } else if (score < 0) {
    scoreElem.className = 'font-mono font-bold text-red-400 text-sm';
  } else {
    scoreElem.className = 'font-mono font-bold text-amber-400 text-sm';
  }

  // 4. Executive 3-Bullet TL;DR
  const summaryCont = document.getElementById('dossierSummaryContainer');
  summaryCont.innerHTML = '';
  const bullets = intel.executiveSummary || [];
  bullets.forEach(b => {
    const p = document.createElement('p');
    p.className = 'flex items-start space-x-2 leading-relaxed';
    p.innerHTML = `<span class="text-cyan-400 font-bold">•</span><span>${b}</span>`;
    summaryCont.appendChild(p);
  });

  // 5. Action Items Checklist
  const actionCont = document.getElementById('dossierActionItemsContainer');
  actionCont.innerHTML = '';
  const actions = intel.actionItems || [];
  actions.forEach((act, idx) => {
    const div = document.createElement('div');
    const isHigh = act.priority === 'IMMEDIATE' || act.priority === 'CRITICAL';
    div.className = 'p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs';
    div.innerHTML = `
      <div class="flex items-center space-x-2.5">
        <input type="checkbox" id="task-${idx}" class="task-checkbox accent-cyan-400 w-4 h-4 rounded cursor-pointer">
        <label for="task-${idx}" class="text-slate-200 cursor-pointer select-none">
          <span class="font-bold text-white">[${act.assignee}]</span> ${act.task}
        </label>
      </div>
      <div class="flex items-center space-x-2">
        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isHigh ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'}">${act.priority}</span>
        <span class="text-[10px] text-slate-500">${act.deadline}</span>
      </div>
    `;
    actionCont.appendChild(div);
  });

  // 6. Objections & Friction Points
  const objCont = document.getElementById('dossierObjectionsContainer');
  objCont.innerHTML = '';
  const objections = intel.objections || [];
  objections.forEach(obj => {
    const span = document.createElement('span');
    span.className = 'px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-amber-500/30 text-amber-300 flex items-center space-x-1.5';
    span.innerHTML = `<i data-lucide="alert-circle" class="w-3.5 h-3.5 text-amber-400"></i><span><b>${obj.tag}:</b> ${obj.detail}</span>`;
    objCont.appendChild(span);
  });

  // 7. Pivotal Quote
  const quoteElem = document.getElementById('dossierQuote');
  const quotes = intel.keyQuotes || [];
  if (quotes.length > 0) {
    quoteElem.innerText = `"${quotes[0]}"`;
  } else {
    quoteElem.innerText = '"I need confirmation on this today."';
  }

  if (window.lucide) lucide.createIcons();
}

// -----------------------------------------------------------------
// 6. DISPATCH ALERT SIMULATOR (SLACK / WHATSAPP)
// -----------------------------------------------------------------
function dispatchToSlack() {
  triggerDispatchAlert('SLACK_VIP_DISPATCH');
}

function dispatchToWhatsApp() {
  triggerDispatchAlert('WHATSAPP_OWNER_ALERT');
}

function triggerDispatchAlert(channel) {
  const cardText = currentIntelligence?.dispatchCard || '🚨 Immediate Lead Alert from PulseAI Pipeline';

  fetch('/api/dispatch-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: channel || 'SLACK_AND_WHATSAPP',
      alertText: cardText
    })
  }).then(r => r.json()).then(data => {
    document.getElementById('dispatchCardPreview').innerText = cardText;
    document.getElementById('dispatchAlertModal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  });
}

function triggerDispatchSimulationModal() {
  triggerDispatchAlert('MANUAL_SIMULATION');
}

function closeDispatchModal() {
  document.getElementById('dispatchAlertModal').classList.add('hidden');
}

function copyActionItemsToClipboard() {
  if (!currentIntelligence?.intelligence?.actionItems) return;
  const items = currentIntelligence.intelligence.actionItems
    .map(a => `[${a.priority}] ${a.task} (${a.assignee}) - Deadline: ${a.deadline}`)
    .join('\n');

  navigator.clipboard.writeText(items).then(() => {
    alert('Action checklist copied to clipboard!');
  });
}

// -----------------------------------------------------------------
// 7. GOOGLE SHEETS CRM LEDGER MODAL
// -----------------------------------------------------------------
async function fetchCallLogs() {
  try {
    const res = await fetch('/api/call-logs');
    if (res.ok) {
      const data = await res.json();
      allCallLogs = data.logs || [];
      document.getElementById('badgeLogCount').innerText = allCallLogs.length;

      // Update P0 count
      const p0Count = allCallLogs.filter(l => (l.urgencyLevel || '').includes('P0')).length;
      document.getElementById('metricP0Count').innerText = `${p0Count} Calls`;

      renderCallLogsTable(allCallLogs);
    }
  } catch (err) {
    console.error('Failed to fetch call logs:', err);
  }
}

function renderCallLogsTable(logs) {
  const tbody = document.getElementById('crmLedgerTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-slate-500">No calls logged yet.</td></tr>`;
    return;
  }

  logs.forEach(l => {
    const isP0 = (l.urgencyLevel || '').includes('P0');
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-900/60 transition-colors';
    tr.innerHTML = `
      <td class="py-3 px-4 font-mono font-bold text-cyan-400">${l.callId}</td>
      <td class="py-3 px-4 text-slate-400">${l.analyzedAt || 'Just now'}</td>
      <td class="py-3 px-4 font-bold text-white">${l.callerName}</td>
      <td class="py-3 px-4 text-slate-300 font-mono">${l.phoneNumber}</td>
      <td class="py-3 px-4 text-slate-300">${l.callType}</td>
      <td class="py-3 px-4 text-center">
        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isP0 ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'}">${l.urgencyLevel}</span>
      </td>
      <td class="py-3 px-4 text-center">
        <span class="font-mono font-bold ${l.sentimentScore >= 50 ? 'text-emerald-400' : (l.sentimentScore < 0 ? 'text-red-400' : 'text-amber-400')}">${l.sentiment} (${l.sentimentScore > 0 ? '+' : ''}${l.sentimentScore})</span>
      </td>
      <td class="py-3 px-4 text-slate-300 max-w-xs truncate" title="${l.executiveSummary.join(' | ')}">${l.executiveSummary[0] || 'Processed'}</td>
      <td class="py-3 px-4 text-center">
        <button onclick="inspectLoggedCall('${l.callId}')" class="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold">
          Inspect
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterLedger(type) {
  if (type === 'ALL') {
    renderCallLogsTable(allCallLogs);
  } else {
    const filtered = allCallLogs.filter(l => (l.urgencyLevel || '').includes(type));
    renderCallLogsTable(filtered);
  }
}

function inspectLoggedCall(callId) {
  closeCrmLedgerModal();
  const sample = sampleCalls.find(c => c.id === callId);
  if (sample) {
    selectSampleCall(sample.id);
  } else {
    const logged = allCallLogs.find(l => l.callId === callId);
    if (logged) {
      renderIntelligenceDossier({
        callId: logged.callId,
        metadata: {
          callerName: logged.callerName,
          phoneNumber: logged.phoneNumber,
          callType: logged.callType,
          duration: logged.duration,
          analyzedAt: logged.analyzedAt
        },
        intelligence: {
          urgencyLevel: logged.urgencyLevel,
          sentiment: logged.sentiment,
          sentimentScore: logged.sentimentScore,
          executiveSummary: logged.executiveSummary,
          actionItems: (logged.actionItems || '').split('; ').map((item, idx) => ({
            id: `ACT-0${idx + 1}`,
            task: item,
            assignee: 'Staff on-duty',
            priority: logged.urgencyLevel.includes('P0') ? 'CRITICAL' : 'HIGH',
            deadline: 'Immediate'
          })),
          objections: (logged.objections || '').split('; ').map(o => ({ tag: 'Log Detail', detail: o })),
          keyQuotes: []
        }
      });
    }
  }
}

function openCrmLedgerModal() {
  document.getElementById('crmLedgerModal').classList.remove('hidden');
  fetchCallLogs();
}

function closeCrmLedgerModal() {
  document.getElementById('crmLedgerModal').classList.add('hidden');
}
