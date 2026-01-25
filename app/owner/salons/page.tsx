'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SalonDataService } from '@/services/db';
import { SalonDetail } from '@/types';
import {
    Plus,
    Store,
    MapPin,
    Phone,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    ChevronRight,
    Search,
    LayoutGrid
} from 'lucide-react';
import Link from 'next/link';

export default function OwnerSalonsPage() {
    const { user } = useAuth();
    const [salons, setSalons] = useState<SalonDetail[]>([]);
    const [loading, setLoading] = useState(true);

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
        } catch (err) {
            console.error('Error fetching salons:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return { label: 'Yayında', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 };
            case 'REJECTED':
                return { label: 'Reddedildi', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle };
            default:
                return { label: 'Onay Bekliyor', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tight">Salonlarım</h1>
                    <p className="text-text-secondary font-medium">Sahibi olduğunuz tüm işletmeleri buradan yönetebilirsiniz.</p>
                </div>
                <Link href="/admin/salons" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all">
                    <Plus className="w-4 h-4" /> Yeni Salon Ekle
                </Link>
            </div>

            {/* Salons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {salons.length > 0 ? (
                    salons.map((salon) => {
                        const status = getStatusInfo(salon.status || 'PENDING');
                        return (
                            <div key={salon.id} className="bg-white rounded-[32px] border border-border shadow-card overflow-hidden group hover:scale-[1.02] transition-all flex flex-col">
                                {/* Image Placeholder or Real image */}
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${salon.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop'})` }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute top-4 right-4">
                                        <div className={`px-4 py-1.5 rounded-full ${status.bg} ${status.color} border border-white/20 backdrop-blur-md shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-wider`}>
                                            <status.icon className="w-3 h-3" />
                                            {status.label}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">{salon.type_name}</p>
                                        <h3 className="text-xl font-black tracking-tight">{salon.name}</h3>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 flex-1 flex flex-col">
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 text-text-secondary text-sm font-medium">
                                            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{salon.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
                                            <Phone className="w-4 h-4" />
                                            <span>{salon.phone}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border mt-auto flex gap-3">
                                        <Link
                                            href={`/owner/salons/${salon.id}/edit`}
                                            className="flex-1 py-3 text-center bg-gray-50 text-text-main font-black text-xs rounded-xl hover:bg-gray-100 transition-colors border border-border"
                                        >
                                            Düzenle
                                        </Link>
                                        <Link
                                            href={`/owner/calendar?salonId=${salon.id}`}
                                            className="flex-1 py-3 text-center bg-primary text-white font-black text-xs rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all"
                                        >
                                            Yönet
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 bg-white rounded-[40px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                            <Store className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-main">Henüz bir salonunuz yok</h3>
                            <p className="text-text-secondary text-sm max-w-sm mx-auto">Hemen ilk salonunuzu ekleyerek randevu almaya başlayabilirsiniz.</p>
                        </div>
                        <Link href="/admin/salons" className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary-hover transition-all">
                            İlk Salonu Ekle
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
