'use client';

import React from 'react';
import { useTenant } from '@/context/TenantContext';
import { AlertTriangle, Lock } from 'lucide-react';
import Link from 'next/link';

import { SalonPlan } from '@/types';

interface PlanGuardProps {
    children: React.ReactNode;
    requiredPlan: SalonPlan;
    fallback?: React.ReactNode;
    featureName?: string;
}

export default function PlanGuard({
    children,
    requiredPlan,
    fallback,
    featureName
}: PlanGuardProps) {
    const { plan, subscriptionStatus, loading } = useTenant();

    if (loading) return null;

    const planWeights: Record<string, number> = {
        'STARTER': 0,
        'PRO': 1,
        'BUSINESS': 2,
        'ELITE': 3
    };

    const currentWeight = planWeights[plan || 'STARTER'] || 0;
    const requiredWeight = planWeights[requiredPlan] || 0;

<<<<<<< HEAD
    // Süresi dolmuş veya iptal edilmiş aboneliklerde erişim yok; PENDING ise geçici erişim ver
=======
    // Abonelik aktif değilse veya özellik paketi yetersizse erişim yok
    const isActive = subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'PENDING'; // Give temporary access for pending? Actually let's restrict if EXPIRED or CANCELLED, but also if weight is insufficient.
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
    const hasAccess = currentWeight >= requiredWeight && (subscriptionStatus !== 'EXPIRED' && subscriptionStatus !== 'CANCELLED');

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) return <>{fallback}</>;

    return (
        <div className="p-8 rounded-[32px] border-2 border-dashed border-border bg-gray-50/50 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-black text-text-main">
                {featureName ? `${featureName} Özelliği Kilitli` : 'Bu Özellik Kilitli'}
            </h3>
            <p className="text-text-secondary mt-2 mb-6 max-w-sm font-medium">
                Bu özelliğe erişmek için <span className="text-primary font-black">{requiredPlan}</span> veya üzeri bir plana geçmeniz gerekmektedir.
            </p>
            <Link
                href="/owner/packages"
                className="px-8 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all"
            >
                Planı Yükselt
            </Link>
        </div>
    );
}
