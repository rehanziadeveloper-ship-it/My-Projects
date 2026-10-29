// Apex Realty AI — Pro-Level 5-Phase Slot-Filling State Machine Engine

function parseConversationalPrice(text) {
  if (!text) return null;
  let str = String(text).trim();

  // Strip out dimensions, bedrooms, timelines that shouldn't be parsed as price
  str = str.replace(/\b\d+(?:,\d+)?\s*(?:sqft|sq\.?\s*ft|square\s*feet|beds?|bedrooms?|br|bhk|days?|months?|years?)\b/gi, '').trim();
  if (!str) return null;

  // Word to digit mapping
  const wordMap = {
    'half a million': '500k',
    'half million': '500k',
    'a million': '1 million',
    'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
  };

  let normalized = str.toLowerCase();
  for (const [w, d] of Object.entries(wordMap)) {
    normalized = normalized.replace(new RegExp(`\\b${w}\\b`, 'gi'), d);
  }

  // 1. Range match: e.g. "1m to 2m", "1 - 2 million", "$1.5M - $2M", "800k to 1.2 million", "1-2m"
  const rangeRegex = /(\$?\s*\d+(?:\.\d+)?\s*(?:million|mil|m|billion|b|k)?)\s*(?:to|-|–)\s*(\$?\s*\d+(?:\.\d+)?\s*(?:million|mil|m|billion|b|k)?)/i;
  const rangeMatch = normalized.match(rangeRegex);
  if (rangeMatch) {
    let p1 = rangeMatch[1].trim();
    let p2 = rangeMatch[2].trim();
    return formatPriceToken(p1) + ' - ' + formatPriceToken(p2);
  }

  // 2. Single token with million/m/k/billion: e.g. "1 million", "around 1.5m", "100k", "2.5M"
  const unitRegex = /(\d+(?:\.\d+)?)\s*(million|mil|m|billion|b|k)\b/i;
  const unitMatch = normalized.match(unitRegex);
  if (unitMatch) {
    const num = parseFloat(unitMatch[1]);
    const unit = unitMatch[2].toLowerCase();
    if (unit === 'k') {
      return `$${num * 1000 >= 1000 ? (num).toLocaleString() + 'K' : num * 1000}`;
    } else if (unit.startsWith('m')) {
      return `$${num} Million`;
    } else if (unit.startsWith('b')) {
      return `$${num} Billion`;
    }
  }

  // 3. Raw dollar or large numbers: e.g. "$4,000,000", "1500000", "$500,000"
  const numRegex = /\$?\s*(\d{1,3}(?:,\d{3})+|\d{5,12})/i;
  const numMatch = normalized.match(numRegex);
  if (numMatch) {
    const rawDigits = numMatch[1].replace(/,/g, '');
    const val = parseFloat(rawDigits);
    if (val >= 1000000) {
      const inM = (val / 1000000).toFixed(1).replace(/\.0$/, '');
      return `$${inM} Million`;
    } else if (val >= 10000) {
      return `$${val.toLocaleString()}`;
    }
  }

  // 4. Standalone dollar amount: e.g. "$750,000" or "$3.5M"
  const dollarRegex = /\$[\d,.]+\s*(?:million|m|k|billion)?/i;
  const dollarMatch = str.match(dollarRegex);
  if (dollarMatch) {
    return dollarMatch[0].trim();
  }

  // 5. Small single number fallback when price is explicitly being asked
  const justNumMatch = normalized.match(/\b(\d+(?:\.\d+)?)\b/);
  if (justNumMatch) {
    const n = parseFloat(justNumMatch[1]);
    if (n > 0 && n <= 100) {
      return `$${n} Million`;
    }
  }

  return null;
}

function formatPriceToken(token) {
  token = token.replace(/^\$/, '').trim();
  if (/k\b/i.test(token)) {
    const n = parseFloat(token);
    return `$${n}K`;
  }
  if (/(?:million|mil|m)\b/i.test(token)) {
    const n = parseFloat(token);
    return `$${n}M`;
  }
  if (/(?:billion|b)\b/i.test(token)) {
    const n = parseFloat(token);
    return `$${n}B`;
  }
  const n = parseFloat(token);
  if (!isNaN(n)) {
    if (n >= 1000) return `$${n.toLocaleString()}`;
    return `$${n}M`;
  }
  return token;
}

function runStateMachine(userMessage, targetProperty, sessionState) {
  const rawMsg = (userMessage || '').trim();
  const lower = rawMsg.toLowerCase();

  let state = sessionState ? JSON.parse(JSON.stringify(sessionState)) : {
    phase: 1,
    intent: '',
    fullName: '',
    phone: '',
    email: '',
    preferredContact: '',
    purpose: '',
    propertyType: '',
    location: '',
    budget: '',
    bedrooms: '',
    paymentMethod: '',
    timeline: '',
    mustHaves: '',
    sizeCondition: '',
    askingPrice: '',
    documentReadiness: '',
    occupancyStatus: '',
    bookingAsked: false,
    bookingDateTime: '',
    bookingSlot: null,
    calendarBooked: false,
    isConfirmed: false,
    referenceId: '',
    leadScore: 0,
    leadTier: 'COLD',
    recommendedAction: '',
    lastPrompt: 'opening'
  };

  // Reset trigger
  if (/reset|start over|restart|new inquiry/i.test(lower)) {
    const newState = {
      phase: 1,
      intent: '',
      fullName: '',
      phone: '',
      email: '',
      preferredContact: '',
      purpose: '',
      propertyType: '',
      location: '',
      budget: '',
      bedrooms: '',
      paymentMethod: '',
      timeline: '',
      mustHaves: '',
      sizeCondition: '',
      askingPrice: '',
      documentReadiness: '',
      occupancyStatus: '',
      bookingAsked: false,
      bookingDateTime: '',
      bookingSlot: null,
      calendarBooked: false,
      isConfirmed: false,
      referenceId: '',
      leadScore: 0,
      leadTier: 'COLD',
      recommendedAction: '',
      lastPrompt: 'ask_intent'
    };
    const reply = "Hi! I’m the virtual assistant for Apex Realty. What are you looking to do? (Buy / Rent / Sell / Rent out / Invest)";
    return {
      reply,
      actionType: 'chat',
      sessionState: newState,
      state: newState
    };
  }

  // Shortcut from listing card
  if (targetProperty && !state.intent) {
    state.intent = 'Buy';
    state.propertyType = 'Luxury Residence';
    state.location = targetProperty;
    state.purpose = 'Personal Residence';
  }

  // 1. Intent Detection (Phase 1)
  if (!state.intent) {
    if (/\b(?:sell|listing|list my|selling)\b/i.test(lower)) state.intent = 'Sell';
    else if (/\b(?:rent out|lease out|landlord)\b/i.test(lower)) state.intent = 'Rent out';
    else if (/\b(?:invest|investment|rental yield|roi)\b/i.test(lower)) state.intent = 'Invest';
    else if (/\b(?:rent|lease|renting)\b/i.test(lower)) state.intent = 'Rent';
    else if (/\b(?:buy|purchase|acquiring|acquire|buyer)\b/i.test(lower)) state.intent = 'Buy';
  }

  // 2. Sequential Contact Extraction (Phase 2)
  if (state.intent) {
    // 2A: Full Name
    if (!state.fullName) {
      if (state.lastPrompt === 'ask_name') {
        const nameMatch = rawMsg.match(/(?:my name is|name is|name:|i am|i'm|this is|call me)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
        if (nameMatch) {
          state.fullName = nameMatch[1].trim();
        } else {
          const clean = rawMsg.split(/[,;\n]/)[0].trim();
          if (/^[A-Za-z]+(?:\s+[A-Za-z]+)?$/.test(clean) && !/^(buy|sell|rent|invest|hi|hello|hey|good)/i.test(clean)) {
            state.fullName = clean;
          }
        }
      }
    }

    // 2B: Phone / WhatsApp
    if (state.fullName && !state.phone) {
      if (state.lastPrompt === 'ask_phone') {
        const phoneMatch = rawMsg.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,14}/);
        if (phoneMatch) {
          state.phone = phoneMatch[0];
        } else if (/\d{7,15}/.test(rawMsg.replace(/[-.\s()]/g, ''))) {
          state.phone = rawMsg.trim();
        }
      }
    }

    // 2C: Email (Sequential)
    if (state.phone && !state.email) {
      if (state.lastPrompt === 'ask_email') {
        const emailMatch = rawMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
          state.email = emailMatch[0];
        } else if (/none|no|skip|n\/a|don't have|na/i.test(lower)) {
          state.email = 'Not provided';
        } else if (rawMsg.includes('@')) {
          state.email = rawMsg.trim();
        }
      }
    }

    // 2D: Preferred Contact Method & Time
    if (state.email && !state.preferredContact) {
      if (state.lastPrompt === 'ask_contact_pref') {
        if (/whatsapp/i.test(lower)) {
          if (/morning/i.test(lower)) state.preferredContact = 'Morning via WhatsApp';
          else if (/evening/i.test(lower)) state.preferredContact = 'Evening via WhatsApp';
          else state.preferredContact = 'WhatsApp';
        } else if (/phone|call/i.test(lower)) {
          if (/morning/i.test(lower)) state.preferredContact = 'Morning phone call';
          else if (/evening/i.test(lower)) state.preferredContact = 'Evening phone call';
          else state.preferredContact = 'Phone call';
        } else if (/email/i.test(lower)) {
          state.preferredContact = 'Email';
        } else {
          state.preferredContact = rawMsg;
        }
      }
    }
  }

  // 3A: Buyer / Renter Branch (Phase 3A)
  if (state.preferredContact && (state.intent === 'Buy' || state.intent === 'Rent' || state.intent === 'Invest')) {
    // 1. Purpose
    if (!state.purpose && state.lastPrompt === 'ask_purpose') {
      if (/living|personal|family home|live in|myself|residence/i.test(lower)) state.purpose = 'Personal Residence';
      else if (/invest|rental income|portfolio|roi|tenant/i.test(lower)) state.purpose = 'Investment';
      else if (state.intent === 'Invest') state.purpose = 'Investment';
      else state.purpose = rawMsg;
    }

    // 2. Property Type
    if (state.purpose && !state.propertyType && state.lastPrompt === 'ask_property_type') {
      if (/penthouse/i.test(lower)) state.propertyType = 'Sky Penthouse';
      else if (/villa|estate/i.test(lower)) state.propertyType = 'Luxury Estate / Villa';
      else if (/condo|apartment/i.test(lower)) state.propertyType = 'Modern Luxury Condo';
      else if (/single family|house/i.test(lower)) state.propertyType = 'Single Family Home';
      else if (/chalet|mountain/i.test(lower)) state.propertyType = 'Alpine Chalet';
      else state.propertyType = rawMsg;
    }

    // 3. Location
    if (state.propertyType && !state.location && state.lastPrompt === 'ask_location') {
      const locMatch = lower.match(/\b(bel-air|bel air|los angeles|tribeca|manhattan|new york|nyc|austin|texas|miami|brickell|florida|aspen|colorado|beverly hills)\b/i);
      if (locMatch) state.location = locMatch[0].toUpperCase();
      else state.location = rawMsg.toUpperCase();
    }

    // 4. Budget (Conversational Number Support)
    if (state.location && !state.budget && state.lastPrompt === 'ask_budget') {
      const price = parseConversationalPrice(rawMsg);
      if (price) {
        state.budget = price;
      } else {
        state.budget = '$' + rawMsg;
      }
    }

    // 5. Bedrooms
    if (state.budget && !state.bedrooms && state.lastPrompt === 'ask_bedrooms') {
      const bedMatch = lower.match(/\b(\d+)\s*(?:beds?|bedrooms?|br|bhk)\b/i);
      if (bedMatch) state.bedrooms = bedMatch[1] + ' Bedrooms';
      else if (/^\d+$/.test(rawMsg)) state.bedrooms = rawMsg + ' Bedrooms';
      else state.bedrooms = rawMsg;
    }

    // 6. Payment Method
    if (state.bedrooms && !state.paymentMethod && state.lastPrompt === 'ask_payment') {
      if (/cash|all cash|liquid|funds ready/i.test(lower)) state.paymentMethod = 'Cash Buyer (Verified Proof of Funds)';
      else if (/pre-approv|pre approved|preapproved|letter in hand/i.test(lower)) state.paymentMethod = 'Pre-Approved Mortgage';
      else if (/loan|mortgage|financing/i.test(lower)) state.paymentMethod = 'Seeking Loan Financing';
      else state.paymentMethod = rawMsg;
    }

    // 7. Timeline
    if (state.paymentMethod && !state.timeline && state.lastPrompt === 'ask_timeline') {
      if (/immediate|30 day|asap|now|this month|urgent/i.test(lower)) state.timeline = 'Immediate (< 30 days)';
      else if (/1 to 3|1-3|few month|60 day|90 day|soon/i.test(lower)) state.timeline = '1 to 3 months';
      else if (/3 to 6|6 month|half year/i.test(lower)) state.timeline = '3 to 6 months';
      else if (/flexible|explor|brows/i.test(lower)) state.timeline = 'Flexible / Exploring';
      else state.timeline = rawMsg;
    }

    // 8. Must-Haves
    if (state.timeline && !state.mustHaves && state.lastPrompt === 'ask_must_haves') {
      state.mustHaves = rawMsg;
    }
  }

  // 3B: Seller / Landlord Branch (Phase 3B)
  if (state.preferredContact && (state.intent === 'Sell' || state.intent === 'Rent out')) {
    // 1. Property Type
    if (!state.propertyType && state.lastPrompt === 'ask_seller_type') {
      if (/penthouse/i.test(lower)) state.propertyType = 'Sky Penthouse';
      else if (/villa|estate/i.test(lower)) state.propertyType = 'Luxury Estate / Villa';
      else if (/condo|apartment/i.test(lower)) state.propertyType = 'Condo';
      else if (/single family|house/i.test(lower)) state.propertyType = 'Single Family Home';
      else if (/commercial/i.test(lower)) state.propertyType = 'Commercial';
      else state.propertyType = rawMsg;
    }

    // 2. Location
    if (state.propertyType && !state.location && state.lastPrompt === 'ask_seller_location') {
      const locMatch = lower.match(/\b(bel-air|bel air|los angeles|tribeca|manhattan|new york|nyc|austin|texas|miami|brickell|florida|aspen|colorado|beverly hills)\b/i);
      if (locMatch) state.location = locMatch[0].toUpperCase();
      else state.location = rawMsg.toUpperCase();
    }

    // 3. Size / Condition
    if (state.location && !state.sizeCondition && state.lastPrompt === 'ask_seller_size') {
      if (/renovat|turnkey|brand new|mint condition|excellent/i.test(lower)) state.sizeCondition = 'Turnkey / Newly Renovated';
      else state.sizeCondition = rawMsg;
    }

    // 4. Asking Price (Conversational Number Support)
    if (state.sizeCondition && !state.askingPrice && state.lastPrompt === 'ask_seller_price') {
      const price = parseConversationalPrice(rawMsg);
      if (price) {
        state.askingPrice = price;
      } else {
        state.askingPrice = '$' + rawMsg;
      }
    }

    // 5. Document Readiness
    if (state.askingPrice && !state.documentReadiness && state.lastPrompt === 'ask_seller_docs') {
      if (/title in hand|clean title|ready|deed/i.test(lower)) state.documentReadiness = 'Title Deed in Hand (Clean)';
      else if (/mortgage|loan/i.test(lower)) state.documentReadiness = 'Existing Mortgage';
      else state.documentReadiness = rawMsg;
    }

    // 6. Occupancy Status
    if (state.documentReadiness && !state.occupancyStatus && state.lastPrompt === 'ask_seller_occupancy') {
      if (/vacant|empty/i.test(lower)) state.occupancyStatus = 'Vacant';
      else if (/owner/i.test(lower)) state.occupancyStatus = 'Owner-Occupied';
      else if (/tenant|rented/i.test(lower)) state.occupancyStatus = 'Tenant-Occupied';
      else state.occupancyStatus = rawMsg;
    }

    // 7. Timeline
    if (state.occupancyStatus && !state.timeline && state.lastPrompt === 'ask_seller_timeline') {
      if (/immediate|30 day|asap|now/i.test(lower)) state.timeline = 'Immediate (< 30 days)';
      else if (/60 day|soon|few month/i.test(lower)) state.timeline = '30 to 60 days';
      else if (/flexible|no rush/i.test(lower)) state.timeline = 'Flexible';
      else state.timeline = rawMsg;
    }
  }

  // Phase 4: Google Calendar Booking Check
  const buyerCriteriaComplete = (state.intent === 'Buy' || state.intent === 'Rent' || state.intent === 'Invest') && state.mustHaves;
  const sellerCriteriaComplete = (state.intent === 'Sell' || state.intent === 'Rent out') && state.timeline;

  if ((buyerCriteriaComplete || sellerCriteriaComplete) && !state.bookingAsked) {
    state.phase = 4;
    state.bookingAsked = true;
    state.lastPrompt = 'ask_booking';
    const reply = "Would you like to schedule a site visit or a call with our agent? What date and time work for you?";
    return {
      reply,
      actionType: 'chat',
      responsePayload: { reply, phase: 4, isComplete: false, sessionState: state, state },
      sessionState: state,
      state
    };
  }

  if (state.bookingAsked && !state.bookingDateTime) {
    state.bookingDateTime = rawMsg;
    state.calendarBooked = true;
    state.phase = 5;
    state.lastPrompt = 'ask_confirmation';

    // Calculate appointment ISO slots
    const now = new Date();
    let targetDate = new Date(now.getTime());
    const lowAppt = state.bookingDateTime.toLowerCase();
    if (lowAppt.includes('tomorrow')) targetDate.setDate(targetDate.getDate() + 1);
    else if (lowAppt.includes('day after tomorrow')) targetDate.setDate(targetDate.getDate() + 2);
    else {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const curDay = targetDate.getDay();
      const tgtDay = days.findIndex(d => lowAppt.includes(d));
      if (tgtDay !== -1) {
        let diff = tgtDay - curDay;
        if (diff <= 0) diff += 7;
        targetDate.setDate(targetDate.getDate() + diff);
      } else {
        targetDate.setDate(targetDate.getDate() + 1);
      }
    }

    let hour = 14;
    let minute = 0;
    const timeMatch = lowAppt.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = (timeMatch[3] || '').toUpperCase();
      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
    }
    targetDate.setHours(hour, minute, 0, 0);

    const startIso = targetDate.toISOString();
    const endIso = new Date(targetDate.getTime() + 45 * 60000).toISOString();
    const formattedDate = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formattedTime = targetDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    state.bookingSlot = { startIso, endIso, formattedDate, formattedTime };

    const calendarSummary = `Apex Realty: ${state.intent} Consultation — ${state.fullName || 'Private Client'}`;
    const calendarDescription = `Client: ${state.fullName || 'Private Client'}\nPhone: ${state.phone || 'On file'}\nEmail: ${state.email || 'On file'}\nPreferred: ${state.preferredContact || 'Direct'}\nIntent: ${state.intent}\nProperty: ${state.propertyType || ''} (${state.location || ''})\nTimeline: ${state.timeline || ''}\nNotes: Booked via Apex Realty AI Virtual Assistant (Day 6)`;

    const propDetail = state.intent === 'Sell' || state.intent === 'Rent out'
      ? `${state.propertyType} in ${state.location} — Asking: ${state.askingPrice} (${state.sizeCondition})`
      : `${state.propertyType} in ${state.location} — Budget: ${state.budget} (${state.purpose})`;

    const terms = state.intent === 'Sell' || state.intent === 'Rent out'
      ? `Documents: ${state.documentReadiness} | Status: ${state.occupancyStatus} | Timeline: ${state.timeline}`
      : `Financing: ${state.paymentMethod} | Timeline: ${state.timeline} | Must-Haves: ${state.mustHaves}`;

    const summary = `Here is the summary of your inquiry:\n• Intent: ${state.intent}\n• Client: ${state.fullName}\n• Contact: ${state.phone} | ${state.email} (${state.preferredContact})\n• Property: ${propDetail}\n• Terms: ${terms}\n• Scheduled Appointment: ${state.bookingDateTime} (Reserved on Calendar)\n\nIs everything correct?`;

    return {
      actionType: 'book_calendar',
      reply: summary,
      startIso,
      endIso,
      calendarSummary,
      calendarDescription,
      responsePayload: {
        reply: summary,
        phase: 5,
        isComplete: false,
        calendarBooked: true,
        bookingDetails: state.bookingSlot,
        sessionState: state,
        state
      },
      sessionState: state,
      state
    };
  }

  // Phase 5: Confirmation & Storage
  if (state.bookingDateTime && !state.isConfirmed) {
    const isAffirmative = /^(?:yes|yep|yeah|correct|looks good|perfect|confirm|confirmed|all good|that's right|sounds good)\b/i.test(lower);
    if (isAffirmative) {
      state.isConfirmed = true;
      state.referenceId = '#APX-' + Math.floor(1000 + Math.random() * 9000);

      // Calculate Lead Score & Tier
      let score = 50;
      if (state.intent === 'Buy' || state.intent === 'Rent' || state.intent === 'Invest') {
        if (/cash/i.test(state.paymentMethod)) score += 35;
        else if (/pre-approv/i.test(state.paymentMethod)) score += 25;
        else score += 15;

        if (/immediate/i.test(state.timeline)) score += 15;
        else if (/1 to 3/i.test(state.timeline)) score += 10;
      } else {
        if (/in hand/i.test(state.documentReadiness)) score += 35;
        if (/vacant/i.test(state.occupancyStatus)) score += 15;
      }
      state.leadScore = Math.min(100, score);
      state.leadTier = score >= 80 ? 'HOT' : (score >= 60 ? 'WARM' : 'COLD');
      state.recommendedAction = score >= 80
        ? "IMMEDIATE DISPATCH: Direct Managing Broker VIP Call within 15 min & Private Showing Reserved."
        : "PRIORITY FOLLOW-UP: Send Curated Dossier & Schedule Consultation within 24h.";

      // Determine Target Google Sheets Tab
      let targetTab = 'Buy_Property';
      if (state.intent === 'Sell') targetTab = 'Sell_Property';
      else if (state.intent === 'Rent' || state.intent === 'Rent out') targetTab = 'Rent_Out';
      else if (state.intent === 'Invest') targetTab = 'Invest';

      const nowStr = new Date().toLocaleDateString('en-US') + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const safePhone = state.phone ? (state.phone.startsWith('+') ? "'" + state.phone : state.phone) : 'On file';
      const emailVal = state.email || 'Not provided';
      const propInterest = state.intent === 'Sell' || state.intent === 'Rent out'
        ? `${state.propertyType} in ${state.location} (${state.sizeCondition || 'Listing'})`
        : `${state.propertyType} in ${state.location}`;
      const budgetVal = state.budget || state.askingPrice || '$2,000,000+';
      const financingVal = state.paymentMethod || state.documentReadiness || 'Verified Funds / Clean Title';
      const statusScoreVal = `${state.leadScore}/100 (${state.leadTier})`;

      const qualifiedLead = {
        leadId: state.referenceId,
        date: nowStr,
        fullName: state.fullName,
        phone: safePhone,
        email: emailVal,
        propertyType: propInterest,
        budgetOrPrice: budgetVal,
        timeline: state.timeline || 'Immediate',
        statusScore: statusScoreVal,
        targetTab,
        leadScore: state.leadScore,
        leadTier: state.leadTier,
        recommendedAction: state.recommendedAction
      };

      state.finalLead = qualifiedLead;

      const finalReply = `✅ Buyer Qualification Complete!\n\nHere is the summary of your inquiry:\n• Client: ${state.fullName}\n• Target Property: ${propInterest}\n• Budget: ${budgetVal}\n• Financing: ${financingVal}\n• Timeline: ${state.timeline}\n• Intent: ${state.intent}\n\nLead Score: ${state.leadScore}/100 (${state.leadTier})\nAction: ${state.recommendedAction}\nAppointment: ${state.bookingDateTime}\n\nThank you! Our managing broker has received your file (${state.referenceId}) and will be in touch shortly.`;

      return {
        actionType: 'store_sheets',
        targetTab,
        reply: finalReply,
        Lead_ID: state.referenceId,
        Date: nowStr,
        Name: state.fullName,
        Phone: safePhone,
        Email: emailVal,
        Property_Type: propInterest,
        Budget_or_Price: budgetVal,
        Timeline: state.timeline,
        Status_Score: statusScoreVal,
        responsePayload: {
          reply: finalReply,
          phase: 5,
          isComplete: true,
          lead: qualifiedLead,
          referenceId: state.referenceId,
          sessionState: state,
          state
        },
        sessionState: state,
        state
      };
    }
  }

  // ----------------------------------------------------
  // STRICT 1-QUESTION NEXT-QUESTION SELECTOR
  // ----------------------------------------------------
  if (!state.intent) {
    state.phase = 1;
    state.lastPrompt = 'ask_intent';
    const reply = "Hi! I’m the virtual assistant for Apex Realty. What are you looking to do? (Buy / Rent / Sell / Rent out / Invest)";
    return { reply, actionType: 'chat', responsePayload: { reply, phase: 1, isComplete: false, sessionState: state, state }, sessionState: state, state };
  }

  // Phase 2 Questions (Sequential)
  if (!state.fullName) {
    state.phase = 2;
    state.lastPrompt = 'ask_name';
    const reply = "Great! May I have your full name?";
    return { reply, actionType: 'chat', responsePayload: { reply, phase: 2, isComplete: false, sessionState: state, state }, sessionState: state, state };
  }

  if (!state.phone) {
    state.phase = 2;
    state.lastPrompt = 'ask_phone';
    const reply = `Thank you, ${state.fullName}! What is the best phone or WhatsApp number to reach you?`;
    return { reply, actionType: 'chat', responsePayload: { reply, phase: 2, isComplete: false, sessionState: state, state }, sessionState: state, state };
  }

  if (!state.email) {
    state.phase = 2;
    state.lastPrompt = 'ask_email';
    const reply = "Got it! What is your email address so we can send property dossiers and appointment confirmations?";
    return { reply, actionType: 'chat', responsePayload: { reply, phase: 2, isComplete: false, sessionState: state, state }, sessionState: state, state };
  }

  if (!state.preferredContact) {
    state.phase = 2;
    state.lastPrompt = 'ask_contact_pref';
    const reply = "What is your preferred contact method and time for our broker to reach you? (e.g., Morning via WhatsApp, or Afternoon phone call)";
    return { reply, actionType: 'chat', responsePayload: { reply, phase: 2, isComplete: false, sessionState: state, state }, sessionState: state, state };
  }

  // Phase 3A Questions (Buyer / Renter / Invest)
  if (state.intent === 'Buy' || state.intent === 'Rent' || state.intent === 'Invest') {
    state.phase = 3;
    if (!state.purpose) {
      state.lastPrompt = 'ask_purpose';
      const reply = "Will this property be for your own personal residence or for investment?";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.propertyType) {
      state.lastPrompt = 'ask_property_type';
      const reply = "What type of property are you interested in? (e.g. Luxury Single Family Estate, Sky Penthouse, Waterfront Villa, or Modern Condo)";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.location) {
      state.lastPrompt = 'ask_location';
      const reply = "Which city, neighborhood, or area are you targeting? (e.g. Bel-Air, Tribeca, Austin, Miami, Aspen)";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.budget) {
      state.lastPrompt = 'ask_budget';
      const reply = "What is your comfortable target budget or price range for this acquisition?";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.bedrooms) {
      state.lastPrompt = 'ask_bedrooms';
      const reply = "How many bedrooms or what approximate square footage do you require?";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.paymentMethod) {
      state.lastPrompt = 'ask_payment';
      const reply = "How do you plan to handle financing? (All-Cash, Pre-Approved Mortgage, or seeking Loan Financing)";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.timeline) {
      state.lastPrompt = 'ask_timeline';
      const reply = "What is your preferred purchasing or move-in timeline? (Immediate / within 30 days, 1 to 3 months, or 3 to 6 months)";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.mustHaves) {
      state.lastPrompt = 'ask_must_haves';
      const reply = "Are there any specific must-have features or amenities? (e.g. private pool, panoramic views, home theater, or private dock)";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
  }

  // Phase 3B Questions (Seller / Landlord)
  if (state.intent === 'Sell' || state.intent === 'Rent out') {
    state.phase = 3;
    if (!state.propertyType) {
      state.lastPrompt = 'ask_seller_type';
      const reply = "What type of property are you looking to list? (e.g. Luxury Villa, Penthouse, Single Family Home, or Condo)";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.location) {
      state.lastPrompt = 'ask_seller_location';
      const reply = "Where is the property located? (City and neighborhood or address)";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.sizeCondition) {
      state.lastPrompt = 'ask_seller_size';
      const reply = "What is the approximate square footage and current condition of the property? (e.g. 4,500 sqft, newly renovated, turnkey)";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.askingPrice) {
      state.lastPrompt = 'ask_seller_price';
      const reply = "What is your desired asking price (or expected monthly rental rate)?";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.documentReadiness) {
      state.lastPrompt = 'ask_seller_docs';
      const reply = "Is the title deed in hand and ready for transfer, or is there an active mortgage on the property?";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.occupancyStatus) {
      state.lastPrompt = 'ask_seller_occupancy';
      const reply = "What is the current occupancy status? (Vacant, owner-occupied, or currently rented to tenants?)";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
    if (!state.timeline) {
      state.lastPrompt = 'ask_seller_timeline';
      const reply = "What is your target timeline for listing and closing the deal? (Immediate, within 30 to 60 days, or flexible)";
      return { reply, actionType: 'chat', responsePayload: { reply, phase: 3, isComplete: false, sessionState: state, state }, sessionState: state, state };
    }
  }

  const defaultReply = `Your file is registered with our managing broker under reference ID ${state.referenceId || '#APX-VIP'}. We look forward to your scheduled appointment!`;
  return {
    reply: defaultReply,
    actionType: 'chat',
    responsePayload: { reply: defaultReply, phase: 5, isComplete: true, sessionState: state, state },
    sessionState: state,
    state
  };
}

module.exports = {
  parseConversationalPrice,
  formatPriceToken,
  runStateMachine
};
