'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useActiveBranch } from '@/context/ActiveBranchContext';
import { StaffService, AppointmentService } from '@/services/db';
import { AddAppointmentModal } from '@/components/owner/AddAppointmentModal';
import AppointmentDetailModal from '@/components/owner/AppointmentDetailModal';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Users,
    Clock,
    Filter,
    Plus,
    Maximize2,
    CalendarDays
} from 'lucide-react';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import trLocale from '@fullcalendar/core/locales/tr';

// Randevu durumu → görsel meta (renk + etiket + nokta sınıfı).
// Yönetim mantığı: PENDING dikkat çeksin (amber), CONFIRMED normal, COMPLETED gri, CANCELLED soluk/kırmızı.
const STATUS_META: Record<string, { color: string; label: string; dot: string }> = {
    PENDING:   { color: '#F59E0B', label: 'Onay Bekliyor', dot: 'bg-amber-500' },
    CONFIRMED: { color: '#10B981', label: 'Onaylı',         dot: 'bg-emerald-500' },
    COMPLETED: { color: '#64748B', label: 'Tamamlandı',     dot: 'bg-slate-500' },
    CANCELLED: { color: '#EF4444', label: 'İptal',          dot: 'bg-red-500' },
};

// Tıklanabilir durum filtre çipleri (adetli). Tıklayınca takvim o duruma filtrelenir.
const STATUS_CHIPS = [
    { key: 'all',       label: 'Tümü',         dot: 'bg-gray-400' },
    { key: 'PENDING',   label: 'Onay Bekliyor', dot: 'bg-amber-500' },
    { key: 'CONFIRMED', label: 'Onaylı',        dot: 'bg-emerald-500' },
    { key: 'COMPLETED', label: 'Tamamlandı',    dot: 'bg-slate-500' },
    { key: 'CANCELLED', label: 'İptal',         dot: 'bg-red-500' },
];

export default function OwnerMasterCalendar() {
    const { user } = useAuth();
    const { activeBranch, loading: branchLoading } = useActiveBranch();
    const [staff, setStaff] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [preselectedSlot, setPreselectedSlot] = useState<Date | undefined>(undefined);
    const [preselectedStaff, setPreselectedStaff] = useState<string | undefined>(undefined);
    const [selectedStaffId, setSelectedStaffId] = useState<string | 'all'>('all');
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState('timeGridWeek');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const calendarRef = useRef<FullCalendar>(null);

    const changeView = (v: string) => {
        calendarRef.current?.getApi().changeView(v);
        setCurrentView(v);
    };

    // Görünen takvim aralığı (datesSet ile güncellenir). Randevular SADECE bu aralık için çekilir.
    const [range, setRange] = useState<{ start: string; end: string } | null>(null);

    // Durum bazlı adetler (filtre çiplerinde gösterilir).
    const statusCounts: Record<string, number> = {
        all: appointments.length,
        PENDING: appointments.filter(a => a.status === 'PENDING').length,
        CONFIRMED: appointments.filter(a => a.status === 'CONFIRMED').length,
        COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
        CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
    };

    // Personel listesi: şube değişince bir kez çek.
    useEffect(() => {
        if (!user || !activeBranch) return;
        StaffService.getStaffBySalon(activeBranch.id)
            .then(setStaff)
            .catch(err => console.error('Personel çekilemedi:', err));
    }, [user, activeBranch]);

    const fetchAppointments = async (start: string, end: string) => {
        if (!activeBranch) return;
        try {
            setLoading(true);
            const list = await AppointmentService.getAppointmentsBySalon(activeBranch.id, start, end);
            setAppointments(list);
        } catch (err) {
            console.error('Takvim verisi çekilemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    // Randevuları görünen aralığa VE aktif şubeye göre çek. Böylece haftalar/aylar
    // arası gezinince (Temmuz randevuları dahil) ve şube değişince doğru veri gelir.
    useEffect(() => {
        if (activeBranch && range) {
            fetchAppointments(range.start, range.end);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeBranch?.id, range?.start, range?.end]);

    const refetch = () => {
        if (range) fetchAppointments(range.start, range.end);
    };

    const handleDatesSet = (arg: any) => {
        setCurrentView(arg.view.type);
        setRange({ start: arg.start.toISOString(), end: arg.end.toISOString() });
    };

    const getStaffColor = (index: number) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
        return colors[index % colors.length];
    };

    const events = appointments
        .filter(apt =>
            (selectedStaffId === 'all' || apt.staff_id === selectedStaffId) &&
            (statusFilter === 'all' || apt.status === statusFilter)
        )
        .map(apt => {
            const staffIndex = staff.findIndex(s => s.id === apt.staff_id);
            const staffColor = getStaffColor(staffIndex === -1 ? 0 : staffIndex);
            const meta = STATUS_META[apt.status] || STATUS_META.CONFIRMED;
            // Onaylı → personel rengi (kimlik). Diğer durumlar → durum rengi (dikkat çek).
            const bg = apt.status === 'CONFIRMED' ? staffColor : meta.color;

            return {
                id: apt.id,
                title: `${apt.customer_name} · ${apt.service?.global_service?.name || 'Randevu'}`,
                start: apt.start_time,
                end: new Date(new Date(apt.start_time).getTime() + (apt.service?.duration_min || 30) * 60000).toISOString(),
                backgroundColor: bg,
                borderColor: staffColor, // sol kenar aksanı = personel kimliği
                classNames: [
                    apt.status === 'CANCELLED' ? 'apt-cancelled' : '',
                    apt.status === 'PENDING' ? 'apt-pending' : '',
                ].filter(Boolean),
                extendedProps: {
                    status: apt.status,
                    staffName: apt.staff?.name,
                    phone: apt.customer_phone,
                },
            };
        });

    const handleEventDrop = async (info: any) => {
        const { event } = info;
        try {
            await AppointmentService.updateAppointment(event.id, {
                start_time: event.start.toISOString()
            }, activeBranch?.id);
            setAppointments(prev => prev.map(apt =>
                apt.id === event.id ? { ...apt, start_time: event.start.toISOString() } : apt
            ));
        } catch (err) {
            console.error('Randevu taşınamadı:', err);
            info.revert();
        }
    };

    const handleEventClick = (info: any) => {
        const { event } = info;
        const apt = appointments.find(a => a.id === event.id);
        if (apt) {
            setSelectedAppointment({
                ...apt,
                title: event.title,
                staff_name: event.extendedProps.staffName
            });
            setIsDetailModalOpen(true);
        }
    };

    // Takvimde boş bir slota ÇİFT TIKLAYINCA o tarih/saatle randevu ekleme aç.
    const lastSlotClick = useRef<{ t: number; ms: number }>({ t: 0, ms: 0 });
    const openAddModal = (date?: Date, staffId?: string) => {
        setPreselectedSlot(date);
        setPreselectedStaff(staffId);
        setIsAddModalOpen(true);
    };
    const handleDateClick = (arg: any) => {
        const now = Date.now();
        const ms = arg.date.getTime();
        if (now - lastSlotClick.current.t < 450 && lastSlotClick.current.ms === ms) {
            openAddModal(arg.date);
            lastSlotClick.current = { t: 0, ms: 0 };
        } else {
            lastSlotClick.current = { t: now, ms };
        }
    };

    if (branchLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!activeBranch) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-60 text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-text-muted" />
                </div>
                <h2 className="text-xl font-black text-text-main">Aktif Şube Seçilmedi</h2>
                <p className="text-text-secondary mt-2 mb-6">Takvimi görüntülemek için lütfen yukarıdan bir şube seçin.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-8 animate-fade-in relative pb-10">
            {/* Header / Controls */}
            <div className="bg-white p-6 lg:p-8 rounded-[40px] border border-border shadow-sm space-y-6">
                {/* Üst satır: başlık + ana aksiyonlar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                    <div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight flex items-center gap-3">
                            <CalendarDays className="w-8 h-8 text-primary" />
                            Akıllı Takvim
                        </h1>
                        <p className="text-text-secondary font-medium mt-1.5">Tüm personelin randevularını tek ekrandan yönetin · boş bir saate <span className="font-black text-primary">çift tıklayarak</span> randevu ekleyin · sürükleyip taşıyın.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-border flex-1 lg:flex-none">
                            <Users className="w-4 h-4 ml-2 text-text-secondary shrink-0" />
                            <select
                                value={selectedStaffId}
                                onChange={(e) => setSelectedStaffId(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-text-main focus:ring-0 cursor-pointer pr-6 w-full"
                            >
                                <option value="all">Tüm Personel</option>
                                {staff.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => openAddModal()}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" /> Yeni Randevu
                        </button>
                    </div>
                </div>

                {/* Alt satır: durum filtreleri (adetli, tıklanabilir) + görünüm */}
                <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 pt-5 border-t border-border/60">
                    <div className="flex flex-wrap items-center gap-2">
                        {STATUS_CHIPS.map(chip => {
                            const active = statusFilter === chip.key;
                            return (
                                <button
                                    key={chip.key}
                                    onClick={() => setStatusFilter(chip.key)}
                                    className={`flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                                        active
                                            ? 'bg-text-main text-white border-text-main shadow-sm'
                                            : 'bg-white text-text-secondary border-border hover:border-text-muted hover:bg-gray-50'
                                    }`}
                                >
                                    <span className={`w-2.5 h-2.5 rounded-full ${chip.dot}`} />
                                    {chip.label}
                                    <span className={`min-w-[22px] text-center px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                                        active ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-muted'
                                    }`}>
                                        {statusCounts[chip.key] ?? 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-border self-start xl:self-auto">
                        {[
                            { v: 'timeGridDay', label: 'Gün' },
                            { v: 'timeGridWeek', label: 'Hafta' },
                            { v: 'dayGridMonth', label: 'Ay' },
                        ].map(opt => (
                            <button
                                key={opt.v}
                                onClick={() => changeView(opt.v)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                                    currentView === opt.v ? 'bg-white shadow-sm text-primary' : 'hover:bg-white/60 text-text-secondary'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Calendar Container */}
            <div className="flex-1 bg-white rounded-[40px] border border-border shadow-card p-6 lg:p-8 overflow-hidden">
                <style jsx global>{`
                    .fc {
                        --fc-border-color: #eef0f3;
                        --fc-button-text-color: #334155;
                        --fc-button-bg-color: #ffffff;
                        --fc-button-border-color: #e2e8f0;
                        --fc-button-hover-bg-color: #f1f5f9;
                        --fc-button-hover-border-color: #cbd5e1;
                        --fc-button-active-bg-color: #C59F59;
                        --fc-button-active-border-color: #C59F59;
                        --fc-today-bg-color: #fbf7ef;
                        --fc-now-indicator-color: #C59F59;
                        font-family: inherit;
                    }
                    /* prev/next/today butonları — beyaz/görünmez yazı sorununu çöz */
                    .fc .fc-button {
                        border-radius: 12px !important;
                        font-weight: 800 !important;
                        font-size: 0.75rem !important;
                        padding: 0.5rem 0.9rem !important;
                        text-transform: capitalize;
                        box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
                        transition: all 0.15s;
                    }
                    .fc .fc-button .fc-icon {
                        font-size: 1.15rem;
                        vertical-align: middle;
                    }
                    .fc .fc-button-primary:not(:disabled).fc-button-active,
                    .fc .fc-button-primary:not(:disabled):active {
                        color: #ffffff !important;
                        box-shadow: 0 4px 10px -2px rgba(197,159,89,0.4);
                    }
                    .fc .fc-button-primary:disabled {
                        opacity: 0.45;
                    }
                    .fc-toolbar {
                        margin-bottom: 2rem !important;
                        gap: 0.5rem;
                    }
                    .fc-toolbar-title {
                        font-size: 1.25rem !important;
                        font-weight: 900 !important;
                        color: #1e293b;
                    }
                    .fc-event {
                        cursor: pointer;
                        padding: 4px 8px !important;
                        border-radius: 10px !important;
                        border-width: 0 0 0 4px !important;
                        border-style: solid !important;
                        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                        transition: all 0.2s;
                    }
                    .fc-event:hover {
                        transform: translateY(-1px);
                        filter: brightness(0.95);
                    }
                    /* İptal: soluk + üstü çizili */
                    .fc-event.apt-cancelled {
                        opacity: 0.45;
                    }
                    .fc-event.apt-cancelled .fc-event-title {
                        text-decoration: line-through;
                    }
                    /* Onay bekleyen: amber halka ile vurgula */
                    .fc-event.apt-pending {
                        box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.45), 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
                    }
                    .fc-event-title {
                        font-weight: 700 !important;
                        font-size: 0.75rem !important;
                    }
                    .fc-timegrid-slot {
                        height: 4rem !important;
                    }
                    /* Gün başlık satırı — altın tonlu zemin, bugünü vurgula */
                    .fc-col-header-cell {
                        background: #faf8f5;
                    }
                    .fc-col-header-cell.fc-day-today {
                        background: #f3e9d6;
                    }
                    .fc-col-header-cell-cushion {
                        padding: 1rem !important;
                        font-weight: 800 !important;
                        text-transform: uppercase;
                        font-size: 0.7rem !important;
                        letter-spacing: 0.05em;
                        color: #64748b;
                    }
                    .fc-day-today .fc-col-header-cell-cushion {
                        color: #C59F59;
                    }
                    /* Sol saat kolonu (08/09/10...) — altın tonlu zemin + belirgin etiket */
                    .fc-timegrid-axis, .fc-timegrid-slot-label {
                        background: #faf8f5;
                    }
                    .fc-timegrid-axis-cushion, .fc-timegrid-slot-label-cushion {
                        font-weight: 800 !important;
                        color: #C59F59;
                        font-size: 0.72rem !important;
                    }
                `}</style>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={currentView}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: ''
                    }}
                    locale={trLocale}
                    events={events}
                    editable={true}
                    droppable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    nowIndicator={true}
                    slotMinTime="08:00:00"
                    slotMaxTime="22:00:00"
                    allDaySlot={false}
                    eventDrop={handleEventDrop}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    datesSet={handleDatesSet}
                    height="auto"
                />
            </div>

            {/* Add Appointment Modal */}
            <AddAppointmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                salonId={activeBranch.id}
                preselectedDate={preselectedSlot}
                preselectedStaffId={preselectedStaff ?? (selectedStaffId !== 'all' ? selectedStaffId : undefined)}
                onSuccess={refetch}
            />

            {/* Appointment Detail Modal */}
            <AppointmentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                appointment={selectedAppointment}
                onSuccess={refetch}
                onRebook={(apt) => {
                    setIsDetailModalOpen(false);
                    openAddModal(new Date(apt.start_time), apt.staff_id);
                }}
            />
        </div>
    );
}
