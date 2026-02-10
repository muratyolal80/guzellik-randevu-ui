'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import {
    Calendar,
    LayoutDashboard,
    User,
    Clock,
    LogOut,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const StaffSidebar: React.FC = () => {
    const pathname = usePathname();
    const { user } = useAuth();

    const menuItems = [
        { name: 'Bugün', path: '/staff/dashboard', icon: LayoutDashboard },
        { name: 'Takvimim', path: '/staff/schedule', icon: Calendar },
        { name: 'Çalışma Saatleri', path: '/staff/hours', icon: Clock },
        { name: 'Profilim', path: '/staff/profile', icon: User },
    ];

    return (
        <aside className="w-64 bg-white border-r border-border flex-shrink-0 p-4 hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
            <div className="mb-8 px-4 py-3 bg-gray-50 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <User className="w-5 h-5" />
                    )}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-text-main truncate">{user?.full_name || 'Personel'}</p>
                    <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">UZMAN</p>
                </div>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
                {menuItems.map(item => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${pathname === item.path
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-text-secondary hover:bg-gray-50'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="pt-4 border-t border-border mt-auto">
                <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all w-full text-left">
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Role Protection (Only STAFF or SALON_OWNER acting as staff can enter)
    if (!user || (user.role !== 'STAFF' && user.role !== 'SALON_OWNER' && user.role !== 'SUPER_ADMIN')) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="p-8 bg-white rounded-3xl border border-border shadow-card text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-main mb-2">Erişim Reddedildi</h1>
                    <p className="text-text-secondary mb-8">Bu sayfayı görüntülemek için personel yetkisine sahip olmanız gerekmektedir.</p>
                    <Link href="/" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="flex bg-gray-50 min-h-[calc(100vh-64px)]">
                <StaffSidebar />
                <main className="flex-1 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </Layout>
    );
}
