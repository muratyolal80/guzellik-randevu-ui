import type { Metadata } from 'next';
import { Layout } from '@/components/Layout';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | Güzellik Randevu',
  description: 'Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aydınlatma metni ve veri işleme politikamız.',
  robots: { index: true, follow: true },
};

export default function KvkkPage() {
  return (
    <Layout>
      <article className="max-w-3xl mx-auto px-4 py-16 prose prose-gray prose-headings:font-display">
        <h1 className="text-3xl md:text-4xl font-black mb-2">KVKK Aydınlatma Metni</h1>
        <p className="text-text-muted text-sm">Son güncelleme: 06.05.2026</p>

        <section className="mt-8">
          <h2>1. Veri Sorumlusu</h2>
          <p>
            Güzellik Randevu (kuaforara.com.tr) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu
            (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla hareket ediyoruz.
          </p>

          <h2>2. İşlenen Kişisel Veriler</h2>
          <ul>
            <li><strong>Kimlik:</strong> Ad, soyad, T.C. kimlik no (zorunlu hizmetlerde)</li>
            <li><strong>İletişim:</strong> E-posta, cep telefonu, adres</li>
            <li><strong>İşlem:</strong> Randevu kayıtları, ödeme bilgileri, IP adresi, tarayıcı bilgileri</li>
            <li><strong>Konum:</strong> Salon araması için (sadece izin verirseniz)</li>
          </ul>

          <h2>3. İşleme Amaçları</h2>
          <ul>
            <li>Randevu oluşturma, iptal ve hatırlatma süreçleri</li>
            <li>Üyelik ve hesap yönetimi</li>
            <li>Müşteri memnuniyeti ve geri bildirim</li>
            <li>Yasal yükümlülüklerin (vergi, ticaret kanunu) yerine getirilmesi</li>
            <li>Açık rıza ile pazarlama bildirimleri (SMS, e-posta)</li>
          </ul>

          <h2>4. Aktarım</h2>
          <p>
            Kişisel verileriniz; randevu aldığınız salon işletmecisine, ödeme hizmet sağlayıcımıza
            (Iyzico), SMS sağlayıcımıza (NetGSM/İletiMerkezi) ve barındırma altyapımıza aktarılır.
            Yurt dışına aktarım yalnızca açık rızanızla yapılır.
          </p>

          <h2>5. Haklarınız</h2>
          <p>KVKK&apos;nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Düzeltme, silme veya yok edilmesini isteme</li>
            <li>İşlemenin durdurulmasını talep etme</li>
            <li>Otomatik sistemlerle yapılan analize itiraz etme</li>
            <li>Zarara uğramanız halinde tazminat talep etme</li>
          </ul>
          <p>
            Taleplerinizi <Link href="/kvkk/veri-talebi" className="text-primary font-bold">veri talep formu</Link> üzerinden
            veya <a href="mailto:kvkk@kuaforara.com.tr" className="text-primary font-bold">kvkk@kuaforara.com.tr</a> adresine
            iletebilirsiniz.
          </p>

          <h2>6. Çerez Politikası</h2>
          <p>
            Sitemiz; oturum yönetimi ve analitik için çerez kullanır. Çerez tercihlerinizi sayfanın
            altındaki banner üzerinden yönetebilirsiniz.
          </p>
        </section>
      </article>
    </Layout>
  );
}
