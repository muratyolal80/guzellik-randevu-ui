# Entegrasyon: Harita (Leaflet + OpenStreetMap)

## Amaç
Salon konumunun haritada gösterimi, owner onboarding'de konum seçimi, müşterinin yakındaki salonları görmesi.

## Durum
✅ **Aktif** — react-leaflet v4 + OpenStreetMap tile, ücretsiz, key gerektirmez.

## Konfigürasyon
Yok. OSM public tile kullanır:
```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

Yüksek trafikte tile rate limit'e takılınabilir. Prod için Mapbox veya Maptiler önerilir.

## Kullanım Alanları

### 1. Salon detay
Salon kartında küçük harita pin ile konum gösterimi.

### 2. Owner onboarding
"Adres" adımında harita üzerinden tıkla-konum-seç:
- `geo_latitude`, `geo_longitude` `salons` tablosuna yazılır
- Reverse geocoding ile adres alanları otomatik doldurulabilir (`lib/geocoding/`)

### 3. Arama sonuçları
`/search` sayfasında salon kartları + harita yan yana (PRO+ feature).

## Veri Modeli
| Kolon | Açıklama |
|-------|----------|
| `salons.geo_latitude` | Latitude (decimal) |
| `salons.geo_longitude` | Longitude (decimal) |

PostGIS extension yüklü (`postgis` shared with `spatial_ref_sys`) — geo-distance sorguları yapılabilir ama henüz kodda kullanılmıyor.

## Test Adımları
1. Salon detay sayfası → harita yüklenir, pin görünür
2. Owner onboarding → "Konum Seç" → tıkla → koordinat form'a aktarılır
3. Mobil tablet: pinch-zoom çalışmalı

## Açık Aksiyon (TODO)
- 🟡 **Marker cluster** — yoğun şehirde tüm pinler üst üste; `leaflet.markercluster` eklenmeli
- 🟡 **Geo-distance arama** — PostGIS `ST_DWithin` ile "5km içindeki salonlar"
- 🟢 **Mapbox geçişi (prod)** — yüksek trafik için (ücretsiz tier 50K monthly user)
- 🟢 **Custom marker icon** — salon tipine göre farklı pin
- 🟢 **Yol tarifi** — Google Maps deeplink "Yol tarifi al" butonu
- 🟢 **Harita üzerinden arama** — drag haritayı, sonuçlar canlı güncellensin

## Bağlantılar
- Map components: [components/Map/](../../components/Map)
- Geocoding lib: [lib/geocoding/](../../lib/geocoding)
- Leaflet docs: https://leafletjs.com/
