
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MOCK_SALONS, MOCK_STAFF, MOCK_SERVICES } from '../../constants';
import { Layout } from '../../components/Layout';
import { BookingSummary } from '../../components/BookingSummary';
import { NetgsmService } from '../../services/netgsm';

export const Confirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const salon = MOCK_SALONS.find(s => s.id === id) || MOCK_SALONS[0];
  const staff = MOCK_STAFF[0];
  const services = MOCK_SERVICES.slice(0, 3);
  
  // States for verification flow
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // OTP is 6 digits
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null); 
  const [timer, setTimer] = useState(60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (codeSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [codeSent, timer]);

  const handleSendCode = async () => {
    if (phone.length >= 10) {
      setLoading(true);
      setErrorMsg('');
      
      // Generate code locally. 
      // Note: In Demo mode (NetgsmService returns true but doesn't send), 
      // the user must know to enter '123456' or we show it.
      // But for real logic, we use this random code.
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newCode);

      // Attempt to send via Netgsm (Real or Demo fallback happens inside service)
      const success = await NetgsmService.sendOtp(phone, newCode);
      
      setLoading(false);
      if (success) {
        setCodeSent(true);
        setTimer(60);
        // Focus first input automatically
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setErrorMsg('Kod gönderilemedi. Lütfen numarayı veya Netgsm ayarlarını kontrol edin.');
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Clear error when user types
    if (errorMsg) setErrorMsg('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
      const enteredCode = otp.join('');
      if (enteredCode.length !== 6) return;

      setLoading(true);
      setErrorMsg('');

      await new Promise(r => setTimeout(r, 600)); 
      
      // Verification Logic:
      // 1. Matches the randomly generated code (Real SMS Scenario)
      // 2. Matches '123456' (Demo / Backdoor Scenario)
      const isValid = enteredCode === generatedOtp || enteredCode === '123456'; 

      setLoading(false);

      if (isValid) {
          // Send Appointment Info SMS
          await NetgsmService.sendAppointmentInfo(phone, `Sn. Musteri, ${salon.name} randevunuz olusturulmustur. Kod: #RND-2489`);
          setStep('success');
      } else {
          setErrorMsg('Girdiğiniz kod hatalı. Lütfen tekrar deneyin.');
          setOtp(['', '', '', '', '', '']); // Reset OTP
          otpRefs.current[0]?.focus();
      }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <Layout>
      <main className="flex-grow layout-container flex flex-col items-center py-8 lg:py-12 px-4 lg:px-8 bg-background min-h-screen">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            
            {/* Left Col: Form */}
            <div className="lg:col-span-7 flex flex-col gap-8">
                {/* Progress */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                        <p className="text-primary text-sm font-bold tracking-wide uppercase">Adım 4/4</p>
                        <p className="text-text-main text-base font-medium leading-normal">Özet ve Onay</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-full"></div>
                    </div>
                    <div className="flex justify-between text-xs text-text-secondary mt-1">
                        <span>Hizmetler</span>
                        <span>Personel</span>
                        <span>Tarih</span>
                        <span className="text-text-main font-bold">Onay</span>
                    </div>
                </div>

                {step === 'form' ? (
                    <div className="animate-fade-in-up">
                        <div className="mb-8">
                            <h1 className="text-text-main tracking-tight text-3xl lg:text-4xl font-bold leading-tight mb-3">Randevunuzu Tamamlayın</h1>
                            <p className="text-text-secondary text-lg font-normal leading-relaxed">Seçtiğiniz randevu detayları sağ tarafta özetlenmiştir. Lütfen telefon numaranızı doğrulayarak işlemi bitirin.</p>
                        </div>
                        
                        <div className="bg-white border border-border rounded-xl p-6 lg:p-8 shadow-card relative overflow-hidden">
                             {/* Phone Input Section */}
                             <div className={`flex flex-col gap-6 mb-8 transition-opacity duration-300 ${codeSent ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                <h3 className="text-text-main text-lg font-semibold flex items-center gap-2"><span className="material-symbols-outlined text-primary">smartphone</span> İletişim Bilgileri</h3>
                                <div className="flex flex-wrap items-end gap-4">
                                    <label className="flex flex-col w-24">
                                        <span className="text-text-secondary text-sm font-medium pb-2">Kod</span>
                                        <input className="w-full rounded-lg text-text-main border border-border bg-gray-50 focus:border-primary focus:ring-1 focus:ring-primary h-14 px-4 text-base font-medium outline-none transition-all placeholder:text-gray-400 cursor-not-allowed" value="+90" readOnly />
                                    </label>
                                    <label className="flex flex-col flex-1 min-w-[200px]">
                                        <span className="text-text-secondary text-sm font-medium pb-2">Cep Telefonu</span>
                                        <input 
                                            className="w-full rounded-lg text-text-main border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary h-14 px-4 text-base font-medium outline-none transition-all placeholder:text-gray-400 shadow-sm" 
                                            placeholder="5XX XXX XX XX" 
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                            maxLength={10}
                                        />
                                    </label>
                                    <button 
                                        onClick={handleSendCode}
                                        disabled={phone.length < 10 || loading}
                                        className="h-14 px-6 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold transition-all text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2 min-w-[140px] justify-center"
                                    >
                                        {loading ? <span className="size-4 border-2 border-white border-r-transparent rounded-full animate-spin"></span> : (codeSent ? 'Tekrar Gönder' : 'SMS Gönder')}
                                    </button>
                                </div>
                                <p className="text-[10px] text-text-secondary mt-1 ml-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Netgsm ile doğrulama kodu gönderilecektir. (Demo: 123456)
                                </p>
                             </div>

                             {/* Divider */}
                             <div className="w-full h-px bg-border mb-8"></div>

                             {/* OTP Section */}
                             <div className={`flex flex-col gap-6 transition-all duration-500 ${codeSent ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 blur-[2px] pointer-events-none'}`}>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-text-main text-lg font-semibold flex items-center gap-2"><span className="material-symbols-outlined text-primary">lock</span> Doğrulama Kodu</h3>
                                    {codeSent && <span className="text-sm text-green-600 flex items-center gap-1 font-bold"><span className="material-symbols-outlined text-[16px]">check_circle</span> Kod gönderildi</span>}
                                </div>
                                
                                {errorMsg && (
                                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">error</span>
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="flex gap-2 sm:gap-3 justify-start">
                                    {otp.map((digit, index) => (
                                        <input 
                                            key={index}
                                            ref={(el) => { otpRefs.current[index] = el; }}
                                            className={`w-10 h-12 sm:w-12 sm:h-14 rounded-lg text-center text-xl font-bold text-text-main border bg-white outline-none transition-all shadow-sm ${digit ? 'border-primary shadow-[0_0_10px_rgba(197,159,89,0.2)]' : 'border-border focus:border-primary'}`} 
                                            maxLength={1} 
                                            type="text" 
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            placeholder="-"
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <p className="text-text-secondary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">timer</span> 
                                        {timer > 0 ? `00:${timer.toString().padStart(2, '0')} içinde tekrar kod gönder` : <button onClick={handleSendCode} className="text-primary font-bold hover:underline">Kodu Tekrar Gönder</button>}
                                    </p>
                                </div>
                             </div>

                             <div className="mt-10">
                                <button 
                                    onClick={handleConfirm} 
                                    disabled={!isOtpComplete || loading}
                                    className="w-full h-14 bg-primary hover:bg-primary-hover text-white text-lg font-bold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <>
                                            <span className="size-5 border-2 border-white border-r-transparent rounded-full animate-spin"></span>
                                            Doğrulanıyor...
                                        </>
                                    ) : (
                                        <>
                                            <span>Randevuyu Onayla</span>
                                            <span className="material-symbols-outlined">check_circle</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-text-secondary mt-4">Randevuyu onaylayarak <a href="#" className="underline hover:text-primary">Hizmet Şartlarını</a> kabul etmiş olursunuz.</p>
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-white border border-border rounded-xl p-10 text-center animate-fade-in-up shadow-card">
                        <div className="size-24 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-100 shadow-sm">
                            <span className="material-symbols-outlined text-6xl text-green-500 animate-bounce">check_circle</span>
                        </div>
                        <h2 className="text-3xl font-bold text-text-main mb-3">Randevunuz Onaylandı!</h2>
                        <p className="text-text-secondary mb-8 text-lg max-w-md">Teşekkürler. Telefon doğrulamanız başarıyla tamamlandı ve randevu bilgileriniz SMS olarak gönderildi.</p>
                        
                        <div className="bg-gray-50 p-4 rounded-lg border border-border mb-8 w-full max-w-sm">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-text-secondary">Randevu Kodu:</span>
                                <span className="text-primary font-bold tracking-widest">#RND-2489</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Tarih:</span>
                                <span className="text-text-main font-medium">12 Ekim, 14:00</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <Link to="/" className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">home</span> Anasayfa
                            </Link>
                            <button className="px-8 py-3 bg-white text-text-main font-bold rounded-lg hover:bg-gray-50 border border-border transition-all flex items-center justify-center gap-2 shadow-sm">
                                <span className="material-symbols-outlined">calendar_add_on</span> Takvime Ekle
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Col: Summary */}
            <div className="lg:col-span-5 relative">
                <BookingSummary 
                     salon={salon} 
                     services={services} 
                     staff={staff}
                     totalPrice={750}
                     totalDuration="1 sa 45 dk"
                     step={3}
                />
            </div>

        </div>
      </main>
    </Layout>
  );
};
