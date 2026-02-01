-- Tables and Sequences

CREATE TABLE public.appointments (
    id bigint NOT NULL,
    end_time timestamp(6) without time zone,
    start_time timestamp(6) without time zone,
    status character varying(255),
    customer_id bigint,
    salon_id bigint,
    service_id bigint,
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'COMPLETED'::character varying])::text[])))
);

CREATE SEQUENCE public.appointments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;

CREATE TABLE public.cities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    plate_code integer NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.districts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    city_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.global_services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    category_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id bigint NOT NULL,
    email text NOT NULL,
    role public.user_role DEFAULT 'STAFF'::public.user_role,
    token text NOT NULL,
    status public.invite_status DEFAULT 'PENDING'::public.invite_status,
    inviter_id uuid NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    accepted_at timestamp with time zone
);

CREATE TABLE public.iys_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    phone text NOT NULL,
    message_type public.iys_msg_type NOT NULL,
    content text NOT NULL,
    status public.iys_status NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'SYSTEM'::text,
    is_read boolean DEFAULT false,
    action_url text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.otp_codes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    phone text NOT NULL,
    code text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    phone text,
    role public.user_role DEFAULT 'CUSTOMER'::public.user_role,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    first_name text,
    last_name text
);

CREATE TABLE public.salon_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text,
    image text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.salons (
    id bigint NOT NULL,
    address character varying(255),
    description character varying(255),
    is_verified boolean NOT NULL,
    location public.geometry(Point,4326),
    name character varying(255),
    rating double precision,
    owner_id bigint NOT NULL,
    status public.salon_status DEFAULT 'DRAFT'::public.salon_status,
    rejected_reason text,
    city_id uuid,
    district_id uuid,
    type_id uuid,
    geo_latitude numeric(10,8),
    geo_longitude numeric(11,8),
    image text,
    is_sponsored boolean DEFAULT false,
    features jsonb DEFAULT '[]'::jsonb,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Views
CREATE VIEW public.salon_details AS
 SELECT s.id,
    s.name,
    s.description,
    s.features,
    s.address,
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
    0 AS review_count,
    0 AS average_rating,
    s.created_at
   FROM (((public.salons s
     LEFT JOIN public.cities c ON ((s.city_id = c.id)))
     LEFT JOIN public.districts d ON ((s.district_id = d.id)))
     LEFT JOIN public.salon_types st ON ((s.type_id = st.id)));

CREATE VIEW public.salon_details_with_membership AS
 SELECT id,
    name,
    description,
    features,
    address,
    phone,
    geo_latitude,
    geo_longitude,
    image,
    is_sponsored,
    status,
    rejected_reason,
    owner_id,
    city_name,
    district_name,
    type_name,
    type_slug,
    review_count,
    average_rating,
    created_at,
    'OWNER'::text AS user_role,
    (owner_id)::text AS current_user_id
   FROM public.salon_details s;

CREATE TABLE public.salon_services (
    id bigint NOT NULL,
    duration_minutes integer,
    name character varying(255),
    price numeric(38,2),
    salon_id bigint
);

CREATE SEQUENCE public.salon_services_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.salon_services_id_seq OWNED BY public.salon_services.id;

CREATE SEQUENCE public.salons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.salons_id_seq OWNED BY public.salons.id;

CREATE TABLE public.service_categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.users (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    email character varying(255) NOT NULL,
    first_name character varying(255),
    is_active boolean NOT NULL,
    last_name character varying(255),
    password character varying(255) NOT NULL,
    role character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'HAIRDRESSER'::character varying, 'ADMIN'::character varying])::text[])))
);

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

-- Sequence Defaults
ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);
ALTER TABLE ONLY public.salon_services ALTER COLUMN id SET DEFAULT nextval('public.salon_services_id_seq'::regclass);
ALTER TABLE ONLY public.salons ALTER COLUMN id SET DEFAULT nextval('public.salons_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

-- Constraints and Primary Keys
ALTER TABLE ONLY public.appointments ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.cities ADD CONSTRAINT cities_name_key UNIQUE (name);
ALTER TABLE ONLY public.cities ADD CONSTRAINT cities_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.cities ADD CONSTRAINT cities_plate_code_key UNIQUE (plate_code);
ALTER TABLE ONLY public.districts ADD CONSTRAINT districts_city_id_name_key UNIQUE (city_id, name);
ALTER TABLE ONLY public.districts ADD CONSTRAINT districts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.global_services ADD CONSTRAINT global_services_category_id_name_key UNIQUE (category_id, name);
ALTER TABLE ONLY public.global_services ADD CONSTRAINT global_services_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.invites ADD CONSTRAINT invites_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.invites ADD CONSTRAINT invites_token_key UNIQUE (token);
ALTER TABLE ONLY public.iys_logs ADD CONSTRAINT iys_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.otp_codes ADD CONSTRAINT otp_codes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
ALTER TABLE ONLY public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.salon_services ADD CONSTRAINT salon_services_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.salon_types ADD CONSTRAINT salon_types_name_key UNIQUE (name);
ALTER TABLE ONLY public.salon_types ADD CONSTRAINT salon_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.salon_types ADD CONSTRAINT salon_types_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.salons ADD CONSTRAINT salons_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.service_categories ADD CONSTRAINT service_categories_name_key UNIQUE (name);
ALTER TABLE ONLY public.service_categories ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.service_categories ADD CONSTRAINT service_categories_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.users ADD CONSTRAINT uk_6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);
ALTER TABLE ONLY public.salons ADD CONSTRAINT uk_6fir817ee3gbq1tr9skvy373u UNIQUE (owner_id);
ALTER TABLE ONLY public.otp_codes ADD CONSTRAINT unique_active_otp UNIQUE (phone, code);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Indexes
CREATE INDEX idx_otp_cleanup ON public.otp_codes USING btree (expires_at) WHERE (used = false);
CREATE INDEX idx_otp_phone_expires ON public.otp_codes USING btree (phone, expires_at) WHERE (used = false);

-- Foreign Keys
ALTER TABLE ONLY public.districts ADD CONSTRAINT districts_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.appointments ADD CONSTRAINT fk4q5rt20vvnkv7eohwq22l3ayy FOREIGN KEY (customer_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.appointments ADD CONSTRAINT fk6eufma68nfpop0y70rect7wxr FOREIGN KEY (service_id) REFERENCES public.salon_services(id);
ALTER TABLE ONLY public.salons ADD CONSTRAINT fk98acq1e3p3p8bm8hjv611yyn8 FOREIGN KEY (owner_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.salon_services ADD CONSTRAINT fkegyh145ukwo5iowe4x4bow6fa FOREIGN KEY (salon_id) REFERENCES public.salons(id);
ALTER TABLE ONLY public.appointments ADD CONSTRAINT fkn7uk5bmcf2qd5oam22wfqcx3j FOREIGN KEY (salon_id) REFERENCES public.salons(id);
ALTER TABLE ONLY public.global_services ADD CONSTRAINT global_services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.invites ADD CONSTRAINT invites_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES public.profiles(id);
ALTER TABLE ONLY public.invites ADD CONSTRAINT invites_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;
