
import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { MOCK_SALON_TYPES } from '../../constants';
import { SalonType } from '../../types';

export const SalonTypeManager: React.FC = () => {
    const [types, setTypes] = useState<SalonType[]>(MOCK_SALON_TYPES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<Partial<SalonType> | null>(null);

    const handleEdit = (type: SalonType) => {
        setEditingType(type);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingType({ name: '', slug: '' });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Bu salon tipini silmek istediğinize emin misiniz?')) {
            setTypes(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingType?.id) {
            setTypes(prev => prev.map(t => t.id === editingType.id ? editingType as SalonType : t));
        } else {
            const newType = { ...editingType, id: Math.random().toString(36).substr(2, 9) } as SalonType;
            setTypes(prev => [...prev, newType]);
        }
        setIsModalOpen(false);
        setEditingType(null);
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-text-main">Salon Tipleri</h2>
                    <p className="text-text-secondary">Platformda yer alan salon kategorilerini yönetin (Örn: Kuaför, Berber).</p>
                </div>
                <button onClick={handleCreate} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">add</span> Yeni Tip Ekle
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-text-secondary font-semibold">
                            <th className="p-4">Tip Adı</th>
                            <th className="p-4">Slug (URL)</th>
                            <th className="p-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {types.map(type => (
                            <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-text-main">{type.name}</td>
                                <td className="p-4 text-sm text-text-secondary">{type.slug}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(type)} className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                        <button onClick={() => handleDelete(type.id)} className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && editingType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xl font-bold text-text-main">{editingType.id ? 'Tipi Düzenle' : 'Yeni Tip Ekle'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Tip Adı</label>
                                <input required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none" value={editingType.name} onChange={e => setEditingType({...editingType, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Slug</label>
                                <input required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none" value={editingType.slug} onChange={e => setEditingType({...editingType, slug: e.target.value})} />
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
