-- RLS Policies

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iys_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view invite by token" ON public.invites FOR SELECT USING (true);
CREATE POLICY public_read_salons ON public.salons FOR SELECT USING (true);
CREATE POLICY salons_public_read ON public.salons FOR SELECT USING (true);
