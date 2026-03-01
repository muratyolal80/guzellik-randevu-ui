'use client';

import React, { useState, useEffect } from 'react';
import { SubmerchantService } from '@/services/db';
import {
    CreditCard,
    Building2,
    CheckCircle2,
    AlertCircle,
    Save,
    Info,
    ExternalLink,
    Shield,
    User,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import { SalonDataService, ProfileService } from '@/services/db';
import { supabase } from '@/lib/supabase';

interface PaymentSettingsTabProps {
    salonId: string;
}

export function PaymentSettingsTab({ salonId }: PaymentSettingsTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [registration, setRegistration] = useState<any>(null);
    const [salon, setSalon] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form States
    const [bankName, setBankName] = useState('');
    const [iban, setIban] = useState('TR');
    const [accountOwner, setAccountOwner] = useState('');
    const [subMerchantType, setSubMerchantType] = useState('PERSONAL');

    // Missing Info States (to ensure iyzico has what it needs)
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, [salonId]);

    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([
            fetchRegistration(),
            fetchSalonAndProfile()
        ]);
        setLoading(false);
    };

    const fetchSalonAndProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [salonData, profileData] = await Promise.all([
                SalonDataService.getSalonById(salonId),
                ProfileService.getProfile(user.id)
            ]);

            if (salonData) {
                setSalon(salonData);
                setAddress(salonData.address || '');
            }
            if (profileData) {
                setProfile(profileData);
                setContactEmail(profileData.email || '');
                setContactPhone(profileData.phone || '');
            }
        } catch (err) {
            console.error('Error fetching salon/profile:', err);
        }
    };

    const fetchRegistration = async () => {
        try {
            setLoading(true);
            const data = await SubmerchantService.getBySalonId(salonId);
            if (data) {
                setRegistration(data);
                setBankName(data.bank_name || '');
                setIban(data.iban || 'TR');
                setAccountOwner(data.account_owner || '');
                setSubMerchantType(data.sub_merchant_type || 'PERSONAL');
            }
        } catch (err) {
            console.error('Registration fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            // 1. Prepare subMerchantData for iyzico
            const names = accountOwner.trim().split(' ');
            const firstName = names[0] || 'Bilinmiyor';
            const lastName = names.length > 1 ? names.slice(1).join(' ') : firstName;

            const subMerchantData = {
                subMerchantExternalId: salonId,
                subMerchantType: subMerchantType,
                address: address || salon?.address || 'Adres belirtilmemiş',
                taxOffice: 'Bilinmiyor',
                taxNumber: '11111111111',
                contactName: firstName,
                contactSurname: lastName,
                email: contactEmail || profile?.email || '',
                gsmNumber: contactPhone || profile?.phone || '',
                name: salon?.name || accountOwner,
                iban: iban.replace(/\s/g, ''),
                currency: 'TRY'
            };

            // 2. Call our API for automated creation & DB update
            const response = await fetch('/api/iyzico/sub-merchant/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ salonId, subMerchantData })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Başvuru iyzico tarafından kabul edilmedi. Lütfen bilgileri kontrol edin.');
            }

            setMessage({ type: 'success', text: 'Ödeme bilgileriniz onaylandı! Artık randevu ödemelerini iyzico üzerinden alabilirsiniz.' });
            fetchRegistration();
        } catch (err: any) {
            console.error('Save error:', err);
            setMessage({ type: 'error', text: err.message || 'Bilgiler kaydedilemedi. Lütfen tüm alanları doldurduğunuzdan emin olun.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 animate-pulse space-y-4 shadow-sm border border-border rounded-3xl bg-white"><div className="h-8 bg-gray-100 rounded w-1/3"></div><div className="h-32 bg-gray-50 rounded"></div></div>;

    const isPending = registration?.status === 'PENDING';
    const isActive = registration?.status === 'ACTIVE';
    const isRejected = registration?.status === 'REJECTED';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Status Banner */}
            {registration && (
                <div className={`p-6 rounded-3xl border flex items-center gap-4 ${isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                    isRejected ? 'bg-red-50 border-red-100 text-red-800' :
                        'bg-amber-50 border-amber-100 text-amber-800'
                    }`}>
                    {isActive ? <CheckCircle2 className="w-8 h-8" /> : isRejected ? <AlertCircle className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs">Hesap Durumu: {
                            isActive ? 'AKTİF - Ödemeleri Alabilirsiniz' :
                                isRejected ? 'REDDEDİLDİ' :
                                    'İNCELEMEDE'
                        }</h4>
                        <p className="text-xs font-medium opacity-80 mt-1">
                            {isActive ? 'iyzico marketplace entegrasyonu tamamlandı. Randevu ödemeleri otomatik olarak hesabınıza aktarılacaktır.' :
                                isRejected ? 'Başvurunuz bilgilerdeki eksiklik nedeniyle reddedildi. Lütfen bilgileri güncelleyip tekrar deneyin.' :
                                    'Bilgileriniz iyzico ve platform yönetimi tarafından incelenmektedir. 24-48 saat sürebilir.'}
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[40px] border border-border shadow-card overflow-hidden">
                <div className="p-10 border-b border-border bg-gray-50/30 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-text-main tracking-tight font-display">iyzico Marketplace & Banka Bilgileri</h3>
                        <p className="text-xs font-medium text-text-secondary mt-1">Randevu ödemelerini alabilmeniz için iyzico alt üye işyeri başvurunuzu buradan yapın.</p>
                    </div>
                    <CreditCard className="w-10 h-10 text-primary opacity-20" />
                </div>

                <form onSubmit={handleSave} className="p-10 space-y-8">
                    {message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm font-bold">{message.text}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">İşletme Tipi</label>
                            <select
                                value={subMerchantType}
                                onChange={(e) => setSubMerchantType(e.target.value)}
                                className="w-full px-6 py-4 bg-surface-alt border border-border rounded-2xl text-base font-bold text-text-main focus:border-primary outline-none transition-all appearance-none"
                            >
                                <option value="PERSONAL">Şahıs (IBAN ile ödeme alma)</option>
                                <option value="PRIVATE_COMPANY">Şahıs Şirketi</option>
                                <option value="LIMITED_OR_JOINT_STOCK">Limited veya Anonim Şirket</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Banka Adı</label>
                            <input
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="w-full px-6 py-4 bg-surface-alt border border-border rounded-2xl text-base font-bold text-text-main focus:border-primary outline-none transition-all"
                                placeholder="Örn: Garanti BBVA"
                                required
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Hesap Sahibi (Ad Soyad / Ünvan)</label>
                            <input
                                value={accountOwner}
                                onChange={(e) => setAccountOwner(e.target.value)}
                                className="w-full px-6 py-4 bg-surface-alt border border-border rounded-2xl text-base font-bold text-text-main focus:border-primary outline-none transition-all"
                                placeholder="Bankada kayıtlı tam adınızı girin"
                                required
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">IBAN</label>
                            <div className="relative">
                                <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input
                                    value={iban}
                                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                                    className="w-full pl-16 pr-6 py-4 bg-surface-alt border border-border rounded-2xl text-base font-black text-text-main focus:border-primary outline-none transition-all tracking-widest"
                                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-text-muted font-bold ml-1 uppercase tracking-tighter">Lütfen TR ile başlayan 26 haneli IBAN numaranızı giriniz.</p>
                        </div>

                        {/* Extra fields if missing from profile/salon */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">E-Posta (iyzico İletişim)</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className="w-full pl-16 pr-6 py-4 bg-surface-alt border border-border rounded-2xl text-base font-bold text-text-main focus:border-primary outline-none transition-all"
                                    placeholder="eposta@adresiniz.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Telefon (Gsm)</label>
                            <div className="relative">
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    className="w-full pl-16 pr-6 py-4 bg-surface-alt border border-border rounded-2xl text-base font-bold text-text-main focus:border-primary outline-none transition-all"
                                    placeholder="+90 5xx xxx xx xx"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">İşletme Adresi (Fatura/Kontrat)</label>
                            <div className="relative">
                                <MapPin className="absolute left-6 top-6 w-5 h-5 text-text-muted" />
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full pl-16 pr-6 py-4 bg-surface-alt border border-border rounded-2xl text-base font-bold text-text-main focus:border-primary outline-none transition-all min-h-[100px]"
                                    placeholder="iyzico sözleşmesi için tam adresiniz"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3 text-text-secondary">
                            <Info className="w-5 h-5 text-primary" />
                            <p className="text-xs font-medium leading-relaxed max-w-md">Değişiklik yaptıktan sonra hesabınız tekrar incelemeye alınabilir. Aktif durumdaki hesaplarda IBAN değişikliği ödemelerin durmasına neden olabilir.</p>
                        </div>
                        <button
                            disabled={saving || isActive}
                            type="submit"
                            className="w-full md:w-auto px-12 py-4 bg-primary text-white rounded-[24px] font-black shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Gönderiliyor...' : isActive ? 'Bilgiler Onaylı' : 'Başvuruyu Gönder / Güncelle'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Marketplace FAQ Card */}
            <div className="bg-purple-50/50 rounded-[40px] border border-purple-100 p-10 flex gap-8 items-start">
                <div className="w-16 h-16 bg-purple-100 rounded-3xl flex items-center justify-center text-purple-600 shrink-0 shadow-lg shadow-purple-200/50">
                    <Shield className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                    <h4 className="text-lg font-black text-purple-900 tracking-tight uppercase">Nasıl Çalışır?</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-purple-500 tracking-widest">Ayrıştırma (Split)</span>
                            <p className="text-xs text-purple-800 font-medium leading-relaxed">Müşteri ödemeyi yaptığında, tutar anında iyzico tarafından platform komisyonu ve salon payı olarak ikiye bölünür.</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-purple-500 tracking-widest">Güvenli Ödeme</span>
                            <p className="text-xs text-purple-800 font-medium leading-relaxed">Ödemeler doğrudan salonun iyzico alt üye işyeri hesabına yatar. Platform ödemenize dokunamaz.</p>
                        </div>
                    </div>
                    <div className="pt-4 flex">
                        <a href="https://www.iyzico.com/pazaryeri" target="_blank" className="text-xs font-black text-primary flex items-center gap-1 hover:underline">
                            iyzico Pazaryeri Detayları <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
