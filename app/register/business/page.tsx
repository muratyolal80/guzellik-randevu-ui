'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Store, ShieldCheck, CheckCircle2, TrendingUp, Users, Star, Sparkles, Calculator } from 'lucide-react';
import LegalConsentModal from '@/components/common/LegalConsentModal';
import { KVKK_AYDINLATMA_METNI, TICARI_ELEKTRONIK_ILETI_ONAYI } from '@/lib/legal-texts';
import { createBrowserClient } from '@supabase/ssr';
import { validatePassword, PASSWORD_HINT_TR } from '@/lib/auth/password';

const KVKK_VERSION = 'v1.0';

export default function BusinessRegister() {
    const { signUp, loading: authLoading } = useAuth();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [kvkkAccepted, setKvkkAccepted] = useState(false);
    const [marketingAccepted, setMarketingAccepted] = useState(false);
    const [showKvkkModal, setShowKvkkModal] = useState(false);
    const [showMarketingModal, setShowMarketingModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!firstName || !lastName || !email || !password) {
            setError('Lütfen tüm alanları doldurunuz.');
            setLoading(false);
            return;
        }

        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) {
            setError(`Şifre: ${pwCheck.errors.join(', ')}.`);
            setLoading(false);
            return;
        }

        if (!kvkkAccepted) {
            setError('KVKK Aydınlatma Metni onayı zorunludur.');
            setLoading(false);
            return;
        }

        try {
            const result = await signUp(email, password, firstName, lastName, 'SALON_OWNER');

            try {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
                const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
                const supabase = createBrowserClient(supabaseUrl, supabaseKey);
                const userId = result?.user?.id;
                if (userId) {
                    const nowIso = new Date().toISOString();
                    await supabase
                        .from('profiles')
                        .update({
                            kvkk_accepted_at: nowIso,
                            kvkk_version: KVKK_VERSION,
                            marketing_opt_in: marketingAccepted,
                            marketing_opt_in_at: marketingAccepted ? nowIso : null,
                        })
                        .eq('id', userId);
                }
            } catch (consentErr) {
                console.warn('Consent metadata write failed (non-blocking):', consentErr);
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/owner/onboarding');
            }, 2000);
        } catch (err) {
            setError('Kayıt sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex-1 min-h-screen bg-gradient-to-b from-amber-50/30 via-gray-50/50 to-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
                {/* Social Proof Stripe */}
                <div className="max-w-6xl mx-auto mb-10">
                    <div className="bg-white rounded-2xl border border-amber-200 shadow-sm py-4 px-6 flex flex-wrap items-center justify-around gap-y-3 gap-x-6 text-xs font-bold text-text-main">
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kuaforara güveni</span>
                        <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> 12+ salon aramızda</span>
                        <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> 4.7/5 ortalama puan</span>
                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-600" /> KVKK + İYS uyumlu</span>
                        <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-rose-500" /> 14 gün ücretsiz</span>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Brand/Info Column */}
                    <div className="space-y-8 lg:sticky lg:top-24">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-amber-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-primary/20 font-display">
                            <Store className="w-8 h-8" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tight font-display leading-tight">
                                İşletmeni <span className="text-primary">14 günde</span><br />dijitalleştir
                            </h1>
                            <p className="text-lg text-text-secondary font-medium leading-relaxed">
                                Online randevu, akıllı personel yönetimi, müşteri analizi.
                                Ödeme bilgisi istemeden ücretsiz deneyimle başla.
                            </p>
                        </div>

                        {/* 3'lü Değer Önerisi */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { icon: TrendingUp, num: '+%32', label: 'Müşteri kazanma artışı', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                                { icon: Users, num: '500+', label: 'Aylık potansiyel ziyaretçi', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                                { icon: Sparkles, num: '14 gün', label: 'Risk yok, ücretsiz dene', color: 'bg-rose-50 text-rose-700 border-rose-200' },
                            ].map((s, i) => (
                                <div key={i} className={`${s.color} rounded-2xl border p-4`}>
                                    <s.icon className="w-5 h-5 mb-2" />
                                    <p className="text-2xl font-black">{s.num}</p>
                                    <p className="text-[11px] font-bold uppercase tracking-wider mt-1 opacity-80">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Fayda listesi */}
                        <div className="space-y-4 bg-white rounded-2xl border border-border p-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Neler kazanırsın?</h3>
                            {[
                                { title: 'Çoklu şube yönetimi', desc: 'Tüm şubelerin tek panelde.' },
                                { title: 'Akıllı personel takibi', desc: 'Mesai + performans + müsaitlik.' },
                                { title: 'AI destekli içgörü', desc: 'Yoğun saatler, sessiz günler, kampanya önerisi.' },
                                { title: 'KVKK + İYS uyumlu', desc: 'Yasal güvence + 6563 sayılı kanun uyumu.' },
                                { title: 'PayTR ile online ödeme', desc: '3D Secure abonelik + ödeme yönetimi.' },
                                { title: 'Müşteri analizi', desc: 'Sadakat, harcama, ziyaret sıklığı.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-text-main">{item.title}</p>
                                        <p className="text-xs text-text-secondary">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Karşılaştırma */}
                        <div className="bg-text-main text-white rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-300 mb-4">
                                <Sparkles className="w-4 h-4" />
                                Neden Kuaforara?
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                                <div className="opacity-60">Özellik</div>
                                <div className="text-amber-300">Kuaforara</div>
                                <div className="opacity-60">Diğerleri</div>

                                <div className="opacity-90">Komisyon</div>
                                <div className="text-emerald-400">✓ Yok</div>
                                <div className="opacity-50">%5-15</div>

                                <div className="opacity-90">Türkçe destek</div>
                                <div className="text-emerald-400">✓ 7/24</div>
                                <div className="opacity-50">Sınırlı</div>

                                <div className="opacity-90">KVKK + İYS</div>
                                <div className="text-emerald-400">✓ Yerel</div>
                                <div className="opacity-50">Eksik</div>

                                <div className="opacity-90">Demo paneli</div>
                                <div className="text-emerald-400">✓ Anında</div>
                                <div className="opacity-50">Kayıt sonrası</div>
                            </div>
                        </div>

                        {/* ROI Hesaplayıcı */}
                        <RoiCalculator />
                    </div>

                    {/* Form Column */}
                    <div className="bg-white rounded-[32px] border border-border shadow-card p-8 sm:p-10">
                        <div className="mb-8 text-center sm:text-left">
                            <h2 className="text-2xl font-black text-text-main">İşletme Hesabı Oluştur</h2>
                            <p className="text-sm font-medium text-text-secondary mt-1 italic">Profilinizi oluşturun, ardından şube kurulumuna başlayın.</p>
                        </div>

                        {success ? (
                            <div className="py-12 text-center space-y-6 animate-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto border border-green-100 shadow-inner">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-text-main">Hesabınız Hazır!</h3>
                                    <p className="text-sm font-medium text-text-secondary">Şube kurulum sihirbazına yönlendiriliyorsunuz...</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-sm">AD</label>
                                        <input className="input-field" placeholder="Adınız" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label-sm">SOYAD</label>
                                        <input className="input-field" placeholder="Soyadınız" value={lastName} onChange={e => setLastName(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="label-sm">E-POSTA</label>
                                    <input type="email" className="input-field" placeholder="isletme@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div>
                                    <label className="label-sm">ŞİFRE</label>
                                    <input type="password" className="input-field" placeholder="En az 8 karakter" value={password} onChange={e => setPassword(e.target.value)} />
                                    <p className="mt-1 text-[11px] text-text-muted px-1">{PASSWORD_HINT_TR}</p>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="flex items-start gap-2 cursor-pointer text-xs text-text-secondary leading-relaxed">
                                        <input
                                            type="checkbox"
                                            checked={kvkkAccepted}
                                            onChange={e => setKvkkAccepted(e.target.checked)}
                                            disabled={loading}
                                            className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
                                            aria-required="true"
                                        />
                                        <span>
                                            <button
                                                type="button"
                                                onClick={() => setShowKvkkModal(true)}
                                                className="text-primary font-bold hover:underline"
                                            >
                                                KVKK Aydınlatma Metni
                                            </button>
                                            'ni okudum, anladım ve kişisel verilerimin işlenmesine açık rıza veriyorum. <span className="text-red-500">*</span>
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-2 cursor-pointer text-xs text-text-secondary leading-relaxed">
                                        <input
                                            type="checkbox"
                                            checked={marketingAccepted}
                                            onChange={e => setMarketingAccepted(e.target.checked)}
                                            disabled={loading}
                                            className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
                                        />
                                        <span>
                                            <button
                                                type="button"
                                                onClick={() => setShowMarketingModal(true)}
                                                className="text-primary font-bold hover:underline"
                                            >
                                                Ticari Elektronik İleti
                                            </button>
                                            {' '}gönderilmesine onay veriyorum. Opsiyonel.
                                        </span>
                                    </label>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                                        <p className="text-red-700 text-xs font-bold leading-relaxed">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !kvkkAccepted}
                                    className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/25 hover:bg-primary-hover transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
                                >
                                    {loading ? 'HESAP OLUŞTURULUYOR...' : 'KAYIT OL VE BAŞLA'}
                                </button>
                            </form>
                        )}

                        {/* Hesap rolü açıklayıcı footer */}
                        <div className="mt-8 pt-6 border-t border-border space-y-3">
                            <div className="text-center space-y-2">
                                <p className="text-xs font-bold text-text-secondary">Zaten hesabın var mı?</p>
                                <a
                                    href="/login"
                                    className="inline-flex items-center gap-1 text-sm font-black text-primary hover:underline"
                                >
                                    Giriş Yap →
                                </a>
                                <p className="text-[10px] text-text-muted italic">
                                    Giriş sonrası rolüne göre (Müşteri / Salon Sahibi / Personel / Yönetici) otomatik panele yönlendirilirsin.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-text-muted font-bold">
                                <a href="/register" className="hover:text-primary transition flex items-center gap-1 justify-center">
                                    👤 Müşteri Olarak Kayıt Ol
                                </a>
                                <div className="text-center sm:border-x border-border text-primary">
                                    🏪 İşletme Hesabı (Bu Sayfa)
                                </div>
                                <span className="text-center opacity-60 cursor-not-allowed">
                                    💼 Personel? Sahip seni davet eder
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                <style jsx>{`
                .label-sm {
                    display: block;
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: #64748b;
                    margin-bottom: 8px;
                    padding-left: 4px;
                }
                .input-field {
                    width: 100%;
                    height: 56px;
                    padding: 0 20px;
                    border-radius: 18px;
                    border: 1.5px solid #e2e8f0;
                    background-color: #f8fafc;
                    font-weight: 600;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    color: #0f172a;
                }
                .input-field:focus {
                    background-color: white;
                    border-color: #f17290;
                    box-shadow: 0 0 0 4px rgba(241, 114, 144, 0.1);
                }
                `}</style>
            </div>

            <LegalConsentModal
                open={showKvkkModal}
                title="KVKK Aydınlatma Metni"
                content={KVKK_AYDINLATMA_METNI}
                onClose={() => setShowKvkkModal(false)}
            />
            <LegalConsentModal
                open={showMarketingModal}
                title="Ticari Elektronik İleti Onayı"
                content={TICARI_ELEKTRONIK_ILETI_ONAYI}
                onClose={() => setShowMarketingModal(false)}
            />
        </Layout>
    );
}

/**
 * ROI Hesaplayıcı — kayıt öncesi finansal değer önerisi.
 * Tek tek slider'lar üzerinden yıllık ek gelir tahmini.
 */
function RoiCalculator() {
    const [staffCount, setStaffCount] = useState(3);
    const [dailyAppointments, setDailyAppointments] = useState(15);
    const [avgPrice, setAvgPrice] = useState(150);

    // Konservatif tahmin: ek %25 müşteri (online randevu sayesinde)
    const extraDaily = Math.round(dailyAppointments * 0.25);
    const monthlyExtra = extraDaily * 26 * avgPrice; // ayda 26 iş günü
    const yearlyExtra = monthlyExtra * 12;

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-700">
                <Calculator className="w-4 h-4" />
                Tahmini Ek Gelir Hesaplayıcı
            </div>

            <div className="space-y-3">
                <div>
                    <label className="flex justify-between text-xs font-bold text-text-main mb-1">
                        <span>Personel sayısı</span>
                        <span className="text-emerald-700">{staffCount}</span>
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={20}
                        value={staffCount}
                        onChange={(e) => setStaffCount(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                    />
                </div>

                <div>
                    <label className="flex justify-between text-xs font-bold text-text-main mb-1">
                        <span>Günlük ortalama randevu</span>
                        <span className="text-emerald-700">{dailyAppointments}</span>
                    </label>
                    <input
                        type="range"
                        min={5}
                        max={80}
                        value={dailyAppointments}
                        onChange={(e) => setDailyAppointments(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                    />
                </div>

                <div>
                    <label className="flex justify-between text-xs font-bold text-text-main mb-1">
                        <span>Ortalama hizmet fiyatı (TL)</span>
                        <span className="text-emerald-700">{avgPrice}₺</span>
                    </label>
                    <input
                        type="range"
                        min={50}
                        max={1000}
                        step={10}
                        value={avgPrice}
                        onChange={(e) => setAvgPrice(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-emerald-100 space-y-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-text-muted uppercase">Aylık Ek Gelir</span>
                    <span className="text-2xl font-black text-emerald-700">
                        +{monthlyExtra.toLocaleString('tr-TR')}₺
                    </span>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-text-muted uppercase">Yıllık Tahmin</span>
                    <span className="text-3xl font-black text-emerald-800">
                        +{yearlyExtra.toLocaleString('tr-TR')}₺
                    </span>
                </div>
                <p className="text-[10px] text-text-muted italic mt-2">
                    Tahmin: aylık 26 iş günü × günlük %25 ek müşteri × ortalama fiyat.
                    Gerçek rakam pazarlama, konum ve hizmet kalitenize göre değişir.
                </p>
            </div>
        </div>
    );
}
