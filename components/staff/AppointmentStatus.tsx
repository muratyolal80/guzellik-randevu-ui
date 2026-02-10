/**
 * Appointment Status Manager Component
 * Allows staff to update appointment status with workflow transitions
 */

'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AuditService } from '@/services/audit';

interface AppointmentStatusProps {
    appointment: any;
    onUpdate: () => void;
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [],
    'CANCELLED': []
};

const STATUS_LABELS: Record<string, string> = {
    'PENDING': 'Bekliyor',
    'CONFIRMED': 'Onaylandı',
    'COMPLETED': 'Tamamlandı',
    'CANCELLED': 'İptal'
};

const STATUS_COLORS: Record<string, string> = {
    'PENDING': 'bg-orange-100 text-orange-700 border-orange-300',
    'CONFIRMED': 'bg-blue-100 text-blue-700 border-blue-300',
    'COMPLETED': 'bg-green-100 text-green-700 border-green-300',
    'CANCELLED': 'bg-red-100 text-red-700 border-red-300'
};

export function AppointmentStatus({ appointment, onUpdate }: AppointmentStatusProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [showActions, setShowActions] = useState(false);

    const currentStatus = appointment.status;
    const availableTransitions = STATUS_TRANSITIONS[currentStatus] || [];

    const handleStatusUpdate = async (newStatus: string) => {
        if (isUpdating) return;

        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', appointment.id);

            if (error) throw error;

            // Log audit
            await AuditService.logAppointmentStatusChange(
                appointment.id,
                currentStatus,
                newStatus
            );

            onUpdate();
            setShowActions(false);
        } catch (err) {
            console.error('Status update failed:', err);
            alert('Durum güncellenemedi. Lütfen tekrar deneyin.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (availableTransitions.length === 0) {
        return (
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${STATUS_COLORS[currentStatus]}`}>
                {STATUS_LABELS[currentStatus]}
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowActions(!showActions)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 hover:scale-105 transition-transform ${STATUS_COLORS[currentStatus]}`}
            >
                {STATUS_LABELS[currentStatus]}
                <span className="material-symbols-outlined text-xs">expand_more</span>
            </button>

            {showActions && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-border rounded-lg shadow-xl z-50 min-w-[180px] overflow-hidden">
                    <div className="p-2 space-y-1">
                        <div className="px-3 py-2 text-xs font-bold text-text-muted border-b border-border">
                            Durumu Değiştir
                        </div>
                        {availableTransitions.map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusUpdate(status)}
                                disabled={isUpdating}
                                className={`w-full px-3 py-2 text-left text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 ${status === 'CONFIRMED' ? 'text-blue-700' :
                                        status === 'COMPLETED' ? 'text-green-700' :
                                            'text-red-700'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">
                                    {status === 'CONFIRMED' ? 'check_circle' :
                                        status === 'COMPLETED' ? 'task_alt' : 'cancel'}
                                </span>
                                {STATUS_LABELS[status]}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowActions(false)}
                            className="w-full px-3 py-2 text-sm text-text-secondary hover:bg-gray-50 rounded-lg transition-colors border-t border-border mt-2"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
