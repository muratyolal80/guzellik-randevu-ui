'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { validatePassword, PASSWORD_HINT_TR } from '@/lib/auth/password';

export default function ResetPassword() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        // Supabase magic link tıklanınca hash'te access_token gelir → auth otomatik set olur
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                setSessionReady(true);
            } else {
                setError('Geçersiz veya süresi dolmuş bağlantı. Lütfen yeni bir sıfırlama bağlantısı isteyin.');
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const check = validatePassword(password);
        if (!check.valid) {
            setError(`Şifre: ${check.errors.join(', ')}.`);
            return;
        }

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        setLoading(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw new Error(updateError.message);

            setSuccess(true);
            setTimeout(() => router.push('/login'), 2500);
        } catch (err: any) {
            console.error('reset-password error:', err?.message || err);
            setError('Şifre güncellenemedi. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex-1 flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl border border-border shadow-card p-8">
                        <h2 className="text-2xl font-bold text-text-main mb-2">Yeni Şifre Belirle</h2>
                        <p className="text-text-secondary mb-8 text-sm">
                            Yeni şifrenizi belirleyin. {PASSWORD_HINT_TR}
                        </p>

                        {success ? (
                            <div className="text-center py-6 space-y-4">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="font-bold text-text-main">Şifreniz güncellendi!</h3>
                                <p className="text-sm text-text-secondary">Giriş sayfasına yönlendiriliyorsunuz...</p>
                            </div>
                        ) : !sessionReady && error ? (
                            <div className="text-center py-6 space-y-4">
                                <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>
                                <Link href="/forgot-password" className="inline-block text-primary font-bold text-sm hover:underline">
                                    Yeni Bağlantı İste
                                </Link>
                            </div>
                        ) : sessionReady ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Yeni Şifre</label>
                                    <div className="relative">
                                        <Lock className="w-5 h-5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            autoComplete="new-password"
                                            placeholder="En az 8 karakter"
                                            className="w-full h-12 pl-11 pr-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Şifre Tekrar</label>
                                    <div className="relative">
                                        <Lock className="w-5 h-5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                            autoComplete="new-password"
                                            placeholder="Şifrenizi tekrar girin"
                                            className="w-full h-12 pl-11 pr-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                                <p className="text-sm text-text-muted mt-4">Bağlantı doğrulanıyor...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
