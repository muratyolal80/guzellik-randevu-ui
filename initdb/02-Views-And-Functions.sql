-- 02-Views-And-Functions.sql
-- Auto-generated from sequential migrations

-- From New-04-Functions.sql --
-- Functions
SET check_function_bodies = false;

CREATE FUNCTION public.check_is_salon_owner(p_salon_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.salon_memberships 
        WHERE salon_id = p_salon_id 
        AND user_id = p_user_id 
        AND role = 'OWNER'
        AND is_active = true
    );
END;
$$;

CREATE FUNCTION public.cleanup_expired_otps() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM public.otp_codes
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$;

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_role public.user_role;
    v_first_name TEXT;
    v_last_name TEXT;
    v_full_name TEXT;
BEGIN
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    v_full_name := NEW.raw_user_meta_data->>'full_name';
    
    -- Improved Name Logic
    IF v_first_name IS NULL AND v_full_name IS NOT NULL THEN
        v_first_name := split_part(v_full_name, ' ', 1);
        v_last_name := substr(v_full_name, length(v_first_name) + 2);
    END IF;
    
    -- Role Protection Logic
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'CUSTOMER'::public.user_role);
    
    IF v_role = 'SUPER_ADMIN' THEN
        v_role := 'CUSTOMER'::public.user_role;
    END IF;

    -- Upsert Profile
    INSERT INTO public.profiles (id, email, first_name, last_name, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        v_first_name,
        v_last_name,
        COALESCE(v_full_name, v_first_name || ' ' || v_last_name),
        v_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
        last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name),
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        role = COALESCE(public.profiles.role, EXCLUDED.role),
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

CREATE FUNCTION public.handle_new_user_role_protection() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Force role to 'CUSTOMER' if it's not already set via a secure process.
    IF NEW.raw_user_meta_data->>'role' IS NULL THEN
        NEW.raw_user_meta_data = jsonb_set(
            COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
            '{role}',
            '"CUSTOMER"'
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE FUNCTION public.is_admin_v3() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- auth.jwt() i??erisindeki email'i kontrol etmek en g??venli ve d??ng??ye girmeyen y??ntemdir
  -- ????nk?? profiles tablosuna dokunmaz!
  RETURN (auth.jwt() ->> 'email') = 'admin@demo.com';
END;
$$;

CREATE FUNCTION public.on_salon_created_add_membership() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.salon_memberships (user_id, salon_id, role, is_active)
    VALUES (NEW.owner_id, NEW.id, 'OWNER', true)
    ON CONFLICT (user_id, salon_id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$;


-- From New-05-Triggers.sql --
-- Triggers

CREATE TRIGGER tr_salon_created_membership AFTER INSERT ON public.salons FOR EACH ROW EXECUTE FUNCTION public.on_salon_created_add_membership();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auth Triggers (Ensure profiles are created automatically)
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- From New-12-Support-And-StaffReviews.sql --
-- ============================================================
-- New-12-Support-And-StaffReviews.sql
-- Destek Ticket Sistemi + Çalışan Yorumları
-- ============================================================

-- ─────────────────────────────────────
-- 1. SUPPORT TICKETS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id    uuid REFERENCES public.salons(id) ON DELETE SET NULL,
    subject     text NOT NULL,
    message     text NOT NULL,
    category    text NOT NULL DEFAULT 'OTHER'
                    CHECK (category IN ('PAYMENT','BOOKING','ACCOUNT','SALON','OTHER','GENEL')),
    status      text NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED')),
    priority    text NOT NULL DEFAULT 'NORMAL'
                    CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────
-- 2. TICKET MESSAGES (Thread/Cevaplar)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id   uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_role text NOT NULL DEFAULT 'CUSTOMER',
    content     text NOT NULL,
    created_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────
-- 3. STAFF REVIEWS (Çalışan Yorumları)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_reviews (
    id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id       uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id       uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    user_name      text NOT NULL,
    user_avatar    text,
    rating         integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment        text,
    is_verified    boolean DEFAULT false,
    created_at     timestamptz DEFAULT now()
);

-- ─────────────────────────────────────
-- 4. STAFF tablosuna rating sütunları
-- ─────────────────────────────────────
ALTER TABLE public.staff
    ADD COLUMN IF NOT EXISTS rating       double precision DEFAULT 0,
    ADD COLUMN IF NOT EXISTS review_count integer          DEFAULT 0;

-- ─────────────────────────────────────
-- 5. UPDATED_AT TRİGGERI — support_tickets
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_support_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_support_ticket_updated_at();

-- ─────────────────────────────────────
-- 6. STAFF RATING OTOMATİK GÜNCELLEME
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_staff_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.staff
    SET
        rating       = (SELECT COALESCE(AVG(rating), 0) FROM public.staff_reviews WHERE staff_id = COALESCE(NEW.staff_id, OLD.staff_id)),
        review_count = (SELECT COUNT(*) FROM public.staff_reviews WHERE staff_id = COALESCE(NEW.staff_id, OLD.staff_id))
    WHERE id = COALESCE(NEW.staff_id, OLD.staff_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_staff_rating_update ON public.staff_reviews;
CREATE TRIGGER trg_staff_rating_update
    AFTER INSERT OR UPDATE OR DELETE ON public.staff_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_staff_rating();

-- ─────────────────────────────────────
-- 7. RLS POLİTİKALARI
-- ─────────────────────────────────────

-- SUPPORT_TICKETS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_see_own_tickets" ON public.support_tickets;
CREATE POLICY "users_see_own_tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_create_own_tickets" ON public.support_tickets;
CREATE POLICY "users_create_own_tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_see_all_tickets" ON public.support_tickets;
CREATE POLICY "admin_see_all_tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

DROP POLICY IF EXISTS "admin_update_tickets" ON public.support_tickets;
CREATE POLICY "admin_update_tickets" ON public.support_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- TICKET_MESSAGES
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ticket_owner_or_admin_see_messages" ON public.ticket_messages;
CREATE POLICY "ticket_owner_or_admin_see_messages" ON public.ticket_messages
    FOR SELECT USING (
        auth.uid() = sender_id
        OR EXISTS (
            SELECT 1 FROM public.support_tickets st
            WHERE st.id = ticket_id AND st.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

DROP POLICY IF EXISTS "auth_users_send_messages" ON public.ticket_messages;
CREATE POLICY "auth_users_send_messages" ON public.ticket_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- STAFF_REVIEWS
ALTER TABLE public.staff_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_reviews_public_read" ON public.staff_reviews;
CREATE POLICY "staff_reviews_public_read" ON public.staff_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth_users_create_staff_review" ON public.staff_reviews;
CREATE POLICY "auth_users_create_staff_review" ON public.staff_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_staff_review" ON public.staff_reviews;
CREATE POLICY "users_delete_own_staff_review" ON public.staff_reviews
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_manage_staff_reviews" ON public.staff_reviews;
CREATE POLICY "admin_manage_staff_reviews" ON public.staff_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- ─────────────────────────────────────
-- 8. İNDEKSLER
-- ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id   ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status    ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_staff_id    ON public.staff_reviews(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_user_id     ON public.staff_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_appointment ON public.staff_reviews(appointment_id);


-- From New-13-Review-Views.sql --
-- ============================================================
-- New-13-Review-Views.sql
-- Gelişmiş Yorum Görünümleri (Verified Reviews & Staff Ratings)
-- ============================================================

-- 1. SALON YORUMLARI GÖRÜNÜMÜ (verified_reviews_view)
-- db.ts içerisinde 'verified_reviews_view' olarak çağrılıyor.
CREATE OR REPLACE VIEW public.verified_reviews_view AS
SELECT 
    r.id,
    r.salon_id,
    r.user_id,
    r.user_name,
    r.user_avatar,
    r.rating,
    r.comment,
    r.created_at,
    r.appointment_id,
    a.status AS appointment_status,
    a.start_time AS service_date,
    gs.name AS service_name,
    CASE WHEN r.appointment_id IS NOT NULL THEN true ELSE false END AS is_verified
FROM public.reviews r
LEFT JOIN public.appointments a ON r.appointment_id = a.id
LEFT JOIN public.salon_services ss ON a.salon_service_id = ss.id
LEFT JOIN public.global_services gs ON ss.global_service_id = gs.id;

-- 2. ÇALIŞAN YORUMLARI GÖRÜNÜMÜ (staff_reviews_detailed)
CREATE OR REPLACE VIEW public.staff_reviews_detailed AS
SELECT 
    sr.id,
    sr.staff_id,
    sr.salon_id,
    sr.user_id,
    sr.appointment_id,
    sr.user_name,
    sr.user_avatar,
    sr.rating,
    sr.comment,
    sr.is_verified,
    sr.created_at,
    gs.name AS service_name,
    a.start_time AS appointment_date
FROM public.staff_reviews sr
LEFT JOIN public.appointments a ON sr.appointment_id = a.id
LEFT JOIN public.salon_services ss ON a.salon_service_id = ss.id
LEFT JOIN public.global_services gs ON ss.global_service_id = gs.id;

-- 3. SALON PUANLAMA ÖZETİ (salon_ratings)
-- Eğer tablo olarak yoksa view olarak ekleyelim (db.ts salon_ratings tablosuna bakıyor)
-- Not: New-12 zaten staff tablosuna rating/review_count eklemişti.
-- Salonlar için de benzer bir özet tablo/view gerekebilir.
CREATE OR REPLACE VIEW public.salon_ratings AS
SELECT 
    salon_id,
    AVG(rating) as average_rating,
    COUNT(*) as review_count
FROM public.reviews
GROUP BY salon_id;


-- From New-14-Review-Notifications.sql --
-- ============================================================
-- New-14-Review-Notifications.sql
-- Randevu Tamamlandığında Yorum Daveti Bildirimi
-- ============================================================

-- 1. BİLDİRİM FONKSİYONU
CREATE OR REPLACE FUNCTION public.create_review_invitation_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Eğer durum COMPLETED olarak değiştiyse bildirim oluştur
    IF (NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED')) THEN
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            related_id,
            is_read
        )
        VALUES (
            NEW.customer_id,
            'Deneyiminizi Değerlendirin! ⭐',
            'Tamamlanan randevunuz için bir yorum bırakmak ister misiniz? Geri bildiriminiz bizim için çok değerli.',
            'SYSTEM', -- veya 'REVIEW_INVITE' tipi varsa o
            NEW.id,
            false
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. TRİGGER
DROP TRIGGER IF EXISTS trg_appointment_completed_review_invite ON public.appointments;
CREATE TRIGGER trg_appointment_completed_review_invite
    AFTER UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.create_review_invitation_notification();


-- From New-22-Address-Columns-And-View-Fix.sql --
-- =============================================
-- New-22-Address-Columns-And-View-Fix.sql
-- 1. Salons tablosuna eksik adres kolonlarını ekle
-- 2. salon_details view'ını tüm kolonlarla yeniden oluştur
-- 3. salon_details_with_membership view'ını güncelle
-- =============================================

-- -----------------------------------------------
-- 1. SALONS TABLOSUNA EKSİK KOLONLAR
-- -----------------------------------------------
ALTER TABLE public.salons
    ADD COLUMN IF NOT EXISTS neighborhood   TEXT,
    ADD COLUMN IF NOT EXISTS avenue         TEXT,
    ADD COLUMN IF NOT EXISTS street         TEXT,
    ADD COLUMN IF NOT EXISTS building_no    TEXT,
    ADD COLUMN IF NOT EXISTS apartment_no   TEXT,
    ADD COLUMN IF NOT EXISTS is_closed      BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS slug           TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS min_price      NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS plan           TEXT DEFAULT 'FREE';

COMMENT ON COLUMN public.salons.neighborhood  IS 'Mahalle';
COMMENT ON COLUMN public.salons.avenue        IS 'Cadde';
COMMENT ON COLUMN public.salons.street        IS 'Sokak';
COMMENT ON COLUMN public.salons.building_no   IS 'Bina No';
COMMENT ON COLUMN public.salons.apartment_no  IS 'Daire No';
COMMENT ON COLUMN public.salons.is_closed     IS 'Salon geçici olarak kapalı mı';
COMMENT ON COLUMN public.salons.slug          IS 'Subdomain için URL dostu kısa ad';
COMMENT ON COLUMN public.salons.min_price     IS 'Salondaki en düşük hizmet fiyatı (önizleme için)';
COMMENT ON COLUMN public.salons.plan          IS 'SaaS plan: FREE, PRO, ENTERPRISE';

-- -----------------------------------------------
-- 2. SALON TIPLERI ATAMA TABLOSU (Eğer yoksa)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.salon_assigned_types (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id    bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    type_id     uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    is_primary  BOOLEAN DEFAULT false,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(salon_id, type_id)
);

-- -----------------------------------------------
-- 3. SALONLARDAKİ MİN FİYATI HESAPLA (İlk yükleme)
-- -----------------------------------------------
UPDATE public.salons s
SET min_price = (
    SELECT MIN(ss.price)
    FROM public.salon_services ss
    WHERE ss.salon_id = s.id
)
WHERE min_price IS NULL;

-- -----------------------------------------------
-- 4. SALON_DETAILS VIEW'INI YENİDEN OLUŞTUR
-- -----------------------------------------------
DROP VIEW IF EXISTS public.salon_details_with_membership;
DROP VIEW IF EXISTS public.salon_details;

CREATE OR REPLACE VIEW public.salon_details AS
SELECT
    s.id,
    s.name,
    s.description,
    s.features,
    -- Adres alanları
    s.address,
    s.neighborhood,
    s.avenue,
    s.street,
    s.building_no,
    s.apartment_no,
    -- İletişim & Medya
    s.phone,
    s.image,
    s.logo_url,
    s.banner_url,
    s.primary_color,
    -- Konum
    s.geo_latitude,
    s.geo_longitude,
    -- İşletme durumu
    s.status,
    s.is_sponsored,
    s.is_closed,
    s.rejected_reason,
    s.plan,
    s.slug,
    s.min_price,
    -- Sahip
    s.owner_id,
    -- Şehir / İlçe
    COALESCE(c.name,  'Bilinmiyor') AS city_name,
    COALESCE(d.name,  'Bilinmiyor') AS district_name,
    c.id   AS city_id,
    d.id   AS district_id,
    -- Tip (birincil)
    COALESCE(st.name, 'Genel')     AS type_name,
    COALESCE(st.slug, 'genel')     AS type_slug,
    -- Çoklu tip atamaları (JSON dizisi)
    COALESCE(
        (
            SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
            FROM public.salon_assigned_types sat
            JOIN public.salon_types t ON t.id = sat.type_id
            WHERE sat.salon_id = s.id
        ),
        '[]'::json
    ) AS assigned_types,
    -- Değerlendirme (şimdilik sabit 0, ileride reviews tablosundan hesaplanacak)
    0::NUMERIC(3,2) AS average_rating,
    0                                   AS review_count,
    -- Zaman damgaları
    s.created_at,
    s.updated_at
FROM public.salons s
LEFT JOIN public.cities      c  ON c.id  = s.city_id
LEFT JOIN public.districts   d  ON d.id  = s.district_id
LEFT JOIN public.salon_types st ON st.id = s.type_id;

-- -----------------------------------------------
-- 5. SALON_DETAILS_WITH_MEMBERSHIP VIEW'INI YENİLE
-- -----------------------------------------------
CREATE OR REPLACE VIEW public.salon_details_with_membership AS
SELECT
    sd.*,
    'OWNER'::TEXT        AS user_role,
    sd.owner_id::TEXT    AS current_user_id
FROM public.salon_details sd;

-- -----------------------------------------------
-- 6. İNDEKSLER
-- -----------------------------------------------
CREATE INDEX IF NOT EXISTS idx_salons_status       ON public.salons(status);
CREATE INDEX IF NOT EXISTS idx_salons_city_id      ON public.salons(city_id);
CREATE INDEX IF NOT EXISTS idx_salons_district_id  ON public.salons(district_id);
CREATE INDEX IF NOT EXISTS idx_salons_slug         ON public.salons(slug);
CREATE INDEX IF NOT EXISTS idx_salon_assigned_types_salon ON public.salon_assigned_types(salon_id);


-- From New-25-View-Permissions-Fix.sql --
-- =============================================
-- New-25-View-Permissions-Fix.sql
-- Grant SELECT permissions to anon and authenticated roles for all views
-- This ensures the frontend can fetch data properly.
-- =============================================

-- 1. Grant permissions to existing views
GRANT SELECT ON public.salon_details TO anon, authenticated;
GRANT SELECT ON public.salon_details_with_membership TO anon, authenticated;
GRANT SELECT ON public.salon_service_details TO anon, authenticated;
GRANT SELECT ON public.verified_reviews_view TO anon, authenticated;
GRANT SELECT ON public.staff_reviews_detailed TO anon, authenticated;

-- 2. Ensure RLS doesn't block views (Views themselves don't have RLS, but the underlying tables do)
-- The underlying tables already have public read access in New-06-RLS-Policies.sql.

-- 3. Verify salon_details view includes status column for filtering
-- (Already handled in New-22)

-- 4. Fix any potential slug issues (Ensure slugs are lowercase)
UPDATE public.salons SET slug = LOWER(slug) WHERE slug IS NOT NULL;


-- From New-26-Salon-Details-View-Working-Hours.sql --
-- =============================================
-- New-26-Salon-Details-View-Working-Hours.sql
-- 1. salon_details view'ını çalışma saatlerini içerecek şekilde güncelle
-- 2. salon_details_with_membership view'ını güncelle
-- 3. Tip güvenliği ve performans iyileştirmeleri
-- =============================================

DROP VIEW IF EXISTS public.salon_details_with_membership;
DROP VIEW IF EXISTS public.salon_details;

CREATE OR REPLACE VIEW public.salon_details AS
SELECT
    s.id,
    s.name,
    s.slug,
    s.description,
    s.features,
    s.tags,
    -- Adres alanları
    s.address,
    s.neighborhood,
    s.avenue,
    s.street,
    s.building_no,
    s.apartment_no,
    s.postal_code,
    -- İletişim & Medya
    s.phone,
    s.image,
    s.logo_url,
    s.banner_url,
    s.primary_color,
    -- Konum
    s.geo_latitude,
    s.geo_longitude,
    -- İşletme durumu
    s.status,
    s.is_sponsored,
    s.is_closed,
    s.rejected_reason,
    s.plan,
    s.min_price,
    -- Sahip
    s.owner_id,
    -- Şehir / İlçe
    s.city_id,
    s.district_id,
    s.type_id,
    COALESCE(c.name, 'Bilinmiyor') AS city_name,
    COALESCE(d.name, 'Bilinmiyor') AS district_name,
    -- Tip (birincil)
    COALESCE(st.name, 'Genel')     AS type_name,
    COALESCE(st.slug, 'genel')     AS type_slug,
    -- Çoklu tip atamaları (JSON dizisi)
    COALESCE(
        (
            SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'is_primary', sat.is_primary))
            FROM public.salon_assigned_types sat
            JOIN public.salon_types t ON t.id = sat.type_id
            WHERE sat.salon_id = s.id
        ),
        '[]'::json
    ) AS assigned_types,
    -- ÇALIŞMA SAATLERİ (JSON dizisi olarak eklendi - "Hemen Müsait" filtresi için)
    COALESCE(
        (
            SELECT json_agg(json_build_object(
                'day_of_week', swh.day_of_week, 
                'start_time', swh.start_time, 
                'end_time', swh.end_time, 
                'is_closed', swh.is_closed
            ) ORDER BY swh.day_of_week)
            FROM public.salon_working_hours swh
            WHERE swh.salon_id = s.id
        ),
        '[]'::json
    ) AS working_hours,
    -- Değerlendirme & İstatistik
    s.review_count,
    s.rating AS average_rating,
    -- Zaman damgaları
    s.created_at,
    s.updated_at
FROM public.salons s
LEFT JOIN public.cities      c  ON c.id  = s.city_id
LEFT JOIN public.districts   d  ON d.id  = s.district_id
LEFT JOIN public.salon_types st ON st.id = s.type_id;

-- 2. SALON_DETAILS_WITH_MEMBERSHIP VIEW'INI YENİLE
CREATE OR REPLACE VIEW public.salon_details_with_membership AS
SELECT
    sd.*,
    'OWNER'::TEXT        AS user_role,
    sd.owner_id::TEXT    AS current_user_id
FROM public.salon_details sd;

-- Yetkileri ver (anon ve authenticated kullanıcılar için)
GRANT SELECT ON public.salon_details TO anon, authenticated;
GRANT SELECT ON public.salon_details_with_membership TO authenticated;


-- From New-33-Verified-Reviews.sql --
-- 0. Ensure is_verified column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='is_verified') THEN
        ALTER TABLE public.reviews ADD COLUMN is_verified boolean DEFAULT false;
    END IF;
END $$;

-- 1. Ensure appointment_id is unique per review
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_appointment_id_key;

-- Cleanup: Remove duplicate appointment_id if they exist
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY appointment_id ORDER BY created_at DESC) as rn
    FROM public.reviews
    WHERE appointment_id IS NOT NULL
)
DELETE FROM public.reviews
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_appointment_id_key UNIQUE (appointment_id);

-- 2. Update RLS Policies
DROP POLICY IF EXISTS "Authenticated users can leave reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews for own completed appointments" ON public.reviews;

-- Cleanup: Remove reviews without appointment_id to enforce verified reviews (Optional - based on business rule)
-- DELETE FROM public.reviews WHERE appointment_id IS NULL;

CREATE POLICY "Users can create reviews for own completed appointments"
ON public.reviews
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.id = reviews.appointment_id
        AND a.customer_id = auth.uid()
        AND a.status = 'COMPLETED'
    )
);

-- Users can only update their own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
ON public.reviews
FOR UPDATE
USING (user_id = auth.uid());

-- 3. Update the view
DROP VIEW IF EXISTS public.verified_reviews_view CASCADE;

CREATE OR REPLACE VIEW public.verified_reviews_view AS
SELECT 
    r.id,
    r.salon_id,
    r.user_id,
    r.appointment_id,
    r.user_name,
    r.user_avatar,
    r.rating,
    r.comment,
    (r.is_verified OR r.appointment_id IS NOT NULL) as is_verified,
    r.created_at,
    a.start_time as service_date,
    gs.name as service_name
FROM public.reviews r
LEFT JOIN public.appointments a ON r.appointment_id = a.id
LEFT JOIN public.salon_services ss ON a.salon_service_id = ss.id
LEFT JOIN public.global_services gs ON ss.global_service_id = gs.id;

GRANT SELECT ON public.verified_reviews_view TO anon, authenticated;


-- From New-34-Verified-Staff-Reviews.sql --
-- Description: Enforces verified staff reviews by linking them to completed appointments
-- Step 1: Add uniqueness constraint to appointment_id in staff_reviews
-- Step 2: Update RLS policies to restrict inserts to owners of completed appointments

-- 1. Ensure appointment_id is unique per staff review
ALTER TABLE public.staff_reviews 
DROP CONSTRAINT IF EXISTS staff_reviews_appointment_id_key;

-- Cleanup: Remove duplicate appointment_id if they exist
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY appointment_id ORDER BY created_at DESC) as rn
    FROM public.staff_reviews
    WHERE appointment_id IS NOT NULL
)
DELETE FROM public.staff_reviews
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

ALTER TABLE public.staff_reviews
ADD CONSTRAINT staff_reviews_appointment_id_key UNIQUE (appointment_id);

-- 2. Update RLS Policies
DROP POLICY IF EXISTS "auth_users_create_staff_review" ON public.staff_reviews;
DROP POLICY IF EXISTS "Users can create staff reviews for own completed appointments" ON public.staff_reviews;


CREATE POLICY "Users can create staff reviews for own completed appointments"
ON public.staff_reviews
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.id = staff_reviews.appointment_id
        AND a.customer_id = auth.uid()
        AND a.status = 'COMPLETED'
        AND a.staff_id = staff_reviews.staff_id
    )
);

-- Users can only delete their own reviews (existing policy: users_delete_own_staff_review)
-- No changes needed if already tied to user_id = auth.uid()

-- 3. Ensure is_verified is computed correctly in future views if needed
-- (Current table has is_verified column, we can update it based on appointment_id)
UPDATE public.staff_reviews SET is_verified = true WHERE appointment_id IS NOT NULL;


