'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import BranchSelector from '@/components/owner/BranchSelector';
import SubscriptionBanner from '@/components/owner/SubscriptionBanner';
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
    Scissors,
    Ticket,
    Briefcase,
    Database,
    Wallet,
    Package,
    ChevronDown,
    ClipboardList,
} from 'lucide-react';

const OwnerSidebar: React.FC = () => {
    const pathname = usePathname();
    const { user } = useAuth();
    const [expandedGroups, setExpandedGroups] = React.useState<string[]>(['Genel', 'İşletme Yönetimi', 'Operasyon', 'Müşteri ve Pazarlama', 'Finans']);

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupName)
                ? prev.filter(g => g !== groupName)
                : [...prev, groupName]
        );
    };

    const menuGroups = [
        {
            name: 'Genel',
            items: [
                { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
                { name: 'Paket ve Abonelik', path: '/owner/packages', icon: Package },
            ]
        },
        {
            name: 'İşletme Yönetimi',
            items: [
                { name: 'Salonlarım', path: '/owner/salons', icon: Store },
                { name: 'Saha Takvimi', path: '/owner/calendar', icon: Calendar },
                { name: 'Randevular', path: '/owner/appointments', icon: ClipboardList },
            ]
        },
        {
            name: 'Operasyon',
            items: [
                { name: 'Hizmet Yönetimi', path: '/owner/services', icon: Scissors },
                { name: 'Personel Yönetimi', path: '/owner/staff', icon: Briefcase },
                { name: 'Kaynak Yönetimi', path: '/owner/resources', icon: Database },
            ]
        },
        {
            name: 'Müşteri ve Pazarlama',
            items: [
                { name: 'Müşterilerim', path: '/owner/customers', icon: Users },
                { name: 'Kampanyalar', path: '/owner/campaigns', icon: Ticket },
            ]
        },
        {
            name: 'Finans',
            items: [
                { name: 'Finansal Yönetim', path: '/owner/finance', icon: Wallet },
                { name: 'Finansal Raporlar', path: '/owner/reports', icon: TrendingUp },
            ]
        }
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

            <nav className="flex flex-col gap-4 flex-1 overflow-y-auto no-scrollbar pr-2">
                {menuGroups.map(group => {
                    const isExpanded = expandedGroups.includes(group.name);
                    return (
                        <div key={group.name} className="flex flex-col gap-1">
                            <button
                                onClick={() => toggleGroup(group.name)}
                                className="flex items-center justify-between px-4 py-3 w-full text-left group/header hover:bg-gray-50/50 rounded-2xl transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/header:bg-primary transition-colors" />
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] group-hover/header:text-primary transition-colors">
                                        {group.name}
                                    </p>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isExpanded ? '' : '-rotate-90 opacity-40'}`} />
                            </button>
                            
                            <div className={`flex flex-col gap-1 transition-all duration-300 origin-top overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                {group.items.map(item => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all group ${pathname.startsWith(item.path)
                                            ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                                            : 'text-text-secondary hover:bg-gray-50 hover:text-primary hover:translate-x-1'
                                            }`}
                                    >
                                        <item.icon className={`w-4 h-4 ${pathname.startsWith(item.path) ? 'text-white' : 'text-text-muted group-hover:text-primary transition-colors'}`} />
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
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

// Mobil alt navigasyon — en çok kullanılan owner ekranları (sidebar lg altında gizli).
const OWNER_MOBILE_NAV = [
    { label: 'Özet', path: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'Salonlar', path: '/owner/salons', icon: Store },
    { label: 'Takvim', path: '/owner/calendar', icon: Calendar },
    { label: 'Randevu', path: '/owner/appointments', icon: ClipboardList },
    { label: 'Personel', path: '/owner/staff', icon: Briefcase },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    const { user, isOwner, loading } = useAuth();
    const { subscriptionStatus, loading: tenantLoading } = useTenant();
    const router = useRouter();
    const pathname = usePathname();

    if (loading || tenantLoading) {
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

    const isBillingPage = pathname === '/owner/packages';
    const isDashboard = pathname === '/owner/dashboard';
    const isExpired = subscriptionStatus === 'EXPIRED' || subscriptionStatus === 'CANCELLED';

    // Block content if expired, unless they are on the billing page to renew
    const renderContent = () => {
        if (isExpired && !isBillingPage && !isDashboard) {
            return (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
                    <div className="w-24 h-24 mb-6 rounded-3xl bg-red-50 flex items-center justify-center border border-red-100">
                        <Wallet className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black text-text-main tracking-tight mb-2">Aboneliğiniz Sona Erdi</h2>
                    <p className="text-text-secondary font-medium max-w-md mx-auto mb-8">
                        Sistemi kullanmaya devam edebilmek için aboneliğinizi yenilemeniz gerekmektedir. Yönetim özellikleri askıya alınmıştır.
                    </p>
                    <Link href="/owner/packages" className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                        Hemen Yenile
                    </Link>
                </div>
            );
        }
        return children;
    };

    return (
        <Layout>
            <div className="flex bg-gray-50 min-h-[calc(100vh-64px)]">
                <OwnerSidebar />
                <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden pb-24 lg:pb-12">
                    <SubscriptionBanner />
                    {renderContent()}
                </main>
            </div>

            {/* Mobil alt navigasyon (sidebar lg altında gizli) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-around px-1 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
                {OWNER_MOBILE_NAV.map(item => {
                    const active = pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${active ? 'text-primary' : 'text-text-muted'}`}
                        >
                            <item.icon className="w-[22px] h-[22px]" />
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </Layout>
    );
}
