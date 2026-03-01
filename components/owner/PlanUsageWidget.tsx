'use client';

import React, { useEffect, useState } from 'react';
import { SalonDataService } from '@/services/db';
import { SalonUsageStats } from '@/types';
import {
    Users,
    Store,
    Image as ImageIcon,
    AlertTriangle,
    ChevronRight,
    Zap
} from 'lucide-react';
import Link from 'next/link';

interface PlanUsageWidgetProps {
    salonId: string;
}

export default function PlanUsageWidget({ salonId }: PlanUsageWidgetProps) {
    const [usage, setUsage] = useState<SalonUsageStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (salonId) {
            fetchUsage();
        }
    }, [salonId]);

    const fetchUsage = async () => {
        try {
            setLoading(true);
            const data = await SalonDataService.getUsageStats(salonId);
            setUsage(data);
        } catch (err) {
            console.error('Usage stats fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-[40px] p-8 border border-border shadow-card animate-pulse space-y-6">
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="space-y-4">
                    <div className="h-12 bg-gray-50 rounded-2xl"></div>
                    <div className="h-12 bg-gray-50 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!usage) return null;

    const items = [
        {
            label: 'Personel',
            current: usage.current_staff,
            limit: usage.limit_staff,
            icon: Users,
            color: 'bg-blue-500',
            link: '/owner/staff'
        },
        {
            label: 'Şubeler',
            current: usage.current_branches,
            limit: usage.limit_branches,
            icon: Store,
            color: 'bg-purple-500',
            link: '/owner/salons'
        },
        {
            label: 'Galeri Fotoğrafları',
            current: usage.current_gallery_photos,
            limit: usage.limit_gallery_photos,
            icon: ImageIcon,
            color: 'bg-orange-500',
            link: `/owner/salons/${salonId}/edit`
        }
    ];

    return (
        <div className="bg-white rounded-[40px] border border-border shadow-card overflow-hidden">
            <div className="p-8 border-b border-border bg-gray-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                        <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-text-main uppercase tracking-widest">Plan Kullanımı</h4>
                        <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase">{usage.plan_name} PLANI</p>
                    </div>
                </div>
                {usage.plan_name === 'STARTER' && (
                    <Link href="/owner/settings/billing" className="text-[10px] font-black text-primary hover:underline flex items-center gap-1">
                        YÜKSELT <ChevronRight className="w-3 h-3" />
                    </Link>
                )}
            </div>

            <div className="p-8 space-y-6">
                {items.map((item, idx) => {
                    const isUnlimited = item.limit === -1 || item.limit === null;
                    const percent = isUnlimited ? 0 : Math.min(100, (item.current / item.limit) * 100);
                    const isNearLimit = !isUnlimited && percent >= 80;

                    return (
                        <div key={idx} className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <item.icon className="w-4 h-4 text-text-muted" />
                                    <span className="text-xs font-bold text-text-main">{item.label}</span>
                                </div>
                                <span className="text-[11px] font-black text-text-main">
                                    {item.current} / {isUnlimited ? '∞' : item.limit}
                                </span>
                            </div>

                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${isNearLimit ? 'bg-red-500' : item.color}`}
                                    style={{ width: isUnlimited ? '100%' : `${percent}%`, opacity: isUnlimited ? 0.3 : 1 }}
                                ></div>
                            </div>

                            {isNearLimit && percent < 100 && (
                                <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 animate-pulse">
                                    <AlertTriangle className="w-3 h-3" /> Limite yaklaştınız!
                                </p>
                            )}
                            {percent >= 100 && !isUnlimited && (
                                <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Limit doldu. Üst plana geçmelisiniz.
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="px-8 py-4 bg-gray-50 border-t border-border">
                <p className="text-[9px] font-bold text-text-muted leading-relaxed uppercase tracking-tight">
                    * Limitler abonelik planınıza göre belirlenir. Sınırsız kullanım için Elite plana geçebilirsiniz.
                </p>
            </div>
        </div>
    );
}
