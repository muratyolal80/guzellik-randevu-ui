-- Notification Infrastructure Schema
-- Handles async notifications (SMS/Email) via a robust queue

-- 1. Notification Types Enum
DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('SMS', 'EMAIL', 'PUSH');
    CREATE TYPE notification_status AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Notification Templates
-- Configurable message templates with placeholders like {{customer_name}}, {{time}}
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- e.g., 'appointment_reminder_24h'
    channel notification_channel NOT NULL,
    subject TEXT, -- For Email
    content TEXT NOT NULL, -- "Sayın {{customer_name}}, {{time}} randevunuzu hatırlatırız."
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Templates
INSERT INTO public.notification_templates (slug, channel, content) VALUES 
('reminder_24h', 'SMS', 'Sayın {{customer_name}}, {{salon_name}} salonunda yarın saat {{time}} randevunuz bulunmaktadır. Değişiklik için lütfen iletişime geçin.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.notification_templates (slug, channel, content) VALUES 
('reminder_1h', 'SMS', 'Sayın {{customer_name}}, {{salon_name}} randevunuz 1 saat sonra başlayacaktır.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.notification_templates (slug, channel, content) VALUES 
('status_confirmed', 'SMS', 'Sayın {{customer_name}}, {{salon_name}} randevunuz ONAYLANMIŞTIR. Tarih: {{date}} Saat: {{time}}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.notification_templates (slug, channel, content) VALUES 
('status_completed', 'SMS', 'Hizmetimizden memnun kaldığınızı umarız! Deneyiminizi değerlendirmek için: {{link}}')
ON CONFLICT (slug) DO NOTHING;

-- 3. Notification Queue
-- Asynchronous queue for sending messages
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel notification_channel NOT NULL,
    recipient TEXT NOT NULL, -- Phone number or Email
    subject TEXT,
    content TEXT NOT NULL,
    status notification_status DEFAULT 'PENDING',
    related_id UUID, -- Optional: link to appointment_id
    related_table TEXT, -- 'appointments'
    tries INTEGER DEFAULT 0,
    last_error TEXT,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for worker performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON public.notification_queue(scheduled_for) WHERE status = 'PENDING';

-- RLS: Only admins/system can manage queue, but for MVP we might keep it open for service role
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage templates" ON public.notification_templates FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

CREATE POLICY "Everyone read templates" ON public.notification_templates FOR SELECT
    USING (true);
    
-- Allow service role access (for cron jobs) naturally bypasses RLS, but for client-side inserts:
CREATE POLICY "System manage queue" ON public.notification_queue FOR ALL
    USING (true); -- Simplified for MVP to allow simple inserts from client apps if needed

-- Function to queue a notification easily
CREATE OR REPLACE FUNCTION public.queue_notification(
    p_channel notification_channel,
    p_recipient TEXT,
    p_content TEXT,
    p_related_id UUID DEFAULT NULL,
    p_related_table TEXT DEFAULT NULL,
    p_scheduled_for TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.notification_queue (
        channel, recipient, content, related_id, related_table, scheduled_for
    ) VALUES (
        p_channel, p_recipient, p_content, p_related_id, p_related_table, p_scheduled_for
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
