'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AdminLayout } from '@/components/AdminLayout';
import { MasterDataService, SalonDataService } from '@/services/db';
import { City, District, SalonType, SalonDetail } from '@/types';
import { GeocodingService } from '@/lib/geocoding';
import ImageUpload from '@/components/ImageUpload';

// Dynamically import the custom map component with no SSR to fix build errors
const AdminSalonMap = dynamic(
    () => import('@/components/Admin/AdminSalonMap'),
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-xs text-text-muted">Harita yükleniyor...</div>
    }
);

interface SalonFormData {
    id?: string;
    name?: string;
    city?: string;
    district?: string;
    location?: string;
    phone?: string;
    image?: string;
    coordinates?: { lat: number; lng: number };
    typeIds?: string[];
    tags?: string[];
    startPrice?: number;
    isSponsored?: boolean;
}

const salonDetailToFormData = (detail: SalonDetail): SalonFormData => ({
    id: detail.id,
    name: detail.name,
    city: detail.city_name,
    district: detail.district_name,
    location: detail.address,
    phone: detail.phone,
    image: detail.image,
    coordinates: {
        lat: detail.geo_latitude || 41.0082,
        lng: detail.geo_longitude || 28.9784
    },
    typeIds: detail.type_slug ? [detail.type_slug] : [],
    tags: detail.type_name ? [detail.type_name] : [],
    startPrice: 0,
    isSponsored: detail.is_sponsored
});

export default function SalonManager() {
    const [salons, setSalons] = useState<SalonDetail[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSalon, setEditingSalon] = useState<SalonFormData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [salonsData, citiesData, typesData] = await Promise.all([
                    SalonDataService.getSalons(),
                    MasterDataService.getCities(),
                    MasterDataService.getSalonTypes()
                ]);
                setSalons(salonsData);
                setCities(citiesData);
                setSalonTypes(typesData);
            } catch (err: unknown) {
                console.error("Fetch error:", err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

    useEffect(() => {
        const loadDistricts = async () => {
            if (editingSalon?.city) {
                const selectedCityData = cities.find(c => c.name === editingSalon.city);
                if (selectedCityData) {
                    // Update coordinates from DB if they exist
                    if (selectedCityData.latitude && selectedCityData.longitude && !editingSalon.id) {
                        setEditingSalon(prev => prev ? {
                            ...prev,
                            coordinates: { lat: selectedCityData.latitude!, lng: selectedCityData.longitude! }
                        } : null);
                    }

                    const districtsData = await MasterDataService.getDistrictsByCity(selectedCityData.id);
                    setDistricts(districtsData);
                    setAvailableDistricts(districtsData.map(d => d.name));
                }
            } else {
                setDistricts([]);
                setAvailableDistricts([]);
            }
        };
        loadDistricts();
    }, [editingSalon?.city, cities, editingSalon?.id]);

    const handleEdit = (salon: SalonDetail) => {
        setEditingSalon(salonDetailToFormData(salon));
        setSearchQuery(salon.address || '');
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        // Default to Istanbul coordinates if DB is empty, but logic in useEffect will override if city matches
        setEditingSalon({
            name: '',
            location: '',
            city: 'İstanbul',
            district: '',
            phone: '',
            startPrice: 0,
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
            tags: [],
            typeIds: [],
            coordinates: { lat: 41.0082, lng: 28.9784 },
            isSponsored: false
        });
        setSearchQuery('');
        setIsModalOpen(true);
    };

    const handleSearchAddress = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        const result = await GeocodingService.searchAddress(searchQuery);
        if (result && editingSalon) {
            setEditingSalon({
                ...editingSalon,
                coordinates: { lat: result.lat, lng: result.lon }
            });
        } else {
            alert('Adres bulunamadı. Lütfen şehri de ekleyerek daha detaylı arayın.');
        }
        setIsSearching(false);
    };

    const handleMapLocationSelect = (lat: number, lng: number) => {
        if (editingSalon) {
            setEditingSalon({
                ...editingSalon,
                coordinates: { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) }
            });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSalon) return;

        try {
            // Find IDs for selected names
            const cityData = cities.find(c => c.name === editingSalon.city);
            const districtData = districts.find(d => d.name === editingSalon.district);
            const typeData = salonTypes.find(t => editingSalon.typeIds?.includes(t.slug));

            if (!cityData || !districtData || !typeData) {
                const missing = [];
                if (!cityData) missing.push('Şehir');
                if (!districtData) missing.push('İlçe');
                if (!typeData) missing.push('Kategori');
                alert(`Lütfen eksik bilgileri tamamlayın: ${missing.join(', ')}`);
                return;
            }

            const salonPayload: any = {
                name: editingSalon.name || '',
                address: editingSalon.location || '',
                city_id: cityData.id,
                district_id: districtData.id,
                type_id: typeData.id,
                phone: editingSalon.phone || '',
                image: editingSalon.image || '',
                geo_latitude: editingSalon.coordinates?.lat,
                geo_longitude: editingSalon.coordinates?.lng,
                is_sponsored: editingSalon.isSponsored || false,
                updated_at: new Date().toISOString()
            };

            // If we're creating, we need an owner_id. 
            // In Admin mode, we might want to default to the current admin or let user pick.
            // For now, let's check if the service creates one or if we need to pass a default.
            if (!editingSalon.id) {
                // If it's a new salon, we need to assign an owner. 
                // Using the current user if they are admin, or a system account.
                const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
                if (user) {
                    salonPayload.owner_id = user.id;
                }

                console.log('Creating salon with payload:', salonPayload);
                await SalonDataService.createSalon(salonPayload);
            } else {
                console.log('Updating salon with id:', editingSalon.id, 'payload:', salonPayload);
                await SalonDataService.updateSalon(editingSalon.id, salonPayload);
            }

            setIsModalOpen(false);
            setEditingSalon(null);

            // Refresh list
            const salonsData = await SalonDataService.getSalons();
            setSalons(salonsData);

            alert('Salon başarıyla kaydedildi.');
        } catch (error: any) {
            console.error('Error saving salon:', error);
            const detail = error.message || error.details || JSON.stringify(error);
            alert(`Salon kaydedilerken bir hata oluştu: ${detail}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu salonu silmek istediğinize emin misiniz?')) {
            try {
                await SalonDataService.deleteSalon(id);
                setSalons(prev => prev.filter(s => s.id !== id));
            } catch (error) {
                console.error('Error deleting salon:', error);
                alert('Salon silinirken bir hata oluştu.');
            }
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-text-main">Salon Yönetimi</h2>
                    <p className="text-text-secondary">Sistemdeki tüm salonları düzenleyin veya ekleyin.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span> Yeni Salon Ekle
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-text-secondary font-semibold">
                            <th className="p-4">Salon Adı</th>
                            <th className="p-4">Konum</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div></td></tr>
                        ) : (
                            salons.map(salon => (
                                <tr key={salon.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-cover bg-center border" style={{ backgroundImage: `url('${salon.image}')` }}></div>
                                            <div>
                                                <p className="font-bold text-text-main">{salon.name}</p>
                                                {salon.is_sponsored && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-bold uppercase">Önerilen</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-text-secondary">
                                        {salon.district_name}, {salon.city_name}
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100 font-bold uppercase">{salon.type_name}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(salon)} className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                            <button onClick={() => handleDelete(salon.id)} className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && editingSalon && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-white sticky top-0 z-20">
                            <h3 className="text-lg sm:text-xl font-bold text-text-main">{editingSalon.id ? 'Salonu Düzenle' : 'Yeni Salon Ekle'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-main p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
                            <form className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-4">
                                {/* Left Column: Inputs */}
                                <div className="lg:col-span-7 space-y-6">
                                    <div>
                                        <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">Salon Adı</label>
                                        <input required className="w-full h-12 px-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium" value={editingSalon.name} onChange={e => setEditingSalon({ ...editingSalon, name: (e.target as HTMLInputElement).value })} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">Şehir</label>
                                            <select className="w-full h-12 px-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none appearance-none cursor-pointer text-sm" value={editingSalon.city} onChange={e => setEditingSalon({ ...editingSalon, city: (e.target as HTMLSelectElement).value, district: '' })}>
                                                <option value="">Seçiniz</option>
                                                {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">İlçe</label>
                                            <select disabled={!editingSalon.city} className="w-full h-12 px-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50 cursor-pointer text-sm" value={editingSalon.district} onChange={e => setEditingSalon({ ...editingSalon, district: (e.target as HTMLSelectElement).value })}>
                                                <option value="">Seçiniz</option>
                                                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">Açık Adres</label>
                                        <textarea required rows={3} className="w-full p-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-sm" value={editingSalon.location} onChange={e => setEditingSalon({ ...editingSalon, location: (e.target as HTMLTextAreaElement).value })}></textarea>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">Telefon</label>
                                            <input className="w-full h-12 px-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none font-medium text-sm" value={editingSalon.phone || ''} onChange={e => setEditingSalon({ ...editingSalon, phone: (e.target as HTMLInputElement).value })} placeholder="05XX XXX XX XX" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">Başlangıç Fiyatı (₺)</label>
                                            <input type="number" required className="w-full h-12 px-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none font-bold text-primary" value={editingSalon.startPrice} onChange={e => setEditingSalon({ ...editingSalon, startPrice: Number((e.target as HTMLInputElement).value) })} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">Salon Görseli</label>
                                        <div className="w-full h-48">
                                            <ImageUpload
                                                bucket="salon-images"
                                                currentImage={editingSalon.image}
                                                onUpload={(url) => setEditingSalon({ ...editingSalon, image: url })}
                                                label="Salon Ana Görseli"
                                                aspectRatio="video"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Map & Categories */}
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-border space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-xs font-black text-text-muted uppercase tracking-widest">Harita Konumu</label>
                                            <span className="text-[10px] text-primary font-bold">Haritaya tıklayarak seçin</span>
                                        </div>

                                        {/* Geocoding Search */}
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 h-10 px-3 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary"
                                                placeholder="Sokak, Mahalle ara..."
                                                value={searchQuery}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), handleSearchAddress())}
                                            />
                                            <button
                                                type="button"
                                                disabled={isSearching}
                                                onClick={(e) => { e.preventDefault(); handleSearchAddress(); }}
                                                className="px-4 h-10 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black disabled:bg-gray-400 whitespace-nowrap"
                                            >
                                                {isSearching ? '...' : 'BUL'}
                                            </button>
                                        </div>

                                        <div className="w-full h-64 rounded-xl overflow-hidden relative border-2 border-white shadow-inner bg-gray-200 z-10">
                                            <AdminSalonMap
                                                center={[editingSalon.coordinates?.lat || 41.0082, editingSalon.coordinates?.lng || 28.9784]}
                                                onLocationSelect={handleMapLocationSelect}
                                                markerPosition={editingSalon.coordinates}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white p-2 rounded-lg border border-border text-center">
                                                <p className="text-[9px] font-black text-gray-400 uppercase">Lat</p>
                                                <p className="text-xs font-mono font-bold truncate">{editingSalon.coordinates?.lat?.toFixed(6) || '-'}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-border text-center">
                                                <p className="text-[9px] font-black text-gray-400 uppercase">Lng</p>
                                                <p className="text-xs font-mono font-bold truncate">{editingSalon.coordinates?.lng?.toFixed(6) || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-xs font-black text-text-muted uppercase tracking-widest">Salon Kategorileri</label>
                                        <div className="flex flex-wrap gap-2">
                                            {salonTypes.map(type => (
                                                <label key={type.id} className={`cursor-pointer border-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${editingSalon.typeIds?.includes(type.slug) ? 'bg-primary border-primary text-white scale-105 shadow-md shadow-primary/20' : 'bg-white border-gray-100 text-text-secondary hover:border-primary/30'}`}>
                                                    <input type="checkbox" className="hidden" checked={editingSalon.typeIds?.includes(type.slug)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const typeIds = editingSalon.typeIds || [];
                                                        const tags = editingSalon.tags || [];
                                                        if (e.target.checked) setEditingSalon({ ...editingSalon, typeIds: [...typeIds, type.slug], tags: [...tags, type.name] });
                                                        else setEditingSalon({ ...editingSalon, typeIds: typeIds.filter(s => s !== type.slug), tags: tags.filter(t => t !== type.name) });
                                                    }} />
                                                    {type.name}
                                                </label>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 mt-4">
                                            <input type="checkbox" id="isSponsored" className="size-5 rounded border-amber-300 text-primary focus:ring-primary" checked={editingSalon.isSponsored} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingSalon({ ...editingSalon, isSponsored: e.target.checked })} />
                                            <label htmlFor="isSponsored" className="text-sm font-bold text-amber-900 cursor-pointer">Bu salonu öne çıkar (Sponsorlu)</label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer (Sticky) */}
                        <div className="p-4 sm:p-6 border-t border-border bg-gray-50 flex flex-row justify-end gap-3 sticky bottom-0 z-20 shrink-0">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 sm:flex-none px-8 py-3 rounded-xl border border-border text-text-secondary hover:bg-white font-bold transition-all">İptal</button>
                            <button type="button" onClick={handleSave} className="flex-[2] sm:flex-none px-10 py-3 rounded-xl bg-primary text-white font-black hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">KAYDET</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
