'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CancelRescheduleButtons } from '@/components/customer/CancelRescheduleButtons';
import { RatingModal } from '@/components/customer/RatingModal';
import {
    CalendarDays, Clock, Scissors, Star,
    CheckCircle2, CircleDot, Ban, AlertCircle, X
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    COMPLETED: {
        label: 'Tamamlandı',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        className: 'bg-green-100 text-green-700 border-green-300',
    },
    CONFIRMED: {
        label: 'Onaylandı',
        icon: <CircleDot className="w-3.5 h-3.5" />,
        className: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    PENDING: {
        label: 'Bekliyor',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        className: 'bg-orange-100 text-orange-700 border-orange-300',
    },
    CANCELLED: {
        label: 'İptal',
        icon: <Ban className="w-3.5 h-3.5" />,
        className: 'bg-red-100 text-red-700 border-red-300',
    },
};

function AppointmentSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-48" />
                    <div className="h-4 bg-gray-100 rounded w-64" />
                    <div className="mt-3 flex gap-3">
                        <div className="h-4 bg-gray-100 rounded w-24" />
                        <div className="h-4 bg-gray-100 rounded w-16" />
                        <div className="h-4 bg-gray-100 rounded w-28" />
                    </div>
                </div>
                <div className="h-7 bg-gray-100 rounded-lg w-24" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="h-6 bg-gray-100 rounded w-16" />
                <div className="h-9 bg-gray-100 rounded-lg w-28" />
            </div>
        </div>
    );
}

export default function AppointmentsPage() {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    React.useEffect(() => {
        if (!user) return;

        const fetchAppointments = async () => {
            try {
                setLoading(true);
                let query = supabase
                    .from('appointments')
                    .select(`
                        *,
                        salon:salons(id, name, address, image),
                        service:salon_services(id, price, duration_min, global_service:global_services(name)),
                        staff:staff(id, name)
                    `)
                    .eq('customer_id', user.id)
                    .order('start_time', { ascending: activeTab === 'upcoming' });

                if (activeTab === 'upcoming') {
                    query = query.in('status', ['PENDING', 'CONFIRMED']).gt('start_time', new Date().toISOString());
                } else if (activeTab === 'past') {
                    query = query.in('status', ['COMPLETED', 'CONFIRMED']).lt('start_time', new Date().toISOString());
                } else if (activeTab === 'cancelled') {
                    query = query.eq('status', 'CANCELLED');
                }

                const { data, error } = await query;
                if (error) throw error;
                setAppointments(data || []);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [user, activeTab]);

    const handleCancelAppointment = async (appointmentId: string) => {
        setCancelling(true);
        try {
            const response = await fetch('/api/booking/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İptal işlemi başarısız');

            setAppointments(prev => prev.filter(a => a.id !== appointmentId));
            setConfirmCancelId(null);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Randevu iptal edilirken bir hata oluştu.';
            alert(msg);
        } finally {
            setCancelling(false);
        }
    };

    const tabs = [
        { key: 'upcoming', label: 'Gelecek' },
        { key: 'past', label: 'Geçmiş' },
        { key: 'cancelled', label: 'İptal' },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Inline cancel confirmation dialog */}
            {confirmCancelId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Ban className="w-5 h-5 text-red-600" />
                            </div>
                            <button onClick={() => setConfirmCancelId(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Randevuyu İptal Et</h3>
                        <p className="text-gray-500 text-sm mb-6">Bu randevuyu iptal etmek istediğinize emin misiniz? İşlem geri alınamaz.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmCancelId(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={() => handleCancelAppointment(confirmCancelId)}
                                disabled={cancelling}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60"
                            >
                                {cancelling ? 'İptal Ediliyor...' : 'Evet, İptal Et'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Randevularım</h1>
                <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto self-start">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg flex-1 md:flex-initial transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <>
                        <AppointmentSkeleton />
                        <AppointmentSkeleton />
                        <AppointmentSkeleton />
                    </>
                ) : appointments.length > 0 ? (
                    appointments.map((apt) => {
                        const statusCfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.CANCELLED;
                        return (
                            <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-text-main">{apt.salon?.name || 'Salon'}</h3>
                                        <p className="text-sm text-text-secondary">{apt.salon?.address}</p>
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <CalendarDays className="w-4 h-4 text-primary" />
                                                <span className="font-medium">
                                                    {new Date(apt.start_time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-primary" />
                                                <span className="font-medium">
                                                    {new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Scissors className="w-4 h-4 text-primary" />
                                                <span className="font-medium">{apt.service?.global_service?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${statusCfg.className}`}>
                                        {statusCfg.icon}
                                        {statusCfg.label}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <div className="text-lg font-bold text-text-main">₺{apt.service?.price || 0}</div>
                                    <div className="flex gap-2">
                                        {apt.status === 'COMPLETED' && (
                                            <button
                                                onClick={() => { setSelectedAppointment(apt); setRatingModalOpen(true); }}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                                            >
                                                <Star className="w-4 h-4" />
                                                Değerlendir
                                            </button>
                                        )}
                                        <CancelRescheduleButtons
                                            appointment={apt}
                                            onUpdate={() => setAppointments(prev => prev.filter(a => a.id !== apt.id))}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarDays className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-700">
                            {activeTab === 'upcoming' ? 'Gelecek randevunuz bulunmamaktadır.' :
                                activeTab === 'past' ? 'Geçmiş randevunuz bulunmamaktadır.' :
                                    'İptal edilmiş randevunuz bulunmamaktadır.'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            {activeTab === 'upcoming' ? 'Yeni bir randevu almak için salonları keşfedin.' : ''}
                        </p>
                    </div>
                )}
            </div>

            {selectedAppointment && (
                <RatingModal
                    isOpen={ratingModalOpen}
                    onClose={() => setRatingModalOpen(false)}
                    appointment={selectedAppointment}
                    salonId={selectedAppointment.salon?.id}
                    onSubmit={() => { setRatingModalOpen(false); setSelectedAppointment(null); }}
                />
            )}
        </div>
    );
}
