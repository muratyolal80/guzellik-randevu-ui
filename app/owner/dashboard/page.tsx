'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SalonDataService } from '@/services/db';
import { supabase } from '@/lib/supabase';
import {
    Users,
    Calendar,
    TrendingUp,
    Clock,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    XCircle,
    UserPlus,
    Activity,
    ChevronRight,
    Search,
    Store,
    LayoutGrid,
    ChevronDown,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActiveSalon } from '@/context/ActiveSalonContext';

export default function OwnerDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const { setActiveSalon } = useActiveSalon();
    const [salons, setSalons] = useState<any[]>([]);
    const [salon, setSalon] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        todayCount: 0,
        todayRevenue: 0,
        weeklyOccupancy: 0,
        activeStaff: 0
    });
    const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
    const [isSalonSelectorOpen, setIsSalonSelectorOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const salonsData = await SalonDataService.getSalonsByOwner(user?.id!);
            setSalons(salonsData);

            if (salonsData.length === 0) {
                router.push('/owner/onboarding');
                return;
            }

            // Gate Logic: Check Active Salon
            const savedSalonId = localStorage.getItem(`active_salon_${user?.id}`);
            let current = salonsData.find(s => s.id === savedSalonId);

            if (!current && salonsData.length === 1) {
                current = salonsData[0];
                setActiveSalon(current);
            } else if (!current) {
                router.push('/owner/branches/select');
                return;
            }

            // Gate Logic: Check Status
            if (current.status !== 'APPROVED') {
                setActiveSalon(current);
                router.push('/owner/branches/pending');
                return;
            }

            setSalon(current);
            setActiveSalon(current); // Sync context
            await fetchSalonStats(current.id);
        } catch (err) {
            console.error('Dashboard verisi çekilirken hata:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalonStats = async (salonId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const [apptsResponse, staffResponse] = await Promise.all([
            supabase
                .from('appointments')
                .select(`
                    *,
                    service:salon_services(price, duration_min, global_service:global_services(name)),
                    staff:staff(name, photo)
                `)
                .eq('salon_id', salonId)
                .gte('start_time', `${today}T00:00:00Z`)
                .order('start_time', { ascending: true }),
            supabase
                .from('staff')
                .select('id, name')
                .eq('salon_id', salonId)
                .eq('is_active', true)
        ]);

        if (apptsResponse.data) {
            const todayAppts = apptsResponse.data.filter(a => a.start_time.startsWith(today));
            const revenue = todayAppts.reduce((sum, a) => sum + (a.service?.price || 0), 0);

            setStats({
                todayCount: todayAppts.length,
                todayRevenue: revenue,
                weeklyOccupancy: 0,
                activeStaff: staffResponse.data?.length || 0
            });

            setRecentAppointments(apptsResponse.data.slice(0, 5));
        }
    };

    const switchSalon = async (selectedSalon: any) => {
        setSalon(selectedSalon);
        setIsSalonSelectorOpen(false);
        await fetchSalonStats(selectedSalon.id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!salon) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
                    <Store className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-black text-text-main mb-2">Salon Bulunamadı</h1>
                <p className="text-text-secondary mb-8">Henüz yöneticisi olduğunuz bir salon kaydı bulunmuyor.</p>
                <Link href="/owner/onboarding" className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg">
                    Yeni Salon Oluştur
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {salon && salon.status !== 'APPROVED' && (
                <div className={`p-4 rounded-3xl flex items-center justify-between gap-4 border ${salon.status === 'REJECTED' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                    <div className="flex items-center gap-3">
                        {salon.status === 'REJECTED' ? <XCircle className="w-5 h-5 text-red-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
                        <div className="text-sm font-bold">
                            {salon.status === 'REJECTED'
                                ? 'Salon başvurunuz reddedildi. Neden: ' + (salon.rejected_reason || 'Belirtilmedi')
                                : 'Salonunuz şu an onay bekliyor. Onaylandıktan sonra müşterilere görünür olacaktır.'}
                        </div>
                    </div>
                    <Link href="/owner/salons" className="px-4 py-2 bg-white text-xs font-bold rounded-xl shadow-sm border border-current hover:bg-gray-50 transition-all uppercase">Detayları Gör</Link>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="relative">
                    <div
                        onClick={() => salons.length > 1 && setIsSalonSelectorOpen(!isSalonSelectorOpen)}
                        className={`group flex items-center gap-4 cursor-pointer p-2 -m-2 rounded-2xl transition-all ${salons.length > 1 ? 'hover:bg-gray-50' : ''}`}
                    >
                        <div className="w-16 h-16 rounded-[22px] bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/5">
                            <Store className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-4xl font-black text-text-main tracking-tight leading-none">{salon.name}</h1>
                                {salons.length > 1 && <ChevronDown className={`w-6 h-6 text-text-muted transition-transform ${isSalonSelectorOpen ? 'rotate-180' : ''}`} />}
                            </div>
                            <p className="text-text-secondary font-medium flex items-center gap-2">
                                <Activity className="w-4 h-4 text-green-500" /> Şubenizin bugünkü performans özeti.
                            </p>
                        </div>
                    </div>

                    {isSalonSelectorOpen && (
                        <div className="absolute top-full left-0 mt-4 w-80 bg-white rounded-3xl border border-border shadow-2xl z-[100] p-3 animate-in fade-in slide-in-from-top-2">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest p-3">SALON DEĞİŞTİR</p>
                            <div className="space-y-1">
                                {salons.map((s) => (
                                    <div
                                        key={s.id}
                                        onClick={() => switchSalon(s)}
                                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${s.id === salon.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-gray-50 border border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-cover bg-center border border-border" style={{ backgroundImage: `url(${s.image})` }}></div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-text-main truncate">{s.name}</p>
                                                <p className="text-[10px] font-bold text-text-muted truncate">{s.district_name}</p>
                                            </div>
                                        </div>
                                        {s.id === salon.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-border mt-3 p-3">
                                <Link href="/owner/salons" className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-text-main font-black text-[10px] rounded-xl hover:bg-gray-100 transition-colors border border-border uppercase tracking-widest">
                                    <LayoutGrid className="w-3 h-3" /> Tüm Salonları Yönet
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    <Link href="/owner/salons" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-border font-bold text-sm text-text-main shadow-sm hover:bg-gray-50 transition-all">
                        <Store className="w-4 h-4 text-primary" /> Salonlarım
                    </Link>
                    <Link
                        href="/owner/staff"
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all ${salon.status !== 'APPROVED' ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <UserPlus className="w-4 h-4" /> Personel Ekle
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Bugünkü Randevu', value: stats.todayCount, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', trend: '' },
                    { label: 'Tahmini Gelir', value: `₺${stats.todayRevenue}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', trend: '' },
                    { label: 'Doluluk Oranı', value: `%${stats.weeklyOccupancy}`, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50', trend: '' },
                    { label: 'Aktif Personel', value: stats.activeStaff, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50', trend: '' },
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[32px] border border-border shadow-card group hover:scale-[1.02] transition-transform relative overflow-hidden">
                        <div className={`w-14 h-14 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center mb-5 relative z-10`}>
                            <kpi.icon className="w-7 h-7" />
                        </div>
                        <div className="space-y-1 relative z-10">
                            <p className="text-[11px] font-black text-text-muted uppercase tracking-widest leading-none">{kpi.label}</p>
                            <p className="text-3xl font-black text-text-main tracking-tight">{kpi.value}</p>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-xs relative z-10 font-bold">
                            {kpi.trend && <span className="text-green-600 flex items-center translate-y-[-1px]"><ArrowUpRight className="w-3 h-3" /> {kpi.trend}</span>}
                            <span className="text-text-muted font-medium">aktif veri</span>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:bg-gray-100 transition-colors"></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white rounded-[40px] border border-border shadow-card overflow-hidden">
                    <div className="p-8 border-b border-border flex justify-between items-center bg-gray-50/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white border border-border flex items-center justify-center text-primary shadow-sm">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-text-main tracking-tight font-display">Son Hareketler</h3>
                        </div>
                        {salon.status === 'APPROVED' && (
                            <Link href="/owner/calendar" className="text-xs font-black text-primary hover:underline underline-offset-4 flex items-center gap-1">Tümünü Yönet <ChevronRight className="w-3 h-3" /></Link>
                        )}
                    </div>

                    <div className="overflow-x-auto relative">
                        {salon.status !== 'APPROVED' && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-4 shadow-sm border border-amber-100">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-black text-text-main mb-1">Onay Bekleniyor</h4>
                                <p className="text-xs font-bold text-text-secondary max-w-xs">İşletmeniz onaylandıktan sonra randevu trafiği burada listelenecektir.</p>
                            </div>
                        )}
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] uppercase font-black text-text-muted tracking-[0.2em] border-b border-border">
                                    <th className="px-8 py-5">Müşteri / Saat</th>
                                    <th className="px-8 py-5 text-center">Personel</th>
                                    <th className="px-8 py-5">Durum</th>
                                    <th className="px-8 py-5 text-right">Ücret</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentAppointments.length > 0 ? (
                                    recentAppointments.map((apt) => (
                                        <tr key={apt.id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                                            <td className="px-8 py-6">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-11 h-11 rounded-2xl bg-surface-alt border border-border flex items-center justify-center text-xs font-black text-text-muted group-hover:text-primary transition-colors">
                                                        {new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">{apt.customer_name}</p>
                                                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-tight">{apt.service?.global_service?.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="w-9 h-9 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: `url(${apt.staff?.photo || 'https://i.pravatar.cc/100'})` }}></div>
                                                    <span className="text-[10px] font-black text-text-secondary uppercase">{apt.staff?.name.split(' ')[0]}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {(() => {
                                                    const statusMap: Record<string, any> = {
                                                        PENDING: { label: 'Beklemede', color: 'bg-orange-600', bg: 'bg-orange-50' },
                                                        CONFIRMED: { label: 'Onaylandı', color: 'bg-blue-600', bg: 'bg-blue-50' },
                                                        COMPLETED: { label: 'Tamamlandı', color: 'bg-green-600', bg: 'bg-green-50' },
                                                        CANCELLED: { label: 'İptal', color: 'bg-red-600', bg: 'bg-red-50' }
                                                    };
                                                    const s = statusMap[apt.status] || { label: apt.status, color: 'bg-gray-600', bg: 'bg-gray-50' };
                                                    return (
                                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg} border border-white shadow-sm flex items-center gap-2 max-w-fit`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${s.color}`}></span>
                                                            <span className="text-text-main">{s.label}</span>
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-sm font-black text-text-main">₺{apt.service?.price}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 grayscale opacity-30">
                                                <Activity className="w-12 h-12" />
                                                <p className="text-sm font-bold text-text-muted italic">Henüz bir hareketlilik bulunmuyor.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-primary/5 rounded-[40px] p-8 border border-primary/10 shadow-sm">
                        <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> BÜYÜME İPUCU
                        </h4>
                        <div className="space-y-4">
                            <p className="text-sm text-text-main font-bold leading-snug italic">"Önümüzdeki hafta için doluluk oranınız %40'ın altında kalmış."</p>
                            <p className="text-xs text-text-secondary leading-relaxed font-medium">Hafta sonu için %20 indirimli kupon tanımlayarak randevularınızı artırabilirsiniz.</p>
                            <button className="w-full mt-4 py-3.5 bg-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">Kupon Tanımla</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-8 border border-border shadow-card">
                        <h4 className="text-xs font-black text-text-main uppercase tracking-[0.2em] mb-6">SİSTEM MESAJLARI</h4>
                        <div className="space-y-6">
                            {[
                                { title: 'SMS Bakiyesi Kritik', desc: 'Sms paketinizde son 50 adet kaldı.', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
                                { title: 'Yeni Yorum Kontrolü', desc: 'Salonunuz için 2 yeni değerlendirme var.', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50' }
                            ].map((msg, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl ${msg.bg} ${msg.color} flex items-center justify-center shrink-0`}>
                                        <msg.icon className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-black text-text-main">{msg.title}</p>
                                        <p className="text-[11px] font-medium text-text-secondary truncate">{msg.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
