# Claude Skills Profesyonel Rehberi

**Kaynak marketplace:** `alirezarezvani/claude-skills` → `claude-code-skills` slug
**Toplam skill:** ~345 (Engineering, Marketing, C-Level, Compliance, Product, Finance dahil)
**Hedef okuyucu:** Bu projede çalışan solo founder, multi-tenant SaaS marketplace, Next.js + Supabase

---

## 0. Skill Nedir, Plugin Nedir?

**Skill** = Claude'a "şu tip iş geldiğinde önce bu kuralları/yöntemi oku" diyen markdown talimat seti (`SKILL.md`). Skill çağrılınca bağlamı yüklenir, Claude o kurallarla davranır.

**Plugin** = Bir veya daha fazla skill + slash command + agent'ın paketlenmiş hali. `/plugin install` ile bir paket içinde gelen tüm skill'ler aktif olur.

**Marketplace** = Plugin/skill'lerin barındığı kaynak (GitHub repo). `/plugin marketplace add <repo>` ile kayıt.

**Aktivasyon sırası:**
1. `/plugin marketplace add alirezarezvani/claude-skills`
2. `/plugin install <paket>@claude-code-skills`
3. Claude Code restart
4. Konuşma başında `Available skills` listesinde görünür → Skill tool ile veya doğal tetikleyiciyle açılır

---

## 1. Kategori Haritası (9 Ana Domain)

| Domain | Skill Sayısı | Ne için |
|--------|--------------|---------|
| Engineering — Core | 51 | Frontend/backend/QA/DevOps/security temelleri |
| Engineering — POWERFUL | 78 | RAG, DB design, CI/CD, Helm, Terraform — ileri seviye |
| Product | 17 | PM toolkit, UX research, analytics, roadmap |
| Marketing | 46 | İçerik, SEO/AEO, CRO, growth, sales |
| Productivity | 6 | Capture, email, reflection, handoff |
| Regulatory & QM | 18 | ISO 13485, MDR, FDA, GDPR, SOC 2 |
| Compliance OS | 9 | Kontroller, kanıt, audit workflow |
| C-Level Advisory | 66 | CTO/CFO/CMO/COO/CPO personaları |
| Business & Finance | ~25 | Müşteri başarısı, satış, fiyatlama, DCF, SaaS metrikleri |

---

## 2. Senin Projene Direkt Yarayacak Skill'ler

Stack: **Next.js 16 + React 19 + TS + Tailwind + Supabase + multi-tenant SaaS**

### 🔴 ZORUNLU 4 paket (launch öncesi)

| Paket | Komut | Neden |
|-------|-------|-------|
| **engineering-skills** | `/plugin install engineering-skills@claude-code-skills` | 24 core: senior-frontend, senior-backend, senior-architect, code-reviewer, senior-qa — günlük geliştirme |
| **engineering-advanced-skills** | `/plugin install engineering-advanced-skills@claude-code-skills` | 25 ileri: skill-security-auditor, database-designer, api-design-reviewer, observability-designer, performance-profiler |
| **ra-qm-skills** | `/plugin install ra-qm-skills@claude-code-skills` | KVKK + GDPR uzmanlığı: gdpr-dsgvo-expert, soc2-compliance — senin İYS/KVKK launch blocker'ların için kritik |
| **playwright-pro** | `/plugin install playwright-pro@claude-code-skills` | Booking + üyelik E2E test — Sprint D'nin destekçisi |

### 🟡 OPSIYONEL (büyürken)

| Paket | Komut | Ne zaman |
|-------|-------|----------|
| **product-skills** | `/plugin install product-skills@claude-code-skills` | Roadmap + feature spec yazımı kritik olunca |
| **marketing-skills** | `/plugin install marketing-skills@claude-code-skills` | SEO/AEO + landing page + email kampanya, müşteri kazanma fazında |
| **c-level-skills** | `/plugin install c-level-skills@claude-code-skills` | CTO/CFO/CMO sanal mentor, stratejik karar — yatırımcı görüşmesi öncesi |

### 🟢 NIŞ (Tek tek kur)

| Skill | Komut | Kullanım |
|-------|-------|----------|
| **self-improving-agent** | `/plugin install self-improving-agent@claude-code-skills` | Auto-memory curation — Claude'un projeni daha iyi hatırlaması için |
| **karpathy-coder** | `/plugin install karpathy-coder@claude-code-skills` | Andrej Karpathy stilinde temiz, minimal kod yazımı |
| **content-creator** | `/plugin install content-creator@claude-code-skills` | Blog post, sosyal medya içeriği |

---

## 3. Engineering — Core (24 skill) Detay

Bu paket günlük geliştirme için merkezi. Şu skill'leri içerir:

### Persona/Senior Skills (uzman gibi davran)

- **senior-frontend** — React/Next/Tailwind kararları için. Component scaffolding, performans optimizasyonu, state management önerileri.
  → *Senin projende:* `app/owner/*` panel UI iyileştirmeleri, `components/Map/*` performans

- **senior-backend** — Node/Express/Postgres tasarım kararları. API yapılandırması, DB optimizasyonu.
  → *Senin projende:* `app/api/*` route'ları, Supabase RLS pattern'leri

- **senior-architect** — Sistem genelinde mimari kararlar (microservice mi monolit mi, queue mi event mi).
  → *Senin projende:* Notification queue + Vercel Cron mimarisi, multi-tenant scaling

- **senior-fullstack** — Uçtan uca özellik tasarımı (frontend + backend + DB)
  → *Senin projende:* Yeni feature scoping (booking kapora, recurring sub)

- **senior-qa** — Test stratejisi, manuel + otomatik test planları
  → *Senin projende:* Booking 4-adım E2E senaryo planı

- **senior-secops** / **senior-security** — Güvenlik mimarisi, threat modeling, pentesting
  → *Senin projende:* RLS audit, PayTR callback hash adversarial review, KVKK veri akışı

### Workflow/Process Skills

- **code-reviewer** — TS/JS/Python PR review, OWASP kontrolü, best practice
  → *Senin projende:* Her PR öncesi otomatik review

- **api-design-reviewer** — REST/GraphQL API tasarım kalitesi
  → *Senin projende:* `/api/booking/*`, `/api/paytr/*` ergonomi denetimi

- **codebase-onboarding** — Yeni geliştirici için kod tabanı turu üretir
  → *Senin projende:* Repo'ya freelancer/junior alınca CLAUDE.md eşliğinde tur

- **code-tour** — Belirli bir özelliği baştan sona gezdiren rehber üretir
  → *Senin projende:* "PayTR iframe akışı nasıl çalışır?" → adım adım tour

### Diğer Önemliler

- **migration-architect** — Database schema migration stratejisi
- **observability-designer** — Logging, monitoring, alerting tasarımı (Sentry + UptimeRobot setup'ın için)
- **performance-profiler** — N+1, slow query, render bottleneck tespiti
- **dependency-auditor** — npm audit + vulnerable package analizi
- **env-secrets-manager** — `.env` güvenlik kontrolü
- **monorepo-navigator** — (senin tek-repo'n için faydası az)
- **tdd-guide** — Test-driven development uygulama rehberi

---

## 4. Engineering — POWERFUL (25 skill) Detay

İleri seviye, spesifik problem çözücü skill'ler:

### Veritabanı

- **database-designer** — Yeni şema tasarımı, normalizasyon kararları
  → *Senin projende:* Yeni tablo eklerken (örn. `slot_reservations`)

- **database-schema-designer** — ER diyagram + migration script üretici
  → *Senin projende:* `salon_resources` ↔ `services` ilişkilendirmesi

- **sql-database-assistant** — Karmaşık SQL query yazımı, EXPLAIN ANALYZE
  → *Senin projende:* `getFinancialReports`, `getSalonsByLocation` PostGIS query

- **data-quality-auditor** — Veri tutarsızlığı, NULL leak, integrity check
  → *Senin projende:* `cities`/`districts` encoding sonrası tutarlılık denetimi

### Güvenlik

- **skill-security-auditor** — Skill'lerin güvenlik denetimi (meta)
- **security-guidance** — Genel güvenlik rehberi
- **security-pen-testing** — Sızma test senaryoları
- **red-team** — Saldırgan bakış açısı, threat modeling
- **threat-detection** — IOC tanımlama, log analizi
- **incident-commander** / **incident-response** — Olay sırasında ne yapılır
- **cloud-security** — Cloud config güvenliği (AWS/GCP/Azure)
- **ai-security** — LLM/Agent güvenliği, prompt injection
- **secrets-vault-manager** — HashiCorp Vault / cloud secret yönetimi

→ *Senin projende:* RLS audit + KVKK veri sızıntı analizi + PayTR callback hardening için ardışık kullanılır

### CI/CD & DevOps

- **ci-cd-pipeline-builder** — GitHub Actions / GitLab CI pipeline
  → *Senin projende:* Vercel deploy + migration test pipeline

- **docker-development** — Dockerfile + compose best practices
  → *Senin projende:* Supabase local dev compose

- **devops-engineer** (persona) — Genel SRE/DevOps mentörü

### Test

- **api-test-suite-builder** — REST API için test suite generation
- **tdd** / **tdd-guide** — Red-Green-Refactor disiplini
- **coverage** (playwright-pro içinde) — Test kapsama analizi
- **fix** (playwright-pro içinde) — Flaky test düzeltme

### Kod Kalitesi

- **karpathy-check** / **karpathy-coder** — Andrej Karpathy stilinde minimal, açıklayıcı kod
- **focused-fix** — Sürekli bağlam genişletmeden, dar odaklı bug fix
- **tech-debt** / **tech-debt-tracker** — Teknik borç tespiti ve önceliklendirme
- **pr-review-expert** — PR yorumu yazımı ve değerlendirme

---

## 5. RA-QM Skills (12 skill) — Senin Launch Blocker'ın

Bu paket KVKK/İYS/GDPR uyumluluğun için kritik:

- **gdpr-dsgvo-expert** — GDPR + KVKK rehberi, veri envanteri, DPIA
  → *Senin projende:* Sprint A U1 (register KVKK checkbox), veri silme cron politikası, veri taşıma hakkı

- **soc2-compliance** — SOC 2 Type I/II hazırlık
  → *Senin projende:* Kurumsal müşteri kazanmaya başlayınca

- **gdpr-audit-prep** — Audit öncesi kontrol listesi
- **soc2-audit-prep** — SOC 2 audit hazırlık
- **soc2-compliance** vs **compliance-os** skill'leri farklı

---

## 6. C-Level Advisory (28 skill) — Stratejik Mentörlük

Sanal C-suite. Her biri farklı persona:

- **CTO Advisor** — Tech stack kararları, ekip yapısı, build vs buy
- **CFO Advisor** — Finansal modelleme, unit economics, runway
- **CMO Advisor** — Go-to-market, marka konumlandırma, kampanya stratejisi
- **COO Advisor** — Süreç optimizasyonu, KPI, ölçeklendirme
- **CPO Advisor** — Ürün strateji, pricing, roadmap
- **CRO Advisor** — Satış organizasyonu, kanal
- **CISO Advisor** — Güvenlik yönetimi, risk
- **CDO/CIO Advisor** — Veri/IT stratejisi

→ *Senin projende:* Yatırımcı pitch öncesi CFO + CMO; ölçeklenirken CTO + COO; KVKK strategisi için CISO

**stress-test** skill'i — c-level-advisor altında — verdiği planı/projeyi rakipler/regülatör/pazar açısından bombalama; mantıklı zayıflıkları çıkarır.

---

## 7. Marketing Skills (43 skill) — Trafik & Conversion

Müşteri kazanma fazına girince:

- **SEO/AEO** — Klasik SEO + Answer Engine Optimization (ChatGPT/Perplexity için)
  → *Senin projende:* `/salon/*` sayfaları, blog içeriği

- **content-creator** — Blog, sosyal medya, email metni
- **email-marketing-expert** — Kampanya tasarımı, segmentasyon
- **landing-page-optimizer** — A/B test öncesi sayfa kritiği
- **growth-experiment-designer** — Deney tasarımı, hipotez
- **sales-intelligence** — Hedef hesap ve persona araştırması
- **brand-voice** — Marka sesi tutarlılığı
- **conversion-rate-optimizer** — Funnel analizi, CRO

→ *Senin projende:* Launch sonrası, mahalle berberi → premium güzellik merkezi tüm pazara hitap eden farklı kampanyalar

---

## 8. Skill Kullanım Patternleri

### Pattern A — Doğrudan Çağrı (Slash Command)
```
/senior-architect "Notification queue Vercel Cron mu, ayrı worker servisi mi olmalı?"
```

### Pattern B — Doğal Dil Tetikleme
"Bu PR'ı review et" → code-reviewer otomatik açılır
"Bu özelliği brainstorm yapalım" → brainstorming
"Şu mimari karara bir bak" → senior-architect

### Pattern C — Chaining (Skill Zinciri)
```
Plan: brainstorming → senior-architect → senior-frontend → code-reviewer
```
Her aşamada bir skill devreye alınır, sonuç bir sonrakine input olur.

### Pattern D — Multi-perspective Review
```
Aynı PR'ı:
  - code-reviewer (bug arar)
  - senior-security (saldırı vektörü)
  - api-design-reviewer (ergonomi)
  - performance-profiler (yavaş kod)
```
4 farklı bakış açısı → birleşik rapor.

---

## 9. Kurulum Sırası (Senin İçin Önerilen)

```powershell
# 1. Marketplace ekle (zaten yaptın)
/plugin marketplace add alirezarezvani/claude-skills

# 2. Zorunlu 4 paket
/plugin install engineering-skills@claude-code-skills
/plugin install engineering-advanced-skills@claude-code-skills
/plugin install ra-qm-skills@claude-code-skills
/plugin install playwright-pro@claude-code-skills

# 3. Opsiyonel (büyürken)
/plugin install product-skills@claude-code-skills
/plugin install marketing-skills@claude-code-skills
/plugin install c-level-skills@claude-code-skills

# 4. Bireysel niş skill'ler
/plugin install self-improving-agent@claude-code-skills
/plugin install skill-security-auditor@claude-code-skills

# 5. Restart Claude Code
# 6. Yeni session'da konuşma başında "Available skills" listesinde gör
```

---

## 10. Yönetim Komutları

| Soru | Komut |
|------|-------|
| Hangi marketplace'ler ekli? | `/plugin marketplace list` |
| Hangi pluginler kurulu? | `/plugin list` |
| Bu plugin neyi içerir? | `/plugin info <plugin>@<marketplace>` |
| Kaldır | `/plugin uninstall <plugin>@<marketplace>` |
| Marketplace güncelle | `/plugin marketplace update <slug>` |

---

## 11. Skill'leri Doğal Akışına Eklemek

CLAUDE.md'de zaten "Önce plan, gerekçe ver" var. Skill'ler bunu otomatize eder:

```
Yeni feature isteği geldi
    ↓
1. brainstorming         → intent + alternatif yaklaşımlar
2. senior-architect      → mimari karar
3. senior-fullstack      → uçtan uca tasarım
4. database-designer     → şema değişikliği gerekirse
5. (kod yazılır)
6. code-reviewer         → review
7. senior-security       → güvenlik denetimi
8. playwright-pro        → E2E test
9. observability-designer→ logging hook
```

Bu zincir CLAUDE.md kuralları + skill rehberleri eşliğinde otomatik aktif olur.

---

## 12. Sık Yapılan Hatalar

| Hata | Sebep | Çözüm |
|------|-------|-------|
| Skill açılmıyor | Restart yapılmadı | Claude Code'u kapat aç |
| Slash command bulunamadı | Marketplace adı yanlış | `/plugin marketplace list` ile doğru slug |
| Skill çok yavaş | İçeriği büyük + her seferinde okunuyor | İhtiyaç bittiyse `/plugin uninstall` |
| 2 skill çakışıyor | Aynı tetikleyici kelime | Skill description'ları gözden geçir |
| Marketplace path bozuk | Reminder'da `../../../` görünüyor | Repo internal path, çalışması için install gerekli |

---

## 13. Kaynaklar

- Ana repo: https://github.com/alirezarezvani/claude-skills
- aitmpl katalog: https://www.aitmpl.com/skills
- Claude Code dokümantasyon: https://docs.claude.com/claude-code
- Plugin spec: https://docs.claude.com/claude-code/plugins

---

**Hazırlayan:** Claude
**Tarih:** 2026-06-23
**Bağlam:** Güzellik Randevu projesi için optimize edilmiş rehber
