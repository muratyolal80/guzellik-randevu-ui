'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { MasterDataService, SalonDataService } from '@/services/db';
import { City, District, SalonType, SalonDetail } from '@/types';

// Helper: Default coordinates for major cities (fallback until we have all in DB)
const getCityCoordinates = (cityName: string): { lat: number; lng: number } => {
    const defaults: Record<string, { lat: number; lng: number }> = {
        "Istanbul": { lat: 41.0082, lng: 28.9784 },
        "Ankara": { lat: 39.9208, lng: 32.8541 },
        "Izmir": { lat: 38.4237, lng: 27.1428 },
        "Antalya": { lat: 36.8969, lng: 30.7133 },
        "Bursa": { lat: 40.1885, lng: 29.0610 }
    };
    return defaults[cityName] || defaults["Istanbul"];
};

// Form data type for editing (matches the form structure, not DB structure)
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

// Adapter: Convert SalonDetail (from DB) to SalonFormData (for editing)
const salonDetailToFormData = (detail: SalonDetail): SalonFormData => {
    return {
        id: detail.id,
        name: detail.name,
        city: detail.city_name,
        district: detail.district_name,
        location: detail.address,
        phone: detail.phone,
        image: detail.image,
        coordinates: {
            lat: detail.geo_latitude || 0,
            lng: detail.geo_longitude || 0
        },
        typeIds: [detail.type_slug],
        tags: [detail.type_name],
        startPrice: 0, // TODO: Get from salon_services
        isSponsored: detail.is_sponsored
    };
};

export default function SalonManager() {
    // State management
    const [salons, setSalons] = useState<SalonDetail[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSalon, setEditingSalon] = useState<SalonFormData | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    // Load initial data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [salonsData, citiesData, typesData] = await Promise.all([
                SalonDataService.getSalons(),
                MasterDataService.getCities(),
                MasterDataService.getSalonTypes()
            ]);
            setSalons(salonsData);
            setCities(citiesData);
            setSalonTypes(typesData);
            setLoading(false);
        };
        fetchData();
    }, []);

    // State for Districts dependent on selected City
    const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

    useEffect(() => {
        const loadDistricts = async () => {
            if (editingSalon?.city) {
                const selectedCityData = cities.find(c => c.name === editingSalon.city);
                if (selectedCityData) {
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
    }, [editingSalon?.city, cities]);

    const handleEdit = (salon: SalonDetail) => {
        setEditingSalon(salonDetailToFormData(salon));
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingSalon({
            name: '',
            location: '',
            city: 'İstanbul',
            district: '',
            startPrice: 0,
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
            tags: [],
            typeIds: [],
            coordinates: { lat: 41.0082, lng: 28.9784 },
            isSponsored: false
        });
        setIsModalOpen(true);
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSalon) return;

        try {
            // Find IDs for relations
            const cityData = cities.find(c => c.name === editingSalon.city);
            const districtData = districts.find(d => d.name === editingSalon.district);
            const typeData = salonTypes.find(t => editingSalon.typeIds?.includes(t.slug));

            const salonPayload = {
                name: editingSalon.name || '',
                address: editingSalon.location || '',
                city_id: cityData?.id,
                district_id: districtData?.id,
                type_id: typeData?.id,
                phone: editingSalon.phone || '',
                image: editingSalon.image || '',
                geo_latitude: editingSalon.coordinates?.lat,
                geo_longitude: editingSalon.coordinates?.lng,
                is_sponsored: editingSalon.isSponsored || false,
                updated_at: new Date().toISOString()
            };

            if (editingSalon.id) {
                // Update existing salon
                await SalonDataService.updateSalon(editingSalon.id, salonPayload);
            } else {
                // Create new salon
                await SalonDataService.createSalon(salonPayload as any);
            }

            setIsModalOpen(false);
            setEditingSalon(null);

            // Refresh data
            const salonsData = await SalonDataService.getSalons();
            setSalons(salonsData);
        } catch (error) {
            console.error('Error saving salon:', error);
            alert('Salon kaydedilirken bir hata oluştu.');
        }
    };

    // --- Geocoding & Map Logic ---

    // 1. Simulate "Get Coordinates from Address" (Geocoding)
    const handleGeocode = () => {
        if (!editingSalon?.city) {
            alert("Lütfen önce bir şehir seçiniz.");
            return;
        }
        const base = getCityCoordinates(editingSalon.city);

        // Simulate finding specific coords for the address (random offset near city center)
        const newLat = base.lat + (Math.random() - 0.5) * 0.05;
        const newLng = base.lng + (Math.random() - 0.5) * 0.05;

        setEditingSalon({
            ...editingSalon,
            coordinates: { lat: parseFloat(newLat.toFixed(4)), lng: parseFloat(newLng.toFixed(4)) }
        });
    };

    // 2. Map Click Interaction (Drag-drop simulation)
    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mapRef.current || !editingSalon?.city) return;

        const rect = (mapRef.current as any).getBoundingClientRect();
        const clickX = e.clientX - rect.left; // x position within the element.
        const clickY = e.clientY - rect.top;  // y position within the element.

        // Convert pixels to percentage (0-100)
        const xPercent = (clickX / rect.width) * 100;
        const yPercent = (clickY / rect.height) * 100;

        // Inverse Projection Logic (must match HomePage MapView projection)
        // HomePage Logic:
        // y = 50 - (lat - center.lat) * 800
        // x = 50 + (lng - center.lng) * 800

        const center = getCityCoordinates(editingSalon.city);

        // Derived Inverse:
        // lat = center.lat - (yPercent - 50) / 800
        // lng = center.lng + (xPercent - 50) / 800

        const newLat = center.lat - (yPercent - 50) / 800;
        const newLng = center.lng + (xPercent - 50) / 800;

        // Strictly verify numbers
        if (isNaN(newLat) || isNaN(newLng)) return;

        setEditingSalon({
            ...editingSalon,
            coordinates: { lat: parseFloat(newLat.toFixed(4)), lng: parseFloat(newLng.toFixed(4)) }
        });
    };

    // Helper to position the pin on the Admin map
    const getPinStyle = () => {
        if (!editingSalon?.coordinates || !editingSalon?.city) return { top: '50%', left: '50%' };

        // Safe defaults
        const center = getCityCoordinates(editingSalon.city);
        const lat = Number(editingSalon.coordinates.lat);
        const lng = Number(editingSalon.coordinates.lng);

        if (isNaN(lat) || isNaN(lng)) return { top: '50%', left: '50%' };

        const y = 50 - (lat - center.lat) * 800;
        const x = 50 + (lng - center.lng) * 800;

        // Clamp to map bounds
        return {
            top: `${Math.max(0, Math.min(100, y))}%`,
            left: `${Math.max(0, Math.min(100, x))}%`
        };
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-text-main">Salon Yönetimi</h2>
                    <p className="text-text-secondary">Sistemdeki tüm salonları düzenleyin, ekleyin veya kaldırın.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span> Yeni Salon Ekle
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-text-secondary font-semibold">
                            <th className="p-4">Salon Adı</th>
                            <th className="p-4">Konum</th>
                            <th className="p-4">Kategori (Tür)</th>
                            <th className="p-4">Fiyat (Başlangıç)</th>
                            <th className="p-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-text-secondary">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                        <span>Yükleniyor...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : salons.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-text-secondary">
                                    Henüz salon eklenmemiş.
                                </td>
                            </tr>
                        ) : (
                            salons.map(salon => (
                                <tr key={salon.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-cover bg-center border border-border" style={{ backgroundImage: `url('${salon.image}')` }}></div>
                                            <div>
                                                <p className="font-bold text-text-main">{salon.name}</p>
                                                {salon.is_sponsored && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-bold">ÖNERİLEN</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-text-secondary">
                                        <div className="flex flex-col">
                                            <span>{salon.district_name}, {salon.city_name}</span>
                                            <span className="text-xs text-text-muted truncate max-w-[150px]">{salon.address}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {salon.type_name && (
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">{salon.type_name}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-text-main">N/A ₺</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(salon)} className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                            <button onClick={() => handleDelete(salon.id)} className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && editingSalon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-white z-10 shrink-0 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-text-main">{editingSalon.id ? 'Salonu Düzenle' : 'Yeni Salon Ekle'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-main"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Form Fields */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-text-main mb-2">Salon Adı</label>
                                            <input required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" value={editingSalon.name} onChange={e => setEditingSalon({ ...editingSalon, name: (e.target as HTMLInputElement).value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-text-main mb-2">Şehir</label>
                                                <select
                                                    className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                    value={editingSalon.city}
                                                    onChange={e => {
                                                        const city = (e.target as HTMLSelectElement).value;
                                                        setEditingSalon({ ...editingSalon, city: city, district: '' });
                                                    }}
                                                >
                                                    <option value="">Seçiniz</option>
                                                    {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-text-main mb-2">İlçe</label>
                                                <select
                                                    disabled={!editingSalon.city}
                                                    className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                                                    value={editingSalon.district}
                                                    onChange={e => setEditingSalon({ ...editingSalon, district: (e.target as HTMLSelectElement).value })}
                                                >
                                                    <option value="">Seçiniz</option>
                                                    {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-text-main mb-2">Açık Adres</label>
                                            <div className="flex gap-2">
                                                <textarea required rows={3} className="flex-1 p-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" value={editingSalon.location} onChange={e => setEditingSalon({ ...editingSalon, location: (e.target as HTMLTextAreaElement).value })}></textarea>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleGeocode}
                                                className="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                                            >
                                                <span className="material-symbols-outlined text-sm">my_location</span>
                                                Google Maps ile Konumu Bul
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-text-main mb-2">Başlangıç Fiyatı (₺)</label>
                                            <input type="number" required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" value={editingSalon.startPrice} onChange={e => setEditingSalon({ ...editingSalon, startPrice: Number((e.target as HTMLInputElement).value) })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-text-main mb-2">Görsel URL</label>
                                            <input className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" value={editingSalon.image} onChange={e => setEditingSalon({ ...editingSalon, image: (e.target as HTMLInputElement).value })} />
                                        </div>
                                    </div>

                                    {/* Right Column: Map Picker */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-text-main">Harita Konumu</label>
                                        <div className="text-xs text-text-secondary mb-2">Konumu doğrulamak için harita üzerine tıklayın veya sürükleyin.</div>

                                        <div
                                            ref={mapRef}
                                            onClick={handleMapClick}
                                            className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden relative border border-border cursor-crosshair group"
                                        >
                                            <img
                                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
                                                className="w-full h-full object-cover opacity-60 grayscale filter mix-blend-multiply pointer-events-none select-none"
                                                alt="Map Preview"
                                            />

                                            {/* Pin */}
                                            <div
                                                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none"
                                                style={getPinStyle()}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="size-8 rounded-full bg-primary border-2 border-white text-white flex items-center justify-center shadow-lg animate-bounce-short">
                                                        <span className="material-symbols-outlined text-sm font-bold">location_on</span>
                                                    </div>
                                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary mt-[-1px] filter drop-shadow-md"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-text-secondary">Enlem (Lat)</label>
                                                <input readOnly className="w-full h-9 px-3 rounded border border-border bg-gray-100 text-xs font-mono" value={editingSalon.coordinates?.lat} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-text-secondary">Boylam (Lng)</label>
                                                <input readOnly className="w-full h-9 px-3 rounded border border-border bg-gray-100 text-xs font-mono" value={editingSalon.coordinates?.lng} />
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-4 border-t border-gray-100">
                                            <label className="block text-sm font-bold text-text-main">Salon Tipi (Kategoriler)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {salonTypes.map(type => (
                                                    <label key={type.id} className={`cursor-pointer border px-3 py-1.5 rounded-lg text-xs font-medium transition-colors select-none ${editingSalon.typeIds?.includes(type.slug) ? 'bg-primary text-white border-primary' : 'bg-white border-border text-text-secondary hover:border-primary'}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={editingSalon.typeIds?.includes(type.slug)}
                                                            onChange={(e) => {
                                                                // Sync tags as well for search fallback
                                                                const typeIds = editingSalon.typeIds || [];
                                                                const tags = editingSalon.tags || [];

                                                                if ((e.target as HTMLInputElement).checked) {
                                                                    setEditingSalon({
                                                                        ...editingSalon,
                                                                        typeIds: [...typeIds, type.slug],
                                                                        tags: [...tags, type.name]
                                                                    });
                                                                } else {
                                                                    setEditingSalon({
                                                                        ...editingSalon,
                                                                        typeIds: typeIds.filter(slug => slug !== type.slug),
                                                                        tags: tags.filter(t => t !== type.name)
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        {type.name}
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2 mt-4">
                                                <input
                                                    type="checkbox"
                                                    id="isSponsored"
                                                    className="size-4 rounded text-primary focus:ring-primary border-gray-300"
                                                    checked={editingSalon.isSponsored}
                                                    onChange={e => setEditingSalon({ ...editingSalon, isSponsored: (e.target as HTMLInputElement).checked })}
                                                />
                                                <label htmlFor="isSponsored" className="text-xs font-bold text-text-main">Sponsorlu (Öne Çıkar)</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-gray-50 font-bold transition-colors">İptal</button>
                                    <button type="submit" className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-colors">Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};
