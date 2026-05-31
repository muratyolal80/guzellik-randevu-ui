'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertCircle, ShieldCheck, CreditCard } from 'lucide-react';

interface PayTRPaymentModalProps {
    isOpen: boolean;
    planId: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
    salonId?: string;
    /** Admin'in başka owner adına ödeme yapması için. SALON_OWNER kendi adına yaparsa boş bırakılır. */
    ownerId?: string;
    /** Plan adı (basket label için). */
    planLabel?: string;
    onClose: () => void;
    /**
     * PayTR ödeme iframe içinde tamamlandığında merchant_ok_url'e redirect olur — bu
     * modal kapanmadan kullanıcıyı bilgilendirmek için kullanılır. Callback ayrı kanaldan
     * server'a gelir; final subscription status orada güncellenir.
     */
    onSuccess?: (merchant_oid: string) => void;
}

export default function PayTRPaymentModal({
    isOpen,
    planId,
    billingCycle,
    salonId,
    ownerId,
    planLabel,
    onClose,
    onSuccess,
}: PayTRPaymentModalProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);
    const [merchantOid, setMerchantOid] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useEffect(() => {
        if (!isOpen || !planId) return;

        let cancelled = false;
        setLoading(true);
        setError(null);
        setIframeUrl(null);

        (async () => {
            try {
                const res = await fetch('/api/paytr/create-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId, billingCycle, salonId, ownerId }),
                });
                const data = await res.json();
                if (cancelled) return;
                if (!res.ok || !data.iframeUrl) {
                    setError(data.error || 'PayTR token alınamadı.');
                    return;
                }
                setIframeUrl(data.iframeUrl);
                setMerchantOid(data.merchant_oid);
                if (onSuccess && data.merchant_oid) onSuccess(data.merchant_oid);
            } catch (err: any) {
                if (!cancelled) setError(err?.message || 'Beklenmedik hata');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [isOpen, planId, billingCycle, salonId, ownerId, onSuccess]);

    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // PayTR iframeResizer scripti — iframe yüklendikten sonra mount edilir
    useEffect(() => {
        if (!iframeUrl) return;
        const existing = document.getElementById('paytr-iframe-resizer');
        if (existing) return;
        const script = document.createElement('script');
        script.src = 'https://www.paytr.com/js/iframeResizer.min.js';
        script.id = 'paytr-iframe-resizer';
        script.async = true;
        script.onload = () => {
            // @ts-ignore — global from PayTR script
            if (typeof window.iFrameResize === 'function' && iframeRef.current) {
                // @ts-ignore
                window.iFrameResize({}, iframeRef.current);
            }
        };
        document.body.appendChild(script);
    }, [iframeUrl]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                <div className="px-8 py-6 border-b border-border bg-gradient-to-r from-emerald-50 to-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text-main tracking-tight">PayTR Kredi Kartı Ödemesi</h3>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                {planLabel ? `${planLabel} · ` : ''}{billingCycle === 'YEARLY' ? 'YILLIK' : 'AYLIK'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        aria-label="Kapat"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="py-24 flex flex-col items-center gap-4 text-text-muted">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <p className="text-sm font-bold uppercase tracking-widest">Güvenli ödeme sayfası hazırlanıyor…</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="p-8">
                            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex items-start gap-4">
                                <AlertCircle className="w-7 h-7 text-red-500 shrink-0" />
                                <div className="space-y-2">
                                    <p className="font-black text-red-800">Ödeme başlatılamadı</p>
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                    <p className="text-xs text-red-600/80 mt-3">
                                        Çözüm önerileri: (a) Admin Panel &gt; Ayarlar &gt; Ödeme Sağlayıcıları'na gidip <strong>Aktif Sağlayıcının PAYTR</strong> olduğunu ve PayTR config'in dolu olduğunu doğrulayın. (b) <strong>test_mode=1</strong> aktifken demo kartları kullanın.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {iframeUrl && !error && (
                        <iframe
                            ref={iframeRef}
                            src={iframeUrl}
                            id="paytriframe"
                            frameBorder={0}
                            scrolling="no"
                            style={{ width: '100%', minHeight: 560 }}
                            title="PayTR Ödeme"
                        />
                    )}
                </div>

                <div className="px-8 py-4 border-t border-border bg-gray-50 flex items-center justify-between text-[10px] font-bold text-text-muted">
                    <span className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        Kart bilgileriniz PayTR'de korunur. Bizim sistemimize ulaşmaz.
                    </span>
                    {merchantOid && (
                        <span className="font-mono">OID: {merchantOid.slice(0, 16)}…</span>
                    )}
                </div>
            </div>
        </div>
    );
}
