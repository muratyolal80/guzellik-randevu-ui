'use client';

import React, { useState } from 'react';
import { Ticket, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Coupon, DiscountType } from '@/types';

interface AddCouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (coupon: Coupon) => void;
    salonId: string;
}

export default function AddCouponModal({ isOpen, onClose, onSuccess, salonId }: AddCouponModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'PERCENTAGE' as DiscountType,
        discount_value: 0,
        min_purchase_amount: 0,
        usage_limit: 100,
        expires_at: '',
        is_active: true
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Bu metod db.ts içinde yeni eklendi
            const { CampaignService } = await import('@/services/db');
            const newCoupon = await CampaignService.createCoupon({
                ...formData,
                salon_id: salonId
            });
            onSuccess(newCoupon);
            onClose();
        } catch (error) {
            console.error('Kupon oluşturulurken hata:', error);
            alert('Kupon oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-main tracking-tight">Yeni Kupon Oluştur</h2>
                            <p className="text-xs text-text-secondary font-medium mt-0.5">Müşterileriniz için özel indirim tanımlayın.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-text-muted" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">Kupon Kodu</label>
                            <input
                                type="text"
                                required
                                placeholder="Örn: YAZ2024"
                                className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold uppercase"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">İndirim Tipi</label>
                            <div className="flex p-1 bg-gray-100 rounded-2xl border border-border">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, discount_type: 'PERCENTAGE' })}
                                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${formData.discount_type === 'PERCENTAGE' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                >
                                    Yüzde (%)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, discount_type: 'FIXED' })}
                                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${formData.discount_type === 'FIXED' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                >
                                    Sabit (₺)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">İndirim Değeri</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                                value={formData.discount_value}
                                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">Min. Alışveriş</label>
                            <input
                                type="number"
                                className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                                value={formData.min_purchase_amount}
                                onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">Kullanım Limiti</label>
                            <input
                                type="number"
                                required
                                className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                                value={formData.usage_limit}
                                onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">Son Kullanma</label>
                            <input
                                type="date"
                                className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                                value={formData.expires_at}
                                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">Açıklama</label>
                        <textarea
                            className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                            rows={2}
                            placeholder="Kupon hakkında kısa bilgi..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-primary text-white rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? 'Oluşturuluyor...' : 'Kuponu Oluştur'}
                    </button>
                </form>
            </div>
        </div>
    );
}
