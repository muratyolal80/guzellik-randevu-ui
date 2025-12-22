'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { BookingSummary } from '@/components/BookingSummary';
import { SalonDataService, StaffService, ServiceService, AppointmentService } from '@/services/db';
import { useParams, useSearchParams } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import type { SalonDetail, Staff, SalonServiceDetail, Appointment } from '@/types';

export default function Confirmation() {
    const params = useParams();
    const searchParams = useSearchParams();
    const appointmentId = searchParams.get('appointmentId'); // Optional: for viewing existing appointment
    const salonId = params.id as string;

    // Get booking context (for new bookings during flow)
    const {
        salon: bookingSalon,
        selectedService: bookingService,
        selectedStaff: bookingStaff,
        selectedDate,
        selectedTime
    } = useBooking();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [salon, setSalon] = useState<SalonDetail | null>(bookingSalon);
    const [staff, setStaff] = useState<Staff | null>(bookingStaff);
    const [service, setService] = useState<SalonServiceDetail | null>(bookingService);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                setLoading(true);

                // If appointmentId is provided, fetch existing appointment
                if (appointmentId) {
                    const appointmentData = await AppointmentService.getAppointmentById(appointmentId);

                    if (!appointmentData) {
                        setError('Randevu bulunamadı');
                        setLoading(false);
                        return;
                    }

                    setAppointment(appointmentData);

                    // Fetch related data in parallel
                    const [salonData, staffData, serviceData] = await Promise.all([
                        SalonDataService.getSalonById(appointmentData.salon_id),
                        StaffService.getStaffById(appointmentData.staff_id),
                        ServiceService.getServiceById(appointmentData.salon_service_id)
                    ]);

                    setSalon(salonData);
                    setStaff(staffData);
                    setService(serviceData);
                } else {
                    // No appointmentId - this is during booking flow
                    // Use booking context data or fetch if missing
                    if (!bookingSalon && salonId) {
                        const salonData = await SalonDataService.getSalonById(salonId);
                        setSalon(salonData);
                    }

                    // Check if we have all required data from context
                    if (!bookingSalon || !bookingService || !bookingStaff) {
                        setError('Randevu bilgileri eksik. Lütfen baştan başlayın.');
                        setLoading(false);
                        return;
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching booking data:', err);
                setError('Randevu bilgileri yüklenirken bir hata oluştu');
                setLoading(false);
            }
        };

        fetchBookingData();
    }, [appointmentId, salonId, bookingSalon, bookingService, bookingStaff]);

    // Calculate totals
    const totalPrice = service?.price || 0;
    const totalDuration = service?.duration_min ? `${service.duration_min} dakika` : 'Belirsiz';

    return (
        <Layout>
            <div className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-20 bg-background min-h-screen">
                <div className="w-full max-w-[1280px] flex flex-col gap-8">
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-text-secondary">Randevu bilgileri yükleniyor...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md">
                                <span className="material-symbols-outlined text-6xl text-red-500">error</span>
                                <h2 className="text-2xl font-bold text-text-main mt-4">Hata</h2>
                                <p className="text-text-secondary mt-2">{error}</p>
                                <a href="/" className="mt-6 inline-block px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover">
                                    Ana Sayfaya Dön
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            <div className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-24 order-2 lg:order-1">
                                {salon && staff && service && (
                                    <BookingSummary
                                        salon={salon}
                                        staff={staff}
                                        services={[service]}
                                        totalPrice={totalPrice}
                                        totalDuration={totalDuration}
                                        step={3}
                                    />
                                )}
                            </div>
                            <main className="flex-1 w-full min-w-0 order-1 lg:order-2">
                                <div className="bg-white rounded-xl border border-border p-6 lg:p-8 shadow-card text-center">
                                    <span className="material-symbols-outlined text-6xl text-green-500">check_circle</span>
                                    <h1 className="text-3xl font-bold text-text-main mt-4">Randevunuz Onaylandı!</h1>
                                    <p className="text-text-secondary mt-2">Randevu detaylarınız aşağıdadır. E-posta ve SMS ile de bilgilendirme yapılmıştır.</p>

                                    {appointment && salon && staff && service && (
                                        <div className="mt-8 text-left bg-gray-50 p-6 rounded-lg border border-border space-y-3">
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                                <span className="font-semibold text-text-secondary">Salon:</span>
                                                <span className="font-bold text-text-main">{salon.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                                <span className="font-semibold text-text-secondary">Personel:</span>
                                                <span className="font-bold text-text-main">{staff.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                                <span className="font-semibold text-text-secondary">Tarih & Saat:</span>
                                                <span className="font-bold text-text-main">
                                                    {new Date(appointment.start_time).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })} - {new Date(appointment.start_time).toLocaleTimeString('tr-TR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                                <span className="font-semibold text-text-secondary">Hizmet:</span>
                                                <span className="font-bold text-text-main">{service.service_name}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                                <span className="font-semibold text-text-secondary">Süre:</span>
                                                <span className="font-bold text-text-main">{totalDuration}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="font-semibold text-text-secondary text-lg">Toplam Tutar:</span>
                                                <span className="font-bold text-primary text-xl">{totalPrice} ₺</span>
                                            </div>

                                            {appointment.notes && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <span className="font-semibold text-text-secondary block mb-2">Notlar:</span>
                                                    <p className="text-text-main text-sm bg-white p-3 rounded border border-gray-200">
                                                        {appointment.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                                        <a
                                            href={salon ? `/salon/${salon.id}` : '/'}
                                            className="px-6 py-3 bg-gray-100 text-text-main rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            Salona Git
                                        </a>
                                        <a
                                            href="/"
                                            className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors"
                                        >
                                            Ana Sayfaya Dön
                                        </a>
                                    </div>
                                </div>
                            </main>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

