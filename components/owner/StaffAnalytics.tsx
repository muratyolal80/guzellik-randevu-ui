'use client';

import React, { useState, useEffect } from 'react';
import { StaffAnalyticsService, StaffService } from '@/services/db';
import { Staff } from '@/types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

interface StaffAnalyticsProps {
    salonId: string;
}

export default function StaffAnalytics({ salonId }: StaffAnalyticsProps) {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [todayStats, setTodayStats] = useState<{
        count: number;
        availability: { isAvailable: boolean; nextAvailableSlot?: string };
    } | null>(null);

    useEffect(() => {
        fetchStaff();
    }, [salonId]);

    useEffect(() => {
        if (selectedStaffId) {
            fetchStaffStats(selectedStaffId);
        }
    }, [selectedStaffId]);

    const fetchStaff = async () => {
        try {
            const data = await StaffService.getStaffBySalon(salonId);
            setStaff(data);
            if (data.length > 0 && !selectedStaffId) {
                setSelectedStaffId(data[0].id);
            }
        } catch (err) {
            console.error('Error fetching staff:', err);
        } finally {
            if (staff.length === 0) setLoading(false);
        }
    };

    const fetchStaffStats = async (staffId: string) => {
        setLoading(true);
        try {
            const [todayCount, occupancy, availability] = await Promise.all([
                StaffAnalyticsService.getTodayAppointmentsByStaff(staffId),
                StaffAnalyticsService.getWeeklyOccupancyByStaff(staffId, new Date()),
                StaffAnalyticsService.getCurrentAvailability(staffId)
            ]);

            setTodayStats({
                count: todayCount,
                availability
            });
            setWeeklyData(occupancy);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!selectedStaffId && !loading) {
        return (
            <div className="p-10 text-center bg-gray-50 rounded-[32px] border border-border">
                <p className="text-text-secondary font-medium">Bu şubede henüz personel bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Staff Selector */}
            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
                {staff.map((member) => (
                    <button
                        key={member.id}
                        onClick={() => setSelectedStaffId(member.id)}
                        className={`flex-shrink-0 flex items-center gap-3 p-3 pr-6 rounded-2xl border transition-all ${selectedStaffId === member.id
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                            : 'bg-white text-text-muted border-border hover:bg-gray-50'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl bg-cover bg-center border-2 ${selectedStaffId === member.id ? 'border-white/30' : 'border-gray-100'}`}
                            style={{ backgroundImage: `url(${member.photo || 'https://i.pravatar.cc/100'})` }}
                        />
                        <div className="text-left">
                            <p className="text-sm font-black truncate max-w-[100px]">{member.name}</p>
                            <p className={`text-[10px] uppercase font-bold tracking-wider ${selectedStaffId === member.id ? 'text-white/80' : 'text-text-muted'}`}>
                                {member.specialty}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Status Card */}
                <div className="bg-white p-8 rounded-[32px] border border-border shadow-card relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500">
                        <Clock className="w-32 h-32" />
                    </div>

                    {/* Glassmorphism accents */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-8 flex items-center gap-2 relative z-10">
                        <CheckCircle2 className="w-4 h-4 text-primary" /> BUGÜNKÜ DURUM
                    </h3>

                    <div className="space-y-8 relative z-10">
                        <div>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-5xl font-black text-text-main tracking-tighter antialiased">
                                    {todayStats?.count || 0}
                                </span>
                                <span className="text-sm font-bold text-text-muted uppercase tracking-wider">randevu</span>
                            </div>
                            <p className="text-xs font-bold text-text-secondary mt-1 ml-1 opacity-60">Bugün için planlanan toplam</p>

                            <div className="h-2.5 w-full bg-gray-50 rounded-full mt-6 overflow-hidden border border-gray-100/50 p-[1px]">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-primary-hover rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                                    style={{ width: `${Math.min(((todayStats?.count || 0) / 12) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className={`p-5 rounded-3xl flex items-center gap-5 transition-all duration-300 ${todayStats?.availability.isAvailable
                            ? 'bg-emerald-50/50 text-emerald-700 border border-emerald-100/50'
                            : 'bg-rose-50/50 text-rose-700 border border-rose-100/50'
                            }`}>
                            <div className="relative">
                                <div className={`w-3.5 h-3.5 rounded-full ${todayStats?.availability.isAvailable ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                                    }`} />
                                <div className={`absolute inset-0 w-3.5 h-3.5 rounded-full animate-ping opacity-75 ${todayStats?.availability.isAvailable ? 'bg-emerald-400' : 'bg-rose-400'
                                    }`} />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight antialiased">
                                    {todayStats?.availability.isAvailable ? 'Şu An Müsait' : 'Şu An Dolu'}
                                </p>
                                {!todayStats?.availability.isAvailable && todayStats?.availability.nextAvailableSlot && (
                                    <p className="text-[10px] font-bold opacity-70 mt-0.5 uppercase tracking-wide">
                                        Saat <span className="text-rose-900 font-black">{new Date(todayStats.availability.nextAvailableSlot).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span> itibariyle müsait
                                    </p>
                                )}
                                {todayStats?.availability.isAvailable && (
                                    <p className="text-[10px] font-bold opacity-70 mt-0.5 uppercase tracking-wide">Rezervasyona hazır</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-border shadow-card relative overflow-hidden group hover:shadow-2xl hover:shadow-black/[0.02] transition-all duration-500">
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50" />

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 relative z-10">
                        <div>
                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 mb-1.5">
                                <TrendingUp className="w-4 h-4 text-primary" /> HAFTALIK DOLULUK ANALİZİ
                            </h3>
                            <p className="text-xs font-bold text-text-secondary opacity-60">Son 7 günlük performans grafiği</p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest bg-gray-50/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-400/20"></span> <span className="text-text-muted">Düşük</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> <span className="text-text-muted">Orta</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> <span className="text-text-muted">Yoğun</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('tr-TR', { weekday: 'short' })}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 rounded-xl border border-border shadow-xl text-xs">
                                                    <p className="font-black text-text-main mb-1">
                                                        {new Date(data.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                                    </p>
                                                    <p className="text-primary font-bold">%{data.occupancyPercent} Doluluk</p>
                                                    <p className="text-text-muted mt-1">{data.bookedSlots} / {data.totalSlots} Slot Dolu</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="occupancyPercent" radius={[6, 6, 6, 6]} barSize={32}>
                                    {weeklyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.occupancyPercent > 80 ? '#ef4444' : entry.occupancyPercent > 50 ? '#f59e0b' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
