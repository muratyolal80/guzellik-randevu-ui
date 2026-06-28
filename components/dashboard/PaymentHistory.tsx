'use client';

import Link from 'next/link';
import { CreditCard, ChevronRight } from 'lucide-react';

interface PaymentHistoryProps {
    payments: Array<{
        id: string;
        amount: number;
        payment_method: string;
        payment_type: string;
        status: string;
        created_at: string;
    }>;
}

const STATUS_STYLES: Record<string, string> = {
    SUCCESS: 'text-emerald-600 bg-emerald-50',
    PENDING: 'text-amber-600 bg-amber-50',
    FAILED: 'text-rose-600 bg-rose-50',
    REFUNDED: 'text-slate-500 bg-slate-50',
};

const STATUS_LABELS: Record<string, string> = {
    SUCCESS: 'Başarılı',
    PENDING: 'Bekliyor',
    FAILED: 'Başarısız',
    REFUNDED: 'İade',
};

const METHOD_LABELS: Record<string, string> = {
    CREDIT_CARD: 'Kart',
    IYZICO_LINK: 'Iyzico',
    BANK_TRANSFER: 'Havale',
    CASH: 'Nakit',
};

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
    if (payments.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-text-muted" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Son Ödemeler</h3>
                </div>
                <Link
                    href="/customer/payments"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                    Tümü <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="divide-y divide-gray-100">
                {payments.map((p) => {
                    const amountTl = Math.abs(p.amount) / 100;
                    const isRefund = p.payment_type === 'REFUND' || p.amount < 0;
                    const statusStyle = STATUS_STYLES[p.status] || STATUS_STYLES.PENDING;
                    const statusLabel = STATUS_LABELS[p.status] || p.status;
                    const methodLabel = METHOD_LABELS[p.payment_method] || p.payment_method;

                    return (
                        <div key={p.id} className="py-3 flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-text-main truncate">
                                    {isRefund ? '↩ İade · ' : ''}
                                    {methodLabel}
                                </p>
                                <p className="text-[11px] text-text-muted">
                                    {new Date(p.created_at).toLocaleDateString('tr-TR', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${statusStyle}`}>
                                    {statusLabel}
                                </span>
                                <p className={`text-sm font-black ${isRefund ? 'text-rose-600' : 'text-text-main'}`}>
                                    {isRefund ? '-' : ''}
                                    {amountTl.toFixed(2)}₺
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
