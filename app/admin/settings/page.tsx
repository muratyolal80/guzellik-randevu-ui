'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { PlatformService } from '@/services/db';
import {
    Save,
    CreditCard,
    Building2,
    MessageSquare,
    ShieldCheck,
    Info,
    AlertTriangle,
    Plus,
    Trash2,
    Mail,
    Send
} from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'sms' | 'payment' | 'bank' | 'email'>('sms');

    // SMS States (LocalStorage - existing)
    const [usercode, setUsercode] = useState('');
    const [password, setPassword] = useState('');
    const [header, setHeader] = useState('');

    // Active Payment Provider (DB)
    const [activeProvider, setActiveProvider] = useState<'PAYTR' | 'IYZICO' | 'NONE'>('PAYTR');

    // iyzico States (DB) — şu an PASİF, kod arşivde, ileride aktive edilebilir
    const [iyzicoMode, setIyzicoMode] = useState<'sandbox' | 'live'>('sandbox');
    const [iyzicoSandboxKeys, setIyzicoSandboxKeys] = useState({ apiKey: '', secretKey: '', baseUrl: '' });
    const [iyzicoLiveKeys, setIyzicoLiveKeys] = useState({ apiKey: '', secretKey: '', baseUrl: '' });

    // PayTR States (DB) — aktif sağlayıcı
    const [paytrConfig, setPaytrConfig] = useState({
        merchant_id: '',
        merchant_key: '',
        merchant_salt: '',
        test_mode: 1 as 0 | 1,
        debug_on: 1 as 0 | 1,
        currency: 'TL' as 'TL' | 'EUR' | 'USD' | 'GBP' | 'RUB',
        callback_url: '',
        merchant_ok_url: '',
        merchant_fail_url: '',
    });

    // Platform Commission (DB)
    const [commissionRate, setCommissionRate] = useState(5);

    // Bank States (DB)
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);

    // Email/SMTP States (DB)
    const [emailConfig, setEmailConfig] = useState({
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_pass: '',
        from_address: '',
        from_name: 'Güzellik Randevu',
        encryption: 'TLS' as 'TLS' | 'SSL' | 'NONE',
    });
    const [emailTestSending, setEmailTestSending] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load SMS from LocalStorage
        setUsercode(localStorage.getItem('netgsm_usercode') || '');
        setPassword(localStorage.getItem('netgsm_password') || '');
        setHeader(localStorage.getItem('netgsm_header') || '');

        fetchDBPermissions();
    }, []);

    const fetchDBPermissions = async () => {
        try {
            setLoading(true);
            const providerRow = await PlatformService.getSetting('active_payment_provider');
            if (providerRow?.provider) setActiveProvider(providerRow.provider);

            const iyzicoConfig = await PlatformService.getSetting('iyzico_config');
            if (iyzicoConfig) {
                setIyzicoMode(iyzicoConfig.mode || 'sandbox');
                setIyzicoSandboxKeys({
                    apiKey: iyzicoConfig.sandbox_apiKey || '',
                    secretKey: iyzicoConfig.sandbox_secretKey || '',
                    baseUrl: iyzicoConfig.sandbox_baseUrl || 'https://sandbox-api.iyzipay.com'
                });
                setIyzicoLiveKeys({
                    apiKey: iyzicoConfig.live_apiKey || '',
                    secretKey: iyzicoConfig.live_secretKey || '',
                    baseUrl: iyzicoConfig.live_baseUrl || 'https://api.iyzipay.com'
                });
            }

            const paytrCfg = await PlatformService.getSetting('paytr_config');
            if (paytrCfg) {
                setPaytrConfig(prev => ({ ...prev, ...paytrCfg }));
            }

            const commission = await PlatformService.getSetting('platform_commission_rate');
            if (commission) {
                setCommissionRate(commission.rate || 5);
            }

            const banks = await PlatformService.getSetting('bank_accounts');
            setBankAccounts(banks || []);

            const emailCfg = await PlatformService.getSetting('email_smtp_config');
            if (emailCfg) {
                setEmailConfig(prev => ({ ...prev, ...emailCfg }));
            }
        } catch (err) {
            console.error('Settings fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSMS = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('netgsm_usercode', usercode);
        localStorage.setItem('netgsm_password', password);
        localStorage.setItem('netgsm_header', header);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleSavePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await Promise.all([
                PlatformService.updateSetting('active_payment_provider', { provider: activeProvider }),
                PlatformService.updateSetting('iyzico_config', {
                    mode: iyzicoMode,
                    sandbox_apiKey: iyzicoSandboxKeys.apiKey,
                    sandbox_secretKey: iyzicoSandboxKeys.secretKey,
                    sandbox_baseUrl: iyzicoSandboxKeys.baseUrl,
                    live_apiKey: iyzicoLiveKeys.apiKey,
                    live_secretKey: iyzicoLiveKeys.secretKey,
                    live_baseUrl: iyzicoLiveKeys.baseUrl,
                }),
                PlatformService.updateSetting('paytr_config', paytrConfig),
                PlatformService.updateSetting('platform_commission_rate', {
                    rate: commissionRate,
                    description: 'Randevu başı yüzde komisyon (manuel takip)'
                })
            ]);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert('Ayarlar kaydedilirken hata oluştu.');
        }
    };


    const handleSaveBanks = async () => {
        try {
            await PlatformService.updateSetting('bank_accounts', bankAccounts);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert('Banka hesapları kaydedilirken hata oluştu.');
        }
    };

    const hasSMSConfig = usercode.length > 0 && password.length > 0 && header.length > 0;
    const hasEmailConfig = emailConfig.smtp_host.length > 0 && emailConfig.smtp_user.length > 0;

    const handleSaveEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PlatformService.updateSetting('email_smtp_config', emailConfig);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert('E-posta ayarları kaydedilirken hata oluştu.');
        }
    };

    return (
        <AdminLayout>
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase">Sistem Ayarları</h2>
                    <p className="text-text-secondary font-medium">Platform genelindeki entegrasyonlar ve finansal yapılandırmalar.</p>
                </div>
                {saved && (
                    <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="font-bold">Değişiklikler Kaydedildi</span>
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('sms')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'sms' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                >
                    <MessageSquare size={18} /> SMS (Netgsm)
                </button>
                <button
                    onClick={() => setActiveTab('payment')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'payment' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                >
                    <CreditCard size={18} /> Ödeme Sağlayıcıları
                </button>
                <button
                    onClick={() => setActiveTab('bank')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'bank' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                >
                    <Building2 size={18} /> Banka Hesapları
                </button>
                <button
                    onClick={() => setActiveTab('email')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'email' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                >
                    <Mail size={18} /> E-Posta (SMTP)
                </button>
            </div>

            <div className="max-w-4xl">
                {activeTab === 'sms' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
                        <div className="bg-white rounded-3xl border border-border shadow-card overflow-hidden">
                            <div className="p-8 border-b border-border bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                        <MessageSquare size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-text-main">SMS Gateway Yapılandırması</h3>
                                        <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Netgsm API Entegrasyonu</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${hasSMSConfig ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {hasSMSConfig ? 'Bağlantı Aktif' : 'Konfigürasyon Eksik'}
                                </div>
                            </div>
                            <form onSubmit={handleSaveSMS} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Kullanıcı Kodu (Usercode)</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-surface-alt focus:bg-white focus:border-primary outline-none transition-all font-bold"
                                            value={usercode}
                                            onChange={(e) => setUsercode(e.target.value)}
                                            placeholder="850xxxxxxx"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Şifre</label>
                                        <input
                                            type="password"
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-surface-alt focus:bg-white focus:border-primary outline-none transition-all font-bold"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Gönderici Başlığı</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-surface-alt focus:bg-white focus:border-primary outline-none transition-all font-bold"
                                            value={header}
                                            onChange={(e) => setHeader(e.target.value)}
                                            placeholder="Örn: FIRMAADI"
                                        />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-border flex justify-end">
                                    <button type="submit" className="bg-primary text-white px-10 py-3.5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                                        <Save size={20} /> SMS Ayarlarını Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'payment' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4">

                        {/* AKTIF SAĞLAYICI SEÇİMİ */}
                        <div className="bg-white rounded-3xl border border-border shadow-card overflow-hidden">
                            <div className="p-8 border-b border-border bg-gradient-to-r from-amber-50 to-white">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-text-main">Aktif Ödeme Sağlayıcısı</h3>
                                        <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Sadece seçili sağlayıcı runtime'da çalışır</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(['PAYTR','IYZICO','NONE'] as const).map(p => {
                                    const labels: Record<typeof p, { title: string; desc: string; color: string }> = {
                                        PAYTR:  { title: 'PayTR (Aktif önerilen)', desc: 'iFrame API · Demo kartlarla test', color: 'emerald' },
                                        IYZICO: { title: 'Iyzico (Pasif/Arşiv)',     desc: 'Sandbox · Onay alınınca aktif olur', color: 'purple' },
                                        NONE:   { title: 'Yok (Sadece havale)',      desc: 'Kredi kartı UI gizlenir',          color: 'slate' },
                                    } as any;
                                    const c = labels[p];
                                    const selected = activeProvider === p;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setActiveProvider(p)}
                                            className={`text-left p-5 rounded-2xl border-2 transition-all ${selected
                                                ? `bg-${c.color}-50 border-${c.color}-300 shadow-lg scale-[1.02]`
                                                : 'bg-white border-border hover:border-primary/30'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-3 h-3 rounded-full ${selected ? `bg-${c.color}-500` : 'bg-gray-300'}`} />
                                                <span className="text-sm font-black text-text-main">{c.title}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{c.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* PAYTR KONFİGÜRASYONU */}
                        <div className="bg-white rounded-3xl border border-border shadow-card overflow-hidden">
                            <div className="p-8 border-b border-border bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-text-main">PayTR iFrame API</h3>
                                        <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Abonelik ödemesi · Demo modu test_mode=1</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${paytrConfig.test_mode === 1 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {paytrConfig.test_mode === 1 ? 'TEST MODU' : 'CANLI MOD'}
                                    </span>
                                </div>
                            </div>
                            <form onSubmit={handleSavePayment} className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Merchant ID</label>
                                        <input
                                            type="text"
                                            value={paytrConfig.merchant_id}
                                            onChange={(e) => setPaytrConfig({ ...paytrConfig, merchant_id: e.target.value })}
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-white focus:border-primary outline-none font-bold font-mono text-sm"
                                            placeholder="123456"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Test Mode</label>
                                        <select
                                            value={paytrConfig.test_mode}
                                            onChange={(e) => setPaytrConfig({ ...paytrConfig, test_mode: Number(e.target.value) as 0 | 1 })}
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-white focus:border-primary outline-none font-bold"
                                        >
                                            <option value={1}>Test (Demo kartlarla)</option>
                                            <option value={0}>Canlı (Gerçek ödeme)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Merchant Key</label>
                                        <input
                                            type="password"
                                            value={paytrConfig.merchant_key}
                                            onChange={(e) => setPaytrConfig({ ...paytrConfig, merchant_key: e.target.value })}
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-white focus:border-primary outline-none font-bold font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Merchant Salt</label>
                                        <input
                                            type="password"
                                            value={paytrConfig.merchant_salt}
                                            onChange={(e) => setPaytrConfig({ ...paytrConfig, merchant_salt: e.target.value })}
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-white focus:border-primary outline-none font-bold font-mono text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Callback URL (Bildirim URL)</label>
                                        <input
                                            type="text"
                                            value={paytrConfig.callback_url}
                                            onChange={(e) => setPaytrConfig({ ...paytrConfig, callback_url: e.target.value })}
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-white focus:border-primary outline-none font-bold text-sm"
                                            placeholder="https://kuaforara.com.tr/api/paytr/callback"
                                        />
                                        <p className="text-[10px] text-text-muted mt-2 ml-1 italic">Bu URL'i PayTR Mağaza Paneli &gt; Ayarlar &gt; Bildirim URL kısmına da yazmanız gerekir.</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <div className="space-y-2">
                                            <p className="text-xs font-black text-blue-900 uppercase">Demo Kartlar (test_mode=1 iken)</p>
                                            <ul className="text-[11px] font-mono text-blue-800 space-y-1">
                                                <li>4355 0843 5508 4358 — Ad: PAYTR TEST — Son: 12/30 — CVV: 000</li>
                                                <li>5406 6754 0667 5403 — Ad: PAYTR TEST — Son: 12/30 — CVV: 000</li>
                                                <li>9792 0303 9444 0796 — Ad: PAYTR TEST — Son: 12/30 — CVV: 000</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border flex justify-end">
                                    <button type="submit" className="bg-primary text-white px-10 py-3.5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                                        <Save size={20} /> Tüm Ödeme Ayarlarını Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* IYZICO KONFİGÜRASYONU (PASİF, arşivde) */}
                        <div className="bg-white rounded-3xl border border-border shadow-card overflow-hidden opacity-90">
                            <div className="p-8 border-b border-border bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-text-main">Iyzico API (Arşiv)</h3>
                                        <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Onay alınırsa Booking için aktive edilebilir</p>
                                    </div>
                                </div>
                                <select
                                    value={iyzicoMode}
                                    onChange={(e) => setIyzicoMode(e.target.value as any)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest outline-none border-2 ${iyzicoMode === 'live' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                                >
                                    <option value="sandbox">Sandbox (Test)</option>
                                    <option value="live">Live (Canlı)</option>
                                </select>
                            </div>
                            <form onSubmit={handleSavePayment} className="p-8 space-y-10">
                                <div className="grid grid-cols-1 gap-8">
                                    {/* Modal based on iyzicoMode */}
                                    <div className="p-6 rounded-[24px] border-2 border-dashed border-border bg-surface-alt/50">
                                        <div className="flex items-center gap-2 mb-6 text-primary">
                                            <ShieldCheck size={18} />
                                            <span className="text-sm font-black uppercase tracking-widest">{iyzicoMode === 'live' ? 'CANLI (LIVE) ANAHTARLAR' : 'TEST (SANDBOX) ANAHTARLAR'}</span>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">API Key</label>
                                                <input
                                                    type="text"
                                                    className="w-full h-12 px-5 rounded-2xl border border-border bg-white focus:border-primary outline-none transition-all font-bold font-mono text-sm"
                                                    value={iyzicoMode === 'live' ? iyzicoLiveKeys.apiKey : iyzicoSandboxKeys.apiKey}
                                                    onChange={(e) => iyzicoMode === 'live' ? setIyzicoLiveKeys({ ...iyzicoLiveKeys, apiKey: e.target.value }) : setIyzicoSandboxKeys({ ...iyzicoSandboxKeys, apiKey: e.target.value })}
                                                    placeholder="sb-api-..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Secret Key</label>
                                                <input
                                                    type="password"
                                                    className="w-full h-12 px-5 rounded-2xl border border-border bg-white focus:border-primary outline-none transition-all font-bold font-mono text-sm"
                                                    value={iyzicoMode === 'live' ? iyzicoLiveKeys.secretKey : iyzicoSandboxKeys.secretKey}
                                                    onChange={(e) => iyzicoMode === 'live' ? setIyzicoLiveKeys({ ...iyzicoLiveKeys, secretKey: e.target.value }) : setIyzicoSandboxKeys({ ...iyzicoSandboxKeys, secretKey: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Base URL</label>
                                                <input
                                                    type="text"
                                                    className="w-full h-12 px-5 rounded-2xl border border-border bg-white focus:border-primary outline-none transition-all font-bold text-sm"
                                                    value={iyzicoMode === 'live' ? iyzicoLiveKeys.baseUrl : iyzicoSandboxKeys.baseUrl}
                                                    onChange={(e) => iyzicoMode === 'live' ? setIyzicoLiveKeys({ ...iyzicoLiveKeys, baseUrl: e.target.value }) : setIyzicoSandboxKeys({ ...iyzicoSandboxKeys, baseUrl: e.target.value })}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Platform Commission Rate Section */}
                                <div className="p-6 rounded-[24px] border-2 border-dashed border-emerald-100 bg-emerald-50/20">
                                    <div className="flex items-center gap-2 mb-6 text-emerald-600">
                                        <Building2 size={18} />
                                        <span className="text-sm font-black uppercase tracking-widest">Pazar Yeri Komisyon Ayarı</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                        <div>
                                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Platform Komisyon Oranı (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    className="w-full h-12 px-5 rounded-2xl border border-border bg-white focus:border-primary outline-none transition-all font-black text-lg"
                                                    value={commissionRate}
                                                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                                                />
                                                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-text-muted">%</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/50 rounded-xl border border-emerald-100/50">
                                            <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
                                                * Bu oran, randevu ödemeleri sırasında iyzico tarafından otomatik olarak kesilerek platform hesabınıza aktarılacaktır.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border flex justify-end">
                                    <button type="submit" className="bg-primary text-white px-10 py-3.5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                                        <Save size={20} /> Ayarları Kaydet
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                )}

                {activeTab === 'bank' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
                        <div className="bg-white rounded-3xl border border-border shadow-card overflow-hidden">
                            <div className="p-8 border-b border-border bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-text-main">Banka Hesapları (Havale)</h3>
                                        <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Müşteri Ödemeleri İçin Platform Hesapları</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setBankAccounts([...bankAccounts, { bank: '', owner: '', iban: 'TR', description: '' }])}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-200 hover:scale-105 transition-all"
                                >
                                    <Plus size={14} /> Yeni Ekle
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                {bankAccounts.map((account, index) => (
                                    <div key={index} className="p-6 rounded-[24px] border border-border bg-surface-alt relative group">
                                        <button
                                            onClick={() => setBankAccounts(bankAccounts.filter((_, i) => i !== index))}
                                            className="absolute top-4 right-4 p-2 text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 ml-1">Banka Adı</label>
                                                <input
                                                    type="text"
                                                    className="w-full h-11 px-4 rounded-xl border border-border bg-white focus:border-primary outline-none transition-all font-bold"
                                                    value={account.bank}
                                                    onChange={(e) => {
                                                        const newAccounts = [...bankAccounts];
                                                        newAccounts[index].bank = e.target.value;
                                                        setBankAccounts(newAccounts);
                                                    }}
                                                    placeholder="Örn: Ziraat Bankası"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 ml-1">Hesap Sahibi</label>
                                                <input
                                                    type="text"
                                                    className="w-full h-11 px-4 rounded-xl border border-border bg-white focus:border-primary outline-none transition-all font-bold"
                                                    value={account.owner}
                                                    onChange={(e) => {
                                                        const newAccounts = [...bankAccounts];
                                                        newAccounts[index].owner = e.target.value;
                                                        setBankAccounts(newAccounts);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 ml-1">IBAN</label>
                                                <input
                                                    type="text"
                                                    className="w-full h-11 px-4 rounded-xl border border-border bg-white focus:border-primary outline-none transition-all font-bold"
                                                    value={account.iban}
                                                    onChange={(e) => {
                                                        const newAccounts = [...bankAccounts];
                                                        newAccounts[index].iban = e.target.value;
                                                        setBankAccounts(newAccounts);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {bankAccounts.length > 0 && (
                                    <div className="pt-6 border-t border-border flex justify-end">
                                        <button onClick={handleSaveBanks} className="bg-primary text-white px-10 py-3.5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                                            <Save size={20} /> Banka Ayarlarını Kaydet
                                        </button>
                                    </div>
                                )}

                                {bankAccounts.length === 0 && (
                                    <div className="py-12 text-center text-text-muted border-2 border-dashed border-border rounded-3xl">
                                        <Building2 size={40} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-sm font-bold uppercase tracking-widest">Henüz banka hesabı eklenmemiş</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'email' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
                        <div className="bg-white rounded-3xl border border-border shadow-card overflow-hidden">
                            <div className="p-8 border-b border-border bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-text-main">E-Posta SMTP Yapılandırması</h3>
                                        <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Davetiye ve Bildirim Gönderimi</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${hasEmailConfig ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {hasEmailConfig ? 'Yapılandırıldı' : 'Konfigürasyon Eksik'}
                                </div>
                            </div>
                            <form onSubmit={handleSaveEmail} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">SMTP Sunucu (Host)</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-surface-alt focus:bg-white focus:border-primary outline-none transition-all font-bold"
                                            value={emailConfig.smtp_host}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, smtp_host: e.target.value })}
                                            placeholder="smtp.gmail.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Port</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-surface-alt focus:bg-white focus:border-primary outline-none transition-all font-bold"
                                            value={emailConfig.smtp_port}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, smtp_port: e.target.value })}
                                            placeholder="587"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Kullanıcı Adı</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-surface-alt focus:bg-white focus:border-primary outline-none transition-all font-bold"
                                            value={emailConfig.smtp_user}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, smtp_user: e.target.value })}
                                            placeholder="noreply@salonunuz.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Şifre / App Password</label>
                                        <input
                                            type="password"
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-surface-alt focus:bg-white focus:border-primary outline-none transition-all font-bold"
                                            value={emailConfig.smtp_pass}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, smtp_pass: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Gönderen E-Posta</label>
                                        <input
                                            type="email"
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-surface-alt focus:bg-white focus:border-primary outline-none transition-all font-bold"
                                            value={emailConfig.from_address}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, from_address: e.target.value })}
                                            placeholder="bilgi@salonunuz.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Gönderen Adı</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-surface-alt focus:bg-white focus:border-primary outline-none transition-all font-bold"
                                            value={emailConfig.from_name}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, from_name: e.target.value })}
                                            placeholder="Güzellik Randevu"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Şifreleme</label>
                                        <div className="flex gap-3">
                                            {(['TLS', 'SSL', 'NONE'] as const).map(enc => (
                                                <button
                                                    key={enc}
                                                    type="button"
                                                    onClick={() => setEmailConfig({ ...emailConfig, encryption: enc })}
                                                    className={`px-6 py-3 rounded-xl text-sm font-black transition-all border ${emailConfig.encryption === enc ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface-alt text-text-muted border-border hover:border-primary/40'}`}
                                                >
                                                    {enc === 'NONE' ? 'Yok' : enc}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 font-bold leading-relaxed">
                                        Gmail kullanıyorsanız <strong>App Password</strong> oluşturmanız gerekir. Normal şifreniz çalışmaz.
                                        SMTP ayarları yapılandırıldığında, personel davetleri otomatik olarak e-posta ile de gönderilebilir hale gelecektir.
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-border flex justify-end gap-4">
                                    <button type="submit" className="bg-primary text-white px-10 py-3.5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                                        <Save size={20} /> E-Posta Ayarlarını Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Info Center */}
                <div className="mt-12 bg-blue-50/50 rounded-3xl border border-blue-100 p-8 flex gap-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                        <Info size={24} />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Sistem Güvenliği ve Entegrasyon</h4>
                            <p className="text-xs text-blue-700 font-bold leading-relaxed mt-1">Burada yapılan tüm değişiklikler anında bütün platformu etkiler. Özellikle iyzico ayarlarını güncellerken Live/Sandbox moduna dikkat ediniz.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/50 p-4 rounded-2xl border border-blue-100/50">
                                <span className="text-[10px] font-black uppercase text-blue-500 tracking-tighter">İşlem Kayıtları</span>
                                <p className="text-[10px] text-blue-700 mt-1 font-bold">Ödeme işlemlerine 'Finans' menüsünden, SMS raporlarına 'İYS Kayıtları'ndan ulaşabilirsiniz.</p>
                            </div>
                            <div className="bg-white/50 p-4 rounded-2xl border border-blue-100/50">
                                <span className="text-[10px] font-black uppercase text-blue-500 tracking-tighter">API Güvenliği</span>
                                <p className="text-[10px] text-blue-700 mt-1 font-bold">API anahtarları veritabanında şifreli olarak saklanır (opsiyonel) ve sadece sunucu taraflı kullanılır.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
