'use client';

/**
 * Cloudflare Turnstile widget wrapper.
 * NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY tanımlı değilse hiçbir şey render etmez
 * (token boş döner — server-side verify de bu durumda atlar).
 */
import { useEffect, useRef } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (selector: string | HTMLElement, opts: any) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit';
    script.async = true;
    script.defer = true;
    window.onloadTurnstileCallback = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Turnstile script load failed'));
    document.head.appendChild(script);
  });

  return scriptLoading;
}

export function Turnstile({ onVerify, onError, onExpire, theme = 'auto', className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      // Demo mode — token olmadan hemen "verify"
      onVerify('demo-no-turnstile');
      return;
    }

    let cancelled = false;
    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onVerify(token),
          'error-callback': () => onError?.(),
          'expired-callback': () => onExpire?.(),
          theme,
        });
      })
      .catch(() => onError?.());

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* noop */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null; // demo mode — sessiz

  return <div ref={containerRef} className={className} />;
}
