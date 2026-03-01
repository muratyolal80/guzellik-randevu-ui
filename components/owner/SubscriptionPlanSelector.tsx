'use client';

import React from 'react';
import { Check, X, ShieldCheck, Zap, Briefcase, Crown } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    display_name: string;
    price_monthly: number;
    price_yearly?: number;
    max_branches: number;
    max_staff: number;
    max_gallery_photos: number;
    max_sms_monthly: number;
    has_advanced_reports: boolean;
    has_campaigns: boolean;
    has_sponsored: boolean;
    support_level: string;
    description: string;
}

interface Props {
    plans: Plan[];
    selectedPlanId: string | null;
    billingCycle: 'MONTHLY' | 'YEARLY';
    onSelect: (planId: string) => void;
    onCycleChange: (cycle: 'MONTHLY' | 'YEARLY') => void;
}

const PlanIcon = ({ name }: { name: string }) => {
    switch (name) {
        case 'STARTER': return <ShieldCheck className="w-6 h-6 text-gray-400" />;
        case 'PRO': return <Zap className="w-6 h-6 text-amber-500" />;
        case 'BUSINESS': return <Briefcase className="w-6 h-6 text-blue-500" />;
        case 'ELITE': return <Crown className="w-6 h-6 text-primary" />;
        default: return <Zap className="w-6 h-6" />;
    }
};

export default function SubscriptionPlanSelector({ plans, selectedPlanId, billingCycle, onSelect, onCycleChange }: Props) {
    return (
        <div className="space-y-8">
            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
                <div className="bg-surface-alt p-1 rounded-2xl border border-border flex items-center shadow-sm">
                    <button
                        onClick={() => onCycleChange('MONTHLY')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'MONTHLY' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Aylık
                    </button>
                    <button
                        onClick={() => onCycleChange('YEARLY')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${billingCycle === 'YEARLY' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Yıllık
                        <span className="bg-green-100 text-green-700 text-[8px] px-1.5 py-0.5 rounded-full font-black">%20 TASARRUF</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const isElite = plan.name === 'ELITE';
                    const isFree = plan.price_monthly === 0;

                    const displayPrice = billingCycle === 'YEARLY' && plan.price_yearly
                        ? plan.price_yearly
                        : plan.price_monthly;

                    return (
                        <div
                            key={plan.id}
                            onClick={() => onSelect(plan.id)}
                            className={`relative flex flex-col p-6 rounded-[32px] border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${isSelected
                                ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10'
                                : 'border-border bg-white hover:border-primary/20'
                                }`}
                        >
                            {isElite && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                    En Popüler
                                </div>
                            )}

                            <div className="mb-6 flex items-center justify-between">
                                <div className={`p-3 rounded-2xl ${isSelected ? 'bg-primary/10' : 'bg-gray-50'}`}>
                                    <PlanIcon name={plan.name} />
                                </div>
                                {isSelected && (
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <h3 className="text-xl font-black text-text-main uppercase tracking-tight">{plan.display_name}</h3>
                                <p className="text-xs text-text-muted font-medium mt-1 leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-text-main">
                                        {isFree ? 'Ücretsiz' : `${(displayPrice / 100).toLocaleString('tr-TR')} ₺`}
                                    </span>
                                    {!isFree && (
                                        <span className="text-sm font-bold text-text-muted">
                                            /{billingCycle === 'YEARLY' ? 'yıl' : 'ay'}
                                        </span>
                                    )}
                                </div>
                                {billingCycle === 'YEARLY' && !isFree && plan.price_monthly && (
                                    <p className="text-[10px] font-bold text-green-600 mt-1 uppercase">Aylık {(plan.price_monthly / 100).toLocaleString('tr-TR')} ₺ yerine</p>
                                )}
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                <FeatureItem label="Şube Sayısı" value={plan.max_branches === -1 ? 'Sınırsız' : plan.max_branches} />
                                <FeatureItem label="Personel Sayısı" value={plan.max_staff === -1 ? 'Sınırsız' : plan.max_staff} />
                                <FeatureItem label="Galeri Fotoğrafı" value={plan.max_gallery_photos === -1 ? 'Sınırsız' : plan.max_gallery_photos} />
                                <FeatureItem label="Aylık SMS" value={plan.max_sms_monthly.toLocaleString()} />
                                <FeatureCheck label="Gelişmiş Raporlar" enabled={plan.has_advanced_reports} />
                                <FeatureCheck label="Kampanya Yönetimi" enabled={plan.has_campaigns} />
                                <FeatureCheck label="Sponsorlu Vitrin" enabled={plan.has_sponsored} />
                            </ul>

                            <button
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${isSelected
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                    : 'bg-surface-alt border border-border text-text-secondary hover:bg-gray-100'
                                    }`}
                            >
                                {isSelected ? 'Seçildi' : 'Planı Seç'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function FeatureItem({ label, value }: { label: string; value: string | number }) {
    return (
        <li className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-text-muted uppercase tracking-wider">{label}</span>
            <span className="text-text-main font-black">{value}</span>
        </li>
    );
}

function FeatureCheck({ label, enabled }: { label: string; enabled: boolean }) {
    return (
        <li className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-text-muted uppercase tracking-wider">{label}</span>
            {enabled ? (
                <Check className="w-4 h-4 text-green-500" />
            ) : (
                <X className="w-4 h-4 text-red-300" />
            )}
        </li>
    );
}
