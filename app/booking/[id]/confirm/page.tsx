'use client';

import { toErrorLike } from '@/lib/error-mapping';
import React, { useState, useEffect } from 'react';
import { BookingStepSkeleton } from '@/components/common/PageSkeletons';
import { Layout } from '@/components/Layout';
import { SalonDataService, StaffService, ServiceService, AppointmentService } from '@/services/db';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import type { SalonDetail, Staff, SalonServiceDetail, Appointment } from '@/types';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { downloadIcs } from '@/lib/calendar/ics';
import PrintTicket from '@/components/booking/PrintTicket';
import { TriangleAlert, MessageSquare, CircleAlert, ShieldCheck, UserX, Store, Scissors, User, Calendar, Clock, Timer, Banknote, Tag, CircleUserRound, Info, House, RotateCcw, CalendarPlus, Printer, CircleCheck, Hourglass } from 'lucide-react';
import '@/components/booking/print-ticket.css';

function SmsResendPanel({ appointmentId }: { appointmentId: string }) {
    const [loading, setLoading] = React.useState(false);
    const [result, setResult] = React.useState<{ ok: boolean; msg: string } | null>(null);

    const resend = async () => {
        if (!appointmentId) return;
        setLoading(true);
        setResult(null);
        try {
            const r = await fetch(`/api/appointments/${appointmentId}/resend-sms`, { method: 'POST' });
            const data = await r.json();
            if (r.ok && data.success) {
                setResult({ ok: true, msg: 'SMS yeniden gönderildi. Telefonu kontrol edin.' });
            } else {
                setResult({ ok: false, msg: data.error || 'Gönderilemedi.' });
            }
        } catch (e: unknown) {
            setResult({ ok: false, msg: toErrorLike(e).message || 'Ağ hatası.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 mx-auto max-w-lg p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-2 text-left">
            <div className="flex items-start gap-2">
                <TriangleAlert className="w-5 h-5 text-primary mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800">SMS gönderilemedi</p>
                    <p className="text-xs text-primary mt-0.5">
                        Randevunuz oluşturuldu fakat SMS gönderiminde sorun yaşandı. Aşağıdaki butonla
                        tekrar deneyebilir veya bu sayfanın çıktısını alarak salonu arayabilirsiniz.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={resend}
                    disabled={loading || !appointmentId}
                    className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    {loading ? 'Gönderiliyor...' : 'SMS Tekrar Gönder'}
                </button>
                {result && (
                    <span className={`text-xs font-bold ${result.ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {result.msg}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function Confirmation() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const appointmentId = searchParams.get('appointmentId');
    const smsFailed = searchParams.get('smsFailed') === '1';
    const salonId = params.id as string;

    const {
        salon: bookingSalon,
        selectedServices,
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
    const [services, setServices] = useState<SalonServiceDetail[]>(selectedServices);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Force refresh auth state on mount to catch the new cookie
    useEffect(() => {
        const checkAuth = async () => {

            // 1. Check current session
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // 2. If session exists, refresh user context
                await refreshUser();
            } else {
                // 3. If no session, try refreshing it (sometimes cookies take a moment)
                const { data: refreshedSession } = await supabase.auth.refreshSession();
                if (refreshedSession.session) {
                    await refreshUser();
                } else {
                    // 4. If still no session, try one more time after a short delay
                    setTimeout(async () => {
                        const { data: retrySession } = await supabase.auth.getSession();
                        if (retrySession.session) {
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
                if (bookingSalon && selectedServices.length > 0 && bookingStaff && selectedDate && selectedTime) {
                    setServices(selectedServices);
                    setLoading(false);
                    return;
                }

                // Sadece appointmentId varsa ve context boşsa API'den çek
                if (appointmentId) {
                    const appointmentData = await AppointmentService.getAppointmentById(appointmentId);

                    if (!appointmentData) {
                        setError('Randevu bulunamadı');
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

                    if (selectedServices.length === 0) {
                        const serviceData = await ServiceService.getServiceById(appointmentData.salon_service_id);
                        if (serviceData) setServices([serviceData]);
                    }
                } else {
                    setError('Randevu bilgileri eksik');
                    setLoading(false);
                    return;
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching booking data:', err);
                setError('Randevu bilgileri yüklenirken bir hata oluştu');
                setLoading(false);
            }
        };

        fetchBookingData();
    }, [appointmentId, bookingSalon, selectedServices, bookingStaff, selectedDate, selectedTime]);

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
                <BookingStepSkeleton />
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-20 bg-background min-h-screen">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md">
                            <CircleAlert className="w-14 h-14 text-red-500 mx-auto" aria-hidden="true" />
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
                            {/* Status'a göre dinamik başlık + ikon */}
                            <div className={`w-20 h-20 ${appointment?.status === 'CONFIRMED' ? 'bg-green-100' : 'bg-amber-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                {appointment?.status === 'CONFIRMED'
                                    ? <CircleCheck className="w-12 h-12 text-green-600" aria-hidden="true" />
                                    : <Hourglass className="w-12 h-12 text-primary" aria-hidden="true" />}
                            </div>
                            <h1 className="text-3xl font-bold text-text-main">
                                {appointment?.status === 'CONFIRMED'
                                    ? 'Randevunuz Onaylandı!'
                                    : 'Randevu Başvurunuz Alındı'}
                            </h1>
                            <p className="text-text-secondary mt-2">
                                {appointment?.status === 'CONFIRMED'
                                    ? `Randevu detaylarınız aşağıdadır.${smsFailed ? '' : ' Telefonunuza SMS ile de bilgilendirme yapılmıştır.'}`
                                    : `Salonun onayı bekleniyor. Onaylandığında size SMS ile bilgi verilecek.${smsFailed ? '' : ' Başvurunuz salona iletildi.'}`}
                            </p>

                            {smsFailed && (
                                <SmsResendPanel appointmentId={searchParams.get('appointmentId') || appointment?.id || ''} />
                            )}

                            {/* User Status Badge */}
                            <div className="mt-4 flex justify-center">
                                {user ? (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                        <ShieldCheck className="w-[18px] h-[18px]" aria-hidden="true" />
                                        Giriş Yapıldı: {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.phone}
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium border border-gray-200">
                                        <UserX className="w-[18px] h-[18px]" aria-hidden="true" />
                                        Misafir Kullanıcı (Giriş Yapılmadı)
                                    </div>
                                )}
                            </div>
                        </div>

                        {salon && staff && services.length > 0 && (
                            <div className="mt-8 text-left bg-gray-50 p-6 rounded-lg border border-border space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <Store className="w-6 h-6 text-primary" aria-hidden="true" />
                                        Salon
                                    </span>
                                    <span className="font-bold text-text-main">{salon.name}</span>
                                </div>

                                <div className="space-y-3 pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <Scissors className="w-6 h-6 text-primary" aria-hidden="true" />
                                        Hizmetler
                                    </span>
                                    {services.map((svc) => (
                                        <div key={svc.id} className="flex justify-between items-center pl-7">
                                            <span className="text-text-main">{svc.service_name}</span>
                                            <span className="font-bold text-text-main">{svc.price} TL</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <User className="w-6 h-6 text-primary" aria-hidden="true" />
                                        Personel
                                    </span>
                                    <span className="font-bold text-text-main">{staff.name}</span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <Calendar className="w-6 h-6 text-primary" aria-hidden="true" />
                                        Tarih
                                    </span>
                                    <span className="font-bold text-text-main">
                                        {appointment ? formatDate(appointment.start_time) : (selectedDate || '')}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <Clock className="w-6 h-6 text-primary" aria-hidden="true" />
                                        Saat
                                    </span>
                                    <span className="font-bold text-text-main">
                                        {appointment ? formatTime(appointment.start_time) : (selectedTime || '')}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <Timer className="w-6 h-6 text-primary" aria-hidden="true" />
                                        Toplam Süre
                                    </span>
                                    <span className="font-bold text-text-main">
                                        {services.reduce((acc, s) => acc + (s.duration_min || 0), 0)} dakika
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-text-secondary flex items-center gap-2">
                                        <Banknote className="w-6 h-6 text-primary" aria-hidden="true" />
                                        Toplam Ücret
                                    </span>
                                    <div className="text-right">
                                        {(appointment?.discount_amount && appointment.discount_amount > 0) ? (
                                            <>
                                                <div className="text-sm text-text-muted line-through">
                                                    {services.reduce((acc, s) => acc + (s.price || 0), 0)} TL
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-primary text-xl">
                                                        {services.reduce((acc, s) => acc + (s.price || 0), 0) - (appointment.discount_amount || 0)} TL
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 mt-1">
                                                        <Tag className="w-3 h-3" aria-hidden="true" />
                                                        {appointment.coupon_code} Uygulandı
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="font-bold text-primary text-xl">
                                                {services.reduce((acc, s) => acc + (s.price || 0), 0)} TL
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(customerName || customerPhone || appointment) && (
                            <div className="mt-6 text-left bg-blue-50 p-6 rounded-lg border border-blue-200">
                                <h3 className="font-bold text-text-main mb-3 flex items-center gap-2">
                                    <CircleUserRound className="w-6 h-6 text-primary" aria-hidden="true" />
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
                                <Info className="w-6 h-6 text-yellow-600 flex-shrink-0" aria-hidden="true" />
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
                                <House className="w-6 h-6" aria-hidden="true" />
                                Ana Sayfaya Don
                            </Link>

                            {user && (
                                <Link
                                    href="/customer/profile"
                                    className="px-8 py-3 bg-white border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                                >
                                    <User className="w-6 h-6" aria-hidden="true" />
                                    Profilime Git
                                </Link>
                            )}

                            {salon?.id && (
                                <Link
                                    href={`/salon/${salon.id}`}
                                    className="px-8 py-3 bg-white border-2 border-emerald-300 text-emerald-700 rounded-lg font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-6 h-6" aria-hidden="true" />
                                    Yeni Randevu Al
                                </Link>
                            )}

                            {appointment && appointment.start_time && (
                                <button
                                    onClick={() => {
                                        const start = new Date(appointment.start_time);
                                        const end = appointment.end_time ? new Date(appointment.end_time) : new Date(start.getTime() + 60 * 60 * 1000);
                                        const firstService: (SalonServiceDetail & { name?: string }) | undefined = services?.[0];
                                        const serviceName = firstService?.name || firstService?.service_name || 'Randevu';
                                        const salonName = salon?.name || 'Salon';
                                        downloadIcs({
                                            uid: appointment.id,
                                            start,
                                            end,
                                            summary: `${serviceName} — ${salonName}`,
                                            description: `Randevu No: ${appointment.id}\n${staff?.name ? `Uzman: ${staff.name}` : ''}`,
                                            location: salon?.address || undefined,
                                            organizer: salonName,
                                        }, `randevu-${appointment.id}.ics`);
                                    }}
                                    className="px-8 py-3 bg-white border-2 border-primary/40 text-primary rounded-lg font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CalendarPlus className="w-6 h-6" aria-hidden="true" />
                                    Takvime Ekle
                                </button>
                            )}

                            <button
                                onClick={() => window.print()}
                                className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Printer className="w-6 h-6" aria-hidden="true" />
                                Yazdir
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Yazdırma için optimize edilmiş ticket — ekranda gizli, sadece print'te görünür */}
            {/* appointment henüz yüklenmediyse BookingContext'ten enriched fallback obje üret */}
            <PrintTicket
                appointment={appointment || (selectedDate && selectedTime ? {
                    id: searchParams.get('appointmentId') || 'pending',
                    start_time: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
                    end_time: new Date(new Date(`${selectedDate}T${selectedTime}:00`).getTime() + 60 * 60 * 1000).toISOString(),
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    status: 'PENDING',
                } : null)}
                salon={salon}
                staff={staff}
                services={services}
                customerName={customerName}
                customerPhone={customerPhone}
            />
        </Layout>
    );
}
