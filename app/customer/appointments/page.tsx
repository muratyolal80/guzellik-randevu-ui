'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import AppointmentCard from '@/components/dashboard/AppointmentCard';
import { useRouter } from 'next/navigation';

export default function AppointmentsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Use useAuth hook

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
                        <AppointmentCard
                            key={apt.id}
                            id={apt.id} // Added missing id prop
                            salonId={apt.salon?.id}
                            salonName={apt.salon?.name || 'Salon'}
                            salonAddress={apt.salon?.address || ''}
                            date={new Date(apt.start_time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            time={new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            serviceId={apt.service?.id}
                            serviceName={apt.service?.global_service?.name || 'Hizmet'}
                            staffId={apt.staff?.id}
                            staffName={apt.staff?.name || 'Personel'}
                            price={apt.service?.price || 0}
                            status={apt.status}
                            onCancel={() => handleCancelAppointment(apt.id)}
                            onRate={() => router.push(`/salon/${apt.salon?.id}#reviews`)}
                        />
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
        </div>
    );
}
