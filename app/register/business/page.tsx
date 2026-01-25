'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Store, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function BusinessRegister() {
    const { signUp, loading: authLoading } = useAuth();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

        try {
            // Register with SALON_OWNER role
            await signUp(email, password, firstName, lastName, 'SALON_OWNER');
            setSuccess(true);

            // Redirect to onboarding
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
            <div className="flex-1 min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Brand/Info Column */}
                    <div className="space-y-8">
                        <div className="w-16 h-16 bg-primary rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-primary/20 font-display">
                            <Store className="w-8 h-8" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black text-text-main tracking-tight font-display">İşletmenizi Dijitale Taşıyın</h1>
                            <p className="text-lg text-text-secondary font-medium leading-relaxed">Güzellik merkeziniz için profesyonel randevu, personel ve şube yönetim sistemine hemen katılın.</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: 'Multi-Branch Yönetimi', desc: 'Tüm şubelerinizi tek bir panelden kontrol edin.', icon: CheckCircle2 },
                                { title: 'Personel Takibi', desc: 'Çalışma saatleri ve performans raporları.', icon: CheckCircle2 },
                                { title: 'Güvenli Altyapı', desc: 'Verileriniz ve randevularınız her zaman koruma altında.', icon: ShieldCheck }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1"><item.icon className="w-5 h-5 text-primary" /></div>
                                    <div>
                                        <p className="font-bold text-text-main">{item.title}</p>
                                        <p className="text-sm text-text-secondary mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                    <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                                        <p className="text-red-700 text-xs font-bold leading-relaxed">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/25 hover:bg-primary-hover transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
                                >
                                    {loading ? 'HESAP OLUŞTURULUYOR...' : 'KAYIT OL VE BAŞLA'}
                                </button>

                                <p className="text-[10px] text-center text-text-muted px-4 leading-relaxed font-bold uppercase tracking-wider">
                                    KAYIT OLARAK KULLANIM KOŞULLARI VE GİZLİLİK POLİTİKASINI KABUL ETMİŞ SAYILIRSINIZ.
                                </p>
                            </form>
                        )}
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
        </Layout>
    );
}
