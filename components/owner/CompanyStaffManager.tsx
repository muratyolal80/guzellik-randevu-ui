'use client';

import React, { useState, useEffect } from 'react';
import { StaffService, SalonDataService } from '@/services/db';
import { Staff, SalonDetail } from '@/types';
import {
    Users,
    UserPlus,
    Edit2,
    Trash2,
    Building,
    CheckCircle2,
    X,
    MoreVertical,
    Search,
    Phone,
    Mail,
    Plus,
    Briefcase,
    ChevronRight,
    Loader2,
    ShieldCheck,
    Settings
} from 'lucide-react';
import Image from 'next/image';

interface CompanyStaffManagerProps {
    ownerId: string;
}

export default function CompanyStaffManager({ ownerId }: CompanyStaffManagerProps) {
    const [staff, setStaff] = useState<any[]>([]);
    const [salons, setSalons] = useState<SalonDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [assigningLoading, setAssigningLoading] = useState(false);
    const [staffBranches, setStaffBranches] = useState<string[]>([]); // Current assignments for modal

    useEffect(() => {
        if (ownerId) {
            fetchData();
        }
    }, [ownerId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffList, salonList] = await Promise.all([
                StaffService.getStaffByOwner(ownerId),
                SalonDataService.getSalonsByOwner(ownerId)
            ]);

            // For each staff, fetch their branches
            const staffWithBranches = await Promise.all(staffList.map(async (s) => {
                const branches = await StaffService.getStaffBranches(s.id);
                return { ...s, branches: branches.map(b => b.salon_id) };
            }));

            setStaff(staffWithBranches);
            setSalons(salonList);
        } catch (err) {
            console.error('Veri çekme hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssign = (member: any) => {
        setSelectedStaff(member);
        setStaffBranches(member.branches || []);
        setShowAssignModal(true);
    };

    const toggleBranchAssignment = async (salonId: string) => {
        if (!selectedStaff) return;
        
        const isAssigned = staffBranches.includes(salonId);
        setAssigningLoading(true);
        try {
            if (isAssigned) {
                await StaffService.removeStaffFromBranch(selectedStaff.id, salonId);
                setStaffBranches(prev => prev.filter(id => id !== salonId));
            } else {
                await StaffService.assignStaffToBranch(selectedStaff.id, salonId);
                setStaffBranches(prev => [...prev, salonId]);
            }
        } catch (err: any) {
            alert("Hata: " + err.message);
        } finally {
            setAssigningLoading(false);
            // Refresh main list branch data in bg
            fetchData();
        }
    };

    const filteredStaff = staff.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Personel adı, rolü veya e-posta ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((member) => (
                    <div key={member.id} className="bg-white rounded-[32px] border border-border shadow-card overflow-hidden group hover:shadow-xl transition-all border-l-4 border-l-primary">
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-surface-alt relative overflow-hidden shrink-0 border border-border shadow-sm">
                                    <img
                                        src={member.photo || member.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {member.is_active && (
                                        <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="text-lg font-black text-text-main truncate">{member.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{member.role || 'Personel'}</p>
                                    <div className="flex flex-col gap-1">
                                        {member.email && (
                                            <div className="flex items-center gap-2 text-text-muted text-[10px] font-bold">
                                                <Mail className="w-3 h-3" /> <span className="truncate">{member.email}</span>
                                            </div>
                                        )}
                                        {member.phone && (
                                            <div className="flex items-center gap-2 text-text-muted text-[10px] font-bold">
                                                <Phone className="w-3 h-3" /> <span>{member.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Branches Tags */}
                            <div className="mb-6">
                                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                                    <Building className="w-3 h-3" /> Görev Aldığı Şubeler ({member.branches?.length || 0})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {member.branches?.length > 0 ? (
                                        member.branches.map((bid: string) => {
                                            const salon = salons.find(s => s.id === bid);
                                            return (
                                                <span key={bid} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg border border-primary/10">
                                                    {salon?.name || 'Bilinmeyen Şube'}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-[10px] font-bold text-red-400 italic">Henüz bir şubeye atanmamış</span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => handleOpenAssign(member)}
                                className="w-full py-3.5 bg-surface-alt hover:bg-primary/5 text-text-main hover:text-primary font-black text-[10px] tracking-widest uppercase rounded-2xl transition-all flex items-center justify-center gap-2 border border-border hover:border-primary/20"
                            >
                                <Settings className="w-3.5 h-3.5" /> Şube Atamalarını Yönet
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Assign Modal */}
            {showAssignModal && selectedStaff && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !assigningLoading && setShowAssignModal(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-text-main">Şube Atamaları</h2>
                                    <p className="text-sm font-medium text-text-secondary">{selectedStaff.name} isimli personelin görev yerleri</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => !assigningLoading && setShowAssignModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-text-muted" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                            {salons.map(salon => {
                                const isAssigned = staffBranches.includes(salon.id);
                                return (
                                    <div 
                                        key={salon.id}
                                        onClick={() => !assigningLoading && toggleBranchAssignment(salon.id)}
                                        className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                                            isAssigned 
                                            ? 'border-primary bg-primary/5' 
                                            : 'border-border bg-white hover:border-primary/20 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                                isAssigned ? 'bg-primary text-white' : 'bg-surface-alt text-text-muted group-hover:text-primary'
                                            }`}>
                                                <Building className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className={`font-black tracking-tight ${isAssigned ? 'text-primary' : 'text-text-main'}`}>
                                                    {salon.name}
                                                </p>
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                    {salon.district_name}, {salon.city_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                            isAssigned ? 'bg-primary text-white scale-100' : 'bg-gray-100 text-transparent scale-50'
                                        }`}>
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {assigningLoading && (
                                <div className="flex items-center justify-center py-4 text-primary font-bold text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> İşlem yapılıyor...
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-gray-50 border-t border-border mt-auto">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                disabled={assigningLoading}
                                className="w-full py-4 bg-text-main text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all uppercase tracking-widest text-xs"
                            >
                                Değişiklikleri Tamamla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
