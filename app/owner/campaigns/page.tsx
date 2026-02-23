'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useActiveBranch } from '@/context/ActiveBranchContext';
import { CampaignService } from '@/services/db';
import { Coupon, Package } from '@/types';
import { Ticket, Package as PackageIcon, Plus, Trash2, Edit, CheckCircle2, XCircle, Search, Filter, Percent, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function OwnerCampaignsPage() {
    const { user } = useAuth();
    const { activeBranch } = useActiveBranch();
    const [activeTab, setActiveTab] = useState<'coupons' | 'packages'>('coupons');
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeBranch) {
            loadData();
        }
    }, [activeBranch, activeTab]);

    const loadData = async () => {
        if (!activeBranch) return;
        try {
            setLoading(true);
            if (activeTab === 'coupons') {
                const data = await CampaignService.getSalonCoupons(activeBranch.id);
                setCoupons(data);
            } else {
                const data = await CampaignService.getSalonPackages(activeBranch.id);
                setPackages(data);
            }
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!activeBranch) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-[40px] border border-border">
                <Ticket className="w-16 h-16 text-text-muted mb-4 opacity-20" />
                <h2 className="text-xl font-black text-text-main tracking-tight">Şube Seçilmedi</h2>
                <p className="text-text-secondary mt-2">Kampanyaları yönetmek için lütfen bir şube seçin.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[40px] border border-border shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-text-main tracking-tight">Kampanya & Sadakat</h1>
                    <p className="text-text-secondary font-medium">Müşterilerinizi ödüllendirmek için kupon ve paketler oluşturun.</p>
                </div>
                <button className="flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-105 transition-all">
                    <Plus className="w-5 h-5" />
                    {activeTab === 'coupons' ? 'Yeni Kupon Oluştur' : 'Yeni Paket Oluştur'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white border border-border rounded-2xl w-fit shadow-sm">
                <button
                    onClick={() => setActiveTab('coupons')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'coupons' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:bg-gray-50'}`}
                >
                    <Ticket className="w-4 h-4" />
                    Kuponlar
                </button>
                <button
                    onClick={() => setActiveTab('packages')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'packages' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:bg-gray-50'}`}
                >
                    <PackageIcon className="w-4 h-4" />
                    Paketler
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'coupons' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-white border border-border rounded-[32px] animate-pulse" />)
                    ) : coupons.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white border-2 border-dashed border-border rounded-[40px]">
                            <Ticket className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                            <p className="text-text-secondary font-bold">Henüz hiç kupon oluşturmadınız.</p>
                        </div>
                    ) : coupons.map(coupon => (
                        <div key={coupon.id} className="bg-white border border-border rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <Ticket className="w-32 h-32 rotate-12" />
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-2xl ${coupon.is_active ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                    {coupon.discount_type === 'PERCENTAGE' ? <Percent className="w-6 h-6" /> : <Banknote className="w-6 h-6" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-xl text-text-secondary transition-colors"><Edit className="w-4 h-4" /></button>
                                    <button className="p-2 hover:bg-red-50 rounded-xl text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">KUPON KODU</p>
                                <p className="text-xl font-black text-text-main group-hover:text-primary transition-colors">{coupon.code}</p>
                            </div>

                            <div className="mt-6 flex items-end justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">İNDİRİM</p>
                                    <p className="text-2xl font-black text-text-main">
                                        {coupon.discount_type === 'PERCENTAGE' ? `%${coupon.discount_value}` : `₺${coupon.discount_value}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-text-muted uppercase mb-1">KULLANIM</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${(coupon.used_count || 0) / (coupon.usage_limit || 1) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-text-main">{coupon.used_count}/{coupon.usage_limit}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-white border border-border rounded-[32px] animate-pulse" />)
                    ) : packages.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white border-2 border-dashed border-border rounded-[40px]">
                            <PackageIcon className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                            <p className="text-text-secondary font-bold">Henüz hiç paket oluşturmadınız.</p>
                        </div>
                    ) : packages.map(pkg => (
                        <div key={pkg.id} className="bg-white border border-border rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/5 text-primary rounded-2xl">
                                    <PackageIcon className="w-6 h-6" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${pkg.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                                    {pkg.is_active ? 'AKTİF' : 'PASİF'}
                                </span>
                            </div>

                            <h3 className="text-lg font-black text-text-main mb-1 group-hover:text-primary transition-all">{pkg.name}</h3>
                            <p className="text-xs text-text-secondary line-clamp-2 mb-6 font-medium">{pkg.description}</p>

                            <div className="pt-6 border-t border-border flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-text-muted uppercase">PAKET FİYATI</p>
                                    <p className="text-xl font-black text-text-main">₺{Number(pkg.price).toFixed(2)}</p>
                                </div>
                                <button className="p-3 bg-surface-alt hover:bg-white border border-border hover:border-primary hover:text-primary rounded-2xl transition-all shadow-sm">
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
