import type { BookingSubmission } from '../types';
import { supabase } from './supabase';

const N8N_BASE_URL = (import.meta.env.VITE_N8N_BASE_URL || 'https://n8n.srv1767318.hstgr.cloud').replace(/\/$/, '');

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export async function submitBooking(payload: BookingSubmission): Promise<ApiResponse> {
  // 1. Try n8n webhook
  try {
    const res = await fetch(`${N8N_BASE_URL}/webhook/smile/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    // If n8n returns a real database appointment (not appt_ mock), return it
    if (json.ok && json.data && !json.data.appointment_id?.startsWith('appt_')) {
      return json;
    }
  } catch (err) {
    console.warn('n8n webhook uncontactable, proceeding with direct Supabase booking:', err);
  }

  // 2. Direct Supabase RPC execution (ensures 100% database persistence)
  try {
    const { data, error } = await supabase.rpc('book_appointment', {
      p_name: payload.name,
      p_phone: payload.phone,
      p_service_id: payload.service_id,
      p_starts_at: payload.starts_at,
      p_source: payload.source || 'website',
      p_reason: payload.reason || null,
      p_language: payload.language || 'en'
    });

    if (!error && data?.ok) {
      return { ok: true, data };
    }
    return {
      ok: false,
      error: {
        code: data?.error || 'booking_error',
        message: data?.message || error?.message || 'Could not complete booking'
      }
    };
  } catch (err: any) {
    return {
      ok: false,
      error: {
        code: 'network_error',
        message: err?.message || 'Unable to connect to clinic database.',
      },
    };
  }
}

export async function fetchAppointmentByToken(token: string): Promise<ApiResponse> {
  // 1. Try n8n webhook
  try {
    const res = await fetch(`${N8N_BASE_URL}/webhook/smile/appointment?token=${encodeURIComponent(token)}`);
    const json = await res.json();
    if (json.ok && json.data && json.data.patient_name !== 'Patient Demo') {
      return json;
    }
  } catch (err) {
    console.warn('n8n appointment fetch error, checking Supabase:', err);
  }

  // 2. Direct Supabase RPC
  try {
    const { data, error } = await supabase.rpc('get_appointment_by_token', { p_token: token });
    if (!error && data?.ok) {
      return { ok: true, data: data.data };
    }
  } catch (err) {
    console.warn('Direct get_appointment_by_token error:', err);
  }

  return {
    ok: false,
    error: {
      code: 'not_found',
      message: 'Appointment not found. Please check your link or contact the clinic.',
    },
  };
}

export async function cancelAppointment(token: string): Promise<ApiResponse> {
  // 1. Try n8n webhook
  try {
    const res = await fetch(`${N8N_BASE_URL}/webhook/smile/appointment/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const json = await res.json();
    if (json.ok) return json;
  } catch (err) {
    console.warn('n8n cancel error, falling back to Supabase:', err);
  }

  // 2. Direct Supabase RPC
  try {
    const { data, error } = await supabase.rpc('cancel_appointment_by_token', { p_token: token });
    if (!error && data?.ok) {
      return { ok: true, status: 'cancelled' };
    }
    return {
      ok: false,
      error: {
        code: data?.error || 'cancel_error',
        message: data?.message || error?.message || 'Could not cancel appointment'
      }
    };
  } catch (err: any) {
    return {
      ok: false,
      error: {
        code: 'network_error',
        message: err?.message || 'Unable to cancel appointment.',
      },
    };
  }
}

export async function rescheduleAppointment(token: string, starts_at: string): Promise<ApiResponse> {
  // 1. Try n8n webhook
  try {
    const res = await fetch(`${N8N_BASE_URL}/webhook/smile/appointment/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, starts_at }),
    });
    const json = await res.json();
    if (json.ok) return json;
  } catch (err) {
    console.warn('n8n reschedule error, falling back to Supabase:', err);
  }

  // 2. Direct Supabase RPC
  try {
    const { data, error } = await supabase.rpc('reschedule_appointment', {
      p_token: token,
      p_new_start: starts_at
    });
    if (!error && data?.ok) {
      return { ok: true, data };
    }
    return {
      ok: false,
      error: {
        code: data?.error || 'reschedule_error',
        message: data?.message || error?.message || 'Could not reschedule appointment'
      }
    };
  } catch (err: any) {
    return {
      ok: false,
      error: {
        code: 'network_error',
        message: err?.message || 'Unable to reschedule appointment.',
      },
    };
  }
}

export async function sendChatMessage(sessionId: string, message: string, buttonId?: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${N8N_BASE_URL}/webhook/smile/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        button_id: buttonId,
      }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      ok: false,
      error: {
        code: 'network_error',
        message: err?.message || 'Unable to reach clinic chatbot server.',
      },
    };
  }
}

export function generateIcsCalendar(appointment: {
  service_name: string;
  starts_at: string;
  ends_at: string;
  doctor_name: string;
  clinic_address: string;
  manage_token: string;
}): string {
  const formatIcsTime = (isoString: string) => {
    return new Date(isoString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const start = formatIcsTime(appointment.starts_at);
  const end = formatIcsTime(appointment.ends_at);
  const now = formatIcsTime(new Date().toISOString());

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Smile Dental Clinic//Appointment Scheduler//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${appointment.manage_token}@smiledental.pk
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
SUMMARY:${appointment.service_name} - Smile Dental Clinic
DESCRIPTION:Dental appointment with ${appointment.doctor_name}. Manage your visit: https://smiledental.pk/appointment/${appointment.manage_token}
LOCATION:${appointment.clinic_address}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Reminder: Upcoming Dental Visit
END:VALARM
END:VEVENT
END:VCALENDAR`;
}
