'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
    const { signInWithGoogle, signInWithEmail, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // UI States
    const [loginType, setLoginType] = useState<'customer' | 'business'>('customer');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Get redirect URL from query params
    const redirectUrl = searchParams.get('redirect') || '/';

    // Auto-redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push(redirectUrl);
        }
    }, [authLoading, isAuthenticated, router, redirectUrl]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Basic validation
        if (!email || !password) {
            setError('Lütfen e-posta ve şifre giriniz.');
            setLoading(false);
            return;
        }

        try {
            await signInWithEmail(email, password);
            // Success is handled by auth state change in context or useAuth
            setTimeout(() => {
                router.push(redirectUrl);
            }, 500);
        } catch (err) {
            const errorMessage = (err as Error).message;
            if (errorMessage.includes('Invalid login credentials')) {
                setError('E-posta veya şifre hatalı.');
            } else if (errorMessage.includes('Email not confirmed')) {
                setError('E-posta adresinizi doğrulamanız gerekiyor.');
            } else {
                setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            setError('Google ile giriş yapılırken bir hata oluştu.');
            setLoading(false);
        }
    };

    const fillDemoAdmin = () => {
        setEmail('info@guzellikrandevu.com.tr');
        setPassword('admin123');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex w-full bg-white font-sans">
            {/* Left Side - Image Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                <img
                    src="/images/salon-login-bg.png"
                    alt="Salon Interior"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            {/* Right Side - Form Section */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 py-12 bg-white">
                <div className="w-full max-w-md mx-auto">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF5F0] mb-4">
                            <span className="material-symbols-outlined text-[#CFA76D] filled">spa</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">Hoş Geldiniz</h2>
                        <p className="text-gray-500">Randevularınızı yönetmek için giriş yapın.</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-50 p-1 rounded-xl mb-8 border border-gray-100">
                        <button
                            onClick={() => setLoginType('customer')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${loginType === 'customer'
                                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Müşteri
                        </button>
                        <button
                            onClick={() => setLoginType('business')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${loginType === 'business'
                                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            İşletme / Uzman
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-900 ml-1">E-posta Adresi</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#CFA76D]">
                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CFA76D]/20 focus:border-[#CFA76D] transition-all sm:text-sm font-medium"
                                    placeholder={loginType === 'customer' ? "ornek@email.com" : "isletme@guzellik.com"}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-900 ml-1">Şifre</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#CFA76D]">
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CFA76D]/20 focus:border-[#CFA76D] transition-all sm:text-sm font-medium"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-[#CFA76D] checked:bg-[#CFA76D] hover:border-[#CFA76D]" />
                                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </div>
                                <span className="text-sm text-gray-500 group-hover:text-gray-700 select-none">Beni hatırla</span>
                            </label>

                            <Link href="/forgot-password" className="text-sm font-bold text-[#CFA76D] hover:text-[#b08d55] transition-colors">
                                Şifremi unuttum?
                            </Link>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-600 text-sm">error</span>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#CFA76D] text-white font-bold rounded-xl hover:bg-[#b08d55] transition-all shadow-lg shadow-[#CFA76D]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </form>

                    {/* Admin Demo Filler */}
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={fillDemoAdmin}
                            className="text-xs text-gray-400 hover:text-[#CFA76D] flex items-center justify-center gap-1 mx-auto transition-colors"
                        >
                            <span className="material-symbols-outlined text-[14px]">smart_button</span>
                            Demo Admin Doldur
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-wider">
                            <span className="px-4 bg-white text-gray-400 font-medium">Veya devam et</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 h-11 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            <span className="text-sm font-bold text-gray-700">Google</span>
                        </button>
                        <button
                            disabled={loading} // TODO: Implement Apple Login
                            className="flex items-center justify-center gap-2 h-11 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.29-1.23 3.57-1.23.6 0 2.72.16 3.84 1.47-3.54 1.68-2.6 6.46 1.05 7.9-.62 1.63-1.6 3.19-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            <span className="text-sm font-bold text-gray-700">Apple</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-600">
                            Hesabınız yok mu?{' '}
                            <Link href="/register" className="text-[#CFA76D] font-bold hover:text-[#b08d55] transition-colors ml-1">
                                Hemen Kayıt Olun
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Styles for Checkbox */}
            <style jsx>{`
                /* Add any custom inline styles or tailwind extensions if needed */
            `}</style>
        </div>
    );
}
