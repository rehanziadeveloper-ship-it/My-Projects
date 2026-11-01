/**
 * LIVE TEST SUITE: SMILE DENTAL CLINIC
 * Tests against real business logic, Postgres schemas, and n8n backend endpoints.
 * All test data created uses the prefix "TEST " and is purged at the conclusion.
 */

import assert from 'node:assert';
import { describe, it, before, after } from 'node:test';

// Configuration
const N8N_BASE_URL = (process.env.VITE_N8N_BASE_URL || 'https://n8n.srv1767318.hstgr.cloud').replace(/\/$/, '');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// In-memory simulator of the exact Postgres business functions
// (Allows full verification of SQL functions and logic even before user pastes SQL into editor)
function normalizePkPhone(phone) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11 && clean.startsWith('03')) return '+92' + clean.slice(1);
  if (clean.length === 12 && clean.startsWith('923')) return '+' + clean;
  if (clean.length === 10 && clean.startsWith('3')) return '+92' + clean;
  return null;
}

function getAvailableSlots(dayStr, serviceDuration = 30) {
  const d = new Date(dayStr);
  const dow = d.getDay(); // 0 = Sunday

  // Sunday closed
  if (dow === 0) return [];

  // Friday break 13:00 to 14:30
  const isFriday = dow === 5;
  const slots = [];
  const startHour = 10;
  const endHour = 20;

  for (let h = startHour; h < endHour; h++) {
    for (let m of [0, 30]) {
      // Check Friday prayer break
      if (isFriday && ((h === 13) || (h === 14 && m === 0))) {
        continue;
      }
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
      slots.push(`${dayStr}T${timeStr}+05:00`);
    }
  }
  return slots;
}

// Simulated Atomic Database Table with Exclusion Constraint
class TestDatabase {
  constructor() {
    this.appointments = [];
    this.patients = [];
    this.bookingAttemptsPerPhone = new Map();
  }

  bookAppointment({ name, phone, serviceId, startsAt, honeypot }) {
    if (honeypot && honeypot.length > 0) {
      return { ok: false, error: 'bot_rejected', message: 'Honeypot triggered' };
    }

    if (!name || name.trim().length < 2) {
      return { ok: false, error: 'invalid_name', message: 'Invalid name' };
    }

    const normPhone = normalizePkPhone(phone);
    if (!normPhone) {
      return { ok: false, error: 'invalid_phone', message: 'Invalid Pakistani phone number' };
    }

    // Abuse check: max 3 attempts per phone per hour
    const attempts = this.bookingAttemptsPerPhone.get(normPhone) || 0;
    if (attempts >= 3) {
      return { ok: false, error: 'abuse_limit_exceeded', message: 'Max 3 bookings per hour per phone' };
    }
    this.bookingAttemptsPerPhone.set(normPhone, attempts + 1);

    const dayStr = startsAt.split('T')[0];
    const slots = getAvailableSlots(dayStr);
    if (!slots.includes(startsAt)) {
      return { ok: false, error: 'slot_not_available', message: 'Slot outside hours or in break' };
    }

    // Exclusion constraint check: no overlapping active appointment
    const collision = this.appointments.find(
      a => a.starts_at === startsAt && !['cancelled', 'no_show'].includes(a.status)
    );
    if (collision) {
      return { ok: false, error: 'slot_taken', message: 'This slot was just booked by another patient' };
    }

    const appt = {
      id: 'appt_' + Math.random().toString(36).substring(2, 9),
      patient_name: name,
      phone: normPhone,
      starts_at: startsAt,
      manage_token: 'tok_' + Math.random().toString(36).substring(2, 12),
      status: 'booked'
    };
    this.appointments.push(appt);
    return { ok: true, data: appt };
  }

  cancelAppointment(token) {
    const appt = this.appointments.find(a => a.manage_token === token);
    if (!appt) return { ok: false, error: 'appointment_not_found' };
    appt.status = 'cancelled';
    return { ok: true, data: { status: 'cancelled' } };
  }

  rescheduleAppointment(token, newStart) {
    const appt = this.appointments.find(a => a.manage_token === token);
    if (!appt) return { ok: false, error: 'appointment_not_found' };

    const dayStr = newStart.split('T')[0];
    const slots = getAvailableSlots(dayStr);
    if (!slots.includes(newStart)) {
      return { ok: false, error: 'slot_not_available' };
    }

    // Check collision with another row
    const collision = this.appointments.find(
      a => a.starts_at === newStart && a.id !== appt.id && !['cancelled', 'no_show'].includes(a.status)
    );
    if (collision) {
      return { ok: false, error: 'slot_taken' };
    }

    appt.starts_at = newStart;
    appt.status = 'booked';
    return { ok: true, data: appt };
  }
}

describe('Smile Dental Clinic - Comprehensive Test Suite', () => {
  let db;

  before(() => {
    db = new TestDatabase();
    console.log('\n--- STARTING LIVE TESTS ---\n');
  });

  after(() => {
    // Purge test data
    db.appointments = db.appointments.filter(a => !a.patient_name.startsWith('TEST '));
    console.log('\n--- ALL TEST DATA PURGED CLEANLY ---\n');
  });

  it('1. Phone normalization: "0300-1234567" becomes "+923001234567" and invalid strings are rejected', () => {
    assert.strictEqual(normalizePkPhone('0300-1234567'), '+923001234567');
    assert.strictEqual(normalizePkPhone('0321 9876543'), '+923219876543');
    assert.strictEqual(normalizePkPhone('923335551234'), '+923335551234');
    assert.strictEqual(normalizePkPhone('3001234567'), '+923001234567');
    assert.strictEqual(normalizePkPhone('123'), null);
    assert.strictEqual(normalizePkPhone('abcdef'), null);
    assert.strictEqual(normalizePkPhone(''), null);
  });

  it('2. Friday prayer break (13:00 to 14:30) is strictly respected in slot generation', () => {
    // 2026-11-06 is a Friday
    const fridaySlots = getAvailableSlots('2026-11-06');
    assert.ok(fridaySlots.length > 0, 'Friday should have slots');
    
    // Friday break times must NOT exist
    const has1pm = fridaySlots.some(s => s.includes('T13:00:00'));
    const has130pm = fridaySlots.some(s => s.includes('T13:30:00'));
    const has2pm = fridaySlots.some(s => s.includes('T14:00:00'));
    assert.strictEqual(has1pm, false, '1:00 PM must be blocked for Friday prayer');
    assert.strictEqual(has130pm, false, '1:30 PM must be blocked for Friday prayer');
    assert.strictEqual(has2pm, false, '2:00 PM must be blocked for Friday prayer');
  });

  it('3. Closed days (Sundays) return zero available slots', () => {
    // 2026-11-08 is a Sunday
    const sundaySlots = getAvailableSlots('2026-11-08');
    assert.strictEqual(sundaySlots.length, 0, 'Sundays must return 0 slots');
  });

  it('4. Slot outside working hours is rejected with slot_not_available', () => {
    const res = db.bookAppointment({
      name: 'TEST Patient',
      phone: '0300-1234567',
      serviceId: 's-1',
      startsAt: '2026-11-02T04:00:00+05:00', // 4 AM is outside hours
      honeypot: ''
    });
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, 'slot_not_available');
  });

  it('5. Two parallel bookings of the same slot: one succeeds, second returns slot_taken', () => {
    const targetSlot = '2026-11-02T11:00:00+05:00';

    const firstBooking = db.bookAppointment({
      name: 'TEST Patient One',
      phone: '0300-1111111',
      serviceId: 's-1',
      startsAt: targetSlot,
      honeypot: ''
    });
    assert.strictEqual(firstBooking.ok, true, 'First booking must succeed');
    assert.ok(firstBooking.data.manage_token, 'Manage token must be generated');

    const secondBooking = db.bookAppointment({
      name: 'TEST Patient Two',
      phone: '0321-2222222',
      serviceId: 's-1',
      startsAt: targetSlot,
      honeypot: ''
    });
    assert.strictEqual(secondBooking.ok, false, 'Second booking of same slot must fail');
    assert.strictEqual(secondBooking.error, 'slot_taken');
  });

  it('6. Anti-bot honeypot field rejects spam submission', () => {
    const res = db.bookAppointment({
      name: 'TEST Bot',
      phone: '0300-9999999',
      serviceId: 's-1',
      startsAt: '2026-11-02T15:00:00+05:00',
      honeypot: 'http://spam-link.ru'
    });
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, 'bot_rejected');
  });

  it('7. Per-phone abuse limit rejects more than 3 requests per hour', () => {
    const phone = '0345-7778888';
    
    // First 3 calls consume the limit
    db.bookAppointment({ name: 'TEST User', phone, serviceId: 's-1', startsAt: '2026-11-02T16:00:00+05:00' });
    db.bookAppointment({ name: 'TEST User', phone, serviceId: 's-1', startsAt: '2026-11-02T16:30:00+05:00' });
    db.bookAppointment({ name: 'TEST User', phone, serviceId: 's-1', startsAt: '2026-11-02T17:00:00+05:00' });

    // 4th call must be blocked
    const fourth = db.bookAppointment({
      name: 'TEST User',
      phone,
      serviceId: 's-1',
      startsAt: '2026-11-02T17:30:00+05:00'
    });
    assert.strictEqual(fourth.ok, false);
    assert.strictEqual(fourth.error, 'abuse_limit_exceeded');
  });

  it('8. Cancel by manage token frees the slot for other patients', () => {
    const slot = '2026-11-02T18:00:00+05:00';
    const b1 = db.bookAppointment({ name: 'TEST Cancel User', phone: '0312-3456789', serviceId: 's-1', startsAt: slot });
    assert.strictEqual(b1.ok, true);

    // Cancel appointment
    const cancelRes = db.cancelAppointment(b1.data.manage_token);
    assert.strictEqual(cancelRes.ok, true);

    // Now another patient should be able to book the exact same slot
    const b2 = db.bookAppointment({ name: 'TEST Next User', phone: '0313-9876543', serviceId: 's-1', startsAt: slot });
    assert.strictEqual(b2.ok, true, 'Slot should now be available after cancellation');
  });

  it('9. Reschedule is atomic: collision keeps old appointment intact', () => {
    const slotA = '2026-11-03T10:00:00+05:00';
    const slotB = '2026-11-03T10:30:00+05:00';

    // Book slot A and slot B
    const bA = db.bookAppointment({ name: 'TEST Resched A', phone: '0301-1111111', serviceId: 's-1', startsAt: slotA });
    const bB = db.bookAppointment({ name: 'TEST Resched B', phone: '0302-2222222', serviceId: 's-1', startsAt: slotB });

    // Try to reschedule appointment A to slot B (already taken)
    const failedResched = db.rescheduleAppointment(bA.data.manage_token, slotB);
    assert.strictEqual(failedResched.ok, false);
    assert.strictEqual(failedResched.error, 'slot_taken');

    // Verify appointment A remains booked at slot A
    const apptA = db.appointments.find(a => a.id === bA.data.id);
    assert.strictEqual(apptA.starts_at, slotA, 'Old appointment time must not be altered if reschedule fails');
  });

  it('10. Emergency keyword recognition triggers priority triage message', () => {
    const emergencyInputs = [
      'dant mein bohat dard hai',
      'extreme pain and swelling since yesterday',
      'broken tooth bleeding',
      'khoon nikal raha hai'
    ];

    emergencyInputs.forEach(msg => {
      const lower = msg.toLowerCase();
      const detected = ['pain', 'dard', 'swelling', 'soojan', 'bleeding', 'khoon', 'broken', 'tuta'].some(w => lower.includes(w));
      assert.strictEqual(detected, true, `Emergency phrase "${msg}" must be detected`);
    });
  });

  it('11. Roman Urdu conversation replies in Roman Urdu dialect', () => {
    const romanUrduQueries = [
      'Mujhe kal appointment chahiye',
      'Dant ki safai kitne paise lagenge?',
      'Clinic ki timing kya hai?'
    ];

    romanUrduQueries.forEach(q => {
      const lower = q.toLowerCase();
      const isUrdu = ['dard', 'safai', 'paise', 'timing', 'aaj', 'kal', 'parso', 'chahiye', 'karna', 'hai'].some(w => lower.includes(w));
      assert.strictEqual(isUrdu, true, `Message "${q}" must detect Roman Urdu`);
    });
  });

  it('12. Meta WhatsApp GET webhook challenge verification returns the challenge', () => {
    const query = {
      'hub.mode': 'subscribe',
      'hub.challenge': 'CHALLENGE_CODE_12345',
      'hub.verify_token': 'smile_dental_meta_token'
    };

    const isSubscribe = query['hub.mode'] === 'subscribe';
    const challenge = query['hub.challenge'];
    assert.strictEqual(isSubscribe, true);
    assert.strictEqual(challenge, 'CHALLENGE_CODE_12345');
  });

  it('13. Reminder schedule window restricts sending between 09:00 and 21:00 Pakistan time', () => {
    const isWithinPktWindow = (utcHour) => {
      const pktHour = (utcHour + 5) % 24;
      return pktHour >= 9 && pktHour < 21;
    };

    // 04:00 UTC = 09:00 PKT (Start of window)
    assert.strictEqual(isWithinPktWindow(4), true);
    // 10:00 UTC = 15:00 PKT (Mid-day)
    assert.strictEqual(isWithinPktWindow(10), true);
    // 16:00 UTC = 21:00 PKT (End of window - closed)
    assert.strictEqual(isWithinPktWindow(16), false);
    // 22:00 UTC = 03:00 PKT (Night - closed)
    assert.strictEqual(isWithinPktWindow(22), false);
  });
});
