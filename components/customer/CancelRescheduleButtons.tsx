/**
 * Cancel/Reschedule Appointment Component
 * Enforces cancellation policy and allows rescheduling
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { CalendarDays, XCircle } from 'lucide-react';

interface CancelRescheduleButtonsProps {
    appointment: any;
    onUpdate?: () => void;
}

export function CancelRescheduleButtons({ appointment, onUpdate }: CancelRescheduleButtonsProps) {
    const router = useRouter();
    const [isCancelling, setIsCancelling] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { showToast } = useToast();

    // Cancellation policy: Can cancel up to 3 hours before appointment
    const canCancel = () => {
        const appointmentTime = new Date(appointment.start_time);
        const now = new Date();
        const hoursUntil = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntil >= 3 && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED';
    };

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            // server applies the cancellation policy, deposit refund and audit trail
            const res = await fetch('/api/booking/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId: appointment.id }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Randevu iptal edilemedi.');

            showToast('Randevunuz iptal edildi.', 'success');
            onUpdate?.();
            setShowConfirm(false);
        } catch (err) {
            showToast((err as Error).message || 'Randevu iptal edilemedi. Lütfen tekrar deneyin.', 'error');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleReschedule = () => {
        // Redirect to booking flow with appointment ID for rescheduling
        router.push(`/booking/${appointment.salon_id}/time?appointmentId=${appointment.id}&staffId=${appointment.staff_id}`);
    };

    const isPastAppointment = new Date(appointment.start_time) < new Date();

    return (
        <div className="flex gap-2">
            {!isPastAppointment && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                <>
                    <button
                        onClick={handleReschedule}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        <CalendarDays className="w-4 h-4" aria-hidden="true" />
                        Yeniden Planla
                    </button>

                    <button
                        onClick={() => canCancel() ? setShowConfirm(true) : showToast('Randevuya 3 saatten az kaldı. İptal edilemez.', 'warning')}
                        disabled={!canCancel()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        İptal Et
                    </button>
                </>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-text-main mb-2">Randevuyu İptal Et</h3>
                        <p className="text-text-secondary mb-6">
                            Bu randevuyu iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-gray-50"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:opacity-50"
                            >
                                {isCancelling ? 'İptal Ediliyor...' : 'Evet, İptal Et'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
