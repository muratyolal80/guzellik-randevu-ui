'use client';

import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { FavoriteService } from '@/services/db';
import { supabase } from '@/lib/supabase';

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFavorites() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Use the service which joins with salon_details view for rich data (ratings etc.)
                // Note: Ensure foreign key exists between favorites.salon_id and salon_details.id (view) 
                // typically views don't have FKs, so we might need a two-step fetch if join fails.
                // Let's rely on standard logic: fetch favs -> get IDs -> fetch salon details

                // Fetch basic favs
                const { data: favs } = await supabase
                    .from('favorites')
                    .select('id, salon_id')
                    .eq('user_id', user.id);

                if (favs && favs.length > 0) {
                    const salonIds = favs.map((f: any) => f.salon_id);
                    // Fetch details from view
                    const { data: details } = await supabase
                        .from('salon_details')
                        .select('*')
                        .in('id', salonIds);

                    // Merge
                    const fullData = details?.map((d: any) => ({
                        id: favs.find((f: any) => f.salon_id === d.id)?.id || 'temp', // we don't need fav id much
                        salon: d
                    }));
                    setFavorites(fullData || []);
                } else {
                    setFavorites([]);
                }

            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchFavorites();
    }, []);

    const removeFavorite = async (salonId: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (!confirm('Bu salonu favorilerinizden çıkarmak istediğinize emin misiniz?')) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await FavoriteService.toggleFavorite(user.id, salonId);

            // Update local state immediately (remove item)
            // Note: toggleFavorite returns true if added, false if removed. 
            // Since we are removing, valid case is false, but we force remove here.
            // Actually toggle logic might re-add if we clicked remove button.
            // Let's use delete explicitly if we want to be safe, or logic:
            // Since it's favorites page, we know it's already favored. Toggle will remove it.
            setFavorites(prev => prev.filter((f: any) => f.salon.id !== salonId));

        } catch (error) {
            console.error('Error removing favorite:', error);
            alert('Favori silinirken bir hata oluştu.');
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900">Favori Salonlarım</h1>
                <p className="text-gray-500">Beğendiğiniz ve takip ettiğiniz işletmeler.</p>
            </div>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav) => (
                        <div key={fav.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            {/* Image Container */}
                            <div className="h-48 relative overflow-hidden bg-gray-100">
                                <img
                                    src={fav.salon?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400'}
                                    alt={fav.salon?.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <button
                                    onClick={(e) => removeFavorite(fav.salon.id, e)}
                                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-red-500 transition-colors"
                                >
                                    <Heart className="w-5 h-5 fill-current" />
                                </button>
                                {/* Rating */}
                                <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                    <Star className="w-3 h-3 fill-current" /> {fav.salon?.average_rating || 0}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{fav.salon?.name}</h3>
                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {fav.salon?.district?.name}, {fav.salon?.city?.name}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Link href={`/salon/${fav.salon?.id}`} className="flex items-center justify-center py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
                                        İncele
                                    </Link>
                                    <button className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 shadow-sm shadow-amber-200 transition-colors text-sm">
                                        Randevu Al
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Henüz Favoriniz Yok</h3>
                    <p className="text-gray-500 mt-1">Salonları inceleyerek beğendiklerinizi buraya ekleyebilirsiniz.</p>
                </div>
            )}
        </div>
    );
}
