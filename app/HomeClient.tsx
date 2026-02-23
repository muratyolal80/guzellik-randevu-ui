'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Layout } from '@/components/Layout';
import { GeminiChat } from '@/components/GeminiChat';
import { SalonDataService, MasterDataService, ServiceService, FavoriteService } from '@/services/db';
import { SalonDetail, SalonType, GlobalService, City, District } from '@/types';
import { useAuth } from '@/context/AuthContext';

// Dynamically import Map component with no SSR
const SalonMap = dynamic(() => import('@/components/Map/SalonMap').then((mod) => mod.SalonMap), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />
});

import { Star, Clock, Filter, SlidersHorizontal, MapPin } from 'lucide-react';

// Fallback Cache for Coordinates
const CITY_COORDINATES_CACHE: Record<string, { lat: number; lng: number }> = {};

type SearchTab = 'service' | 'type' | 'salon';

const normalize = (text: string | undefined | null) => {
    if (!text) return '';
    return text.toLocaleLowerCase('tr').trim();
};

const isValidLatLng = (lat: any, lng: any): boolean => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
    const numLat = Number(lat);
    const numLng = Number(lng);
    if (isNaN(numLat) || isNaN(numLng) || !isFinite(numLat) || !isFinite(numLng)) return false;
    if (numLat === 0 && numLng === 0) return false;
    if (numLat < 35 || numLat > 43 || numLng < 25 || numLng > 46) return false;
    return true;
};

export default function HomeClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [salons, setSalons] = useState<SalonDetail[]>([]);
    const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);
    const [globalServices, setGlobalServices] = useState<GlobalService[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [showUnauthorizedError, setShowUnauthorizedError] = useState(false);

    const typeParam = searchParams.get('type');
    const searchParam = searchParams.get('search');
    const cityParam = searchParams.get('city');
    const modeParam = searchParams.get('mode');
    const isSearchMode = !!(typeParam || searchParam || cityParam);

    useEffect(() => {
        if (!authLoading && isAuthenticated && user) {
            if (!isSearchMode) {
                const role = user.role?.toUpperCase();
                if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
                    router.push('/admin');
                } else if (role === 'SALON_OWNER' || role === 'OWNER') {
                    router.push('/owner/dashboard');
                } else if (role === 'STAFF') {
                    router.push('/staff/dashboard');
                }
            }
        }
    }, [authLoading, isAuthenticated, user, router, isSearchMode]);

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'unauthorized') {
            setShowUnauthorizedError(true);
            setTimeout(() => setShowUnauthorizedError(false), 5000);
            router.replace('/');
        }
    }, [searchParams, router]);

    const [districts, setDistricts] = useState<District[]>([]);
    const [userFavorites, setUserFavorites] = useState<string[]>([]);
    const [salonServicesMap, setSalonServicesMap] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [hoveredSalonId, setHoveredSalonId] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(5);
    const [localSearch, setLocalSearch] = useState(searchParam || '');
    const [selectedCity, setSelectedCity] = useState(cityParam || 'Tümü');
    const [selectedDistrict, setSelectedDistrict] = useState('Tümü');
    const [minRating, setMinRating] = useState(0);
    const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);
    const [activeTab, setActiveTab] = useState<SearchTab>('service');
    const [suggestions, setSuggestions] = useState<{ type: 'salon' | 'service' | 'category', text: string, id?: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    const handleToggleFavorite = async (e: React.MouseEvent, salonId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            alert("Favorilere eklemek için giriş yapmalısınız.");
            return;
        }

        try {
            const isNowFavorite = await FavoriteService.toggleFavorite(user.id, salonId);
            if (isNowFavorite) {
                setUserFavorites(prev => [...prev, salonId]);
            } else {
                setUserFavorites(prev => prev.filter(id => id !== salonId));
            }
        } catch (error) {
            console.error("Favori işlemi sırasında hata:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [salonsData, typesData, servicesData, citiesData] = await Promise.all([
                    SalonDataService.getSalons(),
                    MasterDataService.getSalonTypes(),
                    MasterDataService.getAllGlobalServices(),
                    MasterDataService.getCities()
                ]);

                const mappedData = (salonsData || []).map((salon: any) => ({
                    ...salon,
                    city: salon.city_name || salon.cities?.name || salon.city?.name || 'Belirtilmemiş',
                    district: salon.district_name || salon.districts?.name || salon.district?.name || '',
                    rating: salon.average_rating || 0,
                    tags: salon.assigned_types && salon.assigned_types.length > 0
                        ? salon.assigned_types.map((t: any) => t.name)
                        : (salon.type_name ? [salon.type_name] : []),
                    startPrice: salon.min_price || 100,
                    coordinates: {
                        lat: salon.geo_latitude || 0,
                        lng: salon.geo_longitude || 0
                    }
                }));

                setSalons(mappedData);
                setSalonTypes(typesData || []);
                setGlobalServices(servicesData || []);
                setCities(citiesData || []);

                (citiesData || []).forEach(city => {
                    if (city.latitude && city.longitude) {
                        CITY_COORDINATES_CACHE[city.name] = { lat: city.latitude, lng: city.longitude };
                    }
                });

                if (user) {
                    const favs = await FavoriteService.getUserFavorites();
                    setUserFavorites(favs.map(f => f.salon_id));
                }

                // Fetch all salon services in a single batch query instead of N+1
                const servicesMap: Record<string, string[]> = {};
                try {
                    const allSalonServices = await ServiceService.getAllSalonServices();
                    allSalonServices.forEach((s: { salon_id: string; service_name: string }) => {
                        if (!servicesMap[s.salon_id]) servicesMap[s.salon_id] = [];
                        servicesMap[s.salon_id].push(s.service_name);
                    });
                } catch (error) {
                    console.error('Salon hizmetleri toplu olarak alınamadı:', error);
                }
                setSalonServicesMap(servicesMap);

            } catch (err: unknown) {
                console.error('Error fetching initial data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (searchParam !== null) setLocalSearch(searchParam);
        else if (typeParam) setLocalSearch('');
        if (cityParam !== null) setSelectedCity(cityParam);
    }, [searchParam, cityParam, typeParam]);

    useEffect(() => {
        const loadDistricts = async () => {
            if (selectedCity && selectedCity !== 'Tümü') {
                const selectedCityData = cities.find(c => c.name === selectedCity);
                if (selectedCityData) {
                    const districtsData = await MasterDataService.getDistrictsByCity(selectedCityData.id);
                    setDistricts(districtsData);
                }
            } else {
                setDistricts([]);
            }
        };
        loadDistricts();
    }, [selectedCity, cities]);

    const filteredSalons = salons.filter(salon => {
        if (selectedCity && selectedCity !== 'Tümü' && selectedCity !== 'all') {
            if (normalize(salon.city) !== normalize(selectedCity)) return false;
        }
        if (selectedDistrict && selectedDistrict !== 'Tümü' && selectedDistrict !== 'all') {
            if (normalize(salon.district) !== normalize(selectedDistrict)) return false;
        }
        if (typeParam && typeParam !== 'all') {
            const typeSlug = normalize(typeParam);
            const isMatch = normalize(salon.type_slug) === typeSlug || normalize(salon.type_name).includes(typeSlug);
            if (!isMatch) return false;
        }
        if (localSearch) {
            const term = normalize(localSearch);
            if (modeParam === 'salon') {
                if (!normalize(salon.name).includes(term)) return false;
            } else {
                const matchesName = normalize(salon.name).includes(term);
                const matchesType = normalize(salon.type_name).includes(term);
                const matchesAddress = normalize(salon.address).includes(term) ||
                    normalize(salon.neighborhood).includes(term) ||
                    normalize(salon.avenue).includes(term) ||
                    normalize(salon.street).includes(term);
                const matchesService = (salonServicesMap[salon.id] || []).some(s => normalize(s).includes(term));

                if (!matchesName && !matchesType && !matchesAddress && !matchesService) return false;
            }
        }

        if (minRating > 0 && (salon.rating || 0) < minRating) return false;

        if (onlyAvailableToday) {
            // Simplified check for now
            if (salon.is_closed) return false;
        }

        return true;
    });

    const visibleSalons = filteredSalons.slice(0, visibleCount);
    const defaultCenter = { lat: 41.0082, lng: 28.9784 };
    const targetCityCoords = CITY_COORDINATES_CACHE[selectedCity];
    const firstSalon = filteredSalons.length > 0 ? filteredSalons[0] : null;
    const firstSalonCoords = firstSalon && isValidLatLng(firstSalon.geo_latitude, firstSalon.geo_longitude)
        ? { lat: Number(firstSalon.geo_latitude), lng: Number(firstSalon.geo_longitude) }
        : null;

    const safeMapCenter = firstSalonCoords || targetCityCoords || defaultCenter;

    const handleSearchChange = (val: string) => {
        setLocalSearch(val);
        if (val.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const term = normalize(val);
        const newSuggestions: typeof suggestions = [];
        if (activeTab === 'salon') {
            salons.forEach(s => { if (normalize(s.name).includes(term)) newSuggestions.push({ type: 'salon', text: s.name, id: s.id }); });
        } else if (activeTab === 'type') {
            salonTypes.forEach(t => { if (normalize(t.name).includes(term)) newSuggestions.push({ type: 'category', text: t.name, id: t.slug }); });
        } else if (activeTab === 'service') {
            const matchedServices = Array.from(new Set([
                ...globalServices.map(s => s.name).filter(s => normalize(s).includes(term)),
                ...Object.values(salonServicesMap).flat().filter(s => normalize(s).includes(term))
            ])).slice(0, 10);
            matchedServices.forEach(s => newSuggestions.push({ type: 'service', text: s }));
        }
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
    };

    const handleSuggestionSelect = (item: typeof suggestions[0]) => {
        setLocalSearch(item.text);
        setShowSuggestions(false);
        if (item.type === 'salon' && item.id) {
            router.push(`/salon/${item.id}`);
            return;
        }
        let query = item.type === 'category' ? `/?type=${item.id}` : `/?search=${encodeURIComponent(item.text)}&mode=service`;
        if (selectedCity !== 'Tümü') query += `&city=${selectedCity}`;
        router.push(query);
    };

    const executeSearch = () => {
        let query = `/?search=${encodeURIComponent(localSearch)}&mode=${activeTab}`;
        if (selectedCity && selectedCity !== 'Tümü') query += `&city=${selectedCity}`;
        router.push(query);
        setShowSuggestions(false);
    };

    const [viewMode, setViewMode] = useState<'split' | 'wide'>('split');

    return (
        <Layout>
            {showUnauthorizedError && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-fade-in">
                    <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
                        <p className="text-red-800 font-bold text-sm">Yetkisiz Erişim</p>
                    </div>
                </div>
            )}

            {isSearchMode ? (
                <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-background">
                    <div className={`${viewMode === 'wide' ? 'w-full' : 'w-full lg:w-[500px]'} flex flex-col border-r border-border bg-white z-20 shrink-0 h-full`}>
                        <div className="p-5 border-b border-border bg-white sticky top-0 z-10 shadow-sm">
                            <div className="relative mb-3" ref={searchWrapperRef}>
                                <input
                                    type="text"
                                    value={localSearch}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Salon, hizmet veya bölge ara..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-50">
                                        {suggestions.map((item, idx) => (
                                            <div key={idx} onClick={() => handleSuggestionSelect(item)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm">
                                                {item.text}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="bg-white border p-2 rounded text-xs">
                                    <option value="Tümü">Tüm Şehirler</option>
                                    {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="bg-white border p-2 rounded text-xs" disabled={selectedCity === 'Tümü'}>
                                    <option value="Tümü">Tüm İlçeler</option>
                                    {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                <div className="flex items-center gap-2">
                                    {[4, 3, 0].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                                            className={`px-3 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all border ${minRating === rating ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-500 border-gray-100 hover:border-amber-200'}`}
                                        >
                                            {rating === 0 ? 'Tüm Puanlar' : `${rating}+ Yıldız`}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setOnlyAvailableToday(!onlyAvailableToday)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all border ${onlyAvailableToday ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-100 hover:border-green-200'}`}
                                >
                                    <Clock className="w-3 h-3" /> Bugün Müsait
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
                            {loading ? <p>Yükleniyor...</p> : (
                                <div className={viewMode === 'wide' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-5'}>
                                    {visibleSalons.map(salon => (
                                        <Link href={`/salon/${salon.id}`} key={salon.id} className="group block bg-white border border-border p-4 rounded-3xl hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                            <div className="relative mb-4 overflow-hidden rounded-2xl aspect-[16/9]">
                                                <img src={salon.image || '/placeholder-salon.jpg'} alt={salon.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/50">
                                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                        <span className="text-[10px] font-black">{salon.rating || 0}</span>
                                                    </div>
                                                    {!salon.is_closed && (
                                                        <div className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-white">
                                                            <Clock className="w-3 h-3" />
                                                            <span className="text-[10px] font-black">Açık</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-text-main group-hover:text-primary transition-colors truncate">{salon.name}</h3>
                                                <div className="flex items-center gap-1 text-text-muted">
                                                    <MapPin className="w-3 h-3" />
                                                    <p className="text-[10px] font-bold">{salon.district}, {salon.city}</p>
                                                </div>
                                                <div className="pt-2 flex items-center justify-between">
                                                    <span className="text-[10px] text-text-muted font-bold">Başlayan fiyatlar</span>
                                                    <span className="text-sm font-black text-primary">₺{salon.startPrice || '---'}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {viewMode === 'split' && (
                        <div className="flex-1 relative">
                            <SalonMap center={safeMapCenter} salons={filteredSalons} hoveredSalonId={hoveredSalonId} onSalonHover={setHoveredSalonId} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative bg-gray-900 min-h-[600px] flex items-center justify-center">
                    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
                        <h1 className="text-5xl font-black text-white mb-6">Güzelliğin Yeni Adresi</h1>
                        <div className="bg-white rounded-xl p-2 shadow-2xl">
                            <div className="flex border-b mb-2">
                                {(['service', 'type', 'salon'] as SearchTab[]).map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-bold ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
                                        {tab === 'service' ? 'Hizmet' : tab === 'type' ? 'Salon Türü' : 'Salon Adı'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={localSearch} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Ara..." className="flex-1 border p-3 rounded" />
                                <button onClick={executeSearch} className="bg-primary text-white px-8 rounded font-bold">Ara</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <GeminiChat />
        </Layout>
    );
}
