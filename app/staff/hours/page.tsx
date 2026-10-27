'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StaffService, WorkingHoursService } from '@/services/db';
import { Clock, Save, AlertCircle, CalendarDays, Loader2, Check } from 'lucide-react';
import { WorkingHours } from '@/types';
import { useToast } from '@/components/ui/Toast';
import Skeleton from '@/components/Skeleton';

export default function StaffHoursPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hours, setHours] = useState<WorkingHours[]>([]);
    const [staffId, setStaffId] = useState<string | null>(null);

    const DAYS_MAP = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    useEffect(() => {
        if (user) fetchHours();
    }, [user]);

    const fetchHours = async () => {
        try {
            setLoading(true);
            // Get staff ID first
            const staffMemberId = user ? await StaffService.getStaffIdByUserId(user.id) : null;

            if (!staffMemberId) {
                console.warn('No staff profile found');
                setLoading(false);
                return;
            }

            setStaffId(staffMemberId);
            const data = await WorkingHoursService.getWorkingHoursByStaff(staffMemberId);

            // Ensure all days 0-6 exist, if not create placeholders
            const filledHours: WorkingHours[] = [];
            for (let i = 0; i <= 6; i++) {
                // Adjust sort order to start Monday (1) -> Sunday (0 at end usually, but logic keeps 0=Sun)
                // Display order will be handled in render
                const existing = data.find(h => h.day_of_week === i);
                if (existing) {
                    filledHours.push(existing);
                } else {
                    filledHours.push({
                        staff_id: staffMemberId,
                        day_of_week: i,
                        start_time: '09:00:00',
                        end_time: '19:00:00',
                        is_day_off: i === 0 // Default Sunday off
                    } as WorkingHours);
                }
            }
            setHours(filledHours);

        } catch (error) {
            console.error('Error fetching hours:', error);
            showToast('Çalışma saatleri yüklenemedi.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
        setHours(prev => prev.map(h => {
            if (h.day_of_week === dayOfWeek) {
                return { ...h, [field]: value + ':00' }; // Ensure HH:MM:SS format if value is HH:MM
            }
            return h;
        }));
    };

    const handleToggleDayOff = (dayOfWeek: number) => {
        setHours(prev => prev.map(h => {
            if (h.day_of_week === dayOfWeek) {
                return { ...h, is_day_off: !h.is_day_off };
            }
            return h;
        }));
    };

    const handleSave = async () => {
        if (!staffId) return;
        setSaving(true);
        try {
            // Save all rows
            await Promise.all(hours.map(h => {
                // Remove id if it's a placeholder (undefined id) so upsert creates it
                // But WorkingHours type might enforce id. For DB service upsert, we need proper object.
                // Service method takes Omit<..., 'id'>
                const { id: _id, created_at: _createdAt, ...updateData } = h;
                return WorkingHoursService.setWorkingHours({
                    ...updateData,
                    start_time: updateData.start_time.length === 5 ? updateData.start_time + ':00' : updateData.start_time,
                    end_time: updateData.end_time.length === 5 ? updateData.end_time + ':00' : updateData.end_time
                });
            }));

            showToast('Çalışma saatleri güncellendi.', 'success');
            // Refresh to get new IDs
            fetchHours();
        } catch (error) {
            console.error('Save error:', error);
            showToast('Kaydedilirken bir hata oluştu.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Helper to sort days starting from Monday (1) to Sunday (0)
    const sortedHours = [...hours].sort((a, b) => {
        const dayA = a.day_of_week === 0 ? 7 : a.day_of_week;
        const dayB = b.day_of_week === 0 ? 7 : b.day_of_week;
        return dayA - dayB;
    });

    if (loading) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto" aria-busy="true" aria-label="Yükleniyor">
                <Skeleton className="h-24 w-full rounded-[32px]" />
                <div className="bg-white rounded-[32px] border border-border p-6 space-y-4">
                    {[0, 1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (!staffId) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100 max-w-lg mx-auto mt-20">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-bold text-red-800">Personel Kaydı Bulunamadı</h3>
                <p className="text-red-600 mt-2">Bu hesaba bağlı bir personel profili sistemde kayıtlı değil.</p>
                <div className="mt-6 bg-white p-4 rounded-xl border border-red-100 text-left">
                    <p className="text-sm font-bold text-gray-700 mb-2">Nasıl Çözülür?</p>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                        <li>Salon sahibinizle iletişime geçin.</li>
                        <li>Sizi <strong>Personel Yönetimi</strong> panelinden eklemesini isteyin.</li>
                        <li>E-posta adresinizin doğru girildiğinden emin olun.</li>
                    </ol>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[32px] border border-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-text-main tracking-tight flex items-center gap-3">
                        <Clock className="w-8 h-8 text-primary" aria-hidden="true" />
                        Çalışma Saatleri
                    </h1>
                    <p className="text-text-secondary font-medium">Haftalık çalışma planınızı buradan düzenleyebilirsiniz.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Save className="w-5 h-5" aria-hidden="true" />}
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
            </div>

            <div className="bg-white rounded-[32px] border border-border shadow-card overflow-hidden">
                <div className="hidden md:block p-6 border-b border-border bg-gray-50/50">
                    <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                        <div className="col-span-1 md:col-span-3">Gün</div>
                        <div className="col-span-1 md:col-span-3">Durum</div>
                        <div className="col-span-1 md:col-span-3">Başlangıç</div>
                        <div className="col-span-1 md:col-span-3">Bitiş</div>
                    </div>
                </div>
                <div className="divide-y divide-gray-100">
                    {sortedHours.map((h) => {
                        const isOff = h.is_day_off;
                        return (
                            <div key={h.day_of_week} className={`p-6 transition-colors ${isOff ? 'bg-gray-50/50' : 'hover:bg-blue-50/30'}`}>
                                <div className="grid grid-cols-2 md:grid-cols-12 gap-4 items-center">
                                    <div className="col-span-1 md:col-span-3">
                                        <span className={`font-black text-lg ${isOff ? 'text-text-muted' : 'text-text-main'}`}>
                                            {DAYS_MAP[h.day_of_week]}
                                        </span>
                                    </div>
                                    <div className="col-span-1 md:col-span-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={!isOff}
                                                onChange={() => handleToggleDayOff(h.day_of_week)}
                                            />
                                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                                            <span className="ml-3 text-sm font-bold text-text-secondary">
                                                {isOff ? 'İzinli' : 'Çalışıyor'}
                                            </span>
                                        </label>
                                    </div>
                                    <div className="col-span-1 md:col-span-3">
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={h.start_time.substring(0, 5)}
                                                onChange={(e) => handleTimeChange(h.day_of_week, 'start_time', e.target.value)}
                                                aria-label={`${DAYS_MAP[h.day_of_week]} başlangıç saati`}
                                                disabled={isOff}
                                                className="w-full bg-white border border-border rounded-xl px-4 py-2 text-text-main font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-400 transition-all text-center"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-3">
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={h.end_time.substring(0, 5)}
                                                onChange={(e) => handleTimeChange(h.day_of_week, 'end_time', e.target.value)}
                                                aria-label={`${DAYS_MAP[h.day_of_week]} bitiş saati`}
                                                disabled={isOff}
                                                className="w-full bg-white border border-border rounded-xl px-4 py-2 text-text-main font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-400 transition-all text-center"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                    <h4 className="font-bold text-blue-900 text-sm">Bilgilendirme</h4>
                    <p className="text-blue-700 text-sm mt-1">
                        Yaptığınız değişiklikler randevu takvimini etkileyecektir. Pasife aldığınız (izinli) günlerde müşteriler randevu oluşturamaz.
                    </p>
                </div>
            </div>
        </div>
    );
}
