-- ====================================================================
-- SMILE DENTAL CLINIC - SCHEMA CHANGES
-- Instructions: Run this in Supabase SQL Editor after running schema.sql
-- ====================================================================

-- 1. Add google_event_id and review_request_sent_at columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS review_request_sent_at TIMESTAMPTZ;

-- 2. Atomic Reschedule Function
-- In ONE transaction, validates slot availability, ensures no collision,
-- and moves appointment to new time. If validation or booking fails,
-- no changes are committed and old appointment remains intact.
CREATE OR REPLACE FUNCTION reschedule_appointment(
    p_token TEXT,
    p_new_start TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
    v_appt appointments%ROWTYPE;
    v_duration INTEGER;
    v_new_ends_at TIMESTAMPTZ;
    v_day DATE;
    v_slot_valid BOOLEAN := FALSE;
BEGIN
    -- 1. Find existing appointment by token
    SELECT * INTO v_appt FROM appointments WHERE manage_token = p_token;
    IF v_appt.id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'appointment_not_found', 'message', 'Invalid appointment manage token.');
    END IF;

    -- Completed or cancelled appointments cannot be rescheduled
    IF v_appt.status IN ('cancelled', 'completed') THEN
        RETURN jsonb_build_object('ok', false, 'error', 'invalid_status', 'message', 'This appointment cannot be rescheduled because it is already ' || v_appt.status || '.');
    END IF;

    -- 2. Lookup service duration
    SELECT duration_min INTO v_duration FROM services WHERE id = v_appt.service_id AND is_active = TRUE;
    IF v_duration IS NULL OR v_duration <= 0 THEN
        v_duration := 30;
    END IF;

    v_new_ends_at := p_new_start + (v_duration || ' minutes')::INTERVAL;
    v_day := (p_new_start AT TIME ZONE 'Asia/Karachi')::DATE;

    -- 3. Check slot availability against doctor working hours and breaks
    SELECT TRUE INTO v_slot_valid
    FROM get_available_slots(v_day, v_appt.service_id)
    WHERE slot_start = p_new_start;

    IF v_slot_valid IS NOT TRUE THEN
        RETURN jsonb_build_object('ok', false, 'error', 'slot_not_available', 'message', 'The requested slot falls outside clinic hours, break time, or is in the past.');
    END IF;

    -- 4. Check for overlapping appointment (excluding this one)
    IF EXISTS (
        SELECT 1 FROM appointments
        WHERE status NOT IN ('cancelled', 'no_show')
          AND id != v_appt.id
          AND tstzrange(starts_at, ends_at) && tstzrange(p_new_start, v_new_ends_at)
    ) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'slot_taken', 'message', 'This slot was just booked by another patient. Please pick another time.');
    END IF;

    -- 5. Atomic Update: Shift appointment to new time & reset reminder flag
    UPDATE appointments
    SET starts_at = p_new_start,
        ends_at = v_new_ends_at,
        status = 'booked',
        reminder_sent_at = NULL,
        updated_at = TIMEZONE('Asia/Karachi', NOW())
    WHERE id = v_appt.id;

    RETURN jsonb_build_object(
        'ok', true,
        'appointment_id', v_appt.id,
        'manage_token', v_appt.manage_token,
        'starts_at', p_new_start,
        'ends_at', v_new_ends_at,
        'status', 'booked'
    );
EXCEPTION
    WHEN exclusion_violation THEN
        RETURN jsonb_build_object('ok', false, 'error', 'slot_taken', 'message', 'This slot was just booked by another patient.');
    WHEN OTHERS THEN
        RETURN jsonb_build_object('ok', false, 'error', 'db_error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Make get_available_slots SECURITY DEFINER
-- This allows unauthenticated public patients to query available slots while
-- respecting Row Level Security on the appointments table (filtering out booked slots).
CREATE OR REPLACE FUNCTION get_available_slots(p_day DATE, p_service_id UUID)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    slot_start_pkt TEXT
) AS $$
DECLARE
    v_dow INTEGER;
    v_open TIME;
    v_close TIME;
    v_is_closed BOOLEAN;
    v_break_start TIME;
    v_break_end TIME;
    v_duration INTEGER;
    v_cursor TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
    v_now_pkt TIMESTAMPTZ;
BEGIN
    -- Check if whole day is off
    IF EXISTS (SELECT 1 FROM days_off WHERE date = p_day) THEN
        RETURN;
    END IF;

    -- Get service duration
    SELECT duration_min INTO v_duration FROM services WHERE id = p_service_id AND is_active = TRUE;
    IF v_duration IS NULL OR v_duration <= 0 THEN
        v_duration := 30;
    END IF;

    -- 0=Sun, 1=Mon, ..., 6=Sat
    v_dow := EXTRACT(DOW FROM p_day);

    -- Get working hours
    SELECT open_time, close_time, is_closed, break_start, break_end
    INTO v_open, v_close, v_is_closed, v_break_start, v_break_end
    FROM working_hours
    WHERE day_of_week = v_dow;

    IF v_is_closed IS TRUE OR v_open IS NULL THEN
        RETURN;
    END IF;

    -- Current time in Pakistan
    v_now_pkt := TIMEZONE('Asia/Karachi', NOW());

    -- Create start and end timestamps in Asia/Karachi
    v_cursor := (p_day || ' ' || v_open)::TIMESTAMP AT TIME ZONE 'Asia/Karachi';
    v_end_time := (p_day || ' ' || v_close)::TIMESTAMP AT TIME ZONE 'Asia/Karachi';

    -- Generate slots
    WHILE v_cursor + (v_duration || ' minutes')::INTERVAL <= v_end_time LOOP
        DECLARE
            v_slot_finish TIMESTAMPTZ := v_cursor + (v_duration || ' minutes')::INTERVAL;
            v_slot_time_only TIME := (v_cursor AT TIME ZONE 'Asia/Karachi')::TIME;
            v_slot_finish_time TIME := (v_slot_finish AT TIME ZONE 'Asia/Karachi')::TIME;
            v_in_break BOOLEAN := FALSE;
            v_is_taken BOOLEAN := FALSE;
        BEGIN
            -- Check break period (e.g. Friday prayer)
            IF v_break_start IS NOT NULL AND v_break_end IS NOT NULL THEN
                IF (v_slot_time_only < v_break_end AND v_slot_finish_time > v_break_start) THEN
                    v_in_break := TRUE;
                END IF;
            END IF;

            -- Check if slot is in the past
            IF v_cursor <= v_now_pkt THEN
                v_in_break := TRUE;
            END IF;

            -- Check overlapping existing appointments (excludes cancelled / no_show)
            IF NOT v_in_break THEN
                IF EXISTS (
                    SELECT 1 FROM appointments
                    WHERE status NOT IN ('cancelled', 'no_show')
                      AND tstzrange(starts_at, ends_at) && tstzrange(v_cursor, v_slot_finish)
                ) THEN
                    v_is_taken := TRUE;
                END IF;
            END IF;

            -- Return available slot
            IF NOT v_in_break AND NOT v_is_taken THEN
                slot_start := v_cursor;
                slot_end := v_slot_finish;
                slot_start_pkt := to_char(v_cursor AT TIME ZONE 'Asia/Karachi', 'HH12:MI AM');
                RETURN NEXT;
            END IF;
        END;

        -- Step forward by duration
        v_cursor := v_cursor + (v_duration || ' minutes')::INTERVAL;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION get_available_slots(DATE, UUID) TO anon, authenticated, service_role;

-- 4. Secure Read of Appointment by Manage Token for Public Self-Service
CREATE OR REPLACE FUNCTION get_appointment_by_token(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
    v_appt appointments%ROWTYPE;
    v_patient patients%ROWTYPE;
    v_service services%ROWTYPE;
BEGIN
    SELECT * INTO v_appt FROM appointments WHERE manage_token = p_token;
    IF v_appt.id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Appointment not found.');
    END IF;

    SELECT * INTO v_patient FROM patients WHERE id = v_appt.patient_id;
    SELECT * INTO v_service FROM services WHERE id = v_appt.service_id;

    RETURN jsonb_build_object(
        'ok', true,
        'data', jsonb_build_object(
            'appointment_id', v_appt.id,
            'manage_token', v_appt.manage_token,
            'starts_at', v_appt.starts_at,
            'ends_at', v_appt.ends_at,
            'status', v_appt.status,
            'source', v_appt.source,
            'reason', v_appt.reason,
            'patient_name', COALESCE(v_patient.full_name, 'Patient'),
            'phone', COALESCE(v_patient.phone, ''),
            'service_name', COALESCE(v_service.name_en, 'Dental Treatment'),
            'service_id', v_appt.service_id,
            'doctor_name', 'Dr. Zeeshan Ahmad',
            'clinic_address', 'Plot 14-B, Sector F-7 Markaz, Islamabad'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION get_appointment_by_token(TEXT) TO anon, authenticated, service_role;

-- 5. Cancellation by Manage Token
CREATE OR REPLACE FUNCTION cancel_appointment_by_token(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
    v_id UUID;
BEGIN
    UPDATE appointments
    SET status = 'cancelled',
        updated_at = TIMEZONE('Asia/Karachi', NOW())
    WHERE manage_token = p_token
      AND status NOT IN ('cancelled', 'completed')
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Appointment not found or already completed/cancelled.');
    END IF;

    RETURN jsonb_build_object('ok', true, 'status', 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION cancel_appointment_by_token(TEXT) TO anon, authenticated, service_role;


