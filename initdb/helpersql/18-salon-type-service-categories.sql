-- ================================================
-- Migration: Salon Type - Service Categories Mapping
-- Description: Salon tipleri ile hizmet kategorileri arasında 
--              many-to-many ilişki kurarak otomatik hizmet yükleme
-- ================================================

-- 1. Mapping Tablosu
CREATE TABLE IF NOT EXISTS public.salon_type_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_type_id UUID NOT NULL REFERENCES public.salon_types(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(salon_type_id, category_id)
);

-- 2. RLS Policy
ALTER TABLE public.salon_type_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read salon type categories" 
ON public.salon_type_categories 
FOR SELECT 
USING (true);

-- 3. Seed Data: Kuaför → Saç kategorisi
INSERT INTO public.salon_type_categories (salon_type_id, category_id)
SELECT st.id, sc.id 
FROM public.salon_types st, public.service_categories sc
WHERE st.slug = 'kuafor' AND sc.slug = 'sac'
ON CONFLICT DO NOTHING;

-- 4. Seed Data: Berber → Saç kategorisi  
INSERT INTO public.salon_type_categories (salon_type_id, category_id)
SELECT st.id, sc.id 
FROM public.salon_types st, public.service_categories sc
WHERE st.slug = 'berber' AND sc.slug = 'sac'
ON CONFLICT DO NOTHING;

-- 5. Eğer Güzellik Merkezi varsa → Makyaj ve Tırnak kategorileri
INSERT INTO public.salon_type_categories (salon_type_id, category_id)
SELECT st.id, sc.id 
FROM public.salon_types st, public.service_categories sc
WHERE st.slug = 'guzellik-merkezi' AND sc.slug IN ('makyaj', 'tirnak')
ON CONFLICT DO NOTHING;

-- Not: İhtiyacınıza göre ekstra salon tipi-kategori eşleştirmeleri ekleyebilirsiniz
