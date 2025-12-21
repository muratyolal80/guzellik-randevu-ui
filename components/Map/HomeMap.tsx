
'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Salon } from '@/types';

// --- Fix Leaflet Default Icons in Next.js ---
// Leaflet icons often break in Next.js/Webpack environments without this fix
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface HomeMapProps {
  center: { lat: number; lng: number };
  salons: Salon[];
  hoveredSalonId: string | null;
  setHoveredSalonId: (id: string | null) => void;
  onMarkerClick: (id: string) => void;
}

// --- Helper: Strict Coordinate Validation ---
const isValidLatLng = (lat: any, lng: any): boolean => {
    const numLat = Number(lat);
    const numLng = Number(lng);
    return !isNaN(numLat) && !isNaN(numLng) && isFinite(numLat) && isFinite(numLng);
};

// --- Map Updater Component ---
const MapUpdater: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (isValidLatLng(center?.lat, center?.lng)) {
            map.flyTo([center.lat, center.lng], 12, { duration: 2 });
        }
    }, [center, map]);
    return null;
};

// --- Custom Marker Icon ---
const createCustomIcon = (price: number, isHovered: boolean) => {
    return L.divIcon({
        className: 'custom-pin',
        html: `
            <div class="relative transition-all duration-300 ${isHovered ? 'scale-110 z-50' : 'scale-100 z-10'}">
                <div class="flex items-center justify-center px-3 py-1.5 bg-white border-2 ${isHovered ? 'border-[#C59F59] text-[#C59F59]' : 'border-gray-800 text-gray-900'} rounded-xl shadow-lg font-bold text-sm whitespace-nowrap">
                    ${price} ₺
                </div>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b-2 border-r-2 ${isHovered ? 'border-[#C59F59]' : 'border-gray-800'} transform rotate-45"></div>
            </div>
        `,
        iconSize: [60, 40],
        iconAnchor: [30, 40],
        popupAnchor: [0, -45],
    });
};

const HomeMap: React.FC<HomeMapProps> = ({ center, salons, hoveredSalonId, setHoveredSalonId, onMarkerClick }) => {
    // Ensure the center passed to MapContainer is valid
    const safeCenter = isValidLatLng(center.lat, center.lng) 
        ? [center.lat, center.lng] as [number, number] 
        : [41.0082, 28.9784] as [number, number];

    return (
        <MapContainer center={safeCenter} zoom={12} scrollWheelZoom={true} className="h-full w-full outline-none z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapUpdater center={center} />
            
            {salons.map(salon => {
                // Strict Coordinate Validation per Marker
                if (!salon.coordinates || !isValidLatLng(salon.coordinates.lat, salon.coordinates.lng)) {
                    return null;
                }
                const salonLat = Number(salon.coordinates.lat);
                const salonLng = Number(salon.coordinates.lng);

                return (
                    <Marker 
                        key={salon.id} 
                        position={[salonLat, salonLng]}
                        icon={createCustomIcon(salon.startPrice, hoveredSalonId === salon.id)}
                        eventHandlers={{
                            mouseover: () => setHoveredSalonId(salon.id),
                            mouseout: () => setHoveredSalonId(null),
                            click: () => onMarkerClick(salon.id)
                        }}
                    >
                        <Popup className="custom-popup" closeButton={false} offset={[0, -40]}>
                            <div className="p-0 w-48 overflow-hidden rounded-xl shadow-lg border-0">
                                <div className="h-28 bg-cover bg-center relative" style={{ backgroundImage: `url("${salon.image}")` }}>
                                    <div className="absolute top-2 right-2 bg-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm flex items-center gap-0.5">
                                        <span className="text-yellow-500">★</span> {salon.rating}
                                    </div>
                                </div>
                                <div className="p-3 bg-white">
                                    <h3 className="font-bold text-sm text-gray-900 truncate mb-1">{salon.name}</h3>
                                    <p className="text-[10px] text-gray-500 truncate mb-2">{salon.district}</p>
                                    <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                                        <span className="text-[#C59F59] font-bold text-sm">{salon.startPrice} ₺</span>
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

export default HomeMap;
