import { Language } from '../types';

export interface Translations {
  brandSubtitle: string;
  navProperties: string;
  navWhyUs: string;
  navHowItWorks: string;
  navBrokers: string;
  navContact: string;
  navAdmin: string;
  heroBadge: string;
  heroHeadline: string;
  heroHeadlineAccent: string;
  heroSubheadline: string;
  searchCityPlaceholder: string;
  searchTypePlaceholder: string;
  searchBudgetPlaceholder: string;
  searchBtn: string;
  featuredTitle: string;
  featuredSubtitle: string;
  viewDetails: string;
  bookShowing: string;
  browseCityTitle: string;
  browseCitySubtitle: string;
  whyUsTitle: string;
  whyUsSubtitle: string;
  point1Title: string;
  point1Desc: string;
  point2Title: string;
  point2Desc: string;
  point3Title: string;
  point3Desc: string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  brokersTitle: string;
  brokersSubtitle: string;
  contactTitle: string;
  contactSubtitle: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  budgetLabel: string;
  propertyInterestLabel: string;
  financingLabel: string;
  messageLabel: string;
  consentCheckbox: string;
  submitInquiry: string;
  inquirySuccessTitle: string;
  inquirySuccessMsg: string;
  whatsappCallBtn: string;
  etoDisclaimer: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    brandSubtitle: "Premium Pakistan Real Estate Brokerage",
    navProperties: "Featured Homes",
    navWhyUs: "Why Choose Us",
    navHowItWorks: "How It Works",
    navBrokers: "Our Brokers",
    navContact: "Inquire Now",
    navAdmin: "Broker Portal",
    heroBadge: "PAKISTAN'S PREMIER RESIDENTIAL & COMMERCIAL BROKERAGE",
    heroHeadline: "Find Your Dream Home in",
    heroHeadlineAccent: "Pakistan",
    heroSubheadline: "Verified houses, luxury apartments, and prime plots in Lahore, Islamabad, Karachi, and Rawalpindi. Private showings arranged with senior licensed brokers.",
    searchCityPlaceholder: "Select City (Lahore, Islamabad, etc.)",
    searchTypePlaceholder: "Property Type (House, Plot, etc.)",
    searchBudgetPlaceholder: "Budget Range (e.g. Rs 5 Crore)",
    searchBtn: "Search Properties",
    featuredTitle: "Exclusive Featured Listings",
    featuredSubtitle: "Carefully vetted properties with verified registry and direct owner representations.",
    viewDetails: "View Details",
    bookShowing: "Book Private Showing",
    browseCityTitle: "Browse By Prime Cities",
    browseCitySubtitle: "Prime locations including DHA, Bahria Town, Gulberg, Sector E-7 & Clifton.",
    whyUsTitle: "Why Choose Raqba",
    whyUsSubtitle: "Delivering a transparent, professional real estate experience with zero guesswork.",
    point1Title: "100% Title Verified",
    point1Desc: "Every property listing is vetted with direct ownership papers, allotment letters, and zero legal disputes.",
    point2Title: "Dedicated Senior Broker",
    point2Desc: "You work directly with an experienced local territory specialist, not unverified sub-agents.",
    point3Title: "Private Guided Showings",
    point3Desc: "Scheduled walkthroughs with verified coordinates, society gate clearance, and direct owner discussions.",
    howItWorksTitle: "How It Works",
    howItWorksSubtitle: "Three simple steps from discovery to closing your real estate acquisition.",
    step1Title: "1. Select & Inquire",
    step1Desc: "Browse verified listings and submit your inquiry with preferred budget and timeline.",
    step2Title: "2. Private Showing",
    step2Desc: "Your assigned broker contacts you within 15 minutes and arranges private walkthrough access.",
    step3Title: "3. Transparent Deal & E-Sign",
    step3Desc: "Review pre-filled representation agreements, legal disclosures, and proceed with confidence.",
    brokersTitle: "Meet Our Licensed Brokers",
    brokersSubtitle: "Dedicated property specialists across Punjab, Islamabad Capital Territory, and Sindh.",
    contactTitle: "Schedule a Consultation",
    contactSubtitle: "Tell us what you are looking for. Our senior brokers will reach out directly.",
    nameLabel: "Your Full Name",
    phoneLabel: "Mobile Phone (WhatsApp)",
    emailLabel: "Email Address",
    budgetLabel: "Approximate Budget in PKR",
    propertyInterestLabel: "Interested Property / Area",
    financingLabel: "Payment Plan Preference",
    messageLabel: "Tell Us About Your Requirements",
    consentCheckbox: "I consent to Raqba storing my details for property inquiries.",
    submitInquiry: "Submit Property Inquiry",
    inquirySuccessTitle: "Inquiry Received Successfully",
    inquirySuccessMsg: "Your assigned senior broker has been notified and will call you shortly to arrange your walkthrough.",
    whatsappCallBtn: "WhatsApp Us",
    etoDisclaimer: "Representation and non-disclosure agreements are digitally executed under Pakistan Electronic Transactions Ordinance (ETO) 2002. Formal sale deeds require stamp paper and sub-registrar registration."
  },

  ur: {
    brandSubtitle: "پاکستان کا بااعتماد ریئل اسٹیٹ ادارہ",
    navProperties: "نمایاں جائیدادیں",
    navWhyUs: "ہماری خصوصیات",
    navHowItWorks: "طریقہ کار",
    navBrokers: "ہمارے بروکرز",
    navContact: "رابطہ کریں",
    navAdmin: "بروکر پورٹل",
    heroBadge: "پاکستان بھر میں تصدیق شدہ لگژری گھر اور کمرشل جائیدادیں",
    heroHeadline: "اپنے خوابوں کا گھر تلاش کریں",
    heroHeadlineAccent: "پاکستان میں",
    heroSubheadline: "لاہور، اسلام آباد، راولپنڈی اور کراچی میں تصدیق شدہ گھر، لگژری اپارٹمنٹس اور پلاٹس۔ سینئر بروکرز کی نگرانی میں پرائیویٹ وزٹ کا انتظام۔",
    searchCityPlaceholder: "شہر منتخب کریں (لاہور، اسلام آباد)",
    searchTypePlaceholder: "جائیداد کی قسم (گھر، پلاٹ)",
    searchBudgetPlaceholder: "بجٹ (مثلاً 5 کروڑ)",
    searchBtn: "تلاش کریں",
    featuredTitle: "نمایاں منتخب جائیدادیں",
    featuredSubtitle: "مکمل قانونی تصدیق شدہ فائلز اور کلیئر رجسٹری کے ساتھ بہترین جائیدادیں۔",
    viewDetails: "تفصیلات دیکھیں",
    bookShowing: "وزٹ کا وقت طے کریں",
    browseCityTitle: "اہم شہروں کے لحاظ سے تلاش کریں",
    browseCitySubtitle: "ڈی ایچ اے، بحریہ ٹاؤن، گلبرگ، کلفٹن اور اسلام آباد سیکٹرز۔",
    whyUsTitle: "ریئلٹی پلس 360 کیوں منتخب کریں؟",
    whyUsSubtitle: "پیشہ ورانہ مہارت اور 100 فیصد شفافیت کے ساتھ ریئل اسٹیٹ سروسز۔",
    point1Title: "100 فیصد تصدیق شدہ دستاویزات",
    point1Desc: "ہر جائیداد کے قانونی کاغذات اور ملکیت کی جانچ پڑتال کے بعد لسٹ کیا جاتا ہے۔",
    point2Title: "ماہر سینئر بروکر",
    point2Desc: "آپ براہ راست تجربہ کار لوکل بروکر سے رہنمائی حاصل کرتے ہیں۔",
    point3Title: "بآسانی پرائیویٹ وزٹ",
    point3Desc: "مکمل سیکیورٹی کلیئرنس اور لوکیشن پن کے ساتھ جائیداد کا براہ راست معائنہ۔",
    howItWorksTitle: "آسان طریقہ کار",
    howItWorksSubtitle: "تین آسان مراحل میں اپنی پسندیدہ جائیداد حاصل کریں۔",
    step1Title: "1. جائیداد منتخب کریں",
    step1Desc: "ہماری لسٹنگز دیکھیں اور اپنا بجٹ اور ترجیحات درج کریں۔",
    step2Title: "2. سائٹ وزٹ",
    step2Desc: "ہمارا بروکر 15 منٹ میں آپ سے رابطہ کر کے وزٹ کا وقت طے کرے گا۔",
    step3Title: "3. شفاف ڈیل اور دستخط",
    step3Desc: "تمام قانونی امور اور نمائندگی کے معاہدات پر مکمل اطمینان کے بعد ڈیل مکمل کریں۔",
    brokersTitle: "ہمارے مستند بروکرز سے ملیں",
    brokersSubtitle: "پنجاب، اسلام آباد اور سندھ کے مستند اور تجربہ کار ریئل اسٹیٹ ماہرین۔",
    contactTitle: "ہم سے رابطہ کریں",
    contactSubtitle: "اپنی ترجیحات بتائیں، ہمارے سینئر بروکر آپ سے فوری رابطہ کریں گے۔",
    nameLabel: "آپ کا پورا نام",
    phoneLabel: "موبائل فون (واٹس ایپ)",
    emailLabel: "ای میل ایڈریس",
    budgetLabel: "تخمینہ بجٹ (روپے میں)",
    propertyInterestLabel: "مطلوبہ جائیداد / علاقہ",
    financingLabel: "ادائیگی کا طریقہ",
    messageLabel: "اپنی ضروریات سے آگاہ کریں",
    consentCheckbox: "میں اپنی معلومات ریئلٹی پلس 360 کے پاس محفوظ کرنے کی اجازت دیتا ہوں۔",
    submitInquiry: "درخواست جمع کروائیں",
    inquirySuccessTitle: "آپ کی درخواست موصول ہو گئی",
    inquirySuccessMsg: "متعلقہ بروکر کو اطلاع دے دی گئی ہے اور وہ جلد ہی آپ سے رابطہ کریں گے۔",
    whatsappCallBtn: "واٹس ایپ رابطہ",
    etoDisclaimer: "معاہدات پر دستخط پاکستان الیکٹرانک ٹرانزیکشنز آرڈیننس (ETO) 2002 کے تحت کیے جاتے ہیں۔ باقاعدہ بیع نامہ کے لیے اشٹام پیپر اور رجسٹری ضروری ہے۔"
  },

  ru: {
    brandSubtitle: "Pakistan Ki Verified Real Estate Brokerage",
    navProperties: "Ghar & Plots",
    navWhyUs: "Hum Kyun?",
    navHowItWorks: "Tareeqa Kar",
    navBrokers: "Hamare Brokers",
    navContact: "Rabta Karein",
    navAdmin: "Broker Portal",
    heroBadge: "PAKISTAN KI PREMIER PROPERTY ADVISORY",
    heroHeadline: "Apna Dream Home Talash Karein",
    heroHeadlineAccent: "Pakistan Mein",
    heroSubheadline: "Lahore, Islamabad, Rawalpindi aur Karachi mein 100% verified ghar, luxury apartments aur prime plots. Direct licensed brokers ke sath private walkthrough visit.",
    searchCityPlaceholder: "Sheher chunein (Lahore, Islamabad)",
    searchTypePlaceholder: "Property Type (Ghar, Plot)",
    searchBudgetPlaceholder: "Budget (e.g. Rs 5 Crore)",
    searchBtn: "Search Karein",
    featuredTitle: "Featured Verified Listings",
    featuredSubtitle: "Clear registry aur direct owner representation ke sath selected properties.",
    viewDetails: "Details Dekhein",
    bookShowing: "Visit Schedule Karein",
    browseCityTitle: "Sheher Ke Mutabiq Dekhein",
    browseCitySubtitle: "DHA, Bahria Town, Gulberg, Sector E-7 aur Clifton ke prime areas.",
    whyUsTitle: "Raqba Kyun Behtareen Hai?",
    whyUsSubtitle: "Transparency, direct owner dealing aur zero fraud ki guarantee.",
    point1Title: "100% Title Verified",
    point1Desc: "Har listing ke registry papers aur allotment letters ki complete legal check.",
    point2Title: "Senior Dedicated Broker",
    point2Desc: "Aap ko experienced local area specialist handle karta hai, koi ghair mutaliqa agent nahi.",
    point3Title: "Private Showing & Gate Pass",
    point3Desc: "Direct Google Maps pin aur society gate pass ke sath asan visit.",
    howItWorksTitle: "3 Asan Steps",
    howItWorksSubtitle: "Inquiry se le kar closing tak ka asan tareeqa.",
    step1Title: "1. Select Karein",
    step1Desc: "Apni pasandeeda property chunein aur apna budget bataen.",
    step2Title: "2. Private Visit",
    step2Desc: "Hamara senior broker 15 minute mein call kar ke visit finalize karega.",
    step3Title: "3. Direct Deal & E-Sign",
    step3Desc: "Representation agreements aur legal paper e-sign karein aur direct deal karein.",
    brokersTitle: "Hamare Senior Brokers",
    brokersSubtitle: "Lahore, Islamabad, Rawalpindi aur Karachi ke dedicated specialists.",
    contactTitle: "Broker Se Rabta Karein",
    contactSubtitle: "Apna number aur requirement darj karein, hamari team foran rabta karegi.",
    nameLabel: "Aap Ka Pura Naam",
    phoneLabel: "Mobile Phone (WhatsApp)",
    emailLabel: "Email Address",
    budgetLabel: "Budget (Pakistani Rupay)",
    propertyInterestLabel: "Pasandeeda Property / Area",
    financingLabel: "Payment Mode (Cash / Installment)",
    messageLabel: "Apni Requirement Likhein",
    consentCheckbox: "Main Raqba ko apna contact number save karne ki ijazat deta hoon.",
    submitInquiry: "Inquiry Bhejein",
    inquirySuccessTitle: "Inquiry Kamyabi Se Bheji Gayi",
    inquirySuccessMsg: "Hamare senior broker ko notification mil gaya hai aur wo foran aap ko call kareinge.",
    whatsappCallBtn: "WhatsApp Rabta",
    etoDisclaimer: "Agreements Pakistan Electronic Transactions Ordinance (ETO) 2002 ke mutabiq digitally execute hote hain. Registry transfer ke liye stamp paper zaruri hai."
  }
};
