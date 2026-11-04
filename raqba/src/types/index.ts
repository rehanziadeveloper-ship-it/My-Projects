export type Priority = 'P0 Critical' | 'P1 High' | 'P2 Routine';

export type Temperature = 'Hot' | 'Warm' | 'Cold';

export type RaqbaIntent = 'Buy' | 'Rent' | 'Sell' | 'Rent out' | 'Invest';

export type DealStage = 
  | 'new'
  | 'budget_verified'
  | 'showing_scheduled'
  | 'offer'
  | 'closing';

export type FinancingType = 'Cash' | 'Developer Installment Plan' | 'Bank Financing';

export type PaymentStatus = 'None' | 'Token Received' | 'Advance Received' | 'Balance Pending';

export type Language = 'en' | 'ur' | 'ru'; // English, Urdu, Roman Urdu

export type UserRole = 'admin' | 'broker';

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  license_number: string;
  avatar_url?: string;
  active: boolean;
  commission_rate: number;
  closed_volume_ytd: number;
  leads_assigned_count: number;
  active_pipeline_count: number;
  app_role?: UserRole;
  whatsapp_number?: string;
  city_specialization?: string;
  created_at?: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  property_type: string;
  property_category: 'House' | 'Apartment' | 'Plot' | 'Commercial';
  price: number; // PKR
  address: string;
  area_name: string; // e.g. DHA Phase 6, Bahria Town, E-7, Clifton
  city: string; // Lahore, Islamabad, Karachi, Rawalpindi
  state: string;
  zip: string;
  beds?: number;
  baths?: number;
  sqft: number;
  area_size: number;
  area_unit: 'Marla' | 'Kanal' | 'Sq Ft' | 'Sq Yd';
  description?: string;
  features: string[];
  images: string[];
  gated_community: boolean;
  gate_code?: string;
  pin_location?: string;
  google_maps_url?: string;
  financing_available?: string;
  proof_of_funds_required_min: number;
  status: 'active' | 'pending' | 'escrow' | 'sold' | 'archived';
  listing_agent_id?: string;
  created_at?: string;
}

export interface SummaryDossier {
  bullet_1_liquidity: string;
  bullet_2_intent: string;
  bullet_3_action: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  lead_source: 'website_form' | 'portal_lead' | 'walk_in' | 'voice_hotline' | 'social_ad' | 'chatbot';
  buyer_seller_type: 'Buyer' | 'Seller' | 'Commercial Investor';
  budget_min?: number;
  budget_max: number; // PKR
  financing_type: FinancingType;
  target_property_id?: string;
  timeline_months: number;
  intent_score: number;
  budget_realism_score: number;
  priority: Priority;
  temperature?: Temperature;
  status: string;
  deal_stage: DealStage;
  budget_verified: boolean;
  budget_verified_by?: string;
  budget_verified_at?: string;
  commission_rate: number;
  deal_payment_status: PaymentStatus;
  payment_notes?: string;
  data_consent: boolean;
  verbatim_quote?: string;
  summary_dossier?: SummaryDossier;
  assigned_agent_id?: string;
  dispatch_timestamp?: string;
  dispatch_latency_seconds: number;
  created_at: string;

  // Raqba Slot Extensions
  intent?: RaqbaIntent;
  purpose?: string;
  property_type?: string;
  city?: string;
  area_name?: string;
  backup_area?: string;
  area_value?: number;
  area_unit?: string;
  bedrooms?: number;
  bathrooms?: number;
  payment_method?: string;
  timeline?: string;
  must_have_features?: string[];
  lease_duration?: string;
  tenant_type?: string;
  pets?: string;
  appointment_at?: string;
  appointment_type?: string;
  preferred_contact_method?: string;
  preferred_contact_time?: string;
  notes?: string;
  reference_id?: string;
  language_last?: string;

  // joined relations
  agent?: Agent;
  property?: Property;
}

export interface ChatSession {
  id: string;
  reference_id: string;
  status: 'active' | 'confirmed' | 'incomplete' | 'handoff';
  intent?: RaqbaIntent;
  language_last: string;
  consent_given: boolean;
  consent_at?: string;
  collected_data: Record<string, any>;
  current_step: string;
  retry_counts?: Record<string, number>;
  handoff_reason?: string;
  lead_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'customer' | 'assistant';
  content: string;
  language: string;
  attachments?: any[];
  created_at: string;
}

export interface PropertySubmission {
  id: string;
  reference_id?: string;
  lead_id?: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string;
  intent: 'Sell' | 'Rent out';
  property_type: string;
  city: string;
  address: string;
  area_value: number;
  area_unit: string;
  bedrooms?: number;
  bathrooms?: number;
  age_condition?: string;
  asking_price: number;
  ownership_status?: string;
  occupancy?: string;
  timeline?: string;
  document_urls?: string[];
  photo_urls?: string[];
  status: 'pending_review' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface Showing {
  id: string;
  property_id: string;
  lead_id: string;
  agent_id?: string;
  showing_time: string;
  status: 'pending_confirmation' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  broker_confirmed: boolean;
  confirmation_time?: string;
  google_maps_pin?: string;
  gate_pin_code?: string;
  visitor_pass_token?: string;
  client_notified: boolean;
  pof_verified: boolean;
  notes?: string;
  created_at: string;
  // joined
  property?: Property;
  lead?: Lead;
  agent?: Agent;
}

export interface Agreement {
  id: string;
  lead_id: string;
  property_id?: string;
  agent_id?: string;
  agreement_type: string;
  document_url?: string;
  sign_status: 'draft' | 'sent' | 'viewed' | 'signed' | 'executed';
  envelope_id: string;
  signed_at?: string;
  signer_name?: string;
  signer_email?: string;
  signer_ip?: string;
  signature_svg?: string;
  legal_note?: string;
  created_at: string;
  // joined
  lead?: Lead;
  property?: Property;
  agent?: Agent;
}
