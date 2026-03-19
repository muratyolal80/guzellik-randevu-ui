'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Layout } from '@/components/Layout';
import { SalonDataService, MasterDataService } from '@/services/db';
import { SalonDetail, SalonType, City, District } from '@/types';
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
                SalonDataService.getSalons(),
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
        const matchesType = !typeParam || salon.type_id === typeParam || salon.assigned_types?.some(t => t.id === typeParam);
        const matchesRating = (salon.rating || 0) >= minRating;
        
        // Availability logic would go here (complex, needs SlotService)
        
        return matchesSearch && matchesCity && matchesDistrict && matchesType && matchesRating;
    });

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
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-text-main">
                                    {filteredSalons.length} Salon Bulundu
                                </h2>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="bg-white h-72 rounded-3xl border border-border animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredSalons.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSalons.map(salon => (
                                        <div key={salon.id} className="bg-white rounded-[32px] border border-border overflow-hidden shadow-card hover:shadow-xl transition-all group">
                                            <div className="h-48 relative overflow-hidden">
                                                <img 
                                                    src={salon.image || '/bg-abstract.jpg'} 
                                                    alt={salon.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-xl flex items-center gap-1 shadow-md">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-xs font-black">{salon.rating || 0}</span>
                                                </div>
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
                                    <p className="text-text-muted max-w-sm">
                                        Aradığınız kriterlere uygun salon bulunamadı. Lütfen filtreleri değiştirmeyi deneyin.
                                    </p>
                                    <button 
                                        onClick={() => {
                                            setSelectedCity('Tümü');
                                            setLocalSearch('');
                                            setMinRating(0);
                                        }}
                                        className="text-primary font-black text-sm hover:underline"
                                    >
                                        Tüm Filtreleri Temizle
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
                                    <h2 className="text-lg font-black text-text-main">{filteredSalons.length} Salon</h2>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                                        <p className="text-xs text-blue-700 font-medium">Haritadaki konumlara göre salonları inceleyebilirsiniz.</p>
                                    </div>
                                </div>
                                <div className="space-y-4 pb-10">
                                    {filteredSalons.map(salon => (
                                        <div 
                                            key={salon.id}
                                            className="p-4 bg-white border border-border rounded-2xl hover:border-primary transition-all cursor-pointer group shadow-sm"
                                            onClick={() => router.push(`/salon/${salon.id}`)}
                                        >
                                            <div className="flex gap-4">
                                                <img src={salon.image || '/bg-abstract.jpg'} className="w-20 h-20 rounded-xl object-cover" />
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
                                    salons={filteredSalons} 
                                    center={filteredSalons.length > 0 ? { lat: filteredSalons[0].geo_latitude, lng: filteredSalons[0].geo_longitude } : undefined as any}
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
