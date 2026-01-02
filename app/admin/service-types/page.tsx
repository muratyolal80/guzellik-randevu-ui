'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { MasterDataService } from '@/services/db';
import { ServiceCategory } from '../../../types';

export default function ServiceCategoryManager() {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<ServiceCategory> | null>(null);

    // Load data from database
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await MasterDataService.getServiceCategories();
            setCategories(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleEdit = (cat: ServiceCategory) => {
        setEditingCategory(cat);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingCategory({ name: '', slug: '', icon: 'spa' });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Bu hizmet tipini silmek istediğinize emin misiniz?')) {
            setCategories(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory?.id) {
            setCategories(prev => prev.map(c => c.id === editingCategory.id ? editingCategory as ServiceCategory : c));
        } else {
            const newCat = { ...editingCategory, id: Math.random().toString(36).substr(2, 9) } as ServiceCategory;
            setCategories(prev => [...prev, newCat]);
        }
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-text-main">Hizmet Tipleri</h2>
                    <p className="text-text-secondary">Hizmet kategorilerini yönetin (Örn: Saç, Tırnak, Makyaj).</p>
                </div>
                <button onClick={handleCreate} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">add</span> Yeni Kategori Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-white rounded-xl border border-border p-6 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">{cat.icon || 'spa'}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-text-main">{cat.name}</h3>
                                <p className="text-xs text-text-secondary">{cat.slug}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEdit(cat)} className="p-2 text-text-secondary hover:text-primary bg-gray-50 rounded-lg"><span className="material-symbols-outlined text-lg">edit</span></button>
                             <button onClick={() => handleDelete(cat.id)} className="p-2 text-text-secondary hover:text-red-500 bg-gray-50 rounded-lg"><span className="material-symbols-outlined text-lg">delete</span></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xl font-bold text-text-main">{editingCategory.id ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Kategori Adı</label>
                                <input required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none" value={editingCategory.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingCategory({...editingCategory, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Slug</label>
                                <input required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none" value={editingCategory.slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingCategory({...editingCategory, slug: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">İkon (Material Symbol)</label>
                                <input className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none" value={editingCategory.icon} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingCategory({...editingCategory, icon: e.target.value})} />
                                <a href="https://fonts.google.com/icons" target="_blank" className="text-xs text-primary mt-1 inline-block hover:underline">İkonları buradan bulabilirsiniz</a>
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

