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
   - **Admin (SUPER_ADMIN):** Tüm tablolarda tam yetki (`role = 'SUPER_ADMIN'`) olmalı.
   - **Owner (İşletme Sahibi):** 
     - Sadece kendi `salon_id` veya `owner_id` değerine sahip satırları yönetebilmeli.
     - **DİKKAT:** `salons` ve `salon_services` tablolarında DELETE yetkisi OLMAMALI.
   - **Staff (Personel):** 
     - Sadece `staff_id` kendisine atanan randevuları görmeli.
     - Salon ayarlarına ve diğer personel verilerine erişimi OLMAMALI.
   - **Customer (Müşteri):** Sadece kendi randevularını (`customer_id = auth.uid()`) ve profilini görebilmeli.

3. **SQL Kontrolü:**
   ```sql
   -- RLS'in açık olduğunu kontrol et
   select tablename, rowsecurity from pg_tables where schemaname = 'public';

   -- Politikaları listele ve DELETE kısıtlarını kontrol et
   select * from pg_policies where schemaname = 'public' and cmd = 'DELETE';
   ```

4. **Test Senaryoları:**
   - [ ] Anonim kullanıcı veriye erişebiliyor mu? (Hayır)
   - [ ] Owner kendi salonunu silebiliyor mu? (HAYIR olmalı)
   - [ ] Staff başkasının randevusunu görebiliyor mu? (HAYIR olmalı)
   - [ ] Customer salon paketlerini değiştirebiliyor mu? (HAYIR olmalı)
   - [ ] Admin her şeyi görebiliyor mu? (EVET)

5. **Kayıt:**
   - Her denetim sonucunu `task.md` içerisinde "Güvenlik Denetimi Tamamlandı" olarak işaretleyin.
