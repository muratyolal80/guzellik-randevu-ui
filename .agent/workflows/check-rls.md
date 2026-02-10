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

4.  **Admin Yetkileri:**
    `SUPER_ADMIN` rolünün tüm master verileri (`global_services`, `categories` vb.) yönetebildiğinden emin olun.
    *   Genellikle `FOR ALL` politikası ve `role = 'SUPER_ADMIN'` kontrolü gerekir.

5.  **Test:**
    Şüpheli durumlarda, `auth.uid()` simülasyonu ile sorgu denemesi yapın:
    ```sql
    -- Örnek Test
    SET request.jwt.claim.sub = 'user-uuid-here';
    SET request.jwt.claim.role = 'authenticated';
    SELECT * FROM target_table;
    ```
