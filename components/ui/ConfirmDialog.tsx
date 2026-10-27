'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

/**
 * Replacement for window.confirm / window.prompt (blocking, unstyled, not translatable).
 *
 *   const { confirm, prompt } = useConfirm();
 *   if (!(await confirm({ title: 'Silinsin mi?', tone: 'danger' }))) return;
 *   const reason = await prompt({ title: 'Red sebebi', required: true });   // null = cancelled
 */
interface BaseOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'default' | 'danger';
}
interface PromptOptions extends BaseOptions {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
}

type Pending =
  | { kind: 'confirm'; opts: BaseOptions; resolve: (v: boolean) => void }
  | { kind: 'prompt'; opts: PromptOptions; resolve: (v: string | null) => void };

interface ConfirmContextType {
  confirm: (opts: BaseOptions) => Promise<boolean>;
  prompt: (opts: PromptOptions) => Promise<string | null>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [value, setValue] = useState('');
  const confirmBtn = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  const confirm = useCallback(
    (opts: BaseOptions) => new Promise<boolean>((resolve) => setPending({ kind: 'confirm', opts, resolve })),
    [],
  );
  const prompt = useCallback(
    (opts: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        setValue(opts.defaultValue ?? '');
        setPending({ kind: 'prompt', opts, resolve });
      }),
    [],
  );

  const close = useCallback(
    (ok: boolean) => {
      if (!pending) return;
      if (pending.kind === 'confirm') pending.resolve(ok);
      else pending.resolve(ok ? value.trim() : null);
      setPending(null);
    },
    [pending, value],
  );

  useEffect(() => {
    if (!pending) return;
    (pending.kind === 'prompt' ? inputRef.current : confirmBtn.current)?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, close]);

  const opts = pending?.opts;
  const danger = opts?.tone === 'danger';
  const blocked = pending?.kind === 'prompt' && (pending.opts as PromptOptions).required && !value.trim();

  return (
    <ConfirmContext.Provider value={{ confirm, prompt }}>
      {children}
      {pending && opts && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => close(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className={`shrink-0 size-10 rounded-full flex items-center justify-center ${danger ? 'bg-rose-50 text-rose-600' : 'bg-primary/10 text-primary'}`}>
                {danger ? <AlertTriangle className="w-5 h-5" aria-hidden="true" /> : <HelpCircle className="w-5 h-5" aria-hidden="true" />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="confirm-dialog-title" className="text-base font-bold text-text-main">{opts.title}</h2>
                {opts.message && <p className="mt-1 text-sm text-text-secondary whitespace-pre-line">{opts.message}</p>}
              </div>
            </div>

            {pending.kind === 'prompt' && (
              <label className="block mt-4">
                {(pending.opts as PromptOptions).label && (
                  <span className="block text-xs font-semibold text-text-secondary mb-1">{(pending.opts as PromptOptions).label}</span>
                )}
                {(pending.opts as PromptOptions).multiline ? (
                  <textarea
                    ref={inputRef}
                    rows={3}
                    value={value}
                    placeholder={(pending.opts as PromptOptions).placeholder}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                ) : (
                  <input
                    ref={inputRef}
                    value={value}
                    placeholder={(pending.opts as PromptOptions).placeholder}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !blocked) close(true); }}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                )}
              </label>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => close(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:bg-gray-100 transition-colors"
              >
                {opts.cancelText ?? 'Vazgeç'}
              </button>
              <button
                ref={confirmBtn}
                type="button"
                disabled={blocked}
                onClick={() => close(true)}
                className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary-dark hover:bg-text-main'}`}
              >
                {opts.confirmText ?? (danger ? 'Evet, devam et' : 'Onayla')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
