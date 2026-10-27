'use client';

import React, { useEffect, useState } from 'react';
import { Star, MapPin, Calendar, ExternalLink, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import Skeleton from '@/components/Skeleton';
import { supabase } from '@/lib/supabase';
import { ReviewService } from '@/services/db';
import type { CustomerReviewItem } from '@/types';
import Link from 'next/link';

export default function ReviewsPage() {
    const { showToast } = useToast();
    const [reviews, setReviews] = useState<CustomerReviewItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                setReviews(await ReviewService.getReviewsByUser(user.id));

            } catch (error) {
                console.error('Error fetching reviews:', error);
                showToast('Değerlendirmeler yüklenemedi.', 'error');
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, [showToast]);

    if (loading) {
        return (
            <div className="space-y-6 max-w-5xl" aria-busy="true" aria-label="Yükleniyor">
                <div className="space-y-2"><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-72" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Değerlendirmelerim</h1>
                    <p className="text-gray-500 text-sm mt-1">Hizmet aldığınız salonlar hakkındaki görüşleriniz.</p>
                </div>
                <Link href="/customer/appointments" className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary font-bold shadow-lg shadow-amber-200 transition-all active:scale-95 text-sm flex items-center justify-center">
                    Yeni Değerlendirme Yap
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.length > 0 ? reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-4">
                                <div className="size-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={review.salon?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=100'}
                                        alt={review.salon?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{review.salon?.name}</h3>
                                    <div className="flex items-center text-gray-500 text-xs mt-0.5">
                                        <MapPin className="w-3 h-3 mr-1" aria-hidden="true" />
                                        {review.salon?.district?.name}, {review.salon?.city?.name}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                {new Date(review.created_at).toLocaleDateString('tr-TR')}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                                />
                            ))}
                            <span className="ml-2 text-sm font-bold text-primary">{review.rating}.0</span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 relative">
                            <MessageSquare className="w-4 h-4 text-gray-300 absolute top-4 right-4" aria-hidden="true" />
                            <p className="text-gray-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Link href={`/salon/${review.salon?.id}`} className="text-xs font-bold text-primary hover:text-primary flex items-center">
                                Salonu Görüntüle <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="size-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                            <Star className="w-8 h-8 text-primary" aria-hidden="true" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Henüz değerlendirmeniz yok</h3>
                        <p className="text-gray-500 text-sm mt-2 max-w-sm">
                            Geçmiş randevularınızı değerlendirerek diğer kullanıcılara yardımcı olabilirsiniz.
                        </p>
                        <Link href="/customer/appointments" className="mt-6 text-primary font-bold text-sm hover:underline">
                            Geçmiş Randevularıma Git
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
