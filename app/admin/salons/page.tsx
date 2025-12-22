'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { MOCK_SALONS, MOCK_SALON_TYPES, CITIES, DISTRICTS, CITY_COORDINATES } from '@/constants';
import { Salon } from '@/types';

export default function SalonManager() {
    // In a real app, this state would be managed via server state (React Query/SWR)
    const [salons, setSalons] = useState<Salon[]>(MOCK_SALONS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSalon, setEditingSalon] = useState<Partial<Salon> | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    // State for Districts dependent on selected City
    const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

    useEffect(() => {
        if (editingSalon?.city) {
            setAvailableDistricts(DISTRICTS[editingSalon.city] || []);
        } else {
            setAvailableDistricts([]);
        }
    }, [editingSalon?.city]);

    const handleEdit = (salon: Salon) => {
        setEditingSalon(salon);
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
            createdAt: new Date().toISOString()
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Bu salonu silmek istediğinize emin misiniz?')) {
            setSalons(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock save logic
        if (editingSalon?.id) {
            setSalons(prev => prev.map(s => s.id === editingSalon.id ? editingSalon as Salon : s));
        } else {
            const newSalon = { ...editingSalon, id: Math.random().toString(36).substr(2, 9), rating: 0, reviewCount: 0 } as Salon;
            setSalons(prev => [newSalon, ...prev]);
        }
        setIsModalOpen(false);
        setEditingSalon(null);
    };

    // --- Geocoding & Map Logic ---

    // 1. Simulate "Get Coordinates from Address" (Geocoding)
    const handleGeocode = () => {
        if (!editingSalon?.city) {
            alert("Lütfen önce bir şehir seçiniz.");
            return;
        }
        const base = CITY_COORDINATES[editingSalon.city] || CITY_COORDINATES["İstanbul"];

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

        const center = CITY_COORDINATES[editingSalon.city] || CITY_COORDINATES["İstanbul"];

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
        const center = CITY_COORDINATES[editingSalon.city] || CITY_COORDINATES["İstanbul"];
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
                        {salons.map(salon => (
                            <tr key={salon.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-cover bg-center border border-border" style={{backgroundImage: `url('${salon.image}')`}}></div>
                                        <div>
                                            <p className="font-bold text-text-main">{salon.name}</p>
                                            {salon.isSponsored && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-bold">ÖNERİLEN</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-text-secondary">
                                    <div className="flex flex-col">
                                        <span>{salon.district}, {salon.city}</span>
                                        <span className="text-xs text-text-muted truncate max-w-[150px]">{salon.location}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {salon.typeIds && salon.typeIds.length > 0 ? (
                                            salon.typeIds.map(tid => {
                                                const t = MOCK_SALON_TYPES.find(type => type.id === tid);
                                                return t ? (
                                                    <span key={tid} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">{t.name}</span>
                                                ) : null;
                                            })
                                        ) : (
                                            // Fallback for legacy data
                                            salon.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] bg-gray-100 text-text-secondary px-2 py-1 rounded-full">{tag}</span>
                                            ))
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-bold text-text-main">{salon.startPrice} ₺</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(salon)} className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                        <button onClick={() => handleDelete(salon.id)} className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
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
                                            <input required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" value={editingSalon.name} onChange={e => setEditingSalon({...editingSalon, name: (e.target as HTMLInputElement).value})} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-text-main mb-2">Şehir</label>
                                                <select
                                                    className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                    value={editingSalon.city}
                                                    onChange={e => {
                                                        const city = (e.target as HTMLSelectElement).value;
                                                        setEditingSalon({...editingSalon, city: city, district: ''});
                                                    }}
                                                >
                                                    <option value="">Seçiniz</option>
                                                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-text-main mb-2">İlçe</label>
                                                <select
                                                    disabled={!editingSalon.city}
                                                    className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                                                    value={editingSalon.district}
                                                    onChange={e => setEditingSalon({...editingSalon, district: (e.target as HTMLSelectElement).value})}
                                                >
                                                    <option value="">Seçiniz</option>
                                                    {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-text-main mb-2">Açık Adres</label>
                                            <div className="flex gap-2">
                                                <textarea required rows={3} className="flex-1 p-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" value={editingSalon.location} onChange={e => setEditingSalon({...editingSalon, location: (e.target as HTMLTextAreaElement).value})}></textarea>
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
                                            <input type="number" required className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" value={editingSalon.startPrice} onChange={e => setEditingSalon({...editingSalon, startPrice: Number((e.target as HTMLInputElement).value)})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-text-main mb-2">Görsel URL</label>
                                            <input className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" value={editingSalon.image} onChange={e => setEditingSalon({...editingSalon, image: (e.target as HTMLInputElement).value})} />
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
                                                {MOCK_SALON_TYPES.map(type => (
                                                    <label key={type.id} className={`cursor-pointer border px-3 py-1.5 rounded-lg text-xs font-medium transition-colors select-none ${editingSalon.typeIds?.includes(type.id) ? 'bg-primary text-white border-primary' : 'bg-white border-border text-text-secondary hover:border-primary'}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={editingSalon.typeIds?.includes(type.id)}
                                                            onChange={(e) => {
                                                                // Sync tags as well for search fallback
                                                                const typeIds = editingSalon.typeIds || [];
                                                                const tags = editingSalon.tags || [];

                                                                if ((e.target as HTMLInputElement).checked) {
                                                                    setEditingSalon({
                                                                        ...editingSalon,
                                                                        typeIds: [...typeIds, type.id],
                                                                        tags: [...tags, type.name]
                                                                    });
                                                                } else {
                                                                    setEditingSalon({
                                                                        ...editingSalon,
                                                                        typeIds: typeIds.filter(id => id !== type.id),
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
                                                    onChange={e => setEditingSalon({...editingSalon, isSponsored: (e.target as HTMLInputElement).checked})}
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
