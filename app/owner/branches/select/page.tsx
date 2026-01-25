'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useActiveSalon } from '@/context/ActiveSalonContext';
import { SalonDataService } from '@/services/db';
import { SalonDetail } from '@/types';
import {
    Store,
    ArrowRight,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Activity,
    MapPin
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BranchSelectPage() {
    const { user } = useAuth();
    const { setActiveSalon } = useActiveSalon();
    const [salons, setSalons] = useState<SalonDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            fetchSalons();
        }
    }, [user]);

    const fetchSalons = async () => {
        try {
            setLoading(true);
            const data = await SalonDataService.getSalonsByOwner(user?.id!);
            setSalons(data);

            // If they accidentally hit select but have no salons, go to onboarding
            if (data.length === 0) {
                router.push('/owner/onboarding');
            }
        } catch (err) {
            console.error('Error fetching salons for selection:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (salon: SalonDetail) => {
        setActiveSalon(salon);
        if (salon.status === 'APPROVED') {
            router.push('/owner/dashboard');
        } else {
            router.push('/owner/branches/pending');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-20 px-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary rounded-[28px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-primary/20 mb-6">
                        <Store className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black text-text-main tracking-tight">Şube Seçin</h1>
                    <p className="text-text-secondary font-medium text-lg">Hangi şubenizi yönetmek istiyorsunuz?</p>
                </div>

                {/* Salon Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {salons.map((salon) => (
                        <div
                            key={salon.id}
                            onClick={() => handleSelect(salon)}
                            className="group bg-white rounded-[40px] border-2 border-transparent hover:border-primary transition-all p-8 shadow-card hover:shadow-2xl hover:shadow-primary/5 cursor-pointer relative overflow-hidden"
                        >
                            <div className="flex flex-col h-full gap-6">
                                <div className="flex justify-between items-start">
                                    <div className="w-16 h-16 rounded-[22px] bg-cover bg-center border border-border shadow-inner" style={{ backgroundImage: `url(${salon.image})` }}></div>
                                    <StatusBadge status={salon.status} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-text-main group-hover:text-primary transition-colors">{salon.name}</h3>
                                    <div className="flex items-center gap-2 text-text-secondary font-bold text-sm">
                                        <MapPin className="w-4 h-4 text-text-muted" />
                                        {salon.city_name}, {salon.district_name}
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">YÖNETİM PANELİNE GİT</span>
                                    <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Branch Card */}
                    <Link
                        href="/owner/onboarding"
                        className="group bg-gray-100/50 rounded-[40px] border-2 border-dashed border-gray-300 hover:border-primary hover:bg-white transition-all p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-white border border-border flex items-center justify-center text-text-muted group-hover:text-primary group-hover:scale-110 transition-all shadow-sm">
                            <Plus className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-text-main group-hover:text-primary transition-colors">Yeni Şube Ekle</p>
                            <p className="text-sm font-medium text-text-secondary">İşletmenizi büyütmeye devam edin.</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: any }) {
    const map: Record<string, any> = {
        DRAFT: { label: 'TASLAK', icon: Activity, color: 'text-gray-600', bg: 'bg-gray-50' },
        SUBMITTED: { label: 'ONAY BEKLİYOR', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
        APPROVED: { label: 'YAYINDA', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
        REJECTED: { label: 'REDDEDİLDİ', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        SUSPENDED: { label: 'ASKIDA', icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' }
    };
    const s = map[status || 'DRAFT'];
    if (!s) return null;
    return (
        <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${s.bg} ${s.color} border ${s.border || 'border-transparent'} shadow-sm flex items-center gap-2`}>
            <s.icon className="w-3 h-3" />
            {s.label}
        </span>
    );
}
