'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        // Üretimde Sentry vb.'ye gönderilebilir.
        console.error('[App Error]', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
            <div className="w-24 h-24 rounded-[32px] bg-rose-50 text-rose-500 flex items-center justify-center mb-8 border border-rose-100">
                <AlertTriangle className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-black text-text-main mb-3">Bir şeyler ters gitti</h1>
            <p className="text-text-secondary font-medium max-w-md mb-10">
                Beklenmeyen bir hata oluştu. Tekrar deneyebilir ya da ana sayfaya dönebilirsiniz. Sorun sürerse lütfen bizimle iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => reset()}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all"
                >
                    <RotateCcw className="w-5 h-5" /> Tekrar Dene
                </button>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-border bg-white text-text-main font-black hover:bg-gray-50 transition-all"
                >
                    <Home className="w-5 h-5" /> Ana Sayfa
                </Link>
            </div>
        </div>
    );
}
