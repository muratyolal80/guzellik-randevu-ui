'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { SubscriptionService } from '@/services/db';
import {
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Save,
    Trophy,
    Zap,
    Shield,
    Info,
    AlertCircle
} from 'lucide-react';

export default function SubscriptionPlans() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const data = await SubscriptionService.getPlans();
            setPlans(data || []);
        } catch (err) {
            console.error('Plans fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan: any) => {
        setEditingId(plan.id);
        setEditForm({ ...plan });
    };

    const handleSave = async () => {
        try {
            await SubscriptionService.updatePlan(editForm.id, editForm);
            setEditingId(null);
            fetchPlans();
            alert('Paket başarıyla güncellendi.');
        } catch (err) {
            alert('Güncelleme sırasında hata oluştu.');
        }
    };

    const getIcon = (slug: string) => {
        if (slug.includes('starter')) return <Zap className="text-blue-500" />;
        if (slug.includes('business')) return <Trophy className="text-amber-500" />;
        return <Shield className="text-purple-500" />;
    };

    return (
        <AdminLayout>
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase italic">Abonelik Paketleri</h2>
                    <p className="text-text-secondary font-medium">Sistemdeki paket limitlerini, özelliklerini ve fiyatlarını yönetin.</p>
                </div>
                <button className="bg-primary text-white p-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                    <Plus size={20} /> Yeni Paket Ekle
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-96 bg-gray-100 rounded-[40px] animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`bg-white rounded-[40px] border-2 transition-all overflow-hidden ${editingId === plan.id ? 'border-primary ring-8 ring-primary/5' : 'border-border shadow-card hover:border-primary/20'}`}
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-border bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl border border-border flex items-center justify-center shadow-sm">
                                        {getIcon(plan.slug)}
                                    </div>
                                    <div>
                                        {editingId === plan.id ? (
                                            <input
                                                className="bg-white border border-primary px-3 py-1 rounded-lg font-black text-sm outline-none"
                                                value={editForm.display_name}
                                                onChange={e => setEditForm({ ...editForm, display_name: e.target.value })}
                                            />
                                        ) : (
                                            <h3 className="font-black text-text-main text-lg uppercase leading-none">{plan.display_name}</h3>
                                        )}
                                        <p className="text-[10px] text-text-muted font-bold tracking-widest mt-1 uppercase italic">{plan.slug}</p>
                                    </div>
                                </div>
                                {editingId === plan.id ? (
                                    <div className="flex gap-1">
                                        <button onClick={handleSave} className="p-2 bg-emerald-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-200">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="p-2 bg-red-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-red-200">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleEdit(plan)} className="p-2 bg-gray-100 text-text-main rounded-xl hover:bg-primary hover:text-white transition-all">
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-6">
                                <div className="flex items-baseline gap-2">
                                    {editingId === plan.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="w-24 bg-surface-alt border border-border px-3 py-2 rounded-xl font-black text-2xl outline-none focus:border-primary"
                                                value={editForm.price_monthly}
                                                onChange={e => setEditForm({ ...editForm, price_monthly: parseFloat(e.target.value) })}
                                            />
                                            <span className="text-xl font-black text-text-main">TL</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-black text-text-main tracking-tighter italic">{plan.price_monthly}</span>
                                            <span className="text-text-secondary font-bold uppercase tracking-wider text-xs">TL / AY</span>
                                        </>
                                    )}
                                </div>

                                {/* Limits */}
                                <div className="space-y-4 pt-4 border-t border-dashed border-border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-widest leading-none">
                                            <Info size={12} className="text-blue-500" /> Max Personel
                                        </div>
                                        {editingId === plan.id ? (
                                            <input
                                                type="number"
                                                className="w-20 bg-gray-50 border border-border px-2 py-1 rounded-lg text-xs font-black outline-none"
                                                value={editForm.max_staff}
                                                onChange={e => setEditForm({ ...editForm, max_staff: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            <span className="text-sm font-black text-text-main">{plan.max_staff === -1 ? 'Sınırsız' : plan.max_staff}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-widest leading-none">
                                            <Info size={12} className="text-blue-500" /> Max Fotoğraf
                                        </div>
                                        {editingId === plan.id ? (
                                            <input
                                                type="number"
                                                className="w-20 bg-gray-50 border border-border px-2 py-1 rounded-lg text-xs font-black outline-none"
                                                value={editForm.max_gallery_photos}
                                                onChange={e => setEditForm({ ...editForm, max_gallery_photos: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            <span className="text-sm font-black text-text-main">{plan.max_gallery_photos}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-widest leading-none">
                                            <AlertCircle size={12} className="text-amber-500" /> Komisyon (%)
                                        </div>
                                        <span className="text-sm font-black text-emerald-600 font-display italic">%{plan.commission_rate || 5}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="space-y-3">
                                    {[
                                        { key: 'has_advanced_reports', label: 'Gelişmiş Raporlar' },
                                        { key: 'has_campaigns', label: 'Kampanya Yönetimi' },
                                        { key: 'has_sponsored', label: 'Sponsorlu Öne Çıkarma' }
                                    ].map(feat => (
                                        <label key={feat.key} className="flex items-center justify-between group cursor-pointer">
                                            <span className="text-xs font-bold text-text-secondary group-hover:text-text-main transition-colors">{feat.label}</span>
                                            {editingId === plan.id ? (
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 accent-primary"
                                                    checked={editForm[feat.key]}
                                                    onChange={e => setEditForm({ ...editForm, [feat.key]: e.target.checked })}
                                                />
                                            ) : (
                                                plan[feat.key] ? <Check size={16} className="text-emerald-500" strokeWidth={3} /> : <X size={16} className="text-red-400" />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Status Bottom */}
                            <div className="px-8 py-4 bg-gray-50 border-t border-border flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Durum</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${plan.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${plan.is_active ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {plan.is_active ? 'Aktif Satışta' : 'Pasif'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
