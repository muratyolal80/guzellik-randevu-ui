# Güzellik Randevu - Proje Genel Bakış ve Sistem Mimarisi

Bu döküman, projenin tüm teknik detaylarını, mimari kararlarını, güvenlik kurallarını ve geliştirme standartlarını Claude (ve diğer AI asistanları) için özetler.

## 1. Proje Özeti
**Güzellik Randevu**, güzellik salonları, kuaförler ve berberler için geliştirilmiş, çok rollü bir SaaS marketplace platformudur.
- **Temel Fonksiyon:** Salonlar hizmetlerini ve personellerini listeler, müşteriler online randevu alır.
- **Mimari:** Multi-tenant (subdomain tabanlı), rol tabanlı erişim kontrolü (RBAC) ve veritabanı seviyesinde güvenlik (RLS).

## 2. Teknoloji Yığını (Tech Stack)
- **Framework:** Next.js 16 (App Router), React 19 (Server Actions, `use` hook, vb. modern özellikler kullanılır).
- **Database/Auth:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`).
- **Styling:** Tailwind CSS (Vanilla).
- **Icons:** Lucide React.
- **Charts:** Recharts.
- **Maps:** Leaflet (`react-leaflet`).
- **Calendar:** FullCalendar v6.
- **AI:** Google Gemini AI (`@google/genai`).
- **Payment:** Iyzico Entegrasyonu (`iyzipay`).

## 3. Mimari Kurallar ve Standartlar

### Dosya Yapısı ve Importlar
- **Bileşenler:** `@/components` klasörü altında, atomik tasarım prensiplerine uygun.
- **Servis Katmanı:** DB sorguları doğrudan UI'da yazılmaz. `@/services/db.ts` (veya `@/services/db/` altındaki modüller) kullanılır.
- **Tipler:** Tüm tip tanımlamaları `@/types.ts` veya `types/` klasöründedir. `any` kullanımı yasaktır.
- **Mutlak Import:** Her zaman `@/` prefix'i kullanılır (örn: `import { ... } from '@/lib/supabase'`).

### UI/UX Standartları
- **Estetik:** Minimalist, premium ve modern tasarım (shadcn/ui stili).
- **Durum Yönetimi:** Loading (Skeleton screens) ve Empty state'ler asla ihmal edilmez.
- **SEO:** Her sayfa için `metadata` objesi veya `generateMetadata` fonksiyonu eklenir.
- **Erişilebilirlik:** `alt` tagleri ve semantik HTML (`section`, `article`, `header`) kullanımı zorunludur.

## 4. Güvenlik ve RLS (Row Level Security)

RLS, projenin kalbidir. Her tablo için RLS aktif olmalıdır.

### Politika Hiyerarşisi:
1.  **SUPER_ADMIN / ADMIN:** Tüm tablolarda tam yetki (SELECT, INSERT, UPDATE, DELETE).
2.  **OWNER (Salon Sahibi):** 
    - Kendi `salon_id` veya `owner_id`sine ait verilerde tam yetki.
    - **KRİTİK:** `salons` ve `salon_services` tablolarında DELETE yetkisi yoktur (Status update yapılır).
    - Kendi `staff`, `appointments`, `reviews` verilerini yönetebilir.
3.  **CUSTOMER (Müşteri):**
    - Sadece kendi verilerine (randevu, profil, yorum) erişim.
    - Onaylı salonların (APPROVED) genel bilgilerini görebilir.
4.  **STAFF (Personel):**
    - Sadece kendisine atanan randevuları ve kendi profilini görebilir.

### Güvenlik Denetimi:
Her DB değişikliğinden sonra `/security-audit` workflow'u çalıştırılmalıdır.

## 5. Veritabanı ve SQL Yönetimi
- Tüm şema değişiklikleri `initdb/` klasörüne yeni bir script olarak kaydedilir (örn: `New-07-Feature-X.sql`).
- Master şema: `initdb/Master-Database-Setup.sql`.

## 6. Kritik İş Mantığı (Logic)
- **Slot Engine:** `services/slot.ts` - Personel mesaisi, servis süresi ve mevcut randevuları hesaplayarak boş slotları bulur.
- **Subdomain Routing:** `middleware.ts` - Subdomainleri salon slug'larına eşler.
- **OTP:** `lib/auth/otp.ts` - SMS bazlı doğrulama (Demo modu mevcuttur).

## 7. İletişim Kuralları
- **Dil:** Kullanıcı ile iletişim **Türkçe**, kod (değişkenler, fonksiyonlar, yorumlar) **İngilizce**.
- **Mesajlar:** Hata mesajları ve toast bildirimleri **Türkçe**.

## 8. Yıkıcı İşlemler (Destructive Operations)
`TRUNCATE`, `DROP`, `DELETE` (koşulsuz) gibi işlemlerden önce mutlaka kullanıcı onayı alınmalıdır.

---
*Bu dosya projenin anayasasıdır. Herhangi bir geliştirme yapmadan önce bu kuralların okunduğundan ve anlaşıldığundan emin olunmalıdır.*
