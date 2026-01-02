'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { SalonDataService, StaffService, ServiceService, AppointmentService } from '@/services/db';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import type { SalonDetail, Staff, SalonServiceDetail, Appointment } from '@/types';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Confirmation() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const appointmentId = searchParams.get('appointmentId');
    const salonId = params.id as string;

    const {
        salon: bookingSalon,
        selectedService: bookingService,
        selectedStaff: bookingStaff,
        selectedDate,
        selectedTime,
        customerName,
        customerPhone,
        resetBooking,
    } = useBooking();

    const { user, refreshUser } = useAuth();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [salon, setSalon] = useState<SalonDetail | null>(bookingSalon);
    const [staff, setStaff] = useState<Staff | null>(bookingStaff);
    const [service, setService] = useState<SalonServiceDetail | null>(bookingService);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Force refresh auth state on mount to catch the new cookie
    useEffect(() => {
        const checkAuth = async () => {
            console.log('🔄 Checking auth state on confirmation page...');
            
            // 1. Check current session
            const { data: { session } } = await supabase.auth.getSession();
            console.log('   Current Session:', session ? 'Active' : 'None');

            if (session) {
                // 2. If session exists, refresh user context
                await refreshUser();
            } else {
                // 3. If no session, try refreshing it (sometimes cookies take a moment)
                const { data: refreshedSession } = await supabase.auth.refreshSession();
                if (refreshedSession.session) {
                    console.log('   Session refreshed successfully');
                    await refreshUser();
                } else {
                    // 4. If still no session, try one more time after a short delay
                    setTimeout(async () => {
                        console.log('   Retrying session check after delay...');
                        const { data: retrySession } = await supabase.auth.getSession();
                        if (retrySession.session) {
                            console.log('   Session found on retry!');
                            await refreshUser();
                        }
                    }, 1000);
                }
            }
        };
        
        checkAuth();
    }, [refreshUser]);

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                setLoading(true);

                // Context'te zaten tüm bilgiler varsa API'ye gerek yok
                if (bookingSalon && bookingService && bookingStaff && selectedDate && selectedTime) {
                    console.log('Using context data - no API call needed');
                    setLoading(false);
                    return;
                }

                // Sadece appointmentId varsa ve context boşsa API'den çek
                if (appointmentId) {
                    const appointmentData = await AppointmentService.getAppointmentById(appointmentId);

                    if (!appointmentData) {
                        setError('Randevu bulunamadi');
                        setLoading(false);
                        return;
                    }

                    setAppointment(appointmentData);

                    if (!bookingSalon) {
                        const salonData = await SalonDataService.getSalonById(appointmentData.salon_id);
                        setSalon(salonData);
                    }

                    if (!bookingStaff) {
                        const staffData = await StaffService.getStaffById(appointmentData.staff_id);
                        setStaff(staffData);
                    }

                    if (!bookingService) {
                        const serviceData = await ServiceService.getServiceById(appointmentData.salon_service_id);
                        setService(serviceData);
                    }
                } else {
                    setError('Randevu bilgileri eksik');
                    setLoading(false);
                    return;
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching booking data:', err);
                setError('Randevu bilgileri yuklenirken bir hata olustu');
                setLoading(false);
            }
        };

        fetchBookingData();
    }, [appointmentId, bookingSalon, bookingService, bookingStaff, selectedDate, selectedTime]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-20 bg-background min-h-screen">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-text-secondary">Randevu bilgileri yukleniyor...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-20 bg-background min-h-screen">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md">
                            <span className="material-symbols-outlined text-6xl text-red-500">error</span>
                            <h2 className="text-2xl font-bold text-text-main mt-4">Hata</h2>
                            <p className="text-text-secondary mt-2">{error}</p>
                            <Link href="/" className="mt-6 inline-block px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover">
                                Ana Sayfaya Don
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-20 bg-background min-h-screen">
                <div className="w-full max-w-[900px]">
                    <div className="bg-white rounded-xl border border-border p-6 lg:p-10 shadow-card text-center">
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
                            </div>
                            <h1 className="text-3xl font-bold text-text-main">Randevunuz Onaylandi!</h1>
                            <p className="text-text-secondary mt-2">
                                Randevu detaylariniz asagidadir. Telefonunuza SMS ile de bilgilendirme yapilmistir.
                            </p>
                            
                            {/* User Status Badge */}
                            <div className="mt-4 flex justify-center">
                                {user ? (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                        <span className="material-symbols-outlined text-lg">verified_user</span>
                                        Giriş Yapıldı: {user.full_name || user.phone}
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium border border-gray-200">
                                        <span className="material-symbols-outlined text-lg">person_off</span>
                                        Misafir Kullanıcı (Giriş Yapılmadı)
                                    </div>
                                )}
                            </div>
                        </div>

                        {salon && staff && service && (
                            <div className="mt-8 text-left bg-gray-50 p-6 rounded-lg border border-border space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">store</span>
                                        Salon
                                    </span>
                                    <span className="font-bold text-text-main">{salon.name}</span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">content_cut</span>
                                        Hizmet
                                    </span>
                                    <span className="font-bold text-text-main">{service.service_name}</span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">person</span>
                                        Personel
                                    </span>
                                    <span className="font-bold text-text-main">{staff.name}</span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">calendar_today</span>
                                        Tarih
                                    </span>
                                    <span className="font-bold text-text-main">
                                        {appointment ? formatDate(appointment.start_time) : selectedDate}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">schedule</span>
                                        Saat
                                    </span>
                                    <span className="font-bold text-text-main">
                                        {appointment ? formatTime(appointment.start_time) : selectedTime}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">timer</span>
                                        Sure
                                    </span>
                                    <span className="font-bold text-text-main">{service.duration_min} dakika</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">payments</span>
                                        Ucret
                                    </span>
                                    <span className="font-bold text-primary text-xl">{service.price} TL</span>
                                </div>
                            </div>
                        )}

                        {(customerName || customerPhone || appointment) && (
                            <div className="mt-6 text-left bg-blue-50 p-6 rounded-lg border border-blue-200">
                                <h3 className="font-bold text-text-main mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">account_circle</span>
                                    Musteri Bilgileri
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary">Ad Soyad:</span>
                                        <span className="font-semibold text-text-main">
                                            {appointment?.customer_name || customerName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary">Telefon:</span>
                                        <span className="font-semibold text-text-main">
                                            {appointment?.customer_phone || customerPhone}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2 text-left">
                                <span className="material-symbols-outlined text-yellow-600 flex-shrink-0">info</span>
                                <div className="text-sm text-yellow-800">
                                    <p className="font-semibold mb-1">Onemli Hatirlatma</p>
                                    <p>Randevu saatinizden en az 15 dakika once salonda olmaniz onerilir. Iptal veya degisiklik icin lutfen salonu arayin.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/"
                                onClick={() => resetBooking()}
                                className="px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">home</span>
                                Ana Sayfaya Don
                            </Link>
                            
                            {user && (
                                <Link
                                    href="/profile"
                                    className="px-8 py-3 bg-white border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">person</span>
                                    Profilime Git
                                </Link>
                            )}
                            
                            <button
                                onClick={() => window.print()}
                                className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">print</span>
                                Yazdir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
