import React from 'react';
import { AdminLayout } from './AdminLayout';

export const Dashboard: React.FC = () => {
    return (
        <AdminLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-main">Panel Özeti</h2>
                <p className="text-text-secondary">Sistem genelindeki aktivite ve istatistikler.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { title: 'Toplam Salon', value: '156', icon: 'store', color: 'bg-blue-500' },
                    { title: 'Aktif Randevular', value: '1,240', icon: 'calendar_month', color: 'bg-green-500' },
                    { title: 'Toplam Üye', value: '8,450', icon: 'group', color: 'bg-purple-500' },
                    { title: 'Gelir (Ay)', value: '₺452K', icon: 'payments', color: 'bg-primary' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                        <div className={`size-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center text-${stat.color.replace('bg-', '')}`}>
                             <span className={`material-symbols-outlined ${stat.color.replace('bg-', 'text-')} text-2xl`}>{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-text-secondary text-sm font-medium">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-text-main">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <h3 className="font-bold text-text-main mb-4">Son Eklenen Salonlar</h3>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-gray-100 rounded-lg"></div>
                                    <div>
                                        <p className="font-bold text-sm text-text-main">Elite Hair Studio</p>
                                        <p className="text-xs text-text-secondary">Beşiktaş, İstanbul</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded">Aktif</span>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <h3 className="font-bold text-text-main mb-4">Bekleyen Onaylar</h3>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-gray-100 rounded-full"></div>
                                    <div>
                                        <p className="font-bold text-sm text-text-main">Ahmet Yılmaz</p>
                                        <p className="text-xs text-text-secondary">İşletme Hesabı Başvurusu</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-1.5 text-green-600 hover:bg-green-50 rounded"><span className="material-symbols-outlined">check</span></button>
                                    <button className="p-1.5 text-red-600 hover:bg-red-50 rounded"><span className="material-symbols-outlined">close</span></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};