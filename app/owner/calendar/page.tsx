'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useActiveBranch } from '@/context/ActiveBranchContext';
import { StaffService, SalonDataService, AppointmentService } from '@/services/db';
import { AddAppointmentModal } from '@/components/owner/AddAppointmentModal';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Users,
    Clock,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    XCircle,
    RotateCw
} from 'lucide-react';

export default function OwnerMasterCalendar() {
    const { user } = useAuth();
    const { activeBranch, loading: branchLoading } = useActiveBranch();
    const [staff, setStaff] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (user && activeBranch) {
            fetchInitialData();
        }
    }, [user, activeBranch, selectedDate]);

    const fetchInitialData = async () => {
        if (!activeBranch) return;

        try {
            setLoading(true);
            const dateStr = selectedDate.toISOString().split('T')[0];

            const [staffList, apptsList] = await Promise.all([
                StaffService.getStaffBySalon(activeBranch.id),
                AppointmentService.getAppointmentsBySalon(activeBranch.id, `${dateStr}T00:00:00Z`, `${dateStr}T23:59:59Z`)
            ]);

            setStaff(staffList);
            setAppointments(apptsList);
        } catch (err) {
            console.error('Takvim verisi çekilemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const changeDate = (days: number) => {
        const next = new Date(selectedDate);
        next.setDate(selectedDate.getDate() + days);
        setSelectedDate(next);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = Math.floor(i / 2) + 9;
        const min = (i % 2) * 30;
        return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    }).filter((_, i) => i < 21); // 09:00 - 19:00 approx

    if (branchLoading) return <div>Yükleniyor...</div>;

    if (!activeBranch) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-text-muted" />
                </div>
                <h2 className="text-xl font-black text-text-main">Aktif Şube Seçilmedi</h2>
                <p className="text-text-secondary mt-2 mb-6">Takvimi görüntülemek için lütfen yukarıdan bir şube seçin.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-8 animate-fade-in relative">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[40px] border border-border shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-text-main tracking-tight">Saha Takvimi</h1>
                    <p className="text-text-secondary font-medium">Tüm personelin randevu akışını buradan yönetebilirsiniz.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-surface-alt p-1.5 rounded-2xl border border-border">
                        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                        <div className="px-6 font-black text-sm text-text-main flex items-center gap-3">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                        </div>
                        <button onClick={() => changeDate(1)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                    <button
                        onClick={goToToday}
                        className="px-6 py-3.5 bg-white border border-border rounded-2xl text-sm font-black text-text-main hover:border-primary hover:text-primary transition-all shadow-sm whitespace-nowrap"
                    >
                        Bugün
                    </button>
                    <button className="p-3.5 bg-white border border-border rounded-2xl text-text-secondary hover:text-primary hover:border-primary transition-all shadow-sm">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Master Grid */}
            <div className="flex-1 bg-white rounded-[40px] border border-border shadow-card overflow-hidden flex flex-col">
                {/* Staff Header Row */}
                <div className="flex border-b border-border bg-gray-50/50">
                    <div className="w-24 shrink-0 border-r border-border bg-gray-100/50 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-text-muted" />
                    </div>
                    <div className="flex flex-1 overflow-x-auto no-scrollbar divide-x divide-border">
                        {staff.map(s => (
                            <div key={s.id} className="min-w-[240px] px-6 py-5 flex items-center gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                                <div className="w-10 h-10 rounded-xl border-2 border-white shadow-sm bg-cover bg-center" style={{ backgroundImage: `url(${s.photo || 'https://i.pravatar.cc/100'})` }}></div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-black text-text-main truncate">{s.name}</p>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">{s.specialty}</p>
                                </div>
                            </div>
                        ))}
                        {staff.length === 0 && (
                            <div className="flex-1 p-5 text-center text-text-muted text-sm font-medium">Lütfen önce personel ekleyin.</div>
                        )}
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto relative no-scrollbar">
                    <div className="flex min-h-full divide-x divide-border">
                        {/* Time Column */}
                        <div className="w-24 shrink-0 border-r border-border bg-gray-50/30">
                            {timeSlots.map(time => (
                                <div key={time} className="h-20 border-b border-gray-100 flex items-center justify-center relative">
                                    <span className="text-[11px] font-black text-text-muted">{time}</span>
                                    <div className="absolute right-[-4px] top-1/2 w-2 h-2 rounded-full bg-gray-300"></div>
                                </div>
                            ))}
                        </div>

                        {/* Staff Columns */}
                        <div className="flex flex-1 overflow-x-auto no-scrollbar divide-x divide-border">
                            {staff.map(s => {
                                const staffAppts = appointments.filter(a => a.staff_id === s.id);
                                return (
                                    <div key={s.id} className="min-w-[240px] relative bg-grid-slate-100/[0.1] bg-[length:20px_20px]">
                                        {/* Background Slot Markers */}
                                        {timeSlots.map(time => (
                                            <div
                                                key={time}
                                                onClick={() => {
                                                    // Set preselected time or something? 
                                                    // For now just open modal
                                                    setIsAddModalOpen(true);
                                                }}
                                                className="h-20 border-b border-gray-100/50 w-full group hover:bg-primary/5 transition-colors cursor-pointer"
                                            >
                                                <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-full text-[10px] font-black text-primary uppercase tracking-widest">
                                                    Randevu Ekle ({time})
                                                </div>
                                            </div>
                                        ))}

                                        {/* Appointment Blocks */}
                                        {staffAppts.map(apt => {
                                            const start = new Date(apt.start_time);
                                            const hour = start.getHours();
                                            const min = start.getMinutes();
                                            // 09:00 start based offset
                                            const topOffset = ((hour - 9) * 2 + (min >= 30 ? 1 : 0)) * 80; // 80px per 30m slot
                                            const durationBlocks = (apt.service?.duration_min || 30) / 30;
                                            const height = durationBlocks * 80;

                                            return (
                                                <div
                                                    key={apt.id}
                                                    className={`absolute left-2 right-2 rounded-2xl border-2 p-3 overflow-hidden shadow-lg transition-all hover:scale-[1.03] hover:z-20 cursor-pointer ${apt.status === 'CONFIRMED' ? 'bg-blue-50 border-blue-200 text-blue-900' :
                                                        apt.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-900 opacity-70' :
                                                            apt.status === 'CANCELLED' ? 'bg-red-50 border-red-200 text-red-900' :
                                                                'bg-orange-50 border-orange-200 text-orange-900'
                                                        }`}
                                                    style={{ top: `${topOffset}px`, height: `${height}px` }}
                                                >
                                                    <div className="flex flex-col h-full">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <p className="text-[10px] font-black uppercase leading-none">{apt.customer_name}</p>
                                                            <div className="w-2 h-2 rounded-full bg-current opacity-50 shrink-0"></div>
                                                        </div>
                                                        <p className="text-[12px] font-black truncate mt-1">{apt.service?.global_service?.name}</p>
                                                        <div className="mt-auto flex items-center justify-between opacity-70">
                                                            <span className="text-[9px] font-bold">{new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            <MoreVertical className="w-3 h-3" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            {activeBranch && (
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="fixed bottom-8 right-8 z-40 flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-full shadow-2xl hover:bg-primary-hover hover:scale-110 transition-all group"
                >
                    <span className="material-symbols-outlined">add</span>
                    <span className="font-bold hidden group-hover:inline">Manuel Randevu Ekle</span>
                </button>
            )}

            {/* Add Appointment Modal */}
            {activeBranch && (
                <AddAppointmentModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    salonId={activeBranch.id}
                    preselectedDate={selectedDate}
                    onSuccess={() => fetchInitialData()}
                />
            )}
        </div>
    );
}
