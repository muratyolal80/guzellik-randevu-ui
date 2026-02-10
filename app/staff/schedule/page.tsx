'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';

export default function StaffSchedule() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    // Filter appointments for the current week
    useEffect(() => {
        if (!user) return;
        fetchWeeklyAppointments();
    }, [user, currentDate]);

    const fetchWeeklyAppointments = async () => {
        try {
            setLoading(true);

            // Get staff ID
            const { data: staffMember } = await supabase
                .from('staff')
                .select('id')
                .eq('user_id', user?.id)
                .single();

            if (!staffMember) return;

            // Calculate week range
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
            endOfWeek.setHours(23, 59, 59, 999);

            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    service:salon_services(price, duration_min, global_service:global_services(name))
                `)
                .eq('staff_id', staffMember.id)
                .gte('start_time', startOfWeek.toISOString())
                .lte('start_time', endOfWeek.toISOString())
                .order('start_time', { ascending: true });

            if (error) throw error;
            setAppointments(data || []);

        } catch (err) {
            console.error('Error fetching weekly appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const nextWeek = () => {
        const next = new Date(currentDate);
        next.setDate(currentDate.getDate() + 7);
        setCurrentDate(next);
    };

    const prevWeek = () => {
        const prev = new Date(currentDate);
        prev.setDate(currentDate.getDate() - 7);
        setCurrentDate(prev);
    };

    // Helper to get days of the current week
    const getWeekDays = () => {
        const days = [];
        const monday = new Date(currentDate);
        monday.setDate(currentDate.getDate() - currentDate.getDay() + 1);

        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = getWeekDays();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tight">Haftalık Takvim</h1>
                    <p className="text-text-secondary font-medium">Randevu planınızı buradan takip edin.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-border shadow-sm">
                    <button onClick={prevWeek} className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-text-secondary" /></button>
                    <div className="px-4 font-bold text-sm text-text-main flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        {weekDays[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <button onClick={nextWeek} className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-text-secondary" /></button>
                </div>
            </div>

            {/* Weekly Grid */}
            <div className="bg-white rounded-3xl border border-border shadow-card overflow-hidden">
                <div className="grid grid-cols-7 border-b border-border bg-gray-50/50">
                    {weekDays.map((day, idx) => (
                        <div key={idx} className={`p-4 text-center border-r border-border last:border-r-0 ${day.toDateString() === new Date().toDateString() ? 'bg-primary/5' : ''}`}>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{day.toLocaleDateString('tr-TR', { weekday: 'short' })}</p>
                            <p className={`text-xl font-black ${day.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-text-main'}`}>{day.getDate()}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 h-[600px] overflow-y-auto">
                    {weekDays.map((day, dayIdx) => {
                        const dayAppts = appointments.filter(a => new Date(a.start_time).toDateString() === day.toDateString());

                        return (
                            <div key={dayIdx} className="min-h-full border-r border-border last:border-r-0 p-2 space-y-2 bg-gray-50/20">
                                {loading ? (
                                    <div className="h-full flex items-center justify-center opacity-20">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : dayAppts.length > 0 ? (
                                    dayAppts.map((apt) => (
                                        <button
                                            key={apt.id}
                                            onClick={() => setSelectedAppointment(apt)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden group ${apt.status === 'COMPLETED' ? 'bg-green-50 border-green-100' :
                                                apt.status === 'CANCELLED' ? 'bg-red-50 border-red-100 opacity-60' :
                                                    apt.status === 'PENDING' ? 'bg-orange-50 border-orange-100' :
                                                        'bg-white border-border'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-text-main">
                                                    {new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="text-xs font-black text-text-main truncate line-clamp-1">{apt.customer_name}</span>
                                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-tight truncate">{apt.service?.global_service?.name}</span>
                                            </div>
                                            {/* Status indicator pill */}
                                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-current"></div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="h-full flex items-center justify-center opacity-10">
                                        <CalendarIcon className="w-8 h-8 text-text-muted rotate-12" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Appointment Detail Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedAppointment(null)}>
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-border bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-black text-text-main">Randevu Detayı</h3>
                            <button onClick={() => setSelectedAppointment(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><XCircle className="w-5 h-5 text-text-secondary" /></button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-muted uppercase tracking-widest">MÜŞTERİ</p>
                                    <h4 className="text-2xl font-black text-text-main tracking-tight">{selectedAppointment.customer_name}</h4>
                                    <p className="text-sm font-medium text-text-secondary">{selectedAppointment.customer_phone}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-border">
                                    <p className="text-[10px] font-bold text-text-muted uppercase mb-1">TARİH & SAAT</p>
                                    <div className="flex items-center gap-2 text-text-main font-black">
                                        <Clock className="w-4 h-4 text-primary" />
                                        {new Date(selectedAppointment.start_time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} | {new Date(selectedAppointment.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-border">
                                    <p className="text-[10px] font-bold text-text-muted uppercase mb-1">ÜCRET</p>
                                    <div className="flex items-center gap-2 text-text-main font-black">
                                        ₺ {selectedAppointment.service?.price}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-surface-alt rounded-2xl border border-border">
                                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">HİZMET</p>
                                <p className="text-sm font-bold text-text-main">{selectedAppointment.service?.global_service?.name}</p>
                                <p className="text-[11px] text-text-muted mt-1">Tahmini Süre: {selectedAppointment.service?.duration_min} Dakika</p>
                            </div>

                            {selectedAppointment.notes && (
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                                    <Info className="w-5 h-5 text-blue-500 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">MÜŞTERİ NOTU</p>
                                        <p className="text-sm text-blue-800 leading-relaxed font-medium">{selectedAppointment.notes}</p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 flex flex-col gap-3">
                                {selectedAppointment.status === 'CONFIRMED' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => alert('Müşteri geldi olarak işaretlendi (Demo)')}
                                            className="py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <User className="w-5 h-5" />
                                            Müşteri Geldi
                                        </button>
                                        <button
                                            onClick={() => {
                                                const delay = prompt('Gecikme süresi (dakika):', '15');
                                                if (delay) alert(`${selectedAppointment.customer_name} adlı müşteriye ${delay} dakika gecikme bilgisi SMS olarak gönderildi.`);
                                            }}
                                            className="py-3 bg-orange-50 text-orange-700 rounded-2xl font-bold hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Clock className="w-5 h-5" />
                                            Gecikme Bildir
                                        </button>
                                        <button className="col-span-2 w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" /> Randevuyu Tamamla
                                        </button>
                                    </div>
                                )}
                                <button onClick={() => setSelectedAppointment(null)} className="w-full py-3 bg-gray-100 text-text-main rounded-2xl font-bold hover:bg-gray-200 transition-all">Pencereyi Kapat</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
