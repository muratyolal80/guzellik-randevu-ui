'use client';

import React from 'react';
import { Layout } from './Layout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar: React.FC = () => {
    const pathname = usePathname();
    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
        { name: 'Salonlar', path: '/admin/salons', icon: 'store' },
        { name: 'Salon Tipleri', path: '/admin/types', icon: 'category' },
        { name: 'Hizmetler', path: '/admin/services', icon: 'cut' },
        { name: 'Hizmet Kategorileri', path: '/admin/service-types', icon: 'format_list_bulleted' },
        { name: 'IYS Logları', path: '/admin/iys-logs', icon: 'history' },
        { name: 'Ayarlar', path: '/admin/settings', icon: 'settings' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-border flex-shrink-0 p-4">
            <nav className="flex flex-col gap-2">
                {menuItems.map(item => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                            pathname === item.path
                                ? 'bg-primary text-white'
                                : 'text-text-secondary hover:bg-gray-100'
                        }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Layout>
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </Layout>
    );
};

