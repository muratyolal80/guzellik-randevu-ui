'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Tag, CheckCircle2, XCircle, AlertCircle, Trash2, Printer } from 'lucide-react';
import { Appointment } from '@/types';
import { AppointmentService } from '@/services/db';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AppointmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: any;
    onSuccess: () => void;
}

export default function AppointmentDetailModal({ isOpen, onClose, appointment, onSuccess }: AppointmentDetailModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !appointment) return null;

    const handleStatusUpdate = async (status: Appointment['status']) => {
        try {
            setLoading(true);
            await AppointmentService.updateAppointmentStatus(appointment.id, status, appointment.salon_id);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Randevu durumu güncellenirken hata:', error);
            alert('Güncelleme işlemi başarısız oldu.');
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
        CONFIRMED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        COMPLETED: 'bg-blue-50 text-blue-600 border-blue-200',
        CANCELLED: 'bg-red-50 text-red-600 border-red-200'
    };

    const statusLabels = {
        PENDING: 'Bekliyor',
        CONFIRMED: 'Onaylandı',
        COMPLETED: 'Tamamlandı',
        CANCELLED: 'İptal Edildi'
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl border ${statusColors[appointment.status as keyof typeof statusColors]}`}>
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-main tracking-tight">Randevu Detayları</h2>
                            <p className="text-xs text-text-secondary font-medium mt-0.5">#{appointment.id.split('-')[0].toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-text-muted" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <span className={`px-4 py-2 rounded-full text-xs font-black border ${statusColors[appointment.status as keyof typeof statusColors]}`}>
                            {statusLabels[appointment.status as keyof typeof statusLabels]}
                        </span>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-border">
                            <User className="w-5 h-5 text-primary mt-1" />
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">MÜŞTERİ</p>
                                <p className="text-base font-black text-text-main">{appointment.customer_name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone className="w-3 h-3 text-text-muted" />
                                    <p className="text-xs font-bold text-text-secondary">{appointment.customer_phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-border">
                                <Clock className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">SAAT</p>
                                    <p className="text-sm font-black text-text-main">
                                        {format(new Date(appointment.start_time), 'HH:mm')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-border">
                                <Tag className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">PERSONEL</p>
                                    <p className="text-sm font-black text-text-main">{appointment.staff_name || 'Atanmamış'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-border">
                            <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">HİZMET</p>
                                <p className="text-sm font-black text-text-main">{appointment.title.split('-')[1]?.trim() || 'Hizmet Detayı Yok'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        {appointment.status === 'PENDING' && (
                            <button
                                onClick={() => handleStatusUpdate('CONFIRMED')}
                                disabled={loading}
                                className="col-span-2 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Randevuyu Onayla
                            </button>
                        )}

                        {appointment.status === 'CONFIRMED' && (
                            <button
                                onClick={() => handleStatusUpdate('COMPLETED')}
                                disabled={loading}
                                className="col-span-2 py-4 bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Tamamlandı Olarak İşaretle
                            </button>
                        )}

                        <button
                            onClick={() => handleStatusUpdate('CANCELLED')}
                            disabled={loading || appointment.status === 'CANCELLED'}
                            className={`py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${appointment.status === 'CANCELLED'
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-50 text-red-500 border border-red-100 hover:bg-red-100'
                                }`}
                        >
                            <XCircle className="w-5 h-5" />
                            İptal Et
                        </button>

                        <button
                            onClick={() => window.print()}
                            className="py-4 bg-gray-50 text-text-main border border-border rounded-2xl font-black hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                        >
                            <Printer className="w-5 h-5" />
                            Yazdır
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
