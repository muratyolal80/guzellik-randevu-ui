'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import { CheckCircle2, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { SalonDataService } from '@/services/db';

const PlanCard = ({ name, price, features, current, recommended, onSelect, loading }: any) => (
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
                <span className="text-3xl font-black text-text-main">{price}</span>
                <span className="text-sm font-bold text-text-secondary">/aylık</span>
            </div>
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

export default function BillingPage() {
    const { plan, salonId, setPlan } = useTenant();
    const [updating, setUpdating] = useState(false);

    const handleUpdatePlan = async (newPlan: string) => {
        if (!salonId) return;

        const confirm = window.confirm(`Aboneliğinizi ${newPlan} paketine yükseltmek istiyor musunuz?`);
        if (!confirm) return;

        setUpdating(true);
        try {
            await SalonDataService.updateSalonPlan(salonId, newPlan as any);
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
            price: '₺0',
            features: ['1 Şube', '3 Personel', 'Temel Randevu Takvimi', 'SMS Onayı Yok'],
            current: plan === 'FREE'
        },
        {
            name: 'PRO',
            price: '₺499',
            features: ['3 Şube', '10 Personel', 'Gelişmiş Analitik', 'SMS Hatırlatıcılar'],
            current: plan === 'PRO',
            recommended: true
        },
        {
            name: 'ENTERPRISE',
            price: '₺999',
            features: ['Sınırsız Şube', 'Sınırsız Personel', 'API Erişimi', 'Özel Markalamalı Alt Alan Adı'],
            current: plan === 'ENTERPRISE'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-black text-text-main mb-4 tracking-tight">Üyelik Planınızı Yönetin</h1>
                <p className="text-text-secondary font-medium">İşletmenizi büyütmek için size en uygun planı seçin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {plans.map(p => (
                    <PlanCard
                        key={p.name}
                        {...p}
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
