'use client';

import { useState } from 'react';
import { X, RotateCcw, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';

export interface RefundableTransaction {
  id: string;
  amount: number; // kuruş cinsinden
  payment_type: string;
  payment_method: string;
  metadata?: {
    provider?: string;
    merchant_oid?: string;
    is_test?: number;
    [k: string]: any;
  };
  created_at: string;
}

interface RefundModalProps {
  transaction: RefundableTransaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * PayTR iade modali (admin).
 * Backend: POST /api/paytr/refund (yetki: SUPER_ADMIN/ADMIN).
 * Tam veya kısmi iade desteği — return_amount editlenebilir.
 */
export default function RefundModal({ transaction, onClose, onSuccess }: RefundModalProps) {
  const originalAmountTl = Math.abs(transaction?.amount ?? 0) / 100;
  const [returnAmount, setReturnAmount] = useState<string>(originalAmountTl.toFixed(2));
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!transaction) return null;

  const merchantOid: string | undefined = transaction.metadata?.merchant_oid;
  const isPaytr = (transaction.metadata?.provider || '').toUpperCase() === 'PAYTR';
  const isTest = transaction.metadata?.is_test === 1;

  const canSubmit =
    !submitting &&
    !done &&
    isPaytr &&
    !!merchantOid &&
    parseFloat(returnAmount) > 0 &&
    parseFloat(returnAmount) <= originalAmountTl;

  async function handleSubmit() {
    if (!merchantOid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/paytr/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_oid: merchantOid,
          return_amount: Number(returnAmount),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'İade reddedildi.');
      } else {
        setDone(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Beklenmedik hata.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
              <RotateCcw className="text-rose-600" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-main tracking-tight">İADE İŞLEMİ</h3>
              <p className="text-[11px] font-bold text-text-muted uppercase">PayTR üzerinden geri ödeme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-text-muted hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!isPaytr && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-amber-800">
                Bu işlem PayTR üzerinden alınmamış (provider: {transaction.metadata?.provider || 'bilinmiyor'}).
                Otomatik iade desteklenmiyor — manuel olarak işlemen gerekir.
              </p>
            </div>
          )}

          {isPaytr && !merchantOid && (
            <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4">
              <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-rose-800">
                Bu kayıtta PayTR <code>merchant_oid</code> yok. İade gönderilemez.
              </p>
            </div>
          )}

          {isTest && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              ⓘ Test modu işlemi — gerçek para çekilmemişti
            </div>
          )}

          <div className="space-y-3 bg-gray-50/60 rounded-2xl p-4">
            <Field label="İşlem ID" value={`#${transaction.id.substring(0, 8)}`} mono />
            <Field label="Tarih" value={new Date(transaction.created_at).toLocaleString('tr-TR')} />
            <Field
              label="Orijinal Tutar"
              value={originalAmountTl.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            />
            {merchantOid && <Field label="PayTR OID" value={merchantOid} mono />}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest">
              İade Edilecek Tutar (TL)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={originalAmountTl}
              value={returnAmount}
              onChange={(e) => setReturnAmount(e.target.value)}
              disabled={!isPaytr || !merchantOid || submitting || done}
              className="w-full h-12 px-4 rounded-2xl border border-border bg-white text-text-main font-bold text-sm focus:outline-none focus:border-primary disabled:opacity-50 disabled:bg-gray-50"
              aria-label="İade tutarı"
            />
            <p className="text-[10px] font-bold text-text-muted">
              Maksimum: {originalAmountTl.toFixed(2)} TL · Kısmi iade için daha düşük tutar girebilirsin
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          {done && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={16} /> İade başarıyla işleme alındı.
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-gray-50/50 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 h-12 rounded-2xl border border-border bg-white text-text-main font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 h-12 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {done ? 'Tamamlandı' : submitting ? 'Gönderiliyor' : 'İadeyi Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="font-bold text-text-muted uppercase tracking-wider text-[10px]">{label}</span>
      <span className={`font-black text-text-main ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
