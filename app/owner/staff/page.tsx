'use client';

import React from 'react';
import { useActiveBranch } from '@/context/ActiveBranchContext';
import StaffManagementTab from '@/components/owner/StaffManagementTab';
import { Store } from 'lucide-react';
import Link from 'next/link';

export default function OwnerStaffPage() {
    const { activeBranch, loading } = useActiveBranch();

    if (loading) return <div>Yükleniyor...</div>;

    if (!activeBranch) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Store className="w-8 h-8 text-text-muted" />
                </div>
                <h2 className="text-xl font-black text-text-main">Aktif Şube Seçilmedi</h2>
                <p className="text-text-secondary mt-2 mb-6">Personel yönetimi yapmak için lütfen yukarıdan bir şube seçin.</p>
                <Link href="/owner/salons" className="px-6 py-3 bg-primary text-white rounded-2xl font-bold">
                    Şubelerim'e Git
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-text-main">Personel Yönetimi</h1>
                <p className="text-text-secondary font-medium mt-1">
                    <span className="text-primary font-bold">{activeBranch.name}</span> şubesindeki personelleri yönetin.
                </p>
            </div>

            <StaffManagementTab salonId={activeBranch.id} />
        </div>
    );
}
