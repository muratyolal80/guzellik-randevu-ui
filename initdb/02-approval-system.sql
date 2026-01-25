DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_request_type') THEN
        CREATE TYPE change_request_type AS ENUM ('SALON_CREATE', 'SALON_UPDATE', 'SERVICE_ADD', 'SERVICE_UPDATE', 'SERVICE_DELETE', 'STAFF_ADD', 'STAFF_UPDATE', 'STAFF_DELETE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_request_status') THEN
        CREATE TYPE change_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.change_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES public.salons(id) ON DELETE SET NULL,
    type change_request_type NOT NULL,
    data JSONB NOT NULL,
    status change_request_status NOT NULL DEFAULT 'PENDING',
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_change_requests_updated_at ON public.change_requests;
CREATE TRIGGER update_change_requests_updated_at BEFORE UPDATE ON public.change_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
DROP POLICY IF EXISTS "Public Read Access" ON public.change_requests;
CREATE POLICY "Public Read Access" ON public.change_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Requester can insert" ON public.change_requests;
CREATE POLICY "Requester can insert" ON public.change_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Admins can update status" ON public.change_requests;
CREATE POLICY "Admins can update status" ON public.change_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);
