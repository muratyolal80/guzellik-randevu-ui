'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { SalonDetail } from '@/types';
import { useRouter } from 'next/navigation';

// Helper: Strict Coordinate Validation
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

// Updates map center when city changes or salon is hovered
const MapUpdater: React.FC<{ center: { lat: number; lng: number }, hoveredSalonId: string | null, salons: SalonDetail[] }> = ({ center, hoveredSalonId, salons }) => {
    const map = useMap();

    // Fix: Invalidate size on mount/updates to prevent grey areas
    useEffect(() => {
        map.invalidateSize();
    }, [map, center]);

    // Fly to city center
    useEffect(() => {
        if (center && !hoveredSalonId) {
            // Extra safe parsing
            const lat = typeof center.lat === 'number' ? center.lat : Number(center.lat);
            const lng = typeof center.lng === 'number' ? center.lng : Number(center.lng);

            // Double check everything before flyTo
            if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) && (lat !== 0 || lng !== 0)) {
                try {
                    map.flyTo([lat, lng], 12, { duration: 2 });
                } catch (err) {
                    console.error('Leaflet flyTo failed:', err);
                }
            } else {
                console.warn('MapUpdater: Blocked flyTo with invalid coordinates:', { lat, lng });
            }
        }
    }, [center, map, hoveredSalonId]);

    // Fly to hovered salon
    useEffect(() => {
        if (hoveredSalonId) {
            const salon = salons.find(s => s.id === hoveredSalonId);
            const lat = Number(salon?.coordinates?.lat);
            const lng = Number(salon?.coordinates?.lng);

            if (salon && isValidLatLng(lat, lng)) {
                map.flyTo([lat, lng], 14, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
            }
        }
    }, [hoveredSalonId, map, salons]);

    return null;
};

// Custom Marker Icon (Water Droplet with G Logo)
const createCustomIcon = (isHovered: boolean) => {
    return L.divIcon({
        className: 'custom-pin',
        html: `
            <div class="relative transition-all duration-300 ${isHovered ? 'scale-125 z-[1000] -translate-y-2' : 'scale-100 z-10'}">
    <div class="relative filter ${isHovered ? 'drop-shadow-2xl' : 'drop-shadow-lg'}">
        <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(180deg);">
            <defs>
                 <linearGradient id="dropletGradient-${isHovered ? 'Hover' : ''}" x1="20" y1="0" x2="20" y2="52">
                    <stop offset="0%" stop-color="${isHovered ? '#F59E0B' : '#C59F59'}" />
                    <stop offset="100%" stop-color="${isHovered ? '#D97706' : '#B48F4A'}" />
                </linearGradient>
            </defs>
            <path d="M20 0C20 0 0 20 0 32C0 43.0457 8.95431 52 20 52C31.0457 52 40 43.0457 40 32C40 20 20 0 20 0Z" 
                  fill="url(#dropletGradient-${isHovered ? 'Hover' : ''})" 
                  class="transition-all duration-300"/>
            <path d="M20 0C20 0 0 20 0 32C0 43.0457 8.95431 52 20 52C31.0457 52 40 43.0457 40 32C40 20 20 0 20 0Z" 
                  stroke="${isHovered ? '#FFF' : 'white'}" 
                  stroke-width="${isHovered ? '3' : '2.5'}" 
                  fill="none"/>
        </svg>
        
        <div class="absolute inset-0 flex items-center justify-center pb-3">
            <span class="text-white font-black text-2xl tracking-tight" 
                  style="font-family: 'Inter', sans-serif; text-shadow: 0 1px 2px rgba(0,0,0,0.4);">
                G
            </span>
        </div>
    </div>
</div>
        `,
        iconSize: [40, 52],
        iconAnchor: [20, 52],
        popupAnchor: [0, -60],
    });
};

interface SalonMapProps {
    center: { lat: number; lng: number };
    salons: SalonDetail[];
    hoveredSalonId: string | null;
    onSalonHover: (id: string | null) => void;
}

interface SalonMarkerProps {
    salon: SalonDetail;
    isHovered: boolean;
    onHover: (id: string | null) => void;
    onClick: () => void;
}

const SalonMarker: React.FC<SalonMarkerProps> = ({ salon, isHovered, onHover, onClick }) => {
    const markerRef = React.useRef<L.Marker>(null);

    useEffect(() => {
        if (markerRef.current) {
            if (isHovered) {
                markerRef.current.openTooltip();
            } else {
                markerRef.current.closeTooltip();
            }
        }
    }, [isHovered]);

    if (!isValidLatLng(salon.coordinates?.lat, salon.coordinates?.lng)) {
        return null;
    }

    const salonLat = Number(salon.coordinates?.lat);
    const salonLng = Number(salon.coordinates?.lng);

    return (
        <Marker
            ref={markerRef}
            position={[salonLat, salonLng]}
            icon={createCustomIcon(isHovered)}
            zIndexOffset={isHovered ? 1000 : 0}
            eventHandlers={{
                mouseover: () => onHover(salon.id),
                mouseout: () => onHover(null),
                click: onClick
            }}
        >
            <Tooltip
                direction="top"
                offset={[0, -70]}
                opacity={1}
                permanent={true} // Keep it "permanent" in config so we can manually control it without auto-close
                interactive={true}
                className="!bg-transparent !border-0 !shadow-none !p-0 leaflet-tooltip-custom"
            >
                <div className="w-72 overflow-hidden rounded-2xl shadow-2xl border-0 bg-white ring-1 ring-black/5 transform transition-all duration-300 origin-bottom cursor-pointer group"
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent map click
                        onClick();
                    }}
                >
                    <div className="h-36 bg-cover bg-center relative" style={{ backgroundImage: `url("${salon.image}")` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] filled text-yellow-500">star</span> {salon.rating}
                        </div>
                        {salon.is_sponsored && (
                            <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider shadow-sm">
                                Öne Çıkan
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-white relative z-10">
                        <h3 className="font-display font-bold text-lg text-gray-900 truncate mb-1 leading-tight">{salon.name}</h3>
                        <p className="text-xs text-gray-500 truncate mb-4 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                            {salon.district}, {salon.city_name}
                        </p>
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-1">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Başlangıç</span>
                                <span className="text-primary font-black text-xl">{salon.startPrice} ₺</span>
                            </div>
                            <button className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
                                İncele <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Tooltip>
        </Marker>
    );
};

export const SalonMap: React.FC<SalonMapProps> = ({ center, salons, hoveredSalonId, onSalonHover }) => {
    const router = useRouter();

    // Validate center coordinates before initializing map
    const getValidLatLng = (lat: any, lng: any) => {
        const nLat = Number(lat);
        const nLng = Number(lng);
        if (isValidLatLng(nLat, nLng)) {
            return [nLat, nLng] as [number, number];
        }
        return [41.0082, 28.9784] as [number, number]; // Istanbul as fallback
    };

    const initialCenter = getValidLatLng(center.lat, center.lng);

    console.log('SalonMap received center:', center, 'initialCenter:', initialCenter);

    return (
        <MapContainer center={initialCenter} zoom={12} scrollWheelZoom={true} className="h-full w-full outline-none z-0" attributionControl={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapUpdater center={{ lat: initialCenter[0], lng: initialCenter[1] }} hoveredSalonId={hoveredSalonId} salons={salons} />

            {salons.map(salon => (
                <SalonMarker
                    key={salon.id}
                    salon={salon}
                    isHovered={hoveredSalonId === salon.id}
                    onHover={onSalonHover}
                    onClick={() => router.push(`/salon/${salon.id}`)}
                />
            ))}
        </MapContainer>
    );
};

