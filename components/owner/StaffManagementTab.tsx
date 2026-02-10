'use client';

import React, { useState, useEffect } from 'react';
import { StaffService, SalonDataService } from '@/services/db';
const DEFAULT_HOURS = [
    { day_of_week: 1, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 2, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 3, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 4, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 5, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 6, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 0, start_time: '09:00', end_time: '19:00', is_day_off: true },
];
import { Staff, WorkingHours } from '@/types';
import ImageUpload from '@/components/ImageUpload';
import WorkingHoursEditor from '@/components/owner/WorkingHoursEditor';
import {
    Users,
    UserPlus,
    Edit2,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle,
    Save,
    X,
    Briefcase
} from 'lucide-react';

interface StaffManagementTabProps {
    salonId: string;
}

export default function StaffManagementTab({ salonId }: StaffManagementTabProps) {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);

    // Form States
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffSpecialty, setNewStaffSpecialty] = useState('');
    const [newStaffPhoto, setNewStaffPhoto] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [salonName, setSalonName] = useState('');
    const [newStaffWorkingHours, setNewStaffWorkingHours] = useState(DEFAULT_HOURS);

    useEffect(() => {
        fetchStaff();
        fetchSalon();
    }, [salonId]);

    const fetchSalon = async () => {
        try {
            const salon = await SalonDataService.getSalonById(salonId);
            setSalonName(salon?.name || '');
        } catch (err) {
            console.error('Salon bilgisi çekilemedi:', err);
        }
    };

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const staffList = await StaffService.getStaffBySalon(salonId);
            setStaff(staffList);
        } catch (err) {
            console.error('Veri çekme hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await StaffService.createStaff({
                salon_id: salonId,
                name: newStaffName,
                specialty: newStaffSpecialty,
                photo: newStaffPhoto,
                is_active: true
            }, newStaffWorkingHours);
            setShowAddModal(false);
            setNewStaffName('');
            setNewStaffSpecialty('');
            setNewStaffPhoto('');
            setNewStaffWorkingHours(DEFAULT_HOURS);
            fetchStaff();
        } catch (err) {
            console.error('Personel ekleme hatası:', err);
            alert('Personel eklenirken bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenShifts = async (staffMember: Staff) => {
        setSelectedStaff(staffMember);
        try {
            const hours = await StaffService.getStaffWorkingHours(staffMember.id);
            setWorkingHours(hours);
            setShowShiftModal(true);
        } catch (err) {
            console.error('Vardiya bilgisi çekilemedi:', err);
        }
    };

    const handleUpdateWorkingHours = async (updatedHours: any[]) => {
        setWorkingHours(updatedHours);
        // We might want to save individual entries here or have a 'Save all' button
        // For now, let's keep the existing logic where they update on change if it was before
    };

    const handleUpdateOneShift = async (hourId: string, updates: Partial<WorkingHours>) => {
        try {
            await StaffService.updateWorkingHours(hourId, updates);
            // State update is already handled by the editor component calling onChange, 
            // but we ensure our top-level 'workingHours' state remains in sync
            setWorkingHours(prev => prev.map(h => h.id === hourId ? { ...h, ...updates } : h));
        } catch (err) {
            console.error('Vardiya güncelleme hatası:', err);
        }
    };

    const handleDeleteStaff = async (staffId: string) => {
        if (!window.confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
        try {
            await StaffService.deleteStaff(staffId);
            setStaff(prev => prev.filter(s => s.id !== staffId));
        } catch (err) {
            console.error('Silme hatası:', err);
        }
    };

    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    if (loading) return <div className="p-10 text-center text-text-muted">Yükleniyor...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-[32px] border border-border">
                <div>
                    <h3 className="text-lg font-black text-text-main">Personel Listesi</h3>
                    <p className="text-xs text-text-secondary mt-1">{staff.length} çalışanınız bulunuyor.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <UserPlus className="w-5 h-5" /> Personel Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((member) => (
                    <div key={member.id} className="bg-white p-6 rounded-[32px] border border-border shadow-card hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 bg-cover bg-center border border-border"
                                style={{ backgroundImage: `url(${member.photo || 'https://i.pravatar.cc/150'})` }}
                            />
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenShifts(member)}
                                    className="p-2 hover:bg-primary/10 rounded-xl text-primary transition-colors"
                                    title="Çalışma Saatleri"
                                >
                                    <Clock className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteStaff(member.id)}
                                    className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-text-main mb-1">{member.name}</h3>
                        <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-4">
                            <Briefcase className="w-3.5 h-3.5" />
                            {member.specialty}
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-border">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-green-700 text-[10px] font-black uppercase">
                                <CheckCircle2 className="w-3 h-3" /> Aktif
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-text-main/20 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[32px] md:rounded-[48px] shadow-2xl border border-border animate-scale-up">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-8 py-6 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <UserPlus className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-text-main">Yeni Personel Ekle</h3>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">
                                        {salonName ? `${salonName} şubesi için` : 'Ekip Üyesi Oluştur'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-3 hover:bg-gray-100 rounded-2xl transition-all group"
                            >
                                <X className="w-6 h-6 text-text-muted group-hover:text-text-main group-hover:rotate-90 transition-all" />
                            </button>
                        </div>

                        <form onSubmit={handleAddStaff} className="p-8 md:p-10 space-y-10">
                            <div className="flex flex-col md:flex-row gap-10">
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-2 border-dashed border-border hover:border-primary transition-all group relative bg-surface-alt">
                                        <ImageUpload
                                            bucket="staff-photos"
                                            currentImage={newStaffPhoto}
                                            onUpload={setNewStaffPhoto}
                                            label="Profil"
                                            className="h-full"
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-3 text-center">Fotoğraf Yükle</p>
                                </div>

                                <div className="flex-grow space-y-8">
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                            Ad Soyad
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={newStaffName}
                                            onChange={(e) => setNewStaffName(e.target.value)}
                                            className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl md:rounded-[24px] font-black text-text-main text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                            placeholder="Örn: Ayşe Yılmaz"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                            Uzmanlık Alanı
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={newStaffSpecialty}
                                            onChange={(e) => setNewStaffSpecialty(e.target.value)}
                                            className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl md:rounded-[24px] font-bold text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                            placeholder="Örn: Saç Tasarımı, Boya Uzmanı"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-6">
                                    <Clock className="w-4 h-4" /> Çalışma Saatleri (Varsayılan)
                                </label>
                                <div className="bg-surface-alt/50 rounded-3xl p-6 border border-border/50">
                                    <WorkingHoursEditor
                                        hours={newStaffWorkingHours}
                                        onChange={setNewStaffWorkingHours}
                                        days={days}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-border pt-8 flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-8 py-4 font-black text-text-muted hover:text-text-main transition-all"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
                                >
                                    {saving ? 'Kaydediliyor...' : 'Personeli Kaydet'}
                                    <Save className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Shift Modal */}
            {showShiftModal && selectedStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-text-main/20 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] md:rounded-[48px] shadow-2xl border border-border animate-scale-up">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-8 py-6 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-text-main">{selectedStaff.name}</h3>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Personel Çalışma Planı</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowShiftModal(false)}
                                className="p-3 hover:bg-gray-100 rounded-2xl transition-all group"
                            >
                                <X className="w-6 h-6 text-text-muted group-hover:text-text-main group-hover:rotate-90 transition-all" />
                            </button>
                        </div>

                        <div className="p-8 md:p-10">
                            <div className="bg-surface-alt/50 rounded-3xl p-6 border border-border/50">
                                <WorkingHoursEditor
                                    hours={workingHours}
                                    onChange={setWorkingHours}
                                    onUpdateOne={handleUpdateOneShift}
                                    days={days}
                                    readonly={false}
                                />
                            </div>

                            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-blue-900">Vardiya İpucu</p>
                                    <p className="text-xs text-blue-700 mt-1 font-medium leading-relaxed">
                                        Yaptığınız her değişiklik anında kaydedilir ve randevu takvimine yansır.
                                        İzin günlerini sağdaki anahtarı kullanarak belirleyebilirsiniz.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md px-8 py-6 border-t border-border flex items-center justify-end">
                            <button
                                onClick={() => setShowShiftModal(false)}
                                className="px-10 py-4 bg-text-main text-white rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
