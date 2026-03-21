'use client';

import React, { useState } from 'react';
import { Sparkles, X, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { CampaignRule, DiscountType } from '@/types';

interface AddCampaignRuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (rule: CampaignRule) => void;
    salonId: string;
}

const DAYS = [
    { id: 1, name: 'Pzt' },
    { id: 2, name: 'Sal' },
    { id: 3, name: 'Çar' },
    { id: 4, name: 'Per' },
    { id: 5, name: 'Cum' },
    { id: 6, name: 'Cmt' },
    { id: 7, name: 'Paz' }
];

export default function AddCampaignRuleModal({ isOpen, onClose, onSuccess, salonId }: AddCampaignRuleModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        discount_type: 'PERCENTAGE' as DiscountType,
        discount_value: 0,
        start_time: '09:00',
        end_time: '12:00',
        days_of_week: [] as number[],
        is_active: true
    });

    if (!isOpen) return null;

    const toggleDay = (dayId: number) => {
        setFormData(prev => ({
            ...prev,
            days_of_week: prev.days_of_week.includes(dayId)
                ? prev.days_of_week.filter(id => id !== dayId)
                : [...prev.days_of_week, dayId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { CampaignService } = await import('@/services/db');
            const newRule = await CampaignService.createCampaignRule({
                ...formData,
                salon_id: salonId,
                // Ensure times are in full format if needed, but 'HH:mm' is usually fine for Postgres 'time' type
            });
            onSuccess(newRule);
            onClose();
        } catch (error) {
            console.error('Kampanya kuralı oluşturulurken hata:', error);
            alert('Kampanya kuralı oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-main tracking-tight">Yeni Süreli Kampanya</h2>
                            <p className="text-xs text-text-secondary font-medium mt-0.5">Belirli saat ve günlere otomatik indirim tanımlayın.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-text-muted" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">Kampanya Adı</label>
                            <input
                                type="text"
                                required
                                placeholder="Örn: Hafta İçi Sabah İndirimi"
                                className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">İndirim Tipi</label>
                                <select 
                                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                    value={formData.discount_type}
                                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as DiscountType })}
                                >
                                    <option value="PERCENTAGE">Yüzde (%)</option>
                                    <option value="FIXED">Sabit (₺)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">İndirim Değeri</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                                <Clock className="w-4 h-4" /> Zamanlama Ayarları
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-indigo-700 uppercase tracking-widest ml-1">Başlangıç</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-indigo-700 uppercase tracking-widest ml-1">Bitiş</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-700 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Geçerli Günler
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => (
                                        <button
                                            key={day.id}
                                            type="button"
                                            onClick={() => toggleDay(day.id)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                                                formData.days_of_week.includes(day.id)
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                                                    : 'bg-white text-indigo-400 border-indigo-100 hover:border-indigo-300'
                                            }`}
                                        >
                                            {day.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">Açıklama (Opsiyonel)</label>
                            <textarea
                                className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
                                rows={2}
                                placeholder="Müşterilere kampanya hakkında bilgi verin..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || formData.days_of_week.length === 0}
                        className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none mt-4"
                    >
                        {loading ? 'Oluşturuluyor...' : 'Kampanya Kuralını Başlat'}
                    </button>
                    {formData.days_of_week.length === 0 && (
                        <p className="text-center text-[10px] font-bold text-red-500 italic mt-2">Lütfen en az bir gün seçin.</p>
                    )}
                </form>
            </div>
        </div>
    );
}
