'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import BranchSelector from '@/components/owner/BranchSelector';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    TrendingUp,
    Store,
    LogOut,
    AlertCircle,
    User,
    Scissors
} from 'lucide-react';

const OwnerSidebar: React.FC = () => {
    const pathname = usePathname();
    const { user } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
        { name: 'Salonlarım', path: '/owner/salons', icon: Store },
        { name: 'Saha Takvimi', path: '/owner/calendar', icon: Calendar },
        { name: 'Hizmet Yönetimi', path: '/owner/services', icon: Scissors },
        { name: 'Personel Yönetimi', path: '/owner/staff', icon: Users },
        { name: 'Finansal Raporlar', path: '/owner/reports', icon: TrendingUp },
    ];

    return (
        <aside className="w-64 bg-white border-r border-border flex-shrink-0 p-4 hidden lg:flex flex-col h-[calc(100vh-64px)] sticky top-16 scroll-mt-16">
            <div className="mb-8 px-4 py-4 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col gap-1">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                        <Store className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">İŞLETME YÖNETİMİ</p>
                        <p className="text-sm font-black text-text-main truncate">Salon Sahibi Paneli</p>
                    </div>
                </div>
            </div>

            <nav className="flex flex-col gap-1.5 flex-1">
                {menuItems.map(item => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${pathname.startsWith(item.path)
                            ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                            : 'text-text-secondary hover:bg-gray-50 hover:translate-x-1'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="pt-4 border-t border-border mt-auto">
                <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-full h-full p-2 text-gray-400" />
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold text-text-main truncate">{user?.full_name}</p>
                        <p className="text-[9px] text-text-muted font-bold truncate tracking-tight">{user?.email}</p>
                    </div>
                </div>
                <button className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all w-full text-left">
                    <LogOut className="w-4 h-4" />
                    Oturumu Kapat
                </button>
            </div>
        </aside>
    );
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    const { user, isOwner, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Role Protection (Only SALON_OWNER or SUPER_ADMIN can enter)
    if (!user || !isOwner) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="p-10 bg-white rounded-[40px] border border-border shadow-card text-center max-w-md w-full">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8">
                        <AlertCircle className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-black text-text-main mb-3 tracking-tight">Yetkisiz Erişim</h1>
                    <p className="text-text-secondary font-medium mb-10">Salon yönetimi için gerekli izinlere sahip değilsiniz.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-primary text-white font-black hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                    >
                        Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="flex bg-gray-50 min-h-[calc(100vh-64px)]">
                <OwnerSidebar />
                <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </Layout>
    );
}
