'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface AdminSalonMapProps {
    center: [number, number];
    zoom?: number;
    onLocationSelect?: (lat: number, lng: number) => void;
    markerPosition?: { lat: number; lng: number } | null;
}

// Sub-component to handle map clicks
const MapEvents = ({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            if (onLocationSelect) {
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
};

// Map Viewport Updater
const MapViewUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMapEvents({});
    useEffect(() => {
        if (center[0] && center[1]) {
            map.setView(center as L.LatLngExpression, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const AdminSalonMap = ({ center, zoom = 13, onLocationSelect, markerPosition }: AdminSalonMapProps) => {
    // Custom Marker Icon for Admin Map
    const adminIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #6366f1; width: 24px; height: 24px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <MapViewUpdater center={center} />
            <MapEvents onLocationSelect={onLocationSelect} />
            {markerPosition && (
                <Marker
                    position={[markerPosition.lat, markerPosition.lng]}
                    icon={adminIcon}
                    draggable={true}
                    eventHandlers={{
                        dragend: (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            if (onLocationSelect) {
                                onLocationSelect(position.lat, position.lng);
                            }
                        }
                    }}
                />
            )}
        </MapContainer>
    );
};

export default AdminSalonMap;
