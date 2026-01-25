'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import AppointmentCard from '@/components/dashboard/AppointmentCard';
import { CancelRescheduleButtons } from '@/components/customer/CancelRescheduleButtons';
import { RatingModal } from '@/components/customer/RatingModal';
import { useRouter } from 'next/navigation';

export default function AppointmentsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    // Fetch appointments when user is available or tab changes
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
                    .eq('customer_id', user.id) // Filter by logged-in user ID
                    .order('start_time', { ascending: activeTab === 'upcoming' });

                if (activeTab === 'upcoming') {
                    query = query.in('status', ['PENDING', 'CONFIRMED'])
                        .gt('start_time', new Date().toISOString());
                } else if (activeTab === 'past') {
                    query = query.in('status', ['COMPLETED', 'CONFIRMED']) // Include confirmed in past if time passed? Or strictly completed?
                        .lt('start_time', new Date().toISOString());
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
        if (!confirm('Randevuyu iptal etmek istediğinize emin misiniz?')) return;

        try {
            const response = await fetch('/api/booking/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'İptal işlemi başarısız');
            }

            // Remove from list locally for immediate feedback
            setAppointments(prev => prev.filter(a => a.id !== appointmentId));

            // Optional: Show success message via toast if available
            // alert('Randevunuz iptal edildi.'); 

        } catch (error: any) {
            console.error('Error cancelling appointment:', error);
            alert(error.message || 'Randevu iptal edilirken bir hata oluştu.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Randevularım</h1>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto self-start">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg flex-1 md:flex-initial transition-all ${activeTab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Gelecek
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg flex-1 md:flex-initial transition-all ${activeTab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Geçmiş
                    </button>
                    <button
                        onClick={() => setActiveTab('cancelled')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg flex-1 md:flex-initial transition-all ${activeTab === 'cancelled' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        İptal
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                ) : appointments.length > 0 ? (
                    appointments.map((apt) => (
                        <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-text-main">{apt.salon?.name || 'Salon'}</h3>
                                    <p className="text-sm text-text-secondary">{apt.salon?.address}</p>
                                    <div className="mt-3 flex flex-wrap gap-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                                            <span className="font-medium">{new Date(apt.start_time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="material-symbols-outlined text-primary">schedule</span>
                                            <span className="font-medium">{new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="material-symbols-outlined text-primary">content_cut</span>
                                            <span className="font-medium">{apt.service?.global_service?.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-300' :
                                        apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                            apt.status === 'PENDING' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                                                'bg-red-100 text-red-700 border-red-300'
                                    }`}>
                                    {apt.status === 'COMPLETED' ? 'Tamamlandı' :
                                        apt.status === 'CONFIRMED' ? 'Onaylandı' :
                                            apt.status === 'PENDING' ? 'Bekliyor' : 'İptal'}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <div className="text-lg font-bold text-text-main">₺{apt.service?.price || 0}</div>
                                <div className="flex gap-2">
                                    {apt.status === 'COMPLETED' && (
                                        <button
                                            onClick={() => {
                                                setSelectedAppointment(apt);
                                                setRatingModalOpen(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover"
                                        >
                                            <span className="material-symbols-outlined text-sm">star</span>
                                            Değerlendir
                                        </button>
                                    )}
                                    <CancelRescheduleButtons
                                        appointment={apt}
                                        onUpdate={() => {
                                            // Refresh appointments
                                            setAppointments(prev => prev.filter(a => a.id !== apt.id));
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500">
                            {activeTab === 'upcoming' ? 'Gelecek randevunuz bulunmamaktadır.' :
                                activeTab === 'past' ? 'Geçmiş randevunuz bulunmamaktadır.' :
                                    'İptal edilmiş randevunuz bulunmamaktadır.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            {selectedAppointment && (
                <RatingModal
                    isOpen={ratingModalOpen}
                    onClose={() => setRatingModalOpen(false)}
                    appointment={selectedAppointment}
                    salonId={selectedAppointment.salon?.id}
                    onSubmit={() => {
                        setRatingModalOpen(false);
                        setSelectedAppointment(null);
                    }}
                />
            )}
        </div>
    );
}
