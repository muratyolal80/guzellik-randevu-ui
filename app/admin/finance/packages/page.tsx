'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { FinanceService, NotificationService, SubscriptionService } from '@/services/db';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    Search, 
    Filter, 
    ChevronRight, 
    ChevronLeft,
    Info, 
    CreditCard, 
    Building2, 
    Calendar,
    Wallet,
    AlertCircle,
    X,
    Check,
    Trash2,
    Image as ImageIcon,
    AlertTriangle,
    Zap,
    ArrowRightLeft,
    MapPin,
    User,
    Phone,
    Plus,
    Edit2,
    Trophy,
    Shield,
    History,
    Layers,
    Mail,
    ChevronDown,
    Save
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { tr } from 'date-fns/locale';
import { format } from 'date-fns';

type ActiveTab = 'APPROVALS' | 'DEFINITIONS' | 'SUBSCRIPTIONS';

export default function PackageManagementPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<ActiveTab>('APPROVALS');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // --- Tab 1: Approvals State ---
    const [records, setRecords] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | 'ALL'>('PENDING');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [globalStats, setGlobalStats] = useState({ total: 0, pending: 0, revenue: 0, trialActive: 0 });

    // --- Tab 2: Definitions State ---
    const [plans, setPlans] = useState<any[]>([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);

    // --- Tab 3: Subscriptions State ---
    const [allSubscriptions, setAllSubscriptions] = useState<any[]>([]);
    const [subSearch, setSubSearch] = useState('');

    // --- Debounce & Fetchers ---
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (activeTab === 'APPROVALS') fetchApprovals();
        if (activeTab === 'DEFINITIONS') fetchPlans();
        if (activeTab === 'SUBSCRIPTIONS') fetchAllSubscriptions();
    }, [activeTab, currentPage, statusFilter, debouncedSearch]);

    const fetchApprovals = async () => {
        setLoading(true);
        try {
            const stats = await FinanceService.getFinanceStats();
            setGlobalStats(stats);
            const response = await FinanceService.getUnifiedFinanceRecords({
                page: currentPage, pageSize: 10, status: statusFilter, search: debouncedSearch
            });
            setRecords(response.records || []);
            setTotalCount(response.totalCount || 0);
        } catch (error) {
            showToast('Onaylar yüklenirken hata oluştu', 'error');
        } finally { setLoading(false); }
    };

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await SubscriptionService.getPlans(false);
            setPlans(data || []);
        } catch (error) {
            showToast('Paketler yüklenirken hata oluştu', 'error');
        } finally { setLoading(false); }
    };

    const fetchAllSubscriptions = async () => {
        setLoading(true);
        try {
            const { subscriptions } = await SubscriptionService.getAllSubscriptions({ page: 1, pageSize: 100 });
            setAllSubscriptions(subscriptions || []);
        } catch (error) {
            showToast('Abonelikler yüklenirken hata oluştu', 'error');
        } finally { setLoading(false); }
    };

    // --- Actions ---
    const handleUpdatePayment = async (paymentId: string, status: 'SUCCESS' | 'FAILED') => {
        const note = window.prompt(status === 'SUCCESS' ? 'Onay notu:' : 'Red nedeni:');
        if (note === null) return;
        setActionLoading(true);
        try {
            await FinanceService.updatePaymentStatus(paymentId, status, note || undefined);
            showToast('İşlem başarılı', 'success');
            fetchApprovals();
            setIsDetailsOpen(false);
        } catch (error: any) {
            showToast(error.message || 'Hata oluştu', 'error');
        } finally { setActionLoading(false); }
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            if (editingPlan.id) {
                await SubscriptionService.updatePlan(editingPlan.id, editingPlan);
                showToast('Paket güncellendi', 'success');
            } else {
                await SubscriptionService.createPlan(editingPlan);
                showToast('Yeni paket oluşturuldu', 'success');
            }
            setIsPlanModalOpen(false);
            fetchPlans();
        } catch (error) {
            showToast('Paket kaydedilirken hata oluştu', 'error');
        } finally { setActionLoading(false); }
    };

    const handleDeletePlan = async (planId: string) => {
        if (!window.confirm('Bu paketi silmek veya pasife çekmek istediğinize emin misiniz?')) return;
        try {
            const res = await SubscriptionService.deletePlan(planId);
            showToast(res.action === 'DEACTIVATED' ? 'Paket kullanımda olduğu için pasife çekildi.' : 'Paket silindi.', 'success');
            fetchPlans();
        } catch (error) {
            showToast('İşlem başarısız', 'error');
        }
    };

    const getPlanIcon = (name: string) => {
        if (name.includes('STARTER')) return <Zap className="text-blue-500" />;
        if (name.includes('BUSINESS')) return <Trophy className="text-amber-500" />;
        return <Shield className="text-purple-500" />;
    };

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                            <Layers className="w-4 h-4" /> Paket Yönetim Merkezi
                        </div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight uppercase">
                            Paket & <span className="text-primary italic">Finans Yönetimi</span>
                        </h1>
                        <p className="text-text-muted text-sm font-medium">
                            Ödemeleri onaylayın, paketleri tanımlayın ve aktif abonelikleri takip edin.
                        </p>
                    </div>

                    <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('APPROVALS')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'APPROVALS' ? 'bg-white shadow-sm ring-1 ring-black/5 text-primary' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Ödeme Onayları
                        </button>
                        <button
                            onClick={() => setActiveTab('DEFINITIONS')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'DEFINITIONS' ? 'bg-white shadow-sm ring-1 ring-black/5 text-primary' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Paket Tanımları
                        </button>
                        <button
                            onClick={() => setActiveTab('SUBSCRIPTIONS')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'SUBSCRIPTIONS' ? 'bg-white shadow-sm ring-1 ring-black/5 text-primary' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Satın Alınanlar
                        </button>
                    </div>
                </div>

                {/* --- TAB 1: APPROVALS --- */}
                {activeTab === 'APPROVALS' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-[28px] border-2 border-gray-50 shadow-sm">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Onay Bekleyenler</p>
                                <p className="text-2xl font-black text-amber-600">{globalStats.pending}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[28px] border-2 border-gray-50 shadow-sm">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Toplam Gelir</p>
                                <p className="text-2xl font-black text-emerald-600">₺{(globalStats.revenue / 100).toLocaleString('tr-TR')}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[28px] border-2 border-gray-50 shadow-sm">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Aktif Denemeler</p>
                                <p className="text-2xl font-black text-blue-600">{globalStats.trialActive}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[28px] border-2 border-primary/5 shadow-sm">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Toplam İşlem</p>
                                <p className="text-2xl font-black text-text-main">{globalStats.total}</p>
                            </div>
                        </div>

                        {/* Search & Status Filters */}
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                                {['PENDING', 'SUCCESS', 'FAILED', 'ALL'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s as any)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${statusFilter === s ? 'bg-white text-primary shadow-sm' : 'text-text-muted'}`}
                                    >
                                        {s === 'PENDING' ? 'Bekleyenler' : s === 'SUCCESS' ? 'Onaylı' : s === 'FAILED' ? 'Red' : 'Hepsi'}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    className="pl-12 pr-4 py-2 bg-white border border-border rounded-xl text-sm font-bold min-w-[300px]"
                                    placeholder="Arama yap..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white border-2 border-gray-50 rounded-[32px] overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-border">
                                    <tr className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                                        <th className="px-8 py-5">İşletme</th>
                                        <th className="px-8 py-5">Paket / Döngü</th>
                                        <th className="px-8 py-5 text-right">Tutar</th>
                                        <th className="px-8 py-5 text-center">Durum</th>
                                        <th className="px-8 py-5 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {records.map(record => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => { setSelectedRecord(record); setIsDetailsOpen(true); }}>
                                            <td className="px-8 py-6">
                                                <div className="font-black text-text-main uppercase text-[12px]">{record.salons?.name}</div>
                                                <div className="text-[10px] text-text-muted font-bold flex items-center gap-1">
                                                    <User size={10} /> {record.salons?.profiles?.full_name}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-text-secondary text-[11px] uppercase">{record.subscriptions?.subscription_plans?.display_name}</div>
                                                <span className="text-[9px] font-black bg-surface-alt px-2 py-0.5 rounded text-text-muted uppercase leading-none">
                                                    {record.subscriptions?.billing_cycle === 'YEARLY' ? 'Yıllık' : 'Aylık'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-text-main text-[13px]">
                                                {record.amount === 0 ? 'ÜCRETSİZ' : `₺${(record.amount / 100).toLocaleString('tr-TR')}`}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase ${
                                                    record.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    record.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                    {record.status === 'PENDING' ? 'Bekliyor' : record.status === 'SUCCESS' ? 'Onaylı' : 'Reddedildi'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <ChevronRight className="w-5 h-5 text-text-muted ml-auto group-hover:text-primary transition-colors" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: DEFINITIONS --- */}
                {activeTab === 'DEFINITIONS' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center">
                            <div className="p-3 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-xl flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                "Pasif" paketler satıştan kaldırılmış ancak geçmiş kayıtlar için veritabanında saklanan paketlerdir.
                            </div>
                            <button 
                                onClick={() => { setEditingPlan({ display_name: '', name: '', price_monthly: 0, price_yearly: 0, max_staff: 1, max_branches: 1, max_gallery_photos: 5, is_active: true, sort_order: 10 }); setIsPlanModalOpen(true); }}
                                className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                            >
                                <Plus size={16} /> Yeni Paket Tanımla
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {plans.map(plan => (
                                <div key={plan.id} className={`bg-white rounded-[40px] border-2 transition-all overflow-hidden ${plan.is_active ? 'border-border hover:border-primary/20 shadow-card' : 'border-dashed border-red-200 opacity-80 grayscale-[0.5]'}`}>
                                    <div className="p-8 border-b border-border flex items-center justify-between bg-gray-50/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl border border-border flex items-center justify-center shadow-sm">
                                                {getPlanIcon(plan.name)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-text-main text-lg uppercase tracking-tight">{plan.display_name}</h3>
                                                <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase italic">{plan.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => { setEditingPlan(plan); setIsPlanModalOpen(true); }}
                                                className="p-2.5 bg-white border border-border text-text-main rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePlan(plan.id)}
                                                className="p-2.5 bg-white border border-border text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-text-main tracking-tighter italic">{plan.price_monthly / 100}</span>
                                            <span className="text-text-secondary font-bold uppercase tracking-wider text-[10px]">TL / AY</span>
                                        </div>

                                        <div className="space-y-3 pt-6 border-t border-dashed border-border">
                                            {[
                                                { label: 'Max Personel', val: plan.max_staff === -1 ? 'Sınırsız' : plan.max_staff, icon: Users },
                                                { label: 'Max Şube', val: plan.max_branches === -1 ? 'Sınırsız' : plan.max_branches, icon: Building2 },
                                                { label: 'Galeri Foto', val: plan.max_gallery_photos, icon: ImageIcon },
                                                { label: 'Ücretli Özellikler', val: plan.has_campaigns ? 'Dahil' : 'Pasif', icon: Shield }
                                            ].map((lim, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                                        <lim.icon size={12} className="text-primary/60" /> {lim.label}
                                                    </div>
                                                    <span className="text-xs font-black text-text-main">{lim.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={`px-8 py-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] border-t ${plan.is_active ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100' : 'bg-red-50/50 text-red-700 border-red-100'}`}>
                                        <span>Durum</span>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${plan.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                            {plan.is_active ? 'Satışta / Aktif' : 'Arşiv / Pasif'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB 3: SUBSCRIPTIONS --- */}
                {activeTab === 'SUBSCRIPTIONS' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black text-text-main uppercase tracking-tight">Mevcut Salon Abonelikleri</h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    className="pl-12 pr-4 py-2 bg-white border border-border rounded-xl text-sm font-bold min-w-[300px]"
                                    placeholder="Salon/Owner ara..."
                                    value={subSearch}
                                    onChange={e => setSubSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-white border-2 border-gray-50 rounded-[32px] overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-border">
                                    <tr className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em]">
                                        <th className="px-8 py-5">Salon</th>
                                        <th className="px-8 py-5">Mevcut Paket</th>
                                        <th className="px-8 py-5">Başlangıç</th>
                                        <th className="px-8 py-5">Sonlanma</th>
                                        <th className="px-8 py-5 text-right">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {allSubscriptions.filter(s => s.salons?.name.toLowerCase().includes(subSearch.toLowerCase())).map(sub => (
                                        <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="font-black text-text-main uppercase text-[12px]">{sub.salons?.name}</div>
                                                <div className="text-[10px] text-text-muted font-bold truncate">Owner ID: {sub.salons?.owner_id?.slice(0,8)}...</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    {getPlanIcon(sub.subscription_plans?.name || '')}
                                                    <span className="text-[11px] font-black text-text-secondary uppercase">{sub.subscription_plans?.display_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-[11px] font-bold text-text-muted">
                                                {format(new Date(sub.current_period_start), 'dd MMM yyyy', { locale: tr })}
                                            </td>
                                            <td className="px-8 py-5 text-[11px] font-black text-text-main">
                                                {sub.current_period_end ? format(new Date(sub.current_period_end), 'dd MMM yyyy', { locale: tr }) : '-'}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    sub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                                    sub.status === 'TRIAL' ? 'bg-blue-50 text-blue-600' :
                                                    sub.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                    'bg-red-50 text-red-600'
                                                }`}>
                                                    {sub.status === 'ACTIVE' ? 'Aktif' : sub.status === 'TRIAL' ? 'Deneme' : sub.status === 'PENDING_APPROVAL' ? 'Bekliyor' : 'Pasif'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Modals & Drawers --- */}

            {/* Approvals Detail Drawer */}
            {isDetailsOpen && selectedRecord && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDetailsOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-8 border-b border-border flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-black text-text-main uppercase tracking-tight">Ödeme Detayı</h3>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{selectedRecord.id}</p>
                            </div>
                            <button onClick={() => setIsDetailsOpen(false)} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Business Card */}
                            <div className="p-8 bg-gray-50 border-2 border-gray-100 rounded-[32px] space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-border">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-text-main uppercase">{selectedRecord.salons?.name}</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase">{selectedRecord.salons?.profiles?.full_name}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                                    <div className="text-[10px] font-bold text-text-muted uppercase">Şehir/İlçe: {selectedRecord.salons?.cities?.name} / {selectedRecord.salons?.districts?.name}</div>
                                    <div className="text-[10px] font-bold text-text-muted uppercase text-right">ID: {selectedRecord.salon_id?.slice(0,8)}</div>
                                </div>
                            </div>

                            {/* Plan Card */}
                            <div className="p-6 bg-purple-50/30 border border-purple-100 rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest italic">Talep Edilen Paket</span>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${selectedRecord.subscriptions?.billing_cycle === 'YEARLY' ? 'bg-purple-600' : 'bg-blue-600'} text-white`}>
                                        {selectedRecord.subscriptions?.billing_cycle === 'YEARLY' ? 'Yıllık' : 'Aylık'}
                                    </span>
                                </div>
                                <div className="text-2xl font-black text-purple-900 uppercase">
                                    {selectedRecord.subscriptions?.subscription_plans?.display_name}
                                </div>
                            </div>

                            {/* Bank Details */}
                            {selectedRecord.payment_method === 'BANK_TRANSFER' && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-amber-500" /> Havale Bildirimi
                                    </h4>
                                    <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-bold text-amber-800/60 uppercase">Gönderen</span>
                                            <span className="text-[10px] font-black text-amber-900 uppercase">{selectedRecord.metadata?.sender_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-bold text-amber-800/60 uppercase">Banka</span>
                                            <span className="text-[10px] font-black text-amber-900 uppercase">{selectedRecord.metadata?.bank_name}</span>
                                        </div>
                                        {selectedRecord.bank_transfer_proof_url && (
                                            <a href={selectedRecord.bank_transfer_proof_url} target="_blank" className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-amber-200 rounded-2xl text-[10px] font-black text-amber-900 uppercase">
                                                <ImageIcon size={16} /> Dekontu Gör
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                             {/* Financial Info */}
                             <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white border border-border rounded-[28px]">
                                    <span className="text-[9px] font-black text-text-muted uppercase">Tutar</span>
                                    <p className="text-2xl font-black text-text-main tracking-tighter">₺{(selectedRecord.amount / 100).toLocaleString('tr-TR')}</p>
                                </div>
                                <div className="p-6 bg-white border border-border rounded-[28px]">
                                    <span className="text-[9px] font-black text-text-muted uppercase">Tarih</span>
                                    <p className="text-xl font-black text-text-main tracking-tighter">{new Date(selectedRecord.created_at).toLocaleDateString('tr-TR')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-border flex gap-4 bg-gray-50/80 backdrop-blur-sm">
                            {selectedRecord.status === 'PENDING' ? (
                                <>
                                    <button disabled={actionLoading} onClick={() => handleUpdatePayment(selectedRecord.id, 'FAILED')} className="flex-1 py-4 bg-white border border-red-100 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-red-600 transition-all">Reddet</button>
                                    <button disabled={actionLoading} onClick={() => handleUpdatePayment(selectedRecord.id, 'SUCCESS')} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100">Onayla</button>
                                </>
                            ) : (
                                <div className={`w-full py-4 text-center rounded-2xl font-black text-[10px] uppercase tracking-widest ${selectedRecord.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>İşlem {selectedRecord.status === 'SUCCESS' ? 'Onaylandı' : 'Reddedildi'}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Edit Modal */}
            {isPlanModalOpen && editingPlan && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsPlanModalOpen(false)}></div>
                    <form onSubmit={handleSavePlan} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-border flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-black text-text-main uppercase tracking-tight">{editingPlan.id ? 'Paketi Düzenle' : 'Yeni Paket Tanımla'}</h3>
                            <button type="button" onClick={() => setIsPlanModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-gray-100"><X /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase px-1">Örn: Starter, Business</label>
                                    <input required className="w-full p-4 bg-surface-alt border border-border rounded-2xl text-sm font-bold" value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value.toUpperCase()})} placeholder="PAKET KODU (SLUG)" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase px-1">Ekranda Görünecek İsim</label>
                                    <input required className="w-full p-4 bg-surface-alt border border-border rounded-2xl text-sm font-bold" value={editingPlan.display_name} onChange={e => setEditingPlan({...editingPlan, display_name: e.target.value})} placeholder="GÖRÜNÜR İSİM" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase px-1">Aylık Fiyat (Kuruş Cinsinden)</label>
                                    <input type="number" required className="w-full p-4 bg-surface-alt border border-border rounded-2xl text-sm font-bold" value={editingPlan.price_monthly} onChange={e => setEditingPlan({...editingPlan, price_monthly: parseInt(e.target.value)})} placeholder="AYLIK FİYAT (KURUŞ)" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase px-1">Yıllık Fiyat (Kuruş Cinsinden)</label>
                                    <input type="number" required className="w-full p-4 bg-surface-alt border border-border rounded-2xl text-sm font-bold" value={editingPlan.price_yearly} onChange={e => setEditingPlan({...editingPlan, price_yearly: parseInt(e.target.value)})} placeholder="YILLIK FİYAT (KURUŞ)" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase px-1">Max Personel (-1: Sınırsız)</label>
                                    <input type="number" required className="w-full p-4 bg-surface-alt border border-border rounded-2xl text-sm font-bold" value={editingPlan.max_staff} onChange={e => setEditingPlan({...editingPlan, max_staff: parseInt(e.target.value)})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase px-1">Max Şube (-1: Sınırsız)</label>
                                    <input type="number" required className="w-full p-4 bg-surface-alt border border-border rounded-2xl text-sm font-bold" value={editingPlan.max_branches} onChange={e => setEditingPlan({...editingPlan, max_branches: parseInt(e.target.value)})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase px-1">Max Galeri Foto</label>
                                    <input type="number" required className="w-full p-4 bg-surface-alt border border-border rounded-2xl text-sm font-bold" value={editingPlan.max_gallery_photos} onChange={e => setEditingPlan({...editingPlan, max_gallery_photos: parseInt(e.target.value)})} />
                                </div>
                            </div>
                            <div className="flex gap-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 accent-primary" checked={editingPlan.is_active} onChange={e => setEditingPlan({...editingPlan, is_active: e.target.checked})} />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-text-main">Paket Satışta (Aktif)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 accent-primary" checked={editingPlan.has_campaigns} onChange={e => setEditingPlan({...editingPlan, has_campaigns: e.target.checked})} />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-text-main">Kampanya Yönetimi</span>
                                </label>
                            </div>
                        </div>
                        <div className="p-8 border-t border-border bg-gray-50/50 flex gap-4">
                            <button type="button" onClick={() => setIsPlanModalOpen(false)} className="px-8 py-4 bg-white border border-border text-text-secondary rounded-2xl font-black text-[11px] uppercase tracking-widest">İptal</button>
                            <button type="submit" disabled={actionLoading} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                                <Save size={16} /> {editingPlan.id ? 'Değişiklikleri Kaydet' : 'Paketi Oluştur'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}
