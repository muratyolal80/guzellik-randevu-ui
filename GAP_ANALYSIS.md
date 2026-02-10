# Güzellik Randevu - Özellik & Gap Analizi (Mevcut Durum vs İstenenler)

Aşağıdaki tablo, talep ettiğiniz özellikler ile proje kodlarındaki mevcut durumun (Veritabanı Şeması + Frontend Kodları) karşılaştırmasını içerir.

Simge Anlamları:
- ✅ **Mevcut (Done):** Veritabanında ve arayüzde altyapısı var.
- 🚧 **Geliştirme Aşamasında (In Progress):** Veritabanında veya kısmi kodlarda var ama tam bitmiş değil.
- ❌ **Eksik (Missing):** Şu anki kod tabanında veya veritabanı şemasında karşılığı yok.

---

## 1) CUSTOMER (Müşteri)

### 1.1 Hesap & Güvenlik
| Özellik                                   | Durum | Notlar                                                                          |
| :---------------------------------------- | :---: | :------------------------------------------------------------------------------ |
| Profil bilgileri görüntüleme / güncelleme |   ✅   | `profiles` tablosu mevcut.                                                      |
| Profil fotoğrafı yükleme / silme          |   ✅   | `avatar_url` sütunu ve Supabase Storage var.                                    |
| Telefon & e-posta doğrulama               |   🚧   | E-posta (Supabase Auth) var, SMS (`otp_codes`) tablosu var, entegrasyonu kısmi. |
| Oturum kapatma                            |   ✅   | Supabase Auth standardı.                                                        |
| Hesabı dondurma / Silme (Soft Delete)     |   ❌   | Kullanıcı silme arayüzü yok.                                                    |
| KVKK & Bildirim Tercihleri                |   ❌   | Veritabanında `marketing_consent` vb. alanlar eksik.                            |
| Dil / Varsayılan Konum Tercihi            |   ❌   | Kullanıcı profilinde bu ayarlar yok.                                            |

### 1.2 Salon Keşfi & Arama
| Özellik                         | Durum | Notlar                                                                           |
| :------------------------------ | :---: | :------------------------------------------------------------------------------- |
| Salonları listeleme             |   ✅   | `/search` sayfası mevcut.                                                        |
| Filtreleme: Şehir/İlçe          |   ✅   | `cities`, `districts` tabloları ve filtreler var.                                |
| Filtreleme: Hizmet, Fiyat, Puan |   🚧   | Veritabanı destekliyor ama UI filtreleri temel seviyede.                         |
| Harita üzerinde görüntüleme     |   ✅   | Harita görünümü ve pinleme mevcut.                                               |
| Salon Detay Sayfası             |   ✅   | Bilgi, Hizmetler, Harita mevcut.                                                 |
| Galeri                          |   🚧   | Tek bir kapak görseli (`image`) var, çoklu galeri tablosu (`salon_gallery`) yok. |
| Çalışan profilleri              |   ✅   | `staff` tablosu ve listeleme var.                                                |
| Favorileme (Salon)              |   ✅   | `favorites` tablosu mevcut.                                                      |
| Favorileme (Çalışan)            |   ❌   | Sadece salon favorileme var, çalışan favorileme yok.                             |
| “En erken müsaitlik” etiketi    |   ❌   | Bu hesaplama ve etiketleme şu an yok.                                            |

### 1.3 Randevu Yönetimi
| Özellik                             | Durum | Notlar                                                                                                                                                                     |
| :---------------------------------- | :---: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Randevu oluşturma                   |   ✅   | Temel akış çalışıyor.                                                                                                                                                      |
| Çoklu hizmet seçme                  |   🚧   | UI'da çoklu seçim var, veritabanı tek `salon_service_id` tutuyor gibi görünüyor (`appointments` tablosunda). Çoklu hizmet için ara tablo gerekebilir veya JSON kullanmalı. |
| Çalışan seçme                       |   ✅   | Zorunlu/Opsiyonel çalışan seçimi var.                                                                                                                                      |
| Randevu durumu takibi               |   ✅   | `status` (PENDING, CONFIRMED, CANCELLED) mevcut.                                                                                                                           |
| Randevu iptali                      |   ✅   | Temel iptal işlevi var.                                                                                                                                                    |
| Randevu erteleme / Saati değiştirme |   ❌   | Müşteri panelinden saat değişikliği talebi özelliği yok.                                                                                                                   |
| Takvime ekle (Google/Outlook)       |   ❌   | `.ics` veya API entegrasyonu yok.                                                                                                                                          |

### 1.4 Ödeme & Finans
| Özellik               | Durum | Notlar                                                          |
| :-------------------- | :---: | :-------------------------------------------------------------- |
| **TÜM ÖDEME SİSTEMİ** |   ❌   | Veritabanında ödeme, kart saklama, fatura vb. hiçbir tablo yok. |

### 1.5 Yorum & Değerlendirme
| Özellik                         | Durum | Notlar                                                    |
| :------------------------------ | :---: | :-------------------------------------------------------- |
| Sadece COMPLETED randevuya puan |   ✅   | Mantıksal kontrol var (`is_verified` alanı).              |
| Salon puanı / Yorum yazma       |   ✅   | `reviews` tablosu mevcut.                                 |
| Çalışan puanı                   |   ❌   | Yorumlar salona yapılıyor, özel çalışan puanı sütunu yok. |
| Fotoğraflı yorum                |   ❌   | Yorumlara medya ekleme özelliği yok.                      |

### 1.6 Bildirim & Destek
| Özellik                      | Durum | Notlar                                   |
| :--------------------------- | :---: | :--------------------------------------- |
| Sistem bildirimleri          |   ✅   | `notifications` tablosu var.             |
| Randevu hatırlatmaları       |   🚧   | Altyapı var (Cron/Job scriptleri eksik). |
| Destek talebi / Canlı destek |   ❌   | Destek modülü yok.                       |

---

## 2) SALON / KUAFÖR

### 2.1 Salon Profili & Ayarlar
| Özellik                   | Durum | Notlar                                               |
| :------------------------ | :---: | :--------------------------------------------------- |
| Salon bilgileri düzenleme |   ✅   | Mevcut.                                              |
| Çalışma saatleri          |   ✅   | Salon genel saatleri mevcut (`salon_working_hours`). |
| Galeri yönetimi           |   ❌   | Çoklu fotoğraf yükleme yok.                          |
| Salon doğrulama           |   ✅   | `is_verified` alanı ve Admin onayı mantığı var.      |

### 2.2 Hizmet & Fiyat Yönetimi
| Özellik                   | Durum | Notlar                                 |
| :------------------------ | :---: | :------------------------------------- |
| Hizmet ekleme/çıkarma     |   ✅   | Global listeden seçip ekleme var.      |
| Fiyat & Süre özelleştirme |   ✅   | Mevcut (`salon_services` tablosunda).  |
| Kampanya / Paket          |   ❌   | Kampanya veya paket satış mantığı yok. |

### 2.3 Çalışan Yönetimi
| Özellik                 | Durum | Notlar                                            |
| :---------------------- | :---: | :------------------------------------------------ |
| Çalışan ekleme/çıkarma  |   ✅   | Mevcut.                                           |
| Çalışan rolü & saatleri |   ✅   | Rol (`role`) ve saatler (`working_hours`) mevcut. |
| Performans raporu       |   ❌   | Rapor sayfası veya hesaplaması yok.               |

### 2.4 Takvim & Müsaitlik
| Özellik                       | Durum | Notlar                                                      |
| :---------------------------- | :---: | :---------------------------------------------------------- |
| Slot kapatma / İzin tanımlama |   ✅   | `is_day_off` ve `is_closed` mantığı var.                    |
| Çakışma engelleme             |   ✅   | Randevu algoritması (`slot.ts`) çakışmaları kontrol ediyor. |
| Kapasite yönetimi             |   🚧   | Basit seviyede (Personel müsaitliği üzerinden).             |

### 2.5 Gelir & Raporlama
| Özellik            | Durum | Notlar                                               |
| :----------------- | :---: | :--------------------------------------------------- |
| Dashboard (Özet)   |   🚧   | Basit sayılar var, detaylı grafikler/raporlar eksik. |
| Excel dışa aktarma |   ❌   | Export özelliği yok.                                 |

---

## 3) ADMIN

### 3.1 & 3.2 Yönetim
| Özellik             | Durum | Notlar                                                  |
| :------------------ | :---: | :------------------------------------------------------ |
| Katalog Yönetimi    |   ✅   | Hizmet, Kategori, Tip yönetimi var.                     |
| Salon Onayı/Banlama |   ✅   | `status` (APPROVED, REJECTED, SUSPENDED) ile yapılıyor. |
| Kullanıcı Yönetimi  |   🚧   | Temel profil listeleme var.                             |

### 3.3 & 3.4 Operasyonel
| Özellik           | Durum | Notlar                             |
| :---------------- | :---: | :--------------------------------- |
| Randevu İnceleme  |   ✅   | Tüm randevuları görme yetkisi var. |
| Finans / Komisyon |   ❌   | Finansal modül tamamen eksik.      |
| Şikayet Yönetimi  |   ❌   | Şikayet modülü yok.                |

---

## ÖZET VE ÖNERİLER (Neleri Yapmalıyız?)

Projeniz **MVP (Minimum Viable Product)** aşamasını başarıyla geçmiş, temel fonksiyonları (Arama, Randevu, Salon/Personel Yönetimi) gayet iyi kurgulanmış bir **V1.0** sürümündedir. Ancak "Profesyonel / Üst Segment" bir ürün olması için aşağıdaki kritik eksiklere öncelik verilmelidir:

1.  **Ödeme Sistemi (ACİL):** Bir SaaS ve Pazar Yeri projesi gelirsiz düşünülemez. Ön ödeme/kapora altyapısı kurulmalı.
2.  **Galeri & Medya:** Salonların sadece tek bir resmi olması yetersiz. `salon_gallery` ve yorumlara fotoğraf ekleme özelliği güveni artırır.
3.  **Kampanya & Sadakat:** Müşteriyi elde tutmak için indirim kuponları veya puan sistemi şart.
4.  **Takvim Görünümü:** Salon sahiplerinin işini kolaylaştırmak için Google Takvim benzeri bir sürükle-bırak arayüzü gereklidir.
5.  **Çoklu Fotoğraf & Sosyal Kanıt:** Salon detay sayfasını zenginleştirmek dönüşüm oranını artırır.

**Sonuç:** Temel sağlam, ancak ticarileşme ve kullanıcı bağlılığı (retention) özellikleri henüz eklenmemiş.
