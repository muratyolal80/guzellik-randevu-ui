-- ==============================================
-- 5. SUPPORT SYSTEM ENHANCEMENTS
-- ==============================================

-- 1. Add category to support_tickets
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Create ticket_messages for threads
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    sender_role user_role NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Security (RLS)
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Tickets: Customers see own, Admins see all
DROP POLICY IF EXISTS "Users view own tickets" ON public.support_tickets;
CREATE POLICY "Users view own tickets" ON public.support_tickets 
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Users create tickets" ON public.support_tickets;
CREATE POLICY "Users create tickets" ON public.support_tickets 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages: Users see messages for their tickets
DROP POLICY IF EXISTS "Users view ticket messages" ON public.ticket_messages;
CREATE POLICY "Users view ticket messages" ON public.ticket_messages 
    FOR SELECT USING (
        ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN')
    );

DROP POLICY IF EXISTS "Users send ticket messages" ON public.ticket_messages;
CREATE POLICY "Users send ticket messages" ON public.ticket_messages 
    FOR INSERT WITH CHECK (
        ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN')
    );
