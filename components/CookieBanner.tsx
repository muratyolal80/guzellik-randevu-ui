'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'cookie-consent-v1';

type Consent = 'all' | 'essential' | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Consent;
    setConsent(stored || null);
  }, []);

  if (!mounted || consent !== null) return null;

  const accept = (value: Exclude<Consent, null>) => {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  };

  return (
    <div
      role="region"
      aria-label="Çerez tercihleri"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[60] bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 animate-slide-up"
      style={{ animation: 'slide-up 0.4s ease-out' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Cookie className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-gray-900 text-sm mb-1">Çerez Tercihleri</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Sitemiz oturum yönetimi ve hizmet kalitesini iyileştirmek için çerez kullanır. Tercihlerinizi seçebilirsiniz.{' '}
            <Link href="/kvkk" className="text-primary font-bold hover:underline">Detaylı bilgi</Link>
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => accept('essential')}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
        >
          Sadece Zorunlu
        </button>
        <button
          onClick={() => accept('all')}
          className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
        >
          Tümünü Kabul Et
        </button>
      </div>

      <button
        onClick={() => accept('essential')}
        className="absolute top-3 right-3 w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
        aria-label="Banner'ı kapat (sadece zorunlu çerezler kabul edilir)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
