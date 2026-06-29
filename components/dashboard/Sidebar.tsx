'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard,
    Calendar,
    Heart,
    Bell,
    MessageSquare,
    User,
    LogOut,
    ChevronRight,
    Star,
    CreditCard,
    Settings,
} from 'lucide-react';

const menuItems = [
    { title: 'Genel Bakış', short: 'Özet', href: '/customer/dashboard', icon: LayoutDashboard },
    { title: 'Randevularım', short: 'Randevu', href: '/customer/appointments', icon: Calendar },
    { title: 'Favorilerim', short: 'Favori', href: '/customer/favorites', icon: Heart },
    { title: 'Bildirimler', short: 'Bildirim', href: '/customer/notifications', icon: Bell },
    { title: 'Değerlendirmelerim', short: 'Yorum', href: '/customer/reviews', icon: Star },
    { title: 'Ödemelerim', short: 'Ödeme', href: '/customer/payments', icon: CreditCard },
    { title: 'Destek Taleplerim', short: 'Destek', href: '/customer/support', icon: MessageSquare },
    { title: 'Profil', short: 'Profil', href: '/customer/profile', icon: User },
    { title: 'Ayarlar', short: 'Ayarlar', href: '/customer/settings', icon: Settings },
];

// Mobil alt çubukta gösterilecek 5 ana öğe.
const mobileItems = [
    menuItems[0], // Özet
    menuItems[1], // Randevu
    menuItems[2], // Favori
    menuItems[3], // Bildirim
    menuItems[7], // Profil
];

const Sidebar = () => {
    const pathname = usePathname();

    const handleLogout = async () => {
        try { await supabase.auth.signOut(); } catch { /* yine de yönlendir */ }
        window.location.href = '/login';
    };

    return (
        <>
            {/* Masaüstü sidebar */}
            <div className="w-64 bg-white h-[calc(100vh-80px)] sticky top-20 flex-col border-r border-gray-100 shadow-sm hidden md:flex">
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

            {/* Mobil alt navigasyon — sidebar mobilde gizli olduğu için */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-around px-1 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
                {mobileItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${isActive ? 'text-amber-600' : 'text-gray-400'}`}
                        >
                            <item.icon className={`w-[22px] h-[22px] ${isActive ? 'fill-amber-100' : ''}`} />
                            <span className="text-[10px] font-bold">{item.short}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
};

export default Sidebar;
