'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StaffService, SalonDataService } from '@/services/db';
import {
    Users,
    UserPlus,
    Edit2,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle,
    Save,
    MoreHorizontal,
    Briefcase,
    Mail,
    Phone
} from 'lucide-react';

export default function OwnerStaffManagement() {
    const { user } = useAuth();
    const [salon, setSalon] = useState<any>(null);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [workingHours, setWorkingHours] = useState<any[]>([]);

    // Form States
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffSpecialty, setNewStaffSpecialty] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const salonData = await SalonDataService.getSalonByOwner(user?.id!);
            if (salonData) {
                setSalon(salonData);
                const staffList = await StaffService.getStaffBySalon(salonData.id);
                setStaff(staffList);
            }
        } catch (err) {
            console.error('Veri çekme hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!salon) return;
        setSaving(true);
        try {
            await StaffService.createStaff({
                salon_id: salon.id,
                name: newStaffName,
                specialty: newStaffSpecialty,
                is_active: true
            });
            setShowAddModal(false);
            setNewStaffName('');
            setNewStaffSpecialty('');
            // Refresh list
            const staffList = await StaffService.getStaffBySalon(salon.id);
            setStaff(staffList);
        } catch (err) {
            console.error('Personel ekleme hatası:', err);
            alert('Personel eklenirken bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenShifts = async (staffMember: any) => {
        setSelectedStaff(staffMember);
        try {
            const hours = await StaffService.getStaffWorkingHours(staffMember.id);
            setWorkingHours(hours);
            setShowShiftModal(true);
        } catch (err) {
            console.error('Vardiya bilgisi çekilemedi:', err);
        }
    };

    const handleToggleDayOff = async (hourId: string, currentStatus: boolean) => {
        try {
            await StaffService.updateWorkingHours(hourId, { is_day_off: !currentStatus });
            setWorkingHours(prev => prev.map(h => h.id === hourId ? { ...h, is_day_off: !currentStatus } : h));
        } catch (err) {
            console.error('Güncelleme hatası:', err);
        }
    };

    const handleDeleteStaff = async (staffId: string) => {
        if (!confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
        try {
            await StaffService.deleteStaff(staffId);
            setStaff(prev => prev.filter(s => s.id !== staffId));
        } catch (err) {
            console.error('Silme hatası:', err);
            alert('Silme işlemi başarısız.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tight">Personel Yönetimi</h1>
                    <p className="text-text-secondary font-medium italic">Ekibinizi yönetin, vardiyaları düzenleyin ve performans takibi yapın.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <UserPlus className="w-5 h-5" /> Yeni Personel Ekle
                </button>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((member) => (
                    <div key={member.id} className="bg-white rounded-[32px] border border-border shadow-card overflow-hidden group hover:shadow-xl transition-all">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-20 h-20 rounded-3xl bg-surface-alt border-2 border-border overflow-hidden relative">
                                    <img
                                        src={member.photo || `https://i.pravatar.cc/150?u=${member.id}`}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {member.is_active && (
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenShifts(member)} className="p-2.5 bg-gray-50 text-text-main rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-gray-100" title="Çalışma Saatleri">
                                        <Clock className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteStaff(member.id)} className="p-2.5 bg-gray-50 text-red-500 rounded-xl hover:bg-red-50 transition-all border border-gray-100" title="Sil">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-black text-text-main leading-tight line-clamp-1">{member.name}</h3>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest mt-0.5">{member.specialty}</p>
                                </div>

                                <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-text-muted uppercase">Randevular</span>
                                        <span className="text-sm font-black text-text-main">12 Bugün</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-text-muted uppercase">Puan</span>
                                        <span className="text-sm font-black text-text-main flex items-center gap-1">4.9 <span className="text-amber-500">★</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-8 py-4 bg-gray-50 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">{member.is_active ? 'AKTİF ÇALIŞAN' : 'PASİF'}</span>
                            <button className="text-[10px] font-black text-primary hover:underline uppercase">Detaylı Rapor</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-border bg-gray-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-text-main tracking-tight">Yeni Personel Ekle</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><XCircle className="w-5 h-5 text-text-secondary" /></button>
                        </div>
                        <form onSubmit={handleAddStaff} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Tam İsim</label>
                                <input
                                    type="text"
                                    required
                                    value={newStaffName}
                                    onChange={(e) => setNewStaffName(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl text-sm font-bold text-text-main focus:border-primary outline-none transition-all"
                                    placeholder="Örn: Mehmet Öz"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Uzmanlık</label>
                                <input
                                    type="text"
                                    required
                                    value={newStaffSpecialty}
                                    onChange={(e) => setNewStaffSpecialty(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl text-sm font-bold text-text-main focus:border-primary outline-none transition-all"
                                    placeholder="Örn: Kıdemli Berber"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? 'Kaydediliyor...' : 'Personeli Kaydet'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Working Hours (Shift) Modal */}
            {showShiftModal && selectedStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowShiftModal(false)}>
                    <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-border bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-text-main tracking-tight">{selectedStaff.name}</h3>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Haftalık Çalışma Saatleri</p>
                            </div>
                            <button onClick={() => setShowShiftModal(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><XCircle className="w-5 h-5 text-text-secondary" /></button>
                        </div>
                        <div className="p-10 space-y-4 max-h-[60vh] overflow-y-auto">
                            {['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'].map((dayName, idx) => {
                                const dayConfig = workingHours.find(h => h.day_of_week === idx);
                                if (!dayConfig) return null;

                                return (
                                    <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${dayConfig.is_day_off ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-border shadow-sm'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${dayConfig.is_day_off ? 'bg-gray-200 text-text-muted' : 'bg-primary/10 text-primary'}`}>
                                                {dayName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text-main">{dayName}</p>
                                                {!dayConfig.is_day_off && (
                                                    <p className="text-[10px] font-bold text-text-muted">{dayConfig.start_time.substring(0, 5)} - {dayConfig.end_time.substring(0, 5)}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleDayOff(dayConfig.id, dayConfig.is_day_off)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${dayConfig.is_day_off ? 'bg-white text-text-main border border-border shadow-sm' : 'bg-red-50 text-red-600 border border-red-100'}`}
                                        >
                                            {dayConfig.is_day_off ? 'Vardiya Ekle' : 'İzin Yap'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-8 border-t border-border bg-gray-50">
                            <button onClick={() => setShowShiftModal(false)} className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
                                Değişiklikleri Tamamla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
