'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { BookingSummary } from '@/components/BookingSummary';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import type { SalonDetail, Staff, SalonServiceDetail } from '@/types';

export default function BookingUserInfoPage() {
  const params = useParams();
  const searchParams = useSearchParams(); // Add useSearchParams
  const router = useRouter();
  const id = params.id as string;
  const qAppointmentId = searchParams.get('appointmentId'); // Get from URL

  const {
    salon,
    selectedService,
    selectedStaff,
    selectedDate,
    selectedTime,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerNotes,
    setCustomerNotes,
    appointmentId,
    setAppointmentId
  } = useBooking();

  // If appointmentId is in URL but not context, set it (recover state on refresh)
  useEffect(() => {
    if (qAppointmentId && !appointmentId) {
      setAppointmentId(qAppointmentId);
    }
  }, [qAppointmentId, appointmentId, setAppointmentId]);

  const {
    refreshUser,
    user
  } = useAuth();

  // Step 1: Phone Input
  // Step 2: OTP Input
  // Step 3: Details Form (Name, Email, Notes)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [fullName, setFullName] = useState(customerName || '');
  const [phone, setPhone] = useState(customerPhone || '');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState(customerNotes || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect if required data is missing
  useEffect(() => {
    if (!salon || !selectedService || !selectedStaff || !selectedDate || !selectedTime) {
      router.push(`/booking/${id}/time`);
    }
  }, [salon, selectedService, selectedStaff, selectedDate, selectedTime, id, router]);

  // Auto-fill user data and skip OTP if logged in
  useEffect(() => {
    if (user) {
      // Logged-in users: Check if they have a verified phone
      // IYS requirement: Must have verified phone via SMS at least once
      if (user.phone) {
        setPhone(user.phone);
        // User has phone in auth.users, which means they verified it before
        // (verify-phone API sets the phone field)
        // Skip to step 3 (Details Form)
        setStep(3);
        setIsNewUser(false);
      } else {
        // No phone set, user must verify via SMS first (IYS compliance)
        setStep(1); // Start from phone input
      }

      if (user.first_name || user.last_name) {
        setFullName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
      }

      if (user.email && !user.email.includes('@pending.user')) {
        setEmail(user.email);
      }
    }
  }, [user]);

  const handleSendOTP = async () => {
    setError('');

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 11 || !cleanedPhone.startsWith('0')) {
      setError('Geçerli bir telefon numarası girin (0xxx xxx xx xx)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/booking/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanedPhone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(2);
        setCountdown(300); // 5 minutes
        setDemoMode(data.demoMode || false);

        if (data.demoMode) {
          // Demo mode message improvement: Show the actual generated code
          const demoCode = data.demoCode || '111111';
          setError(`DEMO MODU AKTİF: Lütfen doğrulama kodu olarak "${demoCode}" giriniz.`);
        }
      } else {
        setError(data.error || 'SMS gönderilemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');

    if (otp.length !== 6) {
      setError('6 haneli doğrulama kodunu girin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          otp,
          consent: consentGiven
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh auth context to pick up the new session
        await refreshUser();

        // Check if user exists or is new
        if (data.profile) {
          const firstName = data.profile.first_name || '';
          const lastName = data.profile.last_name || '';
          setFullName(`${firstName} ${lastName}`.trim());
          setEmail(data.profile.email || '');
          setIsNewUser(false);
        } else {
          setIsNewUser(true);
        }

        setStep(3);
      } else {
        setError(data.error || 'Doğrulama başarısız');
      }
    } catch (err) {
      console.error(err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    setError('');

    if (!fullName.trim()) {
      setError('Lütfen adınızı ve soyadınızı girin');
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);

      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointmentId || undefined, // Send appointmentId if updating
          customerName: fullName,
          email: email.trim() || undefined,
          notes,
          salonId: salon!.id,
          staffId: selectedStaff!.id,
          serviceId: selectedService!.id,
          startTime: startDateTime.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save customer info to context
        setCustomerName(fullName);
        setCustomerPhone(phone);
        setCustomerNotes(notes);

        router.refresh();
        router.push(`/booking/${id}/confirm?appointmentId=${data.appointmentId}`);
      } else {
        if (response.status === 409 || data.error?.includes('dolu')) {
          alert('Seçtiğiniz saat dilimi doldu. Lütfen başka bir saat seçin.');
          router.push(`/booking/${id}/time`);
        } else {
          setError(data.error || 'Randevu oluşturulamadı');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!salon || !selectedService || !selectedStaff) {
    return null; // Will redirect via useEffect
  }

  const totalPrice = selectedService.price || 0;
  const totalDuration = `${selectedService.duration_min} dakika`;

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
            <Link href={`/booking/${id}/time`} className="text-text-secondary text-sm font-medium hover:text-text-main transition-colors">Tarih/Saat</Link>
            <span className="material-symbols-outlined text-text-muted text-sm">chevron_right</span>
            <span className="text-primary text-sm font-bold border-b border-primary pb-0.5">Bilgileriniz (Adım 4)</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Sidebar - Booking Summary */}
            <div className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-24 order-2 lg:order-1">
              <BookingSummary
                salon={salon}
                services={[selectedService]}
                staff={selectedStaff}
                totalPrice={totalPrice}
                totalDuration={totalDuration}
                step={3}
              />
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full min-w-0 order-1 lg:order-2">
              <div className="bg-white rounded-xl border border-border p-6 lg:p-8 shadow-card">
                <div className="flex flex-col gap-2 mb-6">
                  <h1 className="text-text-main text-3xl font-bold leading-tight">
                    {step === 1 ? 'Telefon Numaranızı Girin' :
                      step === 2 ? 'Doğrulama Kodu' :
                        'Bilgilerinizi Tamamlayın'}
                  </h1>
                  <p className="text-text-secondary text-base">
                    {step === 1 ? 'Randevu onayı için telefonunuza SMS göndereceğiz.' :
                      step === 2 ? `${phone} numarasına gönderilen kodu girin.` :
                        'Randevunuzu oluşturmak için son adım.'}
                  </p>
                </div>

                {error && (
                  <div className={`mb-6 p-4 rounded-lg border ${demoMode ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">{demoMode ? 'info' : 'error'}</span>
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  </div>
                )}

                {/* Step 1: Phone Input */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-text-main text-sm font-bold mb-2">
                        Telefon Numarası *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0xxx xxx xx xx"
                        maxLength={11}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <button
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          SMS Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">sms</span>
                          Doğrulama Kodu Gönder
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Step 2: OTP Input */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800 mb-2">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span className="font-bold">SMS Gönderildi!</span>
                      </div>
                      {countdown > 0 && (
                        <p className="text-xs text-green-600 mt-2">
                          Kod {formatTime(countdown)} içinde geçersiz olacak
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-text-main text-sm font-bold mb-2">
                        Doğrulama Kodu *
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="6 haneli kod"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-bold"
                      />
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center h-5">
                        <input
                          id="consent"
                          type="checkbox"
                          checked={consentGiven}
                          onChange={(e) => setConsentGiven(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                      <label htmlFor="consent" className="text-sm text-text-secondary select-none">
                        <span className="font-semibold text-text-main">Aydınlatma Metni</span> ve <span className="font-semibold text-text-main">Ticari Elektronik İleti</span> iznini okudum, onaylıyorum.
                      </label>
                    </div>

                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6 || !consentGiven}
                      className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Doğrulanıyor...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">check_circle</span>
                          Doğrula ve Devam Et
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setStep(1);
                        setOtp('');
                        setCountdown(0);
                        setError('');
                      }}
                      className="w-full py-2 text-text-secondary text-sm hover:text-primary transition-colors"
                    >
                      Numarayı Değiştir / Tekrar Gönder
                    </button>
                  </div>
                )}

                {/* Step 3: Details Form */}
                {step === 3 && (
                  <div className="space-y-6">
                    {!isNewUser && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-blue-600 mt-0.5">info</span>
                          <div className="text-sm text-blue-800">
                            <p className="font-bold">Hoşgeldiniz, {fullName}!</p>
                            <p>Bilgileriniz otomatik olarak dolduruldu. {user?.phone && `(${user.phone})`}</p>
                            <p>İsim ve e-posta değişikliğini profil sayfasından yapabilirsiniz.</p>
                          </div>
                          {user?.phone && (
                            <button
                              onClick={() => {
                                setStep(1);
                                setOtp('');
                                setIsNewUser(true); // Treat as new/guest for the purpose of editing phone
                              }}
                              className="ml-auto text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded transition-colors"
                            >
                              Farklı Numara?
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-text-main text-sm font-bold mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-text-main text-sm font-bold mb-2">
                        E-posta (Opsiyonel)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@email.com"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-text-main text-sm font-bold mb-2">
                        Notlar (Opsiyonel)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Özel bir isteğiniz varsa buraya yazabilirsiniz..."
                        rows={3}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    <button
                      onClick={handleCreateBooking}
                      disabled={loading}
                      className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {appointmentId ? 'Randevu Güncelleniyor...' : 'Randevu Oluşturuluyor...'}
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">{appointmentId ? 'edit_calendar' : 'event_available'}</span>
                          {appointmentId ? 'Randevuyu Güncelle' : 'Randevuyu Onayla'}
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
                  <Link
                    href={`/booking/${id}/time`}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg text-text-secondary font-medium hover:bg-gray-100 transition-colors"
                  >
                    <span className="material-symbols-outlined">arrow_back</span> Geri Dön
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}