'use client';

import React, { useState, useEffect } from 'react';
import {
    Package, Building, Users, Image as ImageIcon, CheckCircle2,
    AlertCircle, Clock, CreditCard, Wallet, ArrowRight,
    ShieldCheck, Zap, Briefcase, Crown, Check, X,
    History as HistoryIcon, Loader2, Landmark
} from 'lucide-react';
// import { toast } from 'sonner'; // No toast lib installed in package.json
import { useActiveBranch } from '@/context/ActiveBranchContext';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import SubscriptionPlanSelector from '@/components/owner/SubscriptionPlanSelector';
import { SubscriptionService, PaymentService } from '@/services/db';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const PlanIcon = ({ name }: { name: string }) => {
    switch (name) {
        case 'STARTER': return <ShieldCheck className="w-6 h-6 text-gray-400" />;
        case 'PRO': return <Zap className="w-6 h-6 text-amber-500" />;
        case 'BUSINESS': return <Briefcase className="w-6 h-6 text-blue-500" />;
        case 'ELITE': return <Crown className="w-6 h-6 text-primary" />;
        default: return <Zap className="w-6 h-6" />;
    }
};

export default function BillingPage() {
    const { user } = useAuth();
    const { salonId, subscriptionStatus, refreshSalonId } = useTenant();
    const { activeBranch } = useActiveBranch();

    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY' | 'UPGRADE' | 'SUBSCRIPTIONS'>('OVERVIEW');
    const [plans, setPlans] = useState<any[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const [subHistory, setSubHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Limit stats
    const [limits, setLimits] = useState<any>(null);
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [receiptUrl, setReceiptUrl] = useState<string>('');

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [plansData, historyData, subHistoryData] = await Promise.all([
                SubscriptionService.getPlans(),
                salonId ? PaymentService.getSalonPaymentHistory(salonId) : Promise.resolve([]),
                SubscriptionService.getOwnerSubscriptionHistory(user.id)
            ]);
            setPlans(plansData);
            setPaymentHistory(historyData);
            setSubHistory(subHistoryData);

            // Fetch current limits used
            if (salonId) {
                const [branchRes, staffRes, galleryRes] = await Promise.all([
                    SubscriptionService.checkLimit(salonId, 'branch'),
                    SubscriptionService.checkLimit(salonId, 'staff'),
                    SubscriptionService.checkLimit(salonId, 'gallery_photo')
                ]);

                setLimits({
                    branches: { current: branchRes.current, max: branchRes.limit },
                    staff: { current: staffRes.current, max: staffRes.limit },
                    gallery: { current: galleryRes.current, max: galleryRes.limit }
                });
            } else {
                setLimits({
                    branches: { current: 0, max: 0 },
                    staff: { current: 0, max: 0 },
                    gallery: { current: 0, max: 0 }
                });
            }

        } catch (err) {
            console.error("Billing fetch error:", err);
            alert("Hata: Veriler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.id) return;
        fetchData();
    }, [user?.id, salonId]);

    const currentActiveSub = subHistory.find(s => s.status === 'ACTIVE' || s.status === 'TRIAL' || s.status === 'PENDING');
    const isExpired = subscriptionStatus === 'EXPIRED' || subscriptionStatus === 'CANCELLED';

    const handleUpgradeWithSender = async (planId: string, senderName?: string, proofUrl?: string) => {
        if (!salonId || !activeBranch) return;
        const targetPlan = plans.find(p => p.id === planId);
        const confirm = window.confirm(`"${targetPlan?.display_name}" paketine geçiş yapmak istediğinize emin misiniz?`);
        if (!confirm) return;

        setLoading(true);
        try {
            await SubscriptionService.subscribe(
                activeBranch.id,
                planId,
                'BANK_TRANSFER',
                billingCycle,
                {
                    senderName: senderName,
                    amount: billingCycle === 'YEARLY' ? targetPlan?.price_yearly : targetPlan?.price_monthly,
                    receiptUrl: proofUrl
                }
            );
            alert('Abonelik talebiniz oluşturuldu!');
            await refreshSalonId();
            await fetchData();
            setActiveTab('OVERVIEW');
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const renderProgressBar = (label: string, icon: React.ReactNode, current: number, max: number) => {
        const percentage = max === -1 ? 0 : Math.min(100, Math.max(0, (current / max) * 100));
        const isNearLimit = max !== -1 && percentage >= 80;

        return (
            <div className="bg-white p-6 rounded-3xl border border-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-surface-alt rounded-2xl text-text-main">
                            {icon}
                        </div>
                        <span className="font-bold text-sm uppercase tracking-widest text-text-secondary">{label}</span>
                    </div>
                    <span className="font-black text-xl text-text-main">
                        {current} <span className="text-sm text-text-muted font-medium">/ {max === -1 ? 'Sınırsız' : max}</span>
                    </span>
                </div>
                <div className="h-3 bg-surface-alt rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${max === -1 ? 'bg-emerald-500 w-full' :
                                isNearLimit ? 'bg-red-500' : 'bg-primary'
                            }`}
                        style={{ width: max === -1 ? '100%' : `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    if (loading && !limits) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-text-main mb-4 tracking-tight">Paket ve Abonelik</h1>
                    <p className="text-text-secondary font-medium">Abonelik paketinizi, kullanım limitlerinizi ve ödeme geçmişinizi yönetin.</p>
                </div>

                <div className="bg-surface-alt p-1 rounded-2xl border border-border flex items-center self-start shadow-sm">
                    <button
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'OVERVIEW' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Package className="w-4 h-4" /> Genel Bakış
                    </button>
                    <button
                        onClick={() => setActiveTab('UPGRADE')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'UPGRADE' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Zap className="w-4 h-4" /> Paketleri İncele
                    </button>
                    <button
                        onClick={() => setActiveTab('SUBSCRIPTIONS')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'SUBSCRIPTIONS' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <ShieldCheck className="w-4 h-4" /> Tüm Paketlerim
                    </button>
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'HISTORY' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <HistoryIcon className="w-4 h-4" /> Ödeme Geçmişi
                    </button>
                </div>
            </div>

            {isExpired && activeTab !== 'UPGRADE' && (
                <div className="bg-red-50 border-2 border-red-500/20 p-6 rounded-3xl mb-8 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
                    <div>
                        <h3 className="text-red-800 font-black text-lg mb-1">Aboneliğinizin Süresi Doldu</h3>
                        <p className="text-red-600/80 font-medium text-sm mb-4">
                            Sistemi kullanmaya devam edebilmek için lütfen paketinizi yenileyin veya farklı bir pakete geçiş yapın.
                        </p>
                        <button
                            onClick={() => setActiveTab('UPGRADE')}
                            className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition"
                        >
                            Paketleri Gör ve Yenile
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'OVERVIEW' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    {currentActiveSub ? (
                        currentActiveSub.status === 'PENDING' ? (
                            <div className="bg-amber-50 border-2 border-amber-200 p-8 md:p-12 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                                <div className="relative z-10 text-center md:text-left flex-1">
                                    <div className="inline-flex items-center gap-2 bg-amber-100/50 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-amber-200">
                                        <Clock className="w-3 h-3" /> Ödeme Onayı Bekleniyor
                                    </div>
                                    <h2 className="text-3xl font-black text-amber-900 mb-2">
                                        {currentActiveSub?.subscription_plans?.display_name} Paketiniz Hazırlanıyor
                                    </h2>
                                    <p className="text-amber-800/70 font-bold text-sm max-w-xl leading-relaxed">
                                        Ödeme talebiniz sistemimize ulaşmıştır. Finans departmanımız tarafından kontrol edildikten sonra paketiniz aktif edilecektir.
                                    </p>
                                    <div className="mt-8 flex flex-wrap gap-4 items-center justify-center md:justify-start">
                                        <div className="flex items-center gap-2 text-xs font-black text-amber-900/60 bg-amber-100/30 px-3 py-1.5 rounded-xl border border-amber-200/50">
                                            Talep Tarihi: {format(new Date(currentActiveSub.created_at || new Date()), 'dd MMM yyyy', { locale: tr })}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-black text-amber-900/60 bg-amber-100/30 px-3 py-1.5 rounded-xl border border-amber-200/50">
                                            Referans ID: #{currentActiveSub.id.slice(0, 8).toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                                <div className="relative z-10 shrink-0 text-amber-500">
                                    <ShieldCheck className="w-20 h-20 opacity-20" />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-text-main p-8 md:p-12 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-black/10">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                <div className="relative z-10 text-center md:text-left">
                                    <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-2">Mevcut Planınız</h2>
                                    <div className="flex items-center gap-4 justify-center md:justify-start">
                                        <span className="text-5xl font-black">{currentActiveSub?.subscription_plans?.display_name || 'STARTER'}</span>
                                        {currentActiveSub.status === 'ACTIVE' && (
                                            <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500/20 shadow-sm">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Aktif Paket
                                            </span>
                                        )}
                                        {currentActiveSub.status === 'TRIAL' && (
                                            <span className="bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-amber-500/20 shadow-sm">
                                                <Zap className="w-3.5 h-3.5" /> Deneme Sürümü
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/60 font-medium mt-4 max-w-md">
                                        {currentActiveSub?.subscription_plans?.description}
                                    </p>
                                    {currentActiveSub.status === 'TRIAL' && currentActiveSub?.start_date && (
                                        <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-bold text-white/90">
                                                Deneme Süresi: {(() => {
                                                    const start = new Date(currentActiveSub.start_date);
                                                    const trialEnd = currentActiveSub.end_date ? new Date(currentActiveSub.end_date) : new Date(new Date(start).setMonth(start.getMonth() + 3));
                                                    const now = new Date();
                                                    const diffDays = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                                    return diffDays > 0 ? `${diffDays} Gün Kaldı` : 'Süre Doldu';
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="relative z-10 shrink-0">
                                    <button
                                        onClick={() => setActiveTab('UPGRADE')}
                                        className="bg-white text-text-main px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-black/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                                    >
                                        <Zap className="w-4 h-4 text-amber-500" /> Planı Değiştir
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="bg-white p-12 rounded-[40px] border-4 border-dashed border-border flex flex-col items-center text-center gap-6 group hover:border-primary/30 transition-colors">
                            <div className="w-20 h-20 bg-surface-alt rounded-[32px] flex items-center justify-center text-text-muted group-hover:scale-110 transition-transform">
                                <Package className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-text-main">Aktif Paketiniz Bulunmuyor</h3>
                                <p className="text-text-secondary font-medium max-w-md mx-auto">
                                    Sistemi tam kapasite kullanabilmek için hemen bir üyelik paketi edinin.
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveTab('UPGRADE')}
                                className="bg-primary text-white px-10 py-5 rounded-[22px] font-black text-sm shadow-xl shadow-primary/25 hover:scale-[1.05] transition-all flex items-center gap-3 active:scale-95"
                            >
                                <Zap className="w-5 h-5 text-amber-300" /> Paketleri İncele ve Başla
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(() => {
                            const isCurrentlyActive = currentActiveSub?.status === 'ACTIVE' || currentActiveSub?.status === 'TRIAL';
                            return (
                                <>
                                    {renderProgressBar('Şube Kullanımı', <Building className="w-5 h-5" />, isCurrentlyActive ? limits?.branches.current : 0, isCurrentlyActive ? limits?.branches.max : 0)}
                                    {renderProgressBar('Personel Kullanımı', <Users className="w-5 h-5" />, isCurrentlyActive ? limits?.staff.current : 0, isCurrentlyActive ? limits?.staff.max : 0)}
                                    {renderProgressBar('Galeri Kullanımı', <ImageIcon className="w-5 h-5" />, isCurrentlyActive ? limits?.gallery.current : 0, isCurrentlyActive ? limits?.gallery.max : 0)}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {activeTab === 'UPGRADE' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl font-black text-text-main mb-4 tracking-tight uppercase">Size Uygun Planı Seçin</h2>
                        <button
                            onClick={() => setActiveTab('OVERVIEW')}
                            className="text-xs font-bold text-primary hover:underline uppercase tracking-widest mt-2"
                        >
                            Geri Dön
                        </button>
                    </div>

                    <SubscriptionPlanSelector
                        plans={plans}
                        selectedPlanId={selectedPlanId}
                        billingCycle={billingCycle}
                        onSelect={setSelectedPlanId}
                        onCycleChange={setBillingCycle}
                    />

                    {selectedPlanId && (
                        <div className="mt-12 p-8 bg-white border-2 border-primary rounded-[32px] flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border pb-8">
                                <div>
                                    <h3 className="text-xl font-black text-text-main mb-1 uppercase tracking-tight">
                                        {plans.find(p => p.id === selectedPlanId)?.display_name} Planını Seçtiniz
                                    </h3>
                                    <p className="text-sm text-text-secondary font-medium italic">Seçilen plan üzerinden abonelik sürecinizi başlatabilirsiniz.</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">ÖDENECEK TUTAR</div>
                                    <div className="text-3xl font-black text-primary">
                                       {((billingCycle === 'YEARLY' && plans.find(p => p.id === selectedPlanId)?.price_yearly) 
                                            ? plans.find(p => p.id === selectedPlanId)!.price_yearly! 
                                            : plans.find(p => p.id === selectedPlanId)?.price_monthly || 0) / 100} ₺
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bank Transfer Info */}
                            {plans.find(p => p.id === selectedPlanId)?.price_monthly !== 0 && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-surface-alt p-6 rounded-2xl border border-border">
                                        <div className="flex items-center gap-3 mb-4 text-text-main">
                                            <Landmark className="w-5 h-5 text-primary" />
                                            <h4 className="font-black text-sm uppercase tracking-widest">Havale / EFT Bilgileri</h4>
                                        </div>
                                        <div className="space-y-4 text-sm font-medium text-text-secondary">
                                            <div>
                                                <div className="text-xs text-text-muted uppercase mb-1">Banka Adı</div>
                                                <div className="text-text-main font-bold">Örnek Bankası A.Ş.</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-text-muted uppercase mb-1">Alıcı Adı Soyadı/Ünvanı</div>
                                                <div className="text-text-main font-bold">Güzellik Randevu Bilişim Hizmetleri Tic. Ltd. Şti.</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-text-muted uppercase mb-1">IBAN</div>
                                                <div className="font-mono bg-white p-3 rounded-xl border border-border flex items-center justify-between">
                                                    <span className="font-bold text-text-main tracking-wider">TR00 0000 0000 0000 0000 0000 00</span>
                                                </div>
                                            </div>
                                            <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-xs leading-relaxed">
                                                <span className="font-bold">ÖNEMLİ:</span> Havale yaparken açıklama kısmına <b>"{activeBranch?.name}"</b> yazmayı lütfen unutmayın.
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col justify-center gap-6">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">
                                                Gönderici Ad - Soyad
                                            </label>
                                            <input 
                                                type="text" 
                                                id="senderNameInput"
                                                placeholder="Ödemeyi yapan kişinin veya şirketin adı..."
                                                className="w-full bg-white border-2 border-border p-4 rounded-2xl text-sm font-bold text-text-main focus:outline-none focus:border-primary transition-colors"
                                            />
                                            <p className="text-[10px] text-text-muted font-bold mt-2 uppercase tracking-wide">Ödemenizin hızlıca onaylanması için dekonttaki adı tam ve eksiksiz girin.</p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">
                                                Dekont (İsteğe Bağlı)
                                            </label>
                                            <ImageUpload 
                                                bucket="receipts"
                                                currentImage={receiptUrl}
                                                onUpload={(url) => setReceiptUrl(url)}
                                                label="Dekont Dosyası Seç / Sürükle"
                                                aspectRatio="video"
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                const senderName = (document.getElementById('senderNameInput') as HTMLInputElement)?.value;
                                                if (plans.find(p => p.id === selectedPlanId)?.price_monthly !== 0 && !senderName) {
                                                    alert('Lütfen gönderici Ad-Soyad veya Ünvan giriniz.');
                                                    return;
                                                }
                                                handleUpgradeWithSender(selectedPlanId, senderName, receiptUrl);
                                            }}
                                            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-5 h-5" /> Ödemeyi Bildir ve Aboneliği Başlat
                                        </button>
                                    </div>
                                </div>
                            )}
                            {plans.find(p => p.id === selectedPlanId)?.price_monthly === 0 && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleUpgradeWithSender(selectedPlanId)}
                                        className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Crown className="w-5 h-5" /> Ücretsiz Başla
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'HISTORY' && (
                <div className="bg-white rounded-[32px] border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-8 border-b border-border/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-alt flex items-center justify-center text-text-main">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-main">Ödeme Geçmişi</h2>
                            <p className="text-sm font-medium text-text-secondary">Hesabınıza ait tüm finansal işlemler burada listelenir.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-alt/50 border-b border-border text-[10px] font-black tracking-widest uppercase text-text-muted">
                                    <th className="px-8 py-4">Tarih</th>
                                    <th className="px-8 py-4">Açıklama</th>
                                    <th className="px-8 py-4">Yöntem</th>
                                    <th className="px-8 py-4">Tutar</th>
                                    <th className="px-8 py-4 text-right">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {paymentHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-text-muted font-medium italic text-xs uppercase tracking-widest">
                                            Henüz bir işlem bulunmuyor.
                                        </td>
                                    </tr>
                                ) : paymentHistory.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-text-secondary">
                                            {format(new Date(payment.created_at), 'dd MMM yyyy, HH:mm', { locale: tr })}
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-sm text-text-main">
                                                {payment.payment_type === 'SUBSCRIPTION' ? 'Abonelik Satın Alma' : 'İşlem'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-surface-alt rounded-lg text-[10px] font-black uppercase text-text-secondary tracking-wider">
                                                {payment.payment_method === 'BANK_TRANSFER' ? 'Havale/EFT' : 'Kredi Kartı'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-black text-text-main">
                                            {(payment.amount / 100).toLocaleString('tr-TR')} ₺
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                payment.status === 'SUCCESS' ? 'text-emerald-500 bg-emerald-50' :
                                                payment.status === 'PENDING' ? 'text-amber-500 bg-amber-50' :
                                                'text-red-500 bg-red-50'
                                            }`}>
                                                {payment.status === 'SUCCESS' ? 'Başarılı' :
                                                 payment.status === 'PENDING' ? 'Bekliyor' : 'Başarısız'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'SUBSCRIPTIONS' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-[40px] border border-border shadow-sm overflow-hidden font-sans">
                    <div className="p-8 border-b border-border">
                        <h3 className="text-xl font-black text-text-main">Tüm Paket Geçmişi</h3>
                        <p className="text-sm font-medium text-text-secondary italic">Şimdiye kadar sahibi olduğunuz tüm paketler ve durumları.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-border">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Paket / Salon</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Başlangıç</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Bitiş</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {subHistory.length > 0 ?
                                    subHistory.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <PlanIcon name={sub.subscription_plans?.name} />
                                                <div>
                                                    <span className="text-sm font-bold text-text-main block">{sub.subscription_plans?.display_name}</span>
                                                    <span className="text-[10px] font-medium text-text-muted uppercase">{sub.salons?.name || 'Yeni Salon'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-text-secondary">
                                            {sub.start_date ? format(new Date(sub.start_date), 'dd MMM yyyy', { locale: tr }) : '-'}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-text-secondary">
                                            {sub.end_date ? format(new Date(sub.end_date), 'dd MMM yyyy', { locale: tr }) : '-'}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                sub.status === 'ACTIVE' || sub.status === 'TRIAL' ? 'bg-emerald-50 text-emerald-600' :
                                                sub.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                sub.status === 'EXPIRED' ? 'bg-red-50 text-red-600' :
                                                sub.status === 'CANCELLED' ? 'bg-gray-50 text-gray-400' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {sub.status === 'ACTIVE' ? 'Aktif' :
                                                 sub.status === 'TRIAL' ? 'Deneme' :
                                                 sub.status === 'PENDING' ? 'Onay Bekliyor' :
                                                 sub.status === 'EXPIRED' ? 'Süresi Doldu' :
                                                 sub.status === 'CANCELLED' ? 'İptal Edildi' : 'Pasif/Red'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-text-muted italic text-xs uppercase tracking-widest">
                                            Pasif paket geçmişi bulunmuyor.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
