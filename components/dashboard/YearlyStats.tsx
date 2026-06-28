'use client';

import { CalendarCheck, Building2, Wallet, MessageSquare } from 'lucide-react';

interface YearlyStatsProps {
    appointmentCount: number;
    uniqueSalons: number;
    yearlySpending: number;
    reviewCount: number;
}

/**
 * Yıllık özet (Spotify Wrapped tarzı, mini)
 */
export default function YearlyStats({
    appointmentCount,
    uniqueSalons,
    yearlySpending,
    reviewCount,
}: YearlyStatsProps) {
    const year = new Date().getFullYear();

    if (appointmentCount === 0) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{year} ÖZETİN</p>
                    <h3 className="text-xl font-black mt-0.5">Bu yıl seninle ne yaptık?</h3>
                </div>
                <span className="text-3xl">✨</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <YearStat icon={CalendarCheck} value={appointmentCount} label="randevu" />
                <YearStat icon={Building2} value={uniqueSalons} label="farklı salon" />
                <YearStat icon={Wallet} value={`${yearlySpending}₺`} label="harcama" />
                <YearStat icon={MessageSquare} value={reviewCount} label="yorum" />
            </div>
        </div>
    );
}

function YearStat({ icon: Icon, value, label }: { icon: any; value: any; label: string }) {
    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <Icon className="w-5 h-5 opacity-70 mb-2" />
            <p className="text-2xl font-black">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">{label}</p>
        </div>
    );
}
