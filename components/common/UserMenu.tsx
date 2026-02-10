'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export const UserMenu: React.FC = () => {
    const { user, signOut, isAdmin, isOwner, isStaff } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user) {
        return (
            <div className="flex items-center gap-3">
                <Link href="/login" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium whitespace-nowrap hidden sm:block">
                    Giriş Yap
                </Link>
                <Link href="/register" className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 hidden sm:block whitespace-nowrap">
                    Kayıt Ol
                </Link>
            </div>
        );
    }

    const displayName = user.first_name
        ? `${user.first_name} ${user.last_name || ''}`.trim()
        : ((user as any).user_metadata?.first_name ? `${(user as any).user_metadata.first_name} ${(user as any).user_metadata.last_name || ''}`.trim() : user.email?.split('@')[0] || 'Kullanıcı');

    const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=random`;

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
        router.push('/');
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 group focus:outline-none"
            >
                <span className="text-sm font-bold text-text-main hidden xl:block truncate max-w-[150px]">
                    {displayName}
                </span>
                <div
                    className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border-2 cursor-pointer transition-all ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-border group-hover:border-primary'}`}
                    style={{ backgroundImage: `url("${avatarUrl}")` }}
                ></div>
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl transition-all duration-200 transform origin-top-right z-50 ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
            >
                <div className="p-2">
                    <div className="px-4 py-2 border-b border-gray-100 mb-2 md:hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Role Based Links */}
                    {isAdmin && (
                        <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors font-semibold"
                        >
                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                            Admin Paneli
                        </Link>
                    )}

                    {isOwner && !isAdmin && (
                        <Link
                            href="/owner/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors font-semibold"
                        >
                            <span className="material-symbols-outlined text-[18px]">store</span>
                            İşletme Yönetimi
                        </Link>
                    )}

                    {user.role === 'STAFF' && (
                        <Link
                            href={`/booking/1/staff`} // Using existing pattern, realistically should be dynamic
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors font-semibold"
                        >
                            <span className="material-symbols-outlined text-[18px]">content_cut</span>
                            Personel Paneli
                        </Link>
                    )}

                    {/* Customer Specific Links */}
                    {!isAdmin && !isOwner && !isStaff && (
                        <>
                            <Link
                                href="/customer/appointments"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                Randevularım
                            </Link>

                            <Link
                                href="/customer/favorites"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">favorite</span>
                                Favorilerim
                            </Link>
                        </>
                    )}

                    {/* Common Links for All Users (Dynamic Path) */}
                    <Link
                        href={isAdmin ? '/admin/profile' : isOwner ? '/owner/profile' : '/customer/profile'}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        Profilim
                    </Link>

                    <Link
                        href={isAdmin ? '/admin/settings' : isOwner ? '/owner/settings' : '/customer/settings'}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        Ayarlar
                    </Link>

                    <div className="h-px bg-gray-100 my-1"></div>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors text-left"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Çıkış Yap
                    </button>
                </div>
            </div>
        </div>
    );
};
