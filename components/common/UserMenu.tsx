'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import { ShieldUser, Store, Scissors, CalendarDays, Heart, User, Settings, LogOut } from 'lucide-react';
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

    // OTP ile kayıtta auth email'i sentetik olabiliyor: "<telefon>@pending.user".
    // Bunu split edip "5323334455" gösterMEK yerine; önce ismi, yoksa temiz formatlı
    // telefonu göster (isim profile'da; flaky oturumda yüklenmezse telefona düşeriz).
    const meta = (user as any).user_metadata || {};
    const rawEmail = user.email || '';
    const isSyntheticEmail = rawEmail === '' || rawEmail.endsWith('@pending.user');
    const formatPhone = (p?: string) => {
        if (!p) return '';
        const d = p.replace(/\D/g, '').replace(/^90/, '');
        return d.length === 10
            ? `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`
            : p;
    };
    const displayName =
        (user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') ||
        (meta.first_name ? `${meta.first_name} ${meta.last_name || ''}`.trim() : '') ||
        (!isSyntheticEmail ? rawEmail.split('@')[0] : '') ||
        formatPhone(user.phone) ||
        'Müşteri';

    const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

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
                    style={{ backgroundImage: `url("${avatarUrl}")` }} role="img" aria-label="Profil fotoğrafı"
                ></div>
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl transition-all duration-200 transform origin-top-right z-50 ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
            >
                <div className="p-2">
                    <div className="px-4 py-2 border-b border-gray-100 mb-2 md:hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{isSyntheticEmail ? formatPhone(user.phone) : rawEmail}</p>
                    </div>

                    {/* Role Based Links */}
                    {isAdmin && (
                        <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors font-semibold"
                        >
                            <ShieldUser className="w-[18px] h-[18px]" aria-hidden="true" />
                            Admin Paneli
                        </Link>
                    )}

                    {isOwner && !isAdmin && (
                        <Link
                            href="/owner/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors font-semibold"
                        >
                            <Store className="w-[18px] h-[18px]" aria-hidden="true" />
                            İşletme Yönetimi
                        </Link>
                    )}

                    {user.role === 'STAFF' && (
                        <Link
                            href="/staff/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors font-semibold"
                        >
                            <Scissors className="w-[18px] h-[18px]" aria-hidden="true" />
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
                                <CalendarDays className="w-[18px] h-[18px]" aria-hidden="true" />
                                Randevularım
                            </Link>

                            <Link
                                href="/customer/favorites"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                            >
                                <Heart className="w-[18px] h-[18px]" aria-hidden="true" />
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
                        <User className="w-[18px] h-[18px]" aria-hidden="true" />
                        Profilim
                    </Link>

                    <Link
                        href={isAdmin ? '/admin/settings' : isOwner ? '/owner/packages' : '/customer/settings'}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                    >
                        <Settings className="w-[18px] h-[18px]" aria-hidden="true" />
                        Ayarlar
                    </Link>

                    <div className="h-px bg-gray-100 my-1"></div>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors text-left"
                    >
                        <LogOut className="w-[18px] h-[18px]" aria-hidden="true" />
                        Çıkış Yap
                    </button>
                </div>
            </div>
        </div>
    );
};
