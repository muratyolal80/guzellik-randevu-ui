# Altyapı: Veritabanı Şeması

## Genel Bakış
- **Motor:** PostgreSQL 15+ (Supabase self-hosted, Docker)
- **Extension'lar:** `uuid-ossp`, `postgis`, `btree_gist`
- **Tablolar:** 47 (BASE TABLE) + 8 view
- **Toplam kayıt (current):** ~1.500 satır (test data dahil)

## Modül Bazlı Tablo Listesi

### Kullanıcı & Auth
| Tablo | Açıklama |
|-------|----------|
| `auth.users` | Supabase Auth (system) |
| `profiles` | Public profil + KVKK + soft-delete |
| `otp_codes` | 6 haneli kodlar |
| `sms_verifications` | İYS uyumluluk telefon kaydı |
| `user_sessions` | Aktif oturum (KVKK) |
| `iys_logs` | SMS gönderim audit |
| `invites` | Personel davet token |

### Salon
| Tablo | Açıklama |
|-------|----------|
| `salons` | Ana salon (40 kolon) |
| `salon_types` | Salon tipi master (Berber, Kuaför, vs) |
| `salon_assigned_types` | Çoklu tip atama |
| `salon_type_categories` | Tip-kategori eşleme |
| `salon_services` | Salonun sunduğu hizmetler |
| `salon_resources` | Ekipman/oda |
| `salon_working_hours` | Salon mesai (haftalık) |
| `salon_gallery` | Fotoğraflar |
| `salon_memberships` | Salon-kullanıcı üyelik |
| `salon_sub_merchants` | Iyzico sub-merchant + IBAN |

### Personel
| Tablo | Açıklama |
|-------|----------|
| `staff` | Personel ana |
| `working_hours` | Personel mesai |
| `staff_services` | Personel-hizmet matrisi |
| `staff_branches` | Personel-şube matrisi |
| `staff_reviews` | Personel yorumu |

### Hizmet (Master)
| Tablo | Açıklama |
|-------|----------|
| `service_categories` | Kategori (Saç, Bakım, vs) |
| `global_services` | Platform standart hizmet listesi |

### Lokasyon
| Tablo | Açıklama |
|-------|----------|
| `cities` | 81 il |
| `districts` | 975 ilçe |

### Randevu
| Tablo | Açıklama |
|-------|----------|
| `appointments` | Ana randevu (25 kolon) |
| `appointment_coupons` | Kullanılan kuponlar |

### Müşteri / CRM
| Tablo | Açıklama |
|-------|----------|
| `salon_customers` | Owner CRM kayıt |
| `customer_notes` | Owner notları |
| `favorites` | Favori salonlar |
| `reviews` | Salon yorumları |
| `review_images` | Yorum fotoğrafları |

### Finans
| Tablo | Açıklama |
|-------|----------|
| `subscription_plans` | Plan kataloğu |
| `subscriptions` | Aktif abonelikler |
| `payment_history` | Tüm ödeme geçmişi |
| `transactions` | Esnek finansal hareketler |
| `coupons` | Kupon kodları |
| `packages` | Paket hizmet |
| `package_services` | Paket-hizmet M-N |
| `campaign_rules` | Dinamik kampanya |
| `iyzico_webhooks` | Iyzico audit log |

### Bildirim
| Tablo | Açıklama |
|-------|----------|
| `notifications` | In-app bildirim |
| `notification_queue` | Cron tabanlı kuyruk |

### Destek
| Tablo | Açıklama |
|-------|----------|
| `support_tickets` | Ticket başlık |
| `ticket_messages` | Thread mesajları |

### Sistem
| Tablo | Açıklama |
|-------|----------|
| `audit_logs` | Tüm kritik değişiklikler |
| `platform_settings` | JSON config (banka bilgisi vs) |
| `spatial_ref_sys` | PostGIS system table |

## View'lar
| View | Amaç |
|------|------|
| `salon_details` | Salon + il + ilçe + tip JOIN |
| `salon_service_details` | Hizmet + kategori + salon |
| `salon_ratings` | Ortalama puan |
| `salon_usage_stats` | Plan limit vs kullanım |
| `verified_reviews_view` | Sadece doğrulanmış yorumlar |
| `staff_reviews_detailed` | Personel yorumu + isim |
| `geography_columns` / `geometry_columns` | PostGIS system view'lar |

## ER İlişkileri (Özet)

```
profiles ─┬─ owns ─→ salons ─┬─ has ─→ staff ─┬─ has ─→ working_hours
          │                  │                ├─ does ─→ staff_services ─→ salon_services
          │                  ├─ has ─→ salon_services ─→ global_services ─→ service_categories
          │                  ├─ has ─→ salon_working_hours
          │                  ├─ has ─→ salon_gallery
          │                  └─ has ─→ subscriptions ─→ subscription_plans
          ├─ books ─→ appointments ─┬─ for ─→ salon_services
          │                         ├─ by ─→ staff
          │                         └─ uses ─→ appointment_coupons ─→ coupons
          └─ writes ─→ reviews ─→ review_images
```

## Demo Veri Durumu (2026-05-07)
| Tablo | Kayıt | Not |
|-------|-------|-----|
| `salons` | 12 | Hepsi APPROVED |
| `staff` | 36 | Hepsi aktif + KVKK |
| `salon_services` | 68 | Salon başına ~5 |
| `working_hours` | 252 | 36 staff × 7 gün |
| `staff_services` | 204 | Capability matrisi |
| `salon_assigned_types` | 12 | Primary type per salon |
| `salon_gallery` | 36 | Salon başına 3 |
| `reviews` | 36 | Salon başına 3 |
| `appointments` | 36 | Yarın 10:00 test slot dolu |
| `subscriptions` | 12 | Hepsi STARTER |
| `subscription_plans` | 4 | STARTER/PRO/BUSINESS/ELITE |
| `cities` | 81 | TR il |
| `districts` | 975 | TR ilçe |
| `global_services` | 63 | Standart hizmet |

## Sağlık Kontrolü
Kapsamlı kontrol için: [initdb/db-health-check.sql](../../initdb/db-health-check.sql)
```bash
docker exec -i supabase-db psql -U postgres -d postgres < initdb/db-health-check.sql
```

## Açık Aksiyon (TODO)
- 🟡 **Master schema güncelleme** — `Master-Database-Setup.sql` mevcut DB ile %100 uyumlu değil; New-04..10 patches uygulanmış. Yeni dump alınmalı (PR öncesi).
- 🟢 **DB index audit** — yavaş sorguları tespit, eksik index ekle (`pg_stat_statements`)
- 🟢 **Vacuum/analyze cron** — büyüyen tablolar için scheduled
- 🟢 **Connection pooling** — Supavisor ile zaten port 5432, yapılandırma optimize edilebilir
- 🟢 **Backup stratejisi** — `scripts/backup-scheduler.ps1` var ama doğrulanmadı

## Bağlantılar
- Master schema: [initdb/Master-Database-Setup.sql](../../initdb/Master-Database-Setup.sql)
- Migration listesi: [Migrations](migrations.md)
- RLS denetimi: [RLS Security](rls.md)
- Health check: [initdb/db-health-check.sql](../../initdb/db-health-check.sql)
