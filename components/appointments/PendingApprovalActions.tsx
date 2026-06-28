'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface PendingApprovalActionsProps {
    appointmentId: string;
    status: string;
    onUpdated?: (newStatus: 'CONFIRMED' | 'CANCELLED') => void;
    size?: 'sm' | 'md';
}

/**
 * Mode B salon onay butonu. PENDING randevular için "Onayla" / "Reddet"
 * butonlarını gösterir. POST /api/appointments/[id]/{confirm,reject}.
 *
 * Diğer status'larda (CONFIRMED, CANCELLED, COMPLETED, NO_SHOW) hiçbir şey
 * render etmez — koşullu kullanıma uygundur.
 */
export default function PendingApprovalActions({
    appointmentId,
    status,
    onUpdated,
    size = 'md',
}: PendingApprovalActionsProps) {
    const [loading, setLoading] = useState<'confirm' | 'reject' | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (status !== 'PENDING') return null;

    const btnBase = size === 'sm'
        ? 'px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg'
        : 'px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl';

    const handleConfirm = async () => {
        setLoading('confirm');
        setError(null);
        try {
            const res = await fetch(`/api/appointments/${appointmentId}/confirm`, {
                method: 'POST',
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.error || 'Onaylama başarısız');
                return;
            }
            onUpdated?.('CONFIRMED');
        } catch (err: any) {
            setError(err?.message || 'Ağ hatası');
        } finally {
            setLoading(null);
        }
    };

    const handleReject = async () => {
        setLoading('reject');
        setError(null);
        try {
            const res = await fetch(`/api/appointments/${appointmentId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectReason || undefined }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.error || 'Reddetme başarısız');
                return;
            }
            setShowRejectModal(false);
            onUpdated?.('CANCELLED');
        } catch (err: any) {
            setError(err?.message || 'Ağ hatası');
        } finally {
            setLoading(null);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={handleConfirm}
                    disabled={loading !== null}
                    className={`${btnBase} bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1.5 disabled:opacity-50`}
                >
                    {loading === 'confirm' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Onayla
                </button>
                <button
                    onClick={() => { setShowRejectModal(true); setRejectReason(''); setError(null); }}
                    disabled={loading !== null}
                    className={`${btnBase} bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition flex items-center gap-1.5 disabled:opacity-50`}
                >
                    <XCircle className="w-3 h-3" />
                    Reddet
                </button>
                {error && (
                    <span className="text-[10px] font-bold text-rose-600">{error}</span>
                )}
            </div>

            {/* Reject confirm modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                                <XCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-text-main">Randevu Reddediliyor</h3>
                                <p className="text-xs font-bold text-text-muted">Müşteriye SMS ile bilgi verilecek.</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">
                                Sebep (opsiyonel)
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value.slice(0, 280))}
                                placeholder="Örn: Personel müsait değil, salon kapalı..."
                                rows={3}
                                className="w-full px-3 py-2 rounded-xl border border-border text-sm font-medium focus:border-rose-300 focus:outline-none resize-none"
                            />
                            <p className="text-[10px] font-bold text-text-muted mt-1">{rejectReason.length}/280</p>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-bold text-rose-700">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                disabled={loading !== null}
                                className="flex-1 h-11 rounded-xl border border-border bg-white text-text-main font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={loading !== null}
                                className="flex-1 h-11 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading === 'reject' && <Loader2 className="w-3 h-3 animate-spin" />}
                                Reddet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
