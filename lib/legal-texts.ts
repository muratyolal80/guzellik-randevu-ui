/**
 * Yasal metinler — KVKK Aydınlatma Metni ve Ticari Elektronik İleti (TEİ) Onayı.
 *
 * Bu metinler `Güzellik Randevu` (kuaforara.com.tr) için 6698 sayılı
 * Kişisel Verilerin Korunması Kanunu (KVKK), 6563 sayılı Elektronik
 * Ticaretin Düzenlenmesi Hakkında Kanun ve İYS (İleti Yönetim Sistemi)
 * mevzuatına uygun şekilde hazırlanmıştır.
 *
 * SON GÜNCELLEME: 2026-05-07
 */

export const PLATFORM_NAME = 'Güzellik Randevu';
export const PLATFORM_DOMAIN = 'kuaforara.com.tr';
export const PLATFORM_EMAIL = 'kvkk@kuaforara.com.tr';

export const KVKK_AYDINLATMA_METNI = `
# Kişisel Verilerin Korunması Aydınlatma Metni

**Veri Sorumlusu:** ${PLATFORM_NAME} (${PLATFORM_DOMAIN})
**Yürürlük Tarihi:** 7 Mayıs 2026

---

## 1. Genel Bilgilendirme

6698 sayılı **Kişisel Verilerin Korunması Kanunu** ("KVKK") uyarınca, ${PLATFORM_NAME} platformunu ("Platform", "Biz") kullanan tüm kullanıcılarımıza ait kişisel veriler **veri sorumlusu** sıfatıyla tarafımızca işlenmektedir. Bu Aydınlatma Metni, Platform üzerinden randevu alan müşterileri, salon sahiplerini, çalışanlarını ve ziyaretçileri kapsamaktadır.

## 2. İşlenen Kişisel Veri Kategorileri

Platform kapsamında aşağıdaki kişisel verileriniz işlenmektedir:

| Kategori | Veri |
|----------|------|
| **Kimlik** | Ad, soyad, T.C. kimlik numarası (sadece personel için), doğum tarihi |
| **İletişim** | Cep telefonu, e-posta adresi, açık adres |
| **Müşteri İşlem** | Randevu geçmişi, tercih edilen hizmetler, salon ve personel tercihleri |
| **Finansal** | Ödeme yöntemi, fatura bilgisi, iyzico üzerinden geçen ödeme referansları |
| **Konum** | Yaklaşık coğrafi konum (salon arama için, opsiyonel) |
| **İşlem Güvenliği** | IP adresi, cihaz bilgisi, tarayıcı log kaydı, oturum bilgisi |
| **Pazarlama** | Açık rıza halinde alışkanlık ve tercih analizi |
| **Görsel** | Profil fotoğrafı, salon ve hizmet görselleri (yüklediğinizde) |

## 3. Kişisel Verilerinizin İşlenme Amaçları

Verileriniz aşağıdaki amaçlarla, KVKK madde 5 ve madde 6'da öngörülen hukuki sebepler dahilinde işlenmektedir:

1. **Üyelik ve hesap işlemlerinin yürütülmesi** — kayıt, giriş, telefon doğrulama, KVKK onay kayıtları
2. **Randevu hizmetinin sunulması** — hizmet eşleştirme, personel ataması, takvim yönetimi
3. **Ödeme ve faturalandırma** — kapora tahsili, abonelik ödemesi, iade işlemleri
4. **Müşteri ilişkileri yönetimi** — destek talepleri, şikayet ve memnuniyet ölçümü
5. **Hatırlatma ve bilgilendirme** — randevu öncesi SMS / e-posta bildirimleri
6. **Pazarlama** — açık rızanız varsa kampanya, indirim ve sadakat programı duyuruları
7. **Hukuki yükümlülüklerin yerine getirilmesi** — vergi, fatura, denetim
8. **Bilgi güvenliği** — dolandırıcılık önleme, yetkisiz erişim tespiti
9. **Platform geliştirme** — anonim/agrega verilerle ürün analitiği

## 4. Verilerin Aktarılabileceği Taraflar

Kişisel verileriniz, KVKK madde 8 ve 9 hükümleri çerçevesinde aşağıdaki **iş ortaklarımızla** paylaşılabilir:

- **Randevu aldığınız salon işletmesi** — sadece randevu için gerekli bilgiler (ad, telefon, randevu detayı)
- **Ödeme hizmet sağlayıcısı** — Iyzico Ödeme Hizmetleri A.Ş.
- **SMS hizmet sağlayıcısı** — NetGSM İletişim ve Bilgi Teknolojileri A.Ş.
- **Bulut altyapı sağlayıcısı** — Supabase (verileri AB/Türkiye sunucularda barındırır)
- **Hukuki yetkili merciler** — yasal yükümlülük halinde (mahkeme, savcılık, vergi)

**Önemli:** Verileriniz pazarlama amacıyla **üçüncü kişilere satılmaz**. Yurtdışı aktarım yalnızca KVKK Kurulu izni olan ülkelere yapılır.

## 5. Verilerin Toplanma Yöntemi

Verileriniz; web sitesi formları, mobil cihaz, çağrı merkezi, Iyzico ödeme entegrasyonu, salon işletmecisinin manuel girişi ve API entegrasyonları aracılığıyla **elektronik ortamda** toplanmaktadır.

## 6. Saklama Süresi

| Veri | Süre |
|------|------|
| Hesap bilgisi (aktif kullanıcı) | Üyelik aktif olduğu sürece |
| Hesap silme talebi sonrası | 30 gün geri alma penceresi + yasal saklama |
| Randevu geçmişi | 10 yıl (Vergi Usul Kanunu) |
| Ödeme bilgisi (referans) | 10 yıl (Vergi Usul Kanunu) |
| SMS doğrulama kaydı | 3 yıl (İYS mevzuatı) |
| Pazarlama izni kaydı | İzin geri alınana kadar + 3 yıl |
| Log kayıtları | 2 yıl |

## 7. KVKK Madde 11 Kapsamındaki Haklarınız

Veri sahibi olarak aşağıdaki haklara sahipsiniz:

a) Kişisel verilerinizin işlenip işlenmediğini öğrenme
b) İşlenmişse buna ilişkin bilgi talep etme
c) İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
d) Yurt içinde veya yurt dışında aktarıldığı 3. kişileri bilme
e) Eksik veya yanlış işlenmişse düzeltilmesini isteme
f) KVKK m.7'de öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme
g) Düzeltme/silme/yok etme işlemlerinin aktarıldığı 3. kişilere bildirilmesini isteme
h) Otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme
i) Kanuna aykırı işleme nedeniyle zarara uğramışsanız zararın giderilmesini talep etme

**Başvuru:** Bu haklarınızı kullanmak için **${PLATFORM_EMAIL}** adresine yazılı başvuru yapabilirsiniz. Talebiniz **en geç 30 gün** içinde ücretsiz olarak sonuçlandırılır.

## 8. Çerez Politikası

Platform üzerinde oturum yönetimi ve analitik için zorunlu ve isteğe bağlı çerezler kullanılmaktadır. Detaylı bilgi için **Çerez Politikası** sayfasını ziyaret edebilirsiniz.

## 9. Güvenlik Tedbirleri

Verilerinizin güvenliği için TLS şifreleme, satır seviyesi yetkilendirme (RLS), şifrelenmiş veritabanı yedekleri, iki faktörlü kimlik doğrulama (admin paneli) ve düzenli sızma testleri uygulanmaktadır.

---

İşbu Aydınlatma Metni, mevzuat değişikliği veya platform geliştirmeleri kapsamında güncellenebilir. Güncel sürüm her zaman **${PLATFORM_DOMAIN}/kvkk** adresinde bulunur. Önemli değişikliklerde e-posta veya uygulama içi bildirim ile sizi bilgilendiririz.
`.trim();

export const TICARI_ELEKTRONIK_ILETI_ONAYI = `
# Ticari Elektronik İleti (Pazarlama) Onayı

**Veri Sorumlusu:** ${PLATFORM_NAME} (${PLATFORM_DOMAIN})
**Yürürlük Tarihi:** 7 Mayıs 2026

---

## 1. Onayın Kapsamı

6563 sayılı **Elektronik Ticaretin Düzenlenmesi Hakkında Kanun** ve Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik uyarınca, **${PLATFORM_NAME}** tarafından sunulan hizmetler kapsamında size aşağıdaki kanallar üzerinden **ticari elektronik ileti (TEİ)** gönderilebilmesi için açık rızanız talep edilmektedir.

## 2. İletişim Kanalları

Onayınız aşağıdaki kanalları kapsar:

- **SMS** — Cep telefonunuza kısa mesaj
- **E-posta** — Kayıtlı elektronik posta adresinize
- **Uygulama İçi Bildirim (Push)** — mobil/web bildirim
- **Otomatik Aramalı Mesaj (IVR)** — sınırlı durumlarda

## 3. Gönderim Konuları

Onay vermeniz halinde size aşağıdaki konularda ileti gönderilebilir:

✓ **Kampanya ve indirim** — özel hizmet fiyatları, kuponlar
✓ **Yeni hizmet ve özellik duyuruları** — platform güncellemeleri
✓ **Sadakat programı** — puan, hediye çeki, doğum günü kampanyası
✓ **Salon önerileri** — ilgi ve konum bazlı öneriler
✓ **Etkinlik duyuruları** — workshop, açılış, sektörel haber
✓ **Anket ve geri bildirim** — memnuniyet ölçümü

**ÖNEMLİ — Onay Gerektirmeyen Bildirimler:**
Bu onaydan **bağımsız olarak** aşağıdaki **işlemsel bildirimler** size her durumda gönderilir (kanunen):
- Randevu hatırlatma SMS / e-posta
- Randevu iptal/değişiklik bilgilendirmesi
- Ödeme makbuzları ve fatura
- Hesap güvenliği uyarıları
- Hizmet kullanımı sırasındaki sistemsel bildirimler

## 4. Veri Aktarımı

Ticari ileti gönderimi için iletişim bilgileriniz aşağıdaki iş ortaklarına aktarılabilir:

- **NetGSM** — SMS hizmet sağlayıcısı
- **İYS (İleti Yönetim Sistemi)** — TEİ izinlerinin merkezi kaydı için T.C. Ticaret Bakanlığı altında çalışan kayıt sistemi (https://iys.org.tr)

## 5. Sıklık ve Sınırlama

İleti sıklığı pazarlama planımıza göre ortalama **haftada 1-2 SMS / 2-3 e-posta** olarak tutulur. Önemli kampanyalar dışında saat 09:00–21:00 dışı SMS gönderimi yapılmaz (yönetmelik gereği).

## 6. Onayı Geri Çekme Hakkı

Bu onayı **dilediğiniz an** ücretsiz olarak geri çekebilirsiniz. Geri çekme yöntemleri:

a) **Hesap ayarları** → "Bildirim Tercihleri" → "Pazarlama izni" toggle kapatılır
b) **SMS ile RED** — gelen SMS'in sonundaki "RED" anahtar kelimesini ücretsiz numaraya gönderme
c) **E-posta'da abonelikten çıkma (unsubscribe)** linki
d) **${PLATFORM_EMAIL}** adresine yazılı talep
e) **İYS portalı** üzerinden tek tıkla red (https://iys.org.tr)

İzni geri çektiğinizde **işlemsel bildirimler** (randevu hatırlatma vb.) almaya devam edersiniz.

## 7. KVKK ile İlişki

Bu onay, KVKK Aydınlatma Metni'ndeki **pazarlama amaçlı işleme** için açık rıza niteliğindedir. Onay vermemeniz veya geri çekmeniz halinde, **temel hizmetlerden yararlanma hakkınız etkilenmez**.

---

İşbu metni okudum, anladım ve **${PLATFORM_NAME}** tarafından yukarıda belirtilen kapsamda ticari elektronik ileti gönderilmesine açık rızamı veriyorum.
`.trim();
