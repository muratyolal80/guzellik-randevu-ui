'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { SalonDataService, StaffService, ServiceService } from '@/services/db';
import { Layout } from '@/components/Layout';
import { BookingSummary } from '@/components/BookingSummary';
import { GeminiChat } from '@/components/GeminiChat';
import { useBooking } from '@/context/BookingContext';
import type { SalonDetail, Staff, SalonServiceDetail } from '@/types';

export default function TimeSelection() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const staffId = searchParams.get('staffId');
  const {
    salon: bookingSalon,
    setSalon: setBookingSalon,
    selectedService,
    selectedStaff: bookingStaff,
    setSelectedDate: setBookingDate,
    setSelectedTime: setBookingTime,
    appointmentId
  } = useBooking();

  const [salon, setSalon] = useState<SalonDetail | null>(bookingSalon);
  const [staff, setStaff] = useState<Staff | null>(bookingStaff);
  const [services, setServices] = useState<SalonServiceDetail[]>(selectedService ? [selectedService] : []);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateOffset, setDateOffset] = useState(0);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Fetch available slots when date or staff changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!id || !selectedService?.id) return;

      setLoadingSlots(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];

        let url = `/api/booking/available-slots?salon_id=${id}&service_id=${selectedService.id}&date=${dateStr}`;
        if (staff?.id && staff.id !== 'any') {
          url += `&staff_id=${staff.id}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          // Map available slots for the UI
          // We'll trust the API to only return valid strings
          setAvailableTimeSlots(data.slots || []);
        } else {
          console.error('❌ API Error:', data.error);
          setAvailableTimeSlots([]);
        }
      } catch (error) {
        console.error('❌ Fetch Error:', error);
        setAvailableTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, staff?.id, id, selectedService?.id]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Use booking context data if available, otherwise fetch
        let salonData = bookingSalon;
        if (!salonData) {
          salonData = await SalonDataService.getSalonById(id);
          setSalon(salonData);
          if (salonData) setBookingSalon(salonData);
        }

        // If we have selected service from context, use it
        if (selectedService) {
          setServices([selectedService]);
        } else {
          // Fallback: fetch all services
          const servicesData = await ServiceService.getServicesBySalon(id);
          setServices(servicesData);
        }

        // Use booking context staff if available
        if (bookingStaff) {
          setStaff(bookingStaff);
        } else if (staffId && staffId !== 'any') {
          const staffData = await StaffService.getStaffById(staffId);
          if (staffData) {
            setStaff({
              ...staffData,
              image: staffData.photo || `https://i.pravatar.cc/150?u=${staffData.id}`,
              role: staffData.specialty || 'Uzman',
              rating: 4.5,
              isOnline: staffData.is_active
            });
          }
        } else {
          // "Any staff" option
          setStaff({
            id: 'any',
            salon_id: id,
            name: 'Herhangi Bir Personel',
            specialty: 'Otomatik Atama',
            is_active: true,
            created_at: new Date().toISOString(),
            role: 'Otomatik Atama',
            rating: 0,
            image: 'https://i.pravatar.cc/150?u=any',
            isOnline: false
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, staffId, bookingSalon, bookingStaff, selectedService, setBookingSalon]);

  // Generate dynamic dates array starting from today
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    for (let i = dateOffset; i < dateOffset + 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay();
      const isSunday = dayOfWeek === 0; // Sunday is typically closed

      let displayName = dayNames[dayOfWeek];
      if (i === 0) displayName = 'Bugün';
      else if (i === 1) displayName = 'Yarın';

      dates.push({
        date: date,
        day: date.getDate(),
        month: monthNames[date.getMonth()],
        name: displayName,
        disabled: isSunday,
        active: date.toDateString() === selectedDate.toDateString()
      });
    }

    return dates;
  };

  const dates = generateDates();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset selected time slot when date changes
  };

  const handlePrevDates = () => {
    if (dateOffset > 0) {
      setDateOffset(dateOffset - 1);
    }
  };

  const handleNextDates = () => {
    setDateOffset(dateOffset + 1);
  };

  // Slots are now fetched directly from the API (they are already filtered as FREE)
  const morningSlots = availableTimeSlots.filter(slot => slot < '12:00');
  const afternoonSlots = availableTimeSlots.filter(slot => slot >= '12:00');

  // Calculate totals from services
  const totalPrice = services.reduce((sum, s) => sum + Number(s.price || 0), 0);
  const totalDuration = services.reduce((sum, s) => sum + (s.duration_min || 0), 0);
  const totalDurationStr = `${Math.floor(totalDuration / 60)} sa ${totalDuration % 60} dk`;

  // Safe navigation function
  const handleContinue = () => {
    if (!selectedSlot) return;

    // 1. Update Context
    const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    setBookingDate(dateStr);
    setBookingTime(selectedSlot);

    // 2. Navigate immediately (Context update will be picked up by next page)
    const params = new URLSearchParams();
    if (staff?.id) params.set('staffId', staff.id);
    params.set('date', dateStr);
    params.set('time', selectedSlot);
    if (appointmentId) params.set('appointmentId', appointmentId);

    router.push(`/booking/${id}/user-info?${params.toString()}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-20 bg-background min-h-screen">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!salon) {
    return (
      <Layout>
        <div className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-20 bg-background min-h-screen">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-text-main mb-4">Salon bulunamadı</h2>
            <Link href="/" className="text-primary hover:underline">Ana sayfaya dön</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-20 bg-background min-h-screen">
        <div className="w-full max-w-[1280px] flex flex-col gap-8">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 px-4">
            <Link href="/" className="text-text-secondary text-sm font-medium hover:text-text-main transition-colors">Salon Seçimi</Link>
            <span className="material-symbols-outlined text-text-muted text-sm">chevron_right</span>
            <Link href={`/booking/${id}/staff`} className="text-text-secondary text-sm font-medium hover:text-text-main transition-colors">Hizmet Seçimi</Link>
            <span className="material-symbols-outlined text-text-muted text-sm">chevron_right</span>
            <span className="text-primary text-sm font-bold border-b border-primary pb-0.5">Zaman Slotları (Adım 3)</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Sidebar (Reused BookingSummary logic but positioned left for this screen design) */}
            <div className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-24 order-2 lg:order-1">
              <BookingSummary
                salon={salon}
                services={services as any}
                staff={staff}
                totalPrice={totalPrice}
                totalDuration={totalDurationStr}
                step={2}
              />
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full min-w-0 order-1 lg:order-2">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <h1 className="text-text-main text-3xl font-bold leading-tight">Randevu Zamanını Seçin</h1>
                  <p className="text-text-secondary text-base">Müsaitlik durumuna göre size en uygun zaman dilimini belirleyin.</p>
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-4 w-full overflow-x-auto pb-4 pt-2 no-scrollbar">
                  <button
                    onClick={handlePrevDates}
                    disabled={dateOffset === 0}
                    className="flex-shrink-0 size-10 rounded-full border border-border bg-white text-text-secondary hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {dates.map((d, i) => (
                    <button
                      key={i}
                      disabled={d.disabled}
                      onClick={() => !d.disabled && handleDateSelect(d.date)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[80px] h-[90px] rounded-xl border transition-all relative overflow-hidden group shadow-sm ${d.active ? 'border-2 border-primary bg-primary/5' : d.disabled ? 'border-border bg-gray-100 opacity-50 cursor-not-allowed' : 'border-border bg-white hover:border-primary/50 hover:bg-primary/5 cursor-pointer'}`}
                    >
                      {d.active && <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>}
                      <span className={`relative text-xs font-bold uppercase tracking-wider mb-1 ${d.active ? 'text-primary' : 'text-text-secondary'}`}>{d.name}</span>
                      <span className="relative text-text-main text-2xl font-bold">{d.day}</span>
                      <span className="relative text-text-secondary text-xs">{d.month}</span>
                      {d.disabled && <span className="absolute bottom-1 text-[10px] text-red-500">Kapalı</span>}
                    </button>
                  ))}
                  <button
                    onClick={handleNextDates}
                    className="flex-shrink-0 size-10 rounded-full border border-border bg-white text-text-secondary hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>

                {/* Slots */}
                <div className="bg-white rounded-xl border border-border p-6 lg:p-8 shadow-card">
                  <div className="flex gap-6 mb-6 text-sm border-b border-border pb-4">
                    <div className="flex items-center gap-2"><span className="size-3 rounded-full bg-white border-2 border-primary shadow-sm"></span><span className="text-text-main">Müsait</span></div>
                    <div className="flex items-center gap-2"><span className="size-3 rounded-full bg-gray-200"></span><span className="text-text-muted">Dolu</span></div>
                    <div className="flex items-center gap-2"><span className="size-3 rounded-full bg-primary border border-primary"></span><span className="text-text-main">Seçili</span></div>
                  </div>

                  {/* Morning */}
                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 text-text-main text-sm font-bold uppercase tracking-wider mb-4">
                      <span className="material-symbols-outlined text-primary text-lg">wb_sunny</span> Sabah (09:00 - 12:00)
                    </h3>
                    {loadingSlots ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : slotsError ? (
                      <div className="text-center py-8">
                        <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">event_busy</span>
                        <p className="text-text-secondary text-sm">{slotsError}</p>
                      </div>
                    ) : morningSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <span className="material-symbols-outlined text-gray-300 text-4xl mb-2">schedule</span>
                        <p className="text-text-muted text-sm">Sabah saatlerinde müsait slot yok</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {morningSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedSlot(time)}
                            className={`group relative py-3 px-2 rounded-lg border transition-all flex flex-col justify-center items-center gap-0.5 ${selectedSlot === time ? 'bg-primary text-white border-primary shadow-md transform scale-105 z-10' : 'border-border bg-white hover:border-primary hover:text-primary'}`}
                          >
                            {selectedSlot === time && <div className="absolute -top-2 -right-2 size-5 bg-white text-primary border border-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[14px] font-bold">check</span></div>}
                            <span className={`text-sm font-bold ${selectedSlot === time ? 'text-white' : 'text-text-main'}`}>{time}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Afternoon */}
                  <div>
                    <h3 className="flex items-center gap-2 text-text-main text-sm font-bold uppercase tracking-wider mb-4">
                      <span className="material-symbols-outlined text-primary text-lg">light_mode</span> Öğleden Sonra (12:00 - 19:00)
                    </h3>
                    {loadingSlots ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : slotsError ? (
                      <div className="text-center py-8">
                        <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">event_busy</span>
                        <p className="text-text-secondary text-sm">{slotsError}</p>
                      </div>
                    ) : afternoonSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <span className="material-symbols-outlined text-gray-300 text-4xl mb-2">schedule</span>
                        <p className="text-text-muted text-sm">Öğleden sonra müsait slot yok</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {afternoonSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedSlot(time)}
                            className={`group relative py-3 px-2 rounded-lg border transition-all flex flex-col justify-center items-center gap-0.5 ${selectedSlot === time ? 'bg-primary text-white border-primary shadow-md transform scale-105 z-10' : 'border-border bg-white hover:border-primary hover:text-primary'}`}
                          >
                            {selectedSlot === time && <div className="absolute -top-2 -right-2 size-5 bg-white text-primary border border-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[14px] font-bold">check</span></div>}
                            <span className={`text-sm font-bold ${selectedSlot === time ? 'text-white' : 'text-text-main'}`}>{time}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                  <Link href={`/booking/${id}/staff`} className="flex items-center gap-2 px-6 py-3 rounded-lg text-text-secondary font-medium hover:bg-gray-100 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span> Geri Dön
                  </Link>
                  <button
                    onClick={handleContinue}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-primary/40 hover:-translate-y-0.5 transition-all ${!selectedSlot ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    Devam Et
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <GeminiChat />
    </Layout>
  );
};

