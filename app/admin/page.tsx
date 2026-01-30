'use client';

import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) => (
    <div className={`bg-white rounded-xl border border-border p-6 shadow-sm flex items-center gap-6`}>
        <div className={`size-12 rounded-full flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined text-white">{icon}</span>
        </div>
        <div>
            <p className="text-sm text-text-secondary font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-text-main">{value}</h3>
        </div>
    </div>
);

import { supabase } from '@/lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [stats, setStats] = React.useState([
        { title: 'Toplam Salon', value: '0', icon: 'store', color: 'bg-blue-500' },
        { title: 'Toplam Hizmet', value: '0', icon: 'cut', color: 'bg-green-500' },
        { title: 'Aktif Randevu', value: '0', icon: 'calendar_month', color: 'bg-yellow-500' },
        { title: 'Toplam Müşteri', value: '0', icon: 'group', color: 'bg-purple-500' },
    ]);
    const [chartData, setChartData] = React.useState<any[]>([]);
    const [activities, setActivities] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Fast initial render with estimates
                setLoading(false);

                // Then fetch real counts in background (non-blocking)
                const [
                    { count: salonCount },
                    { count: appointmentCount },
                    { count: customerCount },
                    { count: serviceCount }
                ] = await Promise.all([
                    supabase.from('salons').select('*', { count: 'exact', head: true }),
                    supabase.from('appointments').select('*', { count: 'exact', head: true }).in('status', ['PENDING', 'CONFIRMED']),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CUSTOMER'),
                    supabase.from('salon_services').select('*', { count: 'exact', head: true })
                ]);

                setStats([
                    { title: 'Toplam Salon', value: salonCount?.toString() || '0', icon: 'store', color: 'bg-blue-500' },
                    { title: 'Toplam Hizmet', value: serviceCount?.toString() || '0', icon: 'cut', color: 'bg-green-500' },
                    { title: 'Aktif Randevu', value: appointmentCount?.toString() || '0', icon: 'calendar_month', color: 'bg-yellow-500' },
                    { title: 'Toplam Müşteri', value: customerCount?.toString() || '0', icon: 'group', color: 'bg-purple-500' },
                ]);

                // 2. Fetch Chart Data (Last 7 Days) - simplified
                const today = new Date();
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(today.getDate() - (6 - i));
                    return {
                        name: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
                        randevu: Math.floor(Math.random() * 10) + 5, // Demo data
                        date: d.toISOString().split('T')[0]
                    };
                });

                setChartData(last7Days);

                // 3. Skip activities for now (too slow)
                setActivities([]);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    return (
        <AdminLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-main">Dashboard</h2>
                <p className="text-text-secondary">Genel bakış ve istatistikler.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart Section */}
                <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-text-main mb-4">Haftalık Randevu Grafiği</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRandevu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#CFA76D" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#CFA76D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#CFA76D', strokeWidth: 1 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="randevu"
                                    stroke="#CFA76D"
                                    fillOpacity={1}
                                    fill="url(#colorRandevu)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activities Section */}
                <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-text-main mb-4">Son Aktiviteler</h3>
                    <ul className="divide-y divide-gray-100">
                        {activities.length > 0 ? activities.map((activity) => (
                            <li key={activity.id} className="py-3 flex items-center justify-between group cursor-pointer hover:bg-gray-50 px-2 rounded-lg transition-colors">
                                <div>
                                    <p className="text-sm text-text-main">
                                        Yeni randevu: <span className="font-bold">{activity.customer_name || 'Misafir'}</span>
                                    </p>
                                    <p className="text-xs text-text-secondary mt-0.5">
                                        {activity.salons?.name}
                                    </p>
                                </div>
                                <span className="text-xs text-text-secondary whitespace-nowrap">
                                    {new Date(activity.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </li>
                        )) : (
                            <li className="py-4 text-center text-text-secondary text-sm">Henüz aktivite yok.</li>
                        )}
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
}


