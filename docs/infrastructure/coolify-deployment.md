# Coolify Deployment + Veri Taşıma Rehberi

> Bu belge, **Internet Bilişim** firmasındaki Coolify sunucusuna `kuaforara.com.tr`'yi otomatik deploy etmek + lokal Docker Supabase'in tüm verisini taşımak için adım adım rehberdir.

**Son güncelleme:** 2026-06-27
**Hedef sunucu:** Internet Bilişim Coolify instance
**Domain:** `kuaforara.com.tr` + subdomain wildcard `*.kuaforara.com.tr`

---

## 📐 Mimari Bakış

Production'da 3 ayrı Coolify "Application" çalışacak:

```
                  ┌─────────────────────────────────┐
                  │   Internet (Cloudflare DNS)      │
                  │   kuaforara.com.tr               │
                  │   *.kuaforara.com.tr (wildcard)  │
                  └────────────────┬─────────────────┘
                                   ↓
                  ┌─────────────────────────────────┐
                  │  Coolify Traefik (Reverse Proxy) │
                  │  HTTPS + Let's Encrypt           │
                  └────┬─────────┬──────────┬────────┘
                       ↓         ↓          ↓
                ┌──────────┐ ┌─────────┐ ┌──────────┐
                │ Next.js  │ │ Supabase│ │ Sub-      │
                │ App      │ │ Stack   │ │ services  │
                │ (port    │ │ (Kong   │ │ (Redis,   │
                │ 3000)    │ │ 8000)   │ │ Sentry?)  │
                └──────────┘ └─────────┘ └──────────┘
                                   ↓
                  ┌─────────────────────────────────┐
                  │  Persistent Volumes              │
                  │  • postgres-data                 │
                  │  • storage-data (images/files)   │
                  └─────────────────────────────────┘
```

> **Önemli:** Lokal Docker setup'tan farkı: Coolify her servisi ayrı "Application" olarak yönetir, ortak network kurar, otomatik SSL ekler.

---

## 🗺️ Yol Haritası (Sırayla)

1. **Hazırlık** — DNS + Coolify hesabı + repo erişimi
2. **Supabase Stack kurulumu** — DB + Auth + Storage + Kong + Studio
3. **Veri taşıma** — Lokal `pg_dump` → prod restore + Storage migration
4. **Next.js App deploy** — Git auto-deploy hook + env vars
5. **DNS + SSL** — Cloudflare cnamefix + Let's Encrypt
6. **Doğrulama** — Smoke test + monitoring
7. **CI/CD** — Push'lar otomatik deploy

---

## 1️⃣ Hazırlık

### DNS Kayıtları (Cloudflare)

`kuaforara.com.tr` Cloudflare'de varsayalım. Şu kayıtları ekle:

| Tür | İsim | Hedef | Proxy |
|-----|------|-------|-------|
| `A` | `@` | Coolify server IP | 🟠 Proxied |
| `A` | `*` | Coolify server IP | 🟠 Proxied (wildcard subdomain için) |
| `A` | `supabase` | Coolify server IP | ⚪ DNS only (Let's Encrypt için) |
| `CNAME` | `www` | `kuaforara.com.tr` | 🟠 Proxied |
| `TXT` | `_resend.*` | Resend DKIM | ⚪ |
| `MX` | `@` | Resend MX | ⚪ |

> **Coolify server IP'yi** firma sysadmin'den al.

### Coolify Hesabı + Repo Erişimi

1. Internet Bilişim Coolify panel URL'ini al (örn. `coolify.internetbilisim.com.tr`)
2. Hesap oluşturuldu mu doğrula (firma sana hesap açtı mı?)
3. Coolify → **Sources** → GitHub bağlantısı:
   - "Connect GitHub" → kişisel veya org Account → repo'yu seç (`muratyolal80/guzellik-randevu-ui`)
   - Eğer **private repo** ise GitHub Personal Access Token gerek (Coolify token oluşturmanı isteyecek)

---

## 2️⃣ Supabase Stack Kurulumu (Production)

Lokal'de `supabase-project/docker-compose.yml` ile çalışıyor. Aynı yapıyı Coolify'a kurmak.

### Seçenek A — Coolify'ın "One-Click Supabase" Servisi (varsa, önerilen)

1. Coolify → New Resource → **Service** → "Supabase" ara
2. Versiyonu seç (en güncel stable)
3. Ayarlar:
   - **Project Name:** `kuaforara-supabase`
   - **Domain:** `supabase.kuaforara.com.tr` (Studio + Kong gateway)
   - **POSTGRES_PASSWORD:** [Üret, kaydet — `.env`'e yazılacak]
   - **JWT_SECRET:** [Üret 64-byte hex]
   - **ANON_KEY** + **SERVICE_ROLE_KEY:** JWT_SECRET'tan otomatik üretilir
   - **DASHBOARD_USERNAME / PASSWORD:** Studio için login
4. Persistent storage:
   - `/var/lib/postgresql/data` → volume `postgres-data`
   - `/var/lib/storage` → volume `storage-data`
5. **Deploy** → 3-5 dakika

### Seçenek B — Custom Docker Compose ile Kurulum

Coolify "Service" yoksa veya custom config istiyorsan:

1. Lokal'den `supabase-project/docker-compose.yml`'yi export et
2. Coolify → New Resource → **Docker Compose**
3. Yapıştır + environment variables ekle (aşağıdaki `.env` listesinden)
4. Deploy

### Environment Variables (Supabase Tarafı)

```env
POSTGRES_PASSWORD=<random-32-byte>
JWT_SECRET=<random-64-byte-hex>
ANON_KEY=<JWT_SECRET'tan üretilmiş anon JWT>
SERVICE_ROLE_KEY=<JWT_SECRET'tan üretilmiş service_role JWT>
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=<güçlü-şifre>
SITE_URL=https://kuaforara.com.tr
API_EXTERNAL_URL=https://supabase.kuaforara.com.tr
SUPABASE_PUBLIC_URL=https://supabase.kuaforara.com.tr
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=<resend-api-key>
SMTP_ADMIN_EMAIL=noreply@kuaforara.com.tr
SMTP_SENDER_NAME=Kuaforara
```

> **JWT_SECRET'tan ANON/SERVICE_ROLE üretmek için:** Supabase Docker'ın `supabase-jwt` aracını kullan veya https://jwt.io üzerinden manuel oluştur (payload: `{"role":"anon","iss":"supabase","iat":NOW,"exp":NOW+10y}`).

---

## 3️⃣ Veri Taşıma — Lokal → Prod

### 3.1 Postgres Dump (Lokal Docker)

Lokal terminalinde:

```powershell
# Lokal Docker Supabase'den FULL dump al
docker exec -t supabase-db pg_dump -U postgres -d postgres `
  --format=custom `
  --no-owner `
  --no-privileges `
  --exclude-schema=auth `
  --exclude-schema=storage `
  --exclude-schema=realtime `
  --exclude-schema=_analytics `
  --exclude-schema=supabase_functions `
  -f /tmp/kuaforara-data.dump

# Dump'ı host'a kopyala
docker cp supabase-db:/tmp/kuaforara-data.dump ./kuaforara-data.dump
```

**Niye `--exclude-schema=auth/storage/realtime`?**
- Bu schema'lar Supabase'in iç servisleri. Production'da yeniden oluşacaklar.
- Sadece `public` ve diğer custom schema'ları taşımak istiyoruz (verilerimiz orada).

**`auth.users` ayrı al** (kullanıcı hesapları kritik):

```powershell
docker exec -t supabase-db pg_dump -U postgres -d postgres `
  --format=custom `
  --no-owner `
  --no-privileges `
  --data-only `
  -t auth.users `
  -t auth.identities `
  -f /tmp/kuaforara-auth.dump

docker cp supabase-db:/tmp/kuaforara-auth.dump ./kuaforara-auth.dump
```

### 3.2 Prod'a Yükle (Coolify Postgres)

Coolify'da Supabase stack ayağa kalktıktan sonra, Coolify panel → Postgres servisinin **Terminal** sekmesini aç (veya SSH ile sunucuya gir):

```bash
# 1. initdb/Master-Database-Setup.sql ile schema'yı kur (sıfırdan)
psql -U postgres -d postgres < /path/to/Master-Database-Setup.sql

# 2. Tüm New-XX migration'ları sırayla
for f in New-{01..20}-*.sql; do psql -U postgres -d postgres < $f; done

# 3. Dump'ı restore et
pg_restore -U postgres -d postgres --data-only --no-owner --no-privileges kuaforara-data.dump

# 4. auth.users restore
pg_restore -U postgres -d postgres --data-only --no-owner --no-privileges kuaforara-auth.dump
```

### 3.3 Storage (Resimler) Taşıma

#### A. Lokal Storage Bucket'lardan Export

`scripts/mcp/supabase-storage-mcp.mjs` MCP'sini kullanarak veya manuel:

```bash
# Lokal Docker Supabase storage volume'ünden tüm dosyaları kopyala
docker cp supabase-storage:/var/lib/storage ./storage-backup
```

#### B. Prod'a Import

```bash
# Storage volume'üne yükle (Coolify SSH)
scp -r ./storage-backup/* coolify-server:/var/lib/coolify/volumes/supabase-storage/
```

VEYA `supabase storage cp` CLI ile bucket-bucket:

```bash
# Her bucket için:
for bucket in salon-images services profiles; do
  # Lokalden indir
  supabase storage cp --recursive "ss:///$bucket" "./backup/$bucket"
  # Prod'a yükle
  SUPABASE_URL=https://supabase.kuaforara.com.tr SUPABASE_SERVICE_ROLE_KEY=<prod-key> \
    supabase storage cp --recursive "./backup/$bucket" "ss:///$bucket"
done
```

### 3.4 Doğrulama (Veri Geldi mi?)

Prod Supabase Studio'ya gir (`supabase.kuaforara.com.tr`) → SQL Editor:

```sql
SELECT
  (SELECT COUNT(*) FROM cities) AS cities,
  (SELECT COUNT(*) FROM districts) AS districts,
  (SELECT COUNT(*) FROM global_services) AS services,
  (SELECT COUNT(*) FROM salons WHERE status='APPROVED') AS approved_salons,
  (SELECT COUNT(*) FROM auth.users) AS users,
  (SELECT COUNT(*) FROM _migrations) AS migrations;
```

Beklenen: 81 / 975 / 63 / 12 / 4 / 20 (lokal'den son okunan rakamlar).

---

## 4️⃣ Next.js App Deploy

### Coolify'da Yeni Application

1. Coolify → New Resource → **Application**
2. **Source:** GitHub → `muratyolal80/guzellik-randevu-ui`
3. **Branch:** `main` (production)
4. **Build Pack:** Nixpacks (otomatik Next.js algılar) veya Dockerfile

#### Dockerfile Önerisi (önerilen — performans + kontrol)

Repo köküne `Dockerfile.prod` (yoksa şu içerikle oluşturulacak — sıradaki commit'lere ekle):

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> `next.config.mjs`'e `output: 'standalone'` eklemen gerekiyor (yoksa ekleyeceğiz).

### Environment Variables (Next.js App)

Coolify Application → Environment Variables sekmesinde ekle. Tam liste:

```env
# Site
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://kuaforara.com.tr

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://supabase.kuaforara.com.tr
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<prod-service-role-key>

# SMS (NetGSM canlı)
ILETIMERKEZI_USERCODE=<netgsm-user>
ILETIMERKEZI_PASSWORD=<netgsm-pass>
ILETIMERKEZI_HEADER=KUAFORARA
OTP_DEMO_MODE=false

# Email (Resend)
RESEND_API_KEY=re_<api-key>
EMAIL_FROM=noreply@kuaforara.com.tr
EMAIL_FROM_NAME=Kuaforara

# IYS
IYS_API_BASE_URL=https://api.iys.org.tr/sps/KUAFORARA
IYS_API_KEY=<iys-bearer-token>
IYS_BRAND_CODE=KUAFORARA

# PayTR
PAYTR_MERCHANT_ID=<mağaza-id>
PAYTR_MERCHANT_KEY=<merchant-key>
PAYTR_MERCHANT_SALT=<merchant-salt>
PAYTR_TEST_MODE=0
PAYTR_CALLBACK_URL=https://kuaforara.com.tr/api/paytr/callback

# Google OAuth (Supabase Studio'da da set)
GOOGLE_CLIENT_ID=<google-id>
GOOGLE_CLIENT_SECRET=<google-secret>

# Cron
CRON_SECRET=<random-64-byte-hex>

# Sentry
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>
SENTRY_ORG=<sentry-org>
SENTRY_PROJECT=kuaforara
SENTRY_AUTH_TOKEN=<release-upload-token>

# Cloudflare Turnstile
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=<site-key>
CLOUDFLARE_TURNSTILE_SECRET_KEY=<secret-key>

# Gemini AI
GEMINI_API_KEY=<gemini-api-key>
```

### Domain Bağlama

Coolify Application → **Domains** → `kuaforara.com.tr` ekle → "Generate SSL" butonu (Let's Encrypt otomatik).

---

## 5️⃣ Otomatik Deploy (Git Webhook)

Coolify zaten GitHub webhook ekler. Test et:

1. Lokal'de küçük bir değişiklik yap (örn. README güncelle)
2. `git push origin main`
3. Coolify dashboard → Application → Deployments sekmesinde yeni deploy başlamalı
4. ~2-5 dakika sonra `kuaforara.com.tr` güncel olmalı

### Manuel Deploy

Coolify Application → **Deploy** butonu → branch seç → Force Deploy.

---

## 6️⃣ DNS + SSL Doğrulama

```bash
# DNS doğru mu?
dig kuaforara.com.tr +short
dig supabase.kuaforara.com.tr +short

# SSL sertifika geçerli mi?
curl -I https://kuaforara.com.tr
curl -I https://supabase.kuaforara.com.tr

# Cloudflare proxy + Coolify Traefik chain çalışıyor mu?
curl -v https://kuaforara.com.tr 2>&1 | grep -E "HTTP/|server:"
```

Beklenen: HTTP/2 200, `server: cloudflare`, Let's Encrypt sertifika geçerli.

---

## 7️⃣ Smoke Test (Launch Öncesi)

| Test | URL / Action | Beklenen |
|------|--------------|----------|
| Anasayfa | `https://kuaforara.com.tr` | 200, salon listesi gelir |
| Salon detay | `/salon/<id>` | 200, hizmetler + personel listelenir |
| Kayıt | `/register` → form doldur | OTP SMS gelir, `iys_registered_at` dolu |
| Login | `/login` | Başarılı, role'e göre yönlendirme |
| Subdomain | `https://test-salon.kuaforara.com.tr` | `/salon-slug/test-salon` rewrite çalışıyor |
| Booking | Tam akış sona kadar | Randevu oluştu, SMS + email geldi |
| Admin | `/admin/users` | Kullanıcı listesi gelir |
| Sentry | Bilerek hata tetikle | Sentry dashboard'da görünür |
| Cron | 5 dk bekle | `/api/cron/notifications` otomatik tetiklendi |

---

## 8️⃣ Geri Dönüş Planı (Sorun Çıkarsa)

### Önce Backup Al

```powershell
# Veri taşımadan ÖNCE prod DB'nin (boş halinin) snapshot'ını al
docker exec -t coolify-postgres pg_dump -U postgres -d postgres -f /backups/pre-migration.dump
```

### Geri Dönüş Adımları

1. **App geri al:** Coolify Application → Deployments → önceki deploy'a "Redeploy"
2. **DB geri al:** `pg_restore` ile pre-migration snapshot
3. **DNS geri al:** Cloudflare → A kaydı önceki sunucuya (eski varsa)

---

## 🆘 Yaygın Sorunlar

| Sorun | Neden | Çözüm |
|-------|-------|-------|
| `https://kuaforara.com.tr` "502 Bad Gateway" | Coolify Traefik upstream'e ulaşamıyor | App container running mi kontrol et (Logs sekmesi) |
| Login `500 Internal Server Error` | `NEXT_PUBLIC_SUPABASE_URL` yanlış | Env var değerini doğrula (HTTPS olmalı) |
| Storage resimleri 404 | Volume mount eksik | `/var/lib/storage` doğru mount mu Coolify panel'de bak |
| OTP gelmiyor | `OTP_DEMO_MODE=true` veya NetGSM kredensiyel yanlış | `.env` kontrol + NetGSM panel log |
| PayTR callback'i geçersiz hash | `PAYTR_MERCHANT_KEY` yanlış | PayTR Mağaza Panel → Bilgi sekmesinde key kontrol |
| `subdomain.kuaforara.com.tr` 404 | DNS wildcard `*` kaydı yok | Cloudflare'de `A *` ekle |

---

## 📸 Ekran Görüntüsü Yer Tutucu

> Kullanıcı bu adımları yaparken hangi sayfada takılırsa **screenshot paylaşacak**. Buraya:
> - Coolify dashboard ana ekran
> - "New Resource" formu
> - Environment Variables ekranı
> - Domains + SSL ekranı
> ... ekran görüntüleri ile birlikte spesifik talimatlar eklenecek.

---

## 📋 Launch Günü Checklist

- [ ] DNS A kayıtları propagate (24 saat öncesi)
- [ ] Cloudflare proxy 🟠 aktif
- [ ] Supabase stack çalışıyor (`supabase.kuaforara.com.tr/rest/v1/` 200 dönüyor)
- [ ] DB veri taşındı + smoke SQL queries
- [ ] Storage resimleri geldi
- [ ] Next.js app deploy yeşil ışık
- [ ] Tüm env vars Coolify'da set
- [ ] `OTP_DEMO_MODE=false`
- [ ] PayTR `test_mode=0`
- [ ] Resend domain DKIM doğrulandı
- [ ] İYS marka kodu + API çalışıyor
- [ ] Sentry hata yakalıyor (bilerek test)
- [ ] UptimeRobot monitörleri yeşil
- [ ] Cron çalışıyor (5 dk içinde log'da)
- [ ] İlk admin kullanıcı oluşturuldu (DB veri taşımada geldi)
- [ ] Cloudflare WAF kuralları (rate limit, country block) ayarlandı
- [ ] Backup cron (`scripts/backup-retention.ps1` veya Coolify scheduled backup)

---

## 📞 Sonraki Adım

1. **Coolify dashboard'a gir** → "Add New Resource" ekran görüntüsü paylaş
2. Adımları birlikte yürütürüz — her ekranda hangi alanı doldurduğunu söylersin, ben hangi değeri girmen gerektiğini söylerim
3. Sorun çıkarsa screenshot paylaş, çözeriz

> **Önemli:** İlk deploy ~30-60 dakika sürer (kurulum + veri taşıma + smoke test). Yedek planı için lokal Docker setup'ı kapatma — sorun çıkarsa geri dönülebilir.
