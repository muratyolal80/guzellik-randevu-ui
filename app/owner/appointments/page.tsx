'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useActiveBranch } from '@/context/ActiveBranchContext';
import { AppointmentService } from '@/services/db';
import AppointmentDetailModal from '@/components/owner/AppointmentDetailModal';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    ClipboardList,
    Search,
    Users,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Phone,
    Scissors,
} from 'lucide-react';

// Durum görsel meta — tablo rozetleri + filtre çipleri için.
const STATUS_META: Record<string, { label: string; dot: string; badge: string }> = {
    PENDING:   { label: 'Onay Bekliyor', dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    CONFIRMED: { label: 'Onaylı',         dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    COMPLETED: { label: 'Tamamlandı',     dot: 'bg-slate-500',   badge: 'bg-slate-50 text-slate-700 border-slate-200' },
    CANCELLED: { label: 'İptal',          dot: 'bg-red-500',     badge: 'bg-red-50 text-red-600 border-red-200' },
};
const STATUS_CHIPS = ['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

// Tarih aralığı ön ayarları (yerel saat).
function presetRange(preset: string): { start: string; end: string } {
    const now = new Date();
    const iso = (d: Date) => d.toISOString().split('T')[0];
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (preset === 'today') {
        return { start: iso(startOfDay), end: iso(startOfDay) };
    }
    if (preset === 'week') {
        const day = startOfDay.getDay() === 0 ? 7 : startOfDay.getDay();
        const monday = new Date(startOfDay); monday.setDate(startOfDay.getDate() - (day - 1));
        const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
        return { start: iso(monday), end: iso(sunday) };
    }
    if (preset === 'month') {
        return {
            start: iso(new Date(now.getFullYear(), now.getMonth(), 1)),
            end: iso(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
        };
    }
    // 'all' → geniş pencere (tüm randevular)
    return { start: '2020-01-01', end: '2035-12-31' };
}

export default function OwnerAppointmentsPage() {
    const { user } = useAuth();
    const { activeBranch, loading: branchLoading } = useActiveBranch();

    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtreler
    const [datePreset, setDatePreset] = useState<string>('month');
    const [dateStart, setDateStart] = useState(presetRange('month').start);
    const [dateEnd, setDateEnd] = useState(presetRange('month').end);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [staffFilter, setStaffFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [actingId, setActingId] = useState<string | null>(null);

    const applyPreset = (preset: string) => {
        setDatePreset(preset);
        if (preset !== 'custom') {
            const r = presetRange(preset);
            setDateStart(r.start);
            setDateEnd(r.end);
        }
    };

    const fetchData = async () => {
        if (!activeBranch) return;
        try {
            setLoading(true);
            const startISO = new Date(`${dateStart}T00:00:00`).toISOString();
            const endISO = new Date(`${dateEnd}T23:59:59`).toISOString();
            const list = await AppointmentService.getAppointmentsBySalon(activeBranch.id, startISO, endISO);
            // En yeni üstte
            setAppointments([...(list || [])].sort(
                (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
            ));
        } catch (err) {
            console.error('Randevular çekilemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && activeBranch) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, activeBranch?.id, dateStart, dateEnd]);

    // Personel listesi (filtreden çıkar)
    const staffOptions = useMemo(() => {
        const map = new Map<string, string>();
        appointments.forEach(a => { if (a.staff_id && a.staff?.name) map.set(a.staff_id, a.staff.name); });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [appointments]);

    // Adetler (tarih aralığı + personel + arama uygulanmış halde, durum hariç)
    const baseFiltered = useMemo(() => appointments.filter(a => {
        if (staffFilter !== 'all' && a.staff_id !== staffFilter) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            const hit = (a.customer_name || '').toLowerCase().includes(q) || (a.customer_phone || '').includes(q);
            if (!hit) return false;
        }
        return true;
    }), [appointments, staffFilter, search]);

    const counts: Record<string, number> = useMemo(() => ({
        all: baseFiltered.length,
        PENDING: baseFiltered.filter(a => a.status === 'PENDING').length,
        CONFIRMED: baseFiltered.filter(a => a.status === 'CONFIRMED').length,
        COMPLETED: baseFiltered.filter(a => a.status === 'COMPLETED').length,
        CANCELLED: baseFiltered.filter(a => a.status === 'CANCELLED').length,
    }), [baseFiltered]);

    const rows = useMemo(
        () => baseFiltered.filter(a => statusFilter === 'all' || a.status === statusFilter),
        [baseFiltered, statusFilter]
    );

    const quickAction = async (apt: any, status: 'CONFIRMED' | 'CANCELLED') => {
        if (status === 'CANCELLED' && !confirm('Bu randevuyu iptal etmek istediğinize emin misiniz?')) return;
        try {
            setActingId(apt.id);
            await AppointmentService.updateAppointmentStatus(apt.id, status, apt.salon_id);
            await fetchData();
        } catch (err: any) {
            alert('İşlem başarısız: ' + (err?.message || ''));
        } finally {
            setActingId(null);
        }
    };

    const openDetail = (apt: any) => {
        setSelectedAppointment({
            ...apt,
            staff_name: apt.staff?.name,
            title: `${apt.customer_name} · ${apt.service?.global_service?.name || 'Randevu'}`,
        });
        setIsDetailOpen(true);
    };

    if (branchLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!activeBranch) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ClipboardList className="w-8 h-8 text-text-muted" />
                </div>
                <h2 className="text-xl font-black text-text-main">Aktif Şube Seçilmedi</h2>
                <p className="text-text-secondary mt-2">Randevuları görüntülemek için yukarıdan bir şube seçin.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Başlık */}
            <div>
                <h1 className="text-3xl font-black text-text-main tracking-tight flex items-center gap-3">
                    <ClipboardList className="w-8 h-8 text-primary" />
                    Randevular
                </h1>
                <p className="text-text-secondary font-medium mt-1.5">
                    Tüm randevuları tarih, personel ve duruma göre sorgulayın; buradan onaylayın veya iptal edin.
                </p>
            </div>

            {/* Filtre paneli */}
            <div className="bg-white rounded-[32px] border border-border shadow-sm p-5 lg:p-6 space-y-5">
                {/* Tarih aralığı + arama */}
                <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                    <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-border w-fit">
                        {[
                            { key: 'today', label: 'Bugün' },
                            { key: 'week', label: 'Bu Hafta' },
                            { key: 'month', label: 'Bu Ay' },
                            { key: 'all', label: 'Tümü' },
                        ].map(p => (
                            <button
                                key={p.key}
                                onClick={() => applyPreset(p.key)}
                                className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all ${
                                    datePreset === p.key ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:bg-white/60'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-end gap-3">
                        <div>
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1 mb-1 block">Başlangıç</label>
                            <input
                                type="date"
                                value={dateStart}
                                onChange={(e) => { setDatePreset('custom'); setDateStart(e.target.value); }}
                                className="px-4 py-2.5 bg-gray-50 border border-border rounded-xl font-bold text-sm outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1 mb-1 block">Bitiş</label>
                            <input
                                type="date"
                                value={dateEnd}
                                onChange={(e) => { setDatePreset('custom'); setDateEnd(e.target.value); }}
                                className="px-4 py-2.5 bg-gray-50 border border-border rounded-xl font-bold text-sm outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="flex-1 relative lg:max-w-xs lg:ml-auto">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1 mb-1 block">Müşteri Ara</label>
                        <Search className="absolute left-3.5 bottom-3 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="İsim veya telefon..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-border rounded-xl font-bold text-sm outline-none focus:border-primary"
                        />
                    </div>
                </div>

                {/* Durum çipleri (adetli) + personel */}
                <div className="flex flex-col xl:flex-row justify-between gap-4 pt-4 border-t border-border/60">
                    <div className="flex flex-wrap items-center gap-2">
                        {STATUS_CHIPS.map(key => {
                            const active = statusFilter === key;
                            const meta = STATUS_META[key];
                            return (
                                <button
                                    key={key}
                                    onClick={() => setStatusFilter(key)}
                                    className={`flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                                        active ? 'bg-text-main text-white border-text-main shadow-sm'
                                               : 'bg-white text-text-secondary border-border hover:border-text-muted hover:bg-gray-50'
                                    }`}
                                >
                                    <span className={`w-2.5 h-2.5 rounded-full ${key === 'all' ? 'bg-gray-400' : meta.dot}`} />
                                    {key === 'all' ? 'Tümü' : meta.label}
                                    <span className={`min-w-[22px] text-center px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                                        active ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-muted'
                                    }`}>
                                        {counts[key] ?? 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-border w-fit self-start xl:self-auto">
                        <Users className="w-4 h-4 ml-2 text-text-secondary shrink-0" />
                        <select
                            value={staffFilter}
                            onChange={(e) => setStaffFilter(e.target.value)}
                            className="bg-transparent border-none text-xs font-bold text-text-main focus:ring-0 cursor-pointer pr-6"
                        >
                            <option value="all">Tüm Personel</option>
                            {staffOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Liste */}
            <div className="bg-white rounded-[32px] border border-border shadow-sm overflow-hidden">
                {loading ? (
                    <div className="divide-y divide-gray-100">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="p-5 flex items-center gap-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-40 bg-gray-100 rounded" />
                                    <div className="h-3 w-24 bg-gray-100 rounded" />
                                </div>
                                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : rows.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-text-main">Bu kriterlere uygun randevu yok</h3>
                        <p className="text-text-secondary text-sm mt-1">Tarih aralığını, durumu veya personeli değiştirip tekrar deneyin.</p>
                    </div>
                ) : (
                    <>
                        {/* Tablo başlığı (desktop) */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/60 border-b border-border text-[10px] font-black text-text-muted uppercase tracking-widest">
                            <div className="col-span-3">Tarih / Saat</div>
                            <div className="col-span-3">Müşteri</div>
                            <div className="col-span-2">Personel</div>
                            <div className="col-span-2">Hizmet</div>
                            <div className="col-span-2 text-right">Durum / İşlem</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {rows.map(apt => {
                                const meta = STATUS_META[apt.status] || STATUS_META.PENDING;
                                return (
                                    <div key={apt.id} className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 px-5 md:px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                                        {/* Tarih / Saat */}
                                        <div className="col-span-2 md:col-span-3">
                                            <p className="text-sm font-black text-text-main">{format(new Date(apt.start_time), 'd MMM yyyy', { locale: tr })}</p>
                                            <p className="text-xs font-bold text-text-muted flex items-center gap-1 mt-0.5">
                                                <Clock className="w-3 h-3" /> {format(new Date(apt.start_time), 'HH:mm')}
                                            </p>
                                        </div>
                                        {/* Müşteri */}
                                        <div className="col-span-1 md:col-span-3 min-w-0">
                                            <p className="text-sm font-bold text-text-main truncate">{apt.customer_name || '—'}</p>
                                            {apt.customer_phone && (
                                                <p className="text-xs font-bold text-text-muted flex items-center gap-1 mt-0.5 truncate">
                                                    <Phone className="w-3 h-3 shrink-0" /> {apt.customer_phone}
                                                </p>
                                            )}
                                        </div>
                                        {/* Personel */}
                                        <div className="col-span-1 md:col-span-2 min-w-0">
                                            <p className="text-sm font-bold text-text-secondary truncate">{apt.staff?.name || 'Atanmamış'}</p>
                                        </div>
                                        {/* Hizmet */}
                                        <div className="hidden md:block md:col-span-2 min-w-0">
                                            <p className="text-sm font-bold text-text-secondary truncate flex items-center gap-1.5">
                                                <Scissors className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                                {apt.service?.global_service?.name || '—'}
                                            </p>
                                        </div>
                                        {/* Durum + işlem */}
                                        <div className="col-span-2 md:col-span-2 flex items-center justify-end gap-2">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${meta.badge}`}>
                                                {meta.label}
                                            </span>
                                            {apt.status === 'PENDING' && (
                                                <button
                                                    onClick={() => quickAction(apt, 'CONFIRMED')}
                                                    disabled={actingId === apt.id}
                                                    title="Onayla"
                                                    className="w-8 h-8 shrink-0 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-100 disabled:opacity-40"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                                                <button
                                                    onClick={() => quickAction(apt, 'CANCELLED')}
                                                    disabled={actingId === apt.id}
                                                    title="İptal Et"
                                                    className="w-8 h-8 shrink-0 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 border border-red-100 disabled:opacity-40"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openDetail(apt)}
                                                title="Detay"
                                                className="w-8 h-8 shrink-0 flex items-center justify-center bg-gray-50 text-text-secondary rounded-lg hover:bg-gray-100 border border-border"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="px-6 py-4 bg-gray-50/40 border-t border-border text-xs font-bold text-text-muted">
                            Toplam <span className="text-primary">{rows.length}</span> randevu listeleniyor
                        </div>
                    </>
                )}
            </div>

            <AppointmentDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                appointment={selectedAppointment}
                onSuccess={fetchData}
            />
        </div>
    );
}
