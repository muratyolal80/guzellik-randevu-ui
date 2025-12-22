'use client';

import React, { useState } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { MOCK_SERVICES, MOCK_SERVICE_CATEGORIES } from '../../../constants';
import { Service } from '../../../types';

export default function ServiceManager() {
    const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('Tümü');

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingService({ name: '', duration: '', price: 0, category_id: '' });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Bu hizmeti silmek istediğinize emin misiniz?')) {
            setServices(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const categoryName = MOCK_SERVICE_CATEGORIES.find(c => c.id === editingService?.category_id)?.name || '';

        if (editingService?.id) {
            setServices(prev => prev.map(s => s.id === editingService.id ? { ...editingService, category: categoryName } as Service : s));
        } else {
            const newService = {
                ...editingService,
                id: Math.random().toString(36).substr(2, 9),
                category: categoryName
            } as Service;
            setServices(prev => [...prev, newService]);
        }
        setIsModalOpen(false);
        setEditingService(null);
    };

    const filteredServices = filterCategory === 'Tümü'
        ? services
        : services.filter(s => s.category === filterCategory);

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
                {MOCK_SERVICE_CATEGORIES.map((cat: any) => (
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
                        {filteredServices.map(service => (
                            <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-text-main">{service.name}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-text-secondary font-medium">{service.category}</span>
                                </td>
                                <td className="p-4 text-sm text-text-secondary">{service.duration}</td>
                                <td className="p-4 text-sm font-bold text-text-main">{service.price} ₺</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(service)} className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                        <button onClick={() => handleDelete(service.id)} className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
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
                                <input required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none" value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Kategori</label>
                                <select required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none" value={editingService.category_id} onChange={e => setEditingService({...editingService, category_id: e.target.value})}>
                                    <option value="">Seçiniz</option>
                                    {MOCK_SERVICE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Süre (dk/saat)</label>
                                    <input required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none" value={editingService.duration} onChange={e => setEditingService({...editingService, duration: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Ortalama Fiyat (₺)</label>
                                    <input type="number" required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none" value={editingService.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingService({...editingService, price: Number(e.target.value)})} />
                                </div>
                            </div>
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

