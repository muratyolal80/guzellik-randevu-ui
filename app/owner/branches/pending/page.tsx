'use client';

import React from 'react';
import { useActiveSalon } from '@/context/ActiveSalonContext';
import {
    Clock,
    ShieldCheck,
    XCircle,
    AlertTriangle,
    ArrowLeft,
    Mail,
    Phone,
    HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PendingStatusPage() {
    const { activeSalon, setActiveSalon } = useActiveSalon();
    const router = useRouter();

    if (!activeSalon) {
        router.push('/owner/branches/select');
        return null;
    }

    const renderContent = () => {
        switch (activeSalon.status) {
            case 'SUBMITTED':
                return (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-amber-50 rounded-[30px] flex items-center justify-center text-amber-600 mx-auto shadow-inner border border-amber-100 relative">
                            <Clock className="w-12 h-12" />
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full border-4 border-white animate-pulse"></span>
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-text-main tracking-tight">Onay Bekleniyor</h1>
                            <p className="text-text-secondary font-medium leading-relaxed max-w-md mx-auto">
                                <span className="text-text-main font-black">{activeSalon.name}</span> başvurunuz elimize ulaştı. Ekibimiz detayları inceliyor, genellikle 24 saat içinde sonuçlanır.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-border shadow-soft space-y-6 text-left max-w-md mx-auto">
                            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">BU SÜREÇTE NE OLACAK?</h3>
                            <ul className="space-y-4">
                                {[
                                    { icon: ShieldCheck, text: "Verileriniz profesyonel ekiplerce doğrulanır." },
                                    { icon: HelpCircle, text: "Eksik bilgi varsa sizinle iletişime geçilir." },
                                    { icon: Clock, text: "Onay sonrası tüm yönetim özellikleri açılır." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-text-muted group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-bold text-text-main/80 pt-2">{item.text}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );
            case 'REJECTED':
                return (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-red-50 rounded-[30px] flex items-center justify-center text-red-600 mx-auto shadow-inner border border-red-100">
                            <XCircle className="w-12 h-12" />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-text-main tracking-tight">Düzeltme Gerekiyor</h1>
                            <p className="text-red-500 font-bold text-lg">"{activeSalon.rejected_reason || 'Belirtilmedi'}"</p>
                            <p className="text-text-secondary font-medium leading-relaxed max-w-md mx-auto">
                                Başvurunuz bazı nedenlerden dolayı reddedildi. Lütfen yukarıdaki notu dikkate alarak düzenlemeleri yapın ve tekrar gönderin.
                            </p>
                        </div>
                        <Link
                            href="/owner/onboarding"
                            className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                        >
                            Bilgileri Düzenle
                        </Link>
                    </div>
                );
            case 'SUSPENDED':
                return (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-purple-50 rounded-[30px] flex items-center justify-center text-purple-600 mx-auto shadow-inner border border-purple-100">
                            <AlertTriangle className="w-12 h-12" />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-text-main tracking-tight">Şube Askıya Alındı</h1>
                            <p className="text-text-secondary font-medium leading-relaxed max-w-md mx-auto">
                                Maalesef bu şubeniz aktif değildir. Sistemsel bir kural ihlali veya ödeme sorunu olabilir.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 max-w-xs mx-auto">
                            <button className="flex items-center gap-3 p-4 bg-white border border-border rounded-2xl font-bold text-text-main hover:bg-gray-50 transition-all">
                                <Mail className="w-5 h-5 text-text-muted" /> Destek Talebi Aç
                            </button>
                            <button className="flex items-center gap-3 p-4 bg-white border border-border rounded-2xl font-bold text-text-main hover:bg-gray-50 transition-all">
                                <Phone className="w-5 h-5 text-text-muted" /> Bizi Arayın
                            </button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="py-20">
                        <p className="text-text-muted italic">Durum belirlenemedi. Lütfen bekleyin...</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center font-sans">
            <div className="max-w-2xl w-full">

                {renderContent()}

                <div className="mt-12 pt-12 border-t border-gray-100">
                    <button
                        onClick={() => {
                            localStorage.removeItem(`active_salon`); // Global common item too? No, use context helper
                            setActiveSalon(null);
                            router.push('/owner/branches/select');
                        }}
                        className="text-sm font-black text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" /> Şube Listesine Geri Dön
                    </button>
                </div>
            </div>
        </div>
    );
}
