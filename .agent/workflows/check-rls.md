---
description: RLS politikalarının bütünlüğünü ve doğruluğunu kontrol etmek için kullanılır.
---

Bu iş akışı, veritabanı güvenliğinin (RLS) doğru yapılandırıldığını ve yaygın hataların (Sonsuz Döngü, Eksik İzinler) olup olmadığını kontrol eder.

1.  **RLS Aktivasyon Kontrolü:**
    Öncelikle hangi tabloların RLS açık olduğunu kontrol et:
    ```sql
    SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
    ```

2.  **CRUD Matrisi:**
    Her kritik tablo (Profiles, Salons, Appointments, Notifications) için şu izinlerin tanımlı olduğunu doğrula:
    *   **SELECT:** Kimler okuyabilir? (Herkes mi, Sahibi mi?)
    *   **INSERT:** Kimler ekleyebilir? (Auth users mı, Admin mi?)
    *   **UPDATE/DELETE:** Kimler değiştirebilir? (Sadece sahibi mi?)

3.  **Kritik Hata Kontrolü (Sonsuz Döngü):**
    `New-06` dosyasındaki politikaları incele. Eğer bir politika kendi tablosunu `SELECT` ediyorsa (örn: `users` tablosunda `users` select etmek), sonsuz döngü riski vardır.
    *   *Çözüm:* `auth.uid()`, `auth.jwt()` veya başka bir tablo (`profiles` -> `auth.users`) üzerinden kontrol yapın.

4. **Admin Yetkileri:**
    - `SUPER_ADMIN` rolünün her zaman tüm tablolarda `FOR ALL` yetkisine sahip olduğundan emin olun.
    - SQL: `EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')`

5. **Loop ve Performance Kontrolü:**
    - Bir politika kontrolü yapılırken, aynı tablodan SELECT yapılmamalıdır.
    - Örn: `salons` tablosu için `exists (select 1 from salons ...)` yerine `owner_id = auth.uid()` kullanılmalı.

6.  **Test:**
    Şüpheli durumlarda, `auth.uid()` simülasyonu ile sorgu denemesi yapın:
    ```sql
    -- Örnek Test
    SET request.jwt.claim.sub = 'user-uuid-here';
    SET request.jwt.claim.role = 'authenticated';
    SELECT * FROM target_table;
    ```
