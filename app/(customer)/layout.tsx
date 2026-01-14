'use client';

import React from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UserMenu } from '@/components/common/UserMenu';
import Sidebar from '@/components/dashboard/Sidebar';

export default function CustomerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();

    React.useEffect(() => {
        async function getUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Fetch profile for first_name/last_name
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                    setUser(profile || user);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Auth check error:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        }
        getUser();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!user) return null; // Don't render anything if not authenticated (will redirect)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation / Header could go here if not handled by root layout */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 px-4 md:px-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    {/* Logo - Reusing existing branding style */}
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-lg">G</div>
                    <span className="text-xl font-bold text-gray-900">Güzellik<span className="text-amber-500">Randevu</span></span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Could add a basic Notifications icon here */}
                    <UserMenu />
                </div>
            </header>

            <div className="flex max-w-[1600px] mx-auto">
                <Sidebar />
                <main className="flex-1 p-4 md:p-8 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
