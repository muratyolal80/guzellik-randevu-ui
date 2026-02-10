-- 1. Görünümleri siliyoruz (CASCADE ile tüm bağımlılıkları temizler)
DROP VIEW IF EXISTS public.salon_details_with_membership CASCADE;
DROP VIEW IF EXISTS public.salon_details CASCADE;

-- 2. TÜM POLİTİKALARI DİNAMİK OLARAK SİLİYORUZ 
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. DIŞ ANAHTAR (FOREIGN KEY) VE NOT NULL KISITLAMALARINI KALDIRIYORUZ
ALTER TABLE public.salons DROP CONSTRAINT IF EXISTS salons_owner_id_fkey;
ALTER TABLE public.salons ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN customer_id DROP NOT NULL;

-- 4. KOLON TİPLERİNİ UUID'YE ÇEVİRİYORUZ
ALTER TABLE public.salons ALTER COLUMN owner_id TYPE uuid USING NULL;
ALTER TABLE public.appointments ALTER COLUMN customer_id TYPE uuid USING NULL;

-- 5. VERİLERİ SİZİN ID'NİZLE DOLDURUYORUZ
-- NOT: auth.uid() null gelirse SET NOT NULL hatası alırsınız. 
-- Eğer hata alırsanız auth.uid() yerine 'ID-NIZ' yazın.
UPDATE public.salons SET owner_id = (SELECT id FROM public.profiles LIMIT 1); -- Geçici olarak ilk profili ata (Hata almamak için)
UPDATE public.appointments SET customer_id = (SELECT id FROM public.profiles LIMIT 1);
UPDATE public.profiles SET role = 'SALON_OWNER' WHERE id = (SELECT id FROM public.profiles LIMIT 1);

-- 6. KISITLAMALARI (CONSTRAINT) EN GÜNCEL HALİYLE GERİ KURUYORUZ
ALTER TABLE public.salons ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.salons ADD CONSTRAINT salons_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);

-- 7. POLİTİKALARI YENİDEN KURUYORUZ
CREATE POLICY "Public read salons" ON public.salons FOR SELECT USING (true);
CREATE POLICY "Owners manage own salon" ON public.salons FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Public view staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Owners manage staff" ON public.staff FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
CREATE POLICY "Public can view salon services" ON public.salon_services FOR SELECT USING (true);
CREATE POLICY "Owners manage own salon services" ON public.salon_services FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
CREATE POLICY "Salons view own appointments" ON public.appointments FOR SELECT USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- 8. GÖRÜNÜMLERİ (VIEW) GERİ YÜKLÜYORUZ
CREATE OR REPLACE VIEW public.salon_details AS
 SELECT s.id, s.name, s.description, s.features, s.address, s.neighborhood, s.avenue, s.street, s.building_no, s.apartment_no, s.phone, s.geo_latitude, s.geo_longitude, s.image, s.is_sponsored, s.status, s.rejected_reason, s.owner_id, s.postal_code, s.city_id, s.district_id, s.type_id,
    COALESCE(c.name, 'Bilinmiyor'::text) AS city_name,
    COALESCE(d.name, 'Bilinmiyor'::text) AS district_name,
    COALESCE(st.name, 'Genel'::text) AS type_name,
    COALESCE(st.slug, 'genel'::text) AS type_slug,
    ( SELECT array_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'is_primary', sat.is_primary)) AS array_agg
           FROM (public.salon_assigned_types sat
             JOIN public.salon_types t ON ((sat.type_id = t.id)))
          WHERE (sat.salon_id = s.id)) AS assigned_types,
    0 AS review_count, 0 AS average_rating, s.created_at
   FROM (((public.salons s
     LEFT JOIN public.cities c ON ((s.city_id = c.id)))
     LEFT JOIN public.districts d ON ((s.district_id = d.id)))
     LEFT JOIN public.salon_types st ON ((s.type_id = st.id)));

CREATE OR REPLACE VIEW public.salon_details_with_membership AS
 SELECT id, name, description, features, address, neighborhood, avenue, street, building_no, apartment_no, phone, geo_latitude, geo_longitude, image, is_sponsored, status, rejected_reason, owner_id, postal_code, city_id, district_id, type_id, city_name, district_name, type_name, type_slug, review_count, average_rating, created_at, 'OWNER'::text AS user_role, (owner_id)::text AS current_user_id
 FROM public.salon_details s;

-- Şemayı yenile
NOTIFY pgrst, 'reload schema';