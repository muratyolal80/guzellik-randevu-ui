'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { SalonDataService, ServiceService, NotificationService, MasterDataService } from '@/services/db';
import { SalonDetail, SalonServiceDetail } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { Breadcrumbs } from '@/components/Admin/Breadcrumbs';
import {
    Eye,
    Store,
    AlertCircle,
    ChevronDown,
    Filter,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Check,
    X,
    MoreVertical,
    ExternalLink,
    Info,
    MapPin,
    Phone,
    ShieldCheck,
    Calendar,
    Star,
    ChevronRight,
    Map as MapIcon,
    Camera,
    PenLine,
    Trash2,
    PowerOff,
    ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Dynamic Map for details
import dynamic from 'next/dynamic';
const AdminSalonMap = dynamic(() => import('@/components/Admin/AdminSalonMap'), { ssr: false });

export default function AdminApprovalsPage() {
    const { showToast } = useToast();
    const router = useRouter();
    const [salons, setSalons] = useState<SalonDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT' | 'SUSPENDED' | 'ALL'>('PENDING');

    // Advanced Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');

    const [cities, setCities] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [salonTypes, setSalonTypes] = useState<any[]>([]);

    // Detailed Review State
    const [selectedSalon, setSelectedSalon] = useState<SalonDetail | null>(null);
    const [salonServices, setSalonServices] = useState<SalonServiceDetail[]>([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        fetchSalons();
        fetchMasterData();
    }, []);

    useEffect(() => {
        if (selectedCity) {
            fetchDistricts(selectedCity);
        } else {
            setDistricts([]);
            setSelectedDistrict('');
        }
    }, [selectedCity]);

    const fetchMasterData = async () => {
        try {
            const [cityData, typeData] = await Promise.all([
                MasterDataService.getCities(),
                MasterDataService.getSalonTypes()
            ]);
            setCities(cityData);
            setSalonTypes(typeData);
        } catch (err) {
            console.error('Master data fetch error:', err);
        }
    };

    const fetchDistricts = async (cityId: string) => {
        try {
            const data = await MasterDataService.getDistrictsByCity(cityId);
            setDistricts(data);
        } catch (err) {
            console.error('District fetch error:', err);
        }
    };

    const fetchSalons = async () => {
        try {
            setLoading(true);
            const data = await SalonDataService.getAllSalonsForAdmin();
            setSalons(data);
        } catch (err) {
            console.error('Error fetching salons for approval:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReview = async (salon: SalonDetail) => {
        setSelectedSalon(salon);
        setIsReviewOpen(true);
        setReviewLoading(true);
        try {
            const services = await ServiceService.getServicesBySalon(salon.id);
            setSalonServices(services);
        } catch (err) {
            console.error('Error fetching salon services for review:', err);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Bu salonu onaylamak istediğinize emin misiniz?')) return;
        try {
            await SalonDataService.approveSalon(id);
            setSalons(prev => prev.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s));
            if (selectedSalon?.id === id) setSelectedSalon(prev => prev ? { ...prev, status: 'APPROVED' } : null);

            // Send notification to owner (non-blocking)
            if (selectedSalon?.owner_id) {
                try {
                    await NotificationService.sendNotification({
                        user_id: selectedSalon.owner_id,
                        title: 'İşletme Başvurusu Onaylandı!',
                        content: `${selectedSalon.name} isimli işletmeniz onaylanmıştır. Artık şubeyi yönetmeye başlayabilirsiniz.`,
                        type: 'SYSTEM',
                        link: '/owner/dashboard'
                    });
                } catch (notifErr) {
                    console.error('Bildirim gönderilemedi:', notifErr);
                }
            }

            showToast('Salon başarıyla onaylandı!', 'success');
        } catch (err) {
            console.error('Salon onaylama hatası:', err);
            showToast('Onay işlemi sırasında hata oluştu.', 'error');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Reddetme nedeni (Düzeltilmesi gerekenleri belirtin):');
        if (reason === null || reason.trim() === '') return;
        try {
            await SalonDataService.rejectSalon(id, reason);
            setSalons(prev => prev.map(s => s.id === id ? { ...s, status: 'REJECTED', rejected_reason: reason } : s));
            if (selectedSalon?.id === id) setSelectedSalon(prev => prev ? { ...prev, status: 'REJECTED', rejected_reason: reason } : null);

            // Send notification to owner (non-blocking)
            if (selectedSalon?.owner_id) {
                try {
                    await NotificationService.sendNotification({
                        user_id: selectedSalon.owner_id,
                        title: 'İşletme Başvurusu Reddedildi',
                        content: `${selectedSalon.name} başvurusu şu nedenle reddedildi: ${reason}.`,
                        type: 'SYSTEM',
                        link: '/owner/onboarding'
                    });
                } catch (notifErr) {
                    console.error('Bildirim gönderilemedi:', notifErr);
                }
            }

            showToast('Başvuru reddedildi.', 'success');
        } catch (err) {
            console.error('Red işlemi hatası:', err);
            showToast('Red işlemi sırasında hata oluştu.', 'error');
        }
    };

    const handleRequestRevision = async (id: string) => {
        const reason = prompt('Revizyon isteği nedeni (Sahibinin neleri düzeltmesi gerektiğini detaylıca yazın):');
        if (reason === null || reason.trim() === '') return;
        try {
            await SalonDataService.requestRevision(id, reason);
            setSalons(prev => prev.map(s => s.id === id ? { ...s, status: 'REVISION_REQUESTED', rejected_reason: reason } : s));
            if (selectedSalon?.id === id) setSelectedSalon(prev => prev ? { ...prev, status: 'REVISION_REQUESTED', rejected_reason: reason } : null);

            // Send notification to owner (non-blocking)
            if (selectedSalon?.owner_id) {
                try {
                    await NotificationService.sendNotification({
                        user_id: selectedSalon.owner_id,
                        title: 'İşletme İçin Revizyon İstendi',
                        content: `${selectedSalon.name} başvurusu için şu düzeltmeler istendi: ${reason}. Lütfen panelden güncelleyip tekrar onaya gönderin.`,
                        type: 'SYSTEM',
                        link: '/owner/settings'
                    });
                } catch (notifErr) {
                    console.error('Bildirim gönderilemedi:', notifErr);
                }
            }

<<<<<<< HEAD
=======
            // Send Notification
            if (selectedSalon?.owner_id) {
                try {
                    await NotificationService.sendNotification({
                        user_id: selectedSalon.owner_id,
                        title: 'Salon Bilgileriniz İçin Revizyon İstendi',
                        content: `"${selectedSalon.name}" işletmeniz için şu nedenle revizyon istendi: ${reason}. Lütfen bilgilerinizi güncelleyip tekrar onaya gönderin.`,
                        type: 'SYSTEM',
                        link: '/owner/salons'
                    });
                } catch (notifErr) {
                    console.error('Notification error:', notifErr);
                }
            }

>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
            showToast('Revizyon isteği gönderildi.', 'success');
        } catch (err) {
            console.error('Revizyon isteği hatası:', err);
            showToast('İşlem sırasında hata oluştu.', 'error');
        }
    };

    const handleDeactivate = async (id: string) => {
        if (!confirm('Bu salonu pasife almak istediğinize emin misiniz?')) return;
        try {
            await SalonDataService.deactivateSalon(id);
            setSalons(prev => prev.map(s => s.id === id ? { ...s, status: 'PASSIVE' } : s));
            if (selectedSalon?.id === id) setSelectedSalon(prev => prev ? { ...prev, status: 'PASSIVE' } : null);
            showToast('Salon pasif duruma getirildi.', 'success');
        } catch (err) {
            console.error('Pasife alma hatası:', err);
            showToast('Hata oluştu.', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('DİKKAT: Bu salonu silmek istediğinize emin misiniz?')) return;
        try {
            await SalonDataService.softDeleteSalon(id);
            setSalons(prev => prev.map(s => s.id === id ? { ...s, status: 'DELETED' } : s));
            if (selectedSalon?.id === id) setSelectedSalon(prev => prev ? { ...prev, status: 'DELETED' } : null);
            showToast('Salon silindi (Durumu DELETED olarak güncellendi).', 'success');
        } catch (err) {
            console.error('Silme hatası:', err);
            showToast('Hata oluştu.', 'error');
        }
    };

    const filteredSalons = salons.filter(s => {
        // Status Filter
        if (filter !== 'ALL') {
            const isPending = s.status === 'SUBMITTED' || s.status === 'PENDING' as any || s.status === 'REVISION_REQUESTED';
            if (filter === 'PENDING' && !isPending) return false;
            if (filter === 'APPROVED' && s.status !== 'APPROVED') return false;
            if (filter === 'REJECTED' && s.status !== 'REJECTED') return false;
            if (filter === 'DRAFT' && s.status !== 'DRAFT') return false;
            if (filter === 'SUSPENDED' && s.status !== 'SUSPENDED') return false;
        }

        // Search Query (Expanded: Name, Phone, OwnerID)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = s.name.toLowerCase().includes(query);
            const matchesPhone = s.phone?.toLowerCase().includes(query);
            const matchesOwner = s.owner_id?.toLowerCase().includes(query);
            if (!matchesName && !matchesPhone && !matchesOwner) return false;
        }

        // City Filter
        if (selectedCity) {
            const city = cities.find(c => c.id === selectedCity);
            if (city && s.city_name !== city.name) return false;
        }

        // District Filter
        if (selectedDistrict) {
            const district = districts.find(d => d.id === selectedDistrict);
            if (district && s.district_name !== district.name) return false;
        }

        // Status Filter (Advanced)
        if (selectedStatus && s.status !== selectedStatus) return false;

        // Plan Filter
        if (selectedPlan && s.plan !== selectedPlan) return false;

        // Type Filter
        if (selectedType) {
            const type = salonTypes.find(t => t.id === selectedType);
            if (type && s.type_name !== type.name) return false;
        }

        return true;
    });

    return (
        <AdminLayout>
            <div className="space-y-8 pb-20 relative min-h-screen p-8 max-w-[1600px] mx-auto">
                <Breadcrumbs items={[{ label: 'Salon Onayları' }]} />
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-text-main tracking-tight">Salon Yönetimi</h2>
                        <p className="text-text-secondary font-medium mt-1">Sisteme yeni kaydedilen şubeleri inceleyin ve onaylayın.</p>
                    </div>
                    <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span className="text-xs font-black text-primary uppercase">{salons.filter(s => s.status === 'SUBMITTED').length} Bekleyen Başvuru</span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* List Section */}
                    <div className="lg:col-span-12 space-y-6">
                        {/* Status Tabs Header */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {[
                                { id: 'PENDING', label: 'Başvurular', icon: Clock, count: salons.filter(s => s.status === 'SUBMITTED' || s.status === 'REVISION_REQUESTED').length },
                                { id: 'APPROVED', label: 'Onaylı', icon: CheckCircle, count: salons.filter(s => s.status === 'APPROVED').length },
                                { id: 'REJECTED', label: 'Reddedilen', icon: XCircle, count: salons.filter(s => s.status === 'REJECTED').length },
                                { id: 'DRAFT', label: 'Taslaklar', icon: MoreVertical, count: salons.filter(s => s.status === 'DRAFT').length },
                                { id: 'SUSPENDED', label: 'Askıda', icon: AlertCircle, count: salons.filter(s => s.status === 'SUSPENDED').length },
                                { id: 'ALL', label: 'Tümü', icon: Filter, count: salons.length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id as any)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all border ${filter === tab.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-text-secondary border-border hover:bg-gray-50'}`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-muted'}`}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Advanced Filters Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 bg-white p-6 rounded-[32px] border border-border shadow-sm">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Salon adı ile ara..." 
                                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                                />
                            </div>
                            
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted z-10" />
                                <select 
                                    value={selectedType}
                                    onChange={e => setSelectedType(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Tüm Salon Tipleri</option>
                                    {salonTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            </div>

                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted z-10" />
                                <select 
                                    value={selectedCity}
                                    onChange={e => setSelectedCity(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Tüm İller</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            </div>

                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted z-10" />
                                <select 
                                    value={selectedStatus}
                                    onChange={e => setSelectedStatus(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Tüm Durumlar</option>
                                    <option value="SUBMITTED">Onay Bekliyor</option>
                                    <option value="APPROVED">Onaylı</option>
                                    <option value="REVISION_REQUESTED">Revizyon İstendi</option>
                                    <option value="REJECTED">Reddedildi</option>
                                    <option value="PASSIVE">Pasif</option>
                                    <option value="DELETED">Silinmiş</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            </div>

                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted z-10" />
                                <select 
                                    value={selectedPlan}
                                    onChange={e => setSelectedPlan(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Tüm Planlar</option>
                                    <option value="STARTER">Starter</option>
                                    <option value="PRO">Pro</option>
                                    <option value="BUSINESS">Business</option>
                                    <option value="ELITE">Elite</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            </div>
                        </div>

                        {/* Summary Bar */}
                        <div className="flex justify-between items-center px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                    <span className="text-sm font-black text-text-main">{filteredSalons.length} Salon Listeleniyor</span>
                                </div>
                                {(selectedCity || selectedType || searchQuery) && (
                                    <div className="flex gap-2">
                                        {selectedCity && (
                                            <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                                {cities.find(c => c.id === selectedCity)?.name}
                                                {selectedDistrict && ` / ${districts.find(d => d.id === selectedDistrict)?.name}`}
                                            </span>
                                        )}
                                        {selectedType && (
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                                {salonTypes.find(t => t.id === selectedType)?.name}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCity('');
                                    setSelectedDistrict('');
                                    setSelectedType('');
                                    setSelectedStatus('');
                                    setSelectedPlan('');
                                    setFilter('ALL');
                                }}
                                className="flex items-center gap-2 text-[10px] font-black text-text-muted hover:text-primary transition-colors tracking-widest uppercase bg-white px-4 py-2 rounded-xl border border-border shadow-sm"
                            >
                                <X className="w-3 h-3" /> Filtreleri Temizle
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-[40px] border border-border shadow-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-[10px] uppercase font-black text-text-muted tracking-widest border-b border-border">
                                            <th className="px-8 py-6">Kayıt / Salon</th>
                                            <th className="px-8 py-6">Şehir / Lokasyon</th>
                                            <th className="px-8 py-6">İletişim</th>
                                            <th className="px-8 py-6">Durum</th>
                                            <th className="px-8 py-6 text-right">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loading ? (
<<<<<<< HEAD
                                            Array.from({ length: 5 }).map((_, index) => (
                                                <tr key={`skeleton-${index}`} className="border-b border-gray-50">
                                                    <td className="px-8 py-7">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-2xl flex-shrink-0 bg-gray-200 animate-pulse" />
                                                            <div className="space-y-2">
                                                                <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
                                                                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7">
                                                        <div className="space-y-2">
                                                            <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
                                                            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7">
                                                        <div className="space-y-2">
                                                            <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
                                                            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7">
                                                        <div className="h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
                                                    </td>
                                                    <td className="px-8 py-7 text-right">
                                                        <div className="h-10 w-24 rounded-xl ml-auto bg-gray-200 animate-pulse" />
                                                    </td>
                                                </tr>
                                            ))
=======
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">Veriler Senkronize Ediliyor...</span>
                                                    </div>
                                                </td>
                                            </tr>
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
                                        ) : filteredSalons.length > 0 ? (
                                            filteredSalons.map((salon) => (
                                                <tr key={salon.id} className={`hover:bg-primary/[0.02] transition-colors group cursor-pointer ${selectedSalon?.id === salon.id ? 'bg-primary/[0.04]' : ''}`} onClick={() => handleOpenReview(salon)}>
                                                    <td className="px-8 py-7">
                                                        <div className="flex items-center gap-5">
                                                            <div className="relative">
                                                                <div className="w-14 h-14 rounded-2xl bg-cover bg-center border-2 border-white shadow-md" style={{ backgroundImage: `url(${salon.image})` }}></div>
                                                                {salon.status === 'SUBMITTED' && <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full border-4 border-white animate-pulse"></span>}
                                                            </div>
                                                            <div>
                                                                <p className="text-base font-black text-text-main group-hover:text-primary transition-colors">{salon.name}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[9px] font-black text-text-muted uppercase tracking-tighter">{salon.type_name}</span>
                                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                                                                        salon.plan === 'ELITE' ? 'bg-purple-100 text-purple-700' :
                                                                        salon.plan === 'BUSINESS' ? 'bg-indigo-100 text-indigo-700' :
                                                                        salon.plan === 'PRO' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-text-muted'
                                                                    }`}>{salon.plan || 'STARTER'}</span>
                                                                    <span className="text-[10px] font-bold text-text-muted italic">{new Date(salon.created_at || '').toLocaleDateString('tr-TR')}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5 text-sm font-black text-text-main">
                                                                <MapPin className="w-3.5 h-3.5 text-text-muted" /> {salon.city_name}
                                                            </div>
                                                            <span className="text-xs font-bold text-text-secondary pl-5">{salon.district_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
                                                            <Phone className="w-3.5 h-3.5 text-text-muted" /> {salon.phone || 'Belirtilmedi'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7">
                                                        <StatusBadge status={salon.status} reason={salon.rejected_reason} />
                                                    </td>
                                                    <td className="px-8 py-7 text-right">
                                                        <div className="flex justify-end gap-3" onClick={e => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => handleOpenReview(salon)}
                                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-text-secondary hover:bg-primary hover:text-white transition-all shadow-sm border border-border/50"
                                                            >
                                                                <ChevronRight className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-32 text-center text-text-muted italic">
                                                    <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                    Gösterilecek salon bulunamadı.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Review Drawer / Overlay */}
                {isReviewOpen && selectedSalon && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <div className="absolute inset-0 bg-text-main/40 backdrop-blur-sm" onClick={() => setIsReviewOpen(false)}></div>

                        <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">

                            {/* Drawer Header */}
                            <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-text-main">{selectedSalon.name}</h3>
                                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">BAŞVURU İNCELEMESİ</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsReviewOpen(false)} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center transition-colors border border-transparent hover:border-border">
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            {/* Drawer Body - Scrollable */}
                            <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10">

                                {/* Info Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-50 rounded-[32px] p-6 border border-border/50 space-y-3">
                                        <div className="flex items-center gap-2 text-text-muted">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">KAYIT TARİHİ</span>
                                        </div>
                                        <p className="text-lg font-black text-text-main">{new Date(selectedSalon.created_at || '').toLocaleDateString('tr-TR')}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-[32px] p-6 border border-border/50 space-y-3 md:col-span-2">
                                        <div className="flex items-center gap-2 text-text-muted">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">LOKASYON BİLGİSİ</span>
                                        </div>
                                        <p className="text-lg font-black text-text-main">{selectedSalon.city_name}, {selectedSalon.district_name}</p>
                                        <p className="text-sm font-bold text-text-secondary leading-relaxed">
                                            {(selectedSalon.neighborhood || selectedSalon.street || selectedSalon.building_no)
                                                ? `${selectedSalon.neighborhood ? `${selectedSalon.neighborhood}, ` : ''}${selectedSalon.street ? `${selectedSalon.street} No:${selectedSalon.building_no}` : ''}`
                                                : selectedSalon.address}
                                        </p>
                                    </div>
                                </div>

                                {/* Deep Details Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                                    {/* Map & Visuals */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                            <MapIcon className="w-4 h-4" /> KONUM VE HARİTA
                                        </h4>
                                        <div className="h-[250px] rounded-[32px] overflow-hidden border-2 border-border shadow-inner relative group">
                                            <AdminSalonMap
                                                center={[selectedSalon.geo_latitude || 41.0082, selectedSalon.geo_longitude || 28.9784]}
                                                markerPosition={selectedSalon.geo_latitude && selectedSalon.geo_longitude ? { lat: selectedSalon.geo_latitude, lng: selectedSalon.geo_longitude } : null}
                                            />
                                            <div className="absolute inset-x-4 bottom-4 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[9px] font-black border border-border shadow-sm">LAT: {selectedSalon.geo_latitude}</div>
                                                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[9px] font-black border border-border shadow-sm">LNG: {selectedSalon.geo_longitude}</div>
                                            </div>
                                        </div>

                                        <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 pt-4">
                                            <Camera className="w-4 h-4" /> PROFİL GÖRSELİ
                                        </h4>
                                        <div className="aspect-video rounded-[32px] bg-cover bg-center border-2 border-border/50 shadow-md" style={{ backgroundImage: `url(${selectedSalon.image})` }}></div>
                                    </div>

                                    {/* Services & Offerings */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Star className="w-4 h-4" /> TANIMLANAN HİZMETLER ({salonServices.length})
                                        </h4>
                                        <div className="bg-gray-50 rounded-[32px] p-8 border border-border/50 space-y-6 max-h-[460px] overflow-y-auto no-scrollbar">
                                            {reviewLoading ? (
                                                <p className="text-center py-10 italic text-text-muted">Hizmetler taranıyor...</p>
                                            ) : salonServices.length > 0 ? (
                                                salonServices.map((service, i) => (
                                                    <div key={i} className="flex justify-between items-center group">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-black text-text-main group-hover:text-primary transition-colors">{service.service_name}</p>
                                                            <span className="text-[10px] font-bold text-text-muted uppercase">{service.category_name} • {service.duration_min} dk</span>
                                                        </div>
                                                        <span className="text-sm font-black text-primary bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10">{service.price} ₺</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 space-y-2 opacity-50">
                                                    <AlertCircle className="w-8 h-8 mx-auto text-text-muted" />
                                                    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Henüz hizmet eklenmemiş</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-amber-50 rounded-[28px] p-6 border border-amber-100 space-y-4">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
                                                    <ShieldCheck className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-amber-800 uppercase">Onay Öncesi Kontrol Listesi</p>
                                                    <p className="text-[10px] font-medium text-amber-700/80 leading-relaxed italic">Onaylamadan önce bu kriterleri gözden geçirin.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 pl-2">
                                                <CheckListItem label="Profil resmi yeterli ve profesyonel mi?" checked={!!selectedSalon.image} />
                                                <CheckListItem label="Hizmet tanımlamaları yapılmış mı?" checked={salonServices.length > 0} />
                                                <CheckListItem label="Adres ve konum bilgileri tutarlı mı?" checked={!!selectedSalon.address && !!selectedSalon.geo_latitude} />
                                                <CheckListItem label="İsim ve kategori uyumlu mu?" checked={true} />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Drawer Footer - Action Bar */}
                            <div className="px-8 py-8 border-t border-border bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReject(selectedSalon.id)}
                                        className="flex items-center gap-3 px-6 py-4 bg-white text-red-600 border-2 border-red-100 hover:border-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                    >
                                        <XCircle className="w-4 h-4" /> Reddet
                                    </button>
                                    {selectedSalon.status !== 'DELETED' && (
                                        <button
                                            onClick={() => handleDelete(selectedSalon.id)}
                                            className="flex items-center gap-3 px-4 py-4 bg-white text-gray-400 border-2 border-gray-100 hover:text-red-700 hover:border-red-200 rounded-2xl font-black text-[10px] uppercase transition-all shadow-sm"
                                            title="Salonu Sil"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}

                                    <Link
                                        href={`/admin/finance/purchase`}
                                        className="flex items-center gap-3 px-6 py-4 bg-white text-emerald-600 border-2 border-emerald-100 hover:border-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                    >
                                        <ShoppingCart className="w-4 h-4" /> Paket Satın Al
                                    </Link>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    {selectedSalon.status === 'APPROVED' && (
                                        <button
                                            onClick={() => handleDeactivate(selectedSalon.id)}
                                            className="flex items-center gap-3 px-6 py-4 bg-white text-gray-600 border-2 border-border hover:border-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                        >
                                            <PowerOff className="w-4 h-4" /> Pasife Al
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleRequestRevision(selectedSalon.id)}
                                        className="flex items-center gap-3 px-6 py-4 bg-white text-amber-600 border-2 border-amber-100 hover:border-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                    >
                                        <AlertCircle className="w-4 h-4" /> Revizyon İste
                                    </button>

                                    <Link
                                        href={`/admin/salons/${selectedSalon.id}/edit`}
                                        className="flex items-center gap-3 px-6 py-4 bg-white text-blue-600 border-2 border-blue-100 hover:border-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                    >
                                        <PenLine className="w-4 h-4" /> Bilgileri Düzenle
                                    </Link>

                                    <Link
                                        href={`/salon/${selectedSalon.id}`}
                                        target="_blank"
                                        className="flex items-center gap-3 px-6 py-4 bg-white text-text-main border-2 border-border hover:border-text-main rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                    >
                                        <ExternalLink className="w-4 h-4 text-text-muted" /> Önizleme
                                    </Link>

                                    {(selectedSalon.status === 'SUBMITTED' || selectedSalon.status === 'REJECTED' || selectedSalon.status === 'REVISION_REQUESTED') && (
                                        <button
                                            onClick={() => handleApprove(selectedSalon.id)}
                                            className="flex items-center gap-3 px-10 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Onayla
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function StatusBadge({ status, reason }: { status: any, reason?: string }) {
    const statusMap: Record<string, any> = {
        DRAFT: { label: 'TASLAK', icon: MoreVertical, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
        SUBMITTED: { label: 'ONAY BEKLİYOR', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
        REVISION_REQUESTED: { label: 'REVİZYON İSTENDİ', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
        APPROVED: { label: 'ONAYLANDI', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        REJECTED: { label: 'REDDEDİLDİ', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        SUSPENDED: { label: 'ASKIDA', icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        PASSIVE: { label: 'PASİF', icon: PowerOff, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
        DELETED: { label: 'SİLİNDİ', icon: Trash2, color: 'text-red-800', bg: 'bg-red-50', border: 'border-red-300' }
    };
    const s = statusMap[status || 'DRAFT'];
    if (!s) return null;
    return (
        <div className="flex flex-col gap-1">
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${s.bg} ${s.color} border ${s.border} shadow-sm flex items-center gap-2 w-fit`}>
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
            </span>
            {(status === 'REJECTED' || status === 'REVISION_REQUESTED') && reason && (
                <span className="text-[10px] text-red-500 font-bold max-w-[150px] leading-tight mt-1 opacity-80 pl-2">"{reason}"</span>
            )}
        </div>
    );
}

function CheckListItem({ label, checked }: { label: string, checked: boolean }) {
    return (
        <div className="flex items-center gap-2">
            {checked ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className={`text-[11px] font-bold ${checked ? 'text-text-main' : 'text-text-muted'}`}>{label}</span>
        </div>
    );
}
