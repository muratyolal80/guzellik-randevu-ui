/**
 * Add Appointment Modal Component
 * Allows salon owners to manually create appointments
 */

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StaffService, ServiceService, AppointmentService } from '@/services/db';
import { AuditService } from '@/services/audit';
import {
    Users,
    Scissors,
    Calendar,
    Clock,
    User,
    Phone,
    StickyNote,
    X,
    PlusCircle
} from 'lucide-react';

interface AddAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    salonId: string;
    preselectedDate?: Date;
    preselectedStaffId?: string;
    onSuccess?: () => void;
}

export function AddAppointmentModal({
    isOpen,
    onClose,
    salonId,
    preselectedDate,
    preselectedStaffId,
    onSuccess
}: AddAppointmentModalProps) {
    const [staff, setStaff] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [selectedStaffId, setSelectedStaffId] = useState(preselectedStaffId || '');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [selectedDate, setSelectedDate] = useState(
        preselectedDate ? preselectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    );
    const [selectedTime, setSelectedTime] = useState('09:00');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && salonId) {
            fetchData();
        }
    }, [isOpen, salonId]);

    const fetchData = async () => {
        try {
            const [staffList, servicesList] = await Promise.all([
                StaffService.getStaffBySalon(salonId),
                ServiceService.getServicesBySalon(salonId)
            ]);
            setStaff(staffList);
            setServices(servicesList);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!selectedStaffId || !selectedServiceId || !customerName || !customerPhone) {
                setError('Lütfen tüm zorunlu alanları doldurun');
                setLoading(false);
                return;
            }

            const selectedService = services.find(s => s.id === selectedServiceId);
            if (!selectedService) {
                setError('Hizmet bulunamadı');
                setLoading(false);
                return;
            }

            const [hours, minutes] = selectedTime.split(':').map(Number);
            const startTime = new Date(selectedDate);
            startTime.setHours(hours, minutes, 0, 0);

            const endTime = new Date(startTime);
            endTime.setMinutes(startTime.getMinutes() + selectedService.duration_min);

            const { data, error: insertError } = await supabase
                .from('appointments')
                .insert({
                    salon_id: salonId,
                    staff_id: selectedStaffId,
                    salon_service_id: selectedServiceId,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    status: 'CONFIRMED',
                    notes: notes || null
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Log audit
            await AuditService.log({
                action: 'CREATE',
                table_name: 'appointments',
                record_id: data.id,
                new_values: {
                    customer_name: customerName,
                    service: selectedService.service_name,
                    start_time: startTime.toISOString()
                }
            });

            onSuccess?.();
            onClose();
            resetForm();
        } catch (err: any) {
            console.error('Error creating appointment:', err);
            setError(err.message || 'Randevu oluşturulurken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedStaffId(preselectedStaffId || '');
        setSelectedServiceId('');
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
                <div className="bg-gray-50/50 border-b border-border p-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-text-main flex items-center gap-3">
                            <PlusCircle className="w-7 h-7 text-primary" /> Manuel Randevu Ekle
                        </h2>
                        <p className="text-xs text-text-secondary mt-1 font-medium italic">Personel panelinizden hızlıca randevu oluşturun</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-3 hover:bg-white hover:shadow-sm border border-transparent hover:border-border rounded-2xl transition-all"
                    >
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Staff Selection */}
                        <div className="space-y-2.5">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">
                                <Users className="w-3.5 h-3.5" /> Personel <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedStaffId}
                                onChange={(e) => setSelectedStaffId(e.target.value)}
                                className="w-full px-5 py-4 bg-surface-alt border border-border rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                                required
                            >
                                <option value="">Personel seçin</option>
                                {staff.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.specialty})</option>
                                ))}
                            </select>
                        </div>

                        {/* Service Selection */}
                        <div className="space-y-2.5">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">
                                <Scissors className="w-3.5 h-3.5" /> Hizmet <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedServiceId}
                                onChange={(e) => setSelectedServiceId(e.target.value)}
                                className="w-full px-5 py-4 bg-surface-alt border border-border rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                                required
                            >
                                <option value="">Hizmet seçin</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.service_name} • {s.duration_min} dk • ₺{s.price}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">
                                <Calendar className="w-3.5 h-3.5" /> Tarih <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-5 py-4 bg-surface-alt border border-border rounded-2xl font-black text-sm outline-none focus:border-primary transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">
                                <Clock className="w-3.5 h-3.5" /> Saat <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-full px-5 py-4 bg-surface-alt border border-border rounded-2xl font-black text-sm outline-none focus:border-primary transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">
                                <User className="w-3.5 h-3.5" /> Müşteri Adı <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Örn: Ahmet Yılmaz"
                                className="w-full px-5 py-4 bg-surface-alt border border-border rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2.5">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">
                                <Phone className="w-3.5 h-3.5" /> Telefon <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="0555 123 4567"
                                className="w-full px-5 py-4 bg-surface-alt border border-border rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2.5">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">
                            <StickyNote className="w-3.5 h-3.5" /> Notlar
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ek bilgiler..."
                            rows={3}
                            className="w-full px-5 py-4 bg-surface-alt border border-border rounded-2xl font-medium text-sm outline-none focus:border-primary transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-8 py-4 border border-border rounded-2xl font-black text-text-secondary hover:bg-gray-50 hover:text-text-main transition-all"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Kaydediliyor...' : 'Randevu Oluştur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
