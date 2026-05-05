'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StaffService } from '@/services/db';
import Link from 'next/link';
import {
    CheckCircle2,
    XCircle,
    UserPlus,
    Mail,
    Loader2,
    LogIn,
    ArrowRight,
    ShieldCheck,
    Store,
} from 'lucide-react';

type InviteState =
    | 'LOADING'
    | 'NOT_FOUND'
    | 'EXPIRED'
    | 'ALREADY_ACCEPTED'
    | 'EMAIL_MISMATCH'
    | 'READY'
    | 'ACCEPTING'
    | 'SUCCESS'
    | 'ERROR'
    | 'NOT_AUTHENTICATED';

function InviteAcceptContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const token = searchParams.get('token');

    const [state, setState] = useState<InviteState>('LOADING');
    const [inviteData, setInviteData] = useState<{
        email: string;
        salonName: string;
        role: string;
        status: string;
    } | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            setState('NOT_FOUND');
            return;
        }
        checkInvite();
    }, [token, authLoading, isAuthenticated]);

    const checkInvite = async () => {
        try {
            setState('LOADING');
            const invite = await StaffService.getInviteByToken(token!);

            if (!invite) {
                setState('NOT_FOUND');
                return;
            }

            const salonName = (invite as any).salon?.name || 'Bilinmeyen Salon';

            setInviteData({
                email: invite.email,
                salonName: salonName,
                role: invite.role,
                status: invite.status,
            });

            if (invite.status === 'ACCEPTED') {
                setState('ALREADY_ACCEPTED');
                return;
            }

            if (invite.status === 'EXPIRED' || invite.status === 'CANCELLED') {
                setState('EXPIRED');
                return;
            }

            if (!isAuthenticated) {
                setState('NOT_AUTHENTICATED');
                return;
            }

            // Check email match
            if (user?.email?.toLowerCase() !== invite.email.toLowerCase()) {
                setState('EMAIL_MISMATCH');
                return;
            }

            setState('READY');
        } catch (err) {
            console.error('Davet kontrol hatası:', err);
            setState('ERROR');
            setErrorMessage('Davet bilgileri kontrol edilirken bir hata oluştu.');
        }
    };

    const handleAccept = async () => {
        try {
            setState('ACCEPTING');
            await StaffService.acceptStaffInvite(token!);
            setState('SUCCESS');
            // Redirect to staff dashboard after a short delay
            setTimeout(() => {
                router.push('/staff/dashboard');
            }, 3000);
        } catch (err: unknown) {
            console.error('Davet kabul hatası:', err);
            setState('ERROR');
            const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
            if (msg.includes('different email')) {
                setState('EMAIL_MISMATCH');
            } else if (msg.includes('no longer pending')) {
                setState('EXPIRED');
            } else {
                setErrorMessage(msg);
            }
        }
    };

    const handleLogin = () => {
        const redirectUrl = `/invite/accept?token=${token}`;
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    };

    const handleRegister = () => {
        const redirectUrl = `/invite/accept?token=${token}`;
        router.push(`/register?redirect=${encodeURIComponent(redirectUrl)}`);
    };

    // --- Render States ---

    if (state === 'LOADING') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center animate-pulse">
                    <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                    <p className="text-lg font-black text-text-main">Davet kontrol ediliyor...</p>
                    <p className="text-sm text-text-muted font-bold mt-2">Lütfen bekleyin</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary/5 p-4">
            <div className="w-full max-w-lg">
                {/* Card */}
                <div className="bg-white rounded-[40px] shadow-2xl border border-border overflow-hidden animate-in zoom-in duration-500">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-10 py-10 text-center border-b border-border">
                        <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-lg ${
                            state === 'SUCCESS' ? 'bg-green-500 text-white' :
                            state === 'ERROR' || state === 'NOT_FOUND' || state === 'EXPIRED' || state === 'ALREADY_ACCEPTED' ? 'bg-red-50 text-red-500' :
                            state === 'EMAIL_MISMATCH' ? 'bg-amber-50 text-amber-500' :
                            'bg-primary text-white'
                        }`}>
                            {state === 'SUCCESS' ? <CheckCircle2 className="w-12 h-12" /> :
                             state === 'ERROR' || state === 'NOT_FOUND' ? <XCircle className="w-12 h-12" /> :
                             state === 'EXPIRED' || state === 'ALREADY_ACCEPTED' ? <XCircle className="w-12 h-12" /> :
                             state === 'EMAIL_MISMATCH' ? <Mail className="w-12 h-12" /> :
                             state === 'NOT_AUTHENTICATED' ? <LogIn className="w-12 h-12" /> :
                             <UserPlus className="w-12 h-12" />}
                        </div>

                        <h1 className="text-2xl font-black text-text-main tracking-tight">
                            {state === 'SUCCESS' ? 'Hoş Geldiniz!' :
                             state === 'NOT_FOUND' ? 'Davet Bulunamadı' :
                             state === 'EXPIRED' ? 'Davet Süresi Doldu' :
                             state === 'ALREADY_ACCEPTED' ? 'Davet Zaten Kabul Edildi' :
                             state === 'EMAIL_MISMATCH' ? 'E-Posta Uyuşmazlığı' :
                             state === 'ERROR' ? 'Bir Hata Oluştu' :
                             state === 'NOT_AUTHENTICATED' ? 'Giriş Yapmanız Gerekiyor' :
                             'Personel Daveti'}
                        </h1>
                    </div>

                    {/* Body */}
                    <div className="px-10 py-10 space-y-8">
                        {/* READY STATE */}
                        {state === 'READY' && inviteData && (
                            <>
                                <div className="bg-surface-alt rounded-[24px] p-6 border border-border space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                                            <Store className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Salon</p>
                                            <p className="text-lg font-black text-text-main">{inviteData.salonName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Rol</p>
                                            <p className="text-lg font-black text-text-main">Personel (Staff)</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm font-bold text-text-muted text-center leading-relaxed">
                                    <strong className="text-text-main">{inviteData.salonName}</strong> sizi çalışan olarak eklemek istiyor.
                                    Kabul ederseniz, salon randevu takvimine erişim sağlayabilirsiniz.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleAccept}
                                        className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle2 className="w-6 h-6" />
                                        Daveti Kabul Et
                                    </button>
                                    <Link
                                        href="/"
                                        className="w-full py-4 text-center text-text-muted font-black hover:text-text-main transition-colors"
                                    >
                                        Reddet ve Ana Sayfaya Dön
                                    </Link>
                                </div>
                            </>
                        )}

                        {/* ACCEPTING STATE */}
                        {state === 'ACCEPTING' && (
                            <div className="text-center py-8">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
                                <p className="text-lg font-black text-text-main">Davet kabul ediliyor...</p>
                                <p className="text-sm text-text-muted font-bold mt-2">Hesabınız güncelleniyor</p>
                            </div>
                        )}

                        {/* SUCCESS STATE */}
                        {state === 'SUCCESS' && inviteData && (
                            <div className="text-center py-4 space-y-6">
                                <div className="bg-green-50 rounded-[24px] p-6 border border-green-100">
                                    <p className="text-green-800 font-black text-lg">🎉 Tebrikler!</p>
                                    <p className="text-green-700 font-bold text-sm mt-2">
                                        <strong>{inviteData.salonName}</strong> ekibine başarıyla katıldınız.
                                    </p>
                                </div>
                                <p className="text-sm text-text-muted font-bold">
                                    Personel panelinize yönlendiriliyorsunuz...
                                </p>
                                <Link
                                    href="/staff/dashboard"
                                    className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-[24px] font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                >
                                    Panelime Git <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        )}

                        {/* NOT AUTHENTICATED */}
                        {state === 'NOT_AUTHENTICATED' && inviteData && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-[24px] p-6 border border-blue-100">
                                    <p className="text-blue-900 font-black">Giriş Gerekli</p>
                                    <p className="text-blue-700 text-sm font-bold mt-2">
                                        <strong>{inviteData.salonName}</strong> salonundan bir personel daveti aldınız.
                                        Daveti kabul etmek için önce <strong>{inviteData.email}</strong> adresi ile giriş yapmanız gerekmektedir.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleLogin}
                                        className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                                    >
                                        <LogIn className="w-6 h-6" />
                                        Giriş Yap
                                    </button>
                                    <button
                                        onClick={handleRegister}
                                        className="w-full py-4 bg-surface-alt text-text-main border border-border rounded-[24px] font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Yeni Hesap Oluştur
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* NOT FOUND */}
                        {state === 'NOT_FOUND' && (
                            <div className="text-center py-4 space-y-6">
                                <p className="text-text-muted font-bold text-sm">
                                    Bu davet linki geçersiz veya bulunamadı. Lütfen salon sahibinden yeni bir davet talep edin.
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-text-main text-white rounded-[24px] font-black hover:scale-[1.02] transition-all"
                                >
                                    Ana Sayfaya Dön
                                </Link>
                            </div>
                        )}

                        {/* EXPIRED */}
                        {state === 'EXPIRED' && (
                            <div className="text-center py-4 space-y-6">
                                <p className="text-text-muted font-bold text-sm">
                                    Bu davetin süresi dolmuş veya iptal edilmiş. Lütfen salon sahibinden yeni bir davet talep edin.
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-text-main text-white rounded-[24px] font-black hover:scale-[1.02] transition-all"
                                >
                                    Ana Sayfaya Dön
                                </Link>
                            </div>
                        )}

                        {/* ALREADY ACCEPTED */}
                        {state === 'ALREADY_ACCEPTED' && (
                            <div className="text-center py-4 space-y-6">
                                <p className="text-text-muted font-bold text-sm">
                                    Bu davet daha önce kabul edilmiş. Personel panelinize giriş yapabilirsiniz.
                                </p>
                                <Link
                                    href="/staff/dashboard"
                                    className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-[24px] font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                >
                                    Panelime Git <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        )}

                        {/* EMAIL MISMATCH */}
                        {state === 'EMAIL_MISMATCH' && inviteData && (
                            <div className="space-y-6">
                                <div className="bg-amber-50 rounded-[24px] p-6 border border-amber-100">
                                    <p className="text-amber-900 font-black">Farklı Hesap</p>
                                    <p className="text-amber-700 text-sm font-bold mt-2">
                                        Bu davet <strong>{inviteData.email}</strong> adresine gönderilmiş.
                                        Şu an giriş yaptığınız hesap (<strong>{user?.email}</strong>) ile uyuşmuyor.
                                    </p>
                                </div>
                                <p className="text-sm text-text-muted font-bold text-center">
                                    Lütfen doğru hesap ile giriş yapın veya salon sahibinden yeni bir davet talep edin.
                                </p>
                                <button
                                    onClick={handleLogin}
                                    className="w-full py-4 bg-amber-500 text-white rounded-[24px] font-black shadow-lg shadow-amber-500/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Farklı Hesapla Giriş Yap
                                </button>
                            </div>
                        )}

                        {/* ERROR */}
                        {state === 'ERROR' && (
                            <div className="text-center py-4 space-y-6">
                                <div className="bg-red-50 rounded-[24px] p-6 border border-red-100">
                                    <p className="text-red-800 font-black">Hata</p>
                                    <p className="text-red-700 text-sm font-bold mt-2">{errorMessage || 'Beklenmeyen bir hata oluştu.'}</p>
                                </div>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-text-main text-white rounded-[24px] font-black hover:scale-[1.02] transition-all"
                                >
                                    Ana Sayfaya Dön
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] font-bold text-text-muted uppercase tracking-widest mt-8 opacity-50">
                    Güzellik Randevu • Personel Davet Sistemi
                </p>
            </div>
        </div>
    );
}

export default function InviteAcceptPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <InviteAcceptContent />
        </Suspense>
    );
}
