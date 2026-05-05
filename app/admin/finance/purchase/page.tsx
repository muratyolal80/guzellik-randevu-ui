'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Breadcrumbs } from '@/components/Admin/Breadcrumbs';
import { useToast } from '@/components/ui/Toast';
import SubscriptionPlanSelector from '@/components/owner/SubscriptionPlanSelector';
import { SubscriptionService, PaymentService, SalonDataService, FinanceService, ProfileService } from '@/services/db';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Search,
    Building2,
    User,
    Mail,
    ArrowRight,
    ArrowLeft,
    Package,
    Zap,
    ShieldCheck,
    Briefcase,
    Crown,
    CheckCircle2,
    Clock,
    CreditCard,
    Banknote,
    Landmark,
    AlertCircle,
    Users,
    Image as ImageIcon,
    Loader2,
    X,
    Check,
    History as HistoryIcon,
    ChevronRight,
    Star,
    UploadCloud,
    Info
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useSearchParams } from 'next/navigation';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PlanIcon = ({ name, className = "w-6 h-6" }: { name: string; className?: string }) => {
    const base = `rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500`;
    switch (name) {
        case 'STARTER':  return (
            <div className={`${base} w-10 h-10 bg-slate-100 text-slate-500`}>
                <ShieldCheck className={className} />
            </div>
        );
        case 'PRO':      return (
            <div className={`${base} w-10 h-10 bg-amber-50 text-amber-500 border border-amber-100`}>
                <Zap className={className} />
            </div>
        );
        case 'BUSINESS': return (
            <div className={`${base} w-10 h-10 bg-blue-50 text-blue-600 border border-blue-100`}>
                <Briefcase className={className} />
            </div>
        );
        case 'ELITE':    return (
            <div className={`${base} w-10 h-10 bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-indigo-100/50`}>
                <Crown className={className} />
            </div>
        );
        default:         return (
            <div className={`${base} w-10 h-10 bg-gray-50 text-gray-400`}>
                <Zap className={className} />
            </div>
        );
    }
};

const statusLabel: Record<string, { label: string; cls: string }> = {
    ACTIVE:           { label: 'Aktif',         cls: 'bg-emerald-100 text-emerald-700' },
    TRIAL:            { label: 'Deneme',         cls: 'bg-amber-100 text-amber-700' },
    PENDING_APPROVAL: { label: 'Onay Bekliyor', cls: 'bg-blue-100 text-blue-700' },
    EXPIRED:          { label: 'Süresi Doldu',  cls: 'bg-red-100 text-red-700' },
    CANCELLED:        { label: 'İptal Edildi',  cls: 'bg-gray-100 text-gray-500' },
};

const salonStatusLabel: Record<string, { label: string; cls: string }> = {
    APPROVED:           { label: 'Onaylı',        cls: 'bg-emerald-100 text-emerald-700' },
    PENDING:            { label: 'Beklemede',     cls: 'bg-amber-100 text-amber-700' },
    SUBMITTED:          { label: 'İncelemede',    cls: 'bg-blue-100 text-blue-700' },
    DRAFT:              { label: 'Taslak',         cls: 'bg-gray-100 text-gray-500' },
    REJECTED:           { label: 'Reddedildi',   cls: 'bg-red-100 text-red-700' },
    SUSPENDED:          { label: 'Askıda',        cls: 'bg-orange-100 text-orange-700' },
    REVISION_REQUESTED: { label: 'Revizyon',      cls: 'bg-purple-100 text-purple-700' },
};

const mapErrorToTurkish = (error: any) => {
    const msg = error?.message || error?.error || '';
    if (msg.includes('duplicate key')) return 'Bu salon için zaten aktif bir abonelik veya bekleyen ödeme bulunuyor.';
    if (msg.includes('connection error')) return 'Veritabanı bağlantı hatası. Lütfen internetinizi kontrol edin.';
    if (msg.includes('JWT')) return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
    if (msg.includes('insufficient_privileges')) return 'Bu işlem için yetkiniz yok.';
    if (msg.includes('Plan bulunamadı')) return 'Seçilen paket sistemde bulunamadı.';
    
    // Common database constraint errors mapped manually if needed
    return 'İşlem sırasında beklenmedik bir hata oluştu. Lütfen tekrar deneyin.';
};

type ActiveTab = 'OVERVIEW' | 'UPGRADE' | 'SUBSCRIPTIONS' | 'HISTORY';

// ─── Progress Steps ────────────────────────────────────────────────────────────

function ProgressSteps({ step }: { step: 1 | 2 }) {
    const steps = [
        { n: 1, label: 'İşletme Sahibi Seç' },
        { n: 2, label: 'Paket & Ödeme' },
    ];
    return (
        <div className="flex items-center gap-0 mb-10">
            {steps.map((s, i) => (
                <React.Fragment key={s.n}>
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${step >= s.n ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 text-text-muted'}`}>
                            {step > s.n ? <Check className="w-4 h-4" /> : s.n}
                        </div>
                        <span className={`text-xs font-black uppercase tracking-widest whitespace-nowrap ${step >= s.n ? 'text-text-main' : 'text-text-muted'}`}>{s.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`flex-1 h-px mx-4 transition-all duration-500 ${step > s.n ? 'bg-primary' : 'bg-border'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ─── Step 1: Owner Select ─────────────────────────────────────────────────────

function OwnerSelectStep({ onSelect }: { onSelect: (owner: any, sub: any) => void }) {
    const [owners, setOwners]   = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery]     = useState('');

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                // Fetch all users with OWNER or SALON_OWNER role
                const { profiles } = await ProfileService.adminGetProfiles({ 
                    pageSize: 1000, 
                });

                const ownerProfiles = profiles.filter(p => ['OWNER', 'SALON_OWNER', 'MANAGER', 'ADMIN'].includes(p.role));

                // Enrich with subscription data and salon count
                const enriched = await Promise.all(ownerProfiles.map(async (p) => {
                    try {
                        const sub = await SubscriptionService.getOwnerActiveSubscription(p.id);
                        const salons = await SalonDataService.getSalonsByOwner(p.id);
                        return { ...p, activeSub: sub, salonCount: salons.length || 0 };
                    } catch (err) {
                        console.error(`Error enriching owner ${p.id}:`, err);
                        return { ...p, activeSub: null, salonCount: 0 };
                    }
                }));

                setOwners(enriched);
            } catch (err) {
                console.error('Owner list error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOwners();
    }, []);

    const filtered = owners.filter(o => {
        const q = query.toLowerCase();
        return (
            o.full_name?.toLowerCase().includes(q) ||
            o.email?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-40 bg-gray-100 rounded-[32px]" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Owner adı veya e-postası ile ara…"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-border rounded-2xl text-sm font-medium text-text-main focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
                {query && (
                    <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-border p-16 text-center">
                    <User className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <h3 className="font-black text-text-main">İşletme Sahibi Bulunamadı</h3>
                    <p className="text-sm text-text-secondary mt-1">Arama kriterlerinizi değiştirin.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((owner) => {
                        const hasActive = !!owner.activeSub;
                        const displayName = owner.full_name || owner.email?.split('@')[0] || 'Bilinmeyen Kullanıcı';
                        const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
                        
                        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-indigo-500'];
                        const colorIndex = displayName.length % colors.length;
                        const avatarBg = colors[colorIndex];

                        return (
                            <div
                                key={owner.id}
                                onClick={() => onSelect(owner, owner.activeSub)}
                                className="group bg-white border border-border rounded-[32px] p-6 hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center text-center gap-4"
                            >
                                {/* Status Badge */}
                                <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    hasActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                    {hasActive ? 'AKTİF' : 'PAKET YOK'}
                                </div>

                                {/* Avatar / Photo */}
                                <div className="relative mt-2">
                                    <div className={`w-20 h-20 rounded-[28px] overflow-hidden flex items-center justify-center text-2xl font-black text-white ${avatarBg} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                        {owner.avatar_url ? (
                                            <img src={owner.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{initials}</span>
                                        )}
                                    </div>
                                    {hasActive && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <h4 className="font-black text-text-main text-lg group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">
                                        {displayName}
                                    </h4>
                                    <p className="text-xs font-medium text-text-secondary line-clamp-1">{owner.email}</p>
                                </div>

                                <div className="w-full pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Şube</span>
                                        <span className="text-sm font-bold text-text-main">{owner.salonCount || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Plan</span>
                                        <span className={`text-[10px] font-black uppercase truncate max-w-full ${hasActive ? 'text-primary' : 'text-text-muted'}`}>
                                            {owner.activeSub?.subscription_plans?.display_name || 'YOK'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2 w-full">
                                    <div className="w-full bg-slate-50 rounded-xl py-2 group-hover:bg-primary/5 transition-colors">
                                        <span className="text-[10px] font-black group-hover:text-primary flex items-center justify-center gap-2 text-primary">
                                            DETAYLARI GÖR <ChevronRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Progress Bar Util ─────────────────────────────────────────────────────────

function ProgressBar({ label, icon, current, max }: { label: string; icon: React.ReactNode; current: number; max: number }) {
    const pct = max === -1 ? 0 : Math.min(100, Math.max(0, (current / max) * 100));
    const near = max !== -1 && pct >= 80;
    return (
        <div className="bg-white p-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-surface-alt rounded-xl text-text-main">{icon}</div>
                    <span className="font-bold text-[11px] uppercase tracking-widest text-text-secondary">{label}</span>
                </div>
                <span className="font-black text-lg text-text-main">
                    {current} <span className="text-xs text-text-muted font-medium">/ {max === -1 ? 'Sınırsız' : max}</span>
                </span>
            </div>
            <div className="h-2.5 bg-surface-alt rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${max === -1 ? 'bg-emerald-500 w-full' : near ? 'bg-red-500' : 'bg-primary'}`}
                    style={{ width: max === -1 ? '100%' : `${pct}%` }}
                />
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminPurchasePage() {
    const { showToast } = useToast();

    const searchParams = useSearchParams();
    const urlPlanId = searchParams.get('plan');

    // Step 1 state
    const [step, setStep]             = useState<1 | 2>(1);
    const [selectedOwner, setSelectedOwner] = useState<any>(null);
    const [currentSub, setCurrentSub] = useState<any>(null);

    // Step 2 state
    const [activeTab, setActiveTab]   = useState<ActiveTab>('OVERVIEW');
    const [plans, setPlans]           = useState<any[]>([]);
    const [payHistory, setPayHistory] = useState<any[]>([]);
    const [subHistory, setSubHistory] = useState<any[]>([]);
    const [limits, setLimits]         = useState<any>(null);
    const [loading, setLoading]       = useState(false);

    // Payment state
    const [billingCycle, setBillingCycle]     = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(urlPlanId);
    const [paymentMethod, setPaymentMethod]   = useState<'BANK_TRANSFER' | 'CREDIT_CARD' | 'CASH'>('BANK_TRANSFER');
    const [immediateActivate, setImmediateActivate] = useState(true); // Super admin default: true
    const [purchasing, setPurchasing]         = useState(false);
    const [hasPendingPayment, setHasPendingPayment] = useState(false);

    // Bank Transfer Detail states
    const [manualSenderName, setManualSenderName] = useState('');
    const [manualBankName, setManualBankName]     = useState('');
    const [manualReceiptUrl, setManualReceiptUrl] = useState('');

    // ── Step 2 data load ─────────────────────────────────────────────────────
    const loadOwnerData = useCallback(async (ownerId: string) => {
        setLoading(true);
        try {
            const [plansData, currentSubData, usageData, fullHistory] = await Promise.all([
                SubscriptionService.getPlans(),
                SubscriptionService.getOwnerActiveSubscription(ownerId),
                SubscriptionService.getOwnerUsageStats(ownerId),
                SubscriptionService.getOwnerSubscriptionFullDetails(ownerId)
            ]);
            
            setPlans(plansData || []);
            setCurrentSub(currentSubData);
            
            // Fix: getOwnerSubscriptionFullDetails returns 'history' which contains joined data
            setPayHistory(fullHistory?.history || []);
            
            // For subHistory, we can use history or fetch specifically
            const subHist = await SubscriptionService.getOwnerSubscriptionHistory(ownerId);
            setSubHistory(subHist || []);
            
            if (usageData) {
                setLimits({
                    branches: { current: usageData.usage.branches, max: usageData.plan.limits.branches },
                    staff:    { current: usageData.usage.staff, max: usageData.plan.limits.staff },
                    gallery:  { current: usageData.usage.gallery_photos, max: usageData.plan.limits.gallery_photos },
                });
            }

            // Check for pending payments in history
            const pending = fullHistory.history?.some((p: any) => p.status === 'PENDING' && p.payment_type === 'SUBSCRIPTION');
            setHasPendingPayment(pending);
        } catch (err) {
            console.error('Load owner data error:', err);
            showToast('Veriler yüklenirken bir hata oluştu.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // ── Owner selected ────────────────────────────────────────────────────────
    const handleOwnerSelect = (owner: any, sub: any) => {
        setSelectedOwner(owner);
        setCurrentSub(sub);
        setStep(2);
        setActiveTab('OVERVIEW');
        setSelectedPlanId(null);
        loadOwnerData(owner.id);
    };

    // ── Purchase handler ──────────────────────────────────────────────────────
    const handlePurchase = async () => {
        if (!selectedOwner || !selectedPlanId) return;
        const plan = plans.find(p => p.id === selectedPlanId);
        if (!window.confirm(`"${plan?.display_name}" paketini "${selectedOwner.full_name || selectedOwner.email}" için başlatmak istiyor musunuz?`)) return;

        setPurchasing(true);
        try {
            if (immediateActivate && (paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'CASH' || selectedPlanId === 'free')) {
                // Admin fast-track: bypass PENDING status
                await SubscriptionService.adminAssignSubscription(
                    { ownerId: selectedOwner.id },
                    selectedPlanId,
                    billingCycle,
                    paymentMethod === 'CASH' ? "Nakit ödeme ile admin tarafından aktifleştirildi." : "Banka havalesi ile admin tarafından aktifleştirildi."
                );
                showToast('Paket başarıyla atanmış ve tüm sistemlerde aktif edilmiştir!', 'success');
            } else {
                // Standard flow (potential PENDING)
                await SubscriptionService.subscribe(
                    undefined as any, // owner centric uses owner_id logic inside if salonId missing
                    selectedPlanId,
                    paymentMethod === 'CASH' ? 'BANK_TRANSFER' : paymentMethod,
                    billingCycle,
                    { 
                        senderName: paymentMethod === 'CASH' ? 'NAKİT ÖDEME (Admin)' : (manualSenderName || 'Belirtilmedi'),
                        bankName: paymentMethod === 'CASH' ? 'NAKİT / ELDEN' : (manualBankName || 'Belirtilmedi'),
                        receiptUrl: manualReceiptUrl || undefined,
                        // Note: If subscribe method doesn't take ownerId, we need to ensure it's handled or backfilled.
                        // For now we assume the service handles the logged in context or we need to pass ownerId.
                    }
                );
                showToast(
                    (paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'CASH')
                        ? 'İşlem talebi oluşturuldu! Finans > Onaylar ekranından onaylayabilirsiniz.'
                        : 'Abonelik başlatıldı!',
                    'success'
                );
            }
            
            // Reload data & switch to overview
            await loadOwnerData(selectedOwner.id);
            const freshSub = await SubscriptionService.getOwnerActiveSubscription(selectedOwner.id);
            setCurrentSub(freshSub);
            setActiveTab('OVERVIEW');
            setSelectedPlanId(null);
        } catch (err: any) {
            console.error('Purchase error:', err);
            showToast(mapErrorToTurkish(err), 'error');
        } finally {
            setPurchasing(false);
        }
    };

    // ── Reset back to step 1 ──────────────────────────────────────────────────
    const handleBack = () => {
        setStep(1);
        setSelectedOwner(null);
        setCurrentSub(null);
        setActiveTab('OVERVIEW');
        setSelectedPlanId(null);
        setPlans([]);
        setPayHistory([]);
        setSubHistory([]);
        setLimits(null);
    };

    const isExpired = currentSub?.status === 'EXPIRED' || currentSub?.status === 'CANCELLED';
    const isActive  = currentSub?.status === 'ACTIVE' || currentSub?.status === 'TRIAL';

    return (
        <AdminLayout>
            <Breadcrumbs items={[{ label: 'Operasyon & Onay' }, { label: 'Paket Tanımlama (Atama-Ödeme Geçmişi)' }]} />

            <div className="max-w-7xl mx-auto py-8">
                {/* Page Header */}
                <div className="flex items-end justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-text-main tracking-tight uppercase">
                            Paket Tanımlama <span className="text-primary">(Atama-Ödeme Geçmişi)</span>
                        </h1>
                        <p className="text-text-secondary font-medium mt-1">
                            Bir işletme sahibi (owner) seçin ve o kullanıcı adına manuel paket tanımlaması yapın veya ödeme geçmişini inceleyin.
                        </p>
                    </div>
                    {step === 2 && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-border text-sm font-black text-text-secondary hover:text-primary hover:border-primary/30 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Sahibi Değiştir
                        </button>
                    )}
                </div>

                {/* Progress */}
                <ProgressSteps step={step} />

                {/* ─── Step 1: Owner Choose ──────────────────────────────── */}
                {step === 1 && (
                    <OwnerSelectStep onSelect={handleOwnerSelect} />
                )}

                {/* ─── Step 2: Billing ──────────────────────────────────── */}
                {step === 2 && selectedOwner && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                        {/* Selected Owner Info Bar */}
                        <div className="bg-text-main text-white p-6 rounded-[28px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Seçili İşletme Sahibi</p>
                                    <h2 className="font-black text-xl tracking-tight">{selectedOwner.full_name || 'İsimsiz'}</h2>
                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1.5 text-[11px] text-white/70 font-medium">
                                            <Mail className="w-3 h-3" /> {selectedOwner.email}
                                        </span>
                                        <span className="text-[11px] text-white/70 font-medium">
                                            🏢 {selectedOwner.salonCount} Şube
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-10 flex flex-wrap gap-3 items-center">
                                {currentSub ? (
                                        <div className="flex items-center gap-0 bg-[#0f172a] text-white rounded-[24px] shadow-2xl border border-white/10 overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                                            {/* Plan Name Section */}
                                            <div className="flex flex-col px-7 py-3 bg-gradient-to-br from-slate-800 to-slate-900 border-r border-white/10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${currentSub.status === 'ACTIVE' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'}`} />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">AKTİF PLAN</span>
                                                </div>
                                                <span className="text-lg font-black tracking-tight uppercase leading-none text-white">
                                                    {currentSub.subscription_plans?.display_name}
                                                </span>
                                            </div>
                                            
                                            {/* Usage Stats Section */}
                                            {limits && (
                                                <div className="flex items-center gap-6 px-8 py-3 bg-[#0f172a] divide-x divide-white/5">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">ŞUBELER</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-sm font-black text-white">{limits.branches.current}</span>
                                                            <span className="text-[10px] font-bold text-slate-600">/ {limits.branches.max === -1 ? '∞' : limits.branches.max}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-center pl-6">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">PERSONEL</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-sm font-black text-white">{limits.staff.current}</span>
                                                            <span className="text-[10px] font-bold text-slate-600">/ {limits.staff.max === -1 ? '∞' : limits.staff.max}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-center pl-6">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">GALERİ</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-sm font-black text-white">{limits.gallery.current}</span>
                                                            <span className="text-[10px] font-bold text-slate-600">/ {limits.gallery.max === -1 ? '∞' : limits.gallery.max}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                ) : (
                                    <div className="px-6 py-3 rounded-2xl bg-black text-white border border-red-500/30 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-xs font-black uppercase tracking-widest">Abonelik Bulunamadı</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Expired / Pending Payment Banner */}
                        {(isExpired || hasPendingPayment) && activeTab !== 'UPGRADE' && (
                            <div className={`border-2 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in transition-all duration-500 shadow-sm ${hasPendingPayment ? 'bg-indigo-50 border-indigo-200' : 'bg-red-50 border-red-200'}`}>
                                {hasPendingPayment ? (
                                    <>
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                                            <Clock className="w-6 h-6 text-indigo-600 animate-pulse" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-indigo-900 text-sm">Bekleyen Ödeme Talebi Bulunuyor!</p>
                                            <p className="text-indigo-800/70 text-xs font-medium mt-0.5">Bu salon için zaten bir havale bildirimi yapılmış. Yeni bir işlem yapmadan önce Finans Onayları'nı kontrol edin.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-7 h-7 text-red-500 shrink-0" />
                                        <div className="flex-1">
                                            <p className="font-black text-red-800 text-sm">Bu salonun aboneliği sona ermiş veya iptal edilmiş.</p>
                                            <p className="text-red-600/80 text-xs font-medium mt-0.5">Sistemi kullanmaya devam edebilmesi için yeni bir paket başlatın.</p>
                                        </div>
                                    </>
                                )}
                                <button
                                    onClick={() => setActiveTab('UPGRADE')}
                                    className={`px-5 py-2 rounded-xl font-black text-xs transition transition-all active:scale-95 whitespace-nowrap shadow-md ${hasPendingPayment ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                >
                                    Paket Seç / Güncelle
                                </button>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="bg-gray-100 p-1.5 rounded-[24px] border border-border/50 flex items-center w-fit flex-wrap gap-1">
                            {([
                                { id: 'OVERVIEW',       label: 'Genel Bakış',    icon: Package },
                                { id: 'UPGRADE',        label: 'Paket Seç',      icon: Zap },
                                { id: 'SUBSCRIPTIONS',  label: 'Tüm Paketlerim', icon: ShieldCheck },
                                { id: 'HISTORY',        label: 'Ödeme Geçmişi',  icon: HistoryIcon },
                            ] as const).map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Loading Skeleton */}
                        {loading && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-[28px]" />)}
                            </div>
                        )}

                        {/* ─ OVERVIEW ─ */}
                        {!loading && activeTab === 'OVERVIEW' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                {/* Current Plan Card */}
                                {currentSub ? (
                                    currentSub.status === 'PENDING_APPROVAL' ? (
                                        <div className="bg-amber-50 border-2 border-amber-200 p-8 md:p-10 rounded-[36px] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                            <div className="relative z-10 text-center md:text-left">
                                                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-amber-200">
                                                    <Clock className="w-3 h-3" /> Ödeme Onayı Bekleniyor
                                                </div>
                                                <h2 className="text-2xl font-black text-amber-900">{currentSub.subscription_plans?.display_name} paketi hazırlanıyor…</h2>
                                                <p className="text-amber-800/70 text-sm font-medium mt-2">Finans departmanı kontrolünden sonra aktif edilecektir.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-text-main p-8 md:p-10 rounded-[36px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-black/10">
                                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                            <div className="relative z-10">
                                                <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">Mevcut Plan</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-4xl font-black">{currentSub.subscription_plans?.display_name || 'STARTER'}</span>
                                                    {isActive && (
                                                        <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-500/20">
                                                            <CheckCircle2 className="w-3 h-3" /> Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                {currentSub.current_period_end && (
                                                    <p className="text-white/60 text-sm font-medium mt-3">
                                                        Bitiş: {format(new Date(currentSub.current_period_end), 'dd MMMM yyyy', { locale: tr })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="relative z-10 shrink-0">
                                                <button
                                                    onClick={() => setActiveTab('UPGRADE')}
                                                    className="bg-white text-text-main px-7 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
                                                >
                                                    <Zap className="w-4 h-4 text-amber-500" /> Planı Değiştir
                                                </button>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="bg-white p-10 rounded-[36px] border-4 border-dashed border-border flex flex-col items-center text-center gap-5 hover:border-primary/30 transition-colors group">
                                        <div className="w-16 h-16 bg-surface-alt rounded-[26px] flex items-center justify-center text-text-muted group-hover:scale-110 transition-transform">
                                            <Package className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-text-main">Bu Kullanıcı İçin Aktif Paket Yok</h3>
                                            <p className="text-text-secondary font-medium text-sm mt-1 max-w-sm">İşletme sahibini aktif hale getirmek için hemen bir paket başlatın.</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('UPGRADE')}
                                            className="bg-primary text-white px-8 py-4 rounded-[20px] font-black text-sm shadow-xl shadow-primary/25 hover:scale-[1.05] transition-all flex items-center gap-2"
                                        >
                                            <Zap className="w-4 h-4 text-amber-300" /> Paket Seç ve Başlat
                                        </button>
                                    </div>
                                )}

                                {/* Usage Limits */}
                                {limits && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <ProgressBar label="Şube Kullanımı"   icon={<Building2 className="w-4 h-4" />}  current={isActive ? limits.branches.current : 0} max={isActive ? limits.branches.max : 0} />
                                        <ProgressBar label="Personel Kullanımı" icon={<Users className="w-4 h-4" />}  current={isActive ? limits.staff.current : 0}    max={isActive ? limits.staff.max : 0} />
                                        <ProgressBar label="Galeri Kullanımı" icon={<ImageIcon className="w-4 h-4" />} current={isActive ? limits.gallery.current : 0}  max={isActive ? limits.gallery.max : 0} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─ UPGRADE ─ */}
                        {!loading && activeTab === 'UPGRADE' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                                <SubscriptionPlanSelector
                                    plans={plans}
                                    selectedPlanId={selectedPlanId}
                                    billingCycle={billingCycle}
                                    onSelect={setSelectedPlanId}
                                    onCycleChange={setBillingCycle}
                                />

                                {/* Payment method + confirm */}
                                {selectedPlanId && (() => {
                                    const plan = plans.find(p => p.id === selectedPlanId);
                                    const isFree = plan?.price_monthly === 0;
                                    return (
                                        <div className="bg-white border-2 border-primary rounded-[32px] p-8 animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                                            <div>
                                                <h3 className="text-lg font-black text-text-main uppercase tracking-tight">
                                                    {plan?.display_name} Planı Seçildi
                                                </h3>
                                                <p className="text-sm text-text-secondary font-medium mt-0.5">
                                                    {selectedOwner.full_name || selectedOwner.email} kullanıcısı için ödeme yöntemini seçin.
                                                </p>
                                            </div>

                                            {/* Payment method selector */}
                                            {!isFree && (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        {([
                                                            {
                                                                id: 'BANK_TRANSFER',
                                                                label: 'Banka Havalesi / EFT',
                                                                desc: 'Manuel onay gerektirir',
                                                                icon: Landmark,
                                                                color: 'blue'
                                                            },
                                                            {
                                                                id: 'CREDIT_CARD',
                                                                label: 'Kredi / Banka Kartı',
                                                                desc: 'Anlık iyzico entegrasyonu',
                                                                icon: CreditCard,
                                                                color: 'purple'
                                                            },
                                                            {
                                                                id: 'CASH',
                                                                label: 'Nakit / Diğer',
                                                                desc: 'Admin kaydı',
                                                                icon: Banknote,
                                                                color: 'emerald'
                                                            }
                                                        ] as const).map(m => {
                                                            const isSelected = paymentMethod === m.id;
                                                            const colorMap: Record<string, string> = {
                                                                blue: 'bg-blue-50 border-blue-200 text-blue-700',
                                                                purple: 'bg-purple-50 border-purple-200 text-purple-700',
                                                                emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                                                            };
                                                            return (
                                                                <button
                                                                    key={m.id}
                                                                    onClick={() => setPaymentMethod(m.id)}
                                                                    className={`relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                                                        ? `${colorMap[m.color]} shadow-lg shadow-black/5 scale-[1.02]`
                                                                        : 'border-border bg-white hover:border-primary/20'}`}
                                                                >
                                                                    {isSelected && (
                                                                        <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                                                            <Check className="w-3 h-3 text-white" />
                                                                        </div>
                                                                    )}
                                                                    <m.icon className={`w-8 h-8 mb-3 transition-colors ${isSelected ? '' : 'text-text-muted'}`} />
                                                                    <p className="font-black text-sm text-text-main leading-tight tracking-tight">{m.label}</p>
                                                                    <p className="text-[11px] text-text-muted font-medium mt-1 uppercase tracking-widest">{m.desc}</p>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Manual Payment Details Form */}
                                                    {paymentMethod === 'BANK_TRANSFER' && !immediateActivate && (
                                                        <div className="bg-blue-50/50 border-2 border-blue-100 p-6 md:p-8 rounded-[28px] space-y-6 animate-in slide-in-from-top-4 duration-500">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                                                    <Info className="w-4 h-4" />
                                                                </div>
                                                                <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Havale Bildirim Detayları</h4>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest ml-1">Gönderen Ad Soyad</label>
                                                                    <input 
                                                                        type="text"
                                                                        value={manualSenderName}
                                                                        onChange={e => setManualSenderName(e.target.value)}
                                                                        placeholder="Örn: Ahmet Yılmaz"
                                                                        className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm font-medium focus:border-blue-500 outline-none transition-all shadow-sm"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest ml-1">Hangi Bankaya Yapıldı?</label>
                                                                    <input 
                                                                        type="text"
                                                                        value={manualBankName}
                                                                        onChange={e => setManualBankName(e.target.value)}
                                                                        placeholder="Örn: Garanti BBVA"
                                                                        className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm font-medium focus:border-blue-500 outline-none transition-all shadow-sm"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest ml-1">Ödeme Dekontu (Opsiyonel)</label>
                                                                <ImageUpload 
                                                                    bucket="receipts"
                                                                    currentImage={manualReceiptUrl}
                                                                    onUpload={setManualReceiptUrl}
                                                                    aspectRatio="video"
                                                                    label="Dekont Dosyası Seç veya Sürükle"
                                                                    className="bg-white border-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Admin Fast-track Toggle */}
                                                    {(paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'CASH') && (
                                                        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[24px] flex items-center justify-between group hover:border-emerald-200 transition-colors">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                                                                    <ShieldCheck className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[13px] font-black text-emerald-900 tracking-tight">Hemen Aktifleştir (Admin Bypass)</p>
                                                                    <p className="text-[11px] text-emerald-800/60 font-bold uppercase tracking-widest">Ödemeyi doğrudan sistem üzerinden başarılı sayar.</p>
                                                                </div>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={immediateActivate} 
                                                                    onChange={e => setImmediateActivate(e.target.checked)}
                                                                    className="sr-only peer" 
                                                                />
                                                                <div className="w-11 h-6 bg-emerald-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Summary Row */}
                                            <div className="bg-surface-alt rounded-[28px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-p-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Ödeme Özeti</p>
                                                    <p className="text-4xl font-black text-text-main tracking-tight">
                                                        {isFree
                                                            ? 'Ücretsiz'
                                                            : `${((billingCycle === 'YEARLY' && plan?.price_yearly ? plan.price_yearly : plan?.price_monthly) / 100).toLocaleString('tr-TR')} ₺`
                                                        }
                                                        {!isFree && <span className="text-sm text-text-muted font-bold ml-1.5 italic">/ {billingCycle === 'YEARLY' ? 'yıl' : 'ay'}</span>}
                                                    </p>
                                                    
                                                    {/* Plan Change Warning */}
                                                    {(() => {
                                                        if (!currentSub || !plan) return null;
                                                        const currentPrice = (currentSub.billing_cycle === 'YEARLY' ? currentSub.subscription_plans?.price_yearly : currentSub.subscription_plans?.price_monthly) || 0;
                                                        const newPrice     = (billingCycle === 'YEARLY' ? plan.price_yearly : plan.price_monthly) || 0;
                                                        
                                                        if (newPrice < currentPrice) {
                                                            return (
                                                                <p className="flex items-center gap-1.5 text-amber-600 text-[11px] font-black uppercase tracking-tight mt-2 animate-in slide-in-from-left-2 transition-all">
                                                                    <AlertCircle className="w-3.5 h-3.5" /> Paket düşürme: Özellikler kısıtlanabilir
                                                                </p>
                                                            );
                                                        }
                                                        if (newPrice > currentPrice) {
                                                            return (
                                                                <p className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-black uppercase tracking-tight mt-2 animate-in slide-in-from-left-2 transition-all">
                                                                    <Star className="w-3.5 h-3.5 fill-current" /> Paket yükseltme: Yeni özellikler açılacak
                                                                </p>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                                <button
                                                    onClick={handlePurchase}
                                                    disabled={purchasing}
                                                    className={`px-12 py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 disabled:opacity-60 disabled:pointer-events-none hover:scale-[1.03] active:scale-95 ${immediateActivate ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-primary text-white shadow-primary/20'}`}
                                                >
                                                    {purchasing
                                                        ? <><Loader2 className="w-5 h-5 animate-spin" /> İşleniyor…</>
                                                        : (
                                                            <>
                                                                {immediateActivate ? <ShieldCheck className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                                                {immediateActivate ? 'Hemen Aktifleştir' : 'Talebi Oluştur'}
                                                            </>
                                                        )
                                                    }
                                                </button>
                                            </div>

                                            {/* Info note */}
                                            {!isFree && (paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'CASH') && (
                                                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-[12px] text-blue-800 font-medium">
                                                    <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                                    <span>Havale/EFT yönteminde abonelik, Finans → Ödeme Onayları ekranından onaylandıktan sonra aktif olacaktır.</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* ─ SUBSCRIPTIONS ─ */}
                        {!loading && activeTab === 'SUBSCRIPTIONS' && (
                            <div className="bg-white rounded-[36px] border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                <div className="p-8 border-b border-border">
                                    <h3 className="text-xl font-black text-text-main">Tüm Paket Geçmişi</h3>
                                    <p className="text-sm font-medium text-text-secondary italic mt-1">Bu kullanıcıya ait tüm abonelik kayıtları.</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-border">
                                            <tr>
                                                {['Paket', 'Periyot', 'Başlangıç', 'Bitiş', 'Durum'].map(h => (
                                                    <th key={h} className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {subHistory.length > 0 ? subHistory.map((sub) => {
                                                const st = statusLabel[sub.status] ?? { label: sub.status, cls: 'bg-gray-100 text-gray-500' };
                                                return (
                                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <PlanIcon name={sub.subscription_plans?.name} />
                                                                <div>
                                                                    <span className="text-sm font-bold text-text-main block">{sub.subscription_plans?.display_name}</span>
                                                                    <span className="text-[10px] font-medium text-text-muted uppercase">{selectedOwner.full_name || 'Owner'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500 tracking-wider">
                                                                {sub.billing_cycle === 'YEARLY' ? 'Yıllık' : 'Aylık'}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5 text-sm font-medium text-text-secondary">
                                                            {sub.current_period_start ? format(new Date(sub.current_period_start), 'dd MMM yyyy', { locale: tr }) : '-'}
                                                        </td>
                                                        <td className="px-8 py-5 text-sm font-medium text-text-secondary">
                                                            {sub.current_period_end ? format(new Date(sub.current_period_end), 'dd MMM yyyy', { locale: tr }) : '-'}
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${st.cls}`}>{st.label}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan={5} className="px-8 py-16 text-center text-text-muted italic text-xs uppercase tracking-widest">
                                                        Bu kullanıcıya ait paket geçmişi bulunmuyor.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ─ HISTORY ─ */}
                        {!loading && activeTab === 'HISTORY' && (() => {
                            const [currentPage, setCurrentPage] = useState(1);
                            const itemsPerPage = 3;
                            const totalPages = Math.ceil(payHistory.length / itemsPerPage);
                            const startIndex = (currentPage - 1) * itemsPerPage;
                            const currentItems = payHistory.slice(startIndex, startIndex + itemsPerPage);

                            return (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-white rounded-[36px] border border-border overflow-hidden">
                                        <div className="p-8 border-b border-border/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-surface-alt flex items-center justify-center text-text-main shadow-inner">
                                                    <HistoryIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-black text-text-main tracking-tight uppercase">Ödeme Geçmişi</h2>
                                                    <p className="text-xs font-medium text-text-secondary mt-0.5 uppercase tracking-widest">Tüm finansal kayıtlar ve faturalandırma.</p>
                                                </div>
                                            </div>
                                            {totalPages > 1 && (
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                                                    >
                                                        <ArrowLeft className="w-4 h-4" />
                                                    </button>
                                                    <div className="flex items-center gap-1.5 px-3">
                                                        {[...Array(totalPages)].map((_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => setCurrentPage(i + 1)}
                                                                className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-text-muted hover:bg-gray-100'}`}
                                                            >
                                                                {i + 1}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button 
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage === totalPages}
                                                        className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-surface-alt/30 border-b border-border text-[9px] font-black tracking-[0.2em] uppercase text-text-muted">
                                                        {['İşlem Tarihi', 'Dönem', 'Paket / Açıklama', 'Ödeme Yöntemi', 'Tutar', 'Durum'].map(h => (
                                                            <th key={h} className={`px-8 py-5 ${h === 'Durum' ? 'text-right' : ''}`}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/50">
                                                    {currentItems.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6} className="px-8 py-20 text-center">
                                                                <div className="flex flex-col items-center gap-3 opacity-30">
                                                                    <HistoryIcon className="w-12 h-12" />
                                                                    <p className="text-xs font-black uppercase tracking-widest">Henüz ödeme kaydı bulunmuyor</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : currentItems.map((payment) => {
                                                        const psSt: Record<string, string> = {
                                                            SUCCESS: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                                                            PENDING: 'text-amber-600 bg-amber-50 border-amber-100',
                                                            FAILED:  'text-red-600 bg-red-50 border-red-100',
                                                        };
                                                        const periodStr = format(new Date(payment.created_at), 'MMMM yyyy', { locale: tr });
                                                        
                                                        return (
                                                            <tr key={payment.id} className="hover:bg-gray-50/50 transition-all group">
                                                                <td className="px-8 py-6">
                                                                    <span className="text-sm font-bold text-text-main">
                                                                        {format(new Date(payment.created_at), 'dd MMM yyyy', { locale: tr })}
                                                                    </span>
                                                                    <span className="text-[10px] font-medium text-text-muted block mt-0.5">
                                                                        {format(new Date(payment.created_at), 'HH:mm', { locale: tr })}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className="text-xs font-black text-primary uppercase tracking-tight bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                                                                        {periodStr}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-black text-sm text-text-main group-hover:text-primary transition-colors">
                                                                            {payment.payment_type === 'SUBSCRIPTION' ? 'Abonelik Ödemesi' : 'Ek İşlem'}
                                                                        </span>
                                                                        {payment.subscriptions?.subscription_plans?.display_name && (
                                                                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">
                                                                                {payment.subscriptions.subscription_plans.display_name} 
                                                                                <span className="text-text-muted italic lowercase"> / {payment.subscriptions.billing_cycle === 'YEARLY' ? 'yıllık' : 'aylık'}</span>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                                        payment.payment_method === 'IYZICO' || payment.payment_method === 'CREDIT_CARD' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                                        payment.payment_method === 'BANK_TRANSFER' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                        payment.payment_method === 'CASH' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                        'bg-slate-50 text-slate-700 border-slate-100'
                                                                    }`}>
                                                                        {payment.payment_method === 'IYZICO' || payment.payment_method === 'CREDIT_CARD' ? 'KR. KARTI' : 
                                                                         payment.payment_method === 'BANK_TRANSFER' ? 'HAVALE / EFT' : 
                                                                         payment.payment_method === 'CASH' ? 'NAKİT' : payment.payment_method}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className="text-base font-black text-text-main tracking-tight">
                                                                        {payment.amount === 0 ? (
                                                                            <span className="text-emerald-600">ÜCRETSİZ</span>
                                                                        ) : (
                                                                            <>{(payment.amount / 100).toLocaleString('tr-TR')} ₺</>
                                                                        )}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${psSt[payment.status] ?? 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                                                                        {payment.status === 'SUCCESS' ? 'BAŞARILI' : payment.status === 'PENDING' ? 'BEKLEMEDE' : 'HATA'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-200/60 flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-primary shrink-0">
                                            <Info className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Ödeme Geçmişi Hakkında</p>
                                            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                                                Burada listelenen tüm işlemler işletme sahibinin mali kayıtlarını oluşturur. 
                                                <strong> Onay bekleyen</strong> havale işlemlerini Onaylar sekmesinden yönetebilirsiniz.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
