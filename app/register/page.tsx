'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Register() {
    const { signUp, signInWithGoogle, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            setLoading(false);
            return;
        }

        try {
            await signUp(email, password, firstName, lastName);
            setSuccess(true);
            // User is automatically logged in after registration
            // Redirect to dashboard page
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
                                    placeholder="En az 6 karakter"
                                    className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50"
                                />
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

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || success}
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

                        <div className="mt-6 text-center">
                            <p className="text-sm text-text-secondary">
                                Zaten hesabınız var mı?{' '}
                                <a href="/login" className="text-primary font-bold hover:underline">
                                    Giriş Yap
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

