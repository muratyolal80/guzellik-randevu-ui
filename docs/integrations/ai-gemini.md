# Entegrasyon: Google Gemini AI

## Amaç
Owner dashboard'da AI öneriler (gelir trendleri, doluluk analizi) ve müşteri tarafı chatbot.

## Durum
✅ **Aktif** — `@google/genai` SDK ile entegre, env key gerekli.

## Konfigürasyon

`.env`:
```bash
GOOGLE_GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.0-flash-exp   # veya gemini-1.5-pro
```

API key alma: https://aistudio.google.com/app/apikey (free tier mevcut)

## Kullanım Alanları

### 1. Owner AI Insights
**Endpoint:** `/api/owner/ai-insights`
**Tetikleyici:** Owner dashboard yüklenince
**İçerik:**
- Son 30 günlük randevu istatistiği
- En iyi/zayıf personel performansı
- Doluluk oranı analizi
- Gelir trendi
- Aksiyon önerileri (örn. "Cuma akşamları %85 dolu, fiyat artırabilirsin")

### 2. Müşteri Chatbot (GeminiChat)
**Component:** `<GeminiChat>`
**Konum:** Booking flow sayfalarında köşede
**İçerik:**
- "Hangi hizmet bana uygun?"
- "Saç boyamak ne kadar sürer?"
- Salon-spesifik bilgi RAG'i değil, genel beauty bilgisi

## Test Adımları

1. **API key:** `.env`'e ekle, server restart
2. **Owner insights:** SALON_OWNER login → `/owner/dashboard` → "AI Önerileri" kartı yüklenmeli
3. **Chatbot:** Booking sayfasında sağ-alt sohbet ikonu → soru sor → cevap

## Açık Aksiyon (TODO)
- 🟡 **Rate limit** — Gemini free tier 60 req/dk, prod için paid tier gerekli
- 🟡 **Token maliyet izleme** — `audit_logs`'a AI token usage kaydı yok
- 🟡 **Türkçe prompt iyileştirme** — şu an karma TR/EN, tutarlı TR sistem prompt'u eklenebilir
- 🟢 **Salon-spesifik chatbot** — RAG ile salon hizmetlerini bilen chatbot
- 🟢 **Personel öneri sistemi** — "Bu hizmet için en iyi personel" AI önerisi
- 🟢 **Otomatik yorum özeti** — 100+ yorum olan salon için AI özet
- 🟢 **Salon SEO açıklama üreteci** — boş `salons.description` için AI ile öneri

## Bağlantılar
- AI API: [app/api/owner/ai-insights/route.ts](../../app/api/owner/ai-insights/route.ts)
- Chat component: [components/GeminiChat](../../components/GeminiChat.tsx)
- SDK doc: https://ai.google.dev/gemini-api/docs
