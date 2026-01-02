/// <reference lib="dom" />
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Layout } from '@/components/Layout';
import { GeminiChat } from '@/components/GeminiChat';
import { SalonDataService, MasterDataService, ServiceService } from '@/services/db';
import { SalonDetail, SalonType, GlobalService, City, District } from '@/types';

// Helper: Default coordinates for major cities
const getCityCoordinates = (cityName: string): { lat: number; lng: number } | null => {
    const cityCoords: Record<string, { lat: number; lng: number }> = {
        "İstanbul": { lat: 41.0082, lng: 28.9784 },
        "Ankara": { lat: 39.9208, lng: 32.8541 },
        "İzmir": { lat: 38.4237, lng: 27.1428 },
        "Antalya": { lat: 36.8969, lng: 30.7133 },
        "Bursa": { lat: 40.1885, lng: 29.0610 },
        "Adana": { lat: 37.0000, lng: 35.3213 },
        "Gaziantep": { lat: 37.0662, lng: 37.3833 },
        "Konya": { lat: 37.8667, lng: 32.4833 }
    };
    return cityCoords[cityName] || null;
};

// Dynamically import Map component with no SSR
const SalonMap = dynamic(
    () => import('@/components/Map/SalonMap').then((mod) => mod.SalonMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-muted text-sm">Harita yükleniyor...</p>
                </div>
            </div>
        )
    }
);

type SearchTab = 'service' | 'type' | 'salon';

// --- Helper: Turkish Character Normalization ---
const normalize = (text: string | undefined | null) => {
    if (!text) return '';
    return text.toLocaleLowerCase('tr').trim();
};

// --- Helper: Strict Coordinate Validation ---
const isValidLatLng = (lat: any, lng: any): boolean => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
    const numLat = Number(lat);
    const numLng = Number(lng);
    if (isNaN(numLat) || isNaN(numLng) || !isFinite(numLat) || !isFinite(numLng)) return false;

    // Reject 0,0 coordinates (likely invalid data)
    if (numLat === 0 && numLng === 0) return false;

    // Basic sanity check for Turkey (latitude: 36-42, longitude: 26-45)
    if (numLat < 35 || numLat > 43 || numLng < 25 || numLng > 46) return false;

    return true;
};


// --- Service Icon Helper ---
const getServiceIcon = (serviceName: string) => {
    const lower = serviceName.toLowerCase();
    if (lower.includes('saç') || lower.includes('fön') || lower.includes('kesim') || lower.includes('röfle') || lower.includes('ombre')) return 'content_cut';
    if (lower.includes('tırnak') || lower.includes('oje') || lower.includes('manikür') || lower.includes('pedikür') || lower.includes('jel')) return 'brush';
    if (lower.includes('makyaj') || lower.includes('kirpik') || lower.includes('kaş') || lower.includes('lifting')) return 'face';
    if (lower.includes('masaj') || lower.includes('spa')) return 'spa';
    if (lower.includes('cilt') || lower.includes('bakım') || lower.includes('peeling')) return 'clean_hands';
    if (lower.includes('lazer') || lower.includes('epilasyon') || lower.includes('ağda')) return 'flash_on';
    if (lower.includes('sakal') || lower.includes('tıraş')) return 'face_retouching_natural';
    if (lower.includes('solaryum')) return 'light_mode';
    if (lower.includes('diyet') || lower.includes('zayıflama')) return 'monitor_weight';
    return 'star';
};

function HomePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [salons, setSalons] = useState<SalonDetail[]>([]);
    const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);
    const [globalServices, setGlobalServices] = useState<GlobalService[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [showUnauthorizedError, setShowUnauthorizedError] = useState(false);

    // Check for error parameter (unauthorized access)
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'unauthorized') {
            setShowUnauthorizedError(true);
            // Auto-hide after 5 seconds
            setTimeout(() => setShowUnauthorizedError(false), 5000);
            // Clean up URL
            router.replace('/');
        }
    }, [searchParams, router]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [salonServicesMap, setSalonServicesMap] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);

    // Search Parameters from URL
    const typeParam = searchParams.get('type');
    const searchParam = searchParams.get('search');
    const cityParam = searchParams.get('city');
    const modeParam = searchParams.get('mode'); // 'service', 'type', 'salon'

    // Mode Check
    const isSearchMode = !!(typeParam || searchParam || cityParam);

    // States
    const [hoveredSalonId, setHoveredSalonId] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(5);

    // Filter States (Initialized from URL)
    const [localSearch, setLocalSearch] = useState(searchParam || '');
    const [selectedCity, setSelectedCity] = useState(cityParam || 'Tümü');
    const [selectedDistrict, setSelectedDistrict] = useState('Tümü');

    // Hero Search Tab State
    const [activeTab, setActiveTab] = useState<SearchTab>('service');

    // Autocomplete/Combobox States
    const [suggestions, setSuggestions] = useState<{ type: 'salon' | 'service' | 'category', text: string, id?: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    // Data Loading
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [salonsData, typesData, servicesData, citiesData] = await Promise.all([
                SalonDataService.getSalons(),
                MasterDataService.getSalonTypes(),
                MasterDataService.getAllGlobalServices(),
                MasterDataService.getCities()
            ]);

            // Map database fields to display-friendly properties
            const mappedData = salonsData.map(salon => ({
                ...salon,
                city: salon.city_name,
                district: salon.district_name,
                rating: salon.average_rating || 0,
                tags: [salon.type_name], // Use type as a tag for now
                startPrice: 100, // TODO: Get from salon_services minimum price
                coordinates: {
                    lat: salon.geo_latitude || 0,
                    lng: salon.geo_longitude || 0
                }
            }));

            setSalons(mappedData);
            setSalonTypes(typesData);
            setGlobalServices(servicesData);
            setCities(citiesData);

            // Load services for all salons to enable service-based search
            const servicesMap: Record<string, string[]> = {};
            await Promise.all(
                salonsData.map(async (salon) => {
                    try {
                        const salonServices = await ServiceService.getServicesBySalon(salon.id);
                        servicesMap[salon.id] = salonServices.map(s => s.service_name);
                    } catch (error) {
                        console.error(`Error loading services for salon ${salon.id}:`, error);
                        servicesMap[salon.id] = [];
                    }
                })
            );
            setSalonServicesMap(servicesMap);

            setLoading(false);
        };
        fetchData();
    }, []); // Run once on mount

    // Sync URL params to State when URL changes (e.g. back button)
    useEffect(() => {
        if (searchParam !== null) setLocalSearch(searchParam);
        if (cityParam !== null) setSelectedCity(cityParam);
        // Note: We don't sync district from URL yet as it's not in the main query params typically, but could be added.
    }, [searchParam, cityParam]);

    // Load districts when city changes
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

    // District Reset logic
    const availableDistricts = districts.map(d => d.name);
    useEffect(() => {
        // Only reset if the current selected district is not in the new city's list
        if (selectedCity !== 'Tümü' && selectedDistrict !== 'Tümü' && !availableDistricts.includes(selectedDistrict)) {
            setSelectedDistrict('Tümü');
        }
    }, [selectedCity, availableDistricts, selectedDistrict]);

    // --- Filtering Logic ---
    const filteredSalons = salons.filter(salon => {
        // 1. City Filter
        if (selectedCity !== 'Tümü') {
            const salonCity = normalize(salon.city_name);
            const targetCity = normalize(selectedCity);
            // Strict check for city (prevents "Istanbul" matching inside "Istanbul yolu")
            const salonAddress = normalize(salon.address);
            if (salonCity !== targetCity && !salonAddress.includes(targetCity)) return false;
        }

        // 2. District Filter
        if (selectedDistrict !== 'Tümü') {
            const salonDistrict = normalize(salon.district_name);
            const targetDistrict = normalize(selectedDistrict);
            // Use includes for address string fallback
            const salonAddress = normalize(salon.address);
            if (salonDistrict !== targetDistrict && !salonAddress.includes(targetDistrict)) return false;
        }

        // 3. Type/Category Filter (from URL)
        if (typeParam && typeParam !== 'all') {
            const typeSlug = normalize(typeParam);
            const salonTypeSlug = normalize(salon.type_slug);
            const salonTypeName = normalize(salon.type_name);

            // Check if salon type matches the requested type
            const isMatch = salonTypeSlug === typeSlug ||
                salonTypeName.includes(typeSlug) ||
                (typeSlug === 'kuafor' && salonTypeName.includes('kuaför')) ||
                (typeSlug === 'sac' && salonTypeName.includes('saç'));

            if (!isMatch) return false;
        }

        // 4. Search Term Filter (Context Aware)
        if (localSearch) {
            const term = normalize(localSearch);

            // Use modeParam to be specific if provided
            if (modeParam === 'salon') {
                // Strict Name Search
                if (!normalize(salon.name).includes(term)) return false;
            } else if (modeParam === 'type' || modeParam === 'service') {
                // Type/Category/Service Search - check type_name and actual services
                const matchesType = normalize(salon.type_name).includes(term);
                const matchesAddress = normalize(salon.address).includes(term);

                // Check if any of the salon's services match
                const salonServices = salonServicesMap[salon.id] || [];
                const matchesService = salonServices.some(serviceName =>
                    normalize(serviceName).includes(term)
                );

                if (!matchesType && !matchesAddress && !matchesService) return false;
            } else {
                // Generic Fallback (Name OR Type OR Address OR Services)
                const matchesName = normalize(salon.name).includes(term);
                const matchesType = normalize(salon.type_name).includes(term);
                const matchesAddress = normalize(salon.address).includes(term);

                // Check if any of the salon's services match
                const salonServices = salonServicesMap[salon.id] || [];
                const matchesService = salonServices.some(serviceName =>
                    normalize(serviceName).includes(term)
                );

                if (!matchesName && !matchesType && !matchesAddress && !matchesService) return false;
            }
        }
        return true;
    });

    const visibleSalons = filteredSalons.slice(0, visibleCount);
    const handleLoadMore = () => setVisibleCount(prev => prev + 5);

    // Popular Services List - Use real data from database
    const popularServices = Array.from(new Set(globalServices.map(s => s.name))).sort().slice(0, 30);

    // --- Safe Map Center Calculation ---
    const defaultCenter = { lat: 41.0082, lng: 28.9784 }; // Istanbul

    // Get city coordinates using helper function
    const ISTANBUL_KEY = "İstanbul";
    const istanbulCoords = getCityCoordinates(ISTANBUL_KEY) || defaultCenter;

    const targetCityCoords = getCityCoordinates(selectedCity);
    // If we have filtered salons, try to center on the first one
    const firstSalon = filteredSalons.length > 0 ? filteredSalons[0] : null;
    const firstSalonCoords = firstSalon && isValidLatLng(firstSalon.geo_latitude, firstSalon.geo_longitude)
        ? { lat: Number(firstSalon.geo_latitude), lng: Number(firstSalon.geo_longitude) }
        : null;

    const mapCenterRaw = firstSalonCoords || targetCityCoords || istanbulCoords;

    // Robust conversion to numbers and check validity
    const finalLat = mapCenterRaw && isValidLatLng(mapCenterRaw.lat, mapCenterRaw.lng) ? Number(mapCenterRaw.lat) : defaultCenter.lat;
    const finalLng = mapCenterRaw && isValidLatLng(mapCenterRaw.lat, mapCenterRaw.lng) ? Number(mapCenterRaw.lng) : defaultCenter.lng;

    // Debug: Log if we're using fallback
    if (!mapCenterRaw || !isValidLatLng(mapCenterRaw.lat, mapCenterRaw.lng)) {
        console.warn('Invalid map center coordinates, using fallback:', {
            selectedCity,
            firstSalonCoords,
            targetCityCoords,
            fallback: defaultCenter
        });
    }

    const safeMapCenter = {
        lat: finalLat,
        lng: finalLng
    };

    // Debug: Log the final center coordinates
    console.log('Passing to SalonMap:', safeMapCenter, 'isValid:', isValidLatLng(safeMapCenter.lat, safeMapCenter.lng));

    // --- Combobox / Autocomplete Logic ---
    const handleSearchChange = (val: string) => {
        setLocalSearch(val);
        if (val.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const term = normalize(val);
        const newSuggestions: typeof suggestions = [];

        // Filter logic based on Active Tab

        // 1. Salons (Only if tab is Salon or Generic)
        if (activeTab === 'salon') {
            salons.forEach(s => {
                if (normalize(s.name).includes(term)) {
                    newSuggestions.push({ type: 'salon', text: s.name, id: s.id });
                }
            });
        }

        // 2. Categories (Only if tab is Type or Generic)
        if (activeTab === 'type') {
            salonTypes.forEach(t => {
                if (normalize(t.name).includes(term)) {
                    newSuggestions.push({ type: 'category', text: t.name, id: t.slug }); // Pass slug for filtering
                }
            });
        }

        // 3. Services (Only if tab is Service or Generic)
        if (activeTab === 'service') {
            // Get all unique services from global services
            const globalServiceNames = globalServices
                .filter(s => normalize(s.name).includes(term))
                .map(s => s.name);

            // Get all unique services from actual salon services
            const allSalonServices = Object.values(salonServicesMap).flat();
            const salonServiceNames = allSalonServices
                .filter(s => normalize(s).includes(term));

            // Combine and deduplicate
            const matchedServices = Array.from(new Set([...globalServiceNames, ...salonServiceNames])).slice(0, 10);

            matchedServices.forEach(s => {
                newSuggestions.push({ type: 'service', text: s });
            });
        }

        setSuggestions(newSuggestions);
        setShowSuggestions(true);
    };

    const handleSuggestionSelect = (item: typeof suggestions[0]) => {
        setLocalSearch(item.text);
        setShowSuggestions(false);

        // Direct Navigation for Salons
        if (item.type === 'salon' && item.id) {
            router.push(`/salon/${item.id}`);
            return;
        }

        // Filter Navigation for Categories
        if (item.type === 'category' && item.id) {
            // item.id here holds the slug because we passed it in handleSearchChange
            let query = `/?type=${item.id}`;
            if (selectedCity !== 'Tümü') query += `&city=${selectedCity}`;
            router.push(query);
            return;
        }

        // Search Navigation for Services
        let query = `/?search=${encodeURIComponent(item.text)}`;
        if (selectedCity !== 'Tümü') query += `&city=${selectedCity}`;
        query += `&mode=service`;

        router.push(query);
    };

    const executeSearch = () => {
        let query = `/?search=${encodeURIComponent(localSearch)}`;
        if (selectedCity && selectedCity !== 'Tümü') {
            query += `&city=${selectedCity}`;
        }
        // Pass the active tab as mode to refine results
        query += `&mode=${activeTab}`;
        router.push(query);
        setShowSuggestions(false);
    };

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchWrapperRef.current && event.target instanceof Node && !searchWrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        if (typeof window !== 'undefined') {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);


    // --- VIEW 1: SEARCH & LISTING (PROFESSIONAL SPLIT VIEW) ---
    // Add viewMode state
    const [viewMode, setViewMode] = useState<'split' | 'wide'>('split');

    if (isSearchMode) {
        return (
            <Layout>
                {/* Fixed Layout Container: Header is handled by Layout, we handle the rest full height */}
                <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-background">

                    {/* Left Side: Scrollable List */}
                    <div className={`${viewMode === 'wide' ? 'w-full' : 'w-full lg:w-[500px] xl:w-[550px]'} flex flex-col border-r border-border bg-white shadow-xl z-20 shrink-0 h-full transition-all duration-300`}>

                        {/* Filter Header */}
                        <div className="p-5 border-b border-border bg-white sticky top-0 z-10 shadow-sm">
                            <div className="relative mb-3" ref={searchWrapperRef}>
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">search</span>
                                <input
                                    type="text"
                                    value={localSearch}
                                    onChange={(e) => handleSearchChange((e.target as HTMLInputElement).value)}
                                    onFocus={() => localSearch.length >= 2 && setShowSuggestions(true)}
                                    placeholder="Salon, hizmet veya bölge ara..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-text-main placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                                />
                                {/* Sidebar Suggestions Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                                        {suggestions.map((item, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleSuggestionSelect(item)}
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3"
                                            >
                                                <span className="material-symbols-outlined text-gray-400 text-lg">
                                                    {item.type === 'salon' ? 'store' : item.type === 'service' ? 'spa' : 'category'}
                                                </span>
                                                <span className="text-sm text-text-main">{item.text}</span>
                                                {item.type === 'salon' && <span className="ml-auto text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">Salon</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity((e.target as HTMLSelectElement).value)}
                                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-3 pr-8 text-text-main text-xs font-medium appearance-none cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="Tümü">Tüm Şehirler</option>
                                        {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">expand_more</span>
                                </div>
                                <div className="relative">
                                    <select
                                        value={selectedDistrict}
                                        disabled={selectedCity === 'Tümü'}
                                        onChange={(e) => setSelectedDistrict((e.target as HTMLSelectElement).value)}
                                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-3 pr-8 text-text-main text-xs font-medium appearance-none cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="Tümü">Tüm İlçeler</option>
                                        {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                <span className="text-xs font-bold text-text-main">{filteredSalons.length} işletme bulundu</span>

                                <div className="flex items-center gap-3">
                                    {/* View Toggle Buttons */}
                                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                                        <button
                                            onClick={() => setViewMode('split')}
                                            className={`p-1.5 rounded-md transition-all ${viewMode === 'split' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                            title="Harita Görünümü"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">map</span>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('wide')}
                                            className={`p-1.5 rounded-md transition-all ${viewMode === 'wide' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                            title="Geniş Liste"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">grid_view</span>
                                        </button>
                                    </div>

                                    <Link href="/" onClick={() => { setLocalSearch(''); setSelectedCity('Tümü'); }} className="text-xs text-primary font-bold hover:underline">Temizle & Çık</Link>
                                </div>
                            </div>
                        </div>

                        {/* Salon List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-gray-50/50">
                            {loading ? (
                                <div className={`space-y-4 ${viewMode === 'wide' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 space-y-0' : ''}`}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className={`${viewMode === 'wide' ? 'h-80' : 'h-40'} bg-white animate-pulse rounded-2xl border border-gray-100`}></div>)}
                                </div>
                            ) : (
                                <div className={viewMode === 'wide' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-5'}>
                                    {visibleSalons.map(salon => (
                                        <Link
                                            href={`/salon/${salon.id}`}
                                            key={salon.id}
                                            onMouseEnter={() => setHoveredSalonId(salon.id)}
                                            onMouseLeave={() => setHoveredSalonId(null)}
                                            className={`group bg-white rounded-2xl border p-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg ${hoveredSalonId === salon.id ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-primary/30'} ${viewMode === 'wide' ? 'flex flex-col h-full' : 'flex gap-4'}`}
                                        >
                                            <div className={`relative shrink-0 rounded-xl overflow-hidden bg-gray-100 ${viewMode === 'wide' ? 'w-full aspect-[4/3] mb-4' : 'w-32 h-32'}`}>
                                                <img src={salon.image} alt={salon.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                {salon.is_sponsored && <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-primary text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">Öne Çıkan</div>}
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h3 className="font-display font-bold text-text-main text-lg leading-tight truncate group-hover:text-primary transition-colors">{salon.name}</h3>
                                                        <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded text-xs font-bold text-text-main border border-gray-100 shrink-0">
                                                            <span className="material-symbols-outlined text-[14px] filled text-yellow-400">star</span> {salon.rating}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-text-secondary mt-1 truncate flex items-center gap-1">
                                                        {salon.district}, {salon.city}
                                                    </p>

                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                        {salon.tags && salon.tags.slice(0, 2).map(tag => (
                                                            <span key={tag} className="text-[10px] text-text-secondary bg-gray-100 px-2 py-1 rounded-md font-medium">{tag}</span>
                                                        ))}
                                                        {salon.tags && salon.tags.length > 2 && <span className="text-[10px] text-text-muted bg-gray-50 px-2 py-1 rounded-md">+ {salon.tags.length - 2}</span>}
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-text-muted font-bold uppercase">Başlangıç</span>
                                                        <span className="text-primary font-bold text-base">{salon.startPrice} ₺</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
                                                        İncele <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}

                                    {filteredSalons.length > visibleCount && (
                                        <button
                                            onClick={handleLoadMore}
                                            className={`w-full py-4 text-sm font-bold text-text-main border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm flex items-center justify-center gap-2 ${viewMode === 'wide' ? 'col-span-full' : ''}`}
                                        >
                                            Daha Fazla Göster <span className="material-symbols-outlined text-lg">expand_more</span>
                                        </button>
                                    )}

                                    {filteredSalons.length === 0 && (
                                        <div className={`flex flex-col items-center justify-center py-20 text-text-muted ${viewMode === 'wide' ? 'col-span-full' : ''}`}>
                                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                                <span className="material-symbols-outlined text-4xl opacity-50">store_off</span>
                                            </div>
                                            <p className="font-bold text-text-main">Sonuç bulunamadı</p>
                                            <p className="text-sm mt-1">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
                                            <button onClick={() => { setLocalSearch(''); setSelectedCity('Tümü'); setSelectedDistrict('Tümü'); }} className="mt-4 text-primary text-sm font-bold hover:underline">Filtreleri Temizle</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Map (Hidden on mobile initially, visible on desktop) */}
                    <div className={`${viewMode === 'wide' ? 'hidden' : 'hidden lg:block'} flex-1 relative bg-gray-100 h-full z-0 transition-all duration-300`}>
                        <SalonMap
                            center={safeMapCenter}
                            salons={filteredSalons}
                            hoveredSalonId={hoveredSalonId}
                            onSalonHover={setHoveredSalonId}
                        />

                        {/* Floating Map Controls */}
                        <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-[400]">
                            <button className="size-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:text-primary transition-colors border border-gray-100" onClick={() => { }} title="Konumum">
                                <span className="material-symbols-outlined">my_location</span>
                            </button>
                        </div>
                    </div>
                </div>
                <GeminiChat />
            </Layout>
        );
    }

    // --- VIEW 2: LANDING PAGE ---

    return (
        <Layout>
            {/* Unauthorized Access Error Notification */}
            {showUnauthorizedError && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-fade-in">
                    <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-md">
                        <span className="material-symbols-outlined text-red-600">block</span>
                        <div>
                            <p className="text-red-800 font-bold text-sm">Yetkisiz Erişim</p>
                            <p className="text-red-600 text-xs">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
                        </div>
                        <button
                            onClick={() => setShowUnauthorizedError(false)}
                            className="ml-auto text-red-400 hover:text-red-600"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative bg-gray-900 overflow-visible min-h-[550px] lg:min-h-[650px] flex items-center justify-center z-10">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Luxury Salon Background"
                        className="w-full h-full object-cover opacity-60"
                        src="https://images.unsplash.com/photo-1633681926022-2292608933c0?q=80&w=2000&auto=format&fit=crop"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>
                </div>

                <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center mt-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md">
                        Türkiye'nin #1 Numaralı Platformu
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black text-white mb-6 leading-tight drop-shadow-2xl">
                        Güzelliğin <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">Yeni Adresi</span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-10 max-w-2xl font-medium drop-shadow-md leading-relaxed">
                        Size en yakın kuaför, berber ve güzellik merkezlerini keşfedin, fiyatları karşılaştırın ve saniyeler içinde randevunuzu oluşturun.
                    </p>

                    {/* New Tabbed Search Bar Box */}
                    <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-2 mx-auto border border-white/20 backdrop-blur-sm relative z-50 animate-fade-in-up">

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 mb-2 px-2">
                            <button
                                onClick={() => { setActiveTab('service'); setLocalSearch(''); setSuggestions([]); }}
                                className={`px-4 py-3 text-sm font-bold transition-all border-b-2 outline-none ${activeTab === 'service' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-primary'}`}
                            >
                                Hizmet
                            </button>
                            <button
                                onClick={() => { setActiveTab('type'); setLocalSearch(''); setSuggestions([]); }}
                                className={`px-4 py-3 text-sm font-bold transition-all border-b-2 outline-none ${activeTab === 'type' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-primary'}`}
                            >
                                Salon Türü
                            </button>
                            <button
                                onClick={() => { setActiveTab('salon'); setLocalSearch(''); setSuggestions([]); }}
                                className={`px-4 py-3 text-sm font-bold transition-all border-b-2 outline-none ${activeTab === 'salon' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-primary'}`}
                            >
                                Salon Adı
                            </button>
                        </div>

                        {/* Inputs */}
                        <div className="flex flex-col md:flex-row gap-2 p-2">
                            {/* Combobox Search Input */}
                            <div className="flex-grow relative group" ref={searchWrapperRef}>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm font-medium transition-shadow"
                                    placeholder={
                                        activeTab === 'service' ? 'Hizmet ara (örn. Saç Kesimi, Manikür)...' :
                                            activeTab === 'type' ? 'Salon türü ara (örn. Kuaför, Berber)...' :
                                                'Salon adı ile ara...'
                                    }
                                    value={localSearch}
                                    onChange={(e) => handleSearchChange((e.target as HTMLInputElement).value)}
                                    onFocus={() => localSearch.length >= 2 && setShowSuggestions(true)}
                                    onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                                />

                                {/* Suggestions Dropdown (Landing Page) */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-xl z-[100] max-h-80 overflow-y-auto">
                                        <div className="p-2 border-b border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-4">Önerilenler</div>
                                        {suggestions.map((item, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleSuggestionSelect(item)}
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3"
                                            >
                                                <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-gray-500 text-sm">
                                                        {item.type === 'salon' ? 'store' : item.type === 'service' ? 'spa' : 'category'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="text-sm font-bold text-text-main">{item.text}</span>
                                                    {item.type === 'salon' && <span className="text-[10px] text-gray-500">Salon</span>}
                                                    {item.type === 'category' && <span className="text-[10px] text-gray-500">Kategori</span>}
                                                </div>
                                                <span className="ml-auto material-symbols-outlined text-gray-300 text-lg -rotate-45">arrow_forward</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="w-full md:w-1/3 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <span className="material-symbols-outlined">location_on</span>
                                </div>
                                <select
                                    className="block w-full pl-10 pr-8 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm appearance-none cursor-pointer font-medium"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity((e.target as HTMLSelectElement).value)}
                                >
                                    <option value="Tümü">Tüm Şehirler</option>
                                    {cities.map(city => <option key={city.id} value={city.name}>{city.name}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 text-sm">expand_more</span>
                                </div>
                            </div>

                            <button
                                onClick={executeSearch}
                                className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 shrink-0"
                            >
                                Ara
                            </button>
                        </div>

                        {/* Footer / Tags */}
                        <div className="px-4 py-2 flex items-center justify-start gap-2 text-xs text-text-secondary border-t border-gray-50 mt-1 pt-3">
                            <button className="flex items-center gap-1 hover:text-primary transition-colors font-medium" onClick={() => { }}>
                                <span className="material-symbols-outlined text-sm">my_location</span>
                                Yakınımda Ara
                            </button>
                            <span className="mx-2 opacity-30">|</span>
                            <span className="hidden sm:inline opacity-70">Popüler: </span>
                            {salonTypes.slice(0, 3).map(type => (
                                <Link key={type.id} href={`/?type=${type.slug}`} className="hover:text-primary hover:underline font-medium">{type.name}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Salons - Compact Cards (MOVED UP) */}
            <div className="bg-white py-20 relative z-0">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-text-main mb-2">Öne Çıkan Salonlar</h2>
                            <p className="text-text-secondary">Editörlerimizin sizin için seçtiği en iyi mekanlar.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {salons.slice(0, 4).map((salon) => (
                            <Link href={`/salon/${salon.id}`} key={salon.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                <div className="relative overflow-hidden aspect-[4/3]">
                                    <img alt={salon.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={salon.image} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    {salon.is_sponsored && (
                                        <div className="absolute top-3 left-3 bg-white text-text-main text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded shadow-sm">Sponsorlu</div>
                                    )}
                                    <div className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-sm block">favorite</span>
                                    </div>
                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                        <span className="w-full block bg-white text-text-main text-center py-2 rounded-lg font-bold text-sm shadow-lg">Randevu Al</span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col justify-between flex-1">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-display font-bold text-text-main leading-tight group-hover:text-primary transition-colors">{salon.name}</h3>
                                            <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded text-green-700 text-xs font-bold shrink-0 ml-2 border border-green-100">
                                                {salon.rating || '5.0'}
                                                <span className="material-symbols-outlined text-[10px] ml-0.5 filled">star</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-text-secondary mb-3 flex items-center truncate">
                                            <span className="material-symbols-outlined text-sm mr-1 text-gray-400">location_on</span>
                                            {salon.district}, {salon.city}
                                        </p>
                                        <div className="flex gap-1 mb-4 overflow-hidden">
                                            {salon.tags && salon.tags.slice(0, 3).map(t => (
                                                <span key={t} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md whitespace-nowrap">{t}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                                        <span className="text-xs text-text-muted font-medium">Başlangıç</span>
                                        <span className="text-lg font-bold text-primary">{salon.startPrice} ₺</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Categories Section - Grid Alignment (Background changed to gray) */}
            <div className="bg-gray-50 py-20 border-y border-gray-200">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-text-main">Popüler Kategoriler</h2>
                            <p className="text-text-secondary mt-2">İhtiyacınıza uygun uzmanı kategorilere göre bulun.</p>
                        </div>
                        <Link href="/?type=all" className="hidden sm:flex items-center text-primary font-bold text-sm hover:underline gap-1">
                            Tümünü Gör <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {salonTypes.slice(0, 8).map((type) => (
                            <Link href={`/?type=${type.slug}`} key={type.id} className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 bg-white">
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url("${type.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600'}")` }}
                                ></div>

                                {/* Gradient Overlay - Better Readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end items-start z-10">
                                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-1 transform group-hover:-translate-y-1 transition-transform duration-300">{type.name}</h3>
                                    <div className="h-0 group-hover:h-auto opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-300">
                                        <span className="text-xs font-bold text-primary flex items-center gap-1 uppercase tracking-wide">
                                            Keşfet <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Services Section - Clean List Layout (MOVED TO BOTTOM, Background White) */}
            <div className="bg-white py-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-primary font-bold tracking-wider text-xs uppercase mb-2 block">Hizmetlerimiz</span>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-text-main">
                            Popüler Hizmetler
                        </h2>
                        <div className="h-1 w-16 bg-primary mx-auto mt-4 rounded-full"></div>
                    </div>

                    {/* The "Clean List" Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {popularServices.map((service, idx) => (
                            <Link
                                key={idx}
                                href={`/?search=${encodeURIComponent(service)}&mode=service`}
                                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                            >
                                <div className="size-10 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                    <span className="material-symbols-outlined text-xl">{getServiceIcon(service)}</span>
                                </div>
                                <span className="text-text-secondary font-semibold text-sm group-hover:text-text-main transition-colors truncate">{service}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <Link href="/?type=all" className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 shadow-sm text-sm font-bold rounded-xl text-text-secondary bg-white hover:bg-gray-50 transition-all">
                            Tüm Hizmetleri Görüntüle
                        </Link>
                    </div>
                </div>
            </div>

            <GeminiChat />
        </Layout>
    );
}

// Wrap with Suspense to handle useSearchParams
export default function HomePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-muted text-lg">Yükleniyor...</p>
                </div>
            </div>
        }>
            <HomePageContent />
        </Suspense>
    );
}
