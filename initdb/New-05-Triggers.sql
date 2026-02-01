-- Triggers

CREATE TRIGGER tr_salon_created_membership AFTER INSERT ON public.salons FOR EACH ROW EXECUTE FUNCTION public.on_salon_created_add_membership();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
