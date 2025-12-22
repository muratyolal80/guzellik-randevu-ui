/// <reference lib="dom" />
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CITIES, DISTRICTS, CATEGORIES, CITY_COORDINATES, MOCK_SALON_TYPES, MOCK_SERVICES } from '@/constants';
import { Layout } from '@/components/Layout';
import { GeminiChat } from '@/components/GeminiChat';
import { SalonService } from '@/services/db';
import { Salon } from '@/types';

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
const normalize = (text: string) => {
    return text.toLocaleLowerCase('tr').trim();
};

// --- Helper: Strict Coordinate Validation ---
const isValidLatLng = (lat: any, lng: any): boolean => {
    const numLat = Number(lat);
    const numLng = Number(lng);
    return !isNaN(numLat) && !isNaN(numLng) && isFinite(numLat) && isFinite(numLng);
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
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

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
  const [selectedCity, setSelectedCity] = useState(cityParam || 'İstanbul');
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
        const data = await SalonService.getSalons();
        setSalons(data);
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

  // District Reset logic
  const availableDistricts = selectedCity !== 'Tümü' ? (DISTRICTS[selectedCity] || []) : [];
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
        const salonCity = normalize(salon.city || '');
        const targetCity = normalize(selectedCity);
        // Strict check for city (prevents "Istanbul" matching inside "Istanbul yolu")
        if (salonCity !== targetCity && !normalize(salon.location).includes(targetCity)) return false;
    }

    // 2. District Filter
    if (selectedDistrict !== 'Tümü') {
        const salonDistrict = normalize(salon.district || '');
        const targetDistrict = normalize(selectedDistrict);
        // Use includes for location string fallback
        if (salonDistrict !== targetDistrict && !normalize(salon.location).includes(targetDistrict)) return false;
    }

    // 3. Type/Category Filter (from URL)
    if (typeParam && typeParam !== 'all') {
        const typeSlug = normalize(typeParam);

        // Find ID from slug if possible
        const targetType = MOCK_SALON_TYPES.find(t => normalize(t.slug) === typeSlug || normalize(t.id) === typeSlug);

        if (targetType) {
            // Strict ID check if available in salon data
            if (salon.typeIds && salon.typeIds.length > 0) {
                if (!salon.typeIds.includes(targetType.id)) return false;
            } else {
                // Fallback to name check in tags
                const normalizedTagName = normalize(targetType.name);
                if (!salon.tags.some(t => normalize(t) === normalizedTagName)) return false;
            }
        } else {
            // Fallback: Fuzzy check against tags/slug
            const salonTags = salon.tags.map(t => normalize(t));
            const isMatch = salonTags.some(tag => {
                 if (typeSlug === 'kuafor' && tag.includes('kuaför')) return true;
                 if (typeSlug === 'sac' && tag.includes('saç')) return true;
                 return tag.includes(typeSlug);
            });
            if (!isMatch) return false;
        }
    }

    // 4. Search Term Filter (Context Aware)
    if (localSearch) {
        const term = normalize(localSearch);

        // Use modeParam to be specific if provided
        if (modeParam === 'salon') {
             // Strict Name Search
             if (!normalize(salon.name).includes(term)) return false;
        } else if (modeParam === 'type' || modeParam === 'service') {
             // Tag/Category/Service Search
             const matchesTags = salon.tags.some(t => normalize(t).includes(term));
             // Also check services implicitly if we had deep service data here, but tags cover most
             if (!matchesTags) return false;
        } else {
             // Generic Fallback (Name OR Tags)
             const matchesName = normalize(salon.name).includes(term);
             const matchesTags = salon.tags.some(t => normalize(t).includes(term));
             if (!matchesName && !matchesTags) return false;
        }
    }
    return true;
  });

  const visibleSalons = filteredSalons.slice(0, visibleCount);
  const handleLoadMore = () => setVisibleCount(prev => prev + 5);

  // Popular Services List
  const popularServices = Array.from(new Set(MOCK_SERVICES.map(s => s.name))).sort().slice(0, 30);

  // --- Safe Map Center Calculation ---
  const defaultCenter = { lat: 41.0082, lng: 28.9784 }; // Istanbul

  // Safeguard: Ensure CITY_COORDINATES["İstanbul"] exists, if not use hardcoded default
  const ISTANBUL_KEY = "İstanbul";
  const istanbulCoords = CITY_COORDINATES[ISTANBUL_KEY] || defaultCenter;

  const targetCityCoords = CITY_COORDINATES[selectedCity];
  // If we have filtered salons, try to center on the first one
  const firstSalonCoords = filteredSalons.length > 0 && filteredSalons[0].coordinates ? filteredSalons[0].coordinates : null;

  const mapCenterRaw = firstSalonCoords || targetCityCoords || istanbulCoords;

  // Robust conversion to numbers and check validity
  const finalLat = isValidLatLng(mapCenterRaw?.lat, mapCenterRaw?.lng) ? Number(mapCenterRaw.lat) : defaultCenter.lat;
  const finalLng = isValidLatLng(mapCenterRaw?.lat, mapCenterRaw?.lng) ? Number(mapCenterRaw.lng) : defaultCenter.lng;

  const safeMapCenter = {
      lat: finalLat,
      lng: finalLng
  };

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
          MOCK_SALON_TYPES.forEach(t => {
              if (normalize(t.name).includes(term)) {
                  newSuggestions.push({ type: 'category', text: t.name, id: t.slug }); // Pass slug for filtering
              }
          });
      }

      // 3. Services (Only if tab is Service or Generic)
      if (activeTab === 'service') {
          const matchedServices = Array.from(new Set(MOCK_SERVICES.filter(s => normalize(s.name).includes(term)).map(s => s.name))).slice(0, 5);
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
  if (isSearchMode) {
      return (
          <Layout>
              {/* Fixed Layout Container: Header is handled by Layout, we handle the rest full height */}
              <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-background">

                  {/* Left Side: Scrollable List */}
                  <div className="w-full lg:w-[500px] xl:w-[550px] flex flex-col border-r border-border bg-white shadow-xl z-20 shrink-0 h-full">

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
                                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                                      {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                  </select>
                                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">expand_more</span>
                              </div>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                              <span className="text-xs font-bold text-text-main">{filteredSalons.length} işletme bulundu</span>
                              <Link href="/" onClick={() => { setLocalSearch(''); setSelectedCity('Tümü'); }} className="text-xs text-primary font-bold hover:underline">Temizle & Çık</Link>
                          </div>
                      </div>

                      {/* Salon List */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 bg-gray-50/50">
                          {loading ? (
                              <div className="space-y-4">
                                  {[1,2,3,4].map(i => <div key={i} className="h-40 bg-white animate-pulse rounded-2xl border border-gray-100"></div>)}
                              </div>
                          ) : (
                              <>
                                  {visibleSalons.map(salon => (
                                      <Link
                                          href={`/salon/${salon.id}`}
                                          key={salon.id}
                                          onMouseEnter={() => setHoveredSalonId(salon.id)}
                                          onMouseLeave={() => setHoveredSalonId(null)}
                                          className={`group bg-white rounded-2xl border p-4 flex gap-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg ${hoveredSalonId === salon.id ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-primary/30'}`}
                                      >
                                          <div className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                              <img src={salon.image} alt={salon.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                              {salon.isSponsored && <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-primary text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">Öne Çıkan</div>}
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
                                                      {salon.tags.slice(0, 2).map(tag => (
                                                          <span key={tag} className="text-[10px] text-text-secondary bg-gray-100 px-2 py-1 rounded-md font-medium">{tag}</span>
                                                      ))}
                                                      {salon.tags.length > 2 && <span className="text-[10px] text-text-muted bg-gray-50 px-2 py-1 rounded-md">+ {salon.tags.length - 2}</span>}
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
                                          className="w-full py-4 text-sm font-bold text-text-main border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm flex items-center justify-center gap-2"
                                      >
                                          Daha Fazla Göster <span className="material-symbols-outlined text-lg">expand_more</span>
                                      </button>
                                  )}

                                  {filteredSalons.length === 0 && (
                                      <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                                          <div className="bg-gray-100 p-4 rounded-full mb-4">
                                              <span className="material-symbols-outlined text-4xl opacity-50">store_off</span>
                                          </div>
                                          <p className="font-bold text-text-main">Sonuç bulunamadı</p>
                                          <p className="text-sm mt-1">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
                                          <button onClick={() => { setLocalSearch(''); setSelectedCity('Tümü'); setSelectedDistrict('Tümü'); }} className="mt-4 text-primary text-sm font-bold hover:underline">Filtreleri Temizle</button>
                                      </div>
                                  )}
                              </>
                          )}
                      </div>
                  </div>

                  {/* Right Side: Map (Hidden on mobile initially, visible on desktop) */}
                  <div className="hidden lg:block flex-1 relative bg-gray-100 h-full z-0">
                       <SalonMap
                           center={safeMapCenter}
                           salons={filteredSalons}
                           hoveredSalonId={hoveredSalonId}
                           onSalonHover={setHoveredSalonId}
                       />

                       {/* Floating Map Controls */}
                       <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-[400]">
                           <button className="size-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:text-primary transition-colors border border-gray-100" onClick={() => {}} title="Konumum">
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
              Güzelliğin <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">Yeni Adresi</span>
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
                        {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
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
                  <button className="flex items-center gap-1 hover:text-primary transition-colors font-medium" onClick={() => {}}>
                      <span className="material-symbols-outlined text-sm">my_location</span>
                      Yakınımda Ara
                  </button>
                  <span className="mx-2 opacity-30">|</span>
                  <span className="hidden sm:inline opacity-70">Popüler: </span>
                  {CATEGORIES.slice(0, 3).map(cat => (
                       <Link key={cat} href={`/?type=${MOCK_SALON_TYPES.find(t => t.name === cat)?.slug}`} className="hover:text-primary hover:underline font-medium">{cat}</Link>
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
                                {salon.isSponsored && (
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
                                        {salon.tags.slice(0, 3).map(t => (
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
                {MOCK_SALON_TYPES.slice(0, 8).map((type) => (
                    <Link href={`/?type=${type.slug}`} key={type.id} className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 bg-white">
                        {/* Background Image */}
                        <div
                           className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                           style={{ backgroundImage: `url("${type.image}")` }}
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
