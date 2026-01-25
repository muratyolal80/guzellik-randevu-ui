'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { SalonDataService, ServiceService, NotificationService } from '@/services/db';
import { SalonDetail, SalonServiceDetail } from '@/types';
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
    Camera
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Dynamic Map for details
import dynamic from 'next/dynamic';
const AdminSalonMap = dynamic(() => import('@/components/Admin/AdminSalonMap'), { ssr: false });

export default function AdminApprovalsPage() {
    const router = useRouter();
    const [salons, setSalons] = useState<SalonDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');

    // Detailed Review State
    const [selectedSalon, setSelectedSalon] = useState<SalonDetail | null>(null);
    const [salonServices, setSalonServices] = useState<SalonServiceDetail[]>([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        fetchSalons();
    }, []);

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

            // Simulation: Send notification to owner
            if (selectedSalon?.owner_id) {
                await NotificationService.sendNotification({
                    user_id: selectedSalon.owner_id,
                    title: 'İşletme Başvurusu Onaylandı!',
                    message: `${selectedSalon.name} isimli işletmeniz onaylanmıştır. Artık şubeyi yönetmeye başlayabilirsiniz.`,
                    type: 'SYSTEM',
                    action_url: '/owner/dashboard'
                });
            }

            alert('Salon başarıyla onaylandı!');
        } catch (err) {
            alert('Onay işlemi sırasında hata oluştu.');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Reddetme nedeni (Düzeltilmesi gerekenleri belirtin):');
        if (reason === null || reason.trim() === '') return;
        try {
            await SalonDataService.rejectSalon(id, reason);
            setSalons(prev => prev.map(s => s.id === id ? { ...s, status: 'REJECTED', rejected_reason: reason } : s));
            if (selectedSalon?.id === id) setSelectedSalon(prev => prev ? { ...prev, status: 'REJECTED', rejected_reason: reason } : null);

            // Simulation: Send notification to owner
            if (selectedSalon?.owner_id) {
                await NotificationService.sendNotification({
                    user_id: selectedSalon.owner_id,
                    title: 'İşletme Başvurusu Reddedildi',
                    message: `${selectedSalon.name} başvurusu şu nedenle reddedildi: ${reason}. Lütfen gerekli düzeltmeleri yapıp tekrar onaya gönderin.`,
                    type: 'SYSTEM',
                    action_url: '/owner/onboarding'
                });
            }

            alert('Başvuru reddedildi.');
        } catch (err) {
            alert('Red işlemi sırasında hata oluştu.');
        }
    };

    const filteredSalons = salons.filter(s => {
        if (filter === 'ALL') return true;
        if (filter === 'PENDING') return s.status === 'SUBMITTED' || s.status === 'PENDING' as any;
        return s.status === filter;
    });

    return (
        <AdminLayout>
            <div className="space-y-8 pb-20 relative min-h-screen">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-text-main tracking-tight">Salon Onayları</h2>
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
                        {/* Filters Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-[24px] border border-border shadow-sm">
                            <div className="flex flex-wrap gap-1">
                                {[
                                    { id: 'PENDING', label: 'Başvurular', icon: Clock, count: salons.filter(s => s.status === 'SUBMITTED').length },
                                    { id: 'APPROVED', label: 'Onaylı', icon: CheckCircle, count: salons.filter(s => s.status === 'APPROVED').length },
                                    { id: 'REJECTED', label: 'Reddedilen', icon: XCircle, count: salons.filter(s => s.status === 'REJECTED').length },
                                    { id: 'ALL', label: 'Tümü', icon: Filter, count: salons.length }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setFilter(tab.id as any)}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${filter === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:bg-gray-50'}`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-muted'}`}>{tab.count}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full sm:w-64 px-2">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input placeholder="Salon adı ile ara..." className="w-full h-11 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                            </div>
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
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">Veriler Senkronize Ediliyor...</span>
                                                    </div>
                                                </td>
                                            </tr>
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
                                        <p className="text-sm font-bold text-text-secondary leading-relaxed">{selectedSalon.address}</p>
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

                                        <div className="bg-amber-50 rounded-[28px] p-6 border border-amber-100 flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
                                                <Info className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-amber-800 uppercase">Önemli Not</p>
                                                <p className="text-xs font-medium text-amber-700/80 leading-relaxed">Bu salon henüz onaylanmadığı için kullanıcılar tarafından görünemez. Onay sonrası tüm veriler canlıya alınacaktır.</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Drawer Footer - Action Bar */}
                            <div className="px-8 py-8 border-t border-border bg-gray-50/50 flex justify-between items-center gap-4">
                                <button
                                    onClick={() => handleReject(selectedSalon.id)}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-red-600 border-2 border-red-100 hover:border-red-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                                >
                                    <XCircle className="w-5 h-5" /> Başvuruyu Reddet
                                </button>

                                <div className="flex gap-4">
                                    <Link
                                        href={`/salon/${selectedSalon.id}`}
                                        target="_blank"
                                        className="flex items-center gap-3 px-8 py-4 bg-white text-text-main border-2 border-border hover:border-text-main rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                                    >
                                        <ExternalLink className="w-5 h-5 text-text-muted" /> Canlı Önizleme
                                    </Link>

                                    {(selectedSalon.status === 'SUBMITTED' || selectedSalon.status === 'REJECTED') && (
                                        <button
                                            onClick={() => handleApprove(selectedSalon.id)}
                                            className="flex items-center gap-3 px-12 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <CheckCircle className="w-5 h-5" /> Salonu Onayla
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
        APPROVED: { label: 'ONAYLANDI', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        REJECTED: { label: 'REDDEDİLDİ', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        SUSPENDED: { label: 'ASKIDA', icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
    };
    const s = statusMap[status || 'DRAFT'];
    if (!s) return null;
    return (
        <div className="flex flex-col gap-1">
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${s.bg} ${s.color} border ${s.border} shadow-sm flex items-center gap-2 w-fit`}>
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
            </span>
            {status === 'REJECTED' && reason && (
                <span className="text-[10px] text-red-500 font-bold max-w-[150px] italic pl-2">"{reason}"</span>
            )}
        </div>
    );
}
