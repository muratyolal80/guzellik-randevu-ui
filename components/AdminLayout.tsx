'use client';

import React, { useState } from 'react';
import { Layout } from './Layout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    ShieldCheck, 
    Users, 
    Store, 
    CheckCircle, 
    Wallet, 
    CreditCard, 
    Settings2, 
    Tag, 
    Scissors, 
    ListTodo, 
    History, 
    Settings,
    ChevronDown,
    MessageCircle,
    ShoppingCart,
    PlusCircle
} from 'lucide-react';

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
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { 
            name: 'Operasyon & Onay', 
            icon: ShieldCheck,
            children: [
                { name: 'Kullanıcı Yönetimi', path: '/admin/users', icon: Users },
                { name: 'Salon Yönetimi & Onay', path: '/admin/salons/approvals', icon: Store },
                { name: 'Salon Ekle', path: '/admin/salons/new', icon: PlusCircle },
<<<<<<< HEAD
                { name: 'Paket Yönetimi', path: '/admin/finance/packages', icon: CheckCircle },
                { name: 'Hızlı Paket Atama', path: '/admin/finance/purchase', icon: ShoppingCart },
=======
                { name: 'Paket Ödeme Onayları', path: '/admin/finance/approvals', icon: CheckCircle },
                { name: 'Paket Satın Al', path: '/admin/finance/purchase', icon: ShoppingCart },
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
            ]
        },
        { 
            name: 'Finans', 
            icon: Wallet,
            children: [
                { name: 'Genel Bakış', path: '/admin/finance', icon: CreditCard },
            ]
        },
        { 
            name: 'Tanımlar', 
            icon: Settings2,
            children: [
                { name: 'Salon Tipleri', path: '/admin/types', icon: Tag },
                { name: 'Hizmetler', path: '/admin/services', icon: Scissors },
                { name: 'Hizmet Kategorileri', path: '/admin/service-types', icon: ListTodo },
            ]
        },
        { name: 'Destek Talepleri', path: '/admin/support', icon: MessageCircle },
        { name: 'IYS Logları', path: '/admin/iys-logs', icon: History },
        { name: 'Ayarlar', path: '/admin/settings', icon: Settings },
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
                                        <item.icon size={18} className="opacity-70 group-hover:opacity-100" />
                                        {item.name}
                                    </div>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${expandedItems.includes(item.name) ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedItems.includes(item.name) ? 'max-h-96 opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}>
                                    <div className="flex flex-col gap-1 pl-4 ml-3 border-l-2 border-primary/10">
                                        {item.children.map(child => (
                                            <Link
                                                key={child.path}
                                                href={child.path}
                                                className={`flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-[13px] transition-all ${pathname.startsWith(child.path)
                                                    ? 'bg-primary/5 text-primary'
                                                    : 'text-text-muted hover:bg-gray-50 hover:text-text-secondary'
                                                    }`}
                                            >
                                                <child.icon size={16} />
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
                                <item.icon size={18} className={`${pathname === item.path ? 'text-white' : 'text-text-muted opacity-70 group-hover:opacity-100'}`} />
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
export default AdminLayout;
