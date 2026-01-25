'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { ServiceService, SalonDataService } from '@/services/db';
import { Plus, Search, Edit2, Trash2, Tag, Clock, Check, X, Scissors, Loader2 } from 'lucide-react';

export default function ServicesPage() {
    const { user } = useAuth();
    const { salonId: tenantSalonId } = useTenant();
    const [services, setServices] = useState<any[]>([]);
    const [globalServices, setGlobalServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [salonId, setSalonId] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        global_service_id: '',
        price: '',
        duration_min: '30'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const salon = await SalonDataService.getSalonByOwner(user?.id!);
            if (salon) {
                setSalonId(salon.id);
                const [myServices, globals] = await Promise.all([
                    ServiceService.getServicesBySalon(salon.id),
                    ServiceService.getGlobalServices()
                ]);
                setServices(myServices);
                setGlobalServices(globals);
            }
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (service: any = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                global_service_id: service.global_service_id || '', // Note: View might not have this, check structure
                price: service.price.toString(),
                duration_min: service.duration_min.toString()
            });
        } else {
            setEditingService(null);
            setFormData({
                global_service_id: '',
                price: '',
                duration_min: '30'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!salonId) return;
        setSaving(true);
        try {
            if (editingService) {
                // Update
                await ServiceService.updateService(editingService.id, {
                    price: parseFloat(formData.price),
                    duration_min: parseInt(formData.duration_min)
                });
            } else {
                // Create
                if (!formData.global_service_id) {
                    alert('Lütfen bir hizmet seçiniz.');
                    setSaving(false);
                    return;
                }
                await ServiceService.createService({
                    salon_id: salonId,
                    global_service_id: formData.global_service_id,
                    price: parseFloat(formData.price),
                    duration_min: parseInt(formData.duration_min)
                });
            }
            setIsModalOpen(false);
            loadData(); // Refresh list
        } catch (error: any) {
            alert('İşlem başarısız: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
        try {
            // Use tenant validation
            const validateSalonId = tenantSalonId || salonId;
            if (validateSalonId) {
                await ServiceService.deleteService(id, validateSalonId);
            } else {
                await ServiceService.deleteService(id);
            }
            setServices(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Delete error', error);
            alert('Silinemedi.');
        }
    };

    const filteredServices = services.filter(s =>
        s.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[32px] border border-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-text-main tracking-tight">Hizmet Yönetimi</h1>
                    <p className="text-text-secondary font-medium">Salonunuzda verilen hizmetleri ve fiyatları düzenleyin.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Hizmet Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search & Filter - Left Side or Top */}
                <div className="lg:col-span-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Hizmet ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Services Grid */}
                {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                        <div key={service.id} className="bg-white rounded-[24px] border border-border p-5 hover:border-primary/50 transition-all hover:shadow-md group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <Scissors className="w-6 h-6" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(service)}
                                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-primary transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-text-main mb-1">{service.service_name}</h3>
                            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider mb-4">
                                {service.category_name}
                            </span>

                            <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-100">
                                <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                                    <Clock className="w-4 h-4" />
                                    {service.duration_min} dk
                                </div>
                                <div className="flex items-center gap-1 text-primary font-black text-lg">
                                    <Tag className="w-4 h-4" />
                                    {service.price} ₺
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="lg:col-span-3 text-center py-20 bg-white rounded-[40px] border border-dashed border-border">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                            <Scissors className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Hizmet Bulunamadı</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">Henüz eklenmiş bir hizmetiniz yok veya aramanızla eşleşen sonuç bulunamadı.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            İlk Hizmeti Ekle
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-text-main">
                                {editingService ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-5">
                            {!editingService && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Hizmet Seçimi</label>
                                    <select
                                        value={formData.global_service_id}
                                        onChange={(e) => setFormData({ ...formData, global_service_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium appearance-none"
                                        required
                                    >
                                        <option value="">Listedan Seçiniz...</option>
                                        {globalServices.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Fiyat (₺)</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                            placeholder="0.00"
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Süre (Dk)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.duration_min}
                                            onChange={(e) => setFormData({ ...formData, duration_min: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                            placeholder="30"
                                            required
                                            min="5"
                                            step="5"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    {editingService ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
