-- RESTORE DISTRICTS (Clean & Comprehensive)

DO $$
DECLARE
    v_istanbul_id UUID;
    v_ankara_id UUID;
    v_izmir_id UUID;
BEGIN
    -- 1. Get City IDs
    SELECT id INTO v_istanbul_id FROM public.cities WHERE name = 'İstanbul';
    SELECT id INTO v_ankara_id FROM public.cities WHERE name = 'Ankara';
    SELECT id INTO v_izmir_id FROM public.cities WHERE name = 'İzmir';

    -- 2. Clean up broken names (Kad??k??y etc.)
    DELETE FROM public.districts WHERE name LIKE '%??%';

    -- 3. Insert Istanbul Districts
    IF v_istanbul_id IS NOT NULL THEN
        INSERT INTO public.districts (name, city_id) VALUES
        ('Kadıköy', v_istanbul_id),
        ('Beşiktaş', v_istanbul_id),
        ('Şişli', v_istanbul_id),
        ('Üsküdar', v_istanbul_id),
        ('Bakırköy', v_istanbul_id),
        ('Beyoğlu', v_istanbul_id),
        ('Ataşehir', v_istanbul_id),
        ('Maltepe', v_istanbul_id),
        ('Sarıyer', v_istanbul_id),
        ('Fatih', v_istanbul_id),
        ('Kartal', v_istanbul_id),
        ('Pendik', v_istanbul_id),
        ('Beylikdüzü', v_istanbul_id),
        ('Başakşehir', v_istanbul_id),
        ('Etiler', v_istanbul_id),
        ('Nişantaşı', v_istanbul_id) -- Semt olarak ekledim, popüler olduğu için
        ON CONFLICT (name, city_id) DO NOTHING;
    END IF;

    -- 4. Insert Ankara Districts
    IF v_ankara_id IS NOT NULL THEN
        INSERT INTO public.districts (name, city_id) VALUES
        ('Çankaya', v_ankara_id),
        ('Yenimahalle', v_ankara_id),
        ('Keçiören', v_ankara_id),
        ('Etimesgut', v_ankara_id),
        ('Mamak', v_ankara_id)
        ON CONFLICT (name, city_id) DO NOTHING;
    END IF;

    -- 5. Insert Izmir Districts
    IF v_izmir_id IS NOT NULL THEN
        INSERT INTO public.districts (name, city_id) VALUES
        ('Konak', v_izmir_id),
        ('Karşıyaka', v_izmir_id),
        ('Bornova', v_izmir_id),
        ('Buca', v_izmir_id),
        ('Çeşme', v_izmir_id)
        ON CONFLICT (name, city_id) DO NOTHING;
    END IF;

    -- 6. Ensure RLS Policy for Districts
    
END $$;

-- Policy (Outside DO block)
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read districts" ON public.districts;
CREATE POLICY "Public read districts" ON public.districts FOR SELECT USING (true);

-- Verification
SELECT c.name as city, COUNT(d.id) as district_count 
FROM public.cities c 
LEFT JOIN public.districts d ON c.id = d.city_id 
GROUP BY c.name;
