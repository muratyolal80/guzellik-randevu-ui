'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Heart,
    Bell,
    MessageSquare,
    User,
    LogOut,
    ChevronRight,
    Star
} from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        {
            title: 'Genel Bakış',
            href: '/customer/dashboard',
            icon: LayoutDashboard // 1. Genel Bakış
        },
        {
            title: 'Randevularım',
            href: '/customer/appointments',
            icon: Calendar // 2. Randevularım
        },
        {
            title: 'Favorilerim',
            href: '/customer/favorites',
            icon: Heart // 3. Favorilerim
        },
        {
            title: 'Bildirimler',
            href: '/customer/notifications',
            icon: Bell // 4. Bildirimler
        },
        {
            title: 'Değerlendirmelerim',
            href: '/customer/reviews',
            icon: Star
        },
        {
            title: 'Destek Taleplerim',
            href: '/customer/support',
            icon: MessageSquare // 5. Destek Taleplerim
        },
        {
            title: 'Profil & Ayarlar',
            href: '/customer/profile',
            icon: User // 6. Profil ve Ayarlar
        }
    ];

    const handleLogout = async () => {
        // Implement logout logic or call global logout handler
        console.log('Logging out...');
        // Example: await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="w-64 bg-white h-[calc(100vh-80px)] sticky top-20 flex flex-col border-r border-gray-100 shadow-sm hidden md:flex">
            {/* User Mini Profile (Optional, or can be in Sidebar) */}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-amber-50 text-amber-600 font-medium shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                <span>{item.title}</span>
                            </div>
                            {isActive && <ChevronRight className="w-4 h-4 text-amber-600" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Çıkış Yap</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
