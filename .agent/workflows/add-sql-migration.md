---
description: Yeni bir SQL scripti oluşturur ve initdb klasörüne doğru isimlendirmeyle ekler.
---

Bu iş akışı, veritabanı şemasında yapılan değişikliklerin kalıcı olmasını sağlar.

1. Mevcut `initdb` klasöründeki dosyaları kontrol ederek bir sonraki numarayı belirle:
```powershell
ls d:\JAVA\projeler_2025\guzellik-randevu\guzellik-randevu-ui\initdb\New-*.sql
```

2. Bana yapılacak değişikliği açıkla (örn: "Yeni bir 'staff_ratings' tablosu ekle").

3. Ben senin için `initdb/New-XX-Description.sql` dosyasını oluşturacağım.

4. Değişiklik RLS gerektiriyorsa, `New-06-RLS-Policies.sql` dosyasını da güncelleyeceğim.

5. Son olarak `/db-sync` komutunu kullanarak tipleri güncellememi isteyebilirsin.
