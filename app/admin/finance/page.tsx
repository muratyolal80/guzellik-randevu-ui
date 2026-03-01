'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { FinanceService } from '@/services/db';
import {
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    Filter,
    Download,
    CreditCard,
    Building2,
    LucideIcon
} from 'lucide-react';

export default function FinanceAdmin() {
    const [view, setView] = useState<'approvals' | 'reports'>('approvals');
    const [pendingPayments, setPendingPayments] = useState<any[]>([]);
    const [reports, setReports] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [view]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (view === 'approvals') {
                const data = await FinanceService.getPendingPayments();
                setPendingPayments(data);
            } else {
                const data = await FinanceService.getFinancialReports();
                setReports(data);
            }
        } catch (err) {
            console.error('Data load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, status: 'SUCCESS' | 'FAILED') => {
        const note = prompt(status === 'SUCCESS' ? 'Onay notu (opsiyonel):' : 'Red nedeni:');
        if (status === 'FAILED' && !note) return;

        try {
            setProcessingId(id);
            await FinanceService.updatePaymentStatus(id, status, note || undefined);
            alert(status === 'SUCCESS' ? 'Ödeme onaylandı ve abonelik aktif edildi.' : 'Ödeme reddedildi.');
            loadData();
        } catch (err) {
            alert('İşlem sırasında hata oluştu.');
        } finally {
            setProcessingId(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tl-TR', { style: 'currency', currency: 'TRY' }).format(amount / 100);
    };

    return (
        <AdminLayout>
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase">Finans Yönetimi</h2>
                    <p className="text-text-secondary font-medium">Havale onayları, iyzico raporları ve platform cirosu.</p>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit border border-border/50">
                    <button
                        onClick={() => setView('approvals')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${view === 'approvals' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Clock size={18} /> Onay Bekleyenler
                        {pendingPayments.length > 0 && <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{pendingPayments.length}</span>}
                    </button>
                    <button
                        onClick={() => setView('reports')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${view === 'reports' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <TrendingUp size={18} /> Gelir Raporları
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-[32px]"></div>)}
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    {view === 'approvals' ? (
                        <PendingPaymentsList
                            payments={pendingPayments}
                            onAction={handleAction}
                            processingId={processingId}
                            formatCurrency={formatCurrency}
                        />
                    ) : (
                        <FinancialReportsView
                            reports={reports}
                            formatCurrency={formatCurrency}
                        />
                    )}
                </div>
            )}
        </AdminLayout>
    );
}

function PendingPaymentsList({ payments, onAction, processingId, formatCurrency }: any) {
    if (payments.length === 0) {
        return (
            <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-200 p-20 text-center">
                <CheckCircle2 size={64} className="mx-auto text-emerald-200 mb-6" />
                <h3 className="text-xl font-black text-text-main uppercase tracking-tight">Tüm İşlemler Güncel</h3>
                <p className="text-text-secondary font-medium mt-2">Onay bekleyen herhangi bir havale/EFT bildirimi bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {payments.map((payment: any) => (
                <div key={payment.id} className="bg-white rounded-[32px] border border-border shadow-card overflow-hidden hover:shadow-card-hover transition-all group">
                    <div className="flex flex-col lg:flex-row">
                        {/* Sol Bilgi Bölümü */}
                        <div className="p-8 flex-1 flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                <Building2 size={32} />
                            </div>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-lg font-black text-text-main uppercase tracking-tight">{payment.salons?.name}</h4>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${payment.payment_type === 'SUBSCRIPTION' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {payment.payment_type}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-text-muted">Tarih: {new Date(payment.created_at).toLocaleString('tl-TR')}</p>
                                </div>
                                <div className="flex flex-wrap gap-6">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1"><CreditCard size={12} /> Ödeme Yöntemi</span>
                                        <p className="text-sm font-black text-text-main">{payment.payment_method}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1"><TrendingUp size={12} /> Tutar</span>
                                        <p className="text-xl font-black text-primary">{formatCurrency(payment.amount)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sağ Aksiyon Bölümü */}
                        <div className="bg-gray-50/50 p-8 border-l border-border flex flex-col justify-center gap-4 lg:w-72">
                            <button
                                disabled={processingId === payment.id}
                                onClick={() => onAction(payment.id, 'SUCCESS')}
                                className="w-full bg-emerald-600 text-white h-14 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <CheckCircle2 size={20} /> Onayla
                            </button>
                            <button
                                disabled={processingId === payment.id}
                                onClick={() => onAction(payment.id, 'FAILED')}
                                className="w-full bg-white text-red-600 border border-red-100 h-14 rounded-2xl font-black hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <XCircle size={20} /> Reddet
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function FinancialReportsView({ reports, formatCurrency }: any) {
    if (!reports) return null;

    return (
        <div className="space-y-10">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Toplam Ciro" value={formatCurrency(reports.stats.totalRevenue)} icon={TrendingUp} color="blue" />
                <StatCard label="Başarılı İşlem" value={reports.stats.successCount} icon={CheckCircle2} color="emerald" />
                <StatCard label="Bekleyen Ödeme" value={reports.stats.pendingCount} icon={Clock} color="amber" />
                <StatCard label="İptal/Hata" value={reports.stats.failedCount} icon={XCircle} color="red" />
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-[40px] border border-border shadow-card overflow-hidden">
                <div className="p-8 border-b border-border bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-xl font-black text-text-main tracking-tight uppercase">Son İşlemler</h3>
                    <div className="flex gap-2">
                        <button className="p-3 bg-white border border-border rounded-xl text-text-secondary hover:text-primary transition-colors">
                            <Filter size={18} />
                        </button>
                        <button className="p-3 bg-white border border-border rounded-xl text-text-secondary hover:text-primary transition-colors">
                            <Download size={18} />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-alt/50 border-b border-border">
                                <th className="px-8 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest">İşlem ID / Tarih</th>
                                <th className="px-8 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest">Tür</th>
                                <th className="px-8 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest">Yöntem</th>
                                <th className="px-8 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest">Tutar</th>
                                <th className="px-8 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {reports.transactions.map((tr: any) => (
                                <tr key={tr.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <div>
                                                <p className="text-xs font-black text-text-main truncate w-32 font-mono">#{tr.id.substring(0, 8)}</p>
                                                <p className="text-[10px] font-bold text-text-muted mt-0.5">{new Date(tr.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${tr.payment_type === 'SUBSCRIPTION' ? 'text-purple-600' : 'text-blue-600'}`}>
                                            {tr.payment_type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-text-main">{tr.payment_method}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-text-main">{formatCurrency(tr.amount)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge status={tr.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: any, icon: LucideIcon, color: string }) {
    const colorMap: any = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600'
    };

    return (
        <div className="bg-white p-8 rounded-[32px] border border-border shadow-card hover:scale-[1.02] transition-all">
            <div className={`w-12 h-12 ${colorMap[color]} rounded-2xl flex items-center justify-center mb-6`}>
                <Icon size={24} />
            </div>
            <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-text-main tracking-tight leading-none">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        SUCCESS: 'bg-emerald-100 text-emerald-700',
        PENDING: 'bg-amber-100 text-amber-700',
        FAILED: 'bg-red-100 text-red-700',
        REFUNDED: 'bg-gray-100 text-gray-700'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
            {status}
        </span>
    );
}
