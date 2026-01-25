'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SalonDataService, ApprovalService } from '@/services/db';
import { supabase } from '@/lib/supabase';
import {
    Users,
    Calendar,
    TrendingUp,
    Clock,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    UserPlus,
    Activity,
    ChevronRight,
    Search,
    Store,
    Info
} from 'lucide-react';
import Link from 'next/link';

export default function OwnerDashboard() {
    const { user } = useAuth();
    const [salon, setSalon] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        todayCount: 0,
        todayRevenue: 0,
        weeklyOccupancy: 0,
        activeStaff: 0
    });
    const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const salonData = await SalonDataService.getSalonByOwner(user?.id!);

            if (salonData) {
                setSalon(salonData);

                const today = new Date().toISOString().split('T')[0];

                // Fetch stats and recent appointments in parallel
                const [apptsResponse, staffResponse] = await Promise.all([
                    supabase
                        .from('appointments')
                        .select(`
                            *,
                            service:salon_services(price, duration_min, global_service:global_services(name)),
                            staff:staff(name, photo)
                        `)
                        .eq('salon_id', salonData.id)
                        .gte('start_time', `${today}T00:00:00Z`)
                        .order('start_time', { ascending: true }),
                    supabase
                        .from('staff')
                        .select('id, name')
                        .eq('salon_id', salonData.id)
                        .eq('is_active', true)
                ]);

                if (apptsResponse.data) {
                    const todayAppts = apptsResponse.data.filter(a => a.start_time.startsWith(today));
                    const revenue = todayAppts.reduce((sum, a) => sum + (a.service?.price || 0), 0);

                    setStats({
                        todayCount: todayAppts.length,
                        todayRevenue: revenue,
                        weeklyOccupancy: 68, // Hardcoded for demo
                        activeStaff: staffResponse.data?.length || 0
                    });

                    setRecentAppointments(apptsResponse.data.slice(0, 5));
                }

                // Fetch pending requests
                if (user) {
                    const requests = await ApprovalService.getMyRequests(user.id);
                    setPendingRequests(requests.filter((r: any) => r.status === 'PENDING'));
                }
            } else {
                // Fetch pending requests even if no salon exists (for new salon requests)
                if (user) {
                    const requests = await ApprovalService.getMyRequests(user.id);
                    setPendingRequests(requests.filter((r: any) => r.status === 'PENDING'));
                }
            }
        } catch (err) {
            console.error('Dashboard verisi çekilirken hata:', err);
        } finally {
            setLoading(false);
        }
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
                    <Store className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-black text-text-main mb-2">Salon Bulunamadı</h1>
                <p className="text-text-secondary mb-8">Henüz yöneticisi olduğunuz aktif bir salon kaydı bulunmuyor.</p>

                {pendingRequests.length > 0 ? (
                    <div className="bg-orange-50 border border-orange-200 p-6 rounded-3xl max-w-md animate-pulse">
                        <div className="flex items-center gap-3 text-orange-700 mb-2 justify-center">
                            <Clock className="w-5 h-5" />
                            <span className="font-bold">Onay Bekliyor</span>
                        </div>
                        <p className="text-sm text-orange-600">Salon oluşturma talebiniz admin onayına gönderildi. Lütfen onaylanmasını bekleyiniz.</p>
                    </div>
                ) : (
                    <Link href="/owner/salons/new" className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary-hover transition-all">
                        Yeni Salon Oluşturma Talebi Gönder
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {pendingRequests.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4 text-blue-800">
                    <div className="bg-blue-100 p-2 rounded-xl">
                        <Info className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold">Bekleyen {pendingRequests.length} Değişiklik Talebiniz Var</p>
                        <p className="text-xs opacity-80">Yaptığınız güncellemeler admin tarafından inceleniyor.</p>
                    </div>
                    <Link href="/owner/approvals" className="text-xs font-black bg-blue-600 text-white px-4 py-2 rounded-lg">Detaylar</Link>
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-text-main tracking-tight leading-none">{salon.name}</h1>
                    <p className="text-text-secondary font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" /> Şubenizin bugünkü performans özeti.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-border font-bold text-sm text-text-main shadow-sm hover:bg-gray-50 transition-all">
                        <Search className="w-4 h-4" /> Randevu Ara
                    </button>
                    <Link href="/owner/staff" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all">
                        <UserPlus className="w-4 h-4" /> Personel Ekle
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Bugünkü Randevu', value: stats.todayCount, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
                    { label: 'Tahmini Gelir', value: `₺${stats.todayRevenue}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', trend: '+8%' },
                    { label: 'Doluluk Oranı', value: `%${stats.weeklyOccupancy}`, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+5%' },
                    { label: 'Aktif Personel', value: stats.activeStaff, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Filtresiz' },
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
                            <span className={idx === 3 ? 'text-gray-400' : 'text-green-600 flex items-center translate-y-[-1px]'}><ArrowUpRight className="w-3 h-3" /> {kpi.trend}</span>
                            <span className="text-text-muted font-medium">düne göre</span>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:bg-gray-100 transition-colors"></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Son Randevular */}
                <div className="lg:col-span-8 bg-white rounded-[40px] border border-border shadow-card overflow-hidden">
                    <div className="p-8 border-b border-border flex justify-between items-center bg-gray-50/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white border border-border flex items-center justify-center text-primary shadow-sm">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-text-main tracking-tight font-display">Son Hareketler</h3>
                        </div>
                        <Link href="/owner/calendar" className="text-xs font-black text-primary hover:underline underline-offset-4 flex items-center gap-1">Tümünü Yönet <ChevronRight className="w-3 h-3" /></Link>
                    </div>

                    <div className="overflow-x-auto">
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

                {/* Sağ Kolon: Hızlı Aksiyonlar / Uyarılar */}
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
