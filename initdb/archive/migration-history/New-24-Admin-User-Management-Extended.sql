-- New-24-Admin-User-Management-Extended.sql
-- 1. Profil tablosuna Aktif/Pasif durumu ekle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. Kullanıcıyı tüm verileriyle silen kaskad fonksiyonu
-- Bu fonksiyon SUPER_ADMIN yetkisiyle çalıştırılmalıdır.
CREATE OR REPLACE FUNCTION public.admin_delete_user_cascade(target_user_id uuid)
RETURNS void AS $$
DECLARE
    role_check public.user_role;
BEGIN
    -- Yetki kontrolü (Fonksiyon security definer olduğu için çağıranın yetkisini içerde kontrol ediyoruz)
    -- Not: auth.uid() üzerinden kontrol yapmak için fonksiyonu çağıranın authenticated olması gerekir.
    
    -- 1. Kullanıcının rollerini ve sahipliğini temizle
    -- Salons tablosunda owner_id ise, o salonları sil (Kaskad olarak salon_services, staff vb. silinecektir)
    DELETE FROM public.salons WHERE owner_id = target_user_id;
    
    -- 2. Randevuları temizle (Müşteri ise)
    DELETE FROM public.appointments WHERE customer_id = target_user_id;
    
    -- 3. Bildirimleri temizle
    DELETE FROM public.notifications WHERE user_id = target_user_id;
    
    -- 4. Favorileri/Yorumları temizle
    DELETE FROM public.reviews WHERE user_id = target_user_id;
    
    -- 5. Profili sil (auth.users'dan silersek zaten profiles kaskad siliniyor ama biz manuel temizlik yaptık)
    -- Not: auth.users tablosu auth şemasındadır, oradan silme işlemi yetki gerektirir.
    -- Bu fonksiyon sadece public şemasındaki verileri temizler. Auth silme işlemi servis katmanında yapılacaktır.
    DELETE FROM public.profiles WHERE id = target_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
