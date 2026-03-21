'use client';

import React, { useState } from 'react';
import { useActiveBranch } from '@/context/ActiveBranchContext';
import { useAuth } from '@/context/AuthContext';
import SalonStaffManager from '@/components/shared/salon/SalonStaffManager';
import CompanyStaffManager from '@/components/owner/CompanyStaffManager';
import { Store, Users, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function OwnerStaffPage() {
    const { activeBranch, loading: branchLoading } = useActiveBranch();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'BRANCH' | 'COMPANY'>(activeBranch ? 'BRANCH' : 'COMPANY');

    if (branchLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-8 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tight">Personel Yönetimi</h1>
                    <p className="text-text-secondary font-medium">Şirketinizdeki tüm personelleri ve şube atamalarını buradan yönetin.</p>
                </div>

                {/* Tabs */}
                <div className="bg-surface-alt p-1 rounded-2xl border border-border flex items-center self-start shadow-sm">
                    <button
                        onClick={() => setActiveTab('BRANCH')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'BRANCH' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Store className="w-4 h-4" /> Şube Personelleri
                    </button>
                    <button
                        onClick={() => setActiveTab('COMPANY')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'COMPANY' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Users className="w-4 h-4" /> Tüm Personelim (Şirket)
                    </button>
                </div>
            </div>

            {activeTab === 'BRANCH' ? (
                !activeBranch ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-white rounded-[40px] border border-border shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Store className="w-8 h-8 text-text-muted" />
                        </div>
                        <h2 className="text-xl font-black text-text-main">Aktif Şube Seçilmedi</h2>
                        <p className="text-text-secondary mt-2 mb-6">Şubeye özel personel yönetimi için lütfen yukarıdan bir şube seçin.</p>
                        <Link href="/owner/salons" className="px-8 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all">
                            Şubelerim'e Git
                        </Link>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 inline-flex items-center gap-3">
                            <Briefcase className="w-5 h-5 text-primary" />
                            <p className="text-sm font-bold text-text-main">
                                <span className="text-primary font-black">{activeBranch.name}</span> şubesi için personel listesi
                            </p>
                        </div>
                        <SalonStaffManager salonId={activeBranch.id} />
                    </div>
                )
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CompanyStaffManager ownerId={user?.id || ''} />
                </div>
            )}
        </div>
    );
}
