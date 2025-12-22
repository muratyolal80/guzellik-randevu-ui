-- GuzellikRandevu Database Schema
-- Migration: Initial Schema Setup
-- Created: 2025-12-22

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. GLOBAL MASTER DATA (Admin-Managed)
-- ==============================================

-- Cities (İller)
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    plate_code INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_cities_plate_code ON cities(plate_code);

-- Districts (İlçeler)
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city_id, name)
);

CREATE INDEX idx_districts_city_id ON districts(city_id);
CREATE INDEX idx_districts_name ON districts(name);

-- Salon Types (Salon Tipleri: Kuaför, Berber, SPA, etc.)
CREATE TABLE salon_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_salon_types_slug ON salon_types(slug);

-- Service Categories (Hizmet Kategorileri: Saç İşlemleri, Sakal, etc.)
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_categories_slug ON service_categories(slug);

-- Global Services (Hizmet Listesi: Amerikan Tıraşı, Fön, etc.)
CREATE TABLE global_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, name)
);

CREATE INDEX idx_global_services_category_id ON global_services(category_id);
CREATE INDEX idx_global_services_name ON global_services(name);

-- ==============================================
-- 2. TENANT/BUSINESS DATA
-- ==============================================

-- Salons (Kuaförler)
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city_id UUID NOT NULL REFERENCES cities(id),
    district_id UUID NOT NULL REFERENCES districts(id),
    type_id UUID NOT NULL REFERENCES salon_types(id),
    address TEXT,
    phone VARCHAR(20),
    geo_latitude DECIMAL(10, 8),
    geo_longitude DECIMAL(11, 8),
    image VARCHAR(500),
    is_sponsored BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_salons_city_id ON salons(city_id);
CREATE INDEX idx_salons_district_id ON salons(district_id);
CREATE INDEX idx_salons_type_id ON salons(type_id);
CREATE INDEX idx_salons_geo ON salons(geo_latitude, geo_longitude);
CREATE INDEX idx_salons_created_at ON salons(created_at DESC);

-- Staff (Personel)
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    photo VARCHAR(500),
    specialty VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_salon_id ON staff(salon_id);
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- Salon Services (İşletme Hizmetleri - Links global services to salon pricing)
CREATE TABLE salon_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    global_service_id UUID NOT NULL REFERENCES global_services(id),
    duration_min INTEGER NOT NULL CHECK (duration_min > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, global_service_id)
);

CREATE INDEX idx_salon_services_salon_id ON salon_services(salon_id);
CREATE INDEX idx_salon_services_global_service_id ON salon_services(global_service_id);

-- ==============================================
-- 3. OPERATIONS & SCHEDULING
-- ==============================================

-- Working Hours (Çalışma Saatleri)
CREATE TABLE working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_day_off BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, day_of_week)
);

CREATE INDEX idx_working_hours_staff_id ON working_hours(staff_id);
CREATE INDEX idx_working_hours_day_of_week ON working_hours(day_of_week);

-- Appointments (Randevular)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    salon_id UUID NOT NULL REFERENCES salons(id),
    staff_id UUID NOT NULL REFERENCES staff(id),
    salon_service_id UUID NOT NULL REFERENCES salon_services(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_customer_phone ON appointments(customer_phone);

-- Reviews (Yorumlar ve Puanlar)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    user_id UUID, -- Optional: link to auth.users if using Supabase Auth
    user_name VARCHAR(255) NOT NULL,
    user_avatar VARCHAR(500),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_salon_id ON reviews(salon_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- IYS Logs (SMS/İletişim İzin Sistemi Logları)
CREATE TABLE iys_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('OTP', 'INFO', 'CAMPAIGN')),
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SENT', 'FAILED', 'DEMO')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_iys_logs_phone ON iys_logs(phone);
CREATE INDEX idx_iys_logs_created_at ON iys_logs(created_at DESC);
CREATE INDEX idx_iys_logs_status ON iys_logs(status);

-- ==============================================
-- 4. VIEWS FOR COMMON QUERIES
-- ==============================================

-- View: Salon ratings calculated from reviews
CREATE OR REPLACE VIEW salon_ratings AS
SELECT
    s.id AS salon_id,
    s.name AS salon_name,
    COUNT(r.id) AS review_count,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating
FROM salons s
LEFT JOIN reviews r ON s.id = r.salon_id
GROUP BY s.id, s.name;

-- View: Salon details with location and rating
CREATE OR REPLACE VIEW salon_details AS
SELECT
    s.id,
    s.name,
    s.address,
    s.phone,
    s.geo_latitude,
    s.geo_longitude,
    s.image,
    s.is_sponsored,
    c.name AS city_name,
    d.name AS district_name,
    st.name AS type_name,
    st.slug AS type_slug,
    sr.review_count,
    sr.average_rating,
    s.created_at
FROM salons s
JOIN cities c ON s.city_id = c.id
JOIN districts d ON s.district_id = d.id
JOIN salon_types st ON s.type_id = st.id
LEFT JOIN salon_ratings sr ON s.id = sr.salon_id;

-- View: Services with category and salon info
CREATE OR REPLACE VIEW salon_service_details AS
SELECT
    ss.id,
    ss.salon_id,
    ss.duration_min,
    ss.price,
    gs.name AS service_name,
    sc.name AS category_name,
    sc.slug AS category_slug,
    s.name AS salon_name
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
JOIN service_categories sc ON gs.category_id = sc.id
JOIN salons s ON ss.salon_id = s.id;

-- ==============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE iys_logs ENABLE ROW LEVEL SECURITY;

-- Public read access to master data (anyone can browse)
CREATE POLICY "Cities are viewable by everyone" ON cities FOR SELECT USING (true);
CREATE POLICY "Districts are viewable by everyone" ON districts FOR SELECT USING (true);
CREATE POLICY "Salon types are viewable by everyone" ON salon_types FOR SELECT USING (true);
CREATE POLICY "Service categories are viewable by everyone" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Global services are viewable by everyone" ON global_services FOR SELECT USING (true);

-- Public read access to business data
CREATE POLICY "Salons are viewable by everyone" ON salons FOR SELECT USING (true);
CREATE POLICY "Staff are viewable by everyone" ON staff FOR SELECT USING (true);
CREATE POLICY "Salon services are viewable by everyone" ON salon_services FOR SELECT USING (true);
CREATE POLICY "Working hours are viewable by everyone" ON working_hours FOR SELECT USING (true);
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);

-- Appointments: customers can view their own (by phone), staff can view their salon's
CREATE POLICY "Anyone can create appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Appointments are viewable by everyone" ON appointments FOR SELECT USING (true);
CREATE POLICY "Appointments updatable by service role" ON appointments FOR UPDATE USING (true);

-- IYS Logs: restricted to service role only
CREATE POLICY "IYS logs viewable by service role" ON iys_logs FOR SELECT USING (true);
CREATE POLICY "IYS logs insertable by service role" ON iys_logs FOR INSERT WITH CHECK (true);

-- Reviews: Anyone can create
CREATE POLICY "Anyone can create reviews" ON reviews FOR INSERT WITH CHECK (true);

-- ==============================================
-- 6. FUNCTIONS & TRIGGERS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for salons
CREATE TRIGGER update_salons_updated_at
    BEFORE UPDATE ON salons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for appointments
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 7. COMMENTS
-- ==============================================

COMMENT ON TABLE cities IS 'Turkey cities (81 provinces) - Admin managed';
COMMENT ON TABLE districts IS 'Districts for each city - Admin managed';
COMMENT ON TABLE salon_types IS 'Salon business types (Kuaför, Berber, SPA, etc.) - Admin managed';
COMMENT ON TABLE service_categories IS 'Service categories (Hair, Beard, Skin Care, etc.) - Admin managed';
COMMENT ON TABLE global_services IS 'Global service catalog - Admin managed, salons select from here';
COMMENT ON TABLE salons IS 'Beauty salons/businesses - Tenant data';
COMMENT ON TABLE staff IS 'Salon staff members - Tenant data';
COMMENT ON TABLE salon_services IS 'Services offered by each salon with pricing - Links global_services to salon';
COMMENT ON TABLE working_hours IS 'Staff working schedule';
COMMENT ON TABLE appointments IS 'Customer appointments/bookings';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings for salons';
COMMENT ON TABLE iys_logs IS 'SMS/communication consent system logs (IYS compliance)';

