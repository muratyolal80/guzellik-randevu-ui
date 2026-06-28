import { Metadata } from 'next';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { JsonLd, organizationSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { Quote, TrendingUp, Users, Calendar, Star, ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = buildPageMetadata({
    title: 'Salon Başarı Hikayeleri',
    description:
        'Kuaforara ile dijitalleşen güzellik salonlarının deneyimleri. Online randevu, müşteri analizi ve gelir artış örnekleri.',
    keywords: ['başarı hikayesi', 'salon dijitalleşme', 'kuaför yönetim', 'online randevu'],
    path: '/business/success-stories',
});

const STORIES = [
    {
        salonName: 'Stil Kuaför',
        owner: 'Murat Y.',
        city: 'Ankara',
        category: 'Kuaför',
        quote:
            'Kuaforara öncesi günde 12 randevu alıyordum. Online sisteme geçtikten sonra ortalama 18’e çıktı. Telefon almakla geçen zamandan kurtuldum.',
        before: { label: 'Aylık Randevu', value: 312 },
        after: { label: 'Aylık Randevu', value: 468, change: '+50%' },
        metrics: [
            { icon: Calendar, label: 'Online randevu', value: '%68' },
            { icon: Users, label: 'Yeni müşteri', value: '+82' },
            { icon: Star, label: 'Müşteri puanı', value: '4.8/5' },
        ],
        color: 'from-blue-500 to-indigo-600',
    },
    {
        salonName: 'Başkent Berber',
        owner: 'Erkan T.',
        city: 'Ankara',
        category: 'Berber',
        quote:
            'Personel mesai çakışmaları sürekli problemdi. Akıllı takvim ile artık kimsenin yanlış saate randevusu olmuyor. Personel performans raporları satışı %25 artırdı.',
        before: { label: 'No-show oranı', value: '%18' },
        after: { label: 'No-show oranı', value: '%4', change: '-77%' },
        metrics: [
            { icon: Calendar, label: 'Doluluk', value: '%87' },
            { icon: Users, label: 'Sadık müşteri', value: '+34' },
            { icon: TrendingUp, label: 'Aylık ciro', value: '+%25' },
        ],
        color: 'from-emerald-500 to-teal-600',
    },
    {
        salonName: 'Güzellik Merkezi Luna',
        owner: 'Selin A.',
        city: 'İstanbul',
        category: 'Güzellik Merkezi',
        quote:
            'KVKK uyumu en büyük endişemdi. Müşteri verisi nasıl koruyacağımı bilmiyordum. Kuaforara sayesinde yasal yönü tamamen sistem hallediyor.',
        before: { label: 'KVKK uyum durumu', value: 'Eksik' },
        after: { label: 'KVKK uyum durumu', value: 'Tam', change: '✓' },
        metrics: [
            { icon: Users, label: 'Müşteri sayısı', value: '+156' },
            { icon: Star, label: 'Yorum sayısı', value: '+47' },
            { icon: Calendar, label: 'AI öneri', value: '12/hafta' },
        ],
        color: 'from-rose-500 to-pink-600',
    },
];

export default function SuccessStoriesPage() {
    return (
        <Layout>
            <JsonLd data={organizationSchema()} />

            <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-gray-50 to-white py-16 px-4">
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Hero */}
                    <div className="text-center space-y-5 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest">
                            <Sparkles className="w-4 h-4" />
                            Başarı Hikayeleri
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-text-main font-display tracking-tight">
                            Dijitalleşmenin{' '}
                            <span className="text-primary">gerçek hikayeleri</span>
                        </h1>
                        <p className="text-lg text-text-secondary font-medium leading-relaxed">
                            Kuaforara ile randevu, personel ve müşteri yönetimini dijitale taşıyan
                            işletmelerin somut sonuçları. Senin için de mümkün.
                        </p>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { num: '12+', label: 'aktif salon' },
                            { num: '4.7/5', label: 'ortalama puan' },
                            { num: '+%32', label: 'müşteri artışı' },
                            { num: '14 gün', label: 'ücretsiz deneyim' },
                        ].map((s, i) => (
                            <div
                                key={i}
                                className="bg-white border border-border rounded-2xl p-5 text-center shadow-sm"
                            >
                                <p className="text-3xl font-black text-primary">{s.num}</p>
                                <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-1">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Stories */}
                    <div className="space-y-8">
                        {STORIES.map((s, i) => (
                            <article
                                key={i}
                                className="bg-white border border-border rounded-3xl overflow-hidden shadow-card grid grid-cols-1 lg:grid-cols-3 gap-0"
                            >
                                <div className={`bg-gradient-to-br ${s.color} p-8 text-white space-y-4`}>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                            {s.category} · {s.city}
                                        </p>
                                        <h2 className="text-2xl font-black font-display mt-1">{s.salonName}</h2>
                                        <p className="text-sm font-bold opacity-90 mt-0.5">{s.owner}</p>
                                    </div>

                                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                            Önce
                                        </p>
                                        <p className="text-xl font-black">{s.before.value}</p>
                                        <p className="text-[10px] font-bold opacity-80">{s.before.label}</p>
                                    </div>

                                    <div className="bg-white text-text-main rounded-2xl p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                            Sonra
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-black text-emerald-700">
                                                {s.after.value}
                                            </p>
                                            <span className="text-xs font-black text-emerald-600">
                                                {s.after.change}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-text-muted">{s.after.label}</p>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 p-8 space-y-6">
                                    <Quote className="w-8 h-8 text-primary/30" />
                                    <blockquote className="text-lg md:text-xl text-text-main leading-relaxed font-medium">
                                        "{s.quote}"
                                    </blockquote>

                                    <div className="grid grid-cols-3 gap-3">
                                        {s.metrics.map((m, j) => (
                                            <div
                                                key={j}
                                                className="bg-gray-50 rounded-2xl p-4 border border-border"
                                            >
                                                <m.icon className="w-4 h-4 text-text-muted mb-1" />
                                                <p className="text-lg font-black text-text-main">{m.value}</p>
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                    {m.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="bg-gradient-to-br from-primary via-amber-600 to-orange-600 rounded-3xl p-10 text-center text-white shadow-xl">
                        <h3 className="text-3xl md:text-4xl font-black font-display tracking-tight">
                            Sıradaki başarı hikayesi seninki olabilir
                        </h3>
                        <p className="text-base font-medium opacity-95 mt-3 max-w-xl mx-auto">
                            14 gün ücretsiz dene, sonuçları gör. Ödeme bilgisi istemiyoruz.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                            <Link
                                href="/register/business"
                                className="inline-flex items-center justify-center gap-2 bg-white text-orange-700 font-black text-sm rounded-2xl px-6 py-3 shadow-lg hover:scale-105 transition"
                            >
                                İşletmeni Ekle <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white border border-white/40 font-bold text-sm rounded-2xl px-6 py-3"
                            >
                                Anasayfaya Dön
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
