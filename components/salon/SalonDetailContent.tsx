'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Layout } from '@/components/Layout';
import { GeminiChat } from '@/components/GeminiChat';
import { SalonDataService, ReviewService, ServiceService, FavoriteService, GalleryService, StaffReviewService } from '@/services/db';
import { SalonDetail, Review, SalonServiceDetail, SalonWorkingHours, Favorite, Appointment, StaffReview, SalonGallery } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import GallerySlider from '@/components/GallerySlider';
import ImageUpload from '@/components/ImageUpload';
import Skeleton from '@/components/Skeleton';
import Lightbox from '@/components/common/Lightbox';

// Dynamically import Map component with no SSR
const SalonMap = dynamic(
    () => import('@/components/Map/SalonMap').then((mod) => mod.SalonMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-text-muted text-xs">Harita yükleniyor...</p>
                </div>
            </div>
        )
    }
);

interface SalonDetailContentProps {
    salonId: string;
}

export function SalonDetailContent({ salonId }: SalonDetailContentProps) {
    const { user } = useAuth();
    const { setSalon: setBookingSalon, setSelectedService } = useBooking();

    const [salon, setSalon] = useState<SalonDetail | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [services, setServices] = useState<SalonServiceDetail[]>([]);
    const [workingHours, setWorkingHours] = useState<SalonWorkingHours[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [togglingFavorite, setTogglingFavorite] = useState(false);

    // Review Verification States
    const [eligibleAppointments, setEligibleAppointments] = useState<Appointment[]>([]);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');

    // Review Form States
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'services' | 'staff-reviews'>('services');
    const [staffReviews, setStaffReviews] = useState<StaffReview[]>([]);
    const [loadingStaffReviews, setLoadingStaffReviews] = useState(false);
    const [gallery, setGallery] = useState<SalonGallery[]>([]);
    const [reviewImagesUrls, setReviewImagesUrls] = useState<string[]>([]);

    // Lightbox for Review Images State
    const [lightboxState, setLightboxState] = useState<{
        isOpen: boolean;
        images: string[];
        currentIndex: number;
    }>({
        isOpen: false,
        images: [],
        currentIndex: 0
    });

    const fetchStaffReviews = async () => {
        try {
            setLoadingStaffReviews(true);
            const data = await StaffReviewService.getReviewsBySalon(salonId);
            setStaffReviews(data);
        } catch (error) {
            console.error('Error fetching staff reviews:', error);
        } finally {
            setLoadingStaffReviews(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'staff-reviews' && salonId) {
            fetchStaffReviews();
        }
    }, [activeTab, salonId]);

    const fetchData = async () => {
        if (!salonId) return;
        setLoading(true);
        const [salonData, reviewsData, servicesData, hoursData, galleryData] = await Promise.all([
            SalonDataService.getSalonById(salonId),
            ReviewService.getReviewsBySalon(salonId),
            ServiceService.getServicesBySalon(salonId),
            SalonDataService.getSalonWorkingHours(salonId),
            GalleryService.getSalonGallery(salonId)
        ]);

        if (salonData) {
            setSalon(salonData);
            setBookingSalon(salonData);

            if (user) {
                const favStatus = await FavoriteService.isFavorite(user.id, salonData.id);
                setIsFavorite(favStatus);

                try {
                    const appointments = await ReviewService.getReviewableAppointments(user.id, salonData.id);
                    setEligibleAppointments(appointments);
                    if (appointments.length > 0) {
                        setSelectedAppointmentId(appointments[0].id);
                    }
                } catch (err) {
                    console.error('Failed to fetch eligible appointments', err);
                }
            }
        }
        setReviews(reviewsData);
        setServices(servicesData);
        setWorkingHours(hoursData);
        setGallery(galleryData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [salonId, user?.id]);

    const handleToggleFavorite = async () => {
        if (!user || !salon) {
            alert("Favorilere eklemek için giriş yapmalısınız.");
            return;
        }

        try {
            setTogglingFavorite(true);
            const newState = await FavoriteService.toggleFavorite(user.id, salon.id);
            setIsFavorite(newState);
        } catch (error) {
            console.error("Favori işlemi sırasında hata:", error);
        } finally {
            setTogglingFavorite(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !salon) return;

        if (!selectedAppointmentId) {
            alert("Lütfen değerlendirmek istediğiniz hizmeti seçiniz.");
            return;
        }

        if (newRating === 0) {
            alert("Lütfen bir puan seçiniz.");
            return;
        }

        setSubmitting(true);
        try {
            const newReviewData = await ReviewService.createReview({
                salon_id: salon.id,
                user_id: user.id,
                user_name: `${user.first_name || ''} ${(user.last_name || '').charAt(0)}.`.trim(),
                user_avatar: user.avatar_url,
                rating: newRating,
                comment: newComment,
                appointment_id: selectedAppointmentId
            });

            if (reviewImagesUrls.length > 0) {
                await Promise.all(reviewImagesUrls.map(url =>
                    GalleryService.addReviewImage({
                        review_id: newReviewData.id,
                        image_url: url
                    })
                ));
            }

            fetchData(); // Refresh all data
            setShowReviewForm(false);
            setNewRating(0);
            setNewComment('');
            setReviewImagesUrls([]);
        } catch (error: any) {
            console.error("Yorum eklenirken hata oluştu:", error);
            alert(`Yorum eklenirken hata oluştu: ${error?.message || "Lütfen tekrar deneyin"}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !salon) {
        return (
            <div className="bg-background min-h-screen">
                <Skeleton className="h-[480px] w-full rounded-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-[32px] p-8 md:p-10 border border-border shadow-card mb-8">
                                <Skeleton className="h-10 w-2/3 mb-4" />
                                <div className="flex flex-wrap gap-4 mb-6"><Skeleton className="h-6 w-32" /><Skeleton className="h-6 w-48" /></div>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="bg-white p-6 rounded-2xl border border-border"><Skeleton className="h-20 w-full" /></div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const groupedServices = services.reduce((acc: Record<string, SalonServiceDetail[]>, service) => {
        const category = service.category_name || 'Diğer';
        if (!acc[category]) acc[category] = [];
        acc[category].push(service);
        return acc;
    }, {} as Record<string, SalonServiceDetail[]>);

    const getDayName = (dayIdx: number) => {
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        return days[dayIdx];
    };

    return (
        <Layout>
            {/* Profesyonel Hero Bölümü */}
            <div className="relative h-[480px] w-full group">
                {gallery.length > 0 ? (
                    <GallerySlider images={gallery} salonName={salon.name} />
                ) : (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url("${salon.image}")` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                {salon.is_sponsored && <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-md">ÖNERİLEN</span>}
                                <div className="flex items-center gap-1.5 text-sm font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white border border-white/20">
                                    <span className="material-symbols-outlined text-base filled text-yellow-400">star</span>
                                    {salon.rating || salon.average_rating} <span className="text-gray-300 font-normal">({reviews.length})</span>
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tight leading-none drop-shadow-lg">{salon.name}</h1>
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm w-fit text-white text-sm">
                                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                {salon.neighborhood}, {salon.district_name}, {salon.city_name}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleToggleFavorite}
                                disabled={togglingFavorite}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl border backdrop-blur-md transition-all font-bold ${isFavorite ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white/20 hover:bg-white/30 border-white/20 text-white'}`}
                            >
                                <span className={`material-symbols-outlined text-xl ${isFavorite ? 'filled' : ''}`}>favorite</span>
                                {isFavorite ? 'Kaydedildi' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
                        {/* Hakkında */}
                        <section className="bg-white rounded-3xl p-8 border border-border shadow-card">
                            <h3 className="text-2xl font-display font-bold text-text-main mb-6 flex items-center gap-3">
                                <span className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-symbols-outlined">storefront</span></span>
                                Hakkında
                            </h3>
                            <p className="text-text-secondary leading-relaxed">{salon.description}</p>
                        </section>

                        {/* Hizmetler */}
                        <section>
                            <h3 className="text-2xl font-display font-bold text-text-main mb-8 flex items-center gap-3">
                                <span className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-symbols-outlined">content_cut</span></span>
                                Hizmetler
                            </h3>
                            <div className="space-y-6">
                                {Object.entries(groupedServices).map(([category, items]) => (
                                    <div key={category} className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                                        <div className="p-6 bg-surface-alt font-black uppercase text-text-main border-b border-border">{category}</div>
                                        <div className="p-4 space-y-2">
                                            {items.map((service) => (
                                                <div key={service.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20 group">
                                                    <div>
                                                        <h4 className="font-bold text-text-main group-hover:text-primary transition-colors">{service.service_name}</h4>
                                                        <p className="text-xs text-text-muted font-bold">{service.duration_min} dk</p>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <span className="text-lg font-black text-text-main">₺{service.price}</span>
                                                        <Link
                                                            href={`/booking/staff?salonId=${salon.id}&serviceId=${service.id}`}
                                                            onClick={() => setSelectedService(service)}
                                                            className="px-6 py-2.5 bg-primary text-white text-sm font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                                        >
                                                            Al
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Yorumlar (Basitleştirilmiş) */}
                        <section className="space-y-6">
                            <h3 className="text-2xl font-display font-bold text-text-main flex items-center gap-3">
                                <span className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-symbols-outlined">rate_review</span></span>
                                Yorumlar ({reviews.length})
                            </h3>
                            <div className="bg-white rounded-3xl border border-border shadow-card divide-y divide-gray-100">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {review.user_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-sm text-text-main">{review.user_name}</h5>
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={`material-symbols-outlined text-xs ${i < review.rating ? 'filled' : ''}`}>star</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-text-muted">{new Date(review.created_at || '').toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-3xl p-6 border border-border shadow-card">
                            <h4 className="font-bold text-text-main mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">pin_drop</span> Konum
                            </h4>
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 border border-border relative">
                                {salon.geo_latitude && (
                                    <SalonMap
                                        center={{ lat: salon.geo_latitude, lng: salon.geo_longitude }}
                                        salons={[{ ...salon, coordinates: { lat: salon.geo_latitude, lng: salon.geo_longitude } }]}
                                    />
                                )}
                            </div>
                            <p className="text-xs text-text-secondary">{salon.neighborhood}, {salon.district_name}, {salon.city_name}</p>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-border shadow-card">
                            <h4 className="font-bold text-text-main mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">schedule</span> Çalışma Saatleri
                            </h4>
                            <div className="space-y-3">
                                {workingHours.map((hour, idx) => (
                                    <div key={idx} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-text-secondary">{getDayName(hour.day_of_week)}</span>
                                        <span className="font-bold">{hour.is_closed ? 'Kapalı' : `${hour.start_time.substring(0, 5)} - ${hour.end_time.substring(0, 5)}`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <GeminiChat />
            <Lightbox
                isOpen={lightboxState.isOpen}
                images={lightboxState.images}
                currentIndex={lightboxState.currentIndex}
                onClose={() => setLightboxState(prev => ({ ...prev, isOpen: false }))}
                onNext={() => setLightboxState(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length }))}
                onPrev={() => setLightboxState(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length }))}
            />
        </Layout>
    );
}
