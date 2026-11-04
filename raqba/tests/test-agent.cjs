// Raqba OS: Comprehensive Multi-Agent Verification Suite
// Tests:
// 1. Conversational AI Agent (Full Multi-Turn Dialogue, Multi-Slot Extraction, Skip, Summary Card & Reference ID)
// 2. Autonomous 4-Vector Dispatch Agent (Scoring, Hot/Warm/Cold, Broker Round-Robin, 3-Bullet Dossier)
// 3. Voice Hotline Ingestion Agent (WebRTC / Vapi Sub-15s Dispatch)
// 4. Broker Agent Operations (Scoped Queue, Manual Budget Verification, Showing Gate Clearance, ETO 2002 Agreement)

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cbprlgdplrgctprgubap.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicHJsZ2RwbHJnY3Rwcmd1YmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2Njc2MDksImV4cCI6MjEwOTI0MzYwOX0.aDZRoi6KFvYT9VE2WechPrVEhJxRh9VBR7QJoZJtoVk';
const N8N_BASE_URL = 'https://n8n.srv1767318.hstgr.cloud';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function testAgentSuite() {
  console.log('\n================================================================');
  console.log('🤖 RAQBA MULTI-AGENT SYSTEM: FULL END-TO-END VERIFICATION');
  console.log('================================================================\n');

  // ====================================================================
  // SUITE 1: Conversational AI Agent (Full Dialogue Walkthrough)
  // ====================================================================
  console.log('--- SUITE 1: CONVERSATIONAL AI AGENT (MULTI-TURN DIALOGUE) ---');
  let sessionState = {
    sessionId: 'sess-' + Date.now(),
    currentStep: 'greeting',
    collectedData: {}
  };

  // Turn 1: Client Greets & expresses multi-slot intent in Roman Urdu
  console.log('\n  Turn 1: Client message -> "Assalam o alaikum, mujhe DHA Phase 6 Lahore mein 1 kanal villa khareedna hai, budget 8.5 crore cash hai"');
  let res1 = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Assalam o alaikum, mujhe DHA Phase 6 Lahore mein 1 kanal villa khareedna hai, budget 8.5 crore cash hai',
      session: sessionState,
      currentStep: sessionState.currentStep
    })
  });
  let d1 = await res1.json();
  assert(res1.status === 200, 'AI Agent responded HTTP 200 on Turn 1');
  assert(d1.language === 'ru', `Auto-detected Roman Urdu: ${d1.language}`);
  assert(d1.collectedData?.intent === 'Buy', `Extracted Intent: ${d1.collectedData?.intent}`);
  assert(d1.collectedData?.city === 'Lahore' && d1.collectedData?.area_name === 'DHA', 'Extracted Location: DHA Lahore');
  assert(d1.collectedData?.area_value === 1 && d1.collectedData?.area_unit === 'Kanal', 'Extracted Area: 1 Kanal');
  assert(d1.collectedData?.budget_max === 85000000, `Extracted Budget: Rs 8.5 Crore (${d1.collectedData?.budget_max} PKR)`);
  assert(d1.currentStep === 'name', `Smart jump: skipped already answered questions directly to step '${d1.currentStep}'`);
  sessionState.currentStep = d1.currentStep;
  sessionState.collectedData = { ...sessionState.collectedData, ...d1.collectedData };

  // Turn 2: Client provides Name
  console.log('\n  Turn 2: Client provides Name -> "Mian Usman Mansha"');
  let res2 = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Mian Usman Mansha',
      session: sessionState,
      currentStep: sessionState.currentStep,
      collectedData: sessionState.collectedData
    })
  });
  let d2 = await res2.json();
  assert(d2.collectedData?.full_name === 'Mian Usman Mansha', `Extracted Name: ${d2.collectedData?.full_name}`);
  assert(d2.currentStep === 'phone', `Transitioned to step: '${d2.currentStep}'`);
  sessionState.currentStep = d2.currentStep;
  sessionState.collectedData = { ...sessionState.collectedData, ...d2.collectedData };

  // Turn 3: Client provides Pakistani Phone
  console.log('\n  Turn 3: Client provides Phone -> "0300 8492000"');
  let res3 = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: '0300 8492000',
      session: sessionState,
      currentStep: sessionState.currentStep,
      collectedData: sessionState.collectedData
    })
  });
  let d3 = await res3.json();
  assert(d3.collectedData?.phone === '+923008492000', `Normalized Pakistani phone: ${d3.collectedData?.phone}`);
  assert(d3.currentStep === 'email', `Transitioned to optional step: '${d3.currentStep}'`);
  sessionState.currentStep = d3.currentStep;
  sessionState.collectedData = { ...sessionState.collectedData, ...d3.collectedData };

  // Turn 4: Client skips optional Email
  console.log('\n  Turn 4: Client skips optional Email -> "skip"');
  let res4 = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'skip',
      session: sessionState,
      currentStep: sessionState.currentStep,
      collectedData: sessionState.collectedData
    })
  });
  let d4 = await res4.json();
  assert(d4.collectedData?.email === 'skipped', 'Gracefully recorded email as skipped');
  assert(d4.currentStep === 'contact_preference', `Transitioned to step: '${d4.currentStep}'`);
  sessionState.currentStep = d4.currentStep;
  sessionState.collectedData = { ...sessionState.collectedData, ...d4.collectedData };

  // Turn 5: Client specifies Contact Preference
  console.log('\n  Turn 5: Client specifies Contact Preference -> "WhatsApp, shaam 5 baje"');
  let res5 = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'WhatsApp, shaam 5 baje',
      session: sessionState,
      currentStep: sessionState.currentStep,
      collectedData: sessionState.collectedData
    })
  });
  let d5 = await res5.json();
  assert(d5.collectedData?.preferred_contact_method === 'WhatsApp', `Preference extracted: ${d5.collectedData?.preferred_contact_method}`);
  sessionState.currentStep = d5.currentStep;
  sessionState.collectedData = { ...sessionState.collectedData, ...d5.collectedData };

  // Turn 6: Client specifies Purpose & Beds
  console.log('\n  Turn 6: Client specifies Purpose -> "Personal Living, 4 beds, Cash, Immediate"');
  sessionState.collectedData = {
    ...sessionState.collectedData,
    purpose: 'Personal Living',
    bedrooms: 4,
    payment_method: 'Cash',
    timeline: 'Immediate',
    appointment_at: 'Tomorrow 4 PM'
  };

  // Turn 7: Interactive Confirmation Summary Card
  console.log('\n  Turn 7: System renders Confirmation Summary Card');
  let res7 = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'preview',
      session: {
        ...sessionState,
        currentStep: 'appointment'
      },
      currentStep: 'appointment'
    })
  });
  let d7 = await res7.json();
  assert(d7.isSummary === true || d7.currentStep === 'confirmation', 'Interactive summary card rendered for client review');

  // Turn 8: Final Confirmation
  console.log('\n  Turn 8: Client confirms -> "Haan, sab theek hai"');
  let res8 = await fetch(`${N8N_BASE_URL}/webhook/raqba/chat-concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Haan, sab theek hai',
      session: {
        ...sessionState,
        currentStep: 'confirmation'
      },
      currentStep: 'confirmation'
    })
  });
  let d8 = await res8.json();
  assert(d8.isComplete === true, 'AI Agent successfully concluded conversation');
  assert(/^RQB-\d{4}-\d{4}$/.test(d8.referenceId), `Generated Reference ID: ${d8.referenceId}`);
  assert(d8.assignedBroker, `Assigned Local Broker: ${d8.assignedBroker}`);

  // ====================================================================
  // SUITE 2: Autonomous 4-Vector Dispatch Agent
  // ====================================================================
  console.log('\n--- SUITE 2: AUTONOMOUS 4-VECTOR DISPATCH AGENT ---');
  let generatedLeadId = null;
  try {
    // Insert into Supabase leads table as frontend would upon completion
    const { data: leadRecord, error: leadErr } = await supabase.from('leads').insert({
      full_name: 'Mian Usman Mansha',
      phone: '+923008492000',
      email: 'usman.mansha@nishat-group.pk',
      lead_source: 'chatbot',
      buyer_seller_type: 'Buyer',
      intent: 'Buy',
      property_type: 'House',
      city: 'Lahore',
      area_name: 'DHA Phase 6',
      area_value: 1,
      area_unit: 'Kanal',
      budget_max: 85000000,
      financing_type: 'Cash',
      timeline_months: 1,
      preferred_contact_method: 'WhatsApp',
      reference_id: d8.referenceId,
      verbatim_quote: 'Liquidating portfolio; seeking 1 Kanal designer villa in DHA Phase 6 Lahore for immediate all-cash closing.',
      status: 'new',
      deal_stage: 'new',
      data_consent: true
    }).select().single();

    assert(!leadErr && leadRecord?.id, `Lead persisted in Supabase with ref ${leadRecord?.reference_id}`);
    generatedLeadId = leadRecord?.id;

    // Trigger Autonomous Dispatch RPC
    const { data: dispatchResult, error: dispErr } = await supabase.rpc('raqba_score_and_dispatch', {
      p_lead_id: leadRecord.id
    });

    assert(!dispErr && dispatchResult?.success, 'Autonomous Dispatch Agent ran successfully');
    assert(dispatchResult?.priority === 'P0 Critical', `Priority: ${dispatchResult?.priority}`);
    assert(dispatchResult?.temperature === 'Hot', `Temperature: ${dispatchResult?.temperature}`);
    assert(dispatchResult?.assigned_agent?.name, `Broker assigned: ${dispatchResult?.assigned_agent?.name} (${dispatchResult?.assigned_agent?.city_specialization || 'Regional'})`);
    assert(dispatchResult?.dossier?.bullet_1_liquidity, `Dossier Bullet 1: ${dispatchResult?.dossier?.bullet_1_liquidity}`);
    assert(dispatchResult?.dossier?.bullet_2_intent, `Dossier Bullet 2: ${dispatchResult?.dossier?.bullet_2_intent}`);
    assert(dispatchResult?.dossier?.bullet_3_action, `Dossier Bullet 3: ${dispatchResult?.dossier?.bullet_3_action}`);
  } catch (e) {
    assert(false, `Dispatch agent test failed: ${e.message}`);
  }

  // ====================================================================
  // SUITE 3: Voice Hotline Ingestion Agent
  // ====================================================================
  console.log('\n--- SUITE 3: VOICE HOTLINE INGESTION AGENT ---');
  try {
    const startTime = Date.now();
    const voiceRes = await fetch(`${N8N_BASE_URL}/webhook/raqba/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Malik Jahangir Khan',
        phone: '+92 322 9988776',
        email: 'jahangir.khan@peshawar-textiles.pk',
        budgetMax: 150000000, // Rs 15 Crore
        financingType: 'Cash',
        timelineMonths: 1,
        targetPropertySlug: 'sector-e7-diplomatic-residence-islamabad',
        verbatimQuote: 'Transferred full funds from Habib Bank. Need private showing for Diplomatic Villa in Sector E-7 Islamabad immediately.'
      })
    });
    const durationSec = (Date.now() - startTime) / 1000;

    assert(voiceRes.status === 200, `Voice Ingestion Agent responded HTTP 200`);
    const voiceData = await voiceRes.json();
    assert(voiceData.dispatch?.priority === 'P0 Critical', 'Voice Agent classified P0 Critical priority');
    assert(durationSec < 15, `Sub-15s Voice Ingestion SLA met (${durationSec.toFixed(1)}s elapsed)`);
    assert(voiceData.dispatch?.broker?.name, `Voice call routed to broker: ${voiceData.dispatch?.broker?.name}`);
  } catch (e) {
    assert(false, `Voice hotline agent failed: ${e.message}`);
  }

  // ====================================================================
  // SUITE 4: Human Broker Agent Operations
  // ====================================================================
  console.log('\n--- SUITE 4: LICENSED BROKER AGENT OPERATIONS ---');
  try {
    // Fetch active broker
    const { data: broker } = await supabase.from('agents').select('*').limit(1).single();
    assert(broker && broker.name, `Active Licensed Broker: ${broker.name} (License #${broker.license_number})`);

    // 1. Broker Scoped Queue Test
    const { data: brokerLeads, error: qErr } = await supabase
      .from('leads')
      .select('id, full_name, priority, reference_id')
      .eq('assigned_agent_id', broker.id);
    assert(!qErr && Array.isArray(brokerLeads), `Broker workspace loaded ${brokerLeads?.length || 0} scoped leads`);

    // 2. Broker Verifies Budget Manually
    if (generatedLeadId) {
      const { data: vRes, error: vErr } = await supabase.rpc('raqba_verify_budget', {
        p_lead_id: generatedLeadId,
        p_agent_id: broker.id,
        p_verified: true,
        p_notes: 'Verified via MCB Bank private wealth liquidity statement.'
      });
      assert(!vErr && vRes?.success && vRes?.budget_verified === true, 'Broker executed manual budget verification');

      // Verify status in DB
      const { data: updatedLead } = await supabase.from('leads').select('deal_stage, budget_verified').eq('id', generatedLeadId).single();
      assert(updatedLead?.deal_stage === 'budget_verified' && updatedLead?.budget_verified === true, 'Lead stage updated to budget_verified in DB');
    }

    // 3. Broker Confirms Showing & Issues Gate PIN
    const { data: prop } = await supabase.from('properties').select('id, title').eq('gated_community', true).limit(1).single();
    const { data: newShowing } = await supabase.from('showings').insert({
      property_id: prop.id,
      lead_id: generatedLeadId,
      agent_id: broker.id,
      showing_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      status: 'pending_confirmation',
      broker_confirmed: false,
      notes: 'VIP client private inspection requested'
    }).select().single();

    assert(newShowing && newShowing.id, `Created showing request for ${prop.title}`);

    // Broker confirms
    const { data: confirmRes, error: confErr } = await supabase.rpc('raqba_confirm_showing', {
      p_showing_id: newShowing.id,
      p_agent_id: broker.id,
      p_notes: `Confirmed by ${broker.name}. Gate PIN cleared.`
    });

    assert(!confErr && confirmRes?.success, 'Broker confirmed showing via raqba_confirm_showing RPC');
    assert(confirmRes?.gate_pin_code && confirmRes.gate_pin_code.startsWith('#'), `Gate PIN generated: ${confirmRes?.gate_pin_code}`);
    assert(confirmRes?.google_maps_pin, `Google Maps Pin dispatched: ${confirmRes?.google_maps_pin}`);

    // 4. Broker Executes Legal Agreement under ETO 2002
    const { data: newAgreement, error: agErr } = await supabase.from('agreements').insert({
      lead_id: generatedLeadId,
      property_id: prop.id,
      agent_id: broker.id,
      agreement_type: 'representation',
      envelope_id: 'ENV-RQB-' + Math.floor(1000 + Math.random() * 9000),
      sign_status: 'sent',
      legal_note: 'Standard Pakistan Exclusive Representation Agreement under ETO 2002.'
    }).select().single();

    assert(!agErr && newAgreement?.id, `Created agreement envelope: ${newAgreement?.envelope_id}`);

    const { data: signRes, error: signErr } = await supabase.rpc('raqba_sign_agreement', {
      p_agreement_id: newAgreement.id,
      p_signer_name: 'Mian Usman Mansha',
      p_signature_svg: '<svg>MianUsmanMansha_DigitalSignature</svg>',
      p_signer_ip: '39.40.18.99'
    });

    assert(!signErr && signRes?.status === 'executed', 'Broker executed legally binding agreement under Pakistan ETO 2002');
  } catch (e) {
    assert(false, `Broker agent operations failed: ${e.message}`);
  }

  // Summary
  console.log('\n================================================================');
  console.log(`MULTI-AGENT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testAgentSuite().catch(err => {
  console.error('Fatal multi-agent test failure:', err);
  process.exit(1);
});
