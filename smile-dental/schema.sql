-- ====================================================================
-- SMILE DENTAL CLINIC - POSTGRESQL SCHEMA (Supabase)
-- Single Clinic, Single Doctor, Asia/Karachi (PKT, UTC+5)
-- Source of Truth: smile-dental/schema.sql (Do not edit directly)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- --------------------------------------------------------------------
-- 1. CLINIC PROFILE (Strictly 1 Row)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinic (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Smile Dental Clinic',
    tagline TEXT DEFAULT 'A healthier smile. A more confident you.',
    phone TEXT NOT NULL DEFAULT '+923001234567',
    whatsapp_number TEXT NOT NULL DEFAULT '+923001234567',
    address TEXT NOT NULL DEFAULT 'Plot 14-B, Sector F-7 Markaz, Islamabad, Pakistan',
    google_map_url TEXT DEFAULT 'https://maps.google.com/?q=Smile+Dental+Clinic+Islamabad',
    google_review_url TEXT DEFAULT 'https://search.google.com/local/writereview?placeid=ChIJsmile_dental',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW())
);

-- --------------------------------------------------------------------
-- 2. DOCTOR PROFILE (Strictly 1 Row)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL DEFAULT 'Dr. Zeeshan Ahmad',
    title TEXT NOT NULL DEFAULT 'Principal Dental Surgeon',
    qualifications TEXT NOT NULL DEFAULT 'BDS, RDS (Gold Medalist), C-Implants',
    bio TEXT NOT NULL DEFAULT 'Specializing in painless restorative dentistry, precision endodontics, and modern smile makeovers with patient-first clinical care.',
    photo_url TEXT DEFAULT '/images/doctor-portrait.png',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW())
);

-- --------------------------------------------------------------------
-- 3. SERVICES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en TEXT NOT NULL,
    name_roman TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_roman TEXT NOT NULL,
    duration_min INTEGER NOT NULL DEFAULT 30 CHECK (duration_min > 0),
    price_from_pkr INTEGER CHECK (price_from_pkr >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW())
);

-- --------------------------------------------------------------------
-- 4. WORKING HOURS & BREAKS (Per Weekday: 0=Sun, 1=Mon, ..., 6=Sat)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6) UNIQUE,
    open_time TIME NOT NULL DEFAULT '10:00:00',
    close_time TIME NOT NULL DEFAULT '20:00:00',
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    break_start TIME,
    break_end TIME,
    CONSTRAINT valid_break CHECK (
        (break_start IS NULL AND break_end IS NULL) OR
        (break_start IS NOT NULL AND break_end IS NOT NULL AND break_start < break_end)
    ),
    CONSTRAINT valid_hours CHECK (open_time < close_time)
);

-- --------------------------------------------------------------------
-- 5. DAYS OFF (Eid, Leave, Holidays)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS days_off (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW())
);

-- --------------------------------------------------------------------
-- 6. PATIENTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'roman_ur')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW())
);

-- --------------------------------------------------------------------
-- 7. APPOINTMENTS (Single Doctor - Hard Exclusion Constraint)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'completed', 'cancelled', 'no_show')),
    source TEXT NOT NULL DEFAULT 'website' CHECK (source IN ('website', 'whatsapp', 'call', 'admin')),
    reason TEXT,
    is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
    manage_token TEXT NOT NULL UNIQUE,
    reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW()),
    CONSTRAINT valid_appointment_time CHECK (starts_at < ends_at),
    -- Hard database constraint preventing overlapping active appointments for the single doctor
    CONSTRAINT no_doctor_double_booking EXCLUDE USING gist (
        tstzrange(starts_at, ends_at) WITH &&
    ) WHERE (status NOT IN ('cancelled', 'no_show'))
);

-- --------------------------------------------------------------------
-- 8. CHAT SESSIONS (Web & WhatsApp State Machine)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel TEXT NOT NULL CHECK (channel IN ('web', 'whatsapp')),
    contact_key TEXT NOT NULL, -- session_id for web, phone number for whatsapp
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'roman_ur')),
    step TEXT NOT NULL DEFAULT 'start',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW()),
    CONSTRAINT unique_channel_contact UNIQUE (channel, contact_key)
);

-- --------------------------------------------------------------------
-- 9. MISSED CALLS (Sub-60s Recovery)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS missed_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'recovered', 'ignored')),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW())
);

-- --------------------------------------------------------------------
-- 10. REVIEWS (Moderated - Published Only After Admin Approval)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW())
);

-- --------------------------------------------------------------------
-- 11. ADMINS (Clinic Staff Authentication)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('doctor', 'staff', 'owner')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', NOW())
);

-- ====================================================================
-- BUSINESS LOGIC FUNCTIONS & VIEWS
-- ====================================================================

-- --------------------------------------------------------------------
-- A. Normalize Pakistani Phone Numbers (+923XXXXXXXXX)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION normalize_pk_phone(p_phone TEXT)
RETURNS TEXT AS $$
DECLARE
    clean TEXT;
BEGIN
    IF p_phone IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Strip non-digit characters
    clean := regexp_replace(p_phone, '\D', '', 'g');
    
    -- Format: 03001234567 (11 digits starting with 03) -> +923001234567
    IF length(clean) = 11 AND clean ~ '^03[0-9]{9}$' THEN
        RETURN '+92' || substr(clean, 2);
    END IF;

    -- Format: 923001234567 (12 digits starting with 923) -> +923001234567
    IF length(clean) = 12 AND clean ~ '^923[0-9]{9}$' THEN
        RETURN '+' || clean;
    END IF;

    -- Format: 3001234567 (10 digits starting with 3) -> +923001234567
    IF length(clean) = 10 AND clean ~ '^3[0-9]{9}$' THEN
        RETURN '+92' || clean;
    END IF;

    -- Return invalid if format cannot be cleanly resolved
    RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- --------------------------------------------------------------------
-- B. Get Available Slots for a given Date and Service (Asia/Karachi)
-- --------------------------------------------------------------------
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
        v_duration := 30; -- fallback default
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

            -- Check overlapping existing appointments
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
$$ LANGUAGE plpgsql STABLE;

-- --------------------------------------------------------------------
-- C. Book Appointment (Atomic Transaction, Service Role Only)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION book_appointment(
    p_name TEXT,
    p_phone TEXT,
    p_service_id UUID,
    p_starts_at TIMESTAMPTZ,
    p_source TEXT DEFAULT 'website',
    p_reason TEXT DEFAULT NULL,
    p_is_emergency BOOLEAN DEFAULT FALSE,
    p_language TEXT DEFAULT 'en'
)
RETURNS JSONB AS $$
DECLARE
    v_norm_phone TEXT;
    v_patient_id UUID;
    v_duration INTEGER;
    v_ends_at TIMESTAMPTZ;
    v_slot_valid BOOLEAN := FALSE;
    v_token TEXT;
    v_appointment_id UUID;
    v_day DATE;
BEGIN
    -- 1. Validate Full Name
    IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'invalid_name', 'message', 'Please provide a valid full name.');
    END IF;

    -- 2. Validate & Normalize Phone Number
    v_norm_phone := normalize_pk_phone(p_phone);
    IF v_norm_phone IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'invalid_phone', 'message', 'Please enter a valid Pakistani phone number (e.g. 0300 1234567).');
    END IF;

    -- 3. Validate Service
    SELECT duration_min INTO v_duration FROM services WHERE id = p_service_id AND is_active = TRUE;
    IF v_duration IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'unknown_service', 'message', 'Selected service does not exist or is inactive.');
    END IF;

    v_ends_at := p_starts_at + (v_duration || ' minutes')::INTERVAL;
    v_day := (p_starts_at AT TIME ZONE 'Asia/Karachi')::DATE;

    -- 4. Validate Slot Availability against schedule
    SELECT TRUE INTO v_slot_valid
    FROM get_available_slots(v_day, p_service_id)
    WHERE slot_start = p_starts_at;

    IF v_slot_valid IS NOT TRUE THEN
        RETURN jsonb_build_object('ok', false, 'error', 'slot_not_available', 'message', 'The requested slot falls outside clinic hours or breaks.');
    END IF;

    -- 5. Check if slot taken (concurrency / race condition check)
    IF EXISTS (
        SELECT 1 FROM appointments
        WHERE status NOT IN ('cancelled', 'no_show')
          AND tstzrange(starts_at, ends_at) && tstzrange(p_starts_at, v_ends_at)
    ) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'slot_taken', 'message', 'This slot was just booked by another patient. Please pick another time.');
    END IF;

    -- 6. Upsert Patient
    SELECT id INTO v_patient_id FROM patients WHERE phone = v_norm_phone;
    IF v_patient_id IS NULL THEN
        INSERT INTO patients (full_name, phone, language)
        VALUES (trim(p_name), v_norm_phone, COALESCE(p_language, 'en'))
        RETURNING id INTO v_patient_id;
    ELSE
        UPDATE patients
        SET full_name = trim(p_name),
            language = COALESCE(p_language, language),
            updated_at = TIMEZONE('Asia/Karachi', NOW())
        WHERE id = v_patient_id;
    END IF;

    -- 7. Generate Random Manage Token
    v_token := encode(gen_random_bytes(16), 'hex');

    -- 8. Insert Appointment
    BEGIN
        INSERT INTO appointments (
            patient_id, service_id, starts_at, ends_at, status, source,
            reason, is_emergency, manage_token
        ) VALUES (
            v_patient_id, p_service_id, p_starts_at, v_ends_at, 'booked', COALESCE(p_source, 'website'),
            p_reason, COALESCE(p_is_emergency, FALSE), v_token
        ) RETURNING id INTO v_appointment_id;
    EXCEPTION
        WHEN exclusion_violation THEN
            RETURN jsonb_build_object('ok', false, 'error', 'slot_taken', 'message', 'This slot was just booked by another patient.');
    END;

    -- 9. Return Successful JSON
    RETURN jsonb_build_object(
        'ok', true,
        'appointment_id', v_appointment_id,
        'patient_id', v_patient_id,
        'manage_token', v_token,
        'starts_at', p_starts_at,
        'ends_at', v_ends_at,
        'patient_name', trim(p_name),
        'phone', v_norm_phone
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- VIEWS FOR ADMIN ANALYTICS
-- ====================================================================

CREATE OR REPLACE VIEW v_stats_daily AS
SELECT
    (starts_at AT TIME ZONE 'Asia/Karachi')::DATE AS day,
    COUNT(*) AS total_appointments,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed,
    COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
    COUNT(*) FILTER (WHERE status = 'no_show') AS no_show,
    COUNT(*) FILTER (WHERE is_emergency = TRUE) AS emergency_count
FROM appointments
GROUP BY (starts_at AT TIME ZONE 'Asia/Karachi')::DATE
ORDER BY day DESC;

CREATE OR REPLACE VIEW v_new_patients_daily AS
SELECT
    (created_at AT TIME ZONE 'Asia/Karachi')::DATE AS day,
    COUNT(*) AS new_patients_count
FROM patients
GROUP BY (created_at AT TIME ZONE 'Asia/Karachi')::DATE
ORDER BY day DESC;

CREATE OR REPLACE VIEW v_missed_calls_daily AS
SELECT
    (created_at AT TIME ZONE 'Asia/Karachi')::DATE AS day,
    COUNT(*) AS total_missed,
    COUNT(*) FILTER (WHERE status = 'recovered') AS recovered_count
FROM missed_calls
GROUP BY (created_at AT TIME ZONE 'Asia/Karachi')::DATE
ORDER BY day DESC;

CREATE OR REPLACE VIEW v_top_services AS
SELECT
    s.id AS service_id,
    s.name_en AS service_name,
    COUNT(a.id) AS total_booked,
    COUNT(a.id) FILTER (WHERE a.status = 'completed') AS total_completed
FROM services s
LEFT JOIN appointments a ON s.id = a.service_id
GROUP BY s.id, s.name_en
ORDER BY total_booked DESC;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE clinic ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE days_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE missed_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public can read clinic, doctor, active services, working hours, days off, and published reviews
CREATE POLICY "Public read clinic" ON clinic FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read doctor" ON doctor FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read services" ON services FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "Public read working_hours" ON working_hours FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read days_off" ON days_off FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read published reviews" ON reviews FOR SELECT TO anon, authenticated USING (is_published = TRUE);

-- Helper function: is current user an approved admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins full access
CREATE POLICY "Admin full access clinic" ON clinic FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin full access doctor" ON doctor FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin full access services" ON services FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin full access working_hours" ON working_hours FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin full access days_off" ON days_off FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin full access reviews" ON reviews FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin full access patients" ON patients FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin full access appointments" ON appointments FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin full access missed_calls" ON missed_calls FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin read self admin" ON admins FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Realtime publication for appointments
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- ====================================================================
-- BASELINE SEED DATA
-- ====================================================================

INSERT INTO clinic (name, tagline, phone, whatsapp_number, address, google_map_url, google_review_url)
VALUES (
    'Smile Dental Clinic',
    'A healthier smile. A more confident you.',
    '+923001234567',
    '+923001234567',
    'Plot 14-B, Sector F-7 Markaz, Islamabad, Pakistan',
    'https://maps.google.com/?q=Smile+Dental+Clinic+Islamabad',
    'https://search.google.com/local/writereview?placeid=ChIJsmile_dental'
) ON CONFLICT DO NOTHING;

INSERT INTO doctor (full_name, title, qualifications, bio, photo_url)
VALUES (
    'Dr. Zeeshan Ahmad',
    'Principal Dental Surgeon',
    'BDS, RDS (Gold Medalist), C-Implants',
    'Dedicated to gentle, modern dental treatments with 12+ years of clinical excellence in restorative care, painless extractions, and cosmetic dentistry.',
    '/images/doctor.png'
) ON CONFLICT DO NOTHING;

-- Standard Weekday Working Hours (Mon - Sat 10:00 to 20:00, Friday prayer break 13:00 to 14:30, Sunday closed)
INSERT INTO working_hours (day_of_week, open_time, close_time, is_closed, break_start, break_end) VALUES
(1, '10:00:00', '20:00:00', FALSE, NULL, NULL), -- Monday
(2, '10:00:00', '20:00:00', FALSE, NULL, NULL), -- Tuesday
(3, '10:00:00', '20:00:00', FALSE, NULL, NULL), -- Wednesday
(4, '10:00:00', '20:00:00', FALSE, NULL, NULL), -- Thursday
(5, '10:00:00', '20:00:00', FALSE, '13:00:00', '14:30:00'), -- Friday (Prayer break)
(6, '10:00:00', '18:00:00', FALSE, NULL, NULL), -- Saturday
(0, '10:00:00', '14:00:00', TRUE, NULL, NULL)   -- Sunday (Closed)
ON CONFLICT (day_of_week) DO NOTHING;

-- Standard Dental Services
INSERT INTO services (name_en, name_roman, description_en, description_roman, duration_min, price_from_pkr, is_active, display_order) VALUES
('Dental Checkup & Consultation', 'Checkup aur Mashwara', 'Complete oral examination, digital assessment, and tailored treatment planning.', 'Danton ka mukammal muaina aur tasalli bakhsh mashwara.', 30, 2000, TRUE, 1),
('Ultrasonic Scaling & Polishing', 'Danton Ki Safai (Scaling)', 'Painless ultrasonic plaque and tartar removal for healthy gums and fresh breath.', 'Danton aur masooron ki gehrai se safai aur chamak.', 45, 5000, TRUE, 2),
('Composite Tooth Filling', 'Dant Ki Filling', 'Color-matched, natural-looking composite resin filling for cavities and chips.', 'Kharab ya toote hue dant ki qudrati rangat wali filling.', 30, 4500, TRUE, 3),
('Painless Root Canal Treatment', 'Root Canal Treatment (RCT)', 'Advanced rotary endodontics to relieve acute pain and save infected teeth.', 'Dant ke shadeed dard ka mukammal aur be-dard ilaaj.', 60, 12000, TRUE, 4),
('Teeth Whitening', 'Danton Ki Whitening', 'Professional LED laser whitening to safely brighten stained or discolored teeth.', 'Chand lamhon mein danton ko chamakdar aur safaid banayein.', 45, 18000, TRUE, 5),
('Tooth Extraction', 'Dant Nikalna', 'Gentle, minimally invasive tooth extraction with local anesthesia.', 'Shadeed kharab dant ko be-dard tareeqay se alag karna.', 30, 4000, TRUE, 6)
ON CONFLICT DO NOTHING;
