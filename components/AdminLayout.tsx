'use client';

import React, { useState } from 'react';
import { Layout } from './Layout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar: React.FC = () => {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>(['Operasyon & Onay', 'Finans', 'Tanımlar']);

    const toggleExpand = (name: string) => {
        setExpandedItems(prev => 
            prev.includes(name) 
                ? prev.filter(i => i !== name) 
                : [...prev, name]
        );
    };
    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
        { 
            name: 'Operasyon & Onay', 
            icon: 'verified_user',
            children: [
                { name: 'Kullanıcı Yönetimi', path: '/admin/users', icon: 'person' },
                { name: 'Salon Yönetimi & Onay', path: '/admin/salons/approvals', icon: 'store' },
                { name: 'Paket Ödeme Onayları', path: '/admin/finance/approvals', icon: 'check_circle' },
            ]
        },
        { 
            name: 'Finans', 
            icon: 'payments',
            children: [
                { name: 'Genel Bakış', path: '/admin/finance', icon: 'account_balance' },
            ]
        },
        { 
            name: 'Tanımlar', 
            icon: 'settings_suggest',
            children: [
                { name: 'Salon Tipleri', path: '/admin/types', icon: 'category' },
                { name: 'Hizmetler', path: '/admin/services', icon: 'cut' },
                { name: 'Hizmet Kategorileri', path: '/admin/service-types', icon: 'format_list_bulleted' },
            ]
        },
        { name: 'IYS Logları', path: '/admin/iys-logs', icon: 'history' },
        { name: 'Ayarlar', path: '/admin/settings', icon: 'settings' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-border flex-shrink-0 p-4 overflow-y-auto">
            <nav className="flex flex-col gap-1">
                {menuItems.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                        {item.children ? (
                            <>
                                <button
                                    onClick={() => toggleExpand(item.name)}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all text-text-secondary hover:bg-gray-100 group`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-base opacity-70 group-hover:opacity-100">{item.icon}</span>
                                        {item.name}
                                    </div>
                                    <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${expandedItems.includes(item.name) ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedItems.includes(item.name) ? 'max-h-96 opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}>
                                    <div className="flex flex-col gap-1 pl-4 ml-3 border-l-2 border-primary/10">
                                        {item.children.map(child => (
                                            <Link
                                                key={child.path}
                                                href={child.path}
                                                className={`flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-[13px] transition-all ${pathname === child.path
                                                    ? 'bg-primary/5 text-primary'
                                                    : 'text-text-muted hover:bg-gray-50 hover:text-text-secondary'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-base">{child.icon}</span>
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Link
                                href={item.path!}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${pathname === item.path
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-text-secondary hover:bg-gray-100 group'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-base ${pathname === item.path ? 'text-white' : 'text-text-muted opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
                                {item.name}
                            </Link>
                        )}
                    </div>
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

