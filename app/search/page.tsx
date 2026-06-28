'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Layout } from '@/components/Layout';
import { SalonDataService, MasterDataService } from '@/services/db';
import { SalonDetail, SalonType, City, District } from '@/types';
import { useGeolocation, haversineKm } from '@/lib/geocoding/useGeolocation';
import { isSalonOpenNow } from '@/lib/availability';
import { 
    Search, 
    MapPin, 
    Filter, 
    Map as MapIcon, 
    LayoutGrid, 
    ChevronDown, 
    Star, 
    Clock, 
    X,
    AlertCircle,
    SlidersHorizontal,
    Store
} from 'lucide-react';

// Dynamic Map
const SalonMap = dynamic(() => import('@/components/Map/SalonMap').then((mod) => mod.SalonMap), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />
});

const normalize = (text: string | undefined | null) => {
    if (!text) return '';
    return text.toLocaleLowerCase('tr').trim();
};

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Search Params
    const qParam = searchParams.get('q') || '';
    const cityParam = searchParams.get('city') || '';
    const districtParam = searchParams.get('district') || '';
    const typeParam = searchParams.get('type') || '';
    
    // State
    const [salons, setSalons] = useState<SalonDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);
    
    // Filters State
    const [localSearch, setLocalSearch] = useState(qParam);
    const [selectedCity, setSelectedCity] = useState(cityParam || 'Tümü');
    const [selectedDistrict, setSelectedDistrict] = useState(districtParam || 'Tümü');
    const [minRating, setMinRating] = useState(0);
    const [onlyOpen, setOnlyOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Sprint F (K4) — fiyat & hizmet tipi filtreleri
    const [maxPrice, setMaxPrice] = useState<number | null>(null);
    const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>(typeParam ? [typeParam] : []);

    // Sprint B — sort + sayfalama
    type SortKey = 'sponsored' | 'rating_desc' | 'rating_asc' | 'newest' | 'price_asc' | 'price_desc' | 'distance_asc';
    const [sortKey, setSortKey] = useState<SortKey>('sponsored');
    const PAGE_SIZE = 20;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // Sprint C (K2) — Konum bazlı arama
    // Default 3 km (sıkı "yakındaki"); sonuç yoksa kullanıcı genişletir
    const geo = useGeolocation();
    const [radiusKm, setRadiusKm] = useState<3 | 5 | 10 | 25 | 50>(3);
    const [nearbyMode, setNearbyMode] = useState(false);

    // URL ?nearby=1 ile gelinince otomatik geo.request() tetikle
    const nearbyParam = searchParams.get('nearby');
    React.useEffect(() => {
        if (nearbyParam === '1' && geo.status === 'idle') {
            geo.request();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nearbyParam]);

    const handleNearbyToggle = () => {
        if (nearbyMode) {
            setNearbyMode(false);
            geo.reset();
            if (sortKey === 'distance_asc') setSortKey('sponsored');
            return;
        }
        geo.request();
    };

    React.useEffect(() => {
        if (geo.status === 'ok') {
            setNearbyMode(true);
            setSortKey('distance_asc');
        }
    }, [geo.status]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedCity && selectedCity !== 'Tümü') {
            const city = cities.find(c => c.name === selectedCity);
            if (city) fetchDistricts(city.id);
        } else {
            setDistricts([]);
            setSelectedDistrict('Tümü');
        }
    }, [selectedCity, cities]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [salonsData, typesData, citiesData] = await Promise.all([
                SalonDataService.getAllSalons(),
                MasterDataService.getSalonTypes(),
                MasterDataService.getCities()
            ]);
            setSalons(salonsData);
            setSalonTypes(typesData);
            setCities(citiesData);
        } catch (error) {
            console.error("Search fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDistricts = async (cityId: string) => {
        try {
            const data = await MasterDataService.getDistrictsByCity(cityId);
            setDistricts(data);
        } catch (err) {
            console.error("Districts error:", err);
        }
    };

    // Filtering Logic
    const filteredSalons = salons.filter(salon => {
        const matchesSearch = !localSearch ||
            normalize(salon.name).includes(normalize(localSearch)) ||
            normalize(salon.description).includes(normalize(localSearch));

        const matchesCity = selectedCity === 'Tümü' || normalize(salon.city_name) === normalize(selectedCity);
        const matchesDistrict = selectedDistrict === 'Tümü' || normalize(salon.district_name) === normalize(selectedDistrict);
        const typeIds = selectedTypeIds.length > 0 ? selectedTypeIds : (typeParam ? [typeParam] : []);
        const matchesType = typeIds.length === 0 ||
            typeIds.includes(salon.type_id || '') ||
            salon.assigned_types?.some((t: any) => typeIds.includes(t.id));
        const matchesRating = (salon.rating || 0) >= minRating;
        const matchesOpen = !onlyOpen || isSalonOpenNow(salon as any);

        const salonMinPrice = Number((salon as any).min_price ?? 0);
        const matchesPrice = maxPrice === null || salonMinPrice === 0 || salonMinPrice <= maxPrice;

        let matchesRadius = true;
        if (nearbyMode && geo.lat !== null && geo.lng !== null) {
            const sLat = Number(salon.geo_latitude || 0);
            const sLng = Number(salon.geo_longitude || 0);
            if (sLat === 0 || sLng === 0) {
                matchesRadius = false;
            } else {
                const dist = haversineKm(geo.lat, geo.lng, sLat, sLng);
                (salon as any)._distanceKm = dist;
                matchesRadius = dist <= radiusKm;
            }
        }

        return matchesSearch && matchesCity && matchesDistrict && matchesType && matchesRating && matchesRadius && matchesOpen && matchesPrice;
    });

    // Sprint B (K7) — sıralama
    const sortedSalons = React.useMemo(() => {
        const arr = [...filteredSalons];
        switch (sortKey) {
            case 'rating_desc': return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'rating_asc': return arr.sort((a, b) => (a.rating || 0) - (b.rating || 0));
            case 'newest': return arr.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
            case 'price_asc': return arr.sort((a, b) => Number((a as any).min_price ?? 9999) - Number((b as any).min_price ?? 9999));
            case 'price_desc': return arr.sort((a, b) => Number((b as any).min_price ?? 0) - Number((a as any).min_price ?? 0));
            case 'distance_asc': return arr.sort((a, b) => Number((a as any)._distanceKm ?? 9999) - Number((b as any)._distanceKm ?? 9999));
            default: return arr.sort((a, b) => {
                const sa = a.is_sponsored ? 1 : 0;
                const sb = b.is_sponsored ? 1 : 0;
                if (sa !== sb) return sb - sa;
                return (b.rating || 0) - (a.rating || 0);
            });
        }
    }, [filteredSalons, sortKey]);

    // Sprint B (K1) — frontend sayfalama: filtre/sort değişince visibleCount sıfırla
    React.useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [sortKey, localSearch, selectedCity, selectedDistrict, minRating, typeParam, selectedTypeIds, maxPrice, onlyOpen]);

    const visibleSalons = sortedSalons.slice(0, visibleCount);
    const hasMore = visibleCount < sortedSalons.length;

    const executeSearch = () => {
        const params = new URLSearchParams();
        if (localSearch) params.set('q', localSearch);
        if (selectedCity && selectedCity !== 'Tümü') params.set('city', selectedCity);
        if (selectedDistrict && selectedDistrict !== 'Tümü') params.set('district', selectedDistrict);
        if (typeParam) params.set('type', typeParam);
        
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            {/* Search Header */}
            <div className="bg-white border-b border-border sticky top-0 z-30 pt-20 pb-4 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative flex-grow w-full lg:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                            <input 
                                type="text"
                                placeholder="Salon veya hizmet ara..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-border rounded-2xl font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                            />
                        </div>
                        
                        <div className="flex w-full lg:w-auto gap-2">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl border font-black text-sm transition-all ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white text-text-main border-border hover:bg-gray-50'}`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                {showFilters ? 'Filtreleri Kapat' : 'Filtrele'}
                            </button>
                            
                            <button 
                                onClick={executeSearch}
                                className="flex-grow lg:flex-grow-0 px-8 py-3.5 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Ara
                            </button>
                        </div>
                    </div>

                    {/* Quick Filters / Expandable */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
                            {/* City */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Şehir</label>
                                <select 
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl font-bold text-sm"
                                >
                                    <option value="Tümü">Tüm Şehirler</option>
                                    {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            
                            {/* District */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">İlçe</label>
                                <select 
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    disabled={selectedCity === 'Tümü'}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl font-bold text-sm disabled:opacity-50"
                                >
                                    <option value="Tümü">Tüm İlçeler</option>
                                    {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>

                            {/* Rating */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Minimum Puan</label>
                                <div className="flex gap-1">
                                    {[3, 4, 4.5].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                                            className={`px-3 py-2 rounded-xl text-xs font-black transition-all border ${minRating === rating ? 'bg-yellow-400 text-white border-yellow-500' : 'bg-white text-text-muted border-border'}`}
                                        >
                                            {rating}+ ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Müsaitlik</label>
                                <label className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-border rounded-xl cursor-pointer hover:bg-white transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={onlyOpen}
                                        onChange={(e) => setOnlyOpen(e.target.checked)}
                                        className="size-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs font-bold text-text-main">Şu an açık olanlar</span>
                                </label>
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">
                                    Maksimum Fiyat {maxPrice !== null ? `(${maxPrice} ₺)` : '(filtre yok)'}
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={2000}
                                    step={50}
                                    value={maxPrice ?? 2000}
                                    onChange={(e) => {
                                        const v = Number(e.target.value);
                                        setMaxPrice(v >= 2000 ? null : v);
                                    }}
                                    className="w-full accent-primary"
                                />
                                <div className="flex justify-between text-[10px] text-text-muted font-bold">
                                    <span>0 ₺</span>
                                    <span>1000 ₺</span>
                                    <span>2000+ ₺</span>
                                </div>
                            </div>

                            {salonTypes.length > 0 && (
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">
                                        Hizmet Tipi {selectedTypeIds.length > 0 ? `(${selectedTypeIds.length} seçili)` : ''}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {salonTypes.map((t) => {
                                            const active = selectedTypeIds.includes(t.id);
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedTypeIds((prev) =>
                                                            prev.includes(t.id)
                                                                ? prev.filter((x) => x !== t.id)
                                                                : [...prev, t.id]
                                                        );
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                                                        active
                                                            ? 'bg-primary text-white border-primary'
                                                            : 'bg-white text-text-main border-border hover:border-primary'
                                                    }`}
                                                >
                                                    {t.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* View Switch */}
                            <div className="space-y-1.5 flex flex-col justify-end">
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button 
                                        onClick={() => setViewMode('list')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-text-muted'}`}
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" /> Liste
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('map')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-primary' : 'text-text-muted'}`}
                                    >
                                        <MapIcon className="w-3.5 h-3.5" /> Harita
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <main className="flex-grow">
                <div className={`max-w-7xl mx-auto px-4 lg:px-8 py-8 ${viewMode === 'map' ? 'h-[calc(100vh-200px)] lg:flex gap-8' : ''}`}>
                    
                    {/* List Section */}
                    {viewMode === 'list' ? (
                        <div className="space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <h2 className="text-xl font-black text-text-main">
                                    {sortedSalons.length} Salon Bulundu
                                </h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={handleNearbyToggle}
                                        disabled={geo.status === 'pending'}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                            nearbyMode
                                                ? 'bg-primary text-white border border-primary'
                                                : 'bg-white text-text-main border border-border hover:bg-gray-50'
                                        }`}
                                    >
                                        <MapPin className="w-3.5 h-3.5" />
                                        {geo.status === 'pending' ? 'Konum...' : nearbyMode ? 'Yakındaki ✓' : 'Yakındakini Bul'}
                                    </button>

                                    {nearbyMode && (
                                        <select
                                            value={radiusKm}
                                            onChange={(e) => setRadiusKm(Number(e.target.value) as 3 | 5 | 10 | 25 | 50)}
                                            className="px-3 py-2 bg-white border border-border rounded-xl text-sm font-bold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                                        >
                                            <option value={3}>3 km (yürüme)</option>
                                            <option value={5}>5 km</option>
                                            <option value={10}>10 km</option>
                                            <option value={25}>25 km</option>
                                            <option value={50}>50 km</option>
                                        </select>
                                    )}

                                    <label htmlFor="sort-select" className="text-xs font-bold text-text-muted uppercase tracking-wider ml-2">Sırala:</label>
                                    <select
                                        id="sort-select"
                                        value={sortKey}
                                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                                        className="px-3 py-2 bg-white border border-border rounded-xl text-sm font-bold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                                    >
                                        <option value="sponsored">Önerilen</option>
                                        {nearbyMode && <option value="distance_asc">En Yakın</option>}
                                        <option value="rating_desc">Puanı Yüksek</option>
                                        <option value="rating_asc">Puanı Düşük</option>
                                        <option value="price_asc">Fiyat Artan</option>
                                        <option value="price_desc">Fiyat Azalan</option>
                                        <option value="newest">En Yeni</option>
                                    </select>
                                </div>
                                {geo.status === 'denied' && (
                                    <p className="text-xs text-red-600 mt-1 w-full">Konum izni reddedildi. Tarayıcı ayarlarından izin verebilirsin.</p>
                                )}
                                {geo.status === 'error' && geo.error && (
                                    <p className="text-xs text-amber-600 mt-1 w-full">{geo.error}</p>
                                )}
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="bg-white h-72 rounded-3xl border border-border animate-pulse" />
                                    ))}
                                </div>
                            ) : visibleSalons.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {visibleSalons.map(salon => (
                                        <div key={salon.id} className="bg-white rounded-[32px] border border-border overflow-hidden shadow-card hover:shadow-xl transition-all group">
                                            <div className="h-48 relative overflow-hidden">
                                                <img
                                                    src={salon.image || '/bg-abstract.jpg'}
                                                    alt={salon.name}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-xl flex items-center gap-1 shadow-md">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-xs font-black">{salon.rating || 0}</span>
                                                </div>
                                                {nearbyMode && (salon as any)._distanceKm !== undefined && (
                                                    <div className="absolute top-4 left-4 bg-primary text-white px-2 py-1 rounded-xl flex items-center gap-1 shadow-md text-[10px] font-black">
                                                        <MapPin className="w-3 h-3" />
                                                        {Number((salon as any)._distanceKm).toFixed(1)} km
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-2">
                                                    <Store className="w-3 h-3" />
                                                    {salon.type_name || 'Güzellik Merkezi'}
                                                </div>
                                                <h3 className="text-lg font-black text-text-main mb-1 truncate">{salon.name}</h3>
                                                <div className="flex items-center gap-1.5 text-text-muted text-xs font-medium mb-4">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {salon.district_name}, {salon.city_name}
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-green-500" />
                                                        <span className="text-[10px] font-black text-green-600 uppercase tracking-wider">Açık</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => router.push(`/salon/${salon.id}`)}
                                                        className="px-4 py-2 bg-gray-50 text-text-main font-black text-[10px] uppercase rounded-xl hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        İncele
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-10 h-10 text-text-muted" />
                                    </div>
                                    <h3 className="text-xl font-black text-text-main">Sonuç Bulunamadı</h3>
                                    {nearbyMode ? (
                                        <>
                                            <p className="text-text-muted max-w-sm">
                                                {radiusKm} km içinde uygun salon yok. Aramayı genişletmek ister misin?
                                            </p>
                                            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                                {radiusKm < 5 && (
                                                    <button
                                                        onClick={() => setRadiusKm(5)}
                                                        className="px-4 py-2 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary-hover transition"
                                                    >
                                                        5 km'e Genişlet
                                                    </button>
                                                )}
                                                {radiusKm < 10 && (
                                                    <button
                                                        onClick={() => setRadiusKm(10)}
                                                        className="px-4 py-2 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary-hover transition"
                                                    >
                                                        10 km'e Genişlet
                                                    </button>
                                                )}
                                                {radiusKm < 25 && (
                                                    <button
                                                        onClick={() => setRadiusKm(25)}
                                                        className="px-4 py-2 bg-white border-2 border-primary text-primary font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary/5 transition"
                                                    >
                                                        25 km'e Genişlet
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setNearbyMode(false); geo.reset(); }}
                                                    className="text-text-muted font-bold text-xs hover:underline ml-2"
                                                >
                                                    Tüm salonları göster
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-text-muted max-w-sm">
                                                Aradığınız kriterlere uygun salon bulunamadı. Lütfen filtreleri değiştirmeyi deneyin.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setSelectedCity('Tümü');
                                                    setLocalSearch('');
                                                    setMinRating(0);
                                                    setSelectedTypeIds([]);
                                                    setMaxPrice(null);
                                                }}
                                                className="text-primary font-black text-sm hover:underline"
                                            >
                                                Tüm Filtreleri Temizle
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Sprint B (K1) — Daha Fazla Yükle */}
                            {!loading && hasMore && (
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                                        className="px-8 py-3 bg-white border-2 border-primary text-primary font-black text-sm rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                        Daha Fazla Yükle ({sortedSalons.length - visibleCount} kaldı)
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Map + Sidebar View */
                        <div className="flex-grow lg:flex h-full gap-8 relative">
                            {/* Mobile Sidebar Toggle would go here */}
                            <div className="w-full lg:w-[400px] h-full overflow-y-auto pr-4 hidden lg:block no-scrollbar">
                                <div className="space-y-4 mb-6">
                                    <h2 className="text-lg font-black text-text-main">{sortedSalons.length} Salon</h2>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                                        <p className="text-xs text-blue-700 font-medium">Haritadaki konumlara göre salonları inceleyebilirsiniz.</p>
                                    </div>
                                </div>
                                <div className="space-y-4 pb-10">
                                    {sortedSalons.map(salon => (
                                        <div 
                                            key={salon.id}
                                            className="p-4 bg-white border border-border rounded-2xl hover:border-primary transition-all cursor-pointer group shadow-sm"
                                            onClick={() => router.push(`/salon/${salon.id}`)}
                                        >
                                            <div className="flex gap-4">
                                                <img src={salon.image || '/bg-abstract.jpg'} alt={salon.name} loading="lazy" decoding="async" className="w-20 h-20 rounded-xl object-cover" />
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-black text-text-main truncate">{salon.name}</h4>
                                                    <div className="flex items-center gap-1 text-[10px] text-yellow-600 font-bold my-1">
                                                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> {salon.rating || 0}
                                                    </div>
                                                    <div className="text-[10px] text-text-muted font-medium truncate">
                                                        {salon.district_name}, {salon.city_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex-grow h-full bg-white rounded-[40px] border border-border overflow-hidden shadow-2xl relative z-10">
                                <SalonMap 
                                    salons={sortedSalons}
                                    center={sortedSalons.length > 0 ? { lat: sortedSalons[0].geo_latitude, lng: sortedSalons[0].geo_longitude } : undefined as any}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}

export default function AdvancedSearchPage() {
    return (
        <Layout>
            <Suspense fallback={<div className="p-20 text-center">Yükleniyor...</div>}>
                <SearchContent />
            </Suspense>
        </Layout>
    );
}
