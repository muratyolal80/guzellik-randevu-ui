---
description: Data Migration and Integrity Safety Rules
---

# Veri Migrasyonu ve Bütünlüğü Güvenlik Protokolü

Bu belge, veritabanı operasyonlarında veri güvenliğini, tutarlılığını ve sürekliliğini sağlamak amacıyla uyulması gereken **zorunlu** mühendislik standartlarını tanımlar.

## 1. Temel Prensipler (Core Principles)

*   **Veri Kutsaldır:** Mevcut kullanıcı verisi (Production Data) hiçbir koşulda, onay alınmadan ve yedeklenmeden riske atılamaz.
*   **Analiz ve Raporlama:** Herhangi bir işlem yapılmadan önce mevcut veri durumu analiz edilmeli ve olası etkiler kullanıcıya raporlanmalıdır.
*   **Geri Alınabilirlik:** Yapılan işlemler, olası bir hatada geri alınabilir (Transactional) olmalıdır.

## 2. Kesin Yasaklar (Strict Prohibitions)

1.  **Kontrolsüz TRUNCATE/DROP:** Canlı veri içeren veya ilişkisel bağımlılığı olan tablolarda `TRUNCATE` ve `DROP TABLE` komutlarının kullanımı, **açık ve yazılı kullanıcı onayı** olmadan YASAKTIR.
2.  **Toplu Silme (Blind Delete):** `WHERE` koşulu içermeyen veya etkisi hesaplanmamış `DELETE` komutları kullanılamaz.
3.  **Varsayım Üzerine İşlem:** "Veri yoktur" veya "ID bellidir" varsayımıyla işlem yapılamaz. Verinin varlığı her zaman sorgulanmalıdır.

## 3. Güvenli Migrasyon Standartları (Safe Migration Standards)

### 3.1. Çakışma Yönetimi (Conflict Handling)
Veri ekleme işlemlerinde `Unique Constraint` hatalarını önlemek için **Idempotent** (Tekrarlanabilir) yapılar kullanılmalıdır:

*   **Hatalı:** `INSERT INTO ...` (Hata durumunda işlem durur ve veri tutarsızlığı oluşabilir)
*   **Doğru:** `INSERT INTO ... ON CONFLICT (key) DO UPDATE/NOTHING`

### 3.2. Referans Bütünlüğü (Referential Integrity)
İlişkisel verilerde (Foreign Key) "Random ID" üretmek yerine, mevcut veriye bağlanılmalıdır:

*   **Prosedür:** Önce ilişkili kaydı (örn: User, City) sorgula.
*   **Aksiyon:** Kayıt varsa ID'sini kullan; yoksa kontrollü bir şekilde oluştur.
*   **Risk:** Rastgele UUID kullanımı, "Dangling Reference" (Kopuk veri) ve uygulama hatalarına yol açar.

### 3.3. Transaction Yönetimi
Birden fazla tabloyu etkileyen işlemler mutlaka `BEGIN; ... COMMIT;` bloğu içinde yapılmalıdır. Böylece işlemin herhangi bir adımında hata olursa, veritabanı tutarlı bir eski duruma (`ROLLBACK`) döner.

## 4. Risk İletişimi (Risk Communication)

Yüksek riskli bir işlem gerektiğinde (örn: Tablo yapısını değiştirme, veri tipi dönüşümü), kullanıcıya şu formatta bildirim yapılmalıdır:

1.  **İşlem:** Ne yapılacak? (Örn: `users` tablosundaki `phone` alanını değiştirme)
2.  **Risk:** Ne olabilir? (Örn: Mevcut format dışındaki telefon numaraları kaybolabilir)
3.  **Koruma:** Nasıl önlem alındı? (Örn: Hatalı veriler geçici bir tabloya yedeklenecek)

---
**Özet:** Amacımız, kodu "çalıştırmak" değil, sistemi "sağlıklı yaşatmak"tır. Her SQL scripti bu ciddiyetle hazırlanmalıdır.
