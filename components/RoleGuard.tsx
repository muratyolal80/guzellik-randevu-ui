'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useActiveBranch } from '@/context/ActiveBranchContext';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/types';

interface Props {
    children: ReactNode;
    allowedRoles?: UserRole[];
    requireBranchApproval?: boolean;
    fallback?: ReactNode;
}

export default function RoleGuard({
    children,
    allowedRoles = [],
    requireBranchApproval = true,
    fallback
}: Props) {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const { activeBranch, loading: branchLoading } = useActiveBranch();

    // 0. Wait for initial state
    if (authLoading || (requireBranchApproval && branchLoading)) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // 1. If user is super admin, always allow
    if (isAdmin) return <>{children}</>;

    // 2. Not logged in
    if (!user) return null;

    // 3. Check roles if specified
    if (allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            return fallback || (
                <div className="p-12 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-text-main mb-2">Yetkiniz Yok</h2>
                    <p className="text-sm font-medium text-text-secondary mb-8">Bu bölüme erişmek için gerekli izinlere sahip değilsiniz.</p>
                    <Link href="/" className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg">
                        Anasayfaya Dön
                    </Link>
                </div>
            );
        }
    }

    // 4. Check branch approval if required
    // OWNER or STAFF must have an approved branch to perform sensitive actions
    if (requireBranchApproval && activeBranch && activeBranch.status !== 'APPROVED') {
        return fallback || (
            <div className="p-12 text-center bg-amber-50 rounded-[40px] border border-amber-100">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6 shadow-sm">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-text-main mb-2">Şube Onayı Bekleniyor</h2>
                <p className="text-sm font-medium text-text-secondary mb-8">Bu işlemi gerçekleştirmek için şubenizin onaylanmış olması gerekmektedir.</p>
                <Link href="/owner/dashboard" className="px-8 py-3 bg-amber-600 text-white font-bold rounded-2xl shadow-lg">
                    Dashboard'a Dön
                </Link>
            </div>
        );
    }

    return <>{children}</>;
}
