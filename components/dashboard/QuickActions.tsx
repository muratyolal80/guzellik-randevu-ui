'use client';

import Link from 'next/link';
import { Plus, Repeat, Star, MapPin } from 'lucide-react';

interface QuickActionsProps {
    lastSalonId?: string | null;
}

export default function QuickActions({ lastSalonId }: QuickActionsProps) {
    const actions = [
        {
            label: 'Yeni Randevu',
            icon: Plus,
            href: '/',
            color: 'bg-primary text-white',
            ariaLabel: 'Yeni randevu al',
        },
        {
            label: 'Tekrar Et',
            icon: Repeat,
            href: lastSalonId ? `/salon/${lastSalonId}` : '/customer/appointments',
            color: 'bg-white border border-border text-text-main hover:border-primary',
            ariaLabel: 'Son salonda yeni randevu',
            disabled: !lastSalonId,
        },
        {
            label: 'Favoriler',
            icon: Star,
            href: '/customer/favorites',
            color: 'bg-white border border-border text-text-main hover:border-amber-400',
            ariaLabel: 'Favori salonlar',
        },
        {
            label: 'Yakındakiler',
            icon: MapPin,
            href: '/search?nearby=1',
            color: 'bg-white border border-border text-text-main hover:border-emerald-400',
            ariaLabel: 'Yakındaki salonlar',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {actions.map((a) => {
                const Icon = a.icon;
                if (a.disabled) {
                    return (
                        <div
                            key={a.label}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold opacity-50 cursor-not-allowed ${a.color}`}
                            aria-disabled
                        >
                            <Icon className="w-5 h-5" />
                            {a.label}
                        </div>
                    );
                }
                return (
                    <Link
                        key={a.label}
                        href={a.href}
                        aria-label={a.ariaLabel}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition ${a.color}`}
                    >
                        <Icon className="w-5 h-5" />
                        {a.label}
                    </Link>
                );
            })}
        </div>
    );
}
