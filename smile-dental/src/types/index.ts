export type AppointmentStatus = 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentSource = 'website' | 'whatsapp' | 'call' | 'admin';
export type SupportedLanguage = 'en' | 'roman_ur';

export interface Clinic {
  id: string;
  name: string;
  tagline: string;
  phone: string;
  whatsapp_number: string;
  address: string;
  google_map_url: string;
  google_review_url: string;
}

export interface Doctor {
  id: string;
  full_name: string;
  title: string;
  qualifications: string;
  bio: string;
  photo_url: string;
}

export interface ProcedureStep {
  step: number;
  title: string;
  title_roman?: string;
  description: string;
}

export interface Service {
  id: string;
  slug: string;
  name_en: string;
  name_roman: string;
  description_en: string;
  description_roman: string;
  duration_min: number;
  price_from_pkr?: number | null;
  image_url: string;
  is_active: boolean;
  display_order: number;
  detailed_overview?: string;
  detailed_overview_roman?: string;
  who_needs_this?: string[];
  procedure_steps?: ProcedureStep[];
  benefits?: string[];
}

export interface WorkingHour {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  break_start?: string | null;
  break_end?: string | null;
}

export interface DayOff {
  id: string;
  date: string;
  reason: string;
}

export interface Patient {
  id: string;
  full_name: string;
  phone: string;
  language: SupportedLanguage;
  notes?: string | null;
  created_at?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  reason?: string | null;
  is_emergency: boolean;
  manage_token: string;
  reminder_sent_at?: string | null;
  review_request_sent_at?: string | null;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  service?: Service;
}

export interface Review {
  id: string;
  patient_name: string;
  rating: number;
  comment: string;
  is_published: boolean;
  created_at: string;
}

export interface AvailableSlot {
  slot_start: string;
  slot_end: string;
  slot_start_pkt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  buttons?: Array<{ label: string; value: string }>;
  timestamp: string;
  isEmergencyNotice?: boolean;
}

export interface BookingSubmission {
  name: string;
  phone: string;
  service_id: string;
  starts_at: string;
  reason?: string;
  language?: SupportedLanguage;
  honeypot?: string;
}
