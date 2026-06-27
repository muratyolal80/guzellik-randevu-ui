-- New-14-Add-SalonId-To-Notifications.sql
-- Add salon_id column to notifications table for better tracking

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE;

-- Update index
CREATE INDEX IF NOT EXISTS idx_notifications_salon_id ON public.notifications(salon_id);
