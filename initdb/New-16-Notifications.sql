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
