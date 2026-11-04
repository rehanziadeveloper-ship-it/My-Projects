const body = $input.item.json.body || $input.item.json;
const rawMessage = (body.message || body.prompt || '').trim();
let lang = body.language || 'en';
let session = body.session || {};
let data = session.collectedData || body.collectedData || {};
let step = session.currentStep || body.currentStep || 'greeting';
let retryCounts = session.retryCounts || {};

// 1. Language Detection (English / Roman Urdu / Urdu Script)
const isUrduScript = /[\u0600-\u06FF]/.test(rawMessage);
const isRomanUrdu = /\b(kya|kahan|kitna|kitne|bataen|rabta|chahiye|mera|meri|mere|naam|shukriya|theek|nahi|haan|bechna|kharidna|sarmaya|qist|pata|mujhe|aap|apka|apki|kaun|bhejo|acha|hain|hai|mein|mai|karna|karni|karwa|batao|dein|waali|wala|bhi)\b/i.test(rawMessage);

if (isUrduScript) {
  lang = 'ur';
} else if (isRomanUrdu) {
  lang = 'ru';
} else if (body.language) {
  lang = body.language;
} else {
  lang = 'en';
}

const msgLower = rawMessage.toLowerCase();

// Helper translations for bilingual responses
function t(en, ru, ur) {
  if (lang === 'ur') return ur || en;
  if (lang === 'ru') return ru || en;
  return en;
}

// 2. Human Handoff Triggers
const isFrustrated = /\b(stupid|bakwas|useless|gussa|hate|terrible|nonsense|idiot|khotay)\b/i.test(msgLower);
const asksAgent = /\b(talk to human|agent|broker|representative|insan|human|person|call me now|phone pe baat)\b/i.test(msgLower);
const asksLegal = /\b(stamp duty|stamp paper|registry|sub-registrar|court|dispute|tax|fbr|legal advice|fraud|kabza|patwari|intiqal)\b/i.test(msgLower);

if (isFrustrated || asksAgent || asksLegal) {
  const reply = t(
    "I understand completely. I am escalating your request directly to one of our Senior Licensed Brokers right now. An agent will contact you shortly to assist with personalized and legal matters.",
    "Main bilkul samajh sakta hoon. Main aap ki inquiry foran hamare Senior Licensed Broker ko transfer kar raha hoon. Hamara representative jald hi aapse direct rabta karega.",
    "میں بالکل سمجھ سکتا ہوں۔ میں آپ کی درخواست فوراً ہمارے سینئر لائسنس یافتہ بروکر کو بھیج رہا ہوں۔ ہمارا نمائندہ جلد آپ سے رابطہ کرے گا۔"
  );
  return {
    success: true,
    reply: reply,
    language: lang,
    isHandoff: true,
    handoffReason: asksLegal ? 'Legal / Property Tax Inquiry' : (isFrustrated ? 'Customer Frustration' : 'Direct Agent Request'),
    currentStep: 'handoff',
    collectedData: data,
    quickReplies: [t("Call Helpline: +92 300 8492910", "Helpline Call Karein", "ہیلپ لائن پر کال کریں")]
  };
}

// 3. Skip Detection
const isSkip = /skip|pata nahi|don't know|not sure|dont know|later|baad mein|choro|no idea/i.test(msgLower);

// 4. Pakistani Entity Extractors
function extractPakistaniPhone(text) {
  const match = text.match(/(?:\+?92|0092|0)?\s?([3][0-9]{2})[\s-]?([0-9]{7})/);
  if (match) {
    return '+92' + match[1] + match[2];
  }
  return null;
}

function extractPakistaniBudget(text) {
  let num = 0;
  const crMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr|karor)/i);
  if (crMatch) return parseFloat(crMatch[1]) * 10000000;
  
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs)/i);
  if (lakhMatch) return parseFloat(lakhMatch[1]) * 100000;
  
  const milMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:million|mil|m)/i);
  if (milMatch) return parseFloat(milMatch[1]) * 1000000;
  
  const digitMatch = text.match(/(\d[\d,]{4,})/);
  if (digitMatch) return parseInt(digitMatch[1].replace(/,/g, ''), 10);
  
  return null;
}

function extractPakistaniArea(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(marla|kanal|sq\s?ft|sq\s?yd|yard|yards)/i);
  if (match) {
    let unit = match[2].toLowerCase();
    if (unit.includes('marla')) unit = 'Marla';
    else if (unit.includes('kanal')) unit = 'Kanal';
    else if (unit.includes('sq')) unit = 'Sq Ft';
    else unit = 'Sq Yd';
    return { value: parseFloat(match[1]), unit };
  }
  return null;
}

// Multi-slot extraction from any message
if (!data.intent) {
  if (/invest|sarmaya|سرمایہ/i.test(msgLower)) data.intent = 'Invest';
  else if (/rent\s*out|kiraye\s*par|kiraya\s*pe|کرایہ\s*پر\s*دینا/i.test(msgLower)) data.intent = 'Rent out';
  else if (/sell|bechna|farokht|فروخت|بیچنا/i.test(msgLower)) data.intent = 'Sell';
  else if (/rent|kiraya|کرایہ/i.test(msgLower)) data.intent = 'Rent';
  else if (/buy|purchase|kharid|khareed|lena|خرید/i.test(msgLower)) data.intent = 'Buy';
}

if (!data.phone) {
  const ph = extractPakistaniPhone(rawMessage);
  if (ph) data.phone = ph;
}

if (!data.budget_max) {
  const b = extractPakistaniBudget(rawMessage);
  if (b) data.budget_max = b;
}

if (!data.area_value) {
  const a = extractPakistaniArea(rawMessage);
  if (a) {
    data.area_value = a.value;
    data.area_unit = a.unit;
  }
}

if (!data.city) {
  if (/lahore/i.test(msgLower)) data.city = 'Lahore';
  else if (/islamabad/i.test(msgLower)) data.city = 'Islamabad';
  else if (/karachi/i.test(msgLower)) data.city = 'Karachi';
  else if (/rawalpindi/i.test(msgLower)) data.city = 'Rawalpindi';
}

if (!data.area_name) {
  if (/dha\s*phase\s*\d|dha/i.test(msgLower)) data.area_name = 'DHA';
  else if (/bahria/i.test(msgLower)) data.area_name = 'Bahria Town';
  else if (/gulberg/i.test(msgLower)) data.area_name = 'Gulberg';
  else if (/e-7|e7/i.test(msgLower)) data.area_name = 'Sector E-7';
  else if (/clifton/i.test(msgLower)) data.area_name = 'Clifton';
}

if (!data.property_type) {
  if (/house|villa|kothi|makan/i.test(msgLower)) data.property_type = 'House';
  else if (/apartment|flat/i.test(msgLower)) data.property_type = 'Apartment';
  else if (/plot|file/i.test(msgLower)) data.property_type = 'Plot';
  else if (/commercial|plaza|shop|office/i.test(msgLower)) data.property_type = 'Commercial';
}

// 5. State Machine Step Transitions
let nextStep = step;
let replyText = '';
let quickReplies = [];
let isSummary = false;
let isComplete = false;

// Step 1: Greeting & Consent
if (step === 'greeting') {
  if (/yes|haan|sure|ok|ji|g|bilkul|start|proceed/i.test(msgLower) || data.consent_given) {
    data.consent_given = true;
    nextStep = 'intent';
  } else if (/no|nahi/i.test(msgLower)) {
    return {
      success: true,
      reply: t(
        "No problem at all! You can browse our website or reach our office directly at +92 300 8492910.",
        "Koi masla nahi! Aap hamari website browse kar sakte hain ya direct phone helpline (+92 300 8492910) par rabta karein.",
        "کوئی مسئلہ نہیں۔ آپ ہماری ویب سائٹ دیکھ سکتے ہیں یا براہ راست ہیلپ لائن پر رابطہ کر سکتے ہیں۔"
      ),
      language: lang,
      currentStep: 'declined',
      quickReplies: ["+92 300 8492910"]
    };
  } else {
    data.consent_given = true;
    nextStep = 'intent';
  }
}

// Step 2: Intent Selection
if (nextStep === 'intent') {
  if (data.intent) {
    nextStep = 'name';
  } else {
    replyText = t(
      "What are you looking to do today? Buy, Rent, Sell, Rent out my property, or Invest?",
      "Aap aaj kya karna chahte hain? Buy (Kharidna), Rent (Kiraya), Sell (Bechna), Rent out (Kiraye par dena), ya Invest (Sarmaya kari)?",
      "آپ آج کیا کرنا چاہتے ہیں؟ خریدنا، کرایہ پر لینا، بیچنا، کرایہ پر دینا، یا سرمایہ کاری؟"
    );
    quickReplies = ["Buy", "Rent", "Sell", "Rent out my property", "Invest"];
    return { success: true, reply: replyText, language: lang, currentStep: 'intent', collectedData: data, quickReplies };
  }
}

// Step 3: Name
if (nextStep === 'name') {
  if (!data.full_name) {
    if (rawMessage.length > 2 && !rawMessage.includes('http') && step === 'name') {
      data.full_name = rawMessage.replace(/my name is|mera naam|i am|this is/gi, '').trim();
      nextStep = 'phone';
    } else {
      replyText = t("May I have your name?", "Aap ka poora naam kya hai?", "برائے مہربانی اپنا نام بتائیے؟");
      return { success: true, reply: replyText, language: lang, currentStep: 'name', collectedData: data };
    }
  } else {
    nextStep = 'phone';
  }
}

// Step 4: Phone / WhatsApp Number
if (nextStep === 'phone') {
  if (!data.phone) {
    const ph = extractPakistaniPhone(rawMessage);
    if (ph) {
      data.phone = ph;
      nextStep = 'email';
    } else if (step === 'phone') {
      retryCounts.phone = (retryCounts.phone || 0) + 1;
      if (retryCounts.phone >= 2) {
        data.phone = rawMessage.trim();
        nextStep = 'email';
      } else {
        replyText = t(
          "What is the best phone or WhatsApp number to reach you on? (e.g., 0300-1234567)",
          "Aap ka rabta number ya WhatsApp number kya hai? (Jaise 0300-1234567)",
          "آپ سے رابطہ کے لیے واٹس ایپ یا فون نمبر کیا ہے؟"
        );
        return { success: true, reply: replyText, language: lang, currentStep: 'phone', collectedData: data };
      }
    } else {
      replyText = t("What is the best WhatsApp or mobile number to reach you on?", "Aap se rabta karne ke liye WhatsApp number kya hai?", "رابطہ کے لیے واٹس ایپ یا موبائل نمبر کیا ہے؟");
      return { success: true, reply: replyText, language: lang, currentStep: 'phone', collectedData: data };
    }
  } else {
    nextStep = 'email';
  }
}

// Step 5: Email (Optional)
if (nextStep === 'email') {
  if (!data.email) {
    const emailMatch = rawMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      data.email = emailMatch[0];
      nextStep = 'contact_preference';
    } else if (isSkip || step === 'email') {
      data.email = 'skipped';
      nextStep = 'contact_preference';
    } else {
      replyText = t(
        "Would you like to share an email for receiving property proposals? (Or tap Skip)",
        "Property brochures aur proposals ke liye email share karna chahenge? (Ya Skip karein)",
        "کیا آپ پراپرٹی دستاویزات کے لیے ای میل دینا چاہیں گے؟ یا Skip کریں"
      );
      quickReplies = [t("Skip", "Skip karein", "چھوڑیں")];
      return { success: true, reply: replyText, language: lang, currentStep: 'email', collectedData: data, quickReplies };
    }
  } else {
    nextStep = 'contact_preference';
  }
}

// Step 6: Preferred Contact Method & Time
if (nextStep === 'contact_preference') {
  if (!data.preferred_contact_method) {
    if (step === 'contact_preference') {
      if (/whatsapp/i.test(msgLower)) data.preferred_contact_method = 'WhatsApp';
      else if (/call|phone/i.test(msgLower)) data.preferred_contact_method = 'Phone Call';
      else if (/email/i.test(msgLower)) data.preferred_contact_method = 'Email';
      else data.preferred_contact_method = rawMessage;
      nextStep = (data.intent === 'Sell' || data.intent === 'Rent out') ? 'seller_prop_type' : 'buyer_purpose';
    } else {
      replyText = t(
        "Do you prefer a WhatsApp message, Phone Call, or Email? And what time suits you best?",
        "Aap WhatsApp, Phone Call ya Email prefer karenge? Aur kis waqt rabta kia jaye?",
        "آپ واٹس ایپ، فون کال یا ای میل کس کو ترجیح دیتے ہیں؟ اور کون سا وقت مناسب ہے؟"
      );
      quickReplies = ["WhatsApp", "Phone Call", "Email"];
      return { success: true, reply: replyText, language: lang, currentStep: 'contact_preference', collectedData: data, quickReplies };
    }
  } else {
    nextStep = (data.intent === 'Sell' || data.intent === 'Rent out') ? 'seller_prop_type' : 'buyer_purpose';
  }
}

// BRANCH 3A: BUYER / RENTER / INVESTOR
if (nextStep === 'buyer_purpose') {
  if (!data.purpose) {
    if (data.intent === 'Invest') {
      data.purpose = 'Investment';
      nextStep = 'buyer_prop_type';
    } else if (step === 'buyer_purpose') {
      data.purpose = /invest/i.test(msgLower) ? 'Investment' : 'Personal Living';
      nextStep = 'buyer_prop_type';
    } else {
      replyText = t("Is this for living in yourself or for investment?", "Yeh khud rehne ke liye hai ya investment purpose ke liye?", "یہ ذاتی رہائش کے لیے ہے یا سرمایہ کاری کے لیے؟");
      quickReplies = [t("Personal Living", "Rehaish", "ذاتی رہائش"), t("Investment", "Investment", "سرمایہ کاری")];
      return { success: true, reply: replyText, language: lang, currentStep: 'buyer_purpose', collectedData: data, quickReplies };
    }
  } else {
    nextStep = 'buyer_prop_type';
  }
}

if (nextStep === 'buyer_prop_type') {
  if (!data.property_type) {
    if (step === 'buyer_prop_type') {
      if (/house|villa/i.test(msgLower)) data.property_type = 'House';
      else if (/apartment|flat/i.test(msgLower)) data.property_type = 'Apartment';
      else if (/plot/i.test(msgLower)) data.property_type = 'Plot';
      else if (/commercial|office|shop/i.test(msgLower)) data.property_type = 'Commercial';
      else data.property_type = rawMessage;
      nextStep = 'buyer_location';
    } else {
      replyText = t("What type of property are you interested in?", "Aap kis qisam ki property talash kar rahe hain?", "آپ کس قسم کی پراپرٹی میں دلچسپی رکھتے ہیں؟");
      quickReplies = ["House", "Apartment", "Plot", "Commercial"];
      return { success: true, reply: replyText, language: lang, currentStep: 'buyer_prop_type', collectedData: data, quickReplies };
    }
  } else {
    nextStep = 'buyer_location';
  }
}

if (nextStep === 'buyer_location') {
  if (!data.city || !data.area_name) {
    if (step === 'buyer_location') {
      data.area_name = rawMessage;
      if (!data.city) data.city = /islamabad/i.test(msgLower) ? 'Islamabad' : (/karachi/i.test(msgLower) ? 'Karachi' : 'Lahore');
      nextStep = 'buyer_budget';
    } else {
      replyText = t(
        "Which city and area or society do you prefer? (e.g., Lahore DHA, Islamabad E-7, Karachi Clifton)",
        "Aap kis shehar aur society mein property chahte hain? (Jaise DHA Lahore, Bahria Town, E-7 Islamabad)",
        "آپ کس شہر اور علاقے یا سوسائٹی کو ترجیح دیتے ہیں؟"
      );
      quickReplies = ["DHA Lahore", "Bahria Town", "E-7 Islamabad", "Clifton Karachi"];
      return { success: true, reply: replyText, language: lang, currentStep: 'buyer_location', collectedData: data, quickReplies };
    }
  } else {
    nextStep = 'buyer_budget';
  }
}

if (nextStep === 'buyer_budget') {
  if (!data.budget_max) {
    const b = extractPakistaniBudget(rawMessage);
    if (b) {
      data.budget_max = b;
      nextStep = 'buyer_size';
    } else if (step === 'buyer_budget') {
      replyText = t("Please state your budget in Lakh or Crore (e.g. 5 Crore, 85 Lakh).", "Barah-e-karam apna budget Lakh ya Crore mein bataen (Jaise 5 Crore, 80 Lakh).", "براہ کرم اپنا بجٹ لاکھ یا کروڑ میں بتائیے۔");
      return { success: true, reply: replyText, language: lang, currentStep: 'buyer_budget', collectedData: data };
    } else {
      replyText = t("What is your expected budget range?", "Aap ka budget kitna hai?", "آپ کا متوقع بجٹ کیا ہے؟");
      quickReplies = ["Rs 1 - 3 Crore", "Rs 3 - 5 Crore", "Rs 5 - 10 Crore", "Rs 10 Crore+"];
      return { success: true, reply: replyText, language: lang, currentStep: 'buyer_budget', collectedData: data, quickReplies };
    }
  } else {
    nextStep = 'buyer_size';
  }
}

if (nextStep === 'buyer_size') {
  if (!data.area_value) {
    const a = extractPakistaniArea(rawMessage);
    if (a) {
      data.area_value = a.value;
      data.area_unit = a.unit;
      nextStep = (data.property_type === 'House' || data.property_type === 'Apartment') ? 'buyer_beds' : 'buyer_payment';
    } else if (step === 'buyer_size') {
      data.area_value = 1;
      data.area_unit = 'Kanal';
      nextStep = (data.property_type === 'House' || data.property_type === 'Apartment') ? 'buyer_beds' : 'buyer_payment';
    } else {
      replyText = t("What size do you need in Marla or Kanal? (e.g., 5 Marla, 10 Marla, 1 Kanal)", "Kitna size darkar hai? (Jaise 5 Marla, 10 Marla, 1 Kanal)", "کتنا سائز درکار ہے؟ (مثلاً 5 مرلہ، 10 مرلہ، 1 کنال)");
      quickReplies = ["5 Marla", "10 Marla", "1 Kanal", "2 Kanal"];
      return { success: true, reply: replyText, language: lang, currentStep: 'buyer_size', collectedData: data, quickReplies };
    }
  } else {
    nextStep = (data.property_type === 'House' || data.property_type === 'Apartment') ? 'buyer_beds' : 'buyer_payment';
  }
}

if (nextStep === 'buyer_beds') {
  if (!data.bedrooms) {
    const bMatch = rawMessage.match(/(\d+)/);
    if (bMatch && step === 'buyer_beds') {
      data.bedrooms = parseInt(bMatch[1], 10);
      nextStep = 'buyer_payment';
    } else if (step === 'buyer_beds') {
      data.bedrooms = 4;
      nextStep = 'buyer_payment';
    } else {
      replyText = t("How many bedrooms do you need?", "Kitne bedrooms hone chahiyen?", "کتنے بیڈ رومز درکار ہیں؟");
      quickReplies = ["3 Beds", "4 Beds", "5 Beds", "6+ Beds"];
      return { success: true, reply: replyText, language: lang, currentStep: 'buyer_beds', collectedData: data, quickReplies };
    }
  } else {
    nextStep = 'buyer_payment';
  }
}

if (nextStep === 'buyer_payment') {
  if (!data.payment_method) {
    if (step === 'buyer_payment') {
      if (/cash/i.test(msgLower)) data.payment_method = 'Cash';
      else if (/installment|qist/i.test(msgLower)) data.payment_method = 'Installments';
      else if (/bank|loan/i.test(msgLower)) data.payment_method = 'Bank loan';
      else data.payment_method = rawMessage;
      nextStep = 'buyer_timeline';
    } else {
      replyText = t("What is your preferred payment mode? Cash, Developer Installments, or Bank loan?", "Aap Cash, Qist (Installments), ya Bank Loan ke zariye adaigi karenge?", "ادائیگی کا کیا طریقہ کار ہے؟ کیش، اقساط، یا بینک لون؟");
      quickReplies = ["Cash", "Installments", "Bank loan"];
      return { success: true, reply: replyText, language: lang, currentStep: 'buyer_payment', collectedData: data, quickReplies };
    }
  } else {
    nextStep = 'buyer_timeline';
  }
}

if (nextStep === 'buyer_timeline') {
  if (!data.timeline) {
    if (step === 'buyer_timeline') {
      if (/immediate|foran|today/i.test(msgLower)) data.timeline = 'Immediate';
      else if (/1-3|1 to 3/i.test(msgLower)) data.timeline = '1-3 months';
      else if (/3-6|3 to 6/i.test(msgLower)) data.timeline = '3-6 months';
      else data.timeline = 'Just exploring';
      nextStep = 'appointment';
    } else {
      replyText = t("When are you planning to finalize? Immediately, 1-3 months, 3-6 months, or just exploring?", "Aap kab tak deal finalize karna chahte hain? Immediately, 1-3 months, ya explore kar rahe hain?", "آپ کب تک فائنل کرنا چاہتے ہیں؟ فوری، 1 سے 3 ماہ، یا صرف جائزہ لے رہے ہیں؟");
      quickReplies = ["Immediately", "1-3 months", "3-6 months", "Just exploring"];
      return { success: true, reply: replyText, language: lang, currentStep: 'buyer_timeline', collectedData: data, quickReplies };
    }
  } else {
    nextStep = 'appointment';
  }
}

// BRANCH 3B: SELLER / LANDLORD
if (nextStep === 'seller_prop_type') {
  if (!data.property_type) {
    if (step === 'seller_prop_type') {
      data.property_type = rawMessage;
      nextStep = 'seller_location';
    } else {
      replyText = t("What property are you looking to sell or rent out?", "Aap kis qisam ki property bechna ya rent out karna chahte hain?", "آپ کس قسم کی پراپرٹی بیچنا یا کرایہ پر دینا چاہتے ہیں؟");
      quickReplies = ["House", "Plot", "Apartment", "Commercial Plaza"];
      return { success: true, reply: replyText, language: lang, currentStep: 'seller_prop_type', collectedData: data, quickReplies };
    }
  } else {
    nextStep = 'seller_location';
  }
}

if (nextStep === 'seller_location') {
  if (!data.address) {
    if (step === 'seller_location') {
      data.address = rawMessage;
      nextStep = 'seller_asking_price';
    } else {
      replyText = t("Where is the property located? Please mention city and exact sector/block.", "Property kahan waqia hai? Shehar aur sector/phase darj karein.", "پراپرٹی کا پتہ اور سیکٹر/فیز کیا ہے؟");
      return { success: true, reply: replyText, language: lang, currentStep: 'seller_location', collectedData: data };
    }
  } else {
    nextStep = 'seller_asking_price';
  }
}

if (nextStep === 'seller_asking_price') {
  if (!data.asking_price) {
    const p = extractPakistaniBudget(rawMessage);
    if (p) {
      data.asking_price = p;
      data.budget_max = p;
      nextStep = 'seller_ownership';
    } else if (step === 'seller_asking_price') {
      data.asking_price = 45000000;
      data.budget_max = 45000000;
      nextStep = 'seller_ownership';
    } else {
      replyText = t("What is your asking price or expected monthly rent?", "Aap ki demand ya mutawwaqa kiraya kitna hai?", "آپ کی ڈیمانڈ یا متوقع کرایہ کتنا ہے؟");
      return { success: true, reply: replyText, language: lang, currentStep: 'seller_asking_price', collectedData: data };
    }
  } else {
    nextStep = 'seller_ownership';
  }
}

if (nextStep === 'seller_ownership') {
  if (!data.ownership_status) {
    if (step === 'seller_ownership') {
      data.ownership_status = /clear|ready/i.test(msgLower) ? 'Clear Title' : rawMessage;
      nextStep = 'appointment';
    } else {
      replyText = t("Are the property ownership documents and title clear and ready?", "Kya property ke kagzaat aur Registry/Allotment letter clear hain?", "کیا پراپرٹی کی دستاویزات اور ٹائٹل مکمل طور پر کلیئر ہیں؟");
      quickReplies = [t("Yes, Clear Title", "Haan, Clear hain", "جی ہاں، بالکل کلیئر ہیں"), t("In Process", "Process mein hain", "پروسیس میں ہیں")];
      return { success: true, reply: replyText, language: lang, currentStep: 'seller_ownership', collectedData: data, quickReplies };
    }
  } else {
    nextStep = 'appointment';
  }
}

// Step 17: Appointment Scheduling
if (nextStep === 'appointment') {
  if (!data.appointment_at) {
    if (step === 'appointment') {
      data.appointment_at = rawMessage;
      nextStep = 'confirmation';
    } else {
      replyText = t(
        "Would you like to schedule a site walkthrough or a consultation call with our senior broker? What date and time work for you?",
        "Kya aap site visit ya hamare senior broker ke sath meeting schedule karna chahte hain? Kon sa din aur waqt munasib rahega?",
        "کیا آپ سائٹ وزٹ یا سینئر بروکر سے مشاورتی میٹنگ طے کرنا چاہتے ہیں؟ کون سا وقت مناسب رہے گا؟"
      );
      quickReplies = [t("Tomorrow 4 PM", "Kal shaam 4 baje", "کل شام 4 بجے"), t("This Saturday", "Is Saturday ko", "اس ہفتے کو"), t("Call me first", "Pehle call karein", "پہلے کال کریں")];
      return { success: true, reply: replyText, language: lang, currentStep: 'appointment', collectedData: data, quickReplies };
    }
  } else {
    nextStep = 'confirmation';
  }
}

// Step 18 & 19: Confirmation Summary & Edit Loop
if (nextStep === 'confirmation') {
  if (/no|change|edit|ghalat|durust/i.test(msgLower) && step === 'confirmation') {
    replyText = t("Which detail would you like to update? (Name, Phone, Budget, Location, or Timeline)", "Aap kon si tafseel tabdeel karna chahte hain? (Name, Phone, Budget, Location, ya Timeline)", "آپ کون سی معلومات درست کرنا چاہتے ہیں؟");
    quickReplies = ["Name", "Phone", "Budget", "Location", "Timeline"];
    return { success: true, reply: replyText, language: lang, currentStep: 'edit_field', collectedData: data, quickReplies };
  } else if (/yes|theek|sahi|correct|all correct|proceed|done/i.test(msgLower) || data.confirmed) {
    data.confirmed = true;
    nextStep = 'closing';
  } else {
    isSummary = true;
    const summaryCard = {
      name: data.full_name || 'Valued Client',
      phone: data.phone || 'N/A',
      intent: data.intent || 'Buy',
      property_type: data.property_type || 'House',
      location: (data.area_name || 'DHA') + ', ' + (data.city || 'Lahore'),
      budget: data.budget_max ? ('Rs ' + (data.budget_max >= 10000000 ? (data.budget_max/10000000).toFixed(2) + ' Crore' : (data.budget_max/100000).toFixed(1) + ' Lakh')) : 'Flexible',
      timeline: data.timeline || 'Immediate',
      appointment: data.appointment_at || 'Consultation on call'
    };

    replyText = t(
      "Here is a summary of your inquiry. Is everything correct?",
      "Aap ki inquiry ki tafseelat yeh hain. Kya sab durust hai?",
      "آپ کی درخواست کا خلاصہ یہ ہے۔ کیا تمام معلومات درست ہیں؟"
    );
    quickReplies = [t("Yes, all correct", "Haan, sab theek hai", "جی ہاں، سب درست ہے"), t("No, edit details", "Nahi, tabdeel karein", "نہیں، تبدیلی کریں")];

    return {
      success: true,
      reply: replyText,
      language: lang,
      isSummary: true,
      summary: summaryCard,
      currentStep: 'confirmation',
      collectedData: data,
      quickReplies
    };
  }
}

// Step 20: Edit Field Router
if (step === 'edit_field') {
  if (/name/i.test(msgLower)) { data.full_name = null; nextStep = 'name'; }
  else if (/phone/i.test(msgLower)) { data.phone = null; nextStep = 'phone'; }
  else if (/budget/i.test(msgLower)) { data.budget_max = null; nextStep = 'buyer_budget'; }
  else if (/location/i.test(msgLower)) { data.area_name = null; data.city = null; nextStep = 'buyer_location'; }
  else { data.timeline = null; nextStep = 'buyer_timeline'; }

  replyText = t("Understood. Please provide the updated information.", "Theek hai, barah-e-karam nayi information darj karein.", "درست ہے۔ برائے مہربانی نئی معلومات بتائیے۔");
  return { success: true, reply: replyText, language: lang, currentStep: nextStep, collectedData: data };
}

// Step 21: Closing & Reference ID Assignment
if (nextStep === 'closing') {
  const refYear = new Date().getFullYear();
  const refNum = Math.floor(1000 + Math.random() * 9000);
  const referenceId = 'RQB-' + refYear + '-' + refNum;

  const assignedBroker = (data.city === 'Islamabad' ? 'Zainab Malik' : (data.city === 'Karachi' ? 'Hamza Abbasi' : 'Chaudhry Kamran'));

  replyText = t(
    "Thank you, " + (data.full_name || 'Client') + "! Your request has been logged under Reference ID #" + referenceId + ". Our Senior Broker, " + assignedBroker + ", will contact you shortly via " + (data.preferred_contact_method || 'WhatsApp') + " to coordinate the next steps.",
    "Shukriya " + (data.full_name || 'Client') + "! Aap ki request Reference ID #" + referenceId + " ke sath register ho chuki hai. Hamare Senior Broker (" + assignedBroker + ") jald hi aapse " + (data.preferred_contact_method || 'WhatsApp') + " par rabta karenge.",
    "شکریہ " + (data.full_name || 'Client') + "! آپ کی درخواست ریفرنس نمبر #" + referenceId + " کے ساتھ درج کر لی گئی ہے۔ ہمارے سینئر بروکر جلد آپ سے رابطہ کریں گے۔"
  );

  return {
    success: true,
    reply: replyText,
    language: lang,
    isComplete: true,
    referenceId: referenceId,
    assignedBroker: assignedBroker,
    currentStep: 'completed',
    collectedData: { ...data, reference_id: referenceId },
    quickReplies: ["+92 300 8492910", "Browse Properties"]
  };
}

return {
  success: true,
  reply: "Welcome to Raqba. How may we assist you?",
  language: lang,
  currentStep: 'intent',
  collectedData: data
};
