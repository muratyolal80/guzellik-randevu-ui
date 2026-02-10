/**
 * Geocoding Service using OpenStreetMap Nominatim (Free)
 */

export interface GeocodingResult {
    lat: number;
    lon: number;
    display_name: string;
}

export const GeocodingService = {
    /**
     * Search coordinates by address string
     */
    async searchAddress(address: string): Promise<GeocodingResult | null> {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
            const response = await fetch(url, {
                headers: {
                    'Accept-Language': 'tr-TR,tr;q=0.9',
                    'User-Agent': 'GuzellikRandevuApp' // Nominatim requires a user agent
                }
            });
            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    display_name: data[0].display_name
                };
            }
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    }
};
