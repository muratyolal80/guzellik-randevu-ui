'use client';

import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';

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

export default function Dashboard() {
    const stats = [
        { title: 'Toplam Salon', value: '78', icon: 'store', color: 'bg-blue-500' },
        { title: 'Toplam Hizmet', value: '256', icon: 'cut', color: 'bg-green-500' },
        { title: 'Aktif Randevu', value: '12', icon: 'calendar_month', color: 'bg-yellow-500' },
        { title: 'Toplam Müşteri', value: '1,289', icon: 'group', color: 'bg-purple-500' },
    ];

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
                <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-text-main mb-4">Haftalık Randevu Grafiği</h3>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-text-secondary">Grafik Alanı</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-text-main mb-4">Son Aktiviteler</h3>
                    <ul className="divide-y divide-gray-100">
                        <li className="py-3 flex items-center justify-between">
                            <p className="text-sm text-text-main">Yeni randevu: <span className="font-bold">Ayşe Yılmaz</span></p>
                            <p className="text-xs text-text-secondary">10 dakika önce</p>
                        </li>
                        <li className="py-3 flex items-center justify-between">
                            <p className="text-sm text-text-main">Yeni salon eklendi: <span className="font-bold">Glamour Güzellik</span></p>
                            <p className="text-xs text-text-secondary">1 saat önce</p>
                        </li>
                        <li className="py-3 flex items-center justify-between">
                            <p className="text-sm text-text-main">Randevu iptal edildi: <span className="font-bold">Fatma Kaya</span></p>
                            <p className="text-xs text-text-secondary">3 saat önce</p>
                        </li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
}

