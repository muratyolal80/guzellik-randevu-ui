'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Layout } from '@/components/Layout';
import { GeminiChat } from '@/components/GeminiChat';
import { SalonDataService, ReviewService, ServiceService, FavoriteService } from '@/services/db';
import { SalonDetail, Review, SalonServiceDetail, SalonWorkingHours, Favorite, Appointment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';

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

export default function SalonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
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

    // Group services by category
    const groupedServices = services.reduce((acc: Record<string, SalonServiceDetail[]>, service) => {
        const category = service.category_name || 'Diğer';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(service);
        return acc;
    }, {} as Record<string, SalonServiceDetail[]>);

    // State for collapsible categories (default all open)
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
        Object.keys(groupedServices).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            // Fetch salon, reviews, services, and working hours in parallel
            const [salonData, reviewsData, servicesData, hoursData] = await Promise.all([
                SalonDataService.getSalonById(id),
                ReviewService.getReviewsBySalon(id),
                ServiceService.getServicesBySalon(id),
                SalonDataService.getSalonWorkingHours(id)
            ]);

            if (salonData) {
                setSalon(salonData);
                setBookingSalon(salonData); // Store in booking context

                // Fetch favorite status if user logged in
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
            setLoading(false);
        };
        fetchData();
    }, [id, setBookingSalon, user]);

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

    const toggleCategory = (category: string) => {
        setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
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

            setReviews([newReviewData, ...reviews]);
            setShowReviewForm(false);
            setNewRating(0);
            setNewComment('');

            // Remove the reviewed appointment from eligible list
            setEligibleAppointments(prev => prev.filter(a => a.id !== selectedAppointmentId));
            setSelectedAppointmentId('');

            // Re-fetch salon to update average header immediately
            const updatedSalon = await SalonDataService.getSalonById(salon.id);
            if (updatedSalon) setSalon(updatedSalon);

        } catch (error: any) {
            console.error("Yorum eklenirken hata oluştu:", {
                message: error?.message || "Bilinmeyen hata",
                error: error,
                stack: error?.stack,
                details: error?.details || error?.hint || error
            });
            alert(`Yorum eklenirken hata oluştu: ${error?.message || "Lütfen tekrar deneyin"}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !salon) {
        return (
            <Layout>
                <div className="flex h-screen items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-text-secondary">Salon bilgileri yükleniyor...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Calculate rating distribution for UI
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => Math.round(r.rating) === star).length;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return { star, count, percentage };
    });

    // Helper to format day name
    const getDayName = (dayIdx: number) => {
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        return days[dayIdx];
    };

    return (
        <Layout>
            {/* Professional Hero Section */}
            <div className="relative h-[400px] w-full group">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                    style={{ backgroundImage: `url("${salon.image}")` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                {salon.is_sponsored && <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full tracking-wide shadow-md">ÖNERİLEN</span>}
                                <a href="#reviews" className="flex items-center gap-1.5 text-sm font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white border border-white/20 shadow-sm hover:bg-white/30 transition-colors">
                                    <span className="material-symbols-outlined text-base filled text-yellow-400">star</span>
                                    {salon.rating || salon.average_rating} <span className="text-gray-300 font-normal">({reviews.length} Değerlendirme)</span>
                                </a>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tight leading-none drop-shadow-lg">{salon.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-200 text-sm font-medium">
                                <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-primary">location_on</span> {(salon.neighborhood || salon.avenue || salon.street || salon.building_no) ? `${salon.neighborhood ? `${salon.neighborhood}, ` : ''}${salon.avenue ? `${salon.avenue}, ` : ''}${salon.street ? `${salon.street} No:${salon.building_no}` : ''}` : (salon.address || `${salon.district_name}, ${salon.city_name}`)}
                                </span>
                                {salon.tags && salon.tags.length > 0 && (
                                    <span className="flex items-center gap-2">
                                        {salon.tags.map(tag => (
                                            <span key={tag} className="text-gray-300 hover:text-white transition-colors cursor-pointer">#{tag}</span>
                                        ))}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/20 backdrop-blur-md transition-all text-white font-bold group/btn shadow-lg">
                                <span className="material-symbols-outlined text-xl group-hover/btn:scale-110 transition-transform">share</span> <span className="hidden sm:inline">Paylaş</span>
                            </button>
                            <button
                                onClick={handleToggleFavorite}
                                disabled={togglingFavorite}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl border backdrop-blur-md transition-all font-bold group/btn shadow-lg ${isFavorite ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white/20 hover:bg-white/30 border-white/20 text-white'}`}
                            >
                                <span className={`material-symbols-outlined text-xl group-hover/btn:scale-110 transition-transform ${isFavorite ? 'filled' : ''}`}>favorite</span>
                                <span className="hidden sm:inline">{isFavorite ? 'Kaydedildi' : 'Kaydet'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* About Section */}
                        <section className="bg-white rounded-3xl p-8 border border-border shadow-card relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h3 className="text-2xl font-display font-bold text-text-main mb-6 flex items-center gap-3 relative z-10">
                                <span className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-symbols-outlined">storefront</span></span>
                                Hakkında
                            </h3>
                            <p className="text-text-secondary leading-relaxed text-base relative z-10">
                                {salon.description || `${salon.name}, İstanbul'un en prestijli lokasyonunda, uzman kadrosu ve modern ekipmanlarıyla hizmetinizde.`}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
                                {(salon.features && salon.features.length > 0 ? salon.features : ['Wi-Fi', 'İkramlar', 'Otopark', 'Kredi Kartı']).map((feature, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-3 group">
                                        <div className="size-12 rounded-2xl bg-surface-alt border border-border flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
                                            <span className="material-symbols-outlined text-2xl">
                                                {feature.includes('Wi-Fi') ? 'wifi' : feature.includes('İkram') ? 'local_cafe' : feature.includes('Otopark') ? 'local_parking' : feature.includes('Kart') ? 'credit_card' : feature.includes('Klima') ? 'ac_unit' : 'star'}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-text-secondary group-hover:text-text-main transition-colors">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Services Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-display font-bold text-text-main flex items-center gap-3">
                                    <span className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-symbols-outlined">spa</span></span>
                                    Hizmetlerimiz
                                </h3>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(groupedServices).map(([category, services]) => (
                                    <div key={category} className="bg-white rounded-3xl border border-border overflow-hidden shadow-card transition-all duration-300">
                                        <button
                                            onClick={() => toggleCategory(category)}
                                            className="w-full px-6 py-4 bg-gray-50 border-b border-border flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer text-left"
                                        >
                                            <h4 className="text-lg font-bold text-text-main flex items-center gap-3">
                                                <span className={`w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-transform duration-300 ${openCategories[category] ? 'rotate-90' : ''}`}>
                                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                                </span>
                                                {category}
                                            </h4>
                                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider bg-white border border-border px-2 py-1 rounded-md">{services.length} Hizmet</span>
                                        </button>

                                        {/* Accordion Content */}
                                        <div className={`divide-y divide-gray-100 transition-all duration-300 ease-in-out origin-top ${openCategories[category] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            {services.map((service) => (
                                                <div key={service.id} className="group p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-center">
                                                    <div className="flex items-start gap-4 w-full sm:w-auto">
                                                        <div className="hidden sm:flex size-14 rounded-2xl bg-surface-alt border border-border items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/30 transition-all shrink-0">
                                                            <span className="material-symbols-outlined text-2xl">
                                                                {service.category_icon || (category === 'Saç' ? 'content_cut' : category === 'Bakım' ? 'face' : category === 'Tırnak' ? 'brush' : 'spa')}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-base font-bold text-text-main group-hover:text-primary transition-colors mb-1">{service.service_name}</h5>
                                                            <div className="flex items-center gap-3 text-xs text-text-secondary">
                                                                <span className="flex items-center gap-1 bg-surface-alt px-2 py-0.5 rounded border border-border">
                                                                    <span className="material-symbols-outlined text-[14px]">schedule</span> {service.duration_min} dk
                                                                </span>
                                                                <span>•</span>
                                                                <span>Uzman eşliğinde</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-text-main">{service.price} ₺</div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedService(service);
                                                                router.push(`/booking/${id}/staff`);
                                                            }}
                                                            className="h-10 px-5 bg-white text-text-main border border-border hover:bg-primary hover:text-white hover:border-primary font-bold rounded-xl transition-all flex items-center gap-2 text-sm shadow-sm active:scale-95"
                                                        >
                                                            Randevu
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* REVIEWS SECTION */}
                        <section id="reviews" className="scroll-mt-24">
                            <div className="bg-white rounded-3xl border border-border shadow-card overflow-hidden">
                                <div className="p-8 border-b border-border">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div>
                                            <h3 className="text-2xl font-display font-bold text-text-main flex items-center gap-3">
                                                <span className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-symbols-outlined">rate_review</span></span>
                                                Değerlendirmeler
                                            </h3>
                                            <p className="text-text-secondary text-sm mt-2 ml-14">Bu salon için {reviews.length} gerçek müşteri yorumu.</p>
                                        </div>
                                        {user && eligibleAppointments.length === 0 ? (
                                            <div className="text-sm text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                                                Yorum yapmak için tamamlanmış bir hizmetiniz bulunmalıdır.
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => user ? setShowReviewForm(!showReviewForm) : alert("Yorum yapmak için giriş yapmalısınız.")}
                                                className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm ${showReviewForm ? 'bg-gray-100 text-text-main hover:bg-gray-200' : 'bg-primary text-white hover:bg-primary-hover'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined">{showReviewForm ? 'close' : 'edit'}</span>
                                                {showReviewForm ? 'Vazgeç' : 'Değerlendir'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Add Review Form */}
                                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showReviewForm ? 'max-h-[800px] opacity-100 border-b border-border' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-8 bg-gray-50">
                                        <h4 className="text-text-main font-bold mb-4">Deneyiminizi Puanlayın</h4>
                                        <form onSubmit={handleSubmitReview}>
                                            {/* Appointment Selector */}
                                            {eligibleAppointments.length > 0 && (
                                                <div className="mb-6">
                                                    <label className="block text-sm font-bold text-text-secondary mb-2">Hizmet Seçin</label>
                                                    <div className="flex flex-col gap-2">
                                                        {eligibleAppointments.map((apt) => (
                                                            <label key={apt.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-white transition-colors ${selectedAppointmentId === apt.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white'}`}>
                                                                <input
                                                                    type="radio"
                                                                    name="appointment"
                                                                    value={apt.id}
                                                                    checked={selectedAppointmentId === apt.id}
                                                                    onChange={() => setSelectedAppointmentId(apt.id)}
                                                                    className="w-4 h-4 text-primary focus:ring-primary"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-text-main">{new Date(apt.start_time).toLocaleDateString()} - {new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                                    <div className="text-xs text-text-secondary">{apt.customer_name} adı ile alındı</div>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 mb-4">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewRating(star)}
                                                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                                                    >
                                                        <span className={`material-symbols-outlined text-3xl ${star <= newRating ? 'filled text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}>star</span>
                                                    </button>
                                                ))}
                                                <span className="text-text-main ml-2 font-bold">{newRating > 0 ? `${newRating} / 5` : ''}</span>
                                            </div>
                                            <div className="mb-4">
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Hizmetten memnun kaldınız mı? Düşüncelerinizi yazın..."
                                                    className="w-full bg-white border border-border rounded-xl p-4 text-text-main placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[120px] shadow-sm"
                                                    required
                                                ></textarea>
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowReviewForm(false)}
                                                    className="px-6 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-white transition-colors font-medium bg-white shadow-sm"
                                                >
                                                    İptal
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submitting || newRating === 0 || !selectedAppointmentId}
                                                    className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                                >
                                                    {submitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Summary Dashboard */}
                                <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-border bg-gray-50">
                                    <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-border shadow-sm">
                                        <span className="text-6xl font-black text-text-main leading-none">{salon.rating || salon.average_rating || 0}</span>
                                        <div className="flex gap-1 my-3 text-yellow-400">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <span key={s} className={`material-symbols-outlined text-2xl ${s <= Math.round(salon.rating || salon.average_rating || 0) ? 'filled' : ''}`}>star</span>
                                            ))}
                                        </div>
                                        <span className="text-text-secondary text-sm font-medium">{reviews.length} Değerlendirme</span>
                                    </div>

                                    <div className="md:col-span-8 flex flex-col justify-center gap-2">
                                        {ratingDistribution.map((item) => (
                                            <div key={item.star} className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 w-12 text-sm font-bold text-text-secondary">
                                                    {item.star} <span className="material-symbols-outlined text-xs">star</span>
                                                </span>
                                                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${item.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="w-8 text-right text-xs text-text-secondary">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reviews List */}
                                <div className="divide-y divide-gray-100">
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review.id} className="p-8 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="size-10 rounded-full bg-cover bg-center border border-border"
                                                            style={{ backgroundImage: `url("${review.user_avatar || 'https://i.pravatar.cc/150?u=default'}")` }}
                                                        ></div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <h5 className="font-bold text-text-main text-sm flex items-center gap-2">
                                                                {(() => {
                                                                    const nameParts = review.user_name.trim().split(' ');
                                                                    if (nameParts.length > 1) {
                                                                        return `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`;
                                                                    }
                                                                    return review.user_name;
                                                                })()}
                                                                {review.is_verified && (
                                                                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100" title="Doğrulanmış Müşteri">
                                                                        <span className="material-symbols-outlined text-[14px]">verified</span> Doğrulanmış
                                                                    </span>
                                                                )}
                                                            </h5>
                                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary">
                                                                {(() => {
                                                                    const rawDate = review.service_date || review.created_at || review.date;
                                                                    if (!rawDate) return null;
                                                                    return (
                                                                        <span>
                                                                            {new Date(rawDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                                        </span>
                                                                    );
                                                                })()}
                                                                {review.service_name && (
                                                                    <>
                                                                        <span className="text-gray-300">•</span>
                                                                        <span className="text-text-main font-semibold">{review.service_name}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-1 rounded text-xs font-bold text-yellow-600 border border-yellow-100 h-fit">
                                                        {review.rating} <span className="material-symbols-outlined text-[14px] filled">star</span>
                                                    </div>
                                                </div>
                                                <p className="text-text-secondary text-sm leading-relaxed mt-2">{review.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center">
                                            <div className="size-16 bg-surface-alt rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                                                <span className="material-symbols-outlined text-3xl text-gray-400">rate_review</span>
                                            </div>
                                            <h5 className="text-text-main font-bold mb-2">Henüz yorum yapılmamış</h5>
                                            <p className="text-text-secondary text-sm">Bu salon için ilk değerlendirmeyi siz yapın.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Location Card */}
                        <div className="bg-white rounded-3xl p-6 border border-border shadow-card">
                            <h4 className="font-bold text-text-main mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">pin_drop</span> Konum
                            </h4>
                            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden mb-5 relative border border-border">
                                {salon.geo_latitude && salon.geo_longitude ? (
                                    <SalonMap
                                        center={{
                                            lat: salon.geo_latitude,
                                            lng: salon.geo_longitude
                                        }}
                                        salons={[{
                                            ...salon,
                                            coordinates: {
                                                lat: salon.geo_latitude,
                                                lng: salon.geo_longitude
                                            }
                                        }]}
                                        hoveredSalonId={null}
                                        onSalonHover={() => { }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <p className="text-text-muted text-sm">Konum bilgisi mevcut değil</p>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 right-4 z-[400]">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${salon.geo_latitude},${salon.geo_longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-white/95 hover:bg-white text-text-main py-3 rounded-xl font-bold text-sm shadow-md transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 backdrop-blur-md border border-100"
                                    >
                                        <span className="material-symbols-outlined text-lg">directions</span> Yol Tarifi Al
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">location_on</span>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {salon.neighborhood || salon.avenue || salon.street ? (
                                        <>
                                            {salon.neighborhood} {salon.avenue ? `${salon.avenue} ` : ''}{salon.street} No: {salon.building_no}<br />
                                            {salon.district_name}, {salon.city_name}
                                        </>
                                    ) : (
                                        salon.address || `${salon.district_name}, ${salon.city_name}`
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Hours Card */}
                        <div className="bg-white rounded-3xl p-6 border border-border shadow-card">
                            <h4 className="font-bold text-text-main mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">schedule</span> Çalışma Saatleri
                            </h4>
                            <div className="space-y-4 relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                                {workingHours.length > 0 ? (
                                    // Map over sorted working hours (Mon-Sun or as fetched)
                                    workingHours
                                        .sort((a, b) => (a.day_of_week === 0 ? 7 : a.day_of_week) - (b.day_of_week === 0 ? 7 : b.day_of_week))
                                        .map((hour, idx) => (
                                            <div key={idx} className="flex items-center gap-4 relative z-10">
                                                <div className={`size-4 rounded-full border-2 ${!hour.is_closed ? 'bg-green-500 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-200 border-gray-300'}`}></div>
                                                <div className="flex-1 flex justify-between items-center text-sm p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                    <span className="text-text-secondary">{getDayName(hour.day_of_week)}</span>
                                                    <span className={`font-bold ${!hour.is_closed ? 'text-text-main' : 'text-red-500'}`}>
                                                        {hour.is_closed ? 'Kapalı' : `${hour.start_time.substring(0, 5)} - ${hour.end_time.substring(0, 5)}`}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    // Fallback if no working hours recorded
                                    <div className="text-center py-4 text-text-muted text-sm italic">
                                        Çalışma saatleri belirtilmemiş.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <GeminiChat />
        </Layout>
    );
}

