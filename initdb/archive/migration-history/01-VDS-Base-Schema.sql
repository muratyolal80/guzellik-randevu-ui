-- 01-VDS-Base-Schema.sql
-- Auto-generated from sequential migrations

-- From New-01-Extensions.sql --
-- Extensions
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;
COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;
COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

-- PostGIS related schemas and extensions (if needed, extracted from dump)
CREATE SCHEMA IF NOT EXISTS tiger;
CREATE SCHEMA IF NOT EXISTS tiger_data;
CREATE SCHEMA IF NOT EXISTS topology;

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;
COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;
COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';

-- Realtime Setup
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;


-- From New-02-Types-and-Enums.sql --
-- Types and Enums

CREATE TYPE public.appt_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED'
);

CREATE TYPE public.invite_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'EXPIRED',
    'CANCELLED'
);

CREATE TYPE public.iys_msg_type AS ENUM (
    'OTP',
    'INFO',
    'CAMPAIGN'
);

CREATE TYPE public.iys_status AS ENUM (
    'SENT',
    'FAILED',
    'DEMO'
);

CREATE TYPE public.salon_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'REVISION_REQUESTED',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
);

CREATE TYPE public.user_role AS ENUM (
    'CUSTOMER',
    'STAFF',
    'SALON_OWNER',
    'SUPER_ADMIN'
);


-- From New-03-Tables.sql --
-- Tables and Sequences

-- 1. APPOINTMENTS
CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    end_time timestamp with time zone,
    start_time timestamp with time zone,
    status text DEFAULT 'PENDING'::text,
    first_name text,
    last_name text,
    email text,
    customer_id uuid,
    salon_id uuid,
    salon_service_id uuid, -- Link to salon_services.id
    staff_id uuid,   -- Link to staff.id
    customer_phone text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT appointments_status_check CHECK (status = ANY (ARRAY['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']))
);

-- 2. CITIES
CREATE TABLE public.cities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    plate_code integer NOT NULL UNIQUE,
    latitude numeric(10,8),
    longitude numeric(11,8),
    created_at timestamp with time zone DEFAULT now()
);

-- 3. DISTRICTS
CREATE TABLE public.districts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(city_id, name)
);

-- 4. SERVICE CATEGORIES
CREATE TABLE public.service_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    icon text,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. GLOBAL SERVICES
CREATE TABLE public.global_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    avg_duration_min integer DEFAULT 30,
    avg_price numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(category_id, name)
);

-- 6. PROFILES
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY, -- Matches auth.users.id
    email text NOT NULL UNIQUE,
    full_name text,
    avatar_url text,
    phone text,
    role public.user_role DEFAULT 'CUSTOMER'::public.user_role,
    first_name text,
    last_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 7. SALON TYPES
CREATE TABLE public.salon_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    icon text,
    image text,
    created_at timestamp with time zone DEFAULT now()
);

-- 8. SALONS
CREATE TABLE public.salons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    address character varying(255),
    neighborhood character varying(255),
    avenue character varying(255),
    street character varying(255),
    building_no character varying(50),
    apartment_no character varying(50),
    postal_code character varying(20),
    phone text,
    image text,
    is_verified boolean DEFAULT false,
    is_sponsored boolean DEFAULT false,
    status public.salon_status DEFAULT 'DRAFT'::public.salon_status,
    rejected_reason text,
    owner_id uuid NOT NULL REFERENCES public.profiles(id),
    city_id uuid REFERENCES public.cities(id),
    district_id uuid REFERENCES public.districts(id),
    type_id uuid REFERENCES public.salon_types(id),
    geo_latitude numeric(10,8),
    geo_longitude numeric(11,8),
    location public.geometry(Point,4326),
    features jsonb DEFAULT '[]'::jsonb,
    tags text[] DEFAULT '{}'::text[],
    rating double precision DEFAULT 0,
    review_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 9. SALON ASSIGNED TYPES (Multiple types per salon)
CREATE TABLE public.salon_assigned_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    type_id uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, type_id)
);

-- 10. SALON SERVICES
CREATE TABLE public.salon_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    global_service_id uuid NOT NULL REFERENCES public.global_services(id),
    price numeric(10,2) NOT NULL,
    duration_min integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, global_service_id)
);

-- 11. STAFF
CREATE TABLE public.staff (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    role text,
    phone text,
    photo text,
    user_id uuid REFERENCES public.profiles(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 12. STAFF SERVICES (Skills)
CREATE TABLE public.staff_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    salon_service_id uuid NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(staff_id, salon_service_id)
);

-- 13. WORKING HOURS (Staff)
CREATE TABLE public.working_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_day_off boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(staff_id, day_of_week)
);

-- 14. SALON WORKING HOURS
CREATE TABLE public.salon_working_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_closed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, day_of_week)
);

-- 15. REVIEWS
CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id),
    appointment_id uuid REFERENCES public.appointments(id),
    user_name text NOT NULL,
    user_avatar text,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 16. INVITES
CREATE TABLE public.invites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    email text NOT NULL,
    role public.user_role DEFAULT 'STAFF'::public.user_role,
    token text NOT NULL UNIQUE,
    status public.invite_status DEFAULT 'PENDING'::public.invite_status,
    inviter_id uuid NOT NULL REFERENCES public.profiles(id),
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    accepted_at timestamp with time zone
);

-- 17. NOTIFICATIONS
CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'SYSTEM'::text,
    is_read boolean DEFAULT false,
    action_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- 18. OTP CODES
CREATE TABLE public.otp_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone text NOT NULL,
    code text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(phone, code)
);

-- 13. FAVORITES
CREATE TABLE public.favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, salon_id)
);

-- VIEWS

CREATE OR REPLACE VIEW public.salon_details AS
 SELECT s.id,
    s.name,
    s.slug,
    s.description,
    s.features,
    s.tags,
    s.address,
    s.neighborhood,
    s.avenue,
    s.street,
    s.building_no,
    s.apartment_no,
    s.phone,
    s.geo_latitude,
    s.geo_longitude,
    s.image,
    s.is_sponsored,
    s.status,
    s.rejected_reason,
    s.owner_id,
    s.postal_code,
    s.city_id,
    s.district_id,
    s.type_id,
    COALESCE(c.name, 'Bilinmiyor'::text) AS city_name,
    COALESCE(d.name, 'Bilinmiyor'::text) AS district_name,
    COALESCE(st.name, 'Genel'::text) AS type_name,
    COALESCE(st.slug, 'genel'::text) AS type_slug,
    ( SELECT array_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'is_primary', sat.is_primary)) AS array_agg
           FROM public.salon_assigned_types sat
           JOIN public.salon_types t ON sat.type_id = t.id
          WHERE sat.salon_id = s.id) AS assigned_types,
    s.review_count,
    s.rating AS average_rating,
    s.created_at
   FROM public.salons s
     LEFT JOIN public.cities c ON s.city_id = c.id
     LEFT JOIN public.districts d ON s.district_id = d.id
     LEFT JOIN public.salon_types st ON s.type_id = st.id;

CREATE OR REPLACE VIEW public.salon_service_details WITH (security_invoker = on) AS
SELECT
    ss.id,
    ss.salon_id,
    ss.duration_min,
    ss.price,
    ss.is_active,
    gs.name AS service_name,
    sc.name AS category_name,
    sc.slug AS category_slug,
    sc.icon AS category_icon,
    s.name AS salon_name
FROM public.salon_services ss
JOIN public.global_services gs ON ss.global_service_id = gs.id
JOIN public.service_categories sc ON gs.category_id = sc.id
JOIN public.salons s ON ss.salon_id = s.id;

CREATE OR REPLACE VIEW public.verified_reviews_view AS
 SELECT r.id,
    r.salon_id,
    r.user_id,
    r.appointment_id,
    r.user_name,
    r.user_avatar,
    r.rating,
    r.comment,
    r.created_at,
    (r.appointment_id IS NOT NULL) AS is_verified,
    gs.service_name AS service_name,
    a.start_time AS service_date
   FROM public.reviews r
     LEFT JOIN public.appointments a ON r.appointment_id = a.id
     LEFT JOIN public.salon_service_details gs ON a.salon_service_id = gs.id;


-- From New-08-Storage.sql --
-- Storage Schema and Buckets Setup
-- This script ensures the Supabase Storage schema exists and basic buckets are created.

-- 1. Create storage schema if it doesn't exist (Standard Supabase setup)
CREATE SCHEMA IF NOT EXISTS storage;
GRANT ALL ON SCHEMA storage TO postgres;
GRANT ALL ON SCHEMA storage TO public;

-- 2. Create tables (Simplified version of standard Supabase storage migrations)
CREATE TABLE IF NOT EXISTS storage.buckets (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[]
);

CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
    version text,
    owner_id text,
    CONSTRAINT objects_bucketId_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
);

-- 3. Create Standard Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']),
    ('salon-images', 'salon-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- 5. Public Access Policies (Simplistic for Dev)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'salon-images'));
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owner Update" ON storage.objects FOR UPDATE USING (auth.uid() = owner);
CREATE POLICY "Owner Delete" ON storage.objects FOR DELETE USING (auth.uid() = owner);


-- From New-15-Salon-Gallery.sql --
-- ============================================================
-- New-15-Salon-Gallery.sql
-- Salon Galerisi ve Yorum Görselleri
-- ============================================================

-- 1. SALON GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.salon_gallery (
    id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id       uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    image_url      text NOT NULL,
    display_order  integer DEFAULT 0,
    is_cover       boolean DEFAULT false,
    caption        text,
    created_at     timestamptz DEFAULT now()
);

-- 2. REVIEW IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.review_images (
    id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id    uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    image_url    text NOT NULL,
    created_at   timestamptz DEFAULT now()
);

-- 3. RLS POLICIES

-- Salon Gallery
ALTER TABLE public.salon_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "salon_gallery_public_read" ON public.salon_gallery;
CREATE POLICY "salon_gallery_public_read" ON public.salon_gallery
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "owners_manage_own_gallery" ON public.salon_gallery;
CREATE POLICY "owners_manage_own_gallery" ON public.salon_gallery
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE id = salon_id AND owner_id = auth.uid()
        )
    );

-- Review Images
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "review_images_public_read" ON public.review_images;
CREATE POLICY "review_images_public_read" ON public.review_images
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "users_manage_own_review_images" ON public.review_images;
CREATE POLICY "users_manage_own_review_images" ON public.review_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.reviews
            WHERE id = review_id AND user_id = auth.uid()
        )
    );

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_salon_gallery_salon_id ON public.salon_gallery(salon_id);
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON public.review_images(review_id);


-- From New-16-Notifications.sql --
-- NEW-16-NOTIFICATIONS.SQL
-- Notification system for real-time alerts

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'APPOINTMENT', 'REVIEW', 'SYSTEM', 'REMINDER', 'PROMOTION', 'BOOKING')),
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System/Admin can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true); -- Usually handled by service role or triggers

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;


-- From New-17-SaaS-Plans-And-Subdomains.sql --
-- Add subscription plan to salons
ALTER TABLE salons ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'ENTERPRISE'));

-- Ensure slug is unique for subdomain routing
ALTER TABLE salons ADD CONSTRAINT salons_slug_unique UNIQUE (slug);

-- Add sample comment
COMMENT ON COLUMN salons.plan IS 'Subscription plan: FREE, PRO, or ENTERPRISE';


-- From New-18-Staff-Expansion.sql --
-- Add MANAGER to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'MANAGER';

-- Add email and specialty to staff table
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS specialty text;

-- Add index for email lookup
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);

-- Add unique constraint per salon and email (a person can join multiple salons, but with unique email entry for that record)
-- Actually, a single user (email) can be staff in multiple salons.

-- Ensure user_id is linked to profiles
-- (Already exists in New-03-Tables but good to ensure FK)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_user_id_fkey') THEN
        ALTER TABLE public.staff ADD CONSTRAINT staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;


-- From New-19-Branding-And-Audit.sql --
-- =============================================
-- New-19-Branding-And-Audit.sql
-- Adds branding (colors/logo) and audit logging for SaaS architecture
-- =============================================

-- 1. Add Branding Columns to Salons
ALTER TABLE public.salons 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#CFA76D',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT;

COMMENT ON COLUMN public.salons.primary_color IS 'Business brand primary color (HEX)';
COMMENT ON COLUMN public.salons.logo_url IS 'Business brand logo (Storage URL)';

-- 2. Audit Logs Table (For security and tracking)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'APPOINTMENT_CANCELLED', 'STAFF_ADDED', 'PLAN_UPGRADED'
    resource_type TEXT NOT NULL, -- e.g., 'appointment', 'staff', 'salon'
    resource_id TEXT, -- ID of the modified resource
    changes JSONB, -- Before/After values
    ip_address TEXT,
    user_agent TEXT,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only SUPER_ADMIN and the Salon OWNER can view their audit logs
CREATE POLICY "Super admins can see all audit logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

CREATE POLICY "Owners can see their own salon audit logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- Create Index for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_salon_id ON public.audit_logs(salon_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 3. Dynamic Service Level View Update (Optional but helpful)
-- Refresh salon_details view to include new columns if needed (assuming salon_details uses select *)
-- If it's a static view, it would need a DROP and CREATE. 
-- For now, we manually check.


-- From New-20-Account-Security-KVKK.sql --
-- =============================================
-- New-20-Account-Security-KVKK.sql
-- Adds session management, soft-delete, and KVKK/Preferences for profiles
-- =============================================

-- 1. Updates to Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS kvkk_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'tr',
ADD COLUMN IF NOT EXISTS default_city_id UUID REFERENCES public.cities(id);

COMMENT ON COLUMN public.profiles.deleted_at IS 'Timestamp for soft-delete';
COMMENT ON COLUMN public.profiles.kvkk_accepted_at IS 'When the user accepted KVKK terms';
COMMENT ON COLUMN public.profiles.marketing_opt_in IS 'User preference for marketing communications';

-- 2. User Sessions Table (To track active devices/sessions)
-- Note: Supabase Auth already handles sessions, but this table allows us 
-- to provide a UI to the user to "view & terminate sessions" specifically 
-- for our app context if we use custom tokens or just for logging.
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    device_name TEXT,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Session Policies
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can terminate (delete) their own sessions" 
ON public.user_sessions FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- Indexing
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- 3. Soft Delete Helper Function
CREATE OR REPLACE FUNCTION public.request_account_deletion()
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET deleted_at = now() + interval '30 days', -- 30 days recovery period
        is_active = false
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Audit Log Action for Security
-- (Already having audit_logs table from New-19)
-- We can add a trigger or just handle it in service layer.

-- 5. Update salon_details view if needed
-- (Profiles additions don't strictly require view update unless we show these info in salon context)


-- From New-21-Finance-And-Campaigns.sql --
-- Faz 3: Finans & Kampanya Modülü
-- New-21-Finance-And-Campaigns.sql

-- 1. ENUMS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
        CREATE TYPE public.discount_type AS ENUM ('PERCENTAGE', 'FIXED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE public.payment_method AS ENUM ('CASH', 'CREDIT_CARD', 'WALLET', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE public.payment_status AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');
    END IF;
END $$;

-- 2. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid REFERENCES public.salons(id) ON DELETE CASCADE, -- NULL ise global kupon
    code text NOT NULL,
    description text,
    discount_type public.discount_type NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    min_purchase_amount numeric(10,2) DEFAULT 0,
    max_discount_amount numeric(10,2),
    expires_at timestamp with time zone,
    usage_limit integer DEFAULT 1,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, code)
);

-- 3. PACKAGES
CREATE TABLE IF NOT EXISTS public.packages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. PACKAGE SERVICES
CREATE TABLE IF NOT EXISTS public.package_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    salon_service_id uuid NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    quantity integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(package_id, salon_service_id)
);

-- 5. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY',
    payment_method public.payment_method DEFAULT 'CASH',
    payment_status public.payment_status DEFAULT 'PENDING',
    provider_transaction_id text, -- Iyzico, Stripe vb.
    commission_amount numeric(10,2) DEFAULT 0,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 6. APPOINTMENT COUPONS (Randevuda kullanılan kuponlar)
CREATE TABLE IF NOT EXISTS public.appointment_coupons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    discount_amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(appointment_id, coupon_id)
);

-- RLS POLICIES

-- Coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coupons are viewable by everyone if active" ON public.coupons
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "Salon owners can manage their own coupons" ON public.coupons
    FOR ALL USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
    );

-- Packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Packages are viewable by everyone if active" ON public.packages
    FOR SELECT USING (is_active = true);
CREATE POLICY "Salon owners can manage their own packages" ON public.packages
    FOR ALL USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
    );

-- Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can see their own transactions" ON public.transactions
    FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Salon owners can see their salon transactions" ON public.transactions
    FOR SELECT USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
    );

-- Audit log for transactions (updated_at)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- From New-23-Final-Service-Layer-Fixes.sql --
-- =============================================
-- New-23-Final-Service-Layer-Fixes.sql
-- 1. Salon_services tablosunu düzelt (is_active ekle, kolon ismini normalize et)
-- 2. Eksik view'ları oluştur/güncelle (Mükerrer ve eksik kolon hataları giderildi)
-- =============================================

-- 1. SALON_SERVICES FIXES
DO $$ 
BEGIN
    -- Rename duration_minutes to duration_min if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salon_services' AND column_name='duration_minutes') THEN
        ALTER TABLE public.salon_services RENAME COLUMN duration_minutes TO duration_min;
    END IF;

    -- Add is_active if it's missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salon_services' AND column_name='is_active') THEN
        ALTER TABLE public.salon_services ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 2. CREATE MISSING VIEWS
-- Sütun değişikliklerine izin vermek için önce sil
DROP VIEW IF EXISTS public.verified_reviews_view CASCADE;
DROP VIEW IF EXISTS public.salon_service_details CASCADE;
DROP VIEW IF EXISTS public.staff_reviews_detailed CASCADE;

-- A. SALON_SERVICE_DETAILS (Servis listesi için kritik)
CREATE VIEW public.salon_service_details AS
SELECT 
    ss.id,
    ss.salon_id,
    ss.price,
    COALESCE(ss.duration_min, ss.duration_minutes) as duration_min, 
    COALESCE(ss.is_active, true) as is_active,
    COALESCE(ss.name, gs.name) AS service_name, 
    sc.name AS category_name,
    sc.icon AS category_icon, 
    sc.slug AS category_slug,
    s.name AS salon_name
FROM public.salon_services ss
LEFT JOIN public.global_services gs ON gs.id = ss.global_service_id
LEFT JOIN public.service_categories sc ON sc.id = gs.category_id
JOIN public.salons s ON s.id = ss.salon_id;

-- B. VERIFIED_REVIEWS_VIEW (Yorumlar için)
CREATE VIEW public.verified_reviews_view AS
SELECT 
    r.id,
    r.salon_id,
    r.user_id,
    r.appointment_id,
    r.rating,
    r.comment,
    r.created_at,
    COALESCE(p.full_name, r.user_name) AS user_name,
    COALESCE(p.avatar_url, r.user_avatar) AS user_avatar,
    a.start_time AS service_date,
    gs.service_name AS service_name,
    (r.appointment_id IS NOT NULL) AS is_verified
FROM public.reviews r
LEFT JOIN public.profiles p ON p.id = r.user_id
LEFT JOIN public.appointments a ON a.id = r.appointment_id
LEFT JOIN public.salon_service_details gs ON gs.id = COALESCE(a.salon_service_id, a.service_id);

-- C. STAFF_REVIEWS_DETAILED (Çalışan yorumları için)
CREATE VIEW public.staff_reviews_detailed AS
SELECT 
    sr.id,
    sr.staff_id,
    sr.salon_id,
    sr.user_id,
    sr.appointment_id,
    sr.rating,
    sr.comment,
    sr.is_verified,
    sr.created_at,
    s.name AS staff_name,
    s.photo AS staff_photo,
    COALESCE(p.full_name, sr.user_name) AS user_name,
    COALESCE(p.avatar_url, sr.user_avatar) AS user_avatar
FROM public.staff_reviews sr
JOIN public.staff s ON s.id = sr.staff_id
LEFT JOIN public.profiles p ON p.id = sr.user_id;

-- 3. PERMISSIONS
GRANT SELECT ON public.salon_service_details TO anon, authenticated;
GRANT SELECT ON public.verified_reviews_view TO anon, authenticated;
GRANT SELECT ON public.staff_reviews_detailed TO anon, authenticated;


-- From New-24-Appointment-Coupon-Support.sql --
-- =============================================
-- New-24-Appointment-Coupon-Support.sql
-- Randevulara kupon desteği ekler
-- =============================================

-- Randevular tablosuna kupon ve indirim bilgilerini ekle
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS coupon_code text,
ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0;

-- Kupon kullanım sayısını artıran bir fonksiyon
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.coupons 
    SET used_count = used_count + 1 
    WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- From New-27-Missing-Tables-And-Columns.sql --
-- =============================================
-- New-27-Missing-Tables-And-Columns.sql
-- salons tablosuna eksik kolonlar ekle
-- Eksik tabloları oluştur: salon_working_hours, salon_assigned_types, staff, reviews, salon_memberships
-- salon_service_details view'ını oluştur
-- =============================================

-- ============================================
-- 1. SALONS TABLOSUNA EKSİK KOLONLARI EKLE
-- ============================================
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS slug character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS neighborhood character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS avenue character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS street character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS building_no character varying(50);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS apartment_no character varying(50);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS postal_code character varying(20);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS is_closed boolean DEFAULT false;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS plan text DEFAULT 'FREE';
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS min_price numeric(10,2) DEFAULT 0;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#D4A574';

-- ============================================
-- 2. SALON_WORKING_HOURS TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.salon_working_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL DEFAULT '09:00:00',
    end_time time without time zone NOT NULL DEFAULT '19:00:00',
    is_closed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, day_of_week)
);

-- ============================================
-- 3. SALON_ASSIGNED_TYPES TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.salon_assigned_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    type_id uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, type_id)
);

-- ============================================
-- 4. STAFF TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.staff (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    role text,
    phone text,
    photo text,
    user_id uuid REFERENCES public.profiles(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 5. STAFF_SERVICES (SKILLS) TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.staff_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    salon_service_id uuid NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(staff_id, salon_service_id)
);

-- ============================================
-- 6. WORKING_HOURS (STAFF) TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.working_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_day_off boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(staff_id, day_of_week)
);

-- ============================================
-- 7. REVIEWS TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id),
    appointment_id uuid REFERENCES public.appointments(id),
    user_name text NOT NULL,
    user_avatar text,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 8. SALON_MEMBERSHIPS TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.salon_memberships (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text DEFAULT 'STAFF',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, user_id)
);

-- ============================================
-- 9. FAVORITES TABLOSU (IF NOT EXISTS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, salon_id)
);

-- ============================================
-- 10. SALON_TYPE_CATEGORIES (JOIN TABLE)
-- ============================================
CREATE TABLE IF NOT EXISTS public.salon_type_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_type_id uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    service_category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_type_id, service_category_id)
);

-- ============================================
-- 11. RLS POLİTİKALARI
-- ============================================

-- salon_working_hours
ALTER TABLE public.salon_working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for salon_working_hours" ON public.salon_working_hours FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage salon_working_hours" ON public.salon_working_hours FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id::text = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- salon_assigned_types
ALTER TABLE public.salon_assigned_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for salon_assigned_types" ON public.salon_assigned_types FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage salon_assigned_types" ON public.salon_assigned_types FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id::text = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage staff" ON public.staff FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id::text = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- salon_memberships
ALTER TABLE public.salon_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for salon_memberships" ON public.salon_memberships FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage salon_memberships" ON public.salon_memberships FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id::text = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public read for favorites" ON public.favorites;
CREATE POLICY "Public read for favorites" ON public.favorites FOR SELECT USING (true);

-- salon_type_categories
ALTER TABLE public.salon_type_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for salon_type_categories" ON public.salon_type_categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage salon_type_categories" ON public.salon_type_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- staff_services
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for staff_services" ON public.staff_services FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage staff_services" ON public.staff_services FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id::text = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);

-- working_hours (staff)
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for working_hours" ON public.working_hours FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage working_hours" ON public.working_hours FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.staff st
        JOIN public.salons s ON s.id = st.salon_id
        WHERE st.id = staff_id AND s.owner_id::text = auth.uid()::text
    )
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
);


-- From New-28-Complete-DB-Sync.sql --
-- =============================================
-- New-28-Complete-DB-Sync.sql (SELF-CONTAINED)
-- New-27 + New-28 birleştirildi. Tek başına çalıştırılabilir.
-- Tüm ifadeler idempotent: IF NOT EXISTS, DROP...IF EXISTS
-- =============================================

-- Ensure roles exist for Supabase-like environment
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
END $$;

-- ============================================
-- 1. SALONS TABLOSUNA TÜM EKSİK KOLONLAR
-- ============================================
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS slug character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS neighborhood character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS avenue character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS street character varying(255);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS building_no character varying(50);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS apartment_no character varying(50);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS postal_code character varying(20);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS is_closed boolean DEFAULT false;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS plan text DEFAULT 'FREE';
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS min_price numeric(10,2) DEFAULT 0;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS rating double precision DEFAULT 0;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#D4A574';
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- ============================================
-- 2. SALON_SERVICES TABLOSUNA EKSİK KOLONLAR
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='salon_services' AND column_name='global_service_id') THEN
        ALTER TABLE public.salon_services ADD COLUMN global_service_id uuid REFERENCES public.global_services(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='salon_services' AND column_name='is_active') THEN
        ALTER TABLE public.salon_services ADD COLUMN is_active boolean DEFAULT true;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='salon_services' AND column_name='duration_minutes')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='salon_services' AND column_name='duration_min') THEN
        ALTER TABLE public.salon_services RENAME COLUMN duration_minutes TO duration_min;
    END IF;
END $$;

-- ============================================
-- 3. GLOBAL_SERVICES EKSİK KOLONLAR
-- ============================================
ALTER TABLE public.global_services ADD COLUMN IF NOT EXISTS avg_duration_min integer DEFAULT 30;
ALTER TABLE public.global_services ADD COLUMN IF NOT EXISTS avg_price numeric(10,2) DEFAULT 0;

-- appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS staff_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS salon_service_id bigint;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS email text;

-- ============================================
-- 5. EKSİK TABLOLAR (CREATE IF NOT EXISTS)
-- ============================================

-- salon_working_hours
CREATE TABLE IF NOT EXISTS public.salon_working_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL DEFAULT '09:00:00',
    end_time time without time zone NOT NULL DEFAULT '19:00:00',
    is_closed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, day_of_week)
);

-- salon_assigned_types
CREATE TABLE IF NOT EXISTS public.salon_assigned_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    type_id uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, type_id)
);

-- staff
CREATE TABLE IF NOT EXISTS public.staff (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    role text,
    phone text,
    photo text,
    user_id uuid REFERENCES public.profiles(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- staff_services
CREATE TABLE IF NOT EXISTS public.staff_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    salon_service_id bigint NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(staff_id, salon_service_id)
);

-- working_hours (staff)
CREATE TABLE IF NOT EXISTS public.working_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_day_off boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(staff_id, day_of_week)
);

-- reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id),
    appointment_id bigint REFERENCES public.appointments(id),
    user_name text NOT NULL,
    user_avatar text,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- salon_memberships
CREATE TABLE IF NOT EXISTS public.salon_memberships (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text DEFAULT 'STAFF',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, user_id)
);

-- salon_favorites (Renamed from favorites for align)
CREATE TABLE IF NOT EXISTS public.salon_favorites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, salon_id)
);

-- salon_type_categories
CREATE TABLE IF NOT EXISTS public.salon_type_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_type_id uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    service_category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_type_id, service_category_id)
);

-- salon_gallery
CREATE TABLE IF NOT EXISTS public.salon_gallery (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id bigint NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    caption text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- review_images
CREATE TABLE IF NOT EXISTS public.review_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 6. VIEWS (DROP CASCADE + RECREATE)
-- ============================================
DROP VIEW IF EXISTS public.salon_details_with_membership CASCADE;
DROP VIEW IF EXISTS public.salon_details CASCADE;
DROP VIEW IF EXISTS public.verified_reviews_view CASCADE;
DROP VIEW IF EXISTS public.staff_reviews_detailed CASCADE;
DROP VIEW IF EXISTS public.salon_service_details CASCADE;

-- A. SALON_DETAILS
CREATE OR REPLACE VIEW public.salon_details AS
SELECT
    s.id, s.name, s.slug, s.description, s.features, s.tags,
    s.address, s.neighborhood, s.avenue, s.street, s.building_no, s.apartment_no, s.postal_code,
    s.phone, s.image, s.logo_url, s.banner_url, s.primary_color,
    s.geo_latitude, s.geo_longitude,
    s.status, s.is_sponsored, s.is_closed, s.rejected_reason, s.plan, s.min_price,
    s.owner_id, s.city_id, s.district_id, s.type_id,
    COALESCE(c.name, 'Bilinmiyor') AS city_name,
    COALESCE(d.name, 'Bilinmiyor') AS district_name,
    COALESCE(st.name, 'Genel')     AS type_name,
    COALESCE(st.slug, 'genel')     AS type_slug,
    COALESCE(
        (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'is_primary', sat.is_primary))
         FROM public.salon_assigned_types sat
         JOIN public.salon_types t ON t.id = sat.type_id
         WHERE sat.salon_id = s.id),
        '[]'::json
    ) AS assigned_types,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'day_of_week', swh.day_of_week,
            'start_time', swh.start_time,
            'end_time', swh.end_time,
            'is_closed', swh.is_closed
        ) ORDER BY swh.day_of_week)
         FROM public.salon_working_hours swh
         WHERE swh.salon_id = s.id),
        '[]'::json
    ) AS working_hours,
    s.review_count,
    s.rating AS average_rating,
    s.created_at, s.updated_at
FROM public.salons s
LEFT JOIN public.cities      c  ON c.id  = s.city_id
LEFT JOIN public.districts   d  ON d.id  = s.district_id
LEFT JOIN public.salon_types st ON st.id = s.type_id;

-- B. SALON_DETAILS_WITH_MEMBERSHIP
CREATE OR REPLACE VIEW public.salon_details_with_membership AS
SELECT sd.*, 'OWNER'::TEXT AS user_role, sd.owner_id::TEXT AS current_user_id
FROM public.salon_details sd;

-- C. SALON_SERVICE_DETAILS
CREATE OR REPLACE VIEW public.salon_service_details AS
SELECT
    ss.id, 
    ss.salon_id, 
    ss.price, 
    COALESCE(ss.duration_min, ss.duration_minutes) as duration_min, 
    COALESCE(ss.is_active, true) as is_active,
    COALESCE(ss.name, gs.name) AS service_name, 
    sc.name AS category_name,
    sc.icon AS category_icon, 
    sc.slug AS category_slug,
    s.name AS salon_name
FROM public.salon_services ss
LEFT JOIN public.global_services gs ON gs.id = ss.global_service_id
LEFT JOIN public.service_categories sc ON sc.id = gs.category_id
JOIN public.salons s ON s.id = ss.salon_id;

-- D. VERIFIED_REVIEWS_VIEW
CREATE OR REPLACE VIEW public.verified_reviews_view AS
SELECT
    r.id, r.salon_id, r.user_id, r.appointment_id, r.rating, r.comment, r.created_at,
    COALESCE(p.full_name, r.user_name) AS user_name,
    COALESCE(p.avatar_url, r.user_avatar) AS user_avatar,
    a.start_time AS service_date,
    gs.service_name AS service_name,
    (r.appointment_id IS NOT NULL) AS is_verified
FROM public.reviews r
LEFT JOIN public.profiles p ON p.id = r.user_id
LEFT JOIN public.appointments a ON a.id = r.appointment_id
LEFT JOIN public.salon_service_details gs ON gs.id = COALESCE(a.salon_service_id, a.service_id);

-- E. STAFF_REVIEWS_DETAILED (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='staff_reviews') THEN
        EXECUTE '
            CREATE OR REPLACE VIEW public.staff_reviews_detailed AS
            SELECT sr.id, sr.staff_id, sr.salon_id, sr.user_id, sr.appointment_id,
                   sr.rating, sr.comment, sr.is_verified, sr.created_at,
                   s.name AS staff_name, s.photo AS staff_photo,
                   COALESCE(p.full_name, sr.user_name) AS user_name,
                   COALESCE(p.avatar_url, sr.user_avatar) AS user_avatar
            FROM public.staff_reviews sr
            JOIN public.staff s ON s.id = sr.staff_id
            LEFT JOIN public.profiles p ON p.id = sr.user_id';
    END IF;
END $$;

-- ============================================
-- 7. RLS POLİTİKALARI (idempotent: DROP IF EXISTS + CREATE)
-- ============================================

-- salon_working_hours
ALTER TABLE public.salon_working_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read salon working hours" ON public.salon_working_hours;
CREATE POLICY "Public read salon working hours" ON public.salon_working_hours FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage salon working hours" ON public.salon_working_hours;
CREATE POLICY "Owners manage salon working hours" ON public.salon_working_hours
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage all salon working hours" ON public.salon_working_hours;
CREATE POLICY "Admins manage all salon working hours" ON public.salon_working_hours FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- salon_assigned_types
ALTER TABLE public.salon_assigned_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.salon_assigned_types;
CREATE POLICY "Public Read Access" ON public.salon_assigned_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage own salon types" ON public.salon_assigned_types;
CREATE POLICY "Owners manage own salon types" ON public.salon_assigned_types
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()))
    WITH CHECK (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view staff" ON public.staff;
CREATE POLICY "Public view staff" ON public.staff FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage staff" ON public.staff;
CREATE POLICY "Owners manage staff" ON public.staff
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage all staff" ON public.staff;
CREATE POLICY "Admins manage all staff" ON public.staff FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- staff_services
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view staff services" ON public.staff_services;
CREATE POLICY "Public view staff services" ON public.staff_services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage staff services" ON public.staff_services;
CREATE POLICY "Owners manage staff services" ON public.staff_services
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage all staff services" ON public.staff_services;
CREATE POLICY "Admins manage all staff services" ON public.staff_services FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- working_hours (staff)
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view working hours" ON public.working_hours;
CREATE POLICY "Public view working hours" ON public.working_hours FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage working hours" ON public.working_hours;
CREATE POLICY "Owners manage working hours" ON public.working_hours
    FOR ALL USING (staff_id IN (SELECT id FROM public.staff WHERE salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())));
DROP POLICY IF EXISTS "Admins manage all working hours" ON public.working_hours;
CREATE POLICY "Admins manage all working hours" ON public.working_hours FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can leave reviews" ON public.reviews;
CREATE POLICY "Authenticated users can leave reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- salon_memberships
ALTER TABLE public.salon_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.salon_memberships;
CREATE POLICY "Users can view their own memberships" ON public.salon_memberships FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Owners manage memberships" ON public.salon_memberships;
CREATE POLICY "Owners manage memberships" ON public.salon_memberships
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage all memberships" ON public.salon_memberships;
CREATE POLICY "Admins manage all memberships" ON public.salon_memberships FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- salon_favorites
ALTER TABLE public.salon_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own favorites" ON public.salon_favorites;
CREATE POLICY "Users manage own favorites" ON public.salon_favorites FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public read favorites" ON public.salon_favorites;
CREATE POLICY "Public read favorites" ON public.salon_favorites FOR SELECT USING (true);

-- salon_type_categories
ALTER TABLE public.salon_type_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read salon_type_categories" ON public.salon_type_categories;
CREATE POLICY "Public read salon_type_categories" ON public.salon_type_categories FOR SELECT USING (true);

-- salon_gallery
ALTER TABLE public.salon_gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read salon_gallery" ON public.salon_gallery;
CREATE POLICY "Public read salon_gallery" ON public.salon_gallery FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage salon_gallery" ON public.salon_gallery;
CREATE POLICY "Owners manage salon_gallery" ON public.salon_gallery
    FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- review_images
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read review_images" ON public.review_images;
CREATE POLICY "Public read review_images" ON public.review_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated insert review_images" ON public.review_images;
CREATE POLICY "Authenticated insert review_images" ON public.review_images FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- appointments (write policies)
DROP POLICY IF EXISTS "Customers can create appointments" ON public.appointments;
CREATE POLICY "Customers can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Salon owners manage appointments" ON public.appointments;
CREATE POLICY "Salon owners manage appointments" ON public.appointments
    FOR UPDATE USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage all appointments" ON public.appointments;
CREATE POLICY "Admins manage all appointments" ON public.appointments FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- ============================================
-- 8. VIEW YETKILERI
-- ============================================
GRANT SELECT ON public.salon_details TO anon, authenticated;
GRANT SELECT ON public.salon_details_with_membership TO authenticated;
GRANT SELECT ON public.salon_service_details TO anon, authenticated;
GRANT SELECT ON public.verified_reviews_view TO anon, authenticated;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='staff_reviews_detailed') THEN
        EXECUTE 'GRANT SELECT ON public.staff_reviews_detailed TO anon, authenticated';
    END IF;
END $$;

-- =============================================
-- TAMAMLANDI: New-28-Complete-DB-Sync.sql
-- =============================================


-- From New-29-iyzico-Subscription-System.sql --
-- =============================================================================
-- New-29-iyzico-Subscription-System.sql
-- iyzico (Subscription + Marketplace + Link API) & IBAN System
-- =============================================================================

-- 1. UPDATE PLAN ENUM VALUES
DO $$
BEGIN
    ALTER TABLE public.salons DROP CONSTRAINT IF EXISTS salons_plan_check;
    UPDATE public.salons SET plan = 'STARTER' WHERE plan IN ('FREE', NULL);
    UPDATE public.salons SET plan = 'ELITE' WHERE plan = 'ENTERPRISE';
    ALTER TABLE public.salons ALTER COLUMN plan SET DEFAULT 'STARTER';
    ALTER TABLE public.salons ADD CONSTRAINT salons_plan_check CHECK (plan IN ('STARTER', 'PRO', 'ELITE'));
END $$;

-- 2. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,         -- STARTER, PRO, ELITE
    display_name text NOT NULL,
    description text,
    price_monthly integer NOT NULL DEFAULT 0, -- Kuruş
    max_branches integer NOT NULL DEFAULT 1,
    max_staff integer NOT NULL DEFAULT 3,
    max_gallery_photos integer NOT NULL DEFAULT 3,
    max_sms_monthly integer NOT NULL DEFAULT 0,
    has_advanced_reports boolean DEFAULT false,
    has_excel_export boolean DEFAULT false,
    has_campaigns boolean DEFAULT false,
    has_sponsored boolean DEFAULT false,
    support_level text DEFAULT 'NORMAL', -- NORMAL, PRIORITY, DEDICATED
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 3. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE UNIQUE,
    plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_APPROVAL', 'CANCELLED', 'PAST_DUE', 'EXPIRED')),
    iyzico_subscription_ref text,
    payment_method text DEFAULT 'IYZICO' CHECK (payment_method IN ('IYZICO', 'BANK_TRANSFER')),
    current_period_start timestamptz DEFAULT now(),
    current_period_end timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. SALON SUB-MERCHANTS & BANK INFO
CREATE TABLE IF NOT EXISTS public.salon_sub_merchants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE UNIQUE,
    iyzico_sub_merchant_key text,
    iban text NOT NULL,
    bank_name text,
    account_owner text,
    sub_merchant_type text DEFAULT 'PERSONAL' CHECK (sub_merchant_type IN ('PERSONAL', 'PRIVATE_COMPANY', 'LIMITED_OR_JOINT_STOCK')),
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'REJECTED')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. PAYMENT HISTORY
CREATE TABLE IF NOT EXISTS public.payment_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    payment_type text NOT NULL CHECK (payment_type IN ('SUBSCRIPTION', 'APPOINTMENT', 'REFUND')),
    payment_method text NOT NULL CHECK (payment_method IN ('IYZICO_CC', 'IYZICO_LINK', 'BANK_TRANSFER')),
    amount integer NOT NULL, -- Kuruş
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING', 'REFUNDED')),
    iyzico_payment_id text,
    iyzico_link_id text,
    bank_transfer_notified_at timestamptz, -- Havale bildirimi zamanı
    bank_transfer_proof_url text,           -- Opsiyonel dekont
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 6. PLATFORM SETTINGS
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamptz DEFAULT now()
);

-- index, RLS ve Seed verileri Implementation Plan'a paralel eklenecektir.
-- Faz 1 kapsamında şu an sadece tabloları oluşturuyoruz.

-- SEED PLANS
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level, sort_order)
VALUES 
    ('STARTER', 'Başlangıç', 'Ücretsiz temel plan', 0, 1, 3, 3, 0, false, false, false, 'NORMAL', 1),
    ('PRO', 'Pro', 'Küçük ve orta ölçekli salonlar', 49900, 3, 10, 20, 500, true, true, true, 'PRIORITY', 2),
    ('ELITE', 'Elite', 'Sınırsız özellikler', 99900, -1, -1, -1, -1, true, true, true, 'DEDICATED', 3)
ON CONFLICT (name) DO NOTHING;

-- SEED BANK INFO
INSERT INTO public.platform_settings (key, value)
VALUES ('bank_accounts', '[{"bank": "Ziraat Bankası", "owner": "Güzellik Randevu Platformu", "iban": "TR00...", "description": "Lütfen ödeme açıklamasında SalonID belirtiniz."}]')
ON CONFLICT (key) DO NOTHING;


-- From New-30-Add-Business-Plan.sql --
-- =============================================================================
-- New-30-Professional-Subscription-Plans-Redesign.sql
-- Re-designs subscription plans with optimized limits, features, and pricing.
-- =============================================================================

-- Add missing column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscription_plans' AND column_name='description_features') THEN
        ALTER TABLE public.subscription_plans ADD COLUMN description_features jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Clear existing plans to ensure fresh start (optional, using UPSERT logic below)
-- DELETE FROM public.subscription_plans;

-- 1. STARTER (Giriş - Ücretsiz)
INSERT INTO public.subscription_plans 
(name, display_name, description, description_features, price_monthly, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level, sort_order)
VALUES 
('STARTER', 'Starter', 'Sisteme harika bir başlangıç için temel özellikler', '[]', 0, 1, 2, 5, 0, false, false, false, 'STANDARD', 1)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    description_features = EXCLUDED.description_features,
    price_monthly = EXCLUDED.price_monthly,
    max_branches = EXCLUDED.max_branches,
    max_staff = EXCLUDED.max_staff,
    max_gallery_photos = EXCLUDED.max_gallery_photos,
    max_sms_monthly = EXCLUDED.max_sms_monthly,
    has_advanced_reports = EXCLUDED.has_advanced_reports,
    has_campaigns = EXCLUDED.has_campaigns,
    has_sponsored = EXCLUDED.has_sponsored,
    support_level = EXCLUDED.support_level,
    sort_order = EXCLUDED.sort_order;

-- 2. PRO (Standart - Butik Salonlar)
INSERT INTO public.subscription_plans 
(name, display_name, description, description_features, price_monthly, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level, sort_order)
VALUES 
('PRO', 'Pro', 'Tek şubeli, büyüyen butik salonlar için ideal', '["Gelişmiş Raporlar", "30 Galeri Fotoğrafı", "250 Aylık SMS"]', 29900, 1, 5, 30, 250, true, false, false, 'STANDARD', 2)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    max_branches = EXCLUDED.max_branches,
    max_staff = EXCLUDED.max_staff,
    max_gallery_photos = EXCLUDED.max_gallery_photos,
    max_sms_monthly = EXCLUDED.max_sms_monthly,
    has_advanced_reports = EXCLUDED.has_advanced_reports,
    has_campaigns = EXCLUDED.has_campaigns,
    has_sponsored = EXCLUDED.has_sponsored,
    support_level = EXCLUDED.support_level,
    sort_order = EXCLUDED.sort_order;

-- 3. BUSINESS (Büyüyen - Çok Şubeli Markalar)
INSERT INTO public.subscription_plans 
(name, display_name, description, description_features, price_monthly, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level, sort_order)
VALUES 
('BUSINESS', 'Business', 'Birden fazla şubesi olan ve ivme yakalayan markalar', '["10 Şube Desteği", "Kampanya Yönetimi", "1000 Aylık SMS", "Öncelikli Destek"]', 69900, 5, 15, 100, 1000, true, true, false, 'PRIORITY', 3)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    max_branches = EXCLUDED.max_branches,
    max_staff = EXCLUDED.max_staff,
    max_gallery_photos = EXCLUDED.max_gallery_photos,
    max_sms_monthly = EXCLUDED.max_sms_monthly,
    has_advanced_reports = EXCLUDED.has_advanced_reports,
    has_campaigns = EXCLUDED.has_campaigns,
    has_sponsored = EXCLUDED.has_sponsored,
    support_level = EXCLUDED.support_level,
    sort_order = EXCLUDED.sort_order;

-- 4. ELITE (Kurumsal - Büyük Zincirler)
INSERT INTO public.subscription_plans 
(name, display_name, description, description_features, price_monthly, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level, sort_order)
VALUES 
('ELITE', 'Elite', 'Sınırsız güç ve platform üzerinde sponsorlu vitrin özelliği', '["Sınırsız Şube/Personel", "Sponsorlu Vitrin", "5000 Aylık SMS", "VIP Destek"]', 149900, -1, -1, -1, 5000, true, true, true, 'VIP', 4)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    max_branches = EXCLUDED.max_branches,
    max_staff = EXCLUDED.max_staff,
    max_gallery_photos = EXCLUDED.max_gallery_photos,
    max_sms_monthly = EXCLUDED.max_sms_monthly,
    has_advanced_reports = EXCLUDED.has_advanced_reports,
    has_campaigns = EXCLUDED.has_campaigns,
    has_sponsored = EXCLUDED.has_sponsored,
    support_level = EXCLUDED.support_level,
    sort_order = EXCLUDED.sort_order;


-- From New-31-Marketplace-Setup.sql --
-- =============================================================================
-- New-31-Marketplace-Setup.sql
-- RLS Policies, Triggers and Initial Settings for Marketplace
-- =============================================================================

-- 1. RLS POLICIES FOR NEW TABLES

-- platform_settings (Admin only write, everyone read for specific keys?)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can do everything on platform_settings" ON public.platform_settings
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));
CREATE POLICY "Public can read non-sensitive platform_settings" ON public.platform_settings
    FOR SELECT USING (key IN ('bank_accounts', 'iyzico_config_public')); -- Sensitive keys (secretKey) are internal

-- subscription_plans (Public read, Admin write)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read active subscription_plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage subscription_plans" ON public.subscription_plans
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));

-- subscriptions (Owner read/write profile-specific, Admin all)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can see their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM public.salons WHERE id = salon_id));
CREATE POLICY "Admin can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));

-- salon_sub_merchants (Owner read/write, Admin all)
ALTER TABLE public.salon_sub_merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage their sub-merchant info" ON public.salon_sub_merchants
    FOR ALL USING (auth.uid() IN (SELECT owner_id FROM public.salons WHERE id = salon_id));
CREATE POLICY "Admin can manage all sub-merchants" ON public.salon_sub_merchants
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));

-- payment_history (Owner read their salon, Admin all)
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can see their payment history" ON public.payment_history
    FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM public.salons WHERE id = salon_id));
CREATE POLICY "Admin can manage payment history" ON public.payment_history
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));


-- 2. AUTOMATION: Trigger to create sub-merchant record for new salons
CREATE OR REPLACE FUNCTION public.handle_new_salon_marketplace()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.salon_sub_merchants (salon_id, iban, bank_name, account_owner, status)
    VALUES (NEW.id, 'TR', '', '', 'PENDING');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_salon_created_marketplace ON public.salons;
CREATE TRIGGER on_salon_created_marketplace
    AFTER INSERT ON public.salons
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_salon_marketplace();


-- 3. GLOBAL SETTINGS
INSERT INTO public.platform_settings (key, value)
VALUES ('platform_commission_rate', '{"rate": 5, "description": "Randevu başı yüzde komisyon"}')
ON CONFLICT (key) DO NOTHING;

-- 4. FIX FOR SUB-MERCHANT STATUS
-- Ensure existing salons have a sub-merchant record
INSERT INTO public.salon_sub_merchants (salon_id, iban, bank_name, account_owner, status)
SELECT id, 'TR', '', '', 'PENDING' FROM public.salons
ON CONFLICT (salon_id) DO NOTHING;


-- From New-32-Yearly-Subscription-Support.sql --
-- =============================================================================
-- New-32-Yearly-Subscription-Support.sql
-- Yearly Pricing for Subscription Plans & Billing Cycle Support
-- =============================================================================

-- 1. Update subscription_plans table
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS price_yearly integer; -- Kuruş cinsinden yıllık fiyat

-- 2. Update existing plans with yearly prices (Approx. 20% discount)
UPDATE public.subscription_plans SET price_yearly = 0 WHERE name = 'STARTER';
UPDATE public.subscription_plans SET price_yearly = 499000 WHERE name = 'PRO'; -- 499 * 10 = 4990 TL (12 ay için)
UPDATE public.subscription_plans SET price_yearly = 999000 WHERE name = 'ELITE'; -- 999 * 10 = 9990 TL (12 ay için)

-- 3. Update subscriptions table for cycle tracking
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'MONTHLY' 
CHECK (billing_cycle IN ('MONTHLY', 'YEARLY'));

-- 4. Update RLS (Ensure new columns are visible to owners)
-- RLS policies usually cover the whole table, so no specific column-level RLS needed 
-- unless explicit restricted.

-- 5. Comments
COMMENT ON COLUMN public.subscription_plans.price_yearly IS 'Kuruş cinsinden yıllık abonelik ücreti.';
COMMENT ON COLUMN public.subscriptions.billing_cycle IS 'Abonelik faturalandırma periyodu (Aylık/Yıllık).';


-- From New-35-Subscription-Expiry-Job.sql --
-- Description: Subscription Expiry Handler
-- This script creates a function to check and expire subscriptions that have passed their end date.
-- It also updates the salon status to 'PASSED_DUE' or similar if needed.

-- 1. Create function to check and expire subscriptions
CREATE OR REPLACE FUNCTION public.check_expired_subscriptions()
RETURNS void AS $$
BEGIN
    -- Update subscriptions that are past their period end and still ACTIVE
    UPDATE public.subscriptions
    SET status = 'EXPIRED',
        updated_at = NOW()
    WHERE status = 'ACTIVE'
    AND current_period_end < NOW();

    -- Assuming salons should be suspended when they don't have an active sub
    UPDATE public.salons
    SET status = 'SUSPENDED'
    FROM public.subscriptions s
    WHERE s.salon_id = public.salons.id
    AND s.status = 'EXPIRED'
    AND public.salons.status = 'APPROVED';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant permissions (Adjust as needed for your cron runner)
GRANT EXECUTE ON FUNCTION public.check_expired_subscriptions() TO postgres;
GRANT EXECUTE ON FUNCTION public.check_expired_subscriptions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_expired_subscriptions() TO service_role;

-- NOTE: Since Supabase doesn't support built-in pg_cron on free tier easily,
-- this function can be called via an Edge Function Cron or a Database Webhook Trigger.
-- Alternatively, if we want to check ON-THE-FLY when a salon is accessed:

CREATE OR REPLACE FUNCTION public.auto_expire_on_access()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'ACTIVE' AND OLD.current_period_end < NOW() THEN
        NEW.status := 'EXPIRED';
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_auto_expire_subscription ON public.subscriptions;
CREATE TRIGGER tr_auto_expire_subscription
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_expire_on_access();


-- From New-36-Marketplace-Best-Practices.sql --
-- =============================================================================
-- New-36-Marketplace-Best-Practices.sql
-- iyzico Webhook Auditing, Atomic Activation RPC and Usage Stats View
-- =============================================================================

-- 1. WEBHOOK AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.iyzico_webhooks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    iyzi_event_type text,
    payload jsonb NOT NULL,
    status text DEFAULT 'RECEIVED', -- RECEIVED, PROCESSED, ERROR
    error_message text,
    processed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_iyzico_webhooks_created_at ON public.iyzico_webhooks(created_at DESC);

-- 2. ATOMIC ACTIVATION RPC
-- This function ensures both salon and subscription are updated in a single transaction.
CREATE OR REPLACE FUNCTION public.activate_salon_and_subscription(
    p_salon_id uuid,
    p_subscription_id uuid,
    p_admin_note text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- 1. Activate Subscription
    UPDATE public.subscriptions
    SET 
        status = 'ACTIVE',
        updated_at = NOW()
    WHERE id = p_subscription_id;

    -- 2. Activate Salon
    UPDATE public.salons
    SET 
        status = 'APPROVED',
        is_verified = true,
        updated_at = NOW()
    WHERE id = p_salon_id;

    -- 3. Update Payment History status if applicable
    UPDATE public.payment_history
    SET 
        status = 'SUCCESS',
        metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{admin_note}', to_jsonb(p_admin_note))
    WHERE subscription_id = p_subscription_id AND status = 'PENDING';

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Activation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. SALON USAGE STATISTICS VIEW
-- Centralized view to see usage vs limits for Dashboard Widgets
CREATE OR REPLACE VIEW public.salon_usage_stats AS
SELECT 
    s.id as salon_id,
    s.name as salon_name,
    sp.name as plan_name,
    sp.display_name as plan_display_name,
    -- Staff count
    (SELECT count(*) FROM public.staff WHERE salon_id = s.id AND is_active = true) as current_staff,
    sp.max_staff as limit_staff,
    -- branch count (if many-to-one exists or assumed 1 for now)
    1 as current_branches,
    sp.max_branches as limit_branches,
    -- Gallery count
    (SELECT count(*) FROM public.salon_gallery WHERE salon_id = s.id) as current_gallery_photos,
    sp.max_gallery_photos as limit_gallery_photos,
    -- Feature flags
    sp.has_advanced_reports,
    sp.has_campaigns,
    sp.has_sponsored,
    -- Sub status
    sub.status as subscription_status,
    sub.current_period_end as subscription_expires_at
FROM 
    public.salons s
JOIN 
    public.subscriptions sub ON sub.salon_id = s.id
JOIN 
    public.subscription_plans sp ON sub.plan_id = sp.id;

-- 4. Permissions
GRANT ALL ON public.iyzico_webhooks TO postgres;
GRANT ALL ON public.iyzico_webhooks TO service_role;
GRANT SELECT ON public.salon_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_salon_and_subscription TO service_role;
GRANT EXECUTE ON FUNCTION public.activate_salon_and_subscription TO authenticated; -- Authorized check should be in RLS or Service


-- From New-37-Subscription-Plans-Final.sql --
-- =============================================================================
-- New-37-Subscription-Plans-Final.sql
-- Fixes pricing, ordering, and annual plan values. 
-- Also fixes visibility issues for Home page by granting permissions.
-- =============================================================================

-- 1. Ensure price_yearly column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscription_plans' AND column_name='price_yearly') THEN
        ALTER TABLE public.subscription_plans ADD COLUMN price_yearly integer;
    END IF;
END $$;

-- 2. Update/Upsert Plans with correct progression and annual prices (10 months rule)
INSERT INTO public.subscription_plans 
(name, display_name, description, price_monthly, price_yearly, sort_order, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level)
VALUES 
('STARTER', 'Başlangıç', 'Sisteme harika bir başlangıç için temel özellikler', 0, 0, 1, 1, 3, 3, 0, false, false, false, 'STANDARD'),
('PRO', 'Pro', 'Tek şubeli, büyüyen butik salonlar için ideal', 49900, 499000, 2, 1, 5, 30, 250, true, false, false, 'STANDARD'),
('BUSINESS', 'Business', 'Birden fazla şubesi olan ve ivme yakalayan markalar', 74900, 749000, 3, 5, 15, 100, 1000, true, true, false, 'PRIORITY'),
('ELITE', 'Elite', 'Sınırsız güç ve platform üzerinde sponsorlu vitrin özelliği', 99900, 999000, 4, -1, -1, -1, 5000, true, true, true, 'VIP')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    sort_order = EXCLUDED.sort_order,
    max_branches = EXCLUDED.max_branches,
    max_staff = EXCLUDED.max_staff,
    max_gallery_photos = EXCLUDED.max_gallery_photos,
    max_sms_monthly = EXCLUDED.max_sms_monthly,
    has_advanced_reports = EXCLUDED.has_advanced_reports,
    has_campaigns = EXCLUDED.has_campaigns,
    has_sponsored = EXCLUDED.has_sponsored,
    support_level = EXCLUDED.support_level;

-- 3. Fix Permissions for Anonymous and Authenticated users (Home page visibility)
GRANT SELECT ON public.cities TO anon, authenticated;
GRANT SELECT ON public.districts TO anon, authenticated;
GRANT SELECT ON public.salon_types TO anon, authenticated;
GRANT SELECT ON public.global_services TO anon, authenticated;
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT SELECT ON public.service_categories TO anon, authenticated;
GRANT SELECT ON public.salons TO anon, authenticated;
GRANT SELECT ON public.salon_assigned_types TO anon, authenticated;

-- 4. Recreate View (Drop first to avoid 42P16)
DROP VIEW IF EXISTS public.salon_details_with_membership CASCADE;
DROP VIEW IF EXISTS public.salon_details CASCADE;

CREATE OR REPLACE VIEW public.salon_details AS
 SELECT s.id,
    s.name,
    s.description,
    s.features,
    s.address,
    s.neighborhood,
    s.street,
    s.building_no,
    s.apartment_no,
    s.phone,
    s.geo_latitude,
    s.geo_longitude,
    s.image,
    s.is_sponsored,
    s.status,
    s.rejected_reason,
    s.owner_id,
    COALESCE(c.name, 'Bilinmiyor'::text) AS city_name,
    COALESCE(d.name, 'Bilinmiyor'::text) AS district_name,
    COALESCE(st.name, 'Genel'::text) AS type_name,
    COALESCE(st.slug, 'genel'::text) AS type_slug,
    ( SELECT array_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'is_primary', sat.is_primary)) AS array_agg
           FROM (public.salon_assigned_types sat
             JOIN public.salon_types t ON ((sat.type_id = t.id)))
          WHERE (sat.salon_id = s.id)) AS assigned_types,
    0 AS review_count,
    0 AS average_rating,
    s.created_at
   FROM (((public.salons s
     LEFT JOIN public.cities c ON ((s.city_id = c.id)))
     LEFT JOIN public.districts d ON ((s.district_id = d.id)))
     LEFT JOIN public.salon_types st ON ((s.type_id = st.id)));

-- Permissions for view
GRANT SELECT ON public.salon_details TO anon, authenticated;


