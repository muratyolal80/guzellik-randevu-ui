'use client';

import React, { useState, useEffect } from 'react';
import { SalonDataService } from '@/services/db';
import { SalonWorkingHours } from '@/types';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface WorkingHoursTabProps {
    salonId: string;
}

export default function WorkingHoursTab({ salonId }: WorkingHoursTabProps) {
    const [hours, setHours] = useState<SalonWorkingHours[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHours();
    }, [salonId]);

    const fetchHours = async () => {
        try {
            const data = await SalonDataService.getSalonWorkingHours(salonId);
            setHours(data);
        } catch (err) {
            console.error('Error fetching hours:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDay = async (hourId: string, currentStatus: boolean) => {
        try {
            await SalonDataService.updateSalonWorkingHours(hourId, { is_closed: !currentStatus });
            setHours(prev => prev.map(h => h.id === hourId ? { ...h, is_closed: !currentStatus } : h));
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    const handleTimeChange = async (hourId: string, type: 'start' | 'end', value: string) => {
        try {
            if (type === 'start') {
                await SalonDataService.updateSalonWorkingHours(hourId, { start_time: value });
                setHours(prev => prev.map(h => h.id === hourId ? { ...h, start_time: value } : h));
            } else {
                await SalonDataService.updateSalonWorkingHours(hourId, { end_time: value });
                setHours(prev => prev.map(h => h.id === hourId ? { ...h, end_time: value } : h));
            }
        } catch (err) {
            console.error('Time update error:', err);
        }
    };

    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    if (loading) {
        return <div className="text-center p-10"><div className="animate-spin inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header Card */}
            <div className="bg-primary/5 p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-primary/10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-16 h-16 rounded-[24px] bg-white shadow-premium flex items-center justify-center">
                    <Clock className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-text-main">Genel Çalışma Saatleri</h3>
                    <p className="text-sm text-text-muted mt-1 font-medium leading-relaxed">
                        Bu saatler salonun kapılarını açtığı ve kapattığı zamanları temsil eder. Personel vardiyaları bu aralıkta planlanabilir.
                    </p>
                </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-1 gap-4 md:gap-6">
                {hours.sort((a, b) => a.day_of_week - b.day_of_week).map((h) => (
                    <div
                        key={h.id}
                        className={`group p-6 md:p-8 rounded-[32px] border transition-all duration-300 ${h.is_closed
                                ? 'bg-surface-alt border-border opacity-60 grayscale-[0.5]'
                                : 'bg-white border-border shadow-card hover:shadow-xl hover:-translate-y-1'
                            }`}
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
                            {/* Day and Status */}
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-premium shrink-0 ${h.is_closed ? 'bg-gray-100 text-text-muted' : 'bg-primary text-white'
                                    }`}>
                                    {days[h.day_of_week][0]}
                                </div>
                                <div>
                                    <h4 className="text-lg md:text-xl font-black text-text-main leading-tight">{days[h.day_of_week]}</h4>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className={`w-2 h-2 rounded-full ${h.is_closed ? 'bg-red-500' : 'bg-green-500'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${h.is_closed ? 'text-red-500' : 'text-green-600'
                                            }`}>
                                            {h.is_closed ? 'Kapalı' : 'Açık • Çalışıyor'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Hours and Toggle */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
                                {!h.is_closed && (
                                    <div className="flex items-center gap-4 bg-surface-alt px-6 py-4 rounded-[20px] border border-border w-full sm:w-auto justify-center">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter mb-1">Açılış</span>
                                            <input
                                                type="time"
                                                value={h.start_time.substring(0, 5)}
                                                onChange={(e) => handleTimeChange(h.id, 'start', e.target.value)}
                                                className="bg-transparent font-black text-base text-text-main outline-none cursor-pointer"
                                            />
                                        </div>
                                        <div className="w-px h-8 bg-border" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter mb-1">Kapanış</span>
                                            <input
                                                type="time"
                                                value={h.end_time.substring(0, 5)}
                                                onChange={(e) => handleTimeChange(h.id, 'end', e.target.value)}
                                                className="bg-transparent font-black text-base text-text-main outline-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleToggleDay(h.id, h.is_closed)}
                                    className={`w-full sm:w-auto px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${h.is_closed
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
                                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                        }`}
                                >
                                    {h.is_closed ? 'Günü Aktif Et' : 'Dükkanı Kapat'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
