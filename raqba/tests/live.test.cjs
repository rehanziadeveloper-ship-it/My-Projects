// Raqba: Automated Live Verification Test Suite
// Verifies Supabase PostgreSQL Database, Raqba RPC Functions, n8n Webhooks,
// 5 Services / Intents, Multi-Slot Extraction, Language Auto-Detection, Validations, 
// Human Handoff, Confirmation Edit Loop, Hot/Warm/Cold Scoring & Header Single-Line Layout.

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cbprlgdplrgctprgubap.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicHJsZ2RwbHJnY3Rwcmd1YmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2Njc2MDksImV4cCI6MjEwOTI0MzYwOX0.aDZRoi6KFvYT9VE2WechPrVEhJxRh9VBR7QJoZJtoVk';
const N8N_BASE_URL = 'https://n8n.srv1767318.hstgr.cloud';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('\n================================================================');
  console.log('🏛️  RAQBA — AUTONOMOUS BROKERAGE OS LIVE VERIFICATION SUITE');
  console.log('================================================================\n');

  // ====================================================================
  // TEST 1: Database Health & Schema Verification
  // ====================================================================
  console.log('TEST 1: Supabase Database Table & Storage Verification');
  try {
    const { data: properties, error: pErr } = await supabase.from('properties').select('id, title, price, city, area_unit');
    assert(!pErr && properties && properties.length >= 6, `Properties catalog active (${properties?.length || 0} Pakistani listings in PKR)`);

    const { data: agents, error: aErr } = await supabase.from('agents').select('id, name, license_number, city_specialization');
    assert(!aErr && agents && agents.length >= 4, `Licensed brokers active (${agents?.length || 0} licensed partners in Lahore/ISB/KHI/RWP)`);

    const { data: leads, error: lErr } = await supabase.from('leads').select('id, full_name, priority, budget_max, reference_id, temperature');
    assert(!lErr && leads && leads.length >= 4, `Pipeline leads active (${leads?.length || 0} records with slot extensions)`);

    const { data: sessions, error: sErr } = await supabase.from('chat_sessions').select('id').limit(5);
    assert(!sErr, 'Table chat_sessions active in database');

    const { data: messages, error: mErr } = await supabase.from('chat_messages').select('id').limit(5);
    assert(!mErr, 'Table chat_messages active in database');

    const { data: submissions, error: subErr } = await supabase.from('property_submissions').select('id').limit(5);
    assert(!subErr, 'Table property_submissions active in database');
  } catch (err) {
    assert(false, `Database query failed: ${err.message}`);
  }

  // ====================================================================
  // TEST 2: Raqba Scoring RPC & Hot/Warm/Cold Temperature Classification
  // ====================================================================
  console.log('\nTEST 2: Raqba 4-Vector Scoring RPC & Temperature Classification');
  let testLeadId = null;
  try {
    const { data: newLead, error: insertErr } = await supabase.from('leads').insert({
      full_name: 'Mian Tariq Mansha',
      email: 'tariq.mansha@nishat-group.pk',
      phone: '+92 300 8489911',
      lead_source: 'website_form',
      buyer_seller_type: 'Buyer',
      intent: 'Buy',
      property_type: 'House',
      city: 'Lahore',
      area_name: 'DHA Phase 6',
      area_value: 1,
      area_unit: 'Kanal',
      budget_max: 75000000.00, // Rs 7.5 Crore
      financing_type: 'Cash',
      timeline_months: 1,
      verbatim_quote: 'Liquidating industrial dividend portfolio; seeking 1 Kanal designer villa in DHA Phase 6 Lahore for immediate all-cash closing.',
      status: 'new',
      deal_stage: 'new',
      data_consent: true
    }).select().single();

    assert(!insertErr && newLead?.id, `Inserted test all-cash Pakistani buyer: ${newLead?.full_name}`);
    testLeadId = newLead?.id;

    // Call Raqba RPC
    const { data: scoreRes, error: rpcErr } = await supabase.rpc('raqba_score_and_dispatch', {
      p_lead_id: newLead.id
    });

    assert(!rpcErr && scoreRes?.success, 'RPC raqba_score_and_dispatch executed successfully');
    assert(scoreRes?.priority === 'P0 Critical', `Priority correctly classified as P0 Critical (Got: ${scoreRes?.priority})`);
    assert(scoreRes?.temperature === 'Hot', `Lead temperature classified as Hot (Got: ${scoreRes?.temperature})`);
    assert(scoreRes?.intent_score >= 85, `Intent score correctly calculated >= 85 (Got: ${scoreRes?.intent_score})`);
    assert(scoreRes?.assigned_agent?.name, `Round-robin assigned broker: ${scoreRes?.assigned_agent?.name}`);
    assert(scoreRes?.dossier?.bullet_1_liquidity, 'Strict 3-bullet dossier generated with liquidity vector');

    // Test legacy alias wrapper for backward compatibility
    const { data: legacyRes, error: legacyErr } = await supabase.rpc('realtypulse_score_and_dispatch', {
      p_lead_id: newLead.id
    });
    assert(!legacyErr && legacyRes?.success, 'Legacy alias realtypulse_score_and_dispatch executed successfully');
  } catch (err) {
    assert(false, `Raqba scoring test failed: ${err.message}`);
  }

  // ====================================================================
  // TEST 3: Broker Manual Budget Verification RPC
  // ====================================================================
  console.log('\nTEST 3: Broker Manual Budget Verification RPC (raqba_verify_budget)');
  try {
    if (testLeadId) {
      const { data: agent } = await supabase.from('agents').select('id').limit(1).single();
      const { data: verifyRes, error: vErr } = await supabase.rpc('raqba_verify_budget', {
        p_lead_id: testLeadId,
        p_agent_id: agent.id,
        p_verified: true,
        p_notes: 'Verified via MCB Bank liquidity statement & phone call.'
      });

      assert(!vErr && verifyRes?.success && verifyRes?.budget_verified === true, 'Broker manual budget verification RPC executed successfully');
    } else {
      assert(false, 'No test lead available for budget verification test');
    }
  } catch (err) {
    assert(false, `Budget verification failed: ${err.message}`);
  }

  // ====================================================================
  // TEST 4: Showing Logistics & Reference ID Generator
  // ====================================================================
  console.log('\nTEST 4: Showing Logistics & Reference ID RPC');
  try {
    // Reference ID generator RPC
    const { data: refId, error: refErr } = await supabase.rpc('raqba_generate_reference_id');
    assert(!refErr && /^RQB-\d{4}-\d{4}$/.test(refId), `Generated Reference ID matching RQB-YYYY-XXXX pattern: ${refId}`);

    const { data: prop } = await supabase.from('properties').select('id, title, gated_community').eq('gated_community', true).limit(1).single();
    const { data: lead } = await supabase.from('leads').select('id, full_name').limit(1).single();
    const { data: agent } = await supabase.from('agents').select('id').limit(1).single();

    // Insert pending showing
    const { data: showing } = await supabase.from('showings').insert({
      property_id: prop.id,
      lead_id: lead.id,
      agent_id: agent.id,
      showing_time: new Date(Date.now() + 86400000).toISOString(),
      status: 'pending_confirmation',
      broker_confirmed: false,
      notes: 'Client requested evening walkthrough'
    }).select().single();

    assert(showing && showing.id, `Created pending showing for ${prop.title}`);

    // Broker confirms showing
    const { data: confirmRes, error: confirmErr } = await supabase.rpc('realtypulse_confirm_showing', {
      p_showing_id: showing.id,
      p_agent_id: agent.id,
      p_notes: 'Confirmed by Chaudhry Kamran. Society gate pass issued.'
    });

    assert(!confirmErr && confirmRes?.success, 'Showing confirmation RPC executed successfully');
    assert(confirmRes?.status === 'confirmed', 'Showing status updated to confirmed');
    assert(confirmRes?.gate_pin_code && confirmRes.gate_pin_code.startsWith('#'), `Gated society PIN code generated: ${confirmRes?.gate_pin_code}`);
    assert(confirmRes?.google_maps_pin, `Google Maps location pin attached: ${confirmRes?.google_maps_pin}`);
  } catch (err) {
    assert(false, `Showing logistics failed: ${err.message}`);
  }

  // ====================================================================
  // TEST 5: Automated Legal Agreement & e-Signing (ETO 2002)
  // ====================================================================
  console.log('\nTEST 5: Automated Representation Agreement & e-Signing (ETO 2002)');
  try {
    const { data: agreement } = await supabase.from('agreements').select('id, agreement_type, envelope_id').limit(1).single();
    assert(agreement && agreement.id, `Found agreement envelope: ${agreement?.envelope_id}`);

    const { data: signRes, error: signErr } = await supabase.rpc('raqba_sign_agreement', {
      p_agreement_id: agreement.id,
      p_signer_name: 'Mian Tariq Mansha',
      p_signature_svg: 'data:image/svg+xml;utf8,<svg>digital_signature_pakistan</svg>',
      p_signer_ip: '39.40.12.88'
    });

    assert(!signErr && signRes?.status === 'executed', 'Agreement executed legally and locked under Pakistan ETO 2002');
  } catch (err) {
    assert(false, `Agreement execution failed: ${err.message}`);
  }

  // ====================================================================
  // TEST 6: Live Hostinger n8n Webhook Ingestion (Raqba & Legacy Fallbacks)
  // ====================================================================
  console.log('\nTEST 6: Live Hostinger n8n Webhook Endpoints');
  try {
    // 1. Raqba Direct Webhook Lead
    const leadRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Chaudhry Faisal Hayat',
        email: 'faisal.hayat@jhang-cotton.pk',
        phone: '+92 300 7891234',
        budgetMax: 85000000,
        financingType: 'Cash',
        timelineMonths: 1,
        targetPropertySlug: '1-kanal-spanish-villa-dha-phase-6-lahore',
        verbatimQuote: 'Full cash ready for immediate transfer. Need private walkthrough this Saturday.'
      })
    });

    assert(leadRes.status === 200, `n8n Webhook /webhook/raqba/lead returned HTTP 200`);
    const leadData = await leadRes.json();
    assert(leadData.dispatch?.priority === 'P0 Critical', 'n8n evaluated P0 Critical priority for Pakistani cash buyer');
    assert(leadData.dispatch?.dispatchLatencySeconds < 15, `Sub-15s latency SLA met (${leadData.dispatch?.dispatchLatencySeconds}s)`);

    // 2. Raqba Portal Lead (Zameen.com / OLX)
    const portalRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/portal-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portal: 'Zameen.com',
        leadName: 'Syed Hamza Ali',
        leadPhone: '+92 321 4455667',
        leadEmail: 'hamza.ali@pak-oil.com',
        propertyTitle: 'Sector E-7 Modern Diplomatic Villa Islamabad',
        priceMax: 120000000,
        message: 'Direct portal lead for diplomatic residence in E-7 Islamabad.'
      })
    });
    assert(portalRes.status === 200, `n8n Webhook /webhook/raqba/portal-lead returned HTTP 200`);
    const portalData = await portalRes.json();
    assert(portalData.success === true, 'n8n successfully ingested and scored Zameen.com portal lead');

    // 3. Showing Clearance Webhook
    const showingRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/showing-clearance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pofAmount: 50000000,
        propertyMin: 20000000,
        propertyAddress: 'DHA Phase 6 Lahore'
      })
    });

    assert(showingRes.status === 200, `n8n Webhook /webhook/raqba/showing-clearance returned HTTP 200`);
    const showingData = await showingRes.json();
    assert(showingData.brokerConfirmed === true, 'n8n issued broker showing clearance');
    assert(showingData.gateCode && showingData.gateCode.startsWith('#'), `n8n issued gate clearance PIN: ${showingData.gateCode}`);

    // 4. Google Calendar Sync Webhook
    const calendarSyncRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/calendar-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        showingId: 's-test-calendar-sync-1',
        leadName: 'Hamza Tariq',
        clientPhone: '+92 300 1234567',
        propertyTitle: '1 Kanal Modern Designer Villa',
        propertyAddress: 'Sector J, Phase 6, DHA Lahore',
        showingTime: new Date(Date.now() + 86400000).toISOString(),
        brokerName: 'Chaudhry Kamran',
        brokerEmail: 'kamran@raqba.pk',
        gateCode: '#8492'
      })
    });
    assert(calendarSyncRes.status === 200, 'n8n Webhook /webhook/raqba/calendar-sync returned HTTP 200');
    const calData = await calendarSyncRes.json();
    assert(calData.success === true, 'n8n calendar sync engine returned success');
    assert(calData.googleCalendarUrl && calData.googleCalendarUrl.includes('calendar.google.com'), 'n8n generated pre-filled Google Calendar URL');
    assert(calData.eventId, `n8n calendar sync event ID created: ${calData.eventId}`);

    // 5. Backward Compatibility Check on Legacy Paths
    const legacyLeadRes = await fetch(`${N8N_BASE_URL}/webhook/realtypulse/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Legacy Compatibility Check',
        phone: '+92 300 0000000',
        budgetMax: 50000000
      })
    });
    assert(legacyLeadRes.status === 200, 'Legacy webhook /webhook/realtypulse/lead continues to respond HTTP 200');
  } catch (err) {
    assert(false, `n8n webhook test failed: ${err.message}`);
  }

  // ====================================================================
  // TEST 7: Raqba AI Concierge — 5 Services / Intents Support
  // ====================================================================
  console.log('\nTEST 7: Raqba AI Concierge — 5 Services & Multi-Slot Extraction');
  try {
    // Service 1: Buy
    const buyRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want to buy a 1 kanal house in DHA Lahore for 8 crore cash' })
    });
    const buyData = await buyRes.json();
    assert(buyData.collectedData?.intent === 'Buy', 'Service 1 (Buy) correctly extracted');
    assert(buyData.collectedData?.budget_max === 80000000, `Crore budget parsed to 80M PKR: ${buyData.collectedData?.budget_max}`);
    assert(buyData.collectedData?.area_unit === 'Kanal' && buyData.collectedData?.area_value === 1, 'Area parsed as 1 Kanal');
    assert(buyData.currentStep === 'name', 'Multi-slot extraction skipped intent and location steps directly to name');

    // Service 2: Rent
    const rentRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Looking to rent an apartment in Clifton Karachi for 2 lakh per month' })
    });
    const rentData = await rentRes.json();
    assert(rentData.collectedData?.intent === 'Rent', 'Service 2 (Rent) correctly extracted');
    assert(rentData.collectedData?.city === 'Karachi', 'City Clifton Karachi extracted');
    assert(rentData.collectedData?.budget_max === 200000, 'Lakh monthly rent parsed to 200,000 PKR');

    // Service 3: Sell
    const sellRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want to sell my 10 marla commercial building in Gulberg Lahore' })
    });
    const sellData = await sellRes.json();
    assert(sellData.collectedData?.intent === 'Sell', 'Service 3 (Sell) correctly extracted');
    assert(sellData.collectedData?.property_type === 'Commercial', 'Commercial property type identified');

    // Service 4: Rent out my property
    const rentOutRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want to rent out my 5 marla house in Bahria Town Rawalpindi' })
    });
    const rentOutData = await rentOutRes.json();
    assert(rentOutData.collectedData?.intent === 'Rent out', 'Service 4 (Rent out) correctly extracted');
    assert(rentOutData.collectedData?.area_value === 5 && rentOutData.collectedData?.area_unit === 'Marla', 'Extracted 5 Marla');

    // Service 5: Invest
    const investRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Interested to invest 5 crore in high yield real estate in Islamabad' })
    });
    const investData = await investRes.json();
    assert(investData.collectedData?.intent === 'Invest', 'Service 5 (Invest) correctly extracted');
    assert(investData.collectedData?.city === 'Islamabad', 'Investment city Islamabad captured');
  } catch (err) {
    assert(false, `Services test failed: ${err.message}`);
  }

  // ====================================================================
  // TEST 8: Language Auto-Detection (English, Roman Urdu, Urdu Script)
  // ====================================================================
  console.log('\nTEST 8: Language Auto-Detection (English / Roman Urdu / Urdu Script)');
  try {
    // English
    const enRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, what properties do you have in Lahore?' })
    });
    const enData = await enRes.json();
    assert(enData.language === 'en', `English detected correctly (${enData.language})`);

    // Roman Urdu
    const ruRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Mujhe DHA Phase 5 Lahore mein 10 marla plot khareedna hai, budget 2 crore hai' })
    });
    const ruData = await ruRes.json();
    assert(ruData.language === 'ru', `Roman Urdu detected correctly (${ruData.language})`);
    assert(ruData.reply.includes('Aap ka poora naam') || ruData.reply.includes('kya hai'), 'Replied in natural Roman Urdu');

    // Urdu Script
    const urRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'مجھے لاہور میں 1 کنال گھر خریدنا ہے' })
    });
    const urData = await urRes.json();
    assert(urData.language === 'ur', `Urdu script detected correctly (${urData.language})`);
    assert(/[\u0600-\u06FF]/.test(urData.reply), 'Replied in Urdu script');
  } catch (err) {
    assert(false, `Language auto-detection test failed: ${err.message}`);
  }

  // ====================================================================
  // TEST 9: Skip Handling & Human Handoff Triggers
  // ====================================================================
  console.log('\nTEST 9: Skip Handling & Human Handoff Triggers');
  try {
    // Skip test on optional slot (e.g., email)
    const skipRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentStep: 'email',
        session: {
          currentStep: 'email',
          collectedData: { full_name: 'Zahid Khan', phone: '+923001234567', intent: 'Buy' }
        },
        message: 'skip'
      })
    });
    const skipData = await skipRes.json();
    assert(skipData.collectedData?.email === 'skipped', 'Skip handled on optional email slot');
    assert(skipData.currentStep === 'contact_preference', 'State machine advanced to contact_preference after skip');

    // Human Handoff: Direct agent request
    const handoffRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want to speak with a human agent directly please' })
    });
    const handoffData = await handoffRes.json();
    assert(handoffData.isHandoff === true, 'Handoff triggered upon direct human agent request');
    assert(handoffData.handoffReason === 'Direct Agent Request', `Handoff reason recorded: ${handoffData.handoffReason}`);
    assert(handoffData.quickReplies?.some(q => q.includes('+92 300 8492910')), 'Emergency brokerage helpline phone provided in handoff response');

    // Human Handoff: Legal / Registry questions
    const legalRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is the court fee and stamp paper registry tax for FBR non-filers?' })
    });
    const legalData = await legalRes.json();
    assert(legalData.isHandoff === true, 'Legal/Tax inquiry escalated to senior broker');
  } catch (err) {
    assert(false, `Handoff and skip test failed: ${err.message}`);
  }

  // ====================================================================
  // TEST 10: Summary Confirmation & Edit Loop
  // ====================================================================
  console.log('\nTEST 10: Confirmation Summary & Edit Loop');
  try {
    // Request edit on confirmation step
    const editReqRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentStep: 'confirmation',
        session: {
          currentStep: 'confirmation',
          collectedData: { full_name: 'Zahid Khan', phone: '+923001234567', intent: 'Buy', budget_max: 50000000 }
        },
        message: 'No, edit details'
      })
    });
    const editReqData = await editReqRes.json();
    assert(editReqData.currentStep === 'edit_field', 'Edit loop entered: transitioned to edit_field step');

    // Select budget to edit
    const editFieldRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentStep: 'edit_field',
        session: {
          currentStep: 'edit_field',
          collectedData: { full_name: 'Zahid Khan', phone: '+923001234567', intent: 'Buy', budget_max: 50000000 }
        },
        message: 'Budget'
      })
    });
    const editFieldData = await editFieldRes.json();
    assert(editFieldData.currentStep === 'buyer_budget', 'Router successfully redirected back to buyer_budget step');
    assert(editFieldData.collectedData?.budget_max === null, 'Budget field cleared for updated value entry');

    // Final confirmation -> Completion with Reference ID
    const confirmRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentStep: 'confirmation',
        session: {
          currentStep: 'confirmation',
          collectedData: { full_name: 'Zahid Khan', phone: '+923001234567', intent: 'Buy', city: 'Lahore', budget_max: 50000000, timeline: 'Immediate' }
        },
        message: 'Yes, all correct'
      })
    });
    const confirmData = await confirmRes.json();
    assert(confirmData.isComplete === true, 'Inquiry completed successfully upon user confirmation');
    assert(/^RQB-\d{4}-\d{4}$/.test(confirmData.referenceId), `Assigned official Raqba Reference ID: ${confirmData.referenceId}`);
    assert(confirmData.assignedBroker, `Dispatched to Senior Broker: ${confirmData.assignedBroker}`);
  } catch (err) {
    assert(false, `Confirmation loop test failed: ${err.message}`);
  }

  // ====================================================================
  // TEST 11: Header Layout Integrity & Language Selector Removal
  // ====================================================================
  console.log('\nTEST 11: Frontend Header Single-Line Layout & Language Removal Verification');
  try {
    const navbarPath = path.resolve(__dirname, '../src/components/Navbar.tsx');
    const navbarContent = fs.readFileSync(navbarPath, 'utf8');

    // Check header is single line flex with whitespace-nowrap and 72px height
    assert(navbarContent.includes('whitespace-nowrap'), 'Navbar desktop row enforces whitespace-nowrap');
    assert(navbarContent.includes('h-[72px]'), 'Navbar enforces strict 72px fixed height');
    assert(navbarContent.includes('flex items-center justify-between'), 'Navbar uses flex items-center justify-between');

    // Check no language switcher exists in Navbar
    assert(!navbarContent.includes('language') && !navbarContent.includes('setLanguage'), 'Navbar contains ZERO language toggle state or buttons');
    assert(!navbarContent.includes('اردو') && !navbarContent.includes('Roman Urdu'), 'Navbar contains no manual language selector dropdown');

    // Check HomePage enforces English UI
    const homePath = path.resolve(__dirname, '../src/pages/HomePage.tsx');
    const homeContent = fs.readFileSync(homePath, 'utf8');
    assert(homeContent.includes('dir="ltr"') || !homeContent.includes('dir="rtl"'), 'HomePage operates exclusively in LTR mode');
    assert(!homeContent.includes('useLanguage'), 'HomePage has removed language toggle hooks');
  } catch (err) {
    assert(false, `Header layout verification failed: ${err.message}`);
  }

  // ====================================================================
  // TEST 12: Supabase Row Level Security (RLS) Verification
  // ====================================================================
  console.log('\nTEST 12: Supabase Row Level Security (RLS) Verification');
  try {
    // Verify RLS tables are accessible for anon reads according to public policy
    const { data: propTest, error: pTestErr } = await supabase.from('properties').select('id').limit(1);
    assert(!pTestErr && propTest, 'Public RLS policy allows anonymous read on properties catalog');

    const { data: brokerTest, error: bTestErr } = await supabase.from('agents').select('id, name').limit(1);
    assert(!bTestErr && brokerTest, 'Public RLS policy allows read on licensed broker team');

    const { data: subTest, error: sTestErr } = await supabase.from('property_submissions').select('id').limit(1);
    assert(!sTestErr, 'RLS policy allows query on property_submissions');
  } catch (err) {
    assert(false, `RLS verification failed: ${err.message}`);
  }

  // Summary
  console.log('\n================================================================');
  console.log(`FINAL RESULT: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
