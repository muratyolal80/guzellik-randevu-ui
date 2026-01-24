'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import Link from 'next/link';
import { Calendar, CreditCard, Star, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth(); // Retrieve user from context
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        upcomingCount: 0,
        totalSpent: 0,
        reviewCount: 0
    });
    const [nextAppointment, setNextAppointment] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        // If auth is still loading, wait
        if (authLoading) return;

        // If no user after auth load, redirect (though middleware handles this, nice to have safeguard)
        if (!user) {
            router.push('/login');
            return;
        }

        async function fetchData() {
            console.time('Dashboard Data Fetch');
            try {
                if (!user?.id) {
                    console.warn('Dashboard: User ID missing, skipping fetch');
                    setLoading(false);
                    return;
                }

                // Calculate start and end of current month
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

                // Fetch Stats & Next Appointment in Parallel

                const upcomingQuery = supabase
                    .from('appointments')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'CONFIRMED')
                    .gt('start_time', new Date().toISOString())
                    .eq('customer_id', user.id);

                const reviewQuery = supabase
                    .from('reviews')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                // Spending Query: Appointments in this month that are CONFIRMED or COMPLETED
                const spendingQuery = supabase
                    .from('appointments')
                    .select(`
                        salon_service:salon_services (
                            price
                        )
                    `)
                    .in('status', ['CONFIRMED', 'COMPLETED'])
                    .gte('start_time', startOfMonth)
                    .lte('start_time', endOfMonth)
                    .eq('customer_id', user.id);

                const nextAppointmentQuery = supabase
                    .from('appointments')
                    .select(`
                        *,
                        salon:salons (
                            name,
                            address,
                            image,
                            city:cities(name),
                            district:districts(name)
                        ),
                        service:salon_services (
                            price,
                            global_service:global_services(name)
                        )
                    `)
                    .gt('start_time', new Date().toISOString())
                    .eq('status', 'CONFIRMED')
                    .eq('customer_id', user.id)
                    .order('start_time', { ascending: true })
                    .limit(1);

                // Run all queries together
                const [
                    { count: upcomingCount },
                    { count: reviewCount },
                    { data: spendingData },
                    { data: appointments }
                ] = await Promise.all([
                    upcomingQuery,
                    reviewQuery,
                    spendingQuery,
                    nextAppointmentQuery
                ]);

                console.timeEnd('Dashboard Data Fetch');

                // Calculate total spent
                const totalSpent = spendingData?.reduce((sum, item: any) => {
                    return sum + (item.salon_service?.price || 0);
                }, 0) || 0;

                setStats({
                    upcomingCount: upcomingCount || 0,
                    totalSpent: totalSpent,
                    reviewCount: reviewCount || 0
                });

                if (appointments && appointments.length > 0) {
                    setNextAppointment(appointments[0]);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Hoşgeldin, {user?.first_name || 'Misafir'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Hesap özetin ve yaklaşan randevuların.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Yaklaşan Randevu"
                    value={`${stats.upcomingCount} Adet`}
                    icon={Calendar}
                    color="amber"
                    action={stats.upcomingCount > 0 && <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Aktif</span>}
                />
                <StatCard
                    label="Bu Ay Harcama"
                    value={`${stats.totalSpent} ₺`}
                    icon={CreditCard}
                    color="green"
                />
                <StatCard
                    label="Değerlendirmelerim"
                    value={stats.reviewCount}
                    icon={Star}
                    color="purple"
                />
            </div>

            {/* Next Appointment Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Sıradaki Randevun</h2>
                    <Link href="/appointments" className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center">
                        Tümünü Gör <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {nextAppointment ? (
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-full md:w-24 h-24 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                            <img
                                src={nextAppointment.salon?.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=200"}
                                alt="Salon"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{nextAppointment.salon?.name}</h3>
                            <div className="flex items-center text-gray-500 text-sm mt-1 gap-4">
                                <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {nextAppointment.salon?.district?.name}, {nextAppointment.salon?.city?.name}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <span className="flex items-center text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-lg text-sm">
                                    <Calendar className="w-4 h-4 mr-1.5" />
                                    {new Date(nextAppointment.start_time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="flex items-center text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm">
                                    ✂️ {nextAppointment.service?.global_service?.name || 'Hizmet'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium shadow-sm shadow-green-200 w-full md:w-auto">
                                Detaylar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Yaklaşan randevunuz bulunmamaktadır.
                    </div>
                )}
            </div>

            {/* Recommendations or other content */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Sana Özel Öneriler</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Mock Recommendations for now as we don't have a sophisticated recommendation engine yet */}
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="h-40 bg-gray-100 relative">
                                <img src={`https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=400&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <span className="absolute top-2 right-2 bg-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm flex items-center">
                                    <Star className="w-3 h-3 text-amber-500 mr-1" fill="currentColor" /> 4.9
                                </span>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900">Elite Hair Studio</h4>
                                <p className="text-xs text-gray-500 mt-1">Şişli, İstanbul</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
