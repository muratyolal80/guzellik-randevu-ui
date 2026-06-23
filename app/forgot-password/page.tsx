'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !email.includes('@')) {
            setError('Geçerli bir e-posta adresi giriniz.');
            return;
        }

        setLoading(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const redirectTo =
                typeof window !== 'undefined'
                    ? `${window.location.origin}/reset-password`
                    : 'https://kuaforara.com.tr/reset-password';

            const { error: rpcError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });

            if (rpcError) {
                throw new Error(rpcError.message);
            }

            setSuccess(true);
        } catch (err: any) {
            console.error('forgot-password error:', err?.message || err);
            setError('İşlem başarısız. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex-1 flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl border border-border shadow-card p-8">
                        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6">
                            <ArrowLeft className="w-4 h-4" />
                            Girişe Dön
                        </Link>

                        <h2 className="text-2xl font-bold text-text-main mb-2">Şifremi Unuttum</h2>
                        <p className="text-text-secondary mb-8 text-sm">
                            E-posta adresinizi girin, şifrenizi sıfırlamak için bir bağlantı gönderelim.
                        </p>

                        {success ? (
                            <div className="text-center py-6 space-y-4">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="font-bold text-text-main">E-posta gönderildi!</h3>
                                <p className="text-sm text-text-secondary">
                                    <strong>{email}</strong> adresine sıfırlama bağlantısı gönderildi. Birkaç dakika içinde gelmediyse spam klasörünü kontrol edin.
                                </p>
                                <Link href="/login" className="inline-block mt-4 text-primary font-bold text-sm hover:underline">
                                    Girişe Dön
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">E-posta</label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                            autoComplete="email"
                                            placeholder="ornek@email.com"
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
                                    className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Gönderiliyor...</span>
                                        </>
                                    ) : (
                                        'Sıfırlama Bağlantısı Gönder'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
