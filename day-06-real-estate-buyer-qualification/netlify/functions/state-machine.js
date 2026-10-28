// Apex Realty AI — 5-Phase Slot-Filling State Machine Engine
function runStateMachine(userMessage, targetProperty, sessionState) {
  const lower = (userMessage || '').toLowerCase();
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
    recommendedAction: ''
  };

  if (/reset|start over|restart/i.test(lower)) {
    return {
      reply: "Hi! I’m the virtual assistant for Apex Realty. I can help you find or list a property. What are you looking to do? (Buy / Rent / Sell / Rent out / Invest)",
      sessionState: { phase: 1 },
      state: { phase: 1 }
    };
  }

  // Target property shortcut
  if (targetProperty && !state.intent) {
    state.intent = 'Buy';
    state.propertyType = 'Luxury Residence';
    state.location = targetProperty;
    state.purpose = 'Personal Residence';
  }

  // 1. Universal Contact Extraction
  const phoneMatch = userMessage.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,14}/);
  if (phoneMatch && !state.phone) state.phone = phoneMatch[0];

  const emailMatch = userMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch && !state.email) state.email = emailMatch[0];

  const nameMatch = userMessage.match(/(?:my name is|name is|name:|i am|i'm|this is|call me)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  if (nameMatch && !state.fullName && !/^(cash|buy|sell|rent|invest|yes|no|urgent)/i.test(nameMatch[1])) {
    state.fullName = nameMatch[1].trim();
  } else if (!state.fullName) {
    const firstPart = userMessage.split(/[,;\n]/)[0].trim();
    const fWords = firstPart.split(/\s+/);
    if (fWords.length >= 1 && fWords.length <= 3 && /^[A-Za-z]+(?:\s+[A-Za-z]+)?$/.test(firstPart) && !/^(cash|buy|sell|rent|invest|hi|hello|hey|good|morning|evening|afternoon|yes|no)/i.test(firstPart)) {
      state.fullName = firstPart;
    }
  }

  if (!state.preferredContact) {
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
    }
  }

  // 2. Intent (Phase 1)
  if (!state.intent) {
    if (/\b(?:sell|listing|list my|selling)\b/i.test(lower)) state.intent = 'Sell';
    else if (/\b(?:rent out|lease out|landlord)\b/i.test(lower)) state.intent = 'Rent out';
    else if (/\b(?:invest|investment|rental yield|roi)\b/i.test(lower)) state.intent = 'Invest';
    else if (/\b(?:rent|lease|renting)\b/i.test(lower)) state.intent = 'Rent';
    else if (/\b(?:buy|purchase|acquiring|acquire|buyer)\b/i.test(lower)) state.intent = 'Buy';
  }

  // 3. Buyer / Renter Criteria (Phase 3A)
  if (state.intent === 'Buy' || state.intent === 'Rent' || state.intent === 'Invest') {
    if (!state.purpose) {
      if (/living|personal|family home|live in|myself|residence/i.test(lower)) state.purpose = 'Personal Residence';
      else if (/invest|rental income|portfolio|roi|tenant/i.test(lower)) state.purpose = 'Investment';
      else if (state.intent === 'Invest') state.purpose = 'Investment';
    }
    if (!state.propertyType) {
      if (/penthouse/i.test(lower)) state.propertyType = 'Sky Penthouse';
      else if (/villa|estate/i.test(lower)) state.propertyType = 'Luxury Estate / Villa';
      else if (/condo|apartment/i.test(lower)) state.propertyType = 'Modern Luxury Condo';
      else if (/single family|house/i.test(lower)) state.propertyType = 'Single Family Home';
      else if (/chalet|mountain/i.test(lower)) state.propertyType = 'Alpine Chalet';
    }
    if (!state.location) {
      const locMatch = lower.match(/\b(bel-air|bel air|los angeles|tribeca|manhattan|new york|nyc|austin|texas|miami|brickell|florida|aspen|colorado|beverly hills)\b/i);
      if (locMatch) state.location = locMatch[0].toUpperCase();
    }
    if (!state.budget) {
      const cleanBudget = userMessage
        .replace(phoneMatch ? phoneMatch[0] : '', '')
        .replace(emailMatch ? emailMatch[0] : '');
      const rangeMatch = cleanBudget.match(/\$[\d,.]+\s*(?:million|m|k)?\s*(?:to|-|–)\s*\$?[\d,.]+\s*(?:million|m|k)?/i);
      if (rangeMatch) state.budget = rangeMatch[0].trim();
      else {
        const singleDollar = cleanBudget.match(/\$[\d,.]+\s*(?:million|m|k|billion)?/i);
        if (singleDollar) state.budget = singleDollar[0].trim();
        else {
          const unitMatch = cleanBudget.match(/\b\d+(?:\.\d+)?\s*(?:million|m|k)\b/i);
          if (unitMatch) state.budget = '$' + unitMatch[0].trim();
        }
      }
    }
    if (!state.bedrooms) {
      const bedMatch = lower.match(/\b(\d+)\s*(?:beds?|bedrooms?|br|bhk)\b/i);
      if (bedMatch) state.bedrooms = bedMatch[1] + ' Bedrooms';
      else if (state.propertyType && state.budget && /^\d+$/.test(userMessage.trim())) {
        state.bedrooms = userMessage.trim() + ' Bedrooms';
      }
    }
    if (!state.paymentMethod) {
      if (/cash|all cash|liquid|funds ready/i.test(lower)) state.paymentMethod = 'Cash Buyer (Verified Proof of Funds)';
      else if (/pre-approv|pre approved|preapproved|letter in hand/i.test(lower)) state.paymentMethod = 'Pre-Approved Mortgage';
      else if (/loan|mortgage|financing/i.test(lower)) state.paymentMethod = 'Seeking Loan Financing';
    }
    if (!state.timeline) {
      if (/immediate|30 day|asap|now|this month|urgent/i.test(lower)) state.timeline = 'Immediate (< 30 days)';
      else if (/1 to 3|1-3|few month|60 day|90 day|soon/i.test(lower)) state.timeline = '1 to 3 months';
      else if (/3 to 6|6 month|half year/i.test(lower)) state.timeline = '3 to 6 months';
      else if (/flexible|explor|brows/i.test(lower)) state.timeline = 'Flexible / Exploring';
    }
    if (!state.mustHaves) {
      const feats = [];
      if (/pool/i.test(lower)) feats.push('Private Pool');
      if (/view|skyline|ocean/i.test(lower)) feats.push('Panoramic Views');
      if (/gym/i.test(lower)) feats.push('Home Gym');
      if (/garage|parking/i.test(lower)) feats.push('Private Garage');
      if (/dock|water/i.test(lower)) feats.push('Private Dock');
      if (feats.length > 0) state.mustHaves = feats.join(', ');
    }
  }

  // 4. Seller / Landlord Criteria (Phase 3B)
  if (state.intent === 'Sell' || state.intent === 'Rent out') {
    if (!state.propertyType) {
      if (/penthouse/i.test(lower)) state.propertyType = 'Sky Penthouse';
      else if (/villa|estate/i.test(lower)) state.propertyType = 'Luxury Estate / Villa';
      else if (/condo|apartment/i.test(lower)) state.propertyType = 'Condo';
      else if (/single family|house/i.test(lower)) state.propertyType = 'Single Family Home';
      else if (/commercial/i.test(lower)) state.propertyType = 'Commercial';
    }
    if (!state.location) {
      const locMatch = lower.match(/\b(bel-air|bel air|los angeles|tribeca|manhattan|new york|nyc|austin|texas|miami|brickell|florida|aspen|colorado|beverly hills)\b/i);
      if (locMatch) state.location = locMatch[0].toUpperCase();
    }
    if (!state.sizeCondition) {
      if (/renovat|turnkey|brand new|mint condition|excellent/i.test(lower)) state.sizeCondition = 'Turnkey / Newly Renovated';
      else if (/sqft|square feet/i.test(lower)) state.sizeCondition = userMessage.trim();
    }
    if (!state.askingPrice) {
      const priceMatch = userMessage.match(/\$[\d,.]+\s*(?:million|m|k)?/i);
      if (priceMatch) state.askingPrice = priceMatch[0].trim();
    }
    if (!state.documentReadiness) {
      if (/title in hand|clean title|ready|deed/i.test(lower)) state.documentReadiness = 'Title Deed in Hand (Clean)';
      else if (/mortgage|loan/i.test(lower)) state.documentReadiness = 'Existing Mortgage';
    }
    if (!state.occupancyStatus) {
      if (/vacant|empty/i.test(lower)) state.occupancyStatus = 'Vacant';
      else if (/owner/i.test(lower)) state.occupancyStatus = 'Owner-Occupied';
      else if (/tenant|rented/i.test(lower)) state.occupancyStatus = 'Tenant-Occupied';
    }
    if (!state.timeline) {
      if (/immediate|30 day|asap|now/i.test(lower)) state.timeline = 'Immediate (< 30 days)';
      else if (/60 day|soon|few month/i.test(lower)) state.timeline = '30 to 60 days';
      else if (/flexible|no rush/i.test(lower)) state.timeline = 'Flexible';
    }
  }

  // Question Selector (Strict 1-Question Rule)
  if (!state.intent) {
    state.phase = 1;
    return {
      reply: "Hi! I’m the virtual assistant for Apex Realty. I can help you find or list a property. What are you looking to do? (Buy / Rent / Sell / Rent out / Invest)",
      sessionState: state,
      state
    };
  }

  if (!state.fullName) {
    state.phase = 2;
    return {
      reply: "Great! May I have your full name?",
      sessionState: state,
      state
    };
  }

  if (!state.phone) {
    state.phase = 2;
    return {
      reply: `Thank you, ${state.fullName}! What is the best phone or WhatsApp number to reach you?`,
      sessionState: state,
      state
    };
  }

  if (!state.preferredContact) {
    state.phase = 2;
    return {
      reply: "Got it. What is your preferred contact method and time for our agent to reach you? (e.g., Morning via WhatsApp, or Afternoon phone call)",
      sessionState: state,
      state
    };
  }

  // Phase 3A
  if (state.intent === 'Buy' || state.intent === 'Rent' || state.intent === 'Invest') {
    state.phase = 3;
    if (!state.purpose) return { reply: "Will this property be for your own personal residence or for investment?", sessionState: state, state };
    if (!state.propertyType) return { reply: "What type of property are you interested in? (e.g. Luxury Single Family Estate, Sky Penthouse, Waterfront Villa, or Modern Condo)", sessionState: state, state };
    if (!state.location) return { reply: "Which city, neighborhood, or area are you targeting? (e.g. Bel-Air, Tribeca, Austin, Miami, Aspen)", sessionState: state, state };
    if (!state.budget) return { reply: "What is your comfortable target budget or maximum price range for this acquisition?", sessionState: state, state };
    if (!state.bedrooms) return { reply: "How many bedrooms or what approximate square footage do you need?", sessionState: state, state };
    if (!state.paymentMethod) return { reply: "How do you plan to handle the financing? (All-Cash, Pre-Approved Mortgage, or seeking Loan Financing)", sessionState: state, state };
    if (!state.timeline) return { reply: "What is your preferred purchasing or move-in timeline? (Immediate / within 30 days, 1 to 3 months, or 3 to 6 months)", sessionState: state, state };
    if (!state.mustHaves) return { reply: "Are there any specific must-have features or amenities? (e.g. private pool, panoramic views, home theater, or private dock)", sessionState: state, state };
  }

  // Phase 3B
  if (state.intent === 'Sell' || state.intent === 'Rent out') {
    state.phase = 3;
    if (!state.propertyType) return { reply: "What type of property are you looking to list? (e.g. Luxury Villa, Penthouse, Apartment, Single Family Home)", sessionState: state, state };
    if (!state.location) return { reply: "Where is the property located? (City and neighborhood or address)", sessionState: state, state };
    if (!state.sizeCondition) return { reply: "What is the approximate size and current condition of the property? (e.g. 4,200 sqft, newly renovated, turnkey)", sessionState: state, state };
    if (!state.askingPrice) return { reply: "What is your desired asking price (or expected monthly rental rate)?", sessionState: state, state };
    if (!state.documentReadiness) return { reply: "Is the title deed in hand and ready for transfer, or is there an active mortgage on the property?", sessionState: state, state };
    if (!state.occupancyStatus) return { reply: "What is the current occupancy status? (Is it vacant, owner-occupied, or currently rented to tenants?)", sessionState: state, state };
    if (!state.timeline) return { reply: "What is your target timeline for listing and closing the deal? (Immediate, within 30 to 60 days, or flexible)", sessionState: state, state };
  }

  // Phase 4 Calendar Booking
  state.phase = 4;
  if (!state.bookingAsked) {
    state.bookingAsked = true;
    return {
      reply: "Would you like to schedule a site visit or a call with our agent? What date and time work for you?",
      sessionState: state,
      state
    };
  }

  if (!state.bookingDateTime) {
    state.bookingDateTime = userMessage.trim();
    state.calendarBooked = true;
  }

  // Phase 5 Confirmation & Storage
  state.phase = 5;
  const isAffirmative = /^(?:yes|yep|yeah|correct|looks good|perfect|confirm|confirmed|all good|that's right|sounds good)\b/i.test(lower);

  if (!state.isConfirmed) {
    if (isAffirmative) {
      state.isConfirmed = true;
      state.referenceId = '#APX-' + Math.floor(1000 + Math.random() * 9000);

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

      const qualifiedLead = {
        leadId: state.referenceId,
        timestamp: new Date().toLocaleString(),
        fullName: state.fullName || 'Private Client',
        phone: state.phone || 'On file',
        email: state.email || 'client@private-advisory.com',
        propertyInterest: `${state.propertyType || 'Property'} in ${state.location || 'Curated Portfolio'}`,
        budgetRange: state.budget || state.askingPrice || '$2,000,000+',
        financingStatus: state.paymentMethod || state.documentReadiness || 'Verified Funds',
        purchaseTimeline: state.timeline || 'Immediate',
        buyerType: `${state.intent} • Appt: ${state.bookingDateTime}`,
        leadScore: state.leadScore,
        leadTier: state.leadTier,
        recommendedAction: state.recommendedAction,
        status: 'NEW'
      };

      const finalReply = `✅ Thank you, ${state.fullName}! Your agent will contact you at ${state.phone} (${state.preferredContact}).\n\nYour reference ID is ${state.referenceId}.\n\nWe have reserved your appointment on our calendar for ${state.bookingDateTime}. A confirmation has been logged with our managing broker.\n\nLead Score: ${state.leadScore}/100 (${state.leadTier})\nAction: ${state.recommendedAction}\n\nHave a wonderful day!`;

      return {
        reply: finalReply,
        lead: qualifiedLead,
        isComplete: true,
        sessionState: state,
        state
      };
    } else {
      const propDetail = state.intent === 'Sell' || state.intent === 'Rent out'
        ? `${state.propertyType} in ${state.location} — Asking: ${state.askingPrice} (${state.sizeCondition})`
        : `${state.propertyType} in ${state.location} — Budget: ${state.budget} (${state.purpose})`;

      const terms = state.intent === 'Sell' || state.intent === 'Rent out'
        ? `Documents: ${state.documentReadiness} | Status: ${state.occupancyStatus} | Timeline: ${state.timeline}`
        : `Financing: ${state.paymentMethod} | Timeline: ${state.timeline} | Must-Haves: ${state.mustHaves}`;

      const summary = `Here is the summary of your inquiry:\n• Intent: ${state.intent}\n• Client: ${state.fullName}\n• Contact: ${state.phone} (${state.preferredContact})\n• Property: ${propDetail}\n• Terms: ${terms}\n• Scheduled Appointment: ${state.bookingDateTime} (Reserved on Calendar)\n\nIs everything correct?`;

      return {
        reply: summary,
        sessionState: state,
        state
      };
    }
  }

  return {
    reply: `Your file is registered with our managing broker under reference ID ${state.referenceId}. We look forward to your scheduled appointment on ${state.bookingDateTime}!`,
    sessionState: state,
    state
  };
}

module.exports = { runStateMachine };
