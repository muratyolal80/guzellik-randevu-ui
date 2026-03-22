'use client';

import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';

import { 
    Store, 
    Calendar, 
    CreditCard, 
    Users, 
    TrendingUp, 
    Activity 
} from 'lucide-react';
import { Breadcrumbs } from '@/components/Admin/Breadcrumbs';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
    <div className={`bg-white rounded-[32px] border border-border p-8 shadow-card flex items-center gap-6 hover:scale-[1.02] transition-all`}>
        <div className={`size-16 rounded-2xl flex items-center justify-center ${color} text-white shadow-lg`}>
            <Icon size={32} />
        </div>
        <div>
            <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-black text-text-main tracking-tighter leading-none">{value}</h3>
        </div>
    </div>
);

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardService } from '@/services/db';

export default function Dashboard() {
    const [stats, setStats] = React.useState([
        { title: 'Toplam Salon', value: '0', icon: Store, color: 'bg-blue-600' },
        { title: 'Bugünkü Randevu', value: '0', icon: Calendar, color: 'bg-emerald-600' },
        { title: 'Toplam Ciro', value: '0 TL', icon: CreditCard, color: 'bg-amber-600' },
        { title: 'Aktif Personel', value: '0', icon: Users, color: 'bg-indigo-600' },
    ]);
    const [chartData, setChartData] = React.useState<any[]>([]);
    const [activities, setActivities] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchDashboardData() {
            try {
                const data = await DashboardService.getPlatformStats();

                setStats([
                    { title: 'Toplam Salon', value: data.totalSalons.toString(), icon: Store, color: 'bg-blue-600' },
                    { title: 'Bugünkü Randevu', value: data.todayAppointments.toString(), icon: Calendar, color: 'bg-emerald-600' },
                    { title: 'Toplam Ciro', value: `${data.totalRevenue.toLocaleString('tr-TR')} TL`, icon: CreditCard, color: 'bg-amber-600' },
                    { title: 'Aktif Personel', value: data.activeStaff.toString(), icon: Users, color: 'bg-indigo-600' },
                ]);

                // 2. Fetch Chart Data (Last 7 Days)
                const today = new Date();
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(today.getDate() - (6 - i));
                    return {
                        name: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
                        randevu: Math.floor(Math.random() * 10) + 5, // Demo data for now
                        date: d.toISOString().split('T')[0]
                    };
                });

                setChartData(last7Days);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    return (
        <AdminLayout>
            <Breadcrumbs items={[]} />
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mt-6">
                <div>
                    <h2 className="text-4xl font-black text-text-main tracking-tighter uppercase">Panel <span className="text-primary">Özeti</span></h2>
                    <p className="text-text-secondary font-medium">Platform genel performansı ve anlık takip.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart Section */}
                <div className="bg-white rounded-[40px] border border-border p-10 shadow-card">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="text-primary" size={24} />
                        <h3 className="font-black text-xl text-text-main tracking-tight uppercase">Randevu Grafiği</h3>
                    </div>
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
                <div className="bg-white rounded-[40px] border border-border p-10 shadow-card">
                    <div className="flex items-center gap-3 mb-8">
                        <Activity className="text-primary" size={24} />
                        <h3 className="font-black text-xl text-text-main tracking-tight uppercase">Son Aktiviteler</h3>
                    </div>
                    <ul className="space-y-4">
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


