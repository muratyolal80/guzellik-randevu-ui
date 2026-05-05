--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tiger;


--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tiger_data;


--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA topology;


--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: appt_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.appt_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED'
);


--
-- Name: invite_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.invite_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: iys_msg_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.iys_msg_type AS ENUM (
    'OTP',
    'INFO',
    'CAMPAIGN'
);


--
-- Name: iys_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.iys_status AS ENUM (
    'SENT',
    'FAILED',
    'DEMO'
);


--
-- Name: salon_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.salon_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'CUSTOMER',
    'STAFF',
    'SALON_OWNER',
    'SUPER_ADMIN'
);


--
-- Name: check_is_salon_owner(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: cleanup_expired_otps(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_otps() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    DELETE FROM public.otp_codes

    WHERE expires_at < NOW() - INTERVAL '1 day';

END;

$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: handle_new_user_role_protection(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_role_protection() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    -- Force role to 'CUSTOMER' if it's not already set via a secure process.

    -- If the user_metadata has a role, we check if it's 'CUSTOMER'.

    -- The only exception is if the role is 'SALON_OWNER' coming from our specific business registration page,

    -- but for maximum security in a public API, we usually want a separate verification or 

    -- only allow CUSTOMER by default and escalate via admin/process.

    

    -- Business Logic: For now, if no role is provided or it's not a known secure path, force CUSTOMER.

    -- (Next.js context passes metadata. For this MVP, we trust the metadata from our signup calls,

    -- but we ensure IT IS a valid role from our enum).

    

    IF NEW.raw_user_meta_data->>'role' IS NULL THEN

        NEW.raw_user_meta_data = jsonb_set(

            COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),

            '{role}',

            '"CUSTOMER"'

        );

    END IF;



    -- Sync to public.profiles (This is handled by another trigger usually, but let's ensure it's safe)

    RETURN NEW;

END;

$$;


--
-- Name: is_admin_v3(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: on_salon_created_add_membership(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = NOW();

RETURN NEW;

END;

$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appointments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    plate_code integer NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    city_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: global_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    category_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: invites; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: iys_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.iys_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    phone text NOT NULL,
    message_type public.iys_msg_type NOT NULL,
    content text NOT NULL,
    status public.iys_status NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: otp_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_codes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    phone text NOT NULL,
    code text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: salon_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text,
    image text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: salons; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: salon_details; Type: VIEW; Schema: public; Owner: -
--

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


--
-- Name: salon_details_with_membership; Type: VIEW; Schema: public; Owner: -
--

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


--
-- Name: salon_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_services (
    id bigint NOT NULL,
    duration_minutes integer,
    name character varying(255),
    price numeric(38,2),
    salon_id bigint
);


--
-- Name: salon_services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.salon_services_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: salon_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.salon_services_id_seq OWNED BY public.salon_services.id;


--
-- Name: salons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.salons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: salons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.salons_id_seq OWNED BY public.salons.id;


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: salon_services id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_services ALTER COLUMN id SET DEFAULT nextval('public.salon_services_id_seq'::regclass);


--
-- Name: salons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons ALTER COLUMN id SET DEFAULT nextval('public.salons_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: cities cities_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_name_key UNIQUE (name);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: cities cities_plate_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_plate_code_key UNIQUE (plate_code);


--
-- Name: districts districts_city_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_city_id_name_key UNIQUE (city_id, name);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: global_services global_services_category_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_services
    ADD CONSTRAINT global_services_category_id_name_key UNIQUE (category_id, name);


--
-- Name: global_services global_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_services
    ADD CONSTRAINT global_services_pkey PRIMARY KEY (id);


--
-- Name: invites invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT invites_pkey PRIMARY KEY (id);


--
-- Name: invites invites_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT invites_token_key UNIQUE (token);


--
-- Name: iys_logs iys_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iys_logs
    ADD CONSTRAINT iys_logs_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: otp_codes otp_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT otp_codes_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: salon_services salon_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_services
    ADD CONSTRAINT salon_services_pkey PRIMARY KEY (id);


--
-- Name: salon_types salon_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_types
    ADD CONSTRAINT salon_types_name_key UNIQUE (name);


--
-- Name: salon_types salon_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_types
    ADD CONSTRAINT salon_types_pkey PRIMARY KEY (id);


--
-- Name: salon_types salon_types_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_types
    ADD CONSTRAINT salon_types_slug_key UNIQUE (slug);


--
-- Name: salons salons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_name_key UNIQUE (name);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_slug_key UNIQUE (slug);


--
-- Name: users uk_6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: salons uk_6fir817ee3gbq1tr9skvy373u; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT uk_6fir817ee3gbq1tr9skvy373u UNIQUE (owner_id);


--
-- Name: otp_codes unique_active_otp; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT unique_active_otp UNIQUE (phone, code);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_otp_cleanup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_cleanup ON public.otp_codes USING btree (expires_at) WHERE (used = false);


--
-- Name: idx_otp_phone_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_phone_expires ON public.otp_codes USING btree (phone, expires_at) WHERE (used = false);


--
-- Name: salons tr_salon_created_membership; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_salon_created_membership AFTER INSERT ON public.salons FOR EACH ROW EXECUTE FUNCTION public.on_salon_created_add_membership();


--
-- Name: appointments update_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: salons update_salons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: districts districts_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE CASCADE;


--
-- Name: appointments fk4q5rt20vvnkv7eohwq22l3ayy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk4q5rt20vvnkv7eohwq22l3ayy FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: appointments fk6eufma68nfpop0y70rect7wxr; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk6eufma68nfpop0y70rect7wxr FOREIGN KEY (service_id) REFERENCES public.salon_services(id);


--
-- Name: salons fk98acq1e3p3p8bm8hjv611yyn8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT fk98acq1e3p3p8bm8hjv611yyn8 FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: salon_services fkegyh145ukwo5iowe4x4bow6fa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_services
    ADD CONSTRAINT fkegyh145ukwo5iowe4x4bow6fa FOREIGN KEY (salon_id) REFERENCES public.salons(id);


--
-- Name: appointments fkn7uk5bmcf2qd5oam22wfqcx3j; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fkn7uk5bmcf2qd5oam22wfqcx3j FOREIGN KEY (salon_id) REFERENCES public.salons(id);


--
-- Name: global_services global_services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_services
    ADD CONSTRAINT global_services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- Name: invites invites_inviter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT invites_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES public.profiles(id);


--
-- Name: invites invites_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT invites_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: notifications Everyone can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);


--
-- Name: invites Public can view invite by token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view invite by token" ON public.invites FOR SELECT USING (true);


--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: cities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

--
-- Name: districts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

--
-- Name: global_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.global_services ENABLE ROW LEVEL SECURITY;

--
-- Name: invites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

--
-- Name: iys_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.iys_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: otp_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: salons public_read_salons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_salons ON public.salons FOR SELECT USING (true);


--
-- Name: salon_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_services ENABLE ROW LEVEL SECURITY;

--
-- Name: salon_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_types ENABLE ROW LEVEL SECURITY;

--
-- Name: salons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;

--
-- Name: salons salons_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY salons_public_read ON public.salons FOR SELECT USING (true);


--
-- Name: service_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

