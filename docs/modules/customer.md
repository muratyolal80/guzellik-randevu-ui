# Modül: Müşteri (Customer)

## Amaç
Müşterinin kendi profilini, randevu geçmişini, favori salonlarını, yorumlarını ve bildirimlerini yönetebildiği panel.

## Roller / Aktör
- CUSTOMER (ana kullanıcı)

## Aktif Özellikler
- ✅ **Dashboard** — yaklaşan randevu, son işlemler, favori salonlar
- ✅ **Randevu listesi** — geçmiş + yaklaşan, iptal/yeniden zamanla
- ✅ **Favoriler** — `favorites` tablosu
- ✅ **Yorum yazma** — randevu sonrası salon + personel yorumu
- ✅ **Profil düzenleme** — ad, telefon, email, fotoğraf
- ✅ **KVKK ayarları** — pazarlama izni, hesap silme talebi
- ✅ **Bildirimler** — `notifications` tablosu, in-app gösterim
- ✅ **Ödeme geçmişi** — `payment_history` (kapora, randevu ödemeleri)
- ✅ **Destek talebi** — ticket oluşturma (bkz [Support modülü](support.md))
- ✅ **CRM tarafı** — owner müşteriyi `salon_customers` ile takip ediyor
- ✅ **Müşteri notu** — owner'ın müşteri hakkında özel notu (`customer_notes`)

## Veri Modeli
| Tablo | Rol |
|-------|-----|
| `profiles` | Ana profil (CUSTOMER rolü) |
| `appointments` | Randevu geçmişi |
| `favorites` | Favori salonlar |
| `reviews` | Yazılan yorumlar |
| `staff_reviews` | Yazılan personel yorumları |
| `notifications` | In-app bildirimler |
| `payment_history` | Ödemeler |
| `salon_customers` | Owner CRM (salon-müşteri ilişkisi) |
| `customer_notes` | Owner notları (müşteriye gizli) |
| `user_sessions` | Aktif cihazlar (KVKK) |

## Sayfa / Route
| Path | Açıklama |
|------|----------|
| `/customer/dashboard` | Ana ekran |
| `/customer/appointments` | Randevu listesi (yaklaşan/geçmiş) |
| `/customer/favorites` | Favori salonlar |
| `/customer/reviews` | Yazdığım yorumlar |
| `/customer/notifications` | Bildirim merkezi |
| `/customer/payments` | Ödeme geçmişi |
| `/customer/profile` | Profil düzenleme |
| `/customer/settings` | KVKK + hesap ayarları (silme talebi) |
| `/customer/support` | Destek talebi |

## API
İç service layer + Supabase JS Client. Ayrı API endpoint'i yok; RLS ile korunur (kullanıcı sadece kendi `auth.uid()`'sine ait satırları görür).

## Test Adımları
1. **Login + Dashboard:** CUSTOMER login → `/customer/dashboard` → yaklaşan 1 randevu kartı
2. **Favori ekle:** Salon detay → ❤️ → `favorites` insert → `/customer/favorites`'ta görünür
3. **Yorum yaz:** Geçmiş randevu → "Yorum Yaz" → salon + personel ayrı puan + comment
4. **Bildirim:** Randevu hatırlatma cron → in-app bildirim + SMS
5. **Hesap sil:** `/customer/settings` → "Hesabımı Sil" → `profiles.deleted_at = now() + 30 gün`
6. **Geri al:** 30 gün içinde tekrar login → `deleted_at = null`

## Açık Aksiyon (TODO)
- 🟡 **Hesap silme cron** — 30 gün geçmiş soft-delete'leri hard-delete edecek cron yok
- 🟡 **Yorum düzenleme** — yazılmış yorumu güncelleme UI'sı yok (sadece silme)
- 🟢 **Push notification** — `notification_queue` tablosu var ama push channel implementasyonu yok
- 🟢 **Çoklu adres** — kullanıcının evi/işi gibi birden fazla adres kaydetmesi
- 🟢 **Ödeme yöntemi kaydet** — saved card (Iyzico tokenization)
- 🟢 **Tercih edilen personel** — bir salonda hep aynı personeli seçme
- 🟢 **Randevu öncesi anket** — saç tipi, alerji vb. ön bilgi formu

## Bağlantılar
- Customer dashboard: [app/customer/dashboard/page.tsx](../../app/customer/dashboard/page.tsx)
- Customer layout: [app/customer/layout.tsx](../../app/customer/layout.tsx)
- DB queries: [services/db/db_customer.ts](../../services/db/db_customer.ts), [services/db/db_user.ts](../../services/db/db_user.ts)
- Profile context: [context/AuthContext.tsx](../../context/AuthContext.tsx)
