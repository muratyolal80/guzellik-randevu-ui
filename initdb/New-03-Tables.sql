-- Tables and Sequences

-- 1. APPOINTMENTS
CREATE TABLE public.appointments (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
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
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    plate_code integer NOT NULL UNIQUE,
    latitude numeric(10,8),
    longitude numeric(11,8),
    created_at timestamp with time zone DEFAULT now()
);

-- 3. DISTRICTS
CREATE TABLE public.districts (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(city_id, name)
);

-- 4. SERVICE CATEGORIES
CREATE TABLE public.service_categories (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    icon text,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. GLOBAL SERVICES
CREATE TABLE public.global_services (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    name text NOT NULL,
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
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    icon text,
    image text,
    created_at timestamp with time zone DEFAULT now()
);

-- 8. SALONS
CREATE TABLE public.salons (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
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
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    type_id uuid NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(salon_id, type_id)
);

-- 10. SALON SERVICES
CREATE TABLE public.salon_services (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
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
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
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
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    salon_service_id uuid NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(staff_id, salon_service_id)
);

-- 13. WORKING HOURS (Staff)
CREATE TABLE public.working_hours (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
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
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
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
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
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
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
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
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
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
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    phone text NOT NULL,
    code text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(phone, code)
);

-- 13. FAVORITES
CREATE TABLE public.favorites (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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
