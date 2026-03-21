'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useActiveBranch } from '@/context/ActiveBranchContext';
import { supabase } from '@/lib/supabase';
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Clock, 
    CheckCircle2, 
    TrendingUp, 
    CreditCard,
    Filter,
    Download,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import AIInsights from '@/components/owner/AIInsights';

export default function OwnerFinancePage() {
    const { user } = useAuth();
    const { branches, activeBranch, loading: branchLoading } = useActiveBranch();
    const [viewType, setViewType] = useState<'single' | 'all'>('single');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        pendingPayout: 0,
        totalAppointments: 0,
        completedPayments: 0,
        staffEarnings: [] as { id: string, name: string, total: number, count: number }[]
    });
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        if (activeBranch || viewType === 'all') {
            fetchFinanceData();
        }
    }, [activeBranch, viewType]);

    const fetchFinanceData = async () => {
        if (!activeBranch && viewType === 'single') return;
        setLoading(true);
        try {
            let query = supabase
                .from('appointments')
                .select(`
                    id,
                    customer_name,
                    start_time,
                    status,
                    deposit_amount,
                    refund_status,
                    refund_amount,
                    payment_method,
                    payment_status,
                    salon_id,
                    staff_id,
                    staff:staff(id, name),
                    salon_services (
                        price,
                        global_services (name)
                    )
                `);

            if (viewType === 'single' && activeBranch) {
                query = query.eq('salon_id', activeBranch.id);
            } else if (viewType === 'all' && branches.length > 0) {
                query = query.in('salon_id', branches.map(b => b.id));
            }

            const { data: appointments, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            // Calculate Stats
            let total = 0;
            let pending = 0;
            let completed = 0;
            const staffMap: Record<string, { name: string, total: number, count: number }> = {};

            const txList = (appointments || []).map(app => {
                const serviceData = Array.isArray(app.salon_services) ? app.salon_services[0] : app.salon_services;
                const servicePrice = serviceData?.price || 0;
                const depositAmount = app.deposit_amount || 0;
                const isCompleted = app.status === 'COMPLETED';
                const isCancelled = app.status === 'CANCELLED';

                if (isCompleted) {
                    total += servicePrice;
                    completed++;

                    // Staff tracking
                    const sId = app.staff_id;
                    const sName = (app.staff as any)?.name || 'Bilinmeyen Personel';
                    if (sId) {
                        if (!staffMap[sId]) staffMap[sId] = { name: sName, total: 0, count: 0 };
                        staffMap[sId].total += servicePrice;
                        staffMap[sId].count += 1;
                    }
                }
                
                if (depositAmount > 0 && (!app.refund_status || app.refund_status === 'NONE') && !isCancelled) {
                    pending += depositAmount;
                }

                const globalServiceName = Array.isArray(serviceData?.global_services) 
                    ? serviceData?.global_services[0]?.name 
                    : serviceData?.global_services?.name;

                return {
                    id: app.id,
                    customer: app.customer_name || 'Bilinmiyor',
                    service: globalServiceName || 'Hizmet',
                    date: app.start_time,
                    amount: servicePrice,
                    deposit: depositAmount,
                    status: app.status,
                    refundStatus: app.refund_status,
                    paymentMethod: app.payment_method || 'CASH',
                    salonId: app.salon_id
                };
            });

            setStats({
                totalEarnings: total,
                pendingPayout: pending,
                totalAppointments: appointments?.length || 0,
                completedPayments: completed,
                staffEarnings: Object.entries(staffMap).map(([id, data]) => ({ id, ...data })).sort((a, b) => b.total - a.total)
            } as any);
            setTransactions(txList.slice(0, 10)); // Show last 10

        } catch (err) {
            console.error('Finance Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (branchLoading || loading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-42 bg-gray-100 rounded-[32px]"></div>
                    ))}
                </div>
                <div className="h-96 bg-gray-50 rounded-[40px]"></div>
            </div>
        );
    }

    if (!activeBranch) {
        return <div className="p-20 text-center font-bold text-text-secondary">Lütfen bir salon seçin.</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-text-main tracking-tight mb-2">Finansal Yönetim</h1>
                    <div className="flex items-center gap-4">
                        <p className="text-text-secondary font-medium italic">İşletmenizin nakit akışını ve hakedişlerini buradan takip edin.</p>
                        {branches.length > 1 && (
                            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                                <button 
                                    onClick={() => setViewType('single')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewType === 'single' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                >
                                    Aktif Şube
                                </button>
                                <button 
                                    onClick={() => setViewType('all')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewType === 'all' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                >
                                    Tüm Şubeler
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white border border-border rounded-2xl text-text-secondary hover:text-primary hover:border-primary transition-all shadow-sm">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-border rounded-2xl font-bold text-sm text-text-main hover:border-primary hover:text-primary transition-all shadow-sm">
                        <Download className="w-4 h-4" />
                        Rapor İndir
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-gradient-to-br from-primary to-indigo-600 rounded-[32px] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-white/70 font-black text-[10px] uppercase tracking-[0.2em] mb-4">TOPLAM KAZANÇ</p>
                        <h3 className="text-4xl font-black tracking-tighter mb-2">{stats.totalEarnings.toLocaleString('tr-TR')} TL</h3>
                        <div className="flex items-center gap-2 text-white/80 text-[11px] font-bold">
                            <span className="flex items-center gap-0.5 bg-white/20 px-2 py-0.5 rounded-full">
                                <ArrowUpRight className="w-3 h-3" /> %12
                            </span>
                            Geçen aya göre artış
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white border border-border rounded-[32px] shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-text-muted font-black text-[10px] uppercase tracking-[0.2em] mb-4">BEKLEYEN HAKEDİŞLER</p>
                        <h3 className="text-4xl font-black text-text-main tracking-tighter mb-2">{stats.pendingPayout.toLocaleString('tr-TR')} TL</h3>
                        <div className="flex items-center gap-2 text-amber-600 text-[11px] font-black italic">
                            <Clock className="w-3 h-3" /> Onay bekleyen kapora ödemeleri
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white border border-border rounded-[32px] shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-text-muted font-black text-[10px] uppercase tracking-[0.2em] mb-4">TAMAMLANAN İŞLEMLER</p>
                        <h3 className="text-4xl font-black text-text-main tracking-tighter mb-2">{stats.completedPayments}</h3>
                        <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-black italic">
                            <CheckCircle2 className="w-3 h-3" /> Başarıyla sonuçlanan ödemeler
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Insights Section */}
            <AIInsights 
                salonId={activeBranch?.id} 
                viewType={viewType} 
            />

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions Table */}
                <div className="lg:col-span-2 bg-white rounded-[40px] border border-border p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h2 className="text-lg font-black text-text-main uppercase tracking-tight flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                <CreditCard className="w-4 h-4" />
                            </div>
                            Son İşlemler
                        </h2>
                        <button className="text-xs font-black text-primary hover:underline">Tümünü Gör</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-2">Müşteri / Hizmet</th>
                                    <th className="text-left py-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-2">Tarih</th>
                                    <th className="text-right py-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-2">Tutar / Yöntem</th>
                                    <th className="text-right py-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-2">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.length > 0 ? transactions.map((tx, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5 px-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">
                                                    {tx.customer ? tx.customer[0] : '?'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-text-main leading-none">{tx.customer}</p>
                                                        {viewType === 'all' && (
                                                            <span className="text-[9px] bg-primary/5 text-primary px-1.5 py-0.5 rounded-md font-bold">
                                                                {(branches as any[]).find(b => b.id === tx.salonId)?.name || 'Şube'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-text-secondary font-medium italic mt-1">{tx.service}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-2">
                                            <p className="text-xs font-black text-text-main tracking-tight">{format(new Date(tx.date), 'dd MMM yyyy', { locale: tr })}</p>
                                            <p className="text-[10px] text-text-secondary font-medium italic">{format(new Date(tx.date), 'HH:mm')}</p>
                                        </td>
                                        <td className="py-5 px-2 text-right">
                                            <p className="text-sm font-black text-text-main">{tx.amount} TL</p>
                                            <p className={`text-[9px] font-black tracking-tight ${
                                                tx.paymentMethod === 'CASH' ? 'text-emerald-600' :
                                                tx.paymentMethod === 'CREDIT_CARD' ? 'text-blue-600' :
                                                tx.paymentMethod === 'BANK_TRANSFER' ? 'text-indigo-600' :
                                                'text-gray-600'
                                            }`}>
                                                {tx.paymentMethod === 'CASH' ? 'NAKİT' :
                                                 tx.paymentMethod === 'CREDIT_CARD' ? 'KREDİ KARTI' :
                                                 tx.paymentMethod === 'BANK_TRANSFER' ? 'HAVALE/EFT' :
                                                 tx.paymentMethod}
                                            </p>
                                        </td>
                                        <td className="py-5 px-2 text-right">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                                                tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                tx.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {tx.status === 'COMPLETED' ? 'TAMAMLANDI' : 
                                                 tx.status === 'CANCELLED' ? (tx.refundStatus === 'SUCCESS' ? 'İADE EDİLDİ' : 'İPTAL') : 
                                                 'AÇIK'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-20">
                                                <Wallet className="w-12 h-12" />
                                                <p className="font-black italic text-sm">Henüz bir işlem bulunmuyor.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Sidebar - Info Widgets */}
                <div className="space-y-6">
                    <div className="p-8 bg-white rounded-[40px] border border-border shadow-sm">
                        <h2 className="text-sm font-black text-text-main uppercase tracking-widest mb-6 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Personel Performansı (Emeği Geçenler)
                        </h2>
                        <div className="space-y-5">
                            {stats.staffEarnings.length > 0 ? stats.staffEarnings.map((staff, idx) => (
                                <div key={staff.id} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-black text-text-main leading-none mb-1">{staff.name}</p>
                                            <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase">{staff.count} Randevu</p>
                                        </div>
                                        <p className="text-xs font-black text-primary">{staff.total.toLocaleString('tr-TR')} TL</p>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary rounded-full" 
                                            style={{ width: `${(staff.total / (stats.totalEarnings || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-[10px] text-text-muted font-bold italic text-center py-4">Henüz veri bulunmuyor.</p>
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-200 shadow-sm">
                        <h2 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Finansal İpucu
                        </h2>
                        <p className="text-xs font-bold text-amber-800 leading-relaxed italic opacity-80">
                            Ödemeleri randevu sonunda "Tamamlandı" olarak işaretleyip yöntem seçerseniz, raporlarınızda hangi kanaldan ne kadar kazandığınızı net şekilde görebilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
