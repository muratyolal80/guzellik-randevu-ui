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

export default function OwnerMasterCalendar() {
    const { user } = useAuth();
    const { activeBranch, loading: branchLoading } = useActiveBranch();
    const [staff, setStaff] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState<string | 'all'>('all');
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const calendarRef = useRef<FullCalendar>(null);

    useEffect(() => {
        if (user && activeBranch) {
            fetchInitialData();
        }
    }, [user, activeBranch]);

    const fetchInitialData = async () => {
        if (!activeBranch) return;

        try {
            setLoading(true);
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

            const [staffList, apptsList] = await Promise.all([
                StaffService.getStaffBySalon(activeBranch.id),
                AppointmentService.getAppointmentsBySalon(activeBranch.id, startOfMonth, endOfMonth)
            ]);

            setStaff(staffList);
            setAppointments(apptsList);
        } catch (err) {
            console.error('Takvim verisi çekilemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStaffColor = (index: number) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
        return colors[index % colors.length];
    };

    const events = appointments
        .filter(apt => selectedStaffId === 'all' || apt.staff_id === selectedStaffId)
        .map(apt => {
            const staffIndex = staff.findIndex(s => s.id === apt.staff_id);
            const color = getStaffColor(staffIndex === -1 ? 0 : staffIndex);

            return {
                id: apt.id,
                title: `${apt.customer_name} - ${apt.service?.global_service?.name || 'Randevu'}`,
                start: apt.start_time,
                end: new Date(new Date(apt.start_time).getTime() + (apt.service?.duration_min || 30) * 60000).toISOString(),
                backgroundColor: color,
                borderColor: color,
                extendedProps: {
                    status: apt.status,
                    staffName: apt.staff?.name,
                    phone: apt.customer_phone
                }
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 lg:p-8 rounded-[40px] border border-border shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tight flex items-center gap-3">
                        <CalendarDays className="w-8 h-8 text-primary" />
                        Akıllı Takvim
                    </h1>
                    <p className="text-text-secondary font-medium">Randevuları sürükleyip bırakarak kolayca yönetin.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-border">
                        <Users className="w-4 h-4 ml-2 text-text-secondary" />
                        <select
                            value={selectedStaffId}
                            onChange={(e) => setSelectedStaffId(e.target.value)}
                            className="bg-transparent border-none text-xs font-bold text-text-main focus:ring-0 cursor-pointer pr-8"
                        >
                            <option value="all">Tüm Personel</option>
                            {staff.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.2 bg-primary text-white rounded-2xl text-xs font-black shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Randevu
                    </button>

                    <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-border">
                        <button
                            onClick={() => calendarRef.current?.getApi().changeView('timeGridDay')}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-white transition-all"
                        >
                            Gün
                        </button>
                        <button
                            onClick={() => calendarRef.current?.getApi().changeView('timeGridWeek')}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-white transition-all bg-white shadow-sm"
                        >
                            Hafta
                        </button>
                        <button
                            onClick={() => calendarRef.current?.getApi().changeView('dayGridMonth')}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-white transition-all"
                        >
                            Ay
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Container */}
            <div className="flex-1 bg-white rounded-[40px] border border-border shadow-card p-6 lg:p-8 overflow-hidden">
                <style jsx global>{`
                    .fc {
                        --fc-border-color: #f1f5f9;
                        --fc-button-bg-color: #ffffff;
                        --fc-button-border-color: #e2e8f0;
                        --fc-button-hover-bg-color: #f8fafc;
                        --fc-today-bg-color: #f8fafc;
                        font-family: inherit;
                    }
                    .fc-toolbar {
                        margin-bottom: 2rem !important;
                    }
                    .fc-toolbar-title {
                        font-size: 1.25rem !important;
                        font-weight: 900 !important;
                        color: #1e293b;
                    }
                    .fc-event {
                        cursor: pointer;
                        padding: 4px 8px !important;
                        border-radius: 12px !important;
                        border: none !important;
                        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                        transition: all 0.2s;
                    }
                    .fc-event:hover {
                        transform: translateY(-1px);
                        filter: brightness(0.95);
                    }
                    .fc-event-title {
                        font-weight: 700 !important;
                        font-size: 0.75rem !important;
                    }
                    .fc-timegrid-slot {
                        height: 4rem !important;
                    }
                    .fc-col-header-cell-cushion {
                        padding: 1rem !important;
                        font-weight: 800 !important;
                        text-transform: uppercase;
                        font-size: 0.7rem !important;
                        letter-spacing: 0.05em;
                        color: #64748b;
                    }
                `}</style>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
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
                    slotMinTime="08:00:00"
                    slotMaxTime="22:00:00"
                    allDaySlot={false}
                    eventDrop={handleEventDrop}
                    eventClick={handleEventClick}
                    height="auto"
                />
            </div>

            {/* Add Appointment Modal */}
            <AddAppointmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                salonId={activeBranch.id}
                onSuccess={() => fetchInitialData()}
            />

            {/* Appointment Detail Modal */}
            <AppointmentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                appointment={selectedAppointment}
                onSuccess={() => fetchInitialData()}
            />
        </div>
    );
}
