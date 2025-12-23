'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { SalonDetail } from '@/types';
import { useRouter } from 'next/navigation';

// Helper: Strict Coordinate Validation
const isValidLatLng = (lat: any, lng: any): boolean => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
    const numLat = Number(lat);
    const numLng = Number(lng);
    return !isNaN(numLat) && !isNaN(numLng) && isFinite(numLat) && isFinite(numLng);
};

// Updates map center when city changes
const MapUpdater: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        // Strict validation before flying
        if (center && isValidLatLng(center.lat, center.lng)) {
            const lat = Number(center.lat);
            const lng = Number(center.lng);
            map.flyTo([lat, lng], 12, { duration: 2 });
        }
    }, [center, map]);
    return null;
};

// Custom Marker Icon (Water Droplet with G Logo)
const createCustomIcon = (isHovered: boolean) => {
    return L.divIcon({
        className: 'custom-pin',
        html: `
            <div class="relative transition-all duration-300 ${isHovered ? 'scale-125 z-50' : 'scale-100 z-10'}">
    <div class="relative filter drop-shadow-lg">
        <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(180deg);">
            <defs>
                 <linearGradient id="dropletGradient-${isHovered ? 'Hover' : ''}" x1="20" y1="0" x2="20" y2="52">
                    <stop offset="0%" stop-color="${isHovered ? '#D4AF6A' : '#C59F59'}" />
                    <stop offset="100%" stop-color="${isHovered ? '#C59F59' : '#B48F4A'}" />
                </linearGradient>
            </defs>
            <path d="M20 0C20 0 0 20 0 32C0 43.0457 8.95431 52 20 52C31.0457 52 40 43.0457 40 32C40 20 20 0 20 0Z" 
                  fill="url(#dropletGradient-${isHovered ? 'Hover' : ''})" 
                  class="transition-all duration-300"/>
            <path d="M20 0C20 0 0 20 0 32C0 43.0457 8.95431 52 20 52C31.0457 52 40 43.0457 40 32C40 20 20 0 20 0Z" 
                  stroke="white" 
                  stroke-width="2.5" 
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
        iconAnchor: [20, 52], // Tip of the droplet (bottom after rotation, pointing to location)
        popupAnchor: [0, -52],
    });
};

interface SalonMapProps {
    center: { lat: number; lng: number };
    salons: SalonDetail[];
    hoveredSalonId: string | null;
    onSalonHover: (id: string | null) => void;
}

export const SalonMap: React.FC<SalonMapProps> = ({ center, salons, hoveredSalonId, onSalonHover }) => {
    const router = useRouter();

    return (
        <MapContainer center={[center.lat, center.lng]} zoom={12} scrollWheelZoom={true} className="h-full w-full outline-none" attributionControl={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapUpdater center={center} />

            {salons.map(salon => {
                // Strict Coordinate Validation
                if (!isValidLatLng(salon.coordinates?.lat, salon.coordinates?.lng)) {
                    return null;
                }
                const salonLat = Number(salon.coordinates?.lat);
                const salonLng = Number(salon.coordinates?.lng);

                return (
                    <Marker
                        key={salon.id}
                        position={[salonLat, salonLng]}
                        icon={createCustomIcon(hoveredSalonId === salon.id)}
                        eventHandlers={{
                            mouseover: () => onSalonHover(salon.id),
                            mouseout: () => onSalonHover(null),
                            click: () => router.push(`/salon/${salon.id}`)
                        }}
                    >
                        <Popup className="custom-popup" closeButton={false} offset={[0, -52]}>
                            <div className="p-0 w-48 overflow-hidden rounded-xl shadow-lg border-0">
                                <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url("${salon.image}")` }}>
                                    <div className="absolute top-2 right-2 bg-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm flex items-center gap-0.5">
                                        <span className="material-symbols-outlined text-[10px] filled text-yellow-500">star</span> {salon.rating}
                                    </div>
                                </div>
                                <div className="p-3 bg-white">
                                    <h3 className="font-bold text-sm text-gray-900 truncate mb-1">{salon.name}</h3>
                                    <p className="text-[10px] text-gray-500 truncate mb-2">{salon.district}</p>
                                    <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                                        <span className="text-primary font-bold text-sm">{salon.startPrice} ₺</span>
                                        <span className="text-[10px] text-gray-400">başlayan</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

