
-- Faz 9: Çoklu Şube (Multi-Branch) Desteği

-- 1. Personel - Şube İlişki Tablosu (Many-to-Many)
-- Bir personel birden fazla şubede çalışabilir.
CREATE TABLE IF NOT EXISTS public.staff_branches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(staff_id, salon_id)
);

-- 2. Mevcut personelleri kendi salonlarına staff_branches olarak ata (Data Migration)
INSERT INTO public.staff_branches (staff_id, salon_id, is_primary)
SELECT id, salon_id, true FROM public.staff
ON CONFLICT (staff_id, salon_id) DO NOTHING;

-- 3. RLS Politikaları
ALTER TABLE public.staff_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon sahipleri personel-şube atamalarını yönetebilir"
    ON public.staff_branches
    FOR ALL
    USING (salon_id IN (
        SELECT id FROM public.salons WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Herkes personel-şube atamalarını görebilir"
    ON public.staff_branches
    FOR SELECT
    USING (true);

-- 4. Global Raporlar için View (Tüm şubelerin toplamı)
CREATE OR REPLACE VIEW public.owner_global_stats AS
SELECT 
    s.owner_id,
    COUNT(DISTINCT s.id) as total_branches,
    COUNT(DISTINCT st.id) as total_staff,
    COUNT(DISTINCT a.id) as total_appointments,
    SUM(a.deposit_amount) as total_revenue
FROM public.salons s
LEFT JOIN public.staff st ON st.salon_id = s.id
LEFT JOIN public.appointments a ON a.salon_id = s.id
GROUP BY s.owner_id;
