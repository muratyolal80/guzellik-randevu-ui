'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { MasterDataService } from '@/services/db';
import { GlobalService, ServiceCategory } from '@/types';

export default function ServiceManager() {
    const [services, setServices] = useState<GlobalService[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Partial<GlobalService> | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('Tümü');

    // Load data from database
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [servicesData, categoriesData] = await Promise.all([
                MasterDataService.getAllGlobalServices(),
                MasterDataService.getServiceCategories()
            ]);
            setServices(servicesData);
            setCategories(categoriesData);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleEdit = (service: GlobalService) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        // global_services only: name + category
        setEditingService({ name: '', category_id: '' });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu hizmeti silmek istediğinize emin misiniz?')) {
            try {
                await MasterDataService.deleteGlobalService(id);
                setServices(prev => prev.filter(s => s.id !== id));
            } catch (error) {
                console.error('Error deleting service:', error);
                alert('Hizmet silinirken bir hata oluştu.');
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingService?.name || !editingService?.category_id) return;

        try {
            if (editingService.id) {
                await MasterDataService.updateGlobalService(editingService.id, {
                    name: editingService.name,
                    category_id: editingService.category_id,
                    avg_duration_min: editingService.avg_duration_min,
                    avg_price: editingService.avg_price
                });
            } else {
                await MasterDataService.createGlobalService({
                    name: editingService.name,
                    category_id: editingService.category_id,
                    avg_duration_min: editingService.avg_duration_min,
                    avg_price: editingService.avg_price
                });
            }

            setIsModalOpen(false);
            setEditingService(null);

            // Refresh data
            const servicesData = await MasterDataService.getAllGlobalServices();
            setServices(servicesData);
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Hizmet kaydedilirken bir hata oluştu.');
        }
    };

    const filteredServices = filterCategory === 'Tümü'
        ? services
        : services.filter(s => {
            const category = categories.find(c => c.id === s.category_id);
            return category?.name === filterCategory;
        });

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-text-main">Hizmetler</h2>
                    <p className="text-text-secondary">Sistemde tanımlı tüm hizmetleri yönetin.</p>
                </div>
                <button onClick={handleCreate} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">add</span> Yeni Hizmet Ekle
                </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
                <button
                    onClick={() => setFilterCategory('Tümü')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterCategory === 'Tümü' ? 'bg-text-main text-white' : 'bg-white border border-border text-text-secondary hover:bg-gray-50'}`}
                >
                    Tümü
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.name)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterCategory === cat.name ? 'bg-text-main text-white' : 'bg-white border border-border text-text-secondary hover:bg-gray-50'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-text-secondary font-semibold">
                            <th className="p-4">Hizmet Adı</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4">Süre</th>
                            <th className="p-4">Ort. Fiyat</th>
                            <th className="p-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredServices.map(service => {
                            const category = categories.find(c => c.id === service.category_id);
                            return (
                                <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-text-main">{service.name}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-text-secondary font-medium">{category?.name || 'N/A'}</span>
                                    </td>
                                    <td className="p-4 text-sm text-text-secondary">{service.avg_duration_min ? `${service.avg_duration_min} dk` : '-'}</td>
                                    <td className="p-4 text-sm font-bold text-text-main">{service.avg_price ? `${service.avg_price} ₺` : '-'}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(service)} className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                            <button onClick={() => handleDelete(service.id)} className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xl font-bold text-text-main">{editingService.id ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Hizmet Adı</label>
                                <input
                                    required
                                    className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none"
                                    value={editingService.name || ''}
                                    onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Kategori</label>
                                <select
                                    required
                                    className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none"
                                    value={editingService.category_id || ''}
                                    onChange={e => setEditingService({ ...editingService, category_id: e.target.value })}
                                >
                                    <option value="">Seçiniz</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Ort. Süre (Dk)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full h-11 pl-4 pr-10 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none"
                                            value={editingService.avg_duration_min || ''}
                                            onChange={e => setEditingService({ ...editingService, avg_duration_min: e.target.value ? parseInt(e.target.value) : undefined })}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">dk</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Ort. Fiyat (TL)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="w-full h-11 pl-4 pr-10 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none"
                                            value={editingService.avg_price || ''}
                                            onChange={e => setEditingService({ ...editingService, avg_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">₺</div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-text-secondary italic bg-blue-50 p-2 rounded border border-blue-100">
                                <span className="font-bold">Not:</span> Bu değerler salonlar için referans amaçlıdır. Her salon kendi fiyatını ve süresini belirleyebilir.
                            </p>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-border text-text-secondary font-bold">İptal</button>
                                <button type="submit" className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};
