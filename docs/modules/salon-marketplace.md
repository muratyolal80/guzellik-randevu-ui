# Modül: Salon Marketplace (Public)

## Amaç
Anonim ziyaretçilerin salon arayıp detayını görüntüleyip randevu başlatabildiği public katman.

## Roller / Aktör
- Anonim ziyaretçi
- Mevcut müşteriler (favori ekleme, yorum yazma)

## Aktif Özellikler
- ✅ **Ana sayfa** — kategori bazlı vitrin, öne çıkan salonlar, kampanyalar
- ✅ **Arama** — `/search` — il/ilçe + kategori + isim filtresi
- ✅ **Salon detay sayfası** — hizmetler, personeller, mesai, galeri, yorumlar, harita
- ✅ **Subdomain routing** — `*.kuaforara.com.tr` → middleware rewrite → `/salon-slug/[slug]`
- ✅ **Sponsorlu salonlar** — `salons.is_sponsored=true` öne çıkar
- ✅ **Salon galerisi** — `salon_gallery` tablosu (her salon için 3 placeholder seed'lendi)
- ✅ **Yorumlar + puanlar** — `reviews` tablosu, `verified_reviews_view`
- ✅ **Personel listesi** — verifiye olmuş personeller
- ✅ **Harita** — Leaflet/OpenStreetMap, salon konumu pin
- ✅ **SEO** — her sayfada `metadata`, `next-sitemap`
- ✅ **Çoklu salon tipi** — `salon_assigned_types` (örn. hem berber hem kuaför)
- ✅ **Rezervasyon CTA** — "Randevu Al" → booking flow'a yönlendirir

## Veri Modeli
| Tablo | Rol |
|-------|-----|
| `salons` | Ana salon kaydı (status='APPROVED' olanlar görünür) |
| `salon_details` (view) | Tek sorguda salon + il + ilçe + tip |
| `salon_service_details` (view) | Hizmet + kategori + salon birleşim |
| `salon_assigned_types` | Çoklu tip atama |
| `salon_gallery` | Galeri görselleri |
| `salon_working_hours` | Salon haftalık mesai |
| `salon_ratings` (view) | Salon puan ortalaması |
| `reviews` + `review_images` | Müşteri yorumları |
| `cities`, `districts` | Lokasyon lookup |

## Sayfa / Route
| Path | Açıklama |
|------|----------|
| `/` | Ana sayfa (öne çıkanlar, kategoriler, arama bar) |
| `/search?city=...&type=...&q=...` | Arama sonuçları |
| `/salon/[id]` | Salon detay (id ile) |
| `/salon-slug/[slug]` | Salon detay (slug + subdomain) |

## API
Public sayfalar Supabase JS Client (anon key) ile direkt sorgular. Ayrı API endpoint'i yok — RLS public read policy'leri ile korunur.

## Test Adımları
1. **Ana sayfa:** `localhost:3000` → 12 onaylı salonun listesi
2. **Arama:** `/search?city_id=X` → şehre göre filter
3. **Salon detay:** `/salon/[id]` → galeri, 3 yorum, hizmet listesi, personel kartları
4. **Subdomain:** `localhost:3000` host header `test.kuaforara.com.tr` → `/salon-slug/test`
5. **Sponsorlu rozet:** `salons.is_sponsored=true` olan salon listede üstte ⭐
6. **Yalnızca APPROVED:** `status='DRAFT'` olan salon listede görünmemeli (RLS policy)

## Açık Aksiyon (TODO)
- 🟡 **Gerçek galeri görselleri** — şu an Unsplash placeholder; owner panelinden upload UI tamamlanmalı
- 🟡 **Harita marker cluster** — yoğun şehirde tüm pinler üst üste; cluster eklenmeli
- 🟢 **Filtre persist** — search filter'ı URL'e yansıyor ama back/forward bug'ları olabilir
- 🟢 **"Yakındaki salonlar"** — geo-distance sıralama (`postgis` mevcut)
- 🟢 **Yorum filtreleme** — sadece doğrulanmış (verified) yorumlar tab'ı
- 🟢 **Salon karşılaştırma** — 2-3 salon yan yana
- 🟢 **Open Graph / Twitter Card** — paylaşımda salon detay görseli

## Bağlantılar
- Ana sayfa: [app/HomeClient.tsx](../../app/HomeClient.tsx)
- Salon detay: [app/salon/[id]/page.tsx](../../app/salon/[id]/page.tsx)
- Arama: [app/search/](../../app/search)
- Subdomain rewrite: [middleware.ts](../../middleware.ts)
- DB queries: [services/db/db_salon.ts](../../services/db/db_salon.ts), [services/db/db_core.ts](../../services/db/db_core.ts)
