'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SalonDataService } from '@/services/db';
import {
    Store,
    Clock,
    MapPin,
    Save,
    Image as ImageIcon,
    CheckCircle2,
    Info,
    Camera,
    XCircle
} from 'lucide-react';

export default function OwnerSettings() {
    const { user } = useAuth();
    const [salon, setSalon] = useState<any>(null);
    const [workingHours, setWorkingHours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'location'>('profile');

    // Form States
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (user) {
            fetchSalonData();
        }
    }, [user]);

    const fetchSalonData = async () => {
        try {
            setLoading(true);
            const data = await SalonDataService.getSalonByOwner(user?.id!);
            if (data) {
                setSalon(data);
                setName(data.name || '');
                setBio(data.description || '');
                setImage(data.image || '');
                setAddress(data.address || '');

                const hours = await SalonDataService.getSalonWorkingHours(data.id);
                setWorkingHours(hours);
            }
        } catch (err) {
            console.error('Veri çekme hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await SalonDataService.updateSalon(salon.id, {
                name,
                description: bio,
                image,
                address,
                updated_at: new Date().toISOString()
            });
            setMessage({ type: 'success', text: 'Salon bilgileriniz başarıyla güncellendi.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Güncelleme başarısız.' });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleSalonDay = async (hourId: string, currentStatus: boolean) => {
        try {
            await SalonDataService.updateSalonWorkingHours(hourId, { is_closed: !currentStatus });
            setWorkingHours(prev => prev.map(h => h.id === hourId ? { ...h, is_closed: !currentStatus } : h));
        } catch (err) {
            console.error('Güncelleme hatası:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
            <div>
                <h1 className="text-3xl font-black text-text-main tracking-tight">Salon Ayarları</h1>
                <p className="text-text-secondary font-medium italic">İşletmenizin dijital vitrinini ve genel çalışma düzenini özelleştirin.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Sol Menü - Tabs */}
                <div className="w-full lg:w-72 bg-white rounded-[32px] border border-border shadow-card p-4 shrink-0 overflow-hidden">
                    {[
                        { id: 'profile', label: 'Salon Profili', icon: Store },
                        { id: 'hours', label: 'Çalışma Saatleri', icon: Clock },
                        { id: 'location', label: 'İletişim & Konum', icon: MapPin }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-text-secondary hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Sağ Alan - Content */}
                <div className="flex-1 w-full min-w-0">
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-[40px] border border-border shadow-card overflow-hidden">
                            <div className="p-10 border-b border-border bg-gray-50/30">
                                <h3 className="text-xl font-black text-text-main tracking-tight font-display">Genel Bilgiler</h3>
                            </div>
                            <form onSubmit={handleSaveProfile} className="p-10 space-y-8">
                                <div className="flex flex-col md:flex-row gap-10 items-start">
                                    <div className="relative group cursor-pointer shrink-0">
                                        <div className="w-40 h-40 rounded-[40px] bg-surface-alt border-2 border-border overflow-hidden relative group-hover:border-primary/50 transition-all">
                                            <img src={image || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                        <p className="text-center text-[10px] font-black text-text-muted mt-3 uppercase tracking-widest">Salon Logosu</p>
                                    </div>

                                    <div className="flex-1 w-full space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Salon Adı</label>
                                            <input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-6 py-4 bg-surface-alt border border-border rounded-2xl text-base font-bold text-text-main focus:border-primary outline-none transition-all"
                                                placeholder="İşletme adınızı girin"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Görsel URL (Vitrin)</label>
                                            <div className="relative">
                                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                                <input
                                                    value={image}
                                                    onChange={(e) => setImage(e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-surface-alt border border-border rounded-2xl text-base font-bold text-text-main focus:border-primary outline-none transition-all"
                                                    placeholder="Görsel bağlantısı ekleyin"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Hakkımızda / Tanıtım</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full px-6 py-5 bg-surface-alt border border-border rounded-2xl text-base font-medium text-text-main focus:border-primary outline-none transition-all min-h-[160px] resize-none leading-relaxed"
                                        placeholder="Salonunuzun hikayesini ve sunduğu ayrıcalıkları anlatın..."
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        disabled={saving}
                                        type="submit"
                                        className="px-10 py-4 bg-primary text-white rounded-[24px] font-black shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        <Save className="w-5 h-5" />
                                        {saving ? 'Güncelleniyor...' : 'Ayarları Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'hours' && (
                        <div className="bg-white rounded-[40px] border border-border shadow-card overflow-hidden">
                            <div className="p-10 border-b border-border bg-gray-50/30">
                                <h3 className="text-xl font-black text-text-main tracking-tight font-display">İşletme Çalışma Grafikeri</h3>
                                <p className="text-xs font-medium text-text-secondary mt-1">Hangi günlerde kapalı olduğunuzu buradan ayarlayın. Randevu sistemi buna göre çalışır.</p>
                            </div>
                            <div className="p-10 space-y-4">
                                {['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'].map((dayName, idx) => {
                                    const dayConfig = workingHours.find(h => h.day_of_week === idx);
                                    if (!dayConfig) return null;

                                    return (
                                        <div key={idx} className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${dayConfig.is_closed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-border shadow-sm'}`}>
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${dayConfig.is_closed ? 'bg-gray-200 text-text-muted' : 'bg-primary/10 text-primary'}`}>
                                                    {dayName[0]}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-black text-text-main leading-none">{dayName}</p>
                                                    {!dayConfig.is_closed ? (
                                                        <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                                                            <Clock className="w-3.5 h-3.5" /> Servis Veriliyor ({dayConfig.opening_time.substring(0, 5)} - {dayConfig.closing_time.substring(0, 5)})
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-xs font-bold text-red-500">
                                                            <XCircle className="w-3.5 h-3.5" /> İşletme Kapalı
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleSalonDay(dayConfig.id, dayConfig.is_closed)}
                                                className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${dayConfig.is_closed ? 'bg-white text-text-main border border-border shadow-sm hover:border-primary/50' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'}`}
                                            >
                                                {dayConfig.is_closed ? 'Hizmete Aç' : 'Kapalı İşaretle'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-8 bg-primary/5 border-t border-primary/10 flex items-center gap-4">
                                <Info className="w-6 h-6 text-primary shrink-0" />
                                <p className="text-xs font-medium text-primary leading-relaxed italic">Not: Salon kapalıyken o gün için hiçbir personelinize randevu alınamaz. Personel bazlı özel izinleri 'Personel Yönetimi' altından düzenleyebilirsiniz.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'location' && (
                        <div className="bg-white rounded-[40px] border border-border shadow-card overflow-hidden">
                            <div className="p-10 border-b border-border bg-gray-50/30">
                                <h3 className="text-xl font-black text-text-main tracking-tight font-display">İletişim & Lokasyon</h3>
                            </div>
                            <form onSubmit={handleSaveProfile} className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Açık Adres</label>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-6 py-5 bg-surface-alt border border-border rounded-2xl text-base font-bold text-text-main focus:border-primary outline-none transition-all min-h-[120px] resize-none"
                                        placeholder="Cadde, mahalle ve bina numarası giriniz..."
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="px-10 py-4 bg-primary text-white rounded-[24px] font-black shadow-xl shadow-primary/20 hover:scale-[1.03] transition-all flex items-center gap-3"
                                    >
                                        <Save className="w-5 h-5" /> Lokasyon Bilgisini Güncelle
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
