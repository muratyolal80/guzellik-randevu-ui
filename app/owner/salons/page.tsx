'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SalonDataService, SubscriptionService } from '@/services/db';
import { SalonDetail } from '@/types';
import {
    Plus,
    Store,
    MapPin,
    Phone,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    ChevronRight,
    Search,
    LayoutGrid,
    PowerOff,
    Ban,
    Trash2
} from 'lucide-react';
import Link from 'next/link';

type TabType = 'ACTIVE' | 'PASSIVE';

export default function OwnerSalonsPage() {
    const { user } = useAuth();
    const [salons, setSalons] = useState<SalonDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('ACTIVE');

    useEffect(() => {
        if (user) {
            fetchSalons();
            checkLimits();
        }
    }, [user]);

    const [limitStatus, setLimitStatus] = useState<{ allowed: boolean; message?: string }>({ allowed: true });

    const checkLimits = async () => {
        if (!user) return;
        try {
            const ownerSalons = await SalonDataService.getSalonsByOwner(user.id);
            if (ownerSalons.length > 0) {
                const res = await SubscriptionService.checkLimit(ownerSalons[0].id, 'branch');
                if (!res.allowed) {
                    let msg = "Mevcut paketinizin şube limitine ulaştınız.";
                    if (res.limit === -2) msg = "Deneme süreniz dolmuştur.";
                    setLimitStatus({ allowed: false, message: msg });
                }
            }
        } catch (e) {
            console.error("Limit check error:", e);
        }
    };

    const fetchSalons = async () => {
        try {
            setLoading(true);
            const data = await SalonDataService.getSalonsByOwner(user?.id!);
            setSalons(data);
        } catch (err) {
            console.error('Error fetching salons:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return { label: 'Sistemde Aktif', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 };
            case 'REJECTED':
                return { label: 'Reddedildi', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle };
            case 'REVISION_REQUESTED':
                return { label: 'Revizyon Gerekli', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertCircle };
            case 'SUSPENDED':
            case 'PASSIVE':
                return { label: 'Pasif', color: 'text-gray-600', bg: 'bg-gray-100', icon: Ban };
            case 'DELETED':
                return { label: 'Silindi', color: 'text-red-700', bg: 'bg-red-100', icon: Trash2 };
            case 'SUBMITTED':
                return { label: 'Onay Bekliyor', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle };
            default:
                return { label: 'Onay Bekliyor', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle };
        }
    };

    const handleSuspend = async (salonId: string) => {
        if (!confirm('Salonunuzu pasife almak istediğinize emin misiniz? (Mevcut aboneliğiniz de iptal edilecektir)')) return;
        try {
            await SalonDataService.suspendSalonAndCancelSubscription(salonId);
            fetchSalons();
        } catch (error: any) {
            alert('Hata: ' + error.message);
        }
    };

    const handleRequestActivation = async (salonId: string) => {
        if (!confirm('Salonunuzun tekrar aktif edilmesi için yöneticiye onay isteği gönderilecektir. Emin misiniz?')) return;
        try {
            await SalonDataService.submitForApproval(salonId);
            alert('Aktivasyon isteğiniz başarıyla gönderildi. Yönetici onayından sonra salonunuz aktif olacaktır.');
            fetchSalons();
        } catch (error: any) {
            alert('Hata: ' + error.message);
        }
    };

    const handleDelete = async (salonId: string) => {
        const confirmText = 'Bu salonu tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm veriler (personel, hizmetler, geçmiş randevular) silinecektir.';
        if (!confirm(confirmText)) return;

        const finalConfirm = prompt('Silmek için "SIL" yazın:');
        if (finalConfirm !== 'SIL') return;

        try {
            // We use hard delete as requested for "full silme"
            await SalonDataService.deleteSalon(salonId);
            alert('Salon başarıyla silindi.');
            fetchSalons();
        } catch (error: any) {
            console.error('Delete error:', error);
            alert('Silme işlemi sırasında bir hata oluştu: ' + error.message);
        }
    };

    // Filter salons based on active tab and exclude deleted ones
    const filteredSalons = salons.filter(salon => {
        if (salon.status === 'DELETED') return false;
        if (activeTab === 'ACTIVE') {
            return (salon.status as any) !== 'SUSPENDED' && (salon.status as any) !== 'PASSIVE';
        } else {
            return (salon.status as any) === 'SUSPENDED' || (salon.status as any) === 'PASSIVE';
        }
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tight">Salonlarım</h1>
                    <p className="text-text-secondary font-medium">Sahibi olduğunuz tüm işletmeleri buradan yönetebilirsiniz.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {!limitStatus.allowed && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg border border-red-100 animate-pulse">
                            {limitStatus.message}
                        </span>
                    )}
                    <Link 
                        href={limitStatus.allowed ? "/owner/onboarding" : "/owner/packages"} 
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm shadow-xl transition-all ${
                            limitStatus.allowed 
                            ? "bg-primary text-white shadow-primary/20 hover:bg-primary-hover" 
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        <Plus className="w-4 h-4" /> 
                        {limitStatus.allowed ? "Yeni Salon Ekle" : "Paketi Yükselt"}
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 backdrop-blur-sm rounded-2xl w-fit border border-gray-200">
                <button
                    onClick={() => setActiveTab('ACTIVE')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        activeTab === 'ACTIVE'
                            ? 'bg-white text-primary shadow-sm border border-gray-100'
                            : 'text-text-secondary hover:text-text-main'
                    }`}
                >
                    <CheckCircle2 className={`w-4 h-4 ${activeTab === 'ACTIVE' ? 'text-primary' : 'text-gray-400'}`} />
                    Aktif Salonlarım
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                        activeTab === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'
                    }`}>
                        {salons.filter(s => s.status !== 'SUSPENDED').length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('PASSIVE')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        activeTab === 'PASSIVE'
                            ? 'bg-white text-gray-700 shadow-sm border border-gray-100'
                            : 'text-text-secondary hover:text-text-main'
                    }`}
                >
                    <PowerOff className={`w-4 h-4 ${activeTab === 'PASSIVE' ? 'text-gray-700' : 'text-gray-400'}`} />
                    Pasif Salonlarım
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                        activeTab === 'PASSIVE' ? 'bg-gray-200 text-gray-700' : 'bg-gray-200 text-gray-500'
                    }`}>
                        {salons.filter(s => s.status === 'SUSPENDED').length}
                    </span>
                </button>
            </div>

            {/* Salons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredSalons.length > 0 ? (
                    filteredSalons.map((salon) => {
                        const status = getStatusInfo(salon.status || 'PENDING');
                        return (
                            <div key={salon.id} className="bg-white rounded-[32px] border border-border shadow-card overflow-hidden group hover:scale-[1.02] transition-all flex flex-col">
                                {/* Image section */}
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${salon.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop'})` }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute top-4 right-4">
                                        <div className={`px-4 py-1.5 rounded-full ${status.bg} ${status.color} border border-white/20 backdrop-blur-md shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-wider`}>
                                            <status.icon className="w-3 h-3" />
                                            {status.label}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">{salon.type_name}</p>
                                        <h3 className="text-xl font-black tracking-tight">{salon.name}</h3>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 flex-1 flex flex-col">
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 text-text-secondary text-sm font-medium">
                                            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">
                                                {salon.neighborhood ? `${salon.neighborhood}, ${salon.district_name}` : (salon.address || `${salon.district_name}, ${salon.city_name}`)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
                                            <Phone className="w-4 h-4" />
                                            <span>{salon.phone}</span>
                                        </div>
                                        {(salon.status === 'REJECTED' || salon.status === 'REVISION_REQUESTED') && salon.rejected_reason && (
                                            <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
                                                <p className="text-[10px] text-red-800 font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Yönetici Notu
                                                </p>
                                                <p className="text-xs text-red-600 font-bold leading-snug line-clamp-2">"{salon.rejected_reason}"</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-border mt-auto flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            {salon.status === 'SUSPENDED' ? (
                                                <button
                                                    onClick={() => handleRequestActivation(salon.id)}
                                                    className="flex-1 py-3 px-2 text-center bg-emerald-600 text-white font-black text-[9px] md:text-[10px] rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1"
                                                >
                                                    <CheckCircle2 className="w-3 h-3" /> Aktif Etme İsteği Gönder
                                                </button>
                                            ) : (
                                                <>
                                                    <Link
                                                        href={`/owner/salons/${salon.id}/edit`}
                                                        className="flex-1 py-3 text-center bg-gray-50 text-text-main font-black text-[10px] md:text-xs rounded-xl hover:bg-gray-100 transition-colors border border-border"
                                                    >
                                                        Düzenle
                                                    </Link>
                                                    <Link
                                                        href={`/owner/calendar?salonId=${salon.id}`}
                                                        className="flex-1 py-3 text-center bg-primary text-white font-black text-[10px] md:text-xs rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all"
                                                    >
                                                        Yönet
                                                    </Link>
                                                    <button
                                                        onClick={() => handleSuspend(salon.id)}
                                                        className="w-10 h-10 md:w-11 md:h-11 shrink-0 flex items-center justify-center bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors border border-border"
                                                        title="Salonu Pasife Al"
                                                    >
                                                        <PowerOff className="w-4 h-4 md:w-5 md:h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(salon.id)}
                                                        className="w-10 h-10 md:w-11 md:h-11 shrink-0 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                                                        title="Salonu Tamamen Sil"
                                                    >
                                                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 bg-white rounded-[40px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                            {activeTab === 'ACTIVE' ? <Store className="w-8 h-8" /> : <PowerOff className="w-8 h-8" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-main">
                                {activeTab === 'ACTIVE' ? "Henüz aktif bir salonunuz yok" : "Pasif salonunuz bulunmuyor"}
                            </h3>
                            <p className="text-text-secondary text-sm max-w-sm mx-auto">
                                {activeTab === 'ACTIVE' 
                                    ? "Hemen ilk salonunuzu ekleyerek randevu almaya başlayabilirsiniz." 
                                    : "Pasif hale getirilen salonlar burada listelenir."}
                            </p>
                        </div>
                        {activeTab === 'ACTIVE' && (
                            <Link href="/owner/onboarding" className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary-hover transition-all">
                                İlk Salonu Ekle
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
