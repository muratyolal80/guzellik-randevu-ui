'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { FinanceService, NotificationService, SubscriptionService } from '@/services/db';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    Search, 
    Filter, 
    ChevronRight, 
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
    LayoutDashboard,
    PhoneCall,
    Users,
    Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPackageApprovalsPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'PAYMENTS' | 'SUBSCRIPTIONS'>('PAYMENTS');
    const [payments, setPayments] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Primary Filter: Status Tabs (Operational Workflow)
    const [statusFilter, setStatusFilter] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | 'ALL'>('PENDING');
    
    // Secondary Filter: Payment Methods
    const [methodFilter, setMethodFilter] = useState<'IYZICO_CC' | 'BANK_TRANSFER' | 'TRIAL' | 'ALL'>('ALL');
    
    // Sub-Filter: Trial Status (Only shown when methodFilter is TRIAL)
    const [trialSubFilter, setTrialSubFilter] = useState<'ACTIVE' | 'EXPIRED' | 'ALL'>('ALL');
    
    const [searchQuery, setSearchQuery] = useState('');
    
    // Details Drawer State
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (viewMode === 'PAYMENTS') {
                const response = await FinanceService.getFinancialReports();
                setPayments(response.transactions || []);
            } else {
                const response = await SubscriptionService.getAllSubscriptions();
                setSubscriptions(response || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [viewMode]);

    const handleAction = async (paymentId: string, status: 'SUCCESS' | 'FAILED') => {
        const adminNote = window.prompt(status === 'SUCCESS' ? 'Onay notu (opsiyonel):' : 'Red nedeni:');
        if (status === 'FAILED' && adminNote === null) return;

        setActionLoading(true);
        try {
            await FinanceService.updatePaymentStatus(paymentId, status, adminNote || undefined);
            
            const payment = payments.find(p => p.id === paymentId);
            if (payment?.salon_id) {
                // BUG FIX: createNotification -> sendNotification
                await NotificationService.sendNotification({
                    user_id: payment.salons?.owner_id,
                    salon_id: payment.salon_id,
                    title: status === 'SUCCESS' ? 'Ödemeniz Onaylandı' : 'Ödemeniz Reddedildi',
                    content: status === 'SUCCESS' 
                        ? 'Paket ödemeniz onaylandı ve aboneliğiniz aktif edildi.' 
                        : `Ödemeniz reddedildi. Sebep: ${adminNote || 'Belirtilmedi'}`,
                    type: 'SYSTEM'
                });
            }

            await fetchData();
            setIsDetailsOpen(false);
        } catch (error) {
            console.error('Error updating payment status:', error);
            alert('İşlem sırasında bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    // Delete a payment record
    const handleDeletePayment = async (paymentId: string) => {
        if (!window.confirm('Bu ödeme kaydını tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        setActionLoading(true);
        try {
            await FinanceService.deletePayment(paymentId);
            await fetchData();
            setIsDetailsOpen(false);
        } catch (error) {
            console.error('Error deleting payment:', error);
            alert('Silme işlemi sırasında bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    // Delete a subscription record
    const handleDeleteSub = async (subId: string) => {
        if (!window.confirm('Bu abonelik kaydını tamamen silmek istediğinize emin misiniz? Salonun paket hakları sıfırlanacaktır.')) return;

        setActionLoading(true);
        try {
            await SubscriptionService.deleteSubscription(subId);
            await fetchData();
        } catch (error) {
            console.error('Error deleting subscription:', error);
            alert('Silme işlemi sırasında bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    const isExpired = (endDate: string) => endDate ? new Date(endDate) < new Date() : false;
    const getDaysLeft = (endDate: string) => {
        if (!endDate) return 0;
        const diff = new Date(endDate).getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const filteredPayments = (payments || []).filter(p => {
        // ... (existing filter logic but safer)
        const matchesSearch = !searchQuery || 
                             p.salons?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.id.toLowerCase().includes(searchQuery.toLowerCase());
        
        const isTrial = p.payment_method === 'TRIAL' || p.amount === 0;
        const matchesMethod = methodFilter === 'ALL' ? true : 
                             (methodFilter === 'TRIAL' ? isTrial : p.payment_method === methodFilter);
        
        let matchesStatus = statusFilter === 'ALL' ? true : p.status === statusFilter;
        if (methodFilter === 'TRIAL') {
            matchesStatus = true; 
            if (trialSubFilter === 'ACTIVE' && isExpired(p.subscriptions?.current_period_end)) return false;
            if (trialSubFilter === 'EXPIRED' && !isExpired(p.subscriptions?.current_period_end)) return false;
        }

        return matchesSearch && matchesMethod && matchesStatus;
    });

    // Aggregated Stats for Premium Dashboard
    const stats = {
        total: (payments || []).length,
        pending: (payments || []).filter(p => p.status === 'PENDING').length,
        revenue: (payments || []).filter(p => p.status === 'SUCCESS').reduce((acc, curr) => acc + (curr.amount || 0), 0),
        trialActive: (payments || []).filter(p => (p.payment_method === 'TRIAL' || p.amount === 0) && !isExpired(p.subscriptions?.current_period_end)).length
    };

    return (
        <AdminLayout>
            <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
                
                {/* Top Toggle Mode */}
                <div className="flex gap-4 border-b border-gray-100 pb-2">
                    <button 
                        onClick={() => setViewMode('PAYMENTS')}
                        className={`pb-4 px-2 text-sm font-black transition-all relative ${viewMode === 'PAYMENTS' ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Ödeme Talepleri & Onaylar
                        {viewMode === 'PAYMENTS' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in slide-in-from-bottom duration-300"></div>}
                    </button>
                    <button 
                        onClick={() => setViewMode('SUBSCRIPTIONS')}
                        className={`pb-4 px-2 text-sm font-black transition-all relative ${viewMode === 'SUBSCRIPTIONS' ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Tüm Abonelik Kayıtları (DB)
                        {viewMode === 'SUBSCRIPTIONS' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in slide-in-from-bottom duration-300"></div>}
                    </button>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                            <ArrowRightLeft className="w-4 h-4" /> Finansal İşlemler
                        </div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight">
                            {viewMode === 'PAYMENTS' ? 'Finans & Paket' : 'Abonelik'} <span className="text-primary italic">{viewMode === 'PAYMENTS' ? 'Onayları' : 'Yönetimi'}</span>
                        </h1>
                        <p className="text-text-muted text-sm font-medium">
                            {viewMode === 'PAYMENTS' 
                                ? 'Banka havalelerini onaylayın ve abonelik geçmişini yönetin.' 
                                : 'Veritabanındaki tüm abonelik kayıtlarını görüntüleyin ve hatallı kayıtları temizleyin.'}
                        </p>
                    </div>

                    {viewMode === 'PAYMENTS' && (
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
                            {[
                                { id: 'PENDING', label: 'Bekleyenler', icon: Clock, color: 'text-amber-500' },
                                { id: 'SUCCESS', label: 'Onaylananlar', icon: CheckCircle, color: 'text-emerald-500' },
                                { id: 'FAILED', label: 'Reddedilenler', icon: XCircle, color: 'text-red-500' },
                                { id: 'ALL', label: 'Tümü', icon: Filter, color: 'text-gray-500' }
                            ].map(st => (
                                <button
                                    key={st.id}
                                    onClick={() => {
                                        setStatusFilter(st.id as any);
                                        if (methodFilter === 'TRIAL') setMethodFilter('ALL');
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${statusFilter === st.id ? 'bg-white text-text-main shadow-sm ring-1 ring-black/5' : 'text-text-muted hover:text-text-main'}`}
                                >
                                    <st.icon className={`w-3.5 h-3.5 ${st.color}`} />
                                    {st.label}
                                    {(payments || []).filter(p => st.id === 'ALL' ? true : p.status === st.id).length > 0 && 
                                        <span className="ml-1 opacity-50 px-1 bg-gray-100 rounded-md text-[9px]">{(payments || []).filter(p => st.id === 'ALL' ? true : p.status === st.id).length}</span>
                                    }
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Statistics Cards (Premium Feature) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-[28px] border-2 border-gray-50 shadow-sm space-y-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Bekleyen Onaylar</p>
                            <p className="text-2xl font-black text-text-main">{stats.pending}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[28px] border-2 border-gray-50 shadow-sm space-y-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Toplam Gelir</p>
                            <p className="text-2xl font-black text-text-main">₺{(stats.revenue / 100).toLocaleString('tr-TR')}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[28px] border-2 border-gray-50 shadow-sm space-y-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Aktif Denemeler</p>
                            <p className="text-2xl font-black text-text-main">{stats.trialActive}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[28px] border-2 border-primary/5 shadow-sm space-y-3 ring-2 ring-primary/5">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Toplam Kayıt</p>
                            <p className="text-2xl font-black text-text-main">{stats.total}</p>
                        </div>
                    </div>
                </div>

                {/* Sub-Filters & Search */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    <div className="lg:col-span-8 flex flex-wrap gap-2">
                        {viewMode === 'PAYMENTS' ? [
                            { id: 'ALL', label: 'TÜM YÖNTEMLER' },
                            { id: 'BANK_TRANSFER', label: 'BANKA HAVALESİ' },
                            { id: 'IYZICO_CC', label: 'KREDİ KARTI' },
                            { id: 'TRIAL', label: 'DENEME / ÜCRETSİZ' }
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setMethodFilter(m.id as any)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-wider transition-all border-2 ${methodFilter === m.id ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-gray-100 text-text-muted hover:border-primary/20 hover:text-primary'}`}
                            >
                                {m.label}
                            </button>
                        )) : (
                            <div className="p-3 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-xl flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Burada veritabanındaki ham abonelik kayıtlarını görüyorsunuz. Ödeme kaydı olmayan bloklayıcı kayıtları buradan silebilirsiniz.
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={viewMode === 'PAYMENTS' ? "İşletme adı veya ID ile ara..." : "Salon adı ile ara..."}
                            className="w-full h-12 pl-12 pr-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-text-muted/40"
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white border-2 border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100 italic">
                                {viewMode === 'PAYMENTS' ? (
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">İşletme / Konum</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Sahibi</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Yöntem / Tip</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Finansal Veri</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Durum</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Aksiyon</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Salon Bilgisi</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Paket</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Statü</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Dönem</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">İşlem</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Veriler Çekiliyor...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : viewMode === 'PAYMENTS' ? (
                                    filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-32 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <Filter className="w-12 h-12" />
                                                    <p className="text-sm font-black uppercase tracking-widest">Kayıt Bulunamadı</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredPayments.map(p => {
                                        const isTrial = p.payment_method === 'TRIAL' || p.amount === 0;
                                        const daysRemaining = getDaysLeft(p.subscriptions?.current_period_end);
                                        const expired = isExpired(p.subscriptions?.current_period_end);

                                        return (
                                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => { setSelectedPayment(p); setIsDetailsOpen(true); }}>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-text-main group-hover:text-primary transition-colors uppercase">{p.salons?.name}</span>
                                                        <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase flex items-center gap-1 opacity-60">
                                                            <MapPin className="w-3 h-3 text-red-400" />
                                                            {p.salons?.districts?.name || '---'} / {p.salons?.cities?.name || '---'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px]">
                                                            {p.salons?.profiles?.full_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[11px] font-black text-text-main uppercase truncate">{p.salons?.profiles?.full_name || 'Bilinmiyor'}</span>
                                                            <span className="text-[9px] font-medium text-text-muted truncate">{p.salons?.profiles?.email || 'No email'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${isTrial ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                                            {isTrial ? <Zap className="w-4 h-4 fill-emerald-600" /> : (p.payment_method === 'BANK_TRANSFER' ? <Building2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-text-main">{p.payment_type}</span>
                                                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-tight">
                                                                {isTrial ? 'Deneme' : (p.payment_method === 'BANK_TRANSFER' ? 'Havaleli' : 'Kredi Kartlı')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {isTrial ? (
                                                        <div className="flex flex-col">
                                                            <span className={`text-[11px] font-black ${expired ? 'text-red-500' : 'text-emerald-600'}`}>
                                                                {expired ? 'Süresi Doldu' : `${daysRemaining} Gün Kaldı`}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-text-muted italic underline decoration-primary/20">{new Date(p.subscriptions?.current_period_end).toLocaleDateString('tr-TR')}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-text-main">₺{(p.amount / 100).toLocaleString('tr-TR')}</span>
                                                            <span className="text-[9px] font-bold text-text-muted uppercase italic opacity-60">{new Date(p.created_at).toLocaleDateString('tr-TR')}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black border-2 ${
                                                        p.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                        {p.status === 'PENDING' ? 'BEKLEYEN' : 
                                                         p.status === 'SUCCESS' ? 'ONAYLI' : 'REDDEDİLDİ'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeletePayment(p.id); }}
                                                            className="p-2 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Ödemeyi Sil"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    subscriptions.filter(s => !searchQuery || s.salons?.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-32 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <Layers className="w-12 h-12" />
                                                    <p className="text-sm font-black uppercase tracking-widest">Kayıt Bulunamadı</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        subscriptions.filter(s => !searchQuery || s.salons?.name?.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                                            <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-text-main uppercase">{s.salons?.name || 'SALON BULUNAMADI'}</span>
                                                        <span className="text-[9px] font-bold text-text-muted opacity-60">Salon ID: {s.salon_id}</span>
                                                        <span className="text-[9px] font-bold text-text-muted opacity-40 italic">Sub ID: {s.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-xs font-black text-purple-700 uppercase">{s.subscription_plans?.display_name || 'STARTER'}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                                                        s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                                        s.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-[10px] font-bold text-text-muted">
                                                        {s.current_period_start ? new Date(s.current_period_start).toLocaleDateString('tr-TR') : '---'} - {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString('tr-TR') : '---'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteSub(s.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Aboneliği Sil"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Drawer */}
                {isDetailsOpen && selectedPayment && (
                    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/5" onClick={() => setIsDetailsOpen(false)}></div>
                        <div className="ml-auto w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ring-1 ring-black/5">
                            
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-text-main uppercase tracking-tight">İşlem Detayları</h3>
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{selectedPayment.id}</p>
                                </div>
                                <button onClick={() => setIsDetailsOpen(false)} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto p-8 space-y-10 pb-40">
                                {/* Salon Card */}
                                <div className="p-8 bg-gray-50 border-2 border-gray-100 rounded-[32px] flex flex-col gap-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm ring-1 ring-black/5">
                                            <Building2 className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-black text-text-main uppercase tracking-tight">{selectedPayment.salons?.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-white/60 px-2 py-0.5 rounded-md">İŞLETME / SALON</span>
                                                <button 
                                                    onClick={() => router.push(`/admin/management?salonId=${selectedPayment.salon_id}`)}
                                                    className="text-[10px] font-black text-primary hover:underline uppercase flex items-center gap-1"
                                                >
                                                    <Zap className="w-3 h-3" /> İşletmeyi Görüntüle
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200/50 relative z-10">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3 h-3" /> Konum</span>
                                            <p className="text-xs font-bold text-text-main uppercase">
                                                {selectedPayment.salons?.districts?.name || '---'} / {selectedPayment.salons?.cities?.name || '---'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3" /> Telefon</span>
                                            <p className="text-xs font-bold text-text-main">{selectedPayment.salons?.phone || '---'}</p>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1 italic">Tam Adres</span>
                                            <p className="text-[11px] font-medium text-text-muted leading-relaxed">{selectedPayment.salons?.address || 'Adres belirtilmemiş.'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Info Section */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                                        <User className="w-4 h-4 text-blue-500" /> İşletme Sahibi Bilgileri
                                    </h4>
                                    <div className="p-8 bg-blue-50/30 border-2 border-blue-50 rounded-[32px] space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                                <LayoutDashboard className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-base font-black text-text-main uppercase">{selectedPayment.salons?.profiles?.full_name || 'BİLİNMİYOR'}</p>
                                                <p className="text-[11px] font-medium text-text-muted">{selectedPayment.salons?.profiles?.email || 'E-POSTA YOK'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-3 bg-white/50 rounded-2xl border border-blue-100/50">
                                            <PhoneCall className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-bold text-blue-900">{selectedPayment.salons?.profiles?.phone || 'Telefon numarası kayıtlı değil.'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Subscription Plan Details */}
                                {selectedPayment.subscriptions?.subscription_plans && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                                            <Layers className="w-4 h-4 text-purple-500" /> Seçilen Paket İçeriği
                                        </h4>
                                        <div className="p-8 bg-purple-50/30 border-2 border-purple-50 rounded-[32px] space-y-6">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xl font-black text-purple-900 uppercase">
                                                    {selectedPayment.subscriptions.subscription_plans.display_name}
                                                </p>
                                                <span className="px-3 py-1 bg-purple-600 text-white text-[9px] font-black rounded-full uppercase">
                                                    {selectedPayment.subscriptions.billing_cycle === 'YEARLY' ? 'YILLIK' : 'AYLIK'}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-white rounded-2xl border border-purple-100 flex items-center gap-3">
                                                    <Users className="w-5 h-5 text-purple-600" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-text-muted uppercase">Personel</span>
                                                        <span className="text-sm font-black text-text-main">{selectedPayment.subscriptions.subscription_plans.max_staff} Limit</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white rounded-2xl border border-purple-100 flex items-center gap-3">
                                                    <Building2 className="w-5 h-5 text-purple-600" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-text-muted uppercase">Şube</span>
                                                        <span className="text-sm font-black text-text-main">{selectedPayment.subscriptions.subscription_plans.max_branches} Limit</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Main Financial Data */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-8 bg-white border-2 border-gray-50 rounded-[32px] space-y-2 shadow-sm">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1 text-emerald-600"><Wallet className="w-3 h-3" /> ÖDEME TUTARI</span>
                                        <p className="text-3xl font-black text-text-main tracking-tighter">₺{(selectedPayment.amount / 100).toLocaleString('tr-TR')}</p>
                                    </div>
                                    <div className="p-8 bg-white border-2 border-gray-50 rounded-[32px] space-y-2 shadow-sm">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1 text-blue-600"><Calendar className="w-3 h-3" /> İŞLEM TARİHİ</span>
                                        <p className="text-2xl font-black text-text-main tracking-tighter">{new Date(selectedPayment.created_at).toLocaleDateString('tr-TR')}</p>
                                    </div>
                                </div>

                                {/* Method Specifics */}
                                {selectedPayment.payment_method === 'BANK_TRANSFER' && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" /> Banka Havale Bildirimi
                                        </h4>
                                        <div className="bg-amber-50/50 border-2 border-amber-100/50 rounded-3xl p-8 space-y-6">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-amber-800/60 uppercase">Gönderen</span>
                                                    <p className="font-black text-amber-900 uppercase">{selectedPayment.metadata?.sender_name || 'BELİRTİLMEDİ'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-amber-800/60 uppercase">Banka</span>
                                                    <p className="font-black text-amber-900 uppercase">{selectedPayment.metadata?.bank_name || 'BELİRTİLMEDİ'}</p>
                                                </div>
                                            </div>
                                            {selectedPayment.bank_transfer_proof_url && (
                                                <div className="pt-4 border-t border-amber-200/50">
                                                    <a 
                                                        href={selectedPayment.bank_transfer_proof_url} 
                                                        target="_blank" 
                                                        className="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-amber-200 rounded-2xl text-[10px] font-black text-amber-900 uppercase hover:bg-amber-100 transition-all"
                                                    >
                                                        <ImageIcon className="w-4 h-4" /> Dekontu İncele
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedPayment.payment_method === 'TRIAL' && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                                            <Zap className="w-4 h-4 text-emerald-500" /> Ücretsiz Deneme Süreci
                                        </h4>
                                        <div className="bg-emerald-50/50 border-2 border-emerald-100/50 rounded-3xl p-8 space-y-6">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-emerald-800/60 uppercase">Kalan Süre</span>
                                                    <p className="text-xl font-black text-emerald-900">{getDaysLeft(selectedPayment.subscriptions?.current_period_end)} GÜN</p>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <span className="text-[9px] font-black text-emerald-800/60 uppercase">Bitiş Tarihi</span>
                                                    <p className="font-black text-emerald-900">{new Date(selectedPayment.subscriptions?.current_period_end).toLocaleDateString('tr-TR')}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white/60 rounded-xl border border-emerald-100/50 flex items-center gap-4">
                                                <AlertCircle className="w-5 h-5 text-emerald-600" />
                                                <p className="text-[10px] font-medium text-emerald-800 italic leading-relaxed">Bu işletme şu an ücretsiz deneme sürecindedir. Süre bitiminde ödeme yapması gerekecektir.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Audit Logs / Notes */}
                                {selectedPayment.metadata?.admin_note && (
                                    <div className="p-8 bg-blue-50/50 border-2 border-blue-100 rounded-3xl space-y-3">
                                        <span className="text-[9px] font-black text-blue-800 uppercase tracking-widest">İşlem Notu</span>
                                        <p className="text-sm font-medium text-blue-900 italic leading-relaxed">"{selectedPayment.metadata.admin_note}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-gray-50/80 border-t border-gray-100 flex gap-4">
                                <div className="flex-1 flex gap-4">
                                    {selectedPayment.status === 'PENDING' ? (
                                        <>
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleAction(selectedPayment.id, 'FAILED')}
                                                className="flex-1 py-4 bg-white border-2 border-red-100 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-red-600 transition-all shadow-sm"
                                            >
                                                Reddet
                                            </button>
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleAction(selectedPayment.id, 'SUCCESS')}
                                                className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                Onayla & Aktif Et
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`w-full py-4 text-center rounded-2xl font-black text-xs uppercase tracking-widest border-2 ${selectedPayment.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                            İŞLEM {selectedPayment.status === 'SUCCESS' ? 'ONAYLANMIŞTIR' : 'REDDEDİLMİŞTİR'}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleDeletePayment(selectedPayment.id)}
                                    className="w-14 h-14 bg-white shadow-sm border-2 border-gray-100 rounded-2xl text-red-100 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

