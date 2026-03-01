'use client';

import React, { useState, useEffect } from 'react';
import { Package as PackageIcon, X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Package, SalonServiceDetail } from '@/types';

interface AddPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (pkg: Package) => void;
    salonId: string;
}

export default function AddPackageModal({ isOpen, onClose, onSuccess, salonId }: AddPackageModalProps) {
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<SalonServiceDetail[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        expires_at: '',
        is_active: true
    });
    const [selectedServices, setSelectedServices] = useState<{ salon_service_id: string, quantity: number }[]>([]);

    useEffect(() => {
        if (isOpen && salonId) {
            loadSalonServices();
        }
    }, [isOpen, salonId]);

    const loadSalonServices = async () => {
        try {
            const { ServiceService } = await import('@/services/db');
            const data = await ServiceService.getServicesBySalon(salonId);
            setServices(data);
        } catch (error) {
            console.error('Servisler yüklenirken hata:', error);
        }
    };

    const addServiceToPackage = (serviceId: string) => {
        if (selectedServices.find(s => s.salon_service_id === serviceId)) return;
        setSelectedServices([...selectedServices, { salon_service_id: serviceId, quantity: 1 }]);
    };

    const removeServiceFromPackage = (serviceId: string) => {
        setSelectedServices(selectedServices.filter(s => s.salon_service_id !== serviceId));
    };

    const updateQuantity = (serviceId: string, quantity: number) => {
        setSelectedServices(selectedServices.map(s =>
            s.salon_service_id === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s
        ));
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedServices.length === 0) {
            alert('Lütfen pakete en az bir servis ekleyin.');
            return;
        }

        try {
            setLoading(true);
            const { CampaignService } = await import('@/services/db');
            const newPackage = await CampaignService.createPackage(
                { ...formData, salon_id: salonId },
                selectedServices
            );
            onSuccess(newPackage);
            onClose();
        } catch (error) {
            console.error('Paket oluşturulurken hata:', error);
            alert('Paket oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-border flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <PackageIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-main tracking-tight">Yeni Paket Oluştur</h2>
                            <p className="text-xs text-text-secondary font-medium mt-0.5">Servislerinizi avantajlı paketler halinde sunun.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-text-muted" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-8 flex-grow">
                    <form id="package-form" onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">Paket Adı</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Örn: 5+1 Cilt Bakımı Paketi"
                                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">Paket Fiyatı (₺)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-primary"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">Açıklama</label>
                            <textarea
                                className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                rows={2}
                                placeholder="Paket detayları..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Service Selection Area */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-text-muted uppercase tracking-wider ml-1">Paket İçeriği</label>
                                <span className="text-[10px] font-black text-primary px-2 py-1 bg-primary/10 rounded-lg">
                                    {selectedServices.length} Servis Seçildi
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-border rounded-3xl p-4 bg-gray-50/50">
                                {/* Available Services (Scrollable list if many) */}
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-[10px] font-black text-text-muted uppercase px-1">Servis Listesi</p>
                                    {services.map(service => (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => addServiceToPackage(service.id)}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center group ${selectedServices.find(s => s.salon_service_id === service.id)
                                                    ? 'bg-primary/5 border-primary/20 opacity-50 cursor-not-allowed'
                                                    : 'bg-white border-border hover:border-primary/50 hover:shadow-md'
                                                }`}
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-text-main">{service.service_name}</p>
                                                <p className="text-[10px] font-medium text-text-muted tracking-tight">₺{service.price} • {service.duration_min} dk</p>
                                            </div>
                                            <Plus className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                                        </button>
                                    ))}
                                </div>

                                {/* Selected Services (With Quantities) */}
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-[10px] font-black text-text-muted uppercase px-1">Seçilenler</p>
                                    {selectedServices.length === 0 ? (
                                        <div className="h-[100px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-text-muted">
                                            <PackageIcon className="w-6 h-6 opacity-20 mb-1" />
                                            <span className="text-[10px] font-bold">Henüz servis eklenmedi</span>
                                        </div>
                                    ) : (
                                        selectedServices.map(item => {
                                            const service = services.find(s => s.id === item.salon_service_id);
                                            return (
                                                <div key={item.salon_service_id} className="p-4 bg-white border border-primary/20 rounded-2xl flex items-center justify-between shadow-sm animate-in slide-in-from-right-2">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-black text-text-main">{service?.service_name}</p>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.salon_service_id, item.quantity - 1)}
                                                                className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-lg text-text-main hover:bg-gray-200"
                                                            >-</button>
                                                            <span className="text-xs font-black w-4 text-center">{item.quantity} Adet</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.salon_service_id, item.quantity + 1)}
                                                                className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-lg text-text-main hover:bg-gray-200"
                                                            >+</button>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeServiceFromPackage(item.salon_service_id)}
                                                        className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-border bg-gray-50/50 flex-shrink-0">
                    <button
                        form="package-form"
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-primary text-white rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Oluşturuluyor...' : 'Paketi Kaydet & Yayınla'}
                    </button>
                </div>
            </div>
        </div>
    );
}
