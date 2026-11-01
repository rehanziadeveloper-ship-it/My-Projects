import { createClient } from '@supabase/supabase-js';
import type { Clinic, Doctor, Service, WorkingHour, Review, AvailableSlot } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zivaqbjimrteyflmuuqh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured =
  supabaseUrl &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const FALLBACK_CLINIC: Clinic = {
  id: 'clinic-1',
  name: 'Smile Dental Clinic',
  tagline: 'A healthier smile. A more confident you.',
  phone: '+923001234567',
  whatsapp_number: '+923001234567',
  address: 'Plot 14-B, Sector F-7 Markaz, Islamabad, Pakistan',
  google_map_url: 'https://maps.google.com/?q=Smile+Dental+Clinic+Islamabad',
  google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJsmile_dental',
};

export const FALLBACK_DOCTOR: Doctor = {
  id: 'doc-1',
  full_name: 'Dr. Zeeshan Ahmad',
  title: 'Principal Dental Surgeon',
  qualifications: 'BDS, RDS (Gold Medalist), C-Implants',
  bio: 'Dedicated to gentle, modern dental treatments with 12+ years of clinical excellence in restorative care, painless extractions, and cosmetic dentistry.',
  photo_url: '/images/doctor.png',
};

// Rich Services with Real Dental Images, Slugs, and Step-by-Step Procedures
export const FALLBACK_SERVICES: Service[] = [
  {
    id: '4b296ce5-5f6e-460d-b8b4-75ca2e6ed969',
    slug: 'dental-checkup-consultation',
    name_en: 'Dental Checkup & Consultation',
    name_roman: 'Checkup aur Mashwara',
    description_en: 'Comprehensive digital oral examination, tooth inspection, and customized treatment planning.',
    description_roman: 'Danton ka mukammal muaina, digital assessment aur tasalli bakhsh mashwara.',
    duration_min: 30,
    price_from_pkr: 2000,
    image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    display_order: 1,
    detailed_overview: 'Routine dental consultations detect hidden micro-cavities, gum inflammation, and enamel wear long before they escalate into painful emergencies. Dr. Zeeshan Ahmad uses high-magnification intraoral mirrors and digital imaging to provide an honest, conservative evaluation.',
    detailed_overview_roman: 'Kissi bhi baray dard se bachne ke liye baqaida checkup zaroori hai. Dr. Zeeshan Ahmad danton aur masooron ka mukammal muaina kar ke sahi mashwara dete hain.',
    who_needs_this: [
      'Anyone overdue for a 6-month preventive checkup',
      'Patients experiencing early cold or sweet sensitivity',
      'Individuals wanting honest guidance before undergoing cosmetic or restorative work'
    ],
    benefits: [
      'Prevents minor decay from escalating into root canals',
      'Full visual review on clinic monitors with clear explanations',
      'Zero aggressive treatment upselling'
    ],
    procedure_steps: [
      {
        step: 1,
        title: 'Clinical Oral Assessment',
        description: 'Visual examination of all 32 teeth, existing restorations, and soft oral tissues.'
      },
      {
        step: 2,
        title: 'Periodontal & Bite Check',
        description: 'Evaluating gum pocket depths and jaw alignment for signs of grinding or inflammation.'
      },
      {
        step: 3,
        title: 'Collaborative Care Plan',
        description: 'Reviewing findings with transparent PKR costs and priority scheduling.'
      }
    ]
  },
  {
    id: 'b42d4783-65bf-4f69-a886-442ed1528523',
    slug: 'ultrasonic-scaling-polishing',
    name_en: 'Ultrasonic Scaling & Polishing',
    name_roman: 'Danton Ki Safai (Scaling)',
    description_en: 'Painless ultrasonic plaque, stubborn calculus, and tartar removal for healthy pink gums.',
    description_roman: 'Danton aur masooron ki gehrai se safai, badboo ka khatma aur qudrati chamak.',
    duration_min: 45,
    price_from_pkr: 5000,
    image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    display_order: 2,
    detailed_overview: 'Hardened calculus (tartar) cannot be removed with regular toothbrushing. Our painless piezoelectric ultrasonic scaling gently vibrates away tartar deposits beneath the gumline, preventing gingivitis, bleeding, and chronic bad breath.',
    detailed_overview_roman: 'Plaque aur tartar jamne se masooron se khoon aata hai. Ultrasonic scaling se bina kisi dard ke danton ki safai hoti hai aur enamel ko koi nuqsan nahi pohanchta.',
    who_needs_this: [
      'Gums that bleed during normal brushing or flossing',
      'Yellow or brown stains along the gum margins',
      'Persistent morning breath or bad taste in the mouth'
    ],
    benefits: [
      'Eliminates bacterial reservoirs causing gum disease',
      'Smooth micro-polishing paste removes tea, coffee, and tobacco stains',
      'Leaves mouth feeling fresh, clean, and healthy'
    ],
    procedure_steps: [
      {
        step: 1,
        title: 'Painless Ultrasonic Debridement',
        description: 'Vibrating ultrasonic tip gently detaches calcified tartar without scraping natural enamel.'
      },
      {
        step: 2,
        title: 'Sub-Gingival Irrigation',
        description: 'Antiseptic flushing washes away loose debris and soothes sensitive gingival tissue.'
      },
      {
        step: 3,
        title: 'Diamond Micro-Polishing',
        description: 'A fine prophylactic paste polishes tooth surfaces smooth to deter future stain buildup.'
      }
    ]
  },
  {
    id: 'caffe202-3672-415b-a4e4-adee354c2cc3',
    slug: 'composite-tooth-filling',
    name_en: 'Composite Tooth Filling',
    name_roman: 'Dant Ki Filling',
    description_en: 'Color-matched, natural-looking composite resin restoration for cavities, chips, and worn edges.',
    description_roman: 'Kharab, keeray lage ya toote hue dant ki qudrati rangat wali mazboot filling.',
    duration_min: 30,
    price_from_pkr: 4500,
    image_url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    display_order: 3,
    detailed_overview: 'Say goodbye to unsightly black mercury amalgam fillings. We use state-of-the-art biocompatible nano-hybrid composite resins that bond directly to your tooth structure, shade-matched to your surrounding teeth.',
    detailed_overview_roman: 'Keeray se khokhlay hone wale danton ko safai ke baad qudrati rang ke composite se bhara jata hai taake dant ki asal shakal aur taqat wapis aa jaye.',
    who_needs_this: [
      'Cavities causing sensitivity to cold drinks or sweets',
      'Chipped, broken, or uneven incisal edges',
      'Old amalgam (silver) fillings needing replacement'
    ],
    benefits: [
      'Matches your natural enamel shade indistinguishably',
      'Bonds chemically to tooth walls, strengthening remaining structure',
      'Cured instantly under blue LED light for immediate chewing ability'
    ],
    procedure_steps: [
      {
        step: 1,
        title: 'Decay Removal & Conditioning',
        description: 'Targeted removal of softened infected dentin followed by gentle acid etching.'
      },
      {
        step: 2,
        title: 'Layered Resin Placement',
        description: 'Micro-sculpting the composite resin to restore natural tooth anatomy, cusps, and grooves.'
      },
      {
        step: 3,
        title: 'LED Polymerization & Bite Polish',
        description: 'Light-curing and precision occlusion checking to ensure a seamless, comfortable bite.'
      }
    ]
  },
  {
    id: '7998d46c-d245-4547-9990-ce250ef9d414',
    slug: 'painless-root-canal-treatment',
    name_en: 'Painless Root Canal Treatment',
    name_roman: 'Root Canal Treatment (RCT)',
    description_en: 'Advanced motorized rotary endodontics to eliminate severe pain and save infected natural teeth.',
    description_roman: 'Dant ke shadeed dard, infection aur soojan ka be-dard aur mukammal ilaj.',
    duration_min: 60,
    price_from_pkr: 12000,
    image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    display_order: 4,
    detailed_overview: 'When tooth decay reaches the deep pulp nerve, it causes unbearable throbbing pain, facial swelling, or abscesses. Root Canal Treatment cleans the infected canal system, disinfects it, and seals it permanently, saving your natural tooth from extraction.',
    detailed_overview_roman: 'Jab keeray ka asar dant ki nas (nerve) tak pohanch jaye to shadeed dard hota hai. Rotary RCT ke zariye hum bina dard ke nas ko saaf kar ke dant ko bachate hain.',
    who_needs_this: [
      'Severe throbbing toothache that worsens at night or when lying down',
      'Pain when biting or applying pressure',
      'Swelling or pimple-like bump on the gum adjacent to the tooth'
    ],
    benefits: [
      'Instant relief from agonizing dental nerve pain',
      'Preserves your natural tooth root and jawbone integrity',
      'Performed with profound computer-controlled local anesthesia'
    ],
    procedure_steps: [
      {
        step: 1,
        title: 'Deep Local Anesthesia',
        description: 'Ensuring 100% painless numbness around the tooth before beginning.'
      },
      {
        step: 2,
        title: 'Rotary Canal Shaping & Disinfection',
        description: 'Flexible nickel-titanium motorized instruments gently clear and sanitize canals.'
      },
      {
        step: 3,
        title: 'Hermetic Gutta-Percha Sealing',
        description: 'Biocompatible rubber filling seals the canal to prevent any recurrence of bacteria.'
      }
    ]
  },
  {
    id: 'b7727987-194e-498e-bfed-094a9a017e7a',
    slug: 'professional-teeth-whitening',
    name_en: 'Teeth Whitening',
    name_roman: 'Danton Ki Whitening',
    description_en: 'Professional LED laser accelerator whitening to safely brighten discolored or yellowed teeth.',
    description_roman: 'Chand lamhon mein danton ko 3 se 8 shades tak chamakdar aur safaid banayein.',
    duration_min: 45,
    price_from_pkr: 18000,
    image_url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    display_order: 5,
    detailed_overview: 'Years of drinking chai, coffee, and spices leave deep intrinsic stains within the enamel prisms. Our professional in-office whitening uses hydrogen peroxide activated by cold blue LED light, brightening your smile up to 8 shades safely without weakening enamel.',
    detailed_overview_roman: 'Chai, coffee aur masalay danton par peela pan chorr dete hain. Hamari clinic whitening danton ke enamel ko nuqsan pohanchaye baghair chamakdar banati hai.',
    who_needs_this: [
      'Upcoming wedding, graduation, or public speaking appearance',
      'Yellow or brown discoloration from tea, coffee, or aging',
      'Desire for a rejuvenated, radiant smile'
    ],
    benefits: [
      'Noticeable 3 to 8 shades lighter in just one 45-minute visit',
      'Enamel-safe pH-neutral formula reduces transient sensitivity',
      'Includes gum barrier protection for total safety'
    ],
    procedure_steps: [
      {
        step: 1,
        title: 'Gingival Barrier Application',
        description: 'A protective resin barrier is placed over the gums to protect soft tissues.'
      },
      {
        step: 2,
        title: 'LED Accelerator Illumination',
        description: 'Professional grade whitening gel is applied and energized with cold LED light.'
      },
      {
        step: 3,
        title: 'Enamel Remineralization',
        description: 'Fluoride desensitizing finish seals enamel and prolongs bright luster.'
      }
    ]
  },
  {
    id: 'e279f53c-e66f-42ca-abac-6011b2413b28',
    slug: 'gentle-tooth-extraction',
    name_en: 'Tooth Extraction',
    name_roman: 'Dant Nikalna',
    description_en: 'Gentle, minimally invasive tooth extraction with local anesthesia when a tooth cannot be saved.',
    description_roman: 'Shadeed kharab ya toote hue dant ko be-dard tareeqay se alag karna.',
    duration_min: 30,
    price_from_pkr: 4000,
    image_url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    display_order: 6,
    detailed_overview: 'Extraction is always our last resort. However, when a tooth is cracked beyond repair, severely fractured below the bone, or impacted, gentle extraction prevents bone loss and spreading infection. Dr. Zeeshan uses atraumatic techniques to preserve the surrounding socket.',
    detailed_overview_roman: 'Jab dant itna kharab ho chuka ho ke bachaya na ja sake, to asan tareeqay se baghair kisi shadeed dard ke nikala jata hai taake doosray danton ko bacha ja sake.',
    who_needs_this: [
      'Teeth severely fractured down through the root below the gumline',
      'Impacted or painfully infected wisdom teeth',
      'Severe bone loss where tooth has lost its anchoring stability'
    ],
    benefits: [
      'Zero pain felt during the procedure due to profound local anesthesia',
      'Socket preservation techniques make future implants fast and easy',
      'Includes comprehensive post-operative prescription and direct follow-up'
    ],
    procedure_steps: [
      {
        step: 1,
        title: 'Targeted Anesthesia Block',
        description: 'Testing the tooth to ensure zero sensation before touching the socket.'
      },
      {
        step: 2,
        title: 'Atraumatic Elevation',
        description: 'Gentle luxation frees periodontal fibers without trauma to adjacent bone.'
      },
      {
        step: 3,
        title: 'Hemostatic Socket Care',
        description: 'Applying sterile surgical gauze and providing clear verbal & WhatsApp recovery guidelines.'
      }
    ]
  }
];

export const FALLBACK_REVIEWS: Review[] = [
  {
    id: 'r-1',
    patient_name: 'Usman Tariq',
    rating: 5,
    comment: 'Painless root canal treatment! Dr. Zeeshan is exceptionally gentle, explain things clearly, and the clinic environment is spotless.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'r-2',
    patient_name: 'Ayesha Malik',
    rating: 5,
    comment: 'Booked scaling and whitening. Results exceeded my expectations and the appointment was right on schedule without any waiting.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'r-3',
    patient_name: 'Hamza Khan',
    rating: 5,
    comment: 'Super fast WhatsApp booking confirmation. Dr. Zeeshan is hands down the most competent dentist in Islamabad.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
];

export async function fetchClinicProfile(): Promise<Clinic> {
  if (!isSupabaseConfigured) return FALLBACK_CLINIC;
  try {
    const { data, error } = await supabase.from('clinic').select('*').limit(1).single();
    if (error || !data) return FALLBACK_CLINIC;
    return data;
  } catch {
    return FALLBACK_CLINIC;
  }
}

export async function fetchDoctorProfile(): Promise<Doctor> {
  if (!isSupabaseConfigured) return FALLBACK_DOCTOR;
  try {
    const { data, error } = await supabase.from('doctor').select('*').limit(1).single();
    if (error || !data) return FALLBACK_DOCTOR;
    return data;
  } catch {
    return FALLBACK_DOCTOR;
  }
}

export async function fetchServices(): Promise<Service[]> {
  if (!isSupabaseConfigured) return FALLBACK_SERVICES;
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_SERVICES;
    
    // Merge database rows with our rich client metadata
    return data.map((d: any) => {
      const fallback = FALLBACK_SERVICES.find(s => s.name_en === d.name_en || s.id === d.id) || FALLBACK_SERVICES[0];
      return {
        ...fallback,
        ...d,
        slug: fallback.slug,
        image_url: fallback.image_url,
        detailed_overview: fallback.detailed_overview,
        procedure_steps: fallback.procedure_steps,
        who_needs_this: fallback.who_needs_this,
        benefits: fallback.benefits
      };
    });
  } catch {
    return FALLBACK_SERVICES;
  }
}

export async function fetchWorkingHours(): Promise<WorkingHour[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .order('day_of_week', { ascending: true });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function fetchPublishedReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured) return FALLBACK_REVIEWS;
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return import.meta.env.VITE_DEMO_CONTENT === 'true' ? FALLBACK_REVIEWS : [];
    }
    return data;
  } catch {
    return import.meta.env.VITE_DEMO_CONTENT === 'true' ? FALLBACK_REVIEWS : [];
  }
}

export async function fetchAvailableSlots(dateStr: string, serviceId: string): Promise<AvailableSlot[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_day: dateStr,
        p_service_id: serviceId,
      });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback generation for mock/demo mode: 10:00 AM to 7:00 PM, 30-min intervals
  const slots: AvailableSlot[] = [];
  const times = [
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:30 PM', '03:00 PM',
    '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM',
    '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'
  ];

  for (const timeStr of times) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const start = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:00`);
    const end = new Date(start.getTime() + 30 * 60000);

    slots.push({
      slot_start: start.toISOString(),
      slot_end: end.toISOString(),
      slot_start_pkt: timeStr,
    });
  }

  return slots;
}
