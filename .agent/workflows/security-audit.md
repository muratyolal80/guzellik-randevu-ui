---
description: RLS Güvenlik Denetimi ve Doğrulama Süreci
---

# RLS Güvenlik Denetimi Workflow

Bu workflow, her veritabanı değişikliği veya yeni özellik geliştirme sonrasında RLS (Row Level Security) politikalarının doğruluğunu kontrol etmek için kullanılır.

## Adımlar

1. **Tablo Listesini Al:**
   - Yeni eklenen veya güncellenen tabloları belirleyin.
   - `initdb/` klasöründeki son migrationları inceleyin.

2. **Politika Hiyerarşisini Doğrula:**
   - **Admin (SUPER_ADMIN / ADMIN):** Tüm tablolarda tam yetki (`public.is_admin(auth.uid())`) olmalı.
   - **Owner (İşletme Sahibi):** 
     - Sadece kendi `salon_id` veya `owner_id` değerine sahip satırları yönetebilmeli.
     - **DİKKAT:** `salons` ve `salon_services` tablolarında DELETE yetkisi OLMAMALI.
   - **Staff (Personel):** 
     - Sadece kendisine atanan randevuları görmeli.
     - Salon ayarlarına ve diğer personel verilerine erişimi OLMAMALI.
   - **Customer (Müşteri):** Sadece kendi randevularını (`customer_id = auth.uid()`) ve profilini görebilmeli.

3. **SQL Kontrol Sorguları (Supabase SQL Editor):**
   ```sql
   -- 1. RLS'in açık olduğunu kontrol et
   select tablename, rowsecurity from pg_tables where schemaname = 'public';

   -- 2. Tüm politikaların listesini al (Hızlı Bakış)
   select policyname, tablename, cmd, roles from pg_policies where schemaname = 'public' order by tablename;

   -- 3. Owner için DELETE yetkisi olan tabloları bul (salons ve salon_services OLMAMALI)
   select policyname, tablename from pg_policies 
   where schemaname = 'public' 
   and cmd = 'DELETE' 
   and policyname not like 'admin_%';
   ```

4. **Test Senaryoları:**
   - [ ] Anonim kullanıcı veriye erişebiliyor mu? (Hayır)
   - [ ] Owner kendi salonunu silebiliyor mu? (HAYIR olmalı)
   - [ ] Staff başkasının randevusunu görebiliyor mu? (HAYIR olmalı)
   - [ ] Customer salon paketlerini değiştirebiliyor mu? (HAYIR olmalı)
   - [ ] Admin her şeyi görebiliyor mu? (EVET)

5. **Kayıt:**
   - Her denetim sonucunu `task.md` içerisinde "Güvenlik Denetimi Tamamlandı" olarak işaretleyin.

