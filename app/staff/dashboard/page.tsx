'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
    Clock,
    User,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Play,
    CheckCheck,
    AlertTriangle,
    CalendarDays
} from 'lucide-react';

export default function StaffDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0 });

    useEffect(() => {
        if (!user) return;
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];

            // Get staff record first (to get their specific staff ID)
            const { data: staffMember } = await supabase
                .from('staff')
                .select('id')
                .eq('user_id', user?.id)
                .single();

            if (!staffMember) {
                console.warn('Current user is not linked to any staff profile');
                setLoading(false);
                return;
            }

            // Fetch today's appointments
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    salon:salons(name),
                    service:salon_services(price, duration_min, global_service:global_services(name))
                `)
                .eq('staff_id', staffMember.id)
                .gte('start_time', `${today}T00:00:00Z`)
                .lte('start_time', `${today}T23:59:59Z`)
                .order('start_time', { ascending: true });

            if (error) throw error;

            setAppointments(data || []);

            // Calculate Stats
            const todayAppts = data || [];
            setStats({
                today: todayAppts.length,
                pending: todayAppts.filter(a => a.status === 'PENDING').length,
                completed: todayAppts.filter(a => a.status === 'COMPLETED').length
            });

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', appointmentId);

            if (error) throw error;

            // Refresh local state
            setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a));

            // Update stats
            setStats(prev => ({
                ...prev,
                pending: newStatus === 'CONFIRMED' ? prev.pending - 1 : prev.pending,
                completed: newStatus === 'COMPLETED' ? prev.completed + 1 : prev.completed
            }));

        } catch (error) {
            console.error('Status update failed:', error);
            alert('Durum güncellenemedi.');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tight">Bugün Neler Var?</h1>
                    <p className="text-text-secondary font-medium">Ajandanızdaki bugünkü randevuları buradan yönetebilirsiniz.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-border shadow-sm">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-text-main">
                        {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                    </span>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-3xl border border-border shadow-card flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all"></div>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative z-10">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-text-muted uppercase tracking-wider">TOPLAM</p>
                        <p className="text-3xl font-black text-text-main leading-tight">{stats.today}</p>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-border shadow-card flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-all"></div>
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 relative z-10">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-text-muted uppercase tracking-wider">ONAY BEKLEYEN</p>
                        <p className="text-3xl font-black text-text-main leading-tight">{stats.pending}</p>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-border shadow-card flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/10 transition-all"></div>
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 relative z-10">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-text-muted uppercase tracking-wider">TAMAMLANAN</p>
                        <p className="text-3xl font-black text-text-main leading-tight">{stats.completed}</p>
                    </div>
                </div>
            </div>

            {/* Appointment List Table */}
            <div className="bg-white rounded-3xl border border-border shadow-card overflow-hidden">
                <div className="p-6 border-b border-border bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-text-main flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" /> Bugünkü Akış
                    </h3>
                    <button className="text-xs font-bold text-primary hover:underline">Tümünü Gör</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] uppercase font-bold text-text-muted tracking-widest border-b border-border">
                                <th className="px-6 py-4">Sıra / Saat</th>
                                <th className="px-6 py-4">Müşteri</th>
                                <th className="px-6 py-4">Hizmet / Süre</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Randevular yükleniyor...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : appointments.length > 0 ? (
                                appointments.map((apt, idx) => (
                                    <tr key={apt.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-black text-text-muted/50">#{(idx + 1).toString().padStart(2, '0')}</span>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-text-main">
                                                        {new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-text-muted">
                                                        {apt.service?.duration_min} dk
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-surface-alt border border-border flex items-center justify-center text-text-main font-black text-xs uppercase shadow-sm">
                                                    {apt.customer_name?.substring(0, 2) || 'GS'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-text-main">{apt.customer_name}</span>
                                                    <span className="text-[11px] font-medium text-text-muted">{apt.customer_phone?.replace(/^\d{3}/, '***')}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1.5 rounded-lg bg-surface-alt border border-border text-xs font-bold text-text-main">
                                                {apt.service?.global_service?.name || 'Hizmet'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const statusMap: Record<string, any> = {
                                                    PENDING: { label: 'Bekliyor', color: 'bg-orange-500', bg: 'bg-orange-50' },
                                                    CONFIRMED: { label: 'Onaylı', color: 'bg-blue-500', bg: 'bg-blue-50' },
                                                    COMPLETED: { label: 'Tamamlandı', color: 'bg-green-500', bg: 'bg-green-50' },
                                                    CANCELLED: { label: 'İptal', color: 'bg-red-500', bg: 'bg-red-50' }
                                                };
                                                const s = statusMap[apt.status] || { label: apt.status, color: 'bg-gray-500', bg: 'bg-gray-50' };
                                                return (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg} border-2 border-white shadow-sm`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${s.color}`}></span>
                                                        <span className="text-text-main">{s.label}</span>
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {apt.status === 'PENDING' && (
                                                    <>
                                                        <button onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-all title='Onayla'"><CheckCircle2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all" title="İptal Et"><XCircle className="w-4 h-4" /></button>
                                                    </>
                                                )}
                                                {apt.status === 'CONFIRMED' && (
                                                    <button onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')} className="px-4 py-2 bg-primary text-white hover:bg-primary-hover rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2">
                                                        <CheckCheck className="w-4 h-4" /> Tamamla
                                                    </button>
                                                )}
                                                <button className="p-2 text-text-muted hover:bg-gray-100 rounded-lg"><MoreVertical className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-text-muted">
                                                <Clock className="w-8 h-8" />
                                            </div>
                                            <p className="text-text-secondary font-bold">Bugünlük başka randevunuz yok.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
