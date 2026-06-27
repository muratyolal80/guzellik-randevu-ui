<<<<<<< HEAD
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Layout } from '@/components/Layout';
import { GeminiChat } from '@/components/GeminiChat';
import { SalonDataService, ReviewService, ServiceService, FavoriteService, GalleryService, StaffReviewService } from '@/services/db';
import { SalonDetail, Review, SalonServiceDetail, SalonWorkingHours, Appointment, StaffReview, SalonGallery } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import GallerySlider from '@/components/GallerySlider';
import ImageUpload from '@/components/ImageUpload';
import Skeleton from '@/components/Skeleton';
import Lightbox from '@/components/common/Lightbox';
import { JsonLd, beautySalonSchema, breadcrumbSchema } from '@/components/seo/JsonLd';
import {
    Star, MapPin, Clock, Heart, Share2, ChevronDown, ChevronRight,
    Scissors, Wifi, Coffee, Car, CreditCard, Wind, CheckCircle2,
    MessageSquare, Pencil, X, Store, ShieldCheck,
    AlertCircle, Navigation, Timer
} from 'lucide-react';

const SalonMap = dynamic(
    () => import('@/components/Map/SalonMap').then((mod) => mod.SalonMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-2xl">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-gray-400 text-xs">Harita yükleniyor...</p>
                </div>
            </div>
        )
    }
);

const FEATURE_ICONS: Record<string, React.ReactNode> = {
    'Wi-Fi': <Wifi className="w-5 h-5" />,
    'İkramlar': <Coffee className="w-5 h-5" />,
    'Otopark': <Car className="w-5 h-5" />,
    'Kredi Kartı': <CreditCard className="w-5 h-5" />,
    'Klima': <Wind className="w-5 h-5" />,
};

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export default function SalonDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();
    const { setSalon: setBookingSalon, setSelectedServices } = useBooking();

    const [salon, setSalon] = useState<SalonDetail | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [services, setServices] = useState<SalonServiceDetail[]>([]);
    const [workingHours, setWorkingHours] = useState<SalonWorkingHours[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [togglingFavorite, setTogglingFavorite] = useState(false);
    const [eligibleAppointments, setEligibleAppointments] = useState<Appointment[]>([]);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'services' | 'staff-reviews'>('services');
    const [staffReviews, setStaffReviews] = useState<StaffReview[]>([]);
    const [loadingStaffReviews, setLoadingStaffReviews] = useState(false);
    const [gallery, setGallery] = useState<SalonGallery[]>([]);
    const [reviewImagesUrls, setReviewImagesUrls] = useState<string[]>([]);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [lightboxState, setLightboxState] = useState({ isOpen: false, images: [] as string[], currentIndex: 0 });

    useEffect(() => {
        if (activeTab === 'staff-reviews' && id) fetchStaffReviews();
    }, [activeTab, id]);

    const fetchStaffReviews = async () => {
        try {
            setLoadingStaffReviews(true);
            const data = await StaffReviewService.getReviewsBySalon(id);
            setStaffReviews((data || []).map((r: any) => ({
                ...r,
                user_name: String(r.user_name || 'Misafir'),
                comment: typeof r.comment === 'object' ? JSON.stringify(r.comment) : String(r.comment || ''),
                staff_name: typeof r.staff_name === 'object' ? (r.staff_name as any)?.name : String(r.staff_name || '')
            })));
        } catch (error) {
            console.error('Error fetching staff reviews:', error);
        } finally {
            setLoadingStaffReviews(false);
        }
    };

    const groupedServices = services.reduce((acc: Record<string, SalonServiceDetail[]>, service) => {
        const category = service.category_name || 'Diğer';
        if (!acc[category]) acc[category] = [];
        acc[category].push(service);
        return acc;
    }, {});

    const toggleCategory = (category: string) =>
        setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const salonData = await SalonDataService.getSalonById(id);
                const [reviewsResult, servicesResult, hoursResult, galleryResult] = await Promise.allSettled([
                    ReviewService.getReviewsBySalon(id),
                    ServiceService.getServicesBySalon(id),
                    SalonDataService.getSalonWorkingHours(id),
                    GalleryService.getSalonGallery(id)
                ]);

                if (salonData) {
                    setSalon(salonData);
                    setBookingSalon(salonData);
                    if (user) {
                        try { setIsFavorite(await FavoriteService.isFavorite(user.id, salonData.id)); } catch { }
                        try {
                            const apts = await ReviewService.getReviewableAppointments(user.id, salonData.id);
                            setEligibleAppointments(apts);
                            if (apts.length > 0) setSelectedAppointmentId(apts[0].id);
                        } catch { }
                    }
                }

                const reviewsData = reviewsResult.status === 'fulfilled' ? (reviewsResult.value || []) : [];
                const servicesData = servicesResult.status === 'fulfilled' ? (servicesResult.value || []) : [];
                setReviews(reviewsData);
                setServices(servicesData);
                setWorkingHours(hoursResult.status === 'fulfilled' ? (hoursResult.value || []) : []);
                setGallery(galleryResult.status === 'fulfilled' ? (galleryResult.value || []) : []);

                // Sadece ilk kategori default açık — uzun sayfa scroll yorgunluğunu azaltır
                const seen = new Set<string>();
                const cats: Record<string, boolean> = {};
                servicesData.forEach((s: SalonServiceDetail) => {
                    const c = s.category_name || 'Diğer';
                    if (!seen.has(c)) {
                        cats[c] = seen.size === 0;
                        seen.add(c);
                    }
                });
                setOpenCategories(cats);

                const logReason = (label: string, reason: unknown) => {
                    const msg = reason instanceof Error ? reason.message : (reason as any)?.message || JSON.stringify(reason) || String(reason);
                    console.error(`${label}:`, msg);
                };
                if (reviewsResult.status === 'rejected') logReason('Reviews fetch failed', reviewsResult.reason);
                if (servicesResult.status === 'rejected') logReason('Services fetch failed', servicesResult.reason);
                if (hoursResult.status === 'rejected') logReason('Working hours fetch failed', hoursResult.reason);
                if (galleryResult.status === 'rejected') logReason('Gallery fetch failed', galleryResult.reason);
            } catch (error) {
                console.error('Salon detay verisi yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, setBookingSalon, user]);

    const handleToggleFavorite = async () => {
        if (!user || !salon) { alert("Favorilere eklemek için giriş yapmalısınız."); return; }
        try {
            setTogglingFavorite(true);
            setIsFavorite(await FavoriteService.toggleFavorite(user.id, salon.id));
        } catch (error) {
            console.error("Favori işlemi sırasında hata:", error);
        } finally {
            setTogglingFavorite(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !salon) return;
        if (!selectedAppointmentId) { alert("Lütfen değerlendirmek istediğiniz hizmeti seçiniz."); return; }
        if (newRating === 0) { alert("Lütfen bir puan seçiniz."); return; }
        setSubmitting(true);
        try {
            const newReviewData = await ReviewService.createReview({
                salon_id: salon.id, user_id: user.id,
                user_name: `${user.first_name || ''} ${(user.last_name || '').charAt(0)}.`.trim(),
                user_avatar: user.avatar_url, rating: newRating,
                comment: newComment, appointment_id: selectedAppointmentId
            });
            let finalReviewData = { ...newReviewData, images: [] as any[] };
            if (reviewImagesUrls.length > 0) {
                const addedImages = await Promise.all(reviewImagesUrls.map(url =>
                    GalleryService.addReviewImage({ review_id: newReviewData.id, image_url: url })
                ));
                finalReviewData.images = addedImages;
            }
            setReviews([finalReviewData, ...reviews]);
            setShowReviewForm(false);
            setNewRating(0);
            setNewComment('');
            setReviewImagesUrls([]);
            setEligibleAppointments(prev => prev.filter(a => a.id !== selectedAppointmentId));
            setSelectedAppointmentId('');
            const updatedSalon = await SalonDataService.getSalonById(salon.id);
            if (updatedSalon) setSalon(updatedSalon);
        } catch (error: any) {
            alert(`Yorum eklenirken hata oluştu: ${error?.message || "Lütfen tekrar deneyin"}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="bg-background min-h-screen">
                    <Skeleton className="h-[520px] w-full rounded-none" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-8 space-y-6">
                                <div className="bg-white rounded-3xl p-8 border border-gray-100">
                                    <Skeleton className="h-8 w-48 mb-4" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                                        <div className="p-5 flex justify-between items-center">
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-5 w-5 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white rounded-3xl p-6 border border-gray-100">
                                    <Skeleton className="h-12 w-full rounded-2xl mb-4" />
                                    <Skeleton className="h-8 w-full rounded-xl" />
                                </div>
                                <div className="bg-white rounded-3xl p-6 border border-gray-100">
                                    <Skeleton className="h-6 w-36 mb-4" />
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex justify-between mb-3">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!salon) {
        return (
            <Layout>
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-4">Salon Bulunamadı</h1>
                    <p className="text-gray-500 max-w-md mb-8">Aradığınız salon sistemde bulunamadı veya yayından kaldırılmış olabilir.</p>
                    <Link href="/" className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </Layout>
        );
    }

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => Math.round(r.rating) === star).length;
        return { star, count, percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0 };
    });

    const avgRating = salon.rating || salon.average_rating || 0;
    const nowDay = new Date().getDay();
    const todayHour = workingHours.find(h => h.day_of_week === (nowDay === 0 ? 7 : nowDay));
    const isOpenNow = todayHour && !todayHour.is_closed;
    const firstService = services[0];

    return (
        <Layout>
            {/* SEO: structured data — Google rich result için */}
            <JsonLd data={beautySalonSchema(salon, reviews)} />
            <JsonLd data={breadcrumbSchema([
                { name: 'Ana Sayfa', url: '/' },
                { name: salon.city_name || 'Salonlar', url: `/?city=${encodeURIComponent(salon.city_name || '')}` },
                { name: salon.name, url: `/salon/${salon.id}` },
            ])} />

            {/* ── HERO ── */}
            <div className="relative h-[60vh] min-h-[400px] max-h-[560px] w-full group overflow-hidden">
                {gallery.length > 0 ? (
                    <GallerySlider images={gallery} salonName={salon.name} />
                ) : (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                            style={{ backgroundImage: `url("${salon.image || '/placeholder-salon.jpg'}")` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </>
                )}

                {/* Hero overlay content */}
                <div className="absolute inset-0 flex flex-col justify-end pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto left-0 right-0">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {salon.is_sponsored && (
                                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full tracking-widest uppercase shadow">ÖNERİLEN</span>
                                )}
                                <a href="#reviews" className="flex items-center gap-1.5 text-sm font-bold bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full text-white border border-white/20 hover:bg-white/25 transition-colors">
                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                    {avgRating}
                                    <span className="text-white/60 font-normal">({reviews.length})</span>
                                </a>
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border backdrop-blur-md ${isOpenNow ? 'bg-green-500/90 text-white border-green-400/50' : 'bg-red-500/90 text-white border-red-400/50'}`}>
                                    <Clock className="w-3 h-3" />
                                    {isOpenNow ? 'Açık' : 'Kapalı'}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-none drop-shadow-xl">{salon.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                                <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                                    {salon.neighborhood ? `${salon.neighborhood}, ` : ''}{salon.district_name}, {salon.city_name}
                                </span>
                                {salon.tags && salon.tags.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        {salon.tags.map(tag => (
                                            <span key={tag} className="text-white/60 hover:text-white transition-colors text-xs">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <button aria-label="Salonu paylaş" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md transition-all text-white font-semibold text-sm">
                                <Share2 className="w-4 h-4" /> Paylaş
                            </button>
                            <button
                                onClick={handleToggleFavorite}
                                disabled={togglingFavorite}
                                aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                                aria-pressed={isFavorite}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border backdrop-blur-md transition-all font-semibold text-sm ${isFavorite ? 'bg-red-500 border-red-400 text-white' : 'bg-white/15 hover:bg-white/25 border-white/20 text-white'}`}
                            >
                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
                                {isFavorite ? 'Kaydedildi' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MAIN LAYOUT ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 lg:pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* ── LEFT / MAIN CONTENT ── */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* About */}
                        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Store className="w-4 h-4 text-primary" />
                                </span>
                                Hakkında
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {salon.description || `${salon.name}, uzman kadrosu ve modern ekipmanlarıyla sizin için burada.`}
                            </p>

                            {/* Features */}
                            {(salon.features && salon.features.length > 0) && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
                                    {(salon.features || ['Wi-Fi', 'İkramlar', 'Otopark', 'Kredi Kartı']).map((feature, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-sm">
                                                {FEATURE_ICONS[feature] || <CheckCircle2 className="w-5 h-5" />}
                                            </div>
                                            <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700 transition-colors text-center">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Tabs — Segment Control */}
                        <div>
                            <div className="inline-flex p-1 bg-gray-100/80 rounded-2xl mb-8 relative">
                                {[
                                    { key: 'services', label: 'Hizmetler', icon: <Scissors className="w-4 h-4" /> },
                                    { key: 'staff-reviews', label: 'Uzman Yorumları', icon: <MessageSquare className="w-4 h-4" /> },
                                ].map(tab => {
                                    const active = activeTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            data-tab={tab.key}
                                            onClick={() => setActiveTab(tab.key as any)}
                                            className={`relative flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl transition-all duration-300 ${active ? 'bg-white text-primary shadow-md shadow-primary/10' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            {tab.icon} {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Services Tab */}
                            {activeTab === 'services' && (
                                <div className="space-y-4">
                                    {Object.keys(groupedServices).length === 0 ? (
                                        <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-dashed border-gray-200 relative overflow-hidden">
                                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-100/40 rounded-full blur-3xl" />
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-amber-100/60 flex items-center justify-center mx-auto mb-4 border border-primary/10">
                                                    <Scissors className="w-7 h-7 text-primary" />
                                                </div>
                                                <h4 className="font-black text-gray-900 text-lg mb-1">Henüz Hizmet Eklenmemiş</h4>
                                                <p className="text-gray-500 text-sm max-w-xs mx-auto">Salon hizmetlerini güncelliyor. Çok yakında burada olacak.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        Object.entries(groupedServices).map(([category, items]) => {
                                            const isOpen = openCategories[category];
                                            return (
                                                <div
                                                    key={category}
                                                    className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${isOpen ? 'border-primary/20 shadow-md shadow-primary/5' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}
                                                >
                                                    <button
                                                        onClick={() => toggleCategory(category)}
                                                        className={`w-full flex items-center justify-between px-6 py-5 transition-colors ${isOpen ? 'bg-gradient-to-r from-primary/[0.04] to-transparent' : 'hover:bg-gray-50/50'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-1 h-6 rounded-full transition-colors ${isOpen ? 'bg-primary' : 'bg-gray-200'}`} />
                                                            <h3 className={`font-black text-base tracking-tight transition-colors ${isOpen ? 'text-primary' : 'text-gray-900'}`}>{category}</h3>
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider ${isOpen ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                                                {items.length}
                                                            </span>
                                                        </div>
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                                                            <ChevronDown className="w-4 h-4" />
                                                        </div>
                                                    </button>

                                                    {isOpen && (
                                                        <div className="divide-y divide-gray-50 border-t border-gray-50">
                                                            {items.map((service, idx) => (
                                                                <div
                                                                    key={service.id}
                                                                    className="relative flex items-center gap-4 px-6 py-5 hover:bg-primary/[0.025] transition-colors group"
                                                                >
                                                                    {/* Sol kenar altın aksent — hover'da görünür */}
                                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-primary group-hover:h-10 transition-all duration-300 rounded-r-full" />

                                                                    {/* Sıra numarası */}
                                                                    <div className="hidden sm:flex w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-primary/10 items-center justify-center text-xs font-black text-gray-400 group-hover:text-primary transition-all shrink-0">
                                                                        {String(idx + 1).padStart(2, '0')}
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight mb-1">{service.service_name}</h4>
                                                                        <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <Timer className="w-3 h-3" />
                                                                                {service.duration_min} dk
                                                                            </span>
                                                                            <span className="inline-flex items-center gap-1 text-emerald-600">
                                                                                <CheckCircle2 className="w-3 h-3" />
                                                                                Uygun
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 shrink-0">
                                                                        <div className="text-right">
                                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fiyat</div>
                                                                            <div className="text-xl font-black text-gray-900 leading-none mt-0.5">₺{service.price}</div>
                                                                        </div>
                                                                        <Link
                                                                            href={`/booking/${salon.id}/staff?serviceId=${service.id}`}
                                                                            onClick={() => setSelectedServices([service])}
                                                                            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow-sm hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-95 transition-all whitespace-nowrap group/btn"
                                                                        >
                                                                            Randevu Al
                                                                            <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                                        </Link>
                                                                        {/* Mobil — kompakt CTA */}
                                                                        <Link
                                                                            href={`/booking/${salon.id}/staff?serviceId=${service.id}`}
                                                                            onClick={() => setSelectedServices([service])}
                                                                            className="sm:hidden w-9 h-9 inline-flex items-center justify-center bg-primary text-white rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all"
                                                                            aria-label="Randevu Al"
                                                                        >
                                                                            <ChevronRight className="w-4 h-4" />
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* Staff Reviews Tab */}
                            {activeTab === 'staff-reviews' && (
                                <div className="space-y-6">
                                    {loadingStaffReviews ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-3xl" />)}
                                        </div>
                                    ) : staffReviews.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {staffReviews.map((review) => (
                                                <div key={review.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                                                                {String(review.user_name || '?').charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm">{String(review.user_name || 'Misafir')}</p>
                                                                <div className="flex gap-0.5 mt-0.5">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400">{new Date(review.created_at!).toLocaleDateString('tr-TR')}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">{review.comment}</p>
                                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                        <span className="text-xs text-primary font-bold">{review.staff_name}</span>
                                                        {review.is_verified && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                                                                <ShieldCheck className="w-3.5 h-3.5" /> Onaylı
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-dashed border-gray-200 relative overflow-hidden">
                                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100/40 rounded-full blur-3xl" />
                                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-primary/10 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                                    <MessageSquare className="w-7 h-7 text-primary" />
                                                </div>
                                                <h4 className="font-black text-gray-900 text-lg mb-1">İlk Yorumu Sen Yap</h4>
                                                <p className="text-gray-500 text-sm max-w-xs mx-auto">Henüz uzman bazlı yorum yok. Hizmet aldıktan sonra deneyimini paylaşabilirsin.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <section id="reviews" className="scroll-mt-24">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="p-7 border-b border-gray-100">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                                                <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                                    <Star className="w-4 h-4 text-amber-500" />
                                                </span>
                                                Değerlendirmeler
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 ml-10">{reviews.length} gerçek müşteri yorumu</p>
                                        </div>
                                        {user && eligibleAppointments.length > 0 && (
                                            <button
                                                onClick={() => setShowReviewForm(!showReviewForm)}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${showReviewForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90'}`}
                                            >
                                                {showReviewForm ? <><X className="w-4 h-4" /> Vazgeç</> : <><Pencil className="w-4 h-4" /> Değerlendir</>}
                                            </button>
                                        )}
                                        {user && eligibleAppointments.length === 0 && (
                                            <span className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                                                Yorum için tamamlanmış bir hizmetiniz olmalıdır.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Review Form */}
                                {showReviewForm && (
                                    <div className="p-7 bg-gray-50 border-b border-gray-100">
                                        <h4 className="font-bold text-gray-900 mb-5">Deneyiminizi Puanlayın</h4>
                                        <form onSubmit={handleSubmitReview} className="space-y-5">
                                            {eligibleAppointments.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Hizmet Seçin</label>
                                                    <div className="space-y-2">
                                                        {eligibleAppointments.map((apt) => (
                                                            <label key={apt.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAppointmentId === apt.id ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                                                <input type="radio" name="appointment" value={apt.id} checked={selectedAppointmentId === apt.id} onChange={() => setSelectedAppointmentId(apt.id)} className="w-4 h-4 text-primary" />
                                                                <div>
                                                                    <div className="font-semibold text-gray-900 text-sm">{new Date(apt.start_time).toLocaleDateString('tr-TR')} — {new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                                                                    <div className="text-xs text-gray-500">{apt.customer_name} adı ile</div>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Puanınız</label>
                                                <div className="flex items-center gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button key={star} type="button" onClick={() => setNewRating(star)} className="p-1 transition-transform hover:scale-110">
                                                            <Star className={`w-7 h-7 transition-colors ${star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                                                        </button>
                                                    ))}
                                                    {newRating > 0 && <span className="text-sm font-bold text-gray-700 ml-2">{newRating} / 5</span>}
                                                </div>
                                            </div>

                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Hizmetten memnun kaldınız mı? Düşüncelerinizi yazın..."
                                                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none min-h-[100px] resize-none text-sm"
                                                required
                                            />

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-3">Fotoğraf Ekle <span className="font-normal text-gray-400">(opsiyonel, max 5)</span></label>
                                                <div className="flex flex-wrap gap-3">
                                                    {reviewImagesUrls.map((url, idx) => (
                                                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                                                            <img src={url} alt="upload" className="w-full h-full object-cover" />
                                                            <button type="button" onClick={() => setReviewImagesUrls(prev => prev.filter((_, i) => i !== idx))} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <X className="w-4 h-4 text-white" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {reviewImagesUrls.length < 5 && (
                                                        <div className="w-20 h-20">
                                                            <ImageUpload bucket="reviews" currentImage={null} onUpload={(url) => setReviewImagesUrls(prev => [...prev, url])} label="+" className="h-full" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-2">
                                                <button type="button" onClick={() => setShowReviewForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-colors">İptal</button>
                                                <button type="submit" disabled={submitting || newRating === 0 || !selectedAppointmentId} className="px-7 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20">
                                                    {submitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Rating Summary */}
                                <div className="p-7 grid grid-cols-1 md:grid-cols-12 gap-6 bg-gray-50/50 border-b border-gray-100">
                                    <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <span className="text-5xl font-black text-gray-900 leading-none">{Number(avgRating).toFixed(1)}</span>
                                        <div className="flex gap-1 my-3">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">{reviews.length} değerlendirme</span>
                                    </div>
                                    <div className="md:col-span-8 flex flex-col justify-center gap-2">
                                        {ratingDistribution.map((item) => (
                                            <div key={item.star} className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 w-10 shrink-0">
                                                    <span className="text-xs font-bold text-gray-500">{item.star}</span>
                                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                </div>
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-700" style={{ width: `${item.percentage}%` }} />
                                                </div>
                                                <span className="w-5 text-right text-xs text-gray-400 font-medium">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Review List */}
                                <div className="divide-y divide-gray-100">
                                    {reviews.length > 0 ? reviews.map((review) => (
                                        <div key={review.id} className="p-7 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm shrink-0">
                                                        {review.user_avatar
                                                            ? <img src={review.user_avatar} alt={String(review.user_name || '')} className="w-full h-full object-cover" />
                                                            : String(review.user_name || '?').charAt(0)
                                                        }
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="font-bold text-gray-900 text-sm">
                                                                {(() => {
                                                                    const name = String(review.user_name || 'Misafir').trim();
                                                                    const parts = name.split(' ');
                                                                    return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : name;
                                                                })()}
                                                            </h5>
                                                            {review.is_verified && (
                                                                <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                                    <ShieldCheck className="w-3 h-3" /> Doğrulanmış
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                                            ))}
                                                            <span className="text-[10px] text-gray-400 ml-1">{new Date(review.created_at || Date.now()).toLocaleDateString('tr-TR')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg text-sm font-black text-yellow-700 border border-yellow-100">
                                                    {review.rating} <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                                </span>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-sm mb-3">{review.comment}</p>
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {review.images.map((img: any, idx: number) => (
                                                        <button key={idx} onClick={() => setLightboxState({ isOpen: true, images: (review.images || []).map((i: any) => i.image_url), currentIndex: idx })} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity">
                                                            <img src={img.image_url} alt="Review" className="w-full h-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="p-16 text-center relative overflow-hidden">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-sm">
                                                    <Star className="w-7 h-7 text-amber-500 fill-amber-400" />
                                                </div>
                                                <h5 className="font-black text-gray-900 text-lg mb-1">İlk Değerlendirmeyi Sen Yap</h5>
                                                <p className="text-gray-500 text-sm max-w-sm mx-auto">Bu salon henüz yorum almadı — hizmet aldıktan sonra deneyimini paylaşarak diğerlerine yardımcı olabilirsin.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ── SIDEBAR ── */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6 space-y-6">

                            {/* Booking CTA Card */}
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex items-baseline justify-between mb-5">
                                    <div>
                                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Başlayan fiyatlar</span>
                                        <p className="text-3xl font-black text-primary mt-0.5">
                                            ₺{services.length > 0 ? Math.min(...services.map(s => s.price)) : '—'}
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isOpenNow ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                        <Clock className="w-3 h-3" />
                                        {isOpenNow
                                            ? `Açık · ${todayHour?.end_time?.substring(0, 5)}'e kadar`
                                            : 'Kapalı'}
                                    </div>
                                </div>

                                <Link
                                    href={firstService ? `/booking/${salon.id}/staff?serviceId=${firstService.id}` : `/booking/${salon.id}/staff`}
                                    onClick={() => firstService && setSelectedServices([firstService])}
                                    className="block w-full bg-primary text-white text-center py-3.5 rounded-2xl font-black text-base shadow-xl shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                                >
                                    Randevu Al
                                </Link>

                                {services.length > 0 && (
                                    <button
                                        onClick={() => document.querySelector('[data-tab="services"]')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="mt-3 w-full text-center py-2.5 rounded-2xl text-sm font-bold text-gray-500 border border-gray-200 hover:border-primary hover:text-primary transition-colors"
                                    >
                                        Tüm Hizmetleri Gör
                                    </button>
                                )}
                            </div>

                            {/* Location Card */}
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-primary" /> Konum
                                </h4>
                                <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden mb-4 border border-gray-100">
                                    {salon.geo_latitude && salon.geo_longitude ? (
                                        <SalonMap
                                            center={{ lat: salon.geo_latitude, lng: salon.geo_longitude }}
                                            salons={[{ ...salon, coordinates: { lat: salon.geo_latitude, lng: salon.geo_longitude } }]}
                                            hoveredSalonId={null}
                                            onSalonHover={() => { }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <p className="text-gray-400 text-sm">Konum bilgisi yok</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                    {salon.neighborhood ? `${salon.neighborhood}, ` : ''}
                                    {salon.avenue ? `${salon.avenue}, ` : ''}
                                    {salon.street ? `${salon.street} No:${salon.building_no} ` : ''}
                                    {salon.district_name}, {salon.city_name}
                                </p>
                                {salon.geo_latitude && salon.geo_longitude && (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${salon.geo_latitude},${salon.geo_longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:border-primary hover:text-primary transition-colors"
                                    >
                                        <Navigation className="w-4 h-4" /> Yol Tarifi Al
                                    </a>
                                )}
                            </div>

                            {/* Working Hours Card */}
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-primary" /> Çalışma Saatleri
                                </h4>
                                {workingHours.length > 0 ? (
                                    <div className="space-y-2">
                                        {workingHours
                                            .sort((a, b) => (a.day_of_week === 0 ? 7 : a.day_of_week) - (b.day_of_week === 0 ? 7 : b.day_of_week))
                                            .map((hour, idx) => {
                                                const isToday = hour.day_of_week === (new Date().getDay() === 0 ? 7 : new Date().getDay());
                                                return (
                                                    <div key={idx} className={`flex items-center justify-between py-2 px-3 rounded-xl text-sm transition-colors ${isToday ? 'bg-primary/5 border border-primary/20' : 'hover:bg-gray-50'}`}>
                                                        <span className={`font-medium ${isToday ? 'text-primary font-bold' : 'text-gray-600'}`}>
                                                            {DAY_NAMES[hour.day_of_week]}
                                                            {isToday && <span className="text-[9px] ml-1 font-black uppercase tracking-wider opacity-60">Bugün</span>}
                                                        </span>
                                                        <span className={`font-bold text-xs ${hour.is_closed ? 'text-red-500' : isToday ? 'text-primary' : 'text-gray-800'}`}>
                                                            {hour.is_closed ? 'Kapalı' : `${hour.start_time.substring(0, 5)} – ${hour.end_time.substring(0, 5)}`}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-4">Çalışma saatleri belirtilmemiş.</p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Mobil Sticky CTA Bar — sadece mobilde görünür, sayfanın altında sabit */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
                <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Başlangıç</span>
                        <p className="text-xl font-black text-primary leading-none mt-0.5">
                            ₺{services.length > 0 ? Math.min(...services.map(s => s.price)) : '—'}
                        </p>
                    </div>
                    <Link
                        href={firstService ? `/booking/${salon.id}/staff?serviceId=${firstService.id}` : `/booking/${salon.id}/staff`}
                        onClick={() => firstService && setSelectedServices([firstService])}
                        className="flex-1 bg-primary text-white text-center py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all"
                    >
                        Randevu Al
                    </Link>
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
=======
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { UserRole } from '@/types';
import { AlertCircle } from 'lucide-react';

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
    const { setSalon: setBookingSalon, setSelectedServices } = useBooking();

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
    const [isUploadingImages, setIsUploadingImages] = useState(false);

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

    useEffect(() => {
        if (activeTab === 'staff-reviews' && id) {
            fetchStaffReviews();
        }
    }, [activeTab, id]);

    const fetchStaffReviews = async () => {
        try {
            setLoadingStaffReviews(true);
            const data = await StaffReviewService.getReviewsBySalon(id);
            setStaffReviews((data || []).map((r: any) => ({
                ...r,
                user_name: String(r.user_name || 'Misafir'),
                comment: typeof r.comment === 'object' ? JSON.stringify(r.comment) : String(r.comment || ''),
                staff_name: typeof r.staff_name === 'object' ? (r.staff_name as any)?.name : String(r.staff_name || '')
            })));
        } catch (error) {
            console.error('Error fetching staff reviews:', error);
        } finally {
            setLoadingStaffReviews(false);
        }
    };

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
            try {
                // Fetch salon first — this is critical
                const salonData = await SalonDataService.getSalonById(id);

                // Fetch secondary data in parallel using allSettled so one failure doesn't break the page
                const [reviewsResult, servicesResult, hoursResult, galleryResult] = await Promise.allSettled([
                    ReviewService.getReviewsBySalon(id),
                    ServiceService.getServicesBySalon(id),
                    SalonDataService.getSalonWorkingHours(id),
                    GalleryService.getSalonGallery(id)
                ]);

                if (salonData) {
                    setSalon(salonData);
                    setBookingSalon(salonData); // Store in booking context

                    // Fetch favorite status if user logged in
                    if (user) {
                        try {
                            const favStatus = await FavoriteService.isFavorite(user.id, salonData.id);
                            setIsFavorite(favStatus);
                        } catch (err) {
                            console.error('Failed to fetch favorite status', err);
                        }

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

                // Safely extract data from settled promises
                setReviews(reviewsResult.status === 'fulfilled' ? (reviewsResult.value || []) : []);
                setServices(servicesResult.status === 'fulfilled' ? (servicesResult.value || []) : []);
                setWorkingHours(hoursResult.status === 'fulfilled' ? (hoursResult.value || []) : []);
                setGallery(galleryResult.status === 'fulfilled' ? (galleryResult.value || []) : []);

                // Log any errors for debugging
                if (reviewsResult.status === 'rejected') console.error('Reviews fetch failed:', reviewsResult.reason);
                if (servicesResult.status === 'rejected') console.error('Services fetch failed:', servicesResult.reason);
                if (hoursResult.status === 'rejected') console.error('Working hours fetch failed:', hoursResult.reason);
                if (galleryResult.status === 'rejected') console.error('Gallery fetch failed:', galleryResult.reason);
            } catch (error) {
                console.error('Salon detay verisi yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
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

            // Handle review images if any
            let finalReviewData = { ...newReviewData, images: [] as any[] };
            if (reviewImagesUrls.length > 0) {
                const addedImages = await Promise.all(reviewImagesUrls.map(url =>
                    GalleryService.addReviewImage({
                        review_id: newReviewData.id,
                        image_url: url
                    })
                ));
                finalReviewData.images = addedImages;
            }

            setReviews([finalReviewData, ...reviews]);
            setShowReviewForm(false);
            setNewRating(0);
            setNewComment('');
            setReviewImagesUrls([]);

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

    if (loading) {
        return (
            <Layout>
                <div className="bg-background min-h-screen">
                    {/* Hero Skeleton */}
                    <Skeleton className="h-[480px] w-full rounded-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8">
                                {/* Header Info Skeleton */}
                                <div className="bg-white rounded-[32px] p-8 md:p-10 border border-border shadow-card mb-8">
                                    <Skeleton className="h-10 w-2/3 mb-4" />
                                    <div className="flex flex-wrap gap-4 mb-6">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-6 w-48" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-10 w-32 rounded-xl" />
                                        <Skeleton className="h-10 w-32 rounded-xl" />
                                    </div>
                                </div>

                                {/* Tabs Skeleton */}
                                <div className="space-y-4">
                                    <div className="flex gap-4 border-b border-border pb-4">
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-32" />
                                    </div>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white p-6 rounded-2xl border border-border">
                                            <div className="flex justify-between mb-4">
                                                <Skeleton className="h-6 w-1/4" />
                                                <Skeleton className="h-6 w-16" />
                                            </div>
                                            <Skeleton className="h-4 w-full mb-2" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sidebar Skeleton */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-white rounded-3xl p-6 border border-border shadow-card">
                                    <Skeleton className="h-8 w-1/2 mb-6" />
                                    <Skeleton className="h-48 w-full rounded-2xl mb-6" />
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                </div>
                                <div className="bg-white rounded-3xl p-6 border border-border shadow-card">
                                    <Skeleton className="h-8 w-2/3 mb-6" />
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex justify-between mb-4">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!salon) {
        return (
            <Layout>
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-100 shadow-inner">
                        <AlertCircle className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-black text-text-main mb-4">Salon Bulunamadı</h1>
                    <p className="text-text-secondary max-w-md mb-8">
                        Aradığınız salon sistemde bulunamadı veya yayından kaldırılmış olabilir.
                    </p>
                    <Link 
                        href="/"
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Ana Sayfaya Dön
                    </Link>
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
            <div className="relative h-[480px] w-full group">
                {gallery.length > 0 ? (
                    <GallerySlider images={gallery} salonName={salon.name} />
                ) : (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                        style={{ backgroundImage: `url("${salon.image}")` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 z-10 pointer-events-none">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6 pointer-events-auto">
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

                        {/* Tab Navigation */}
                        <div className="flex border-b border-border mb-8">
                            <button
                                onClick={() => setActiveTab('services')}
                                className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === 'services' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-primary'}`}
                            >
                                Hizmetler
                            </button>
                            <button
                                onClick={() => setActiveTab('staff-reviews')}
                                className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === 'staff-reviews' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-primary'}`}
                            >
                                Uzman Yorumları
                            </button>
                        </div>

                        {activeTab === 'services' && (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-display font-bold text-text-main flex items-center gap-3">
                                        <span className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-symbols-outlined text-xl">content_cut</span></span>
                                        Hizmetler
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    {Object.entries(groupedServices).map(([category, items]) => (
                                        <div key={category} className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                                            <button
                                                onClick={() => toggleCategory(category)}
                                                className="w-full flex items-center justify-between p-6 bg-surface-alt hover:bg-gray-100/80 transition-colors"
                                            >
                                                <span className="text-lg font-black text-text-main uppercase tracking-tight">{category}</span>
                                                <span className={`material-symbols-outlined transition-transform duration-300 ${openCategories[category] ? 'rotate-180' : ''}`}>expand_more</span>
                                            </button>

                                            {openCategories[category] && (
                                                <div className="p-2 md:p-4 space-y-2 animate-fade-in">
                                                    {items.map((service) => (
                                                        <div key={service.id} className="flex items-center justify-between p-4 md:p-6 rounded-2xl hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/20">
                                                            <div className="flex-1">
                                                                <h4 className="font-black text-text-main group-hover:text-primary transition-colors">{service.service_name}</h4>
                                                                <p className="text-xs text-text-muted mt-1 font-bold">{service.duration_min} Dakika</p>
                                                            </div>
                                                            <div className="flex items-center gap-6">
                                                                <span className="text-lg font-black text-text-main">₺{service.price}</span>
                                                                <Link
                                                                    href={`/booking/${salon.id}/staff?serviceId=${service.id}`}
                                                                    onClick={() => setSelectedServices([service])}
                                                                    className="px-6 py-2.5 bg-primary text-white text-sm font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                                                >
                                                                    Randevu Al
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeTab === 'staff-reviews' && (
                            <section className="animate-fade-in space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-display font-bold text-text-main flex items-center gap-3">
                                        <span className="p-2 bg-amber-500/10 rounded-lg text-amber-600"><span className="material-symbols-outlined text-xl">reviews</span></span>
                                        Uzman Yorumları
                                    </h3>
                                    {user && (
                                        <button
                                            onClick={() => {
                                                // We can reuse the existing review form or create a specific one
                                                // For simplicity, scrolling to the common review section is also an option,
                                                // but letting them stay in the staff tab and showing a modal would be better.
                                                // For now, let's enable showing the review form if they have eligible appointments.
                                                if (eligibleAppointments.length > 0) {
                                                    setShowReviewForm(true);
                                                    const reviewsSection = document.getElementById('reviews');
                                                    if (reviewsSection) reviewsSection.scrollIntoView({ behavior: 'smooth' });
                                                } else {
                                                    alert("Uzmanları değerlendirmek için tamamlanmış bir randevunuz olmalıdır.");
                                                }
                                            }}
                                            className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span> Uzmanı Değerlendir
                                        </button>
                                    )}
                                </div>

                                {loadingStaffReviews ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="bg-white p-6 rounded-3xl border border-border animate-pulse h-32" />
                                        ))}
                                    </div>
                                ) : staffReviews.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {staffReviews.map((review) => (
                                            <div key={review.id} className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-gray-100 overflow-hidden relative border border-border">
                                                            {review.user_avatar ? (
                                                                <img src={review.user_avatar} alt={review.user_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                                                    {review.user_name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-text-main text-sm">{review.user_name}</p>
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span key={i} className={`material-symbols-outlined text-[14px] ${i < review.rating ? 'text-yellow-400 filled' : 'text-gray-200'}`}>star</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-text-muted font-bold">{new Date(review.created_at!).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                                <p className="text-sm text-text-secondary line-clamp-3 mb-4">{review.comment}</p>
                                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-text-muted uppercase">Uzman:</span>
                                                        <span className="text-xs font-bold text-primary">{review.staff_name}</span>
                                                    </div>
                                                    {review.is_verified && (
                                                        <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-tight">
                                                            <span className="material-symbols-outlined text-[14px]">verified</span> Onaylı
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-surface-alt p-12 rounded-[32px] text-center border-2 border-dashed border-border">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-3xl text-text-muted/30">forum</span>
                                        </div>
                                        <p className="text-text-muted font-medium">Henüz uzman bazlı yorum yapılmamış.</p>
                                    </div>
                                )}
                            </section>
                        )}

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

                                            <div className="mb-6">
                                                <label className="block text-sm font-bold text-text-main mb-3">Fotoğraf Ekle (Opsiyonel)</label>
                                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                                    {reviewImagesUrls.map((url, idx) => (
                                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                                                            <img src={url} alt="upload" className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setReviewImagesUrls(prev => prev.filter((_, i) => i !== idx))}
                                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <span className="material-symbols-outlined text-xs">close</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {reviewImagesUrls.length < 5 && (
                                                        <div className="aspect-square">
                                                            <ImageUpload
                                                                bucket="reviews"
                                                                currentImage={null}
                                                                onUpload={(url) => setReviewImagesUrls(prev => [...prev, url])}
                                                                label="Ekle"
                                                                className="h-full"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-text-secondary mt-2">En fazla 5 fotoğraf ekleyebilirsiniz.</p>
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
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-1 rounded text-xs font-bold text-yellow-600 border border-yellow-100 h-fit">
                                                            {review.rating} <span className="material-symbols-outlined text-[14px] filled">star</span>
                                                        </div>
                                                        <span className="text-text-muted text-xs bg-gray-100 px-3 py-1 rounded-full">{new Date(review.created_at || Date.now()).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                {/* Rating Score */}
                                                <div className="flex gap-1 mb-3 text-yellow-400">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <span key={s} className={`material-symbols-outlined text-sm ${s <= review.rating ? 'filled' : ''}`}>star</span>
                                                    ))}
                                                </div>

                                                <p className="text-text-main leading-relaxed mb-4">{review.comment}</p>

                                                {/* Review Images */}
                                                {review.images && review.images.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {review.images.map((img: any, idx: number) => (
                                                            <button
                                                                key={idx}
                                                                className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity"
                                                                onClick={() => {
                                                                    setLightboxState({
                                                                        isOpen: true,
                                                                        images: (review.images || []).map((i: any) => i.image_url),
                                                                        currentIndex: idx
                                                                    });
                                                                }}
                                                            >
                                                                <img src={img.image_url} alt="Review" className="w-full h-full object-cover" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
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

            {/* Review Lightbox */}
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

>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
