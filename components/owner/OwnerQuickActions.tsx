'use client';

import Link from 'next/link';
import {
    CalendarPlus,
    UserPlus,
    Megaphone,
    Users,
    BarChart3,
    Settings,
} from 'lucide-react';

interface OwnerQuickActionsProps {
    salonId: string;
    salonStatus?: string;
}

/**
 * Owner dashboard hızlı eylem widget'ı.
 * Günlük işlemleri tek tıkla başlatma.
 */
export default function OwnerQuickActions({ salonId, salonStatus }: OwnerQuickActionsProps) {
    const actions = [
        {
            label: 'Manuel Randevu',
            desc: 'Telefondan gelen müşteri için',
            icon: CalendarPlus,
            href: `/owner/calendar?mode=new`,
            color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
            iconBg: 'bg-blue-100',
        },
        {
            label: 'Personel Davet',
            desc: 'Email ile davet gönder',
            icon: UserPlus,
            href: `/owner/staff?mode=invite`,
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
            iconBg: 'bg-emerald-100',
        },
        {
            label: 'Kampanya Başlat',
            desc: 'İndirim veya promosyon',
            icon: Megaphone,
            href: `/owner/campaigns`,
            color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
            iconBg: 'bg-rose-100',
        },
        {
            label: 'Müşteri Listesi',
            desc: 'CRM + sadakat',
            icon: Users,
            href: `/owner/customers`,
            color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
            iconBg: 'bg-purple-100',
        },
        {
            label: 'Raporlar',
            desc: 'Gelir, doluluk, no-show',
            icon: BarChart3,
            href: `/owner/reports`,
            color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
            iconBg: 'bg-amber-100',
        },
        {
            label: 'Ayarlar',
            desc: 'Salon profili + tercihler',
            icon: Settings,
            href: `/owner/settings`,
            color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
            iconBg: 'bg-slate-100',
        },
    ];

    const disabled = salonStatus !== 'APPROVED';

    return (
        <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                        HIZLI EYLEMLER
                    </p>
                    <h3 className="text-base font-black text-text-main">Hemen başla</h3>
                </div>
                {disabled && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md">
                        Onay Bekliyor
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {actions.map((a) => {
                    const Icon = a.icon;
                    if (disabled) {
                        return (
                            <div
                                key={a.label}
                                className={`${a.color} rounded-2xl border p-4 opacity-50 cursor-not-allowed flex flex-col`}
                            >
                                <div className={`w-10 h-10 ${a.iconBg} rounded-xl flex items-center justify-center mb-2`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-black">{a.label}</p>
                                <p className="text-[10px] font-bold opacity-70 mt-0.5">{a.desc}</p>
                            </div>
                        );
                    }
                    return (
                        <Link
                            key={a.label}
                            href={a.href}
                            className={`${a.color} rounded-2xl border p-4 flex flex-col transition active:scale-[0.97]`}
                        >
                            <div className={`w-10 h-10 ${a.iconBg} rounded-xl flex items-center justify-center mb-2`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-black">{a.label}</p>
                            <p className="text-[10px] font-bold opacity-70 mt-0.5">{a.desc}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
