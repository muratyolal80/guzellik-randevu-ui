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
