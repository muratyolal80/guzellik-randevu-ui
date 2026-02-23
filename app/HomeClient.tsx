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

import {
    Star,
    Clock,
    Filter,
    SlidersHorizontal,
    MapPin,
    Scissors,
    Sparkles,
    Smile,
    Flower2,
    Waves,
    Zap,
    Sun,
    Activity,
    Search,
    Map as MapIcon,
    LayoutGrid,
    ChevronRight,
    ChevronDown,
    Heart,
    ArrowRight,
    ArrowRightLeft,
    Store,
    Info,
    X
} from 'lucide-react';

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

// --- Service Icon Helper ---
const getServiceIcon = (serviceName: string) => {
    const lower = serviceName.toLowerCase();
    if (lower.includes('sağ') || lower.includes('fön') || lower.includes('kesim') || lower.includes('röfle') || lower.includes('ombre')) return <Scissors className="w-4 h-4" />;
    if (lower.includes('tırnak') || lower.includes('oje') || lower.includes('manikür') || lower.includes('pedikür') || lower.includes('jel')) return <Sparkles className="w-4 h-4" />;
    if (lower.includes('makyaj') || lower.includes('kirpik') || lower.includes('kaş') || lower.includes('lifting')) return <Smile className="w-4 h-4" />;
    if (lower.includes('masaj') || lower.includes('spa')) return <Flower2 className="w-4 h-4" />;
    if (lower.includes('cilt') || lower.includes('bakım') || lower.includes('peeling')) return <Waves className="w-4 h-4" />;
    if (lower.includes('lazer') || lower.includes('epilasyon') || lower.includes('ağda')) return <Zap className="w-4 h-4" />;
    if (lower.includes('sakal') || lower.includes('tıraş')) return <Smile className="w-4 h-4" />;
    if (lower.includes('solaryum')) return <Sun className="w-4 h-4" />;
    if (lower.includes('diyet') || lower.includes('zayıflama')) return <Activity className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
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
        // 1. City Filter
        if (selectedCity && selectedCity !== 'Tümü' && selectedCity !== 'all') {
            if (normalize(salon.city) !== normalize(selectedCity)) return false;
        }

        // 2. District Filter
        if (selectedDistrict && selectedDistrict !== 'Tümü' && selectedDistrict !== 'all') {
            if (normalize(salon.district) !== normalize(selectedDistrict)) return false;
        }

        // 3. Type/Category Filter (from URL)
        if (typeParam && typeParam !== 'all') {
            const typeSlug = normalize(typeParam);
            const isMatch = normalize(salon.type_slug) === typeSlug || normalize(salon.type_name).includes(typeSlug);
            if (!isMatch) return false;
        }

        // 4. Search Term Filter
        if (localSearch) {
            const term = normalize(localSearch);
            if (modeParam === 'salon') {
                if (!normalize(salon.name).includes(term)) return false;
            } else if (modeParam === 'type' || modeParam === 'service' || activeTab === 'service' || activeTab === 'type') {
                const matchesName = normalize(salon.name).includes(term);
                const matchesType = normalize(salon.type_name).includes(term);
                const matchesAddress = normalize(salon.address).includes(term) ||
                    normalize(salon.neighborhood).includes(term) ||
                    normalize(salon.avenue).includes(term) ||
                    normalize(salon.street).includes(term);
                const matchesService = (salonServicesMap[salon.id] || []).some(s => normalize(s).includes(term));

                if (!matchesName && !matchesType && !matchesAddress && !matchesService) return false;
            } else {
                const matchesName = normalize(salon.name).includes(term);
                const matchesType = normalize(salon.type_name).includes(term);
                const matchesAddress = normalize(salon.address).includes(term);
                const matchesService = (salonServicesMap[salon.id] || []).some(s => normalize(s).includes(term));

                if (!matchesName && !matchesType && !matchesAddress && !matchesService) return false;
            }
        }

        if (minRating > 0 && (salon.rating || 0) < minRating) return false;

        if (onlyAvailableToday) {
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
        if (selectedCity && selectedCity !== 'Tümü') query += `&city=${selectedCity}`;
        router.push(query);
    };

    const executeSearch = () => {
        let query = `/?search=${encodeURIComponent(localSearch)}&mode=${activeTab}`;
        if (selectedCity && selectedCity !== 'Tümü') query += `&city=${selectedCity}`;
        router.push(query);
        setShowSuggestions(false);
    };

    const [viewMode, setViewMode] = useState<'split' | 'wide'>('split');

    // Popular Services List - Use real data from database
    const popularServices = Array.from(new Set(globalServices.map(s => s.name))).sort().slice(0, 30);

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
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                <input
                                    type="text"
                                    value={localSearch}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Salon, hizmet veya bölge ara..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                                        {suggestions.map((item, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleSuggestionSelect(item)}
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-0 flex items-center gap-3"
                                            >
                                                {item.type === 'salon' ? <Store className="w-4 h-4 text-primary" /> : <Sparkles className="w-4 h-4 text-primary" />}
                                                <span>{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                    <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                    <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full bg-white border border-gray-200 p-2 pl-7 rounded-lg text-xs appearance-none cursor-pointer">
                                        <option value="Tümü">Tüm Şehirler</option>
                                        {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative">
                                    <MapIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                    <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full bg-white border border-gray-200 p-2 pl-7 rounded-lg text-xs appearance-none cursor-pointer disabled:bg-gray-50" disabled={selectedCity === 'Tümü'}>
                                        <option value="Tümü">Tüm İlçeler</option>
                                        {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
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
                                <div className="flex items-center gap-2">
                                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                                        <button onClick={() => setViewMode('split')} className={`p-1 rounded ${viewMode === 'split' ? 'bg-white shadow text-primary' : 'text-gray-400'}`}>
                                            <MapIcon className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => setViewMode('wide')} className={`p-1 rounded ${viewMode === 'wide' ? 'bg-white shadow text-primary' : 'text-gray-400'}`}>
                                            <LayoutGrid className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setOnlyAvailableToday(!onlyAvailableToday)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all border ${onlyAvailableToday ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-100 hover:border-green-200'}`}
                                    >
                                        <Clock className="w-3 h-3" /> Bugün Müsait
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white animate-pulse rounded-2xl border border-border" />)}
                                </div>
                            ) : (
                                <div className={viewMode === 'wide' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-5'}>
                                    {visibleSalons.map(salon => (
                                        <Link
                                            href={`/salon/${salon.id}`}
                                            key={salon.id}
                                            className="group block bg-white border border-border p-4 rounded-3xl hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                                            onMouseEnter={() => setHoveredSalonId(salon.id)}
                                            onMouseLeave={() => setHoveredSalonId(null)}
                                        >
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
                                                <div className="pt-2 flex items-center justify-between border-t border-gray-50 mt-2">
                                                    <span className="text-[10px] text-text-muted font-bold uppercase">Başlayan fiyatlar</span>
                                                    <span className="text-sm font-black text-primary">₺{salon.startPrice || '---'}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {filteredSalons.length === 0 && (
                                        <div className="text-center py-20">
                                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Info className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-text-main font-bold">Sonuç bulunamadı</p>
                                            <p className="text-text-muted text-sm mt-1">Lütfen farklı bir arama yapmayı deneyin.</p>
                                        </div>
                                    )}
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
                <div className="flex flex-col">
                    {/* Hero Section */}
                    <section className="relative bg-gray-900 min-h-[500px] lg:min-h-[600px] flex items-center justify-center overflow-hidden">
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0 z-0">
                            <img
                                alt="Luxury Salon"
                                className="w-full h-full object-cover opacity-50 scale-105 animate-slow-zoom"
                                src="https://images.unsplash.com/photo-1633681926022-2292608933c0?q=80&w=2000&auto=format&fit=crop"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
                        </div>

                        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-6 backdrop-blur-md">
                                <Sparkles className="w-3 h-3" /> Türkiye'nin En İyi Salonlarını Keşfedin
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
                                Güzelliğin <span className="text-primary italic">Yeni Adresi</span>
                            </h1>
                            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto font-medium">
                                En yakın kuaför, berber ve güzellik merkezlerini keşfedin, fiyatları karşılaştırın ve anında randevu alın.
                            </p>

                            <div className="bg-white rounded-2xl p-2 shadow-2xl relative z-50">
                                {/* Search Tabs */}
                                <div className="flex border-b border-gray-100 mb-2">
                                    {(['service', 'type', 'salon'] as SearchTab[]).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {tab === 'service' ? 'Hizmet' : tab === 'type' ? 'Salon Türü' : 'Salon Adı'}
                                            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col md:flex-row gap-2">
                                    <div className="flex-1 relative" ref={searchWrapperRef}>
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={localSearch}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            onFocus={() => localSearch.length >= 2 && setShowSuggestions(true)}
                                            placeholder={activeTab === 'service' ? "Hizmet ara (örn. Saç Kesimi)..." : activeTab === 'type' ? "Salon türü seçin..." : "İşletme adı yazın..."}
                                            className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:border-primary transition-all text-sm font-medium"
                                            onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                                        />

                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-xl z-[100] max-h-80 overflow-y-auto overflow-x-hidden">
                                                {suggestions.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => handleSuggestionSelect(item)}
                                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'salon' ? 'bg-blue-50 text-blue-600' : item.type === 'service' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            {item.type === 'salon' ? <Store className="w-4 h-4" /> : item.type === 'service' ? <Sparkles className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex flex-col text-left">
                                                            <span className="text-sm font-bold text-text-main">{item.text}</span>
                                                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                                                                {item.type === 'salon' ? 'Salon' : item.type === 'service' ? 'Hizmet' : 'Kategori'}
                                                            </span>
                                                        </div>
                                                        <ArrowRight className="ml-auto w-4 h-4 text-gray-300" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full md:w-48 relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <select
                                            value={selectedCity}
                                            onChange={(e) => setSelectedCity(e.target.value)}
                                            className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none appearance-none cursor-pointer bg-white text-sm font-medium"
                                        >
                                            <option value="Tümü">Tüm Şehirler</option>
                                            {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>

                                    <button
                                        onClick={executeSearch}
                                        className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-primary/20"
                                    >
                                        Ara
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Featured Salons Area */}
                    <section className="py-20 bg-white">
                        <div className="max-w-[1400px] mx-auto px-4">
                            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                                <div>
                                    <h2 className="text-3xl font-black text-text-main mb-2">Öne Çıkan Salonlar</h2>
                                    <p className="text-text-muted">Editörlerimizin sizin için seçtiği en iyi mekanlar.</p>
                                </div>
                                <button onClick={() => router.push('/?type=all')} className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                    Tümünü Gör <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {salons.slice(0, 4).map((salon) => (
                                    <Link href={`/salon/${salon.id}`} key={salon.id} className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img src={salon.image || '/placeholder-salon.jpg'} alt={salon.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            {salon.is_sponsored && (
                                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[9px] font-black uppercase text-primary border border-white">Öne Çıkan</div>
                                            )}
                                            <button
                                                onClick={(e) => handleToggleFavorite(e, salon.id)}
                                                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all border border-white/30"
                                            >
                                                <Heart className={`w-5 h-5 ${userFavorites.includes(salon.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                            </button>
                                            <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="w-full bg-white text-text-main py-2.5 rounded-xl text-center font-black text-sm shadow-xl">Hemen Randevu Al</div>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2 gap-2">
                                                    <h3 className="font-bold text-text-main group-hover:text-primary transition-colors leading-tight line-clamp-1">{salon.name}</h3>
                                                    <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-lg text-amber-700 text-xs font-black border border-amber-100 shrink-0">
                                                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                        {salon.rating || '5.0'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-text-muted mb-4">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold">{salon.district}, {salon.city}</span>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Başlangıç</span>
                                                <span className="text-lg font-black text-primary">₺{salon.startPrice}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Popular Categories */}
                    <section className="py-20 bg-gray-50 border-y border-gray-200">
                        <div className="max-w-[1400px] mx-auto px-4">
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-text-main mb-2">Popüler Kategoriler</h2>
                                    <p className="text-text-muted">İhtiyacınıza uygun uzmanı kategorilere göre bulun.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {salonTypes.slice(0, 8).map((type) => (
                                    <Link href={`/?type=${type.slug}`} key={type.id} className="group relative aspect-[4/3] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url("${type.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600'}")` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
                                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                            <h3 className="text-xl font-bold text-white mb-1 group-hover:-translate-y-1 transition-transform duration-300">{type.name}</h3>
                                            <div className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                                Keşfet <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Popular Services Section */}
                    <section className="py-20 bg-white">
                        <div className="max-w-[1400px] mx-auto px-4">
                            <div className="text-center mb-16">
                                <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Hizmetlerimiz</span>
                                <h2 className="text-4xl font-black text-text-main">Popüler Hizmetler</h2>
                                <div className="w-16 h-1 bg-primary mx-auto mt-6 rounded-full" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {popularServices.map((service, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/?search=${encodeURIComponent(service)}&mode=service`}
                                        className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary hover:shadow-xl transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                            {getServiceIcon(service)}
                                        </div>
                                        <span className="text-text-main font-bold text-sm truncate">{service}</span>
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-16 text-center">
                                <Link href="/?type=all" className="inline-flex items-center gap-3 px-8 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black text-text-main hover:bg-white hover:border-primary hover:shadow-xl transition-all group">
                                    Tüm Hizmetleri Görüntüle <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            )}
            <GeminiChat />
        </Layout>
    );
}
