(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/Map/SalonMap.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SalonMap",
    ()=>SalonMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/MapContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/TileLayer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Marker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/hooks.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// Helper: Strict Coordinate Validation
const isValidLatLng = (lat, lng)=>{
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
const MapUpdater = ({ center, hoveredSalonId, salons })=>{
    _s();
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"])();
    // Fix: Invalidate size on mount/updates to prevent grey areas
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapUpdater.useEffect": ()=>{
            map.invalidateSize();
        }
    }["MapUpdater.useEffect"], [
        map,
        center
    ]);
    // Fly to city center
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapUpdater.useEffect": ()=>{
            if (center && !hoveredSalonId) {
                if (!isValidLatLng(center.lat, center.lng)) {
                    console.error('MapUpdater received invalid center coordinates:', center);
                    return;
                }
                const lat = Number(center.lat);
                const lng = Number(center.lng);
                // Double-check after conversion
                if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
                    console.error('Coordinates became NaN after Number conversion:', {
                        original: center,
                        converted: {
                            lat,
                            lng
                        }
                    });
                    return;
                }
                map.flyTo([
                    lat,
                    lng
                ], 12, {
                    duration: 2
                });
            }
        }
    }["MapUpdater.useEffect"], [
        center,
        map,
        hoveredSalonId
    ]);
    // Fly to hovered salon
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapUpdater.useEffect": ()=>{
            if (hoveredSalonId) {
                const salon = salons.find({
                    "MapUpdater.useEffect.salon": (s)=>s.id === hoveredSalonId
                }["MapUpdater.useEffect.salon"]);
                if (salon && isValidLatLng(salon.coordinates?.lat, salon.coordinates?.lng)) {
                    map.flyTo([
                        Number(salon.coordinates.lat),
                        Number(salon.coordinates.lng)
                    ], 14, {
                        duration: 1.5,
                        easeLinearity: 0.25
                    });
                }
            }
        }
    }["MapUpdater.useEffect"], [
        hoveredSalonId,
        map,
        salons
    ]);
    return null;
};
_s(MapUpdater, "OhiT3lNApSksMqMaIneO3P2U9+0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"]
    ];
});
_c = MapUpdater;
// Custom Marker Icon (Water Droplet with G Logo)
const createCustomIcon = (isHovered)=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["divIcon"]({
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
        iconSize: [
            40,
            52
        ],
        iconAnchor: [
            20,
            52
        ],
        popupAnchor: [
            0,
            -60
        ]
    });
};
const SalonMarker = ({ salon, isHovered, onHover, onClick })=>{
    _s1();
    const markerRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useRef(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SalonMarker.useEffect": ()=>{
            if (markerRef.current) {
                if (isHovered) {
                    markerRef.current.openTooltip();
                } else {
                    markerRef.current.closeTooltip();
                }
            }
        }
    }["SalonMarker.useEffect"], [
        isHovered
    ]);
    if (!isValidLatLng(salon.coordinates?.lat, salon.coordinates?.lng)) {
        return null;
    }
    const salonLat = Number(salon.coordinates?.lat);
    const salonLng = Number(salon.coordinates?.lng);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
        ref: markerRef,
        position: [
            salonLat,
            salonLng
        ],
        icon: createCustomIcon(isHovered),
        zIndexOffset: isHovered ? 1000 : 0,
        eventHandlers: {
            mouseover: ()=>onHover(salon.id),
            mouseout: ()=>onHover(null),
            click: onClick
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
            direction: "top",
            offset: [
                0,
                -70
            ],
            opacity: 1,
            permanent: true,
            interactive: true,
            className: "!bg-transparent !border-0 !shadow-none !p-0 leaflet-tooltip-custom",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-72 overflow-hidden rounded-2xl shadow-2xl border-0 bg-white ring-1 ring-black/5 transform transition-all duration-300 origin-bottom cursor-pointer group",
                style: {
                    pointerEvents: 'auto'
                },
                onClick: (e)=>{
                    e.stopPropagation(); // Prevent map click
                    onClick();
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-36 bg-cover bg-center relative",
                        style: {
                            backgroundImage: `url("${salon.image}")`
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                            }, void 0, false, {
                                fileName: "[project]/components/Map/SalonMap.tsx",
                                lineNumber: 171,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px] filled text-yellow-500",
                                        children: "star"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Map/SalonMap.tsx",
                                        lineNumber: 173,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    " ",
                                    salon.rating
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Map/SalonMap.tsx",
                                lineNumber: 172,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            salon.is_sponsored && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-3 left-3 bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider shadow-sm",
                                children: "Öne Çıkan"
                            }, void 0, false, {
                                fileName: "[project]/components/Map/SalonMap.tsx",
                                lineNumber: 176,
                                columnNumber: 29
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Map/SalonMap.tsx",
                        lineNumber: 170,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 bg-white relative z-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-display font-bold text-lg text-gray-900 truncate mb-1 leading-tight",
                                children: salon.name
                            }, void 0, false, {
                                fileName: "[project]/components/Map/SalonMap.tsx",
                                lineNumber: 182,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-gray-500 truncate mb-4 flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px] text-primary",
                                        children: "location_on"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Map/SalonMap.tsx",
                                        lineNumber: 184,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    typeof salon.district === 'object' ? '' : String(salon.district || salon.district_name || ''),
                                    salon.district || salon.district_name ? ', ' : '',
                                    typeof salon.city_name === 'object' ? '' : String(salon.city_name || '')
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Map/SalonMap.tsx",
                                lineNumber: 183,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center border-t border-gray-100 pt-3 mt-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-gray-400 font-bold uppercase tracking-wide",
                                                children: "Başlangıç"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Map/SalonMap.tsx",
                                                lineNumber: 189,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-primary font-black text-xl",
                                                children: [
                                                    salon.startPrice,
                                                    " ₺"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/Map/SalonMap.tsx",
                                                lineNumber: 190,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Map/SalonMap.tsx",
                                        lineNumber: 188,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2",
                                        children: [
                                            "İncele ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[14px]",
                                                children: "arrow_forward"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Map/SalonMap.tsx",
                                                lineNumber: 193,
                                                columnNumber: 40
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Map/SalonMap.tsx",
                                        lineNumber: 192,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Map/SalonMap.tsx",
                                lineNumber: 187,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Map/SalonMap.tsx",
                        lineNumber: 181,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/Map/SalonMap.tsx",
                lineNumber: 163,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/Map/SalonMap.tsx",
            lineNumber: 155,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/Map/SalonMap.tsx",
        lineNumber: 144,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(SalonMarker, "x5wWyXK0+mHGg2Y0I8gN07knkVQ=");
_c1 = SalonMarker;
const SalonMap = ({ center, salons, hoveredSalonId, onSalonHover })=>{
    _s2();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // Validate center coordinates before initializing map
    const validCenter = isValidLatLng(center.lat, center.lng) ? {
        lat: Number(center.lat),
        lng: Number(center.lng)
    } : {
        lat: 41.0082,
        lng: 28.9784
    }; // Istanbul as fallback
    console.log('SalonMap received center:', center, 'validCenter:', validCenter);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MapContainer"], {
        center: [
            validCenter.lat,
            validCenter.lng
        ],
        zoom: 12,
        scrollWheelZoom: true,
        className: "h-full w-full outline-none z-0",
        attributionControl: false,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TileLayer"], {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            }, void 0, false, {
                fileName: "[project]/components/Map/SalonMap.tsx",
                lineNumber: 215,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapUpdater, {
                center: validCenter,
                hoveredSalonId: hoveredSalonId,
                salons: salons
            }, void 0, false, {
                fileName: "[project]/components/Map/SalonMap.tsx",
                lineNumber: 219,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            salons.map((salon)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SalonMarker, {
                    salon: salon,
                    isHovered: hoveredSalonId === salon.id,
                    onHover: onSalonHover || ((_id)=>{}),
                    onClick: ()=>router.push(`/salon/${salon.id}`)
                }, salon.id, false, {
                    fileName: "[project]/components/Map/SalonMap.tsx",
                    lineNumber: 222,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)))
        ]
    }, void 0, true, {
        fileName: "[project]/components/Map/SalonMap.tsx",
        lineNumber: 214,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s2(SalonMap, "fN7XvhJ+p5oE6+Xlo0NJmXpxjC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c2 = SalonMap;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "MapUpdater");
__turbopack_context__.k.register(_c1, "SalonMarker");
__turbopack_context__.k.register(_c2, "SalonMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Map/SalonMap.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/Map/SalonMap.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_Map_SalonMap_tsx_40fef54b._.js.map