'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { CheckCircle2, Mail } from 'lucide-react';

type RequestType = 'access' | 'rectify' | 'delete' | 'restrict' | 'object';

const REQUEST_TYPES: { value: RequestType; label: string; description: string }[] = [
  { value: 'access', label: 'Erişim', description: 'Hangi verilerimin işlendiğini öğrenmek istiyorum' },
  { value: 'rectify', label: 'Düzeltme', description: 'Yanlış veya eksik verilerimin düzeltilmesini istiyorum' },
  { value: 'delete', label: 'Silme', description: 'Verilerimin tamamen silinmesini istiyorum' },
  { value: 'restrict', label: 'İşlemenin durdurulması', description: 'Verilerimin işlenmesini durdurmak istiyorum' },
  { value: 'object', label: 'İtiraz', description: 'Otomatik analize itiraz ediyorum' },
];

export default function VeriTalebiPage() {
  const [requestType, setRequestType] = useState<RequestType>('access');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const subject = `KVKK Veri Talebi — ${REQUEST_TYPES.find(t => t.value === requestType)?.label}`;
  const body = `Talep tipi: ${REQUEST_TYPES.find(t => t.value === requestType)?.label}\nAd Soyad: ${name}\nE-posta: ${email}\nT.C. Kimlik No: ${tcNo}\n\nAçıklama:\n${details}`;
  const mailtoHref = `mailto:kvkk@kuaforara.com.tr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-display font-black mb-2">KVKK Veri Talep Formu</h1>
        <p className="text-text-muted mb-8">
          KVKK 11. madde kapsamındaki haklarınızı kullanmak için aşağıdaki formu doldurun. Talebiniz
          en geç 30 gün içinde yanıtlanır.
        </p>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black text-emerald-900">Talebiniz hazırlandı</h3>
              <p className="text-emerald-800 text-sm mt-1">
                E-posta istemciniz açıldı. Talebinizi <strong>kvkk@kuaforara.com.tr</strong> adresine
                göndermeniz yeterlidir.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); window.location.href = mailtoHref; setSubmitted(true); }}
            className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Talep Tipi</label>
              <div className="space-y-2">
                {REQUEST_TYPES.map(t => (
                  <label key={t.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${requestType === t.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="type" value={t.value} checked={requestType === t.value} onChange={() => setRequestType(t.value)} className="mt-1 text-primary" />
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.label}</div>
                      <div className="text-xs text-gray-500">{t.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ad Soyad</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">E-posta</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">T.C. Kimlik No</label>
              <input required maxLength={11} pattern="\d{11}" value={tcNo} onChange={e => setTcNo(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
              <p className="text-xs text-gray-400 mt-1">Kimliğinizin doğrulanması için gereklidir, üçüncü kişilerle paylaşılmaz.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Açıklama</label>
              <textarea required value={details} onChange={e => setDetails(e.target.value)} rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-none" placeholder="Talebinizi detaylı olarak yazın..." />
            </div>

            <button type="submit" className="w-full bg-primary text-white py-3.5 rounded-xl font-black hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> Talebi Gönder
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
