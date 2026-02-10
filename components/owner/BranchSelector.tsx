'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useActiveBranch } from '@/context/ActiveBranchContext';
import { useRouter } from 'next/navigation';
import { Store, ChevronDown, CheckCircle2, Plus } from 'lucide-react';

export default function BranchSelector() {
    const { activeBranch, branches, setActiveBranch } = useActiveBranch();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleBranchChange = (branchId: string) => {
        const branch = branches.find(b => b.id === branchId);
        if (branch) {
            setActiveBranch(branch);
            setIsOpen(false);
            // Refresh the current page to reflect new branch
            window.location.reload();
        }
    };

    const handleAddBranch = () => {
        setIsOpen(false);
        router.push('/owner/salons');
    };

    if (!activeBranch || branches.length === 0) {
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-white border border-border rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
            >
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Store className="w-4 h-4" />
                </div>
                <div className="text-left">
                    <p className="text-xs font-black text-text-main truncate max-w-[160px]">
                        {activeBranch.name}
                    </p>
                    <p className="text-[10px] font-bold text-text-muted truncate">
                        {activeBranch.district_name || 'Şube'}
                    </p>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-3xl border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {/* Header */}
                    <div className="p-4 border-b border-border bg-gray-50">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                            Aktif Şubeni Seç
                        </p>
                    </div>

                    {/* Branch List */}
                    <div className="p-3 max-h-[400px] overflow-y-auto">
                        <div className="space-y-1">
                            {branches.map((branch) => (
                                <button
                                    key={branch.id}
                                    onClick={() => handleBranchChange(branch.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${branch.id === activeBranch.id
                                        ? 'bg-primary/5 border border-primary/20'
                                        : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-cover bg-center border border-border flex-shrink-0"
                                            style={{
                                                backgroundImage: branch.image
                                                    ? `url(${branch.image})`
                                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            }}
                                        />
                                        <div className="text-left overflow-hidden">
                                            <p className="text-sm font-bold text-text-main truncate">
                                                {branch.name}
                                            </p>
                                            <p className="text-[10px] font-bold text-text-muted truncate">
                                                {branch.district_name || branch.city_name || 'Konum yok'}
                                            </p>
                                            {branch.status && branch.status !== 'APPROVED' && (
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${branch.status === 'SUBMITTED'
                                                        ? 'bg-amber-50 text-amber-700'
                                                        : 'bg-red-50 text-red-700'
                                                    }`}>
                                                    {branch.status === 'SUBMITTED' ? 'Onay Bekliyor' : 'Reddedildi'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {branch.id === activeBranch.id && (
                                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer - Add New Branch */}
                    <div className="p-3 border-t border-border bg-gray-50">
                        <button
                            onClick={handleAddBranch}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-primary font-bold text-xs rounded-xl hover:bg-primary/5 transition-all border border-border uppercase tracking-widest"
                        >
                            <Plus className="w-4 h-4" />
                            Yeni Şube Ekle
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
