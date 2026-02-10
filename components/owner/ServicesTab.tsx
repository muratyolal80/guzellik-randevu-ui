'use client';

import React, { useState, useEffect } from 'react';
import { ServiceService } from '@/services/db';
import { SalonServiceDetail, GlobalService } from '@/types';
import {
    Plus,
    Trash2,
    Edit2,
    Clock,
    CreditCard,
    Scissors,
    Wand2,
    Save,
    X,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

interface ServicesTabProps {
    salonId: string;
}

export default function ServicesTab({ salonId }: ServicesTabProps) {
    const [services, setServices] = useState<SalonServiceDetail[]>([]);
    const [globalServices, setGlobalServices] = useState<GlobalService[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [editingService, setEditingService] = useState<SalonServiceDetail | null>(null);
    const [saving, setSaving] = useState(false);

    // New Service Form
    const [newServiceId, setNewServiceId] = useState('');
    const [newPrice, setNewPrice] = useState(100);
    const [newDuration, setNewDuration] = useState(30);

    // Smart Defaults: Update price/duration when global service is selected
    useEffect(() => {
        if (newServiceId && !editingService) {
            const selected = globalServices.find(gs => gs.id === newServiceId);
            if (selected) {
                if (selected.avg_price) setNewPrice(selected.avg_price);
                if (selected.avg_duration_min) setNewDuration(selected.avg_duration_min);
            }
        }
    }, [newServiceId, globalServices, editingService]);

    useEffect(() => {
        fetchData();
    }, [salonId]);

    const fetchData = async () => {
        try {
            const [salonServices, globalList] = await Promise.all([
                ServiceService.getServicesBySalon(salonId),
                ServiceService.getGlobalServices()
            ]);
            setServices(salonServices);
            setGlobalServices(globalList);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: SalonServiceDetail) => {
        setEditingService(service);
        setNewServiceId(service.global_service_id);
        setNewPrice(service.price);
        setNewDuration(service.duration_min);
        setShowAdd(true);
    };

    const handleSaveService = async () => {
        if (!newServiceId && !editingService) return;
        setSaving(true);
        try {
            if (editingService) {
                // Update existing
                await ServiceService.updateService(editingService.id, {
                    price: newPrice,
                    duration_min: newDuration
                }, salonId);
            } else {
                // Create new
                await ServiceService.createService({
                    salon_id: salonId,
                    global_service_id: newServiceId,
                    price: newPrice,
                    duration_min: newDuration
                });
            }

            setShowAdd(false);
            setEditingService(null);
            setNewServiceId('');
            setNewPrice(100); // Reset to default or keep last used? Resetting is safer.
            setNewDuration(30);
            fetchData();
        } catch (err: any) {
            console.error('Hizmet kaydetme hatası:', err);
            const errorMsg = err.message || 'Hizmet kaydedilirken hata oluştu';
            alert(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowAdd(false);
        setEditingService(null);
        setNewServiceId('');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
        try {
            await ServiceService.deleteService(id, salonId);
            setServices(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 text-center text-text-muted">Yükleniyor...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-[32px] border border-border">
                <div>
                    <h3 className="text-lg font-black text-text-main">Hizmet Listesi</h3>
                    <p className="text-xs text-text-secondary mt-1">{services.length} farklı işlem sunuyorsunuz.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingService(null);
                        setNewServiceId('');
                        setShowAdd(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <Plus className="w-5 h-5" /> Yeni Hizmet Ekle
                </button>
            </div>

            {/* Add Service Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-text-main/20 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] md:rounded-[48px] shadow-2xl border border-border animate-scale-up">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-8 py-6 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Wand2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-text-main">{editingService ? 'Hizmeti Düzenle' : 'Yeni Hizmet Oluştur'}</h3>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Salon Kataloğuna Ekle</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-3 hover:bg-gray-100 rounded-2xl transition-all group"
                            >
                                <X className="w-6 h-6 text-text-muted group-hover:text-text-main group-hover:rotate-90 transition-all" />
                            </button>
                        </div>

                        <div className="p-8 md:p-10 space-y-10">
                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="md:col-span-2 group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                        <Wand2 className="w-3.5 h-3.5" /> İşlem Seçin
                                    </label>
                                    <div className="relative group">
                                        <select
                                            value={newServiceId}
                                            onChange={(e) => setNewServiceId(e.target.value)}
                                            disabled={!!editingService} // Disable changing service type when editing
                                            className={`w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl md:rounded-[24px] font-black text-text-main text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer ${editingService ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">Seçiniz...</option>
                                            {globalServices.map(gs => (
                                                <option key={gs.id} value={gs.id}>{gs.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                        <TrendingUp className="w-3.5 h-3.5" /> Fiyat (₺)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={newPrice}
                                            onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                                            className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all pl-12"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary">₺</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                        <Clock className="w-3.5 h-3.5" /> Süre (Dakika)
                                    </label>
                                    <select
                                        value={newDuration}
                                        onChange={(e) => setNewDuration(parseInt(e.target.value))}
                                        className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                                    >
                                        {[15, 30, 45, 60, 75, 90, 105, 120, 150, 180].map(m => (
                                            <option key={m} value={m}>{m} Dakika</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                        <AlertCircle className="w-3.5 h-3.5" /> Notlar (İsteğe Bağlı)
                                    </label>
                                    <textarea
                                        className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl md:rounded-[24px] font-medium text-text-secondary outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all min-h-[140px] resize-none leading-relaxed"
                                        placeholder="Hizmetle ilgili özel notlar veya ekipman detayları..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md px-8 py-6 border-t border-border flex items-center justify-end gap-4">
                            <button
                                onClick={handleCloseModal}
                                className="px-8 py-4 font-black text-text-muted hover:text-text-main transition-all"
                            >
                                İptal Et
                            </button>
                            <button
                                onClick={handleSaveService}
                                disabled={saving}
                                className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {saving ? 'Kaydediliyor...' : (editingService ? 'Güncelle' : 'Hizmeti Kaydet')}
                                <Save className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {services.map(service => (
                    <div key={service.id} className="group bg-white p-6 rounded-[28px] border border-border shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-surface-alt rounded-2xl flex items-center justify-center text-primary border border-border group-hover:bg-primary group-hover:text-white transition-colors">
                                <Scissors className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-text-main">{service.service_name}</p>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                        <Clock className="w-3.5 h-3.5" /> {service.duration_min} dk
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                        <CreditCard className="w-3.5 h-3.5" /> {service.price} ₺
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(service)} className="p-3 hover:bg-gray-100 rounded-xl text-text-secondary transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(service.id)} className="p-3 hover:bg-red-50 rounded-xl text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
