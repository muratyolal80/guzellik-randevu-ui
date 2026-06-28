'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, LucideIcon } from 'lucide-react';

interface StatCardEnhancedProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: 'amber' | 'green' | 'purple' | 'blue' | 'indigo';
    trend?: number;            // pozitif/negatif değer
    trendLabel?: string;       // 'geçen aya göre' gibi
    href?: string;             // tıklanabilir kart
    badge?: string;            // 'Aktif' gibi
}

const COLOR_MAP = {
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    green: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
};

export default function StatCardEnhanced({
    label,
    value,
    icon: Icon,
    color,
    trend,
    trendLabel,
    href,
    badge,
}: StatCardEnhancedProps) {
    const colors = COLOR_MAP[color];

    const content = (
        <div className="bg-white p-6 rounded-2xl border border-border hover:border-primary/40 hover:shadow-md transition-all h-full">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 ${colors.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                {badge && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{label}</p>
            <p className="text-2xl font-black text-text-main leading-tight">{value}</p>
            {typeof trend === 'number' && (
                <p className={`mt-2 text-[11px] font-bold flex items-center gap-1 ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-500' : 'text-text-muted'}`}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                    {trend > 0 ? '+' : ''}
                    {trend} {trendLabel}
                </p>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block">
                {content}
            </Link>
        );
    }
    return content;
}
