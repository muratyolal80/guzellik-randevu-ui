'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { FinanceService } from '@/services/db';
import { useToast } from '@/components/ui/Toast';
import { Breadcrumbs } from '@/components/Admin/Breadcrumbs';
import {
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    Filter,
    Download,
    CreditCard,
    Building2,
    LucideIcon,
    Ghost,
    Trash2,
    AlertTriangle,
    ShoppingCart,
    Plus
} from 'lucide-react';
import Link from 'next/link';

export default function FinanceAdmin() {
    const { showToast } = useToast();
    const [view, setView] = useState<'approvals' | 'reports' | 'ghosts'>('approvals');
    const [pendingPayments, setPendingPayments] = useState<any[]>([]);
    const [ghostSubscriptions, setGhostSubscriptions] = useState<any[]>([]);
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
            } else if (view === 'ghosts') {
                const data = await FinanceService.getGhostSubscriptions();
                setGhostSubscriptions(data);
            } else {
                const data = await FinanceService.getFinancialReports();
                setReports(data);
            }
        } catch (err) {
            console.error('Data load error:', err);
            showToast('Veriler yüklenirken hata oluştu.', 'error');
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
            showToast(status === 'SUCCESS' ? 'Ödeme onaylandı.' : 'Ödeme reddedildi.', 'success');
            loadData();
        } catch (err) {
            showToast('İşlem sırasında hata oluştu.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleHardDeleteGhost = async (id: string) => {
        if (!confirm('Bu hayalet kaydı KALICI OLARAK silmek istediğinize emin misiniz?')) return;
        try {
            setProcessingId(id);
            await FinanceService.hardDeleteSubscription(id);
            showToast('Kayıt temizlendi.', 'success');
            loadData();
        } catch (err) {
            showToast('Silme hatası.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tl-TR', { style: 'currency', currency: 'TRY' }).format(amount / 100);
    };

    return (
        <AdminLayout>
            <Breadcrumbs items={[{ label: 'Finans Yönetimi' }]} />

            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mt-6">
                <div>
                    <h2 className="text-4xl font-black text-text-main tracking-tighter uppercase">Finans <span className="text-primary">Paneli</span></h2>
                    <p className="text-text-secondary font-medium">Platform cirosu, havale onayları ve veri bütünlüğü.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/finance/purchase"
                        className="bg-primary text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
                    >
                        <ShoppingCart size={16} className="text-amber-300" /> Paket Satın Al
                    </Link>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-[24px] w-fit border border-border/50">
                    <button
                        onClick={() => setView('approvals')}
                        className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${view === 'approvals' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Clock size={16} /> Onaylar
                        {pendingPayments.length > 0 && <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{pendingPayments.length}</span>}
                    </button>
                    <button
                        onClick={() => setView('reports')}
                        className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${view === 'reports' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <TrendingUp size={16} /> Raporlar
                    </button>
                    <button
                        onClick={() => setView('ghosts')}
                        className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${view === 'ghosts' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Ghost size={16} /> Hayalet Kayıtlar
                        {ghostSubscriptions.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{ghostSubscriptions.length}</span>}
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
                    ) : view === 'reports' ? (
                        <FinancialReportsView
                            reports={reports}
                            formatCurrency={formatCurrency}
                        />
                    ) : (
                        <GhostSubscriptionsList 
                            ghosts={ghostSubscriptions}
                            onDelete={handleHardDeleteGhost}
                            processingId={processingId}
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
<<<<<<< HEAD
    const stats = reports?.stats ?? { totalRevenue: 0, successCount: 0, pendingCount: 0, failedCount: 0 };
    const transactions = reports?.transactions ?? [];
=======
    if (!reports) return null;
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8

    return (
        <div className="space-y-10">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<<<<<<< HEAD
                <StatCard label="Toplam Ciro" value={formatCurrency(stats.totalRevenue)} icon={TrendingUp} color="blue" />
                <StatCard label="Başarılı İşlem" value={stats.successCount} icon={CheckCircle2} color="emerald" />
                <StatCard label="Bekleyen Ödeme" value={stats.pendingCount} icon={Clock} color="amber" />
                <StatCard label="İptal/Hata" value={stats.failedCount} icon={XCircle} color="red" />
=======
                <StatCard label="Toplam Ciro" value={formatCurrency(reports.stats.totalRevenue)} icon={TrendingUp} color="blue" />
                <StatCard label="Başarılı İşlem" value={reports.stats.successCount} icon={CheckCircle2} color="emerald" />
                <StatCard label="Bekleyen Ödeme" value={reports.stats.pendingCount} icon={Clock} color="amber" />
                <StatCard label="İptal/Hata" value={reports.stats.failedCount} icon={XCircle} color="red" />
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
                            {transactions.map((tr: any) => (
=======
                            {reports.transactions.map((tr: any) => (
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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

function GhostSubscriptionsList({ ghosts, onDelete, processingId }: any) {
    if (ghosts.length === 0) {
        return (
            <div className="bg-white rounded-[40px] border border-border p-20 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-text-main uppercase tracking-tight">Tertemiz Veri Seti</h3>
                <p className="text-text-secondary font-medium mt-2">Sistemde herhangi bir orphaned (sahipsiz) veya tutarsız abonelik kaydı bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] flex items-center gap-4">
                <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                <p className="text-sm font-bold text-amber-800">
                    Aşağıdaki kayıtlar silinmiş işletmelere aittir veya sistem tarafından "Expired" yapılması gerekirken hala "Active" görünen tutarsız kayıtlardır. 
                    Veritabanı sağlığı için bu kayıtları temizlemeniz önerilir.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {ghosts.map((ghost: any) => (
                    <div key={ghost.id} className="bg-white p-8 rounded-[32px] border border-border flex flex-col md:flex-row items-center justify-between gap-6 hover:border-rose-200 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                <Ghost size={28} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-text-main">{ghost.salons?.name || 'TANIMSIZ SALON'}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${ghost.salons?.status === 'DELETED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {ghost.salons?.status === 'DELETED' ? 'SALON SİLİNMİŞ' : 'SÜRESİ DOLMUŞ'}
                                    </span>
                                    <span className="text-[10px] font-bold text-text-muted">PLAN: {ghost.subscription_plans?.name}</span>
                                    <span className="text-[10px] font-bold text-text-muted">BITIŞ: {new Date(ghost.current_period_end).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={processingId === ghost.id}
                            onClick={() => onDelete(ghost.id)}
                            className="h-14 px-8 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50"
                        >
                            <Trash2 size={18} /> Kaydı Temizle
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
