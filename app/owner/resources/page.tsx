'use client';

import React, { useState, useEffect } from 'react';
import { ResourceService, SalonDataService } from '@/services/db';
import { SalonResource } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
    Database, 
    Plus, 
    X, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    Layout, 
    Info,
    MoreVertical,
    Layers,
    Activity,
    Users
} from 'lucide-react';

export default function OwnerResources() {
    const { user } = useAuth();
    const [salonId, setSalonId] = useState<string | null>(null);
    const [resources, setResources] = useState<SalonResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingResource, setEditingResource] = useState<SalonResource | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        capacity: 1,
        is_active: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const savedSalonId = localStorage.getItem('owner_selected_salon_id');
        if (savedSalonId) {
            setSalonId(savedSalonId);
            fetchResources(savedSalonId);
        } else if (user?.id) {
            fetchInitialSalon(user.id);
        }
    }, [user?.id]);

    const fetchInitialSalon = async (userId: string) => {
        try {
            const salons = await SalonDataService.getSalonsByOwner(userId);
            if (salons && salons.length > 0) {
                setSalonId(salons[0].id);
                localStorage.setItem('owner_selected_salon_id', salons[0].id);
                fetchResources(salons[0].id);
            }
        } catch (err) {
            console.error('Salonlar çekilemedi:', err);
        }
    };

    const fetchResources = async (id: string) => {
        try {
            setLoading(true);
            const data = await ResourceService.getResourcesBySalon(id);
            setResources(data);
        } catch (err) {
            console.error('Kaynaklar çekilemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (resource?: SalonResource) => {
        if (resource) {
            setEditingResource(resource);
            setFormData({
                name: resource.name,
                description: resource.description || '',
                capacity: resource.capacity,
                is_active: resource.is_active
            });
        } else {
            setEditingResource(null);
            setFormData({
                name: '',
                description: '',
                capacity: 1,
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!salonId) return;
        setSaving(true);
        try {
            if (editingResource) {
                await ResourceService.updateResource(editingResource.id, formData);
            } else {
                await ResourceService.createResource({
                    ...formData,
                    salon_id: salonId
                });
            }
            fetchResources(salonId);
            setShowModal(false);
        } catch (err) {
            console.error('Kaynak kaydedilemedi:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu kaynağı silmek istediğinize emin misiniz?')) return;
        try {
            await ResourceService.deleteResource(id);
            if (salonId) fetchResources(salonId);
        } catch (err) {
            console.error('Kaynak silinemedi:', err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-text-main tracking-tight flex items-center gap-4">
                        <Database className="w-10 h-10 text-primary" /> Kaynak Yönetimi
                    </h1>
                    <p className="text-text-muted font-bold mt-2">Koltuk, oda ve ekipman kapasitelerinizi yönetin.</p>
                </div>
                
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[20px] font-black text-sm uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" /> Yeni Kaynak Ekle
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[40px] border-2 border-border/50 shadow-card relative overflow-hidden group">
                    <Layers className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                    <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Toplam Kaynak</p>
                    <h3 className="text-5xl font-black mt-2 text-text-main">{resources.length}</h3>
                    <p className="text-xs text-text-muted font-bold mt-6">Tanımlanmış tüm fiziksel alanlar</p>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-border/50 shadow-card relative overflow-hidden group">
                    <Activity className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/5 group-hover:scale-110 transition-transform duration-700" />
                    <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Aktif Durumda</p>
                    <h3 className="text-5xl font-black mt-2 text-emerald-600">
                        {resources.filter(r => r.is_active).length}
                    </h3>
                    <p className="text-xs text-text-muted font-bold mt-6">Şu an kullanıma uygun olanlar</p>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-border/50 shadow-card relative overflow-hidden group">
                    <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/5 group-hover:scale-110 transition-transform duration-700" />
                    <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Anlık Kapasite</p>
                    <h3 className="text-5xl font-black mt-2 text-amber-600">
                        {resources.reduce((acc, r) => acc + (r.is_active ? r.capacity : 0), 0)}
                    </h3>
                    <p className="text-xs text-text-muted font-bold mt-6">Toplam eşzamanlı müşteri sınırı</p>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                    <div key={resource.id} className="bg-white p-8 rounded-[40px] border-2 border-border/50 shadow-card hover:border-primary transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${resource.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                <Layout className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleOpenModal(resource)}
                                    className="p-3 bg-surface-alt rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(resource.id)}
                                    className="p-3 bg-surface-alt rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h4 className="text-2xl font-black text-text-main group-hover:text-primary transition-colors">{resource.name}</h4>
                        <p className="text-sm text-text-muted font-bold mt-2 h-10 line-clamp-2">{resource.description || 'Açıklama belirtilmemiş.'}</p>

                        <div className="mt-8 pt-8 border-t border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-text-muted uppercase tracking-widest">Kapasite:</span>
                                <span className="font-black text-text-main">{resource.capacity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {resource.is_active ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Aktif</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4 text-red-500" />
                                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Pasif</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {resources.length === 0 && (
                    <div className="col-span-full py-20 bg-surface-alt border-2 border-dashed border-border rounded-[40px] text-center space-y-4">
                        <Database className="w-16 h-16 text-text-muted/20 mx-auto" />
                        <h4 className="text-xl font-black text-text-muted">Henüz kaynak tanımlanmamış.</h4>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="text-primary font-black text-sm uppercase tracking-widest hover:underline"
                        >
                            İlk kaynağınızı ekleyin
                        </button>
                    </div>
                )}
            </div>

            {/* Manage Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-text-main/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden animate-in zoom-in duration-300 relative">
                        <div className="p-8 border-b border-border flex items-center justify-between bg-surface-alt">
                            <h2 className="text-2xl font-black text-text-main tracking-tight">
                                {editingResource ? 'Kaynağı Düzenle' : 'Yeni Kaynak Ekle'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Kaynak Adı</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Örn: VIP Makyaj Koltuğu" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full p-5 bg-surface-alt border-2 border-border/50 rounded-2xl font-bold outline-none focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Açıklama</label>
                                    <textarea 
                                        placeholder="Konum veya ayırt edici özellikler..." 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full p-5 bg-surface-alt border-2 border-border/50 rounded-2xl font-bold outline-none focus:border-primary transition-all min-h-[100px] resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Kapasite</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            required
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                                            className="w-full p-5 bg-surface-alt border-2 border-border/50 rounded-2xl font-bold outline-none focus:border-primary transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Durum</label>
                                        <div className="flex items-center gap-4 h-[64px]">
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                                                className={`flex-1 h-full rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${formData.is_active ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-red-50 border-red-500 text-red-600'}`}
                                            >
                                                {formData.is_active ? 'Aktif' : 'Pasif'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                                <Info className="w-6 h-6 text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-700 font-bold leading-relaxed">
                                    Kapasite, aynı anda kaç farklı randevunun bu kaynağı kullanabileceğini belirler. Genellikle bu değer '1'dir.
                                </p>
                            </div>

                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full py-5 bg-primary text-white rounded-[20px] font-black text-sm uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5" />
                                )}
                                {editingResource ? 'Değişiklikleri Kaydet' : 'Kaynağı Oluştur'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
