'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Store } from 'lucide-react';
import LegalConsentModal from '@/components/common/LegalConsentModal';
import { KVKK_AYDINLATMA_METNI, TICARI_ELEKTRONIK_ILETI_ONAYI } from '@/lib/legal-texts';
import { createBrowserClient } from '@supabase/ssr';
import { validatePassword, PASSWORD_HINT_TR } from '@/lib/auth/password';

const KVKK_VERSION = 'v1.0';

export default function Register() {
    const { signUp, signInWithGoogle, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [kvkkAccepted, setKvkkAccepted] = useState(false);
    const [marketingAccepted, setMarketingAccepted] = useState(false);
    const [showKvkkModal, setShowKvkkModal] = useState(false);
    const [showMarketingModal, setShowMarketingModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Auto-redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/');
        }
    }, [authLoading, isAuthenticated, router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setError('Lütfen tüm alanları doldurunuz.');
            setLoading(false);
            return;
        }

        if (!email.includes('@')) {
            setError('Geçerli bir e-posta adresi giriniz.');
            setLoading(false);
            return;
        }

        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) {
            setError(`Şifre: ${pwCheck.errors.join(', ')}.`);
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            setLoading(false);
            return;
        }

        if (!kvkkAccepted) {
            setError('KVKK Aydınlatma Metni onayı zorunludur.');
            setLoading(false);
            return;
        }

        try {
            const result = await signUp(email, password, firstName, lastName);

            // Persist KVKK + marketing consent metadata after signUp succeeded
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
                router.push('/customer/dashboard');
            }, 1500);
        } catch (err) {
            const errorMessage = (err as Error).message;
            // Provide user-friendly error messages
            if (errorMessage.includes('already registered')) {
                setError('Bu e-posta adresi zaten kayıtlı.');
            } else if (errorMessage.includes('Invalid email')) {
                setError('Geçersiz e-posta adresi.');
            } else {
                setError('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError(null);
        setLoading(true);
        try {
            await signInWithGoogle();
            // OAuth will redirect automatically
        } catch (err) {
            setError('Google ile kayıt olurken bir hata oluştu.');
            setLoading(false);
        }
    };

    // Show loading while checking auth state
    if (authLoading) {
        return (
            <Layout>
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-secondary">Yükleniyor...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex-1 flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl border border-border shadow-card p-8">
                        <h2 className="text-2xl font-bold text-center text-text-main mb-2">Kayıt Ol</h2>
                        <p className="text-center text-text-secondary mb-8">Randevu almak için hemen üye olun.</p>

                        {success && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-700 text-sm text-center">✓ Kayıt başarılı! Hoş geldiniz, ana sayfaya yönlendiriliyorsunuz...</p>
                            </div>
                        )}

                        <button
                            onClick={handleGoogleSignUp}
                            disabled={loading || success}
                            className="w-full h-12 flex items-center justify-center gap-3 border border-border rounded-lg hover:bg-gray-50 transition-colors font-bold text-text-main disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="size-5" />
                            Google ile Kayıt Ol
                        </button>

                        <div className="flex items-center my-6">
                            <hr className="flex-grow border-t border-border" />
                            <span className="mx-4 text-xs text-text-muted">VEYA</span>
                            <hr className="flex-grow border-t border-border" />
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Ad</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        disabled={loading || success}
                                        placeholder="Adınız"
                                        className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Soyad</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        disabled={loading || success}
                                        placeholder="Soyadınız"
                                        className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">E-posta</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={loading || success}
                                    placeholder="ornek@email.com"
                                    className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Şifre</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={loading || success}
                                    placeholder="En az 8 karakter"
                                    className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50"
                                />
                                <p className="mt-1 text-[11px] text-text-muted">{PASSWORD_HINT_TR}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Şifre Tekrar</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    disabled={loading || success}
                                    placeholder="Şifrenizi tekrar girin"
                                    className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="flex items-start gap-2 cursor-pointer text-xs text-text-secondary leading-relaxed">
                                    <input
                                        type="checkbox"
                                        checked={kvkkAccepted}
                                        onChange={e => setKvkkAccepted(e.target.checked)}
                                        disabled={loading || success}
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
                                        disabled={loading || success}
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
                                        {' '}gönderilmesine onay veriyorum (kampanya, fırsat, hatırlatma SMS/email). Opsiyonel.
                                    </span>
                                </label>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || success || !kvkkAccepted}
                                className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Kayıt olunuyor...</span>
                                    </>
                                ) : (
                                    'Kayıt Ol'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                            <p className="text-sm text-center text-text-secondary">
                                Zaten hesabınız var mı?{' '}
                                <a href="/login" className="text-primary font-bold hover:underline">
                                    Giriş Yap
                                </a>
                            </p>
                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-2xl border border-primary/20 shadow-sm group hover:border-primary/40 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                        <Store className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-text-main font-black uppercase tracking-wider">İşletme Sahibi misiniz?</p>
                                        <a href="/register/business" className="block text-[11px] font-bold text-primary mt-0.5 group-hover:underline">
                                            Hemen Şubenizi Kaydedin →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

