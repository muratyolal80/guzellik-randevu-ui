---
description: initdb klasöründeki SQL dosyalarını ve veritabanı durumunu senkronize eder.
---

Bu iş akışı, projenin veritabanı yapısını güncel tutmak için kullanılır.

1. `initdb/` klasöründeki en son SQL dosyalarını listele:
```powershell
ls d:\JAVA\projeler_2025\guzellik-randevu\guzellik-randevu-ui\initdb\*.sql
```

2. Eğer yeni bir tablo veya alan eklendiyse, tip tanımlamalarını güncelle:
// turbo
3. Supabase tiplerini oluştur:
```powershell
npx supabase gen types typescript --local > d:\JAVA\projeler_2025\guzellik-randevu\guzellik-randevu-ui\types\supabase.ts
```

4. Kullanıcıya veritabanı scriptlerinin durumu hakkında bilgi ver.
