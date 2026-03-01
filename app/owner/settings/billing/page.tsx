'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import { CheckCircle2, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { SalonDataService } from '@/services/db';

const PlanCard = ({ name, price_monthly, price_yearly, features, current, recommended, onSelect, loading, billingCycle }: any) => {
    const displayPrice = billingCycle === 'YEARLY' && price_yearly ? price_yearly : price_monthly;
    const isFree = price_monthly === 0;

    return (
        <div className={`relative p-8 rounded-[40px] border-2 transition-all ${current ? 'bg-primary/5 border-primary shadow-xl shadow-primary/10' :
            recommended ? 'bg-white border-primary shadow-lg ring-4 ring-primary/5' : 'bg-white border-border'
            }`}>
            {recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                    Önerilen
                </div>
            )}
            <div className="mb-8">
                <h3 className="text-xl font-black text-text-main mb-2">{name}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-text-main">
                        {isFree ? '₺0' : `${(displayPrice / 100).toLocaleString('tr-TR')} ₺`}
                    </span>
                    {!isFree && (
                        <span className="text-sm font-bold text-text-secondary">
                            /{billingCycle === 'YEARLY' ? 'yıllık' : 'aylık'}
                        </span>
                    )}
                </div>
                {billingCycle === 'YEARLY' && !isFree && price_monthly && (
                    <p className="text-[10px] font-bold text-green-600 mt-1 uppercase">Aylık {(price_monthly / 100).toLocaleString('tr-TR')} ₺ yerine</p>
                )}
            </div>
            <div className="space-y-4 mb-10">
                {features.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className={`w-4 h-4 ${current ? 'text-primary' : 'text-green-500'}`} />
                        <span className="text-sm font-medium text-text-secondary">{f}</span>
                    </div>
                ))}
            </div>
            <button
                disabled={current || loading}
                onClick={() => onSelect(name)}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${current ? 'bg-gray-100 text-text-muted cursor-not-allowed' :
                    'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]'
                    }`}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : current ? 'Mevcut Planınız' : 'Planı Seç'} {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
        </div>
    );
};

export default function BillingPage() {
    const { plan, salonId, setPlan } = useTenant();
    const [updating, setUpdating] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

    const handleUpdatePlan = async (newPlan: string) => {
        if (!salonId) return;

        const confirm = window.confirm(`Aboneliğinizi ${newPlan} paketine (${billingCycle}) yükseltmek istiyor musunuz?`);
        if (!confirm) return;

        setUpdating(true);
        try {
            await SalonDataService.updateSalonPlan(salonId, newPlan as any);
            // In a real scenario, we'd also call a billing cycle update API
            setPlan(newPlan as any);
            alert(`Tebrikler! Paketiniz ${newPlan} olarak güncellendi.`);
        } catch (error) {
            console.error('Plan update error:', error);
            alert('Paket güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setUpdating(false);
        }
    };

    const plans = [
        {
            name: 'FREE',
            price_monthly: 0,
            price_yearly: 0,
            features: ['1 Şube', '3 Personel', 'Temel Randevu Takvimi', 'SMS Onayı Yok'],
            current: plan === 'FREE'
        },
        {
            name: 'PRO',
            price_monthly: 49900,
            price_yearly: 499000,
            features: ['3 Şube', '10 Personel', 'Gelişmiş Analitik', 'SMS Hatırlatıcılar'],
            current: plan === 'PRO',
            recommended: true
        },
        {
            name: 'ENTERPRISE',
            price_monthly: 99900,
            price_yearly: 999000,
            features: ['Sınırsız Şube', 'Sınırsız Personel', 'API Erişimi', 'Özel Markalamalı Alt Alan Adı'],
            current: plan === 'ENTERPRISE'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl font-black text-text-main mb-4 tracking-tight">Üyelik Planınızı Yönetin</h1>
                <p className="text-text-secondary font-medium">İşletmenizi büyütmek için size en uygun planı seçin.</p>

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center pt-4">
                    <div className="bg-surface-alt p-1 rounded-2xl border border-border flex items-center shadow-sm">
                        <button
                            onClick={() => setBillingCycle('MONTHLY')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'MONTHLY' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Aylık
                        </button>
                        <button
                            onClick={() => setBillingCycle('YEARLY')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${billingCycle === 'YEARLY' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Yıllık
                            <span className="bg-green-100 text-green-700 text-[8px] px-1.5 py-0.5 rounded-full font-black">%20 TASARRUF</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {plans.map(p => (
                    <PlanCard
                        key={p.name}
                        {...p}
                        billingCycle={billingCycle}
                        onSelect={handleUpdatePlan}
                        loading={updating}
                    />
                ))}
            </div>

            <div className="bg-surface-alt rounded-[40px] p-10 border border-border flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 rounded-3xl bg-white border border-border shadow-sm flex items-center justify-center text-primary">
                    <Zap className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-black text-text-main mb-1">Kurumsal Çözümler Mi Arıyorsunuz?</h3>
                    <p className="text-sm font-medium text-text-secondary">Logo özelleştirme, özel domain ve daha fazlası için bizimle iletişime geçin.</p>
                </div>
                <button className="px-8 py-4 bg-white border border-border rounded-2xl font-black text-sm shadow-sm hover:bg-gray-50 transition-all">İletişime Geç</button>
            </div>
        </div>
    );
}
