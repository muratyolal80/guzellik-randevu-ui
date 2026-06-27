'use client';

import React from 'react';
import { useTenant } from '@/context/TenantContext';
import { AlertCircle, Clock, XCircle, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionBanner() {
    const { subscriptionStatus, plan, loading } = useTenant();

    if (loading) return null;

    if (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL') return null;

    let bannerData = {
        icon: AlertCircle,
        title: 'Abonelik Durumu',
        desc: 'Aboneliğinizle ilgili bir sorun var.',
        bg: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600',
        actionText: 'Paketi Yönet',
        actionLink: '/owner/packages'
    };

    if (subscriptionStatus === 'PENDING') {
        bannerData = {
            icon: Clock,
            title: 'Ödeme Onayı Bekleniyor',
            desc: 'Abonelik paketiniz (Banka Havalesi) şu an onay aşamasında. Onay sonrasında tüm özellikler açılacaktır.',
            bg: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            iconColor: 'text-blue-600',
            actionText: 'Detayları Gör',
            actionLink: '/owner/packages'
        };
    } else if (subscriptionStatus === 'EXPIRED') {
        bannerData = {
            icon: XCircle,
            title: 'Abonelik Süresi Doldu!',
            desc: 'Deneme süreniz veya mevcut paketinizin süresi doldu. Salonunuzu aktif tutmak için yenileme yapmalısınız.',
            bg: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            iconColor: 'text-red-600',
            actionText: 'Hemen Yenile',
            actionLink: '/owner/packages'
        };
    } else if (subscriptionStatus === 'CANCELLED') {
        bannerData = {
            icon: XCircle,
            title: 'Abonelik İptal Edildi',
            desc: 'Mevcut aboneliğiniz iptal edildiği için işlemler kısıtlanmıştır.',
            bg: 'bg-gray-100',
            borderColor: 'border-gray-200',
            textColor: 'text-gray-800',
            iconColor: 'text-gray-600',
            actionText: 'Yeni Paket Al',
            actionLink: '/owner/packages'
        };
    } else if (!subscriptionStatus && plan === 'STARTER') {
      // It is essentially the default state before onboarding / subscriptions completes generating. We can ignore or show default
      return null;
    }

    return (
        <div className={`mb-8 p-4 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in shadow-sm ${bannerData.bg} ${bannerData.borderColor} ${bannerData.textColor}`}>
            <div className="flex items-start md:items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border ${bannerData.borderColor}`}>
                    <bannerData.icon className={`w-6 h-6 ${bannerData.iconColor}`} />
                </div>
                <div>
                    <h4 className="text-base font-black tracking-tight">{bannerData.title}</h4>
                    <p className="text-sm font-medium mt-0.5 opacity-90">{bannerData.desc}</p>
                </div>
            </div>
            <Link
                href={bannerData.actionLink}
                className="px-6 py-2.5 bg-white text-text-main font-black text-sm rounded-xl shadow-sm border border-border hover:shadow-md hover:scale-105 transition-all w-full md:w-auto text-center"
            >
                {bannerData.actionText}
            </Link>
        </div>
    );
}
