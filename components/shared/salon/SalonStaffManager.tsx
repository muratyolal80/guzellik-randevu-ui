'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StaffService, SalonDataService, ServiceService } from '@/services/db';
import { LimitEnforcer } from '@/lib/utils/limits';
import { Staff, WorkingHours, Invite } from '@/types';
import ImageUpload from '@/components/ImageUpload';
import WorkingHoursEditor from './WorkingHoursEditor';
import {
    Users,
    UserPlus,
    Edit2,
    Trash2,
    Clock,
    CheckCircle2,
    Save,
    X,
    Briefcase,
    Mail,
    Plus,
    Star,
    MoreVertical,
    ChevronRight,
    Search,
    Phone,
    ShieldCheck,
    ShieldAlert,
    Copy,
    ExternalLink,
    MessageCircle
} from 'lucide-react';

const DEFAULT_HOURS = [
    { day_of_week: 1, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 2, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 3, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 4, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 5, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 6, start_time: '09:00', end_time: '19:00', is_day_off: false },
    { day_of_week: 0, start_time: '09:00', end_time: '19:00', is_day_off: true },
];

interface SalonStaffManagerProps {
    salonId: string;
}

export default function SalonStaffManager({ salonId }: SalonStaffManagerProps) {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit'>('add');
    const [addMode, setAddMode] = useState<'direct' | 'invite'>('direct');
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
    const { user } = useAuth();
    const [invites, setInvites] = useState<Invite[]>([]);
    const [showInviteSuccess, setShowInviteSuccess] = useState(false);
    const [lastInviteLink, setLastInviteLink] = useState('');
    
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
    const [salonServices, setSalonServices] = useState<any[]>([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

    // Form States
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formSpecialty, setFormSpecialty] = useState('');
    const [formPhoto, setFormPhoto] = useState<string>('');
    const [formPhone, setFormPhone] = useState('');
    const [formTcNo, setFormTcNo] = useState('');
    const [formKvkkConsent, setFormKvkkConsent] = useState(false);
    const [formWorkingHours, setFormWorkingHours] = useState(DEFAULT_HOURS);
    
    const [saving, setSaving] = useState(false);
    const [salonName, setSalonName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStaff();
        fetchSalon();
        fetchServices();
        fetchInvites();
    }, [salonId]);

    const fetchInvites = async () => {
        try {
            const pendingInvites = await StaffService.getPendingInvites(salonId);
            setInvites(pendingInvites);
        } catch (err) {
            console.error('Davetler çekilemedi:', err);
        }
    };

    const fetchServices = async () => {
        try {
            const services = await ServiceService.getServicesBySalon(salonId);
            setSalonServices(services);
        } catch (err) {
            console.error('Hizmetler çekilemedi:', err);
        }
    };

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

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [allOwnerStaff, setAllOwnerStaff] = useState<Staff[]>([]);
    const [assigningLoading, setAssigningLoading] = useState(false);

    const handleOpenAssignExisting = async () => {
        try {
            setAssigningLoading(true);
            const ownerSalons = await SalonDataService.getSalonsByOwner((await SalonDataService.getSalonById(salonId))?.owner_id || '');
            const staffList = await StaffService.getStaffByOwner((await SalonDataService.getSalonById(salonId))?.owner_id || '');
            
            // Current salon's staff IDs
            const currentStaffIds = staff.map(s => s.id);
            
            // Filter staff not in current salon
            const otherStaff = staffList.filter(s => !currentStaffIds.includes(s.id));
            
            setAllOwnerStaff(otherStaff);
            setShowAssignModal(true);
        } catch (err) {
            console.error('Personeller çekilemedi:', err);
        } finally {
            setAssigningLoading(false);
        }
    };

    const handleAssignStaff = async (staffMember: Staff) => {
        try {
            setSaving(true);
            await LimitEnforcer.ensureLimit(salonId, 'staff');
            await StaffService.assignStaffToBranch(staffMember.id, salonId);
            setShowAssignModal(false);
            fetchStaff();
        } catch (err: any) {
             if (err.message?.startsWith('SUBSCRIPTION_LIMIT_REACHED')) {
                alert('Personel limitine ulaştınız. Atama yapabilmek için paketinizi yükseltmelisiniz.');
            } else {
                console.error('Atama hatası:', err);
                alert('Atama sırasında bir hata oluştu.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleOpenAdd = async () => {
        try {
            setLoading(true);
            await LimitEnforcer.ensureLimit(salonId, 'staff');
            setModalType('add');
            setFormName('');
            setFormEmail('');
            setFormSpecialty('');
            setFormPhoto('');
            setFormPhone('');
            setFormTcNo('');
            setFormKvkkConsent(false);
            setSelectedServiceIds([]);
            setFormWorkingHours(DEFAULT_HOURS);
            setAddMode('direct');
            setShowModal(true);
        } catch (err: any) {
            if (err.message?.startsWith('SUBSCRIPTION_LIMIT_REACHED')) {
                alert('Personel limitine ulaştınız. Paket yükseltmelisiniz.');
            } else {
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = async (member: Staff) => {
        setModalType('edit');
        setEditingStaffId(member.id);
        setFormName(member.name);
        setFormEmail(member.email || '');
        setFormSpecialty(member.role || member.specialty || '');
        setFormPhoto(member.photo || member.image || '');
        setFormPhone(member.phone || '');
        setFormTcNo(member.tc_no || '');
        setFormKvkkConsent(member.kvkk_consent || false);
        
        // Fetch linked services
        try {
            const linkedServices = await StaffService.getStaffServices(member.id);
            setSelectedServiceIds(linkedServices);
        } catch (err) {
            console.error('Servisler çekilemedi:', err);
        }
        
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (modalType === 'add') {
                if (addMode === 'invite') {
                    if (!formEmail) {
                        alert('Davet göndermek için e-posta adresi zorunludur.');
                        setSaving(false);
                        return;
                    }
                    const invite = await StaffService.createStaffInvite(
                        salonId,
                        formEmail,
                        'STAFF',
                        user?.id || ''
                    );
                    const link = `${window.location.origin}/invite/accept?token=${invite.token}`;
                    setLastInviteLink(link);
                    setShowModal(false);
                    setShowInviteSuccess(true);
                    fetchInvites();
                } else {
                    const newMember = await StaffService.createStaff({
                        salon_id: salonId,
                        name: formName,
                        email: formEmail,
                        role: formSpecialty,
                        photo: formPhoto,
                        phone: formPhone,
                        tc_no: formTcNo,
                        kvkk_consent: formKvkkConsent,
                        is_active: true
                    }, formWorkingHours);

                    if (newMember && selectedServiceIds.length > 0) {
                        await StaffService.linkStaffToServices(newMember.id, salonId, selectedServiceIds);
                    }
                }
            } else if (editingStaffId) {
                await StaffService.updateStaff(editingStaffId, {
                    name: formName,
                    email: formEmail,
                    role: formSpecialty,
                    photo: formPhoto,
                    phone: formPhone,
                    tc_no: formTcNo,
                    kvkk_consent: formKvkkConsent
                });
                
                await StaffService.updateStaffServices(editingStaffId, salonId, selectedServiceIds);
            }

            setShowModal(false);
            fetchStaff();
        } catch (err) {
            console.error('İşlem hatası:', err);
            alert('Bir hata oluştu.');
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

    const handleUpdateOneShift = async (hourId: string, updates: Partial<WorkingHours>) => {
        try {
            await StaffService.updateWorkingHours(hourId, updates);
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

    const filteredStaff = staff.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.role || s.specialty || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    if (loading && staff.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-pulse">
                <Users className="w-12 h-12 text-gray-200 mb-4" />
                <div className="h-4 w-32 bg-gray-100 rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white/50 backdrop-blur-xl p-8 rounded-[40px] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-6 group">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-black text-text-main tracking-tight">Personel Yönetimi</h3>
                    </div>
                    <p className="text-sm text-text-muted font-bold ml-1">{filteredStaff.length} aktif ekip üyesi {invites.length > 0 && `• ${invites.length} bekleyen davet`}</p>
                </div>

                <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input 
                            type="text" 
                            placeholder="İsim veya uzmanlık ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-2xl text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleOpenAssignExisting}
                        disabled={assigningLoading}
                        className="flex items-center gap-2.5 px-6 py-4 bg-white border border-border text-text-main rounded-2xl font-black shadow-sm hover:bg-gray-50 transition-all whitespace-nowrap disabled:opacity-50"
                    >
                        <Users className="w-5 h-5 text-primary" /> 
                        {assigningLoading ? 'Yükleniyor...' : 'Mevcut Personeli Ata'}
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2.5 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_15px_25px_rgba(var(--primary-rgb),0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap"
                    >
                        <UserPlus className="w-5 h-5" /> Personel Ekle
                    </button>
                </div>
            </div>

            {/* Pending Invites Alert */}
            {invites.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100/50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-amber-900">Bekleyen Davetler ({invites.length})</h4>
                            <p className="text-sm font-bold text-amber-700/80">Kullanıcıların e-posta adreslerine gönderilen davetler henüz kabul edilmedi.</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {invites.map(inv => (
                            <div key={inv.id} className="text-xs font-bold text-amber-800 bg-white/60 px-4 py-2 rounded-xl flex items-center justify-between gap-4 border border-amber-200/50">
                                <span>{inv.email}</span>
                                <button 
                                    onClick={async () => {
                                        if(window.confirm('Bu daveti iptal etmek istediğinize emin misiniz?')) {
                                            await StaffService.cancelInvite(inv.id);
                                            fetchInvites();
                                        }
                                    }}
                                    className="text-red-500 hover:text-red-700 uppercase tracking-widest font-black text-[10px]"
                                >
                                    İptal Et
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* List Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStaff.map((member) => (
                    <div key={member.id} className="group relative bg-white rounded-[32px] border border-border shadow-card hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden flex flex-col">
                        <div className="p-6 flex-grow">
                            <div className="flex items-start justify-between mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-[24px] bg-surface-alt bg-cover bg-center border-2 border-white shadow-xl group-hover:scale-105 transition-transform duration-500 ring-4 ring-gray-50"
                                        style={{ backgroundImage: `url(${member.photo || member.image || 'https://i.pravatar.cc/150'})` }}
                                    />
                                    {member.is_active && (
                                        <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleOpenEdit(member)}
                                        className="p-2.5 bg-gray-50 hover:bg-primary/10 rounded-xl text-text-muted hover:text-primary transition-all shadow-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleOpenShifts(member)}
                                        className="p-2.5 bg-gray-50 hover:bg-amber-50 rounded-xl text-text-muted hover:text-amber-600 transition-all shadow-sm"
                                    >
                                        <Clock className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStaff(member.id)}
                                        className="p-2.5 bg-gray-50 hover:bg-red-50 rounded-xl text-text-muted hover:text-red-500 transition-all shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-text-main tracking-tight group-hover:text-primary transition-colors">{member.name}</h3>
                                <div className="flex items-center gap-1.5 text-text-muted text-xs font-black uppercase tracking-widest bg-gray-50 w-fit px-2 py-1 rounded-lg">
                                    <Briefcase className="w-3.5 h-3.5 opacity-60" />
                                    {member.role || member.specialty || 'Uzman'}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-black text-text-main">{member.rating || '5.0'}</span>
                                    <span className="text-[10px] text-text-muted font-bold">({member.review_count || 0})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {member.is_email_verified && <ShieldCheck className="w-4 h-4 text-green-500" />}
                                    <Mail className={`w-4 h-4 transition-colors ${member.email ? 'text-primary' : 'text-gray-200'}`} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 p-4 border-t border-border mt-auto flex items-center justify-between group-hover:bg-primary/[0.02] transition-colors">
                             <span className="text-[10px] font-black uppercase tracking-tighter text-text-muted">Son Randevu: Bugün</span>
                             <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                ))}

                {filteredStaff.length === 0 && (
                    <div className="col-span-full py-24 bg-white/50 backdrop-blur-md rounded-[48px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center mb-6 shadow-inner">
                            <Users className="w-10 h-10 text-text-muted/20" />
                        </div>
                        <h4 className="text-2xl font-black text-text-main mb-3">Hiç personel bulunamadı</h4>
                        <p className="text-sm text-text-muted font-bold max-w-sm px-6">
                            Ekip üyelerinizi ekleyerek randevu almaya başlayabilirsiniz veya arama kriterlerini değiştirebilirsiniz.
                        </p>
                        <button
                            onClick={handleOpenAdd}
                            className="mt-8 flex items-center gap-2.5 px-10 py-4 bg-primary text-white rounded-[24px] font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                        >
                            <Plus className="w-5 h-5" /> Hemen Ekle
                        </button>
                    </div>
                )}
            </div>

            {/* Form Modal (Add/Edit) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-text-main/30 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] md:rounded-[56px] shadow-2xl border border-white/20 animate-in zoom-in duration-300">
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-10 py-8 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${modalType === 'add' ? 'bg-primary text-white' : 'bg-amber-500 text-white'}`}>
                                    {modalType === 'add' ? <UserPlus className="w-7 h-7" /> : <Edit2 className="w-7 h-7" />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-text-main tracking-tight">
                                        {modalType === 'add' ? 'Yeni Personel' : 'Personeli Düzenle'}
                                    </h3>
                                    <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mt-1 opacity-60">
                                        {salonName || 'Güzellik Merkezi'} Ekibi
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-4 hover:bg-gray-100 rounded-3xl transition-all group"
                            >
                                <X className="w-7 h-7 text-text-muted group-hover:text-text-main group-hover:rotate-90 transition-all duration-300" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-12">
                            {modalType === 'add' && (
                                <div className="flex p-1 bg-surface-alt rounded-2xl border border-border w-full max-w-sm mb-8 mx-auto shadow-inner">
                                    <button
                                        type="button"
                                        onClick={() => setAddMode('direct')}
                                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${addMode === 'direct' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                                    >
                                        Hızlı Ekle (Sistemsiz)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAddMode('invite')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${addMode === 'invite' ? 'bg-white shadow-md text-primary' : 'text-text-muted hover:text-text-main'}`}
                                    >
                                        <Mail className="w-4 h-4" /> E-Posta İle Davet
                                    </button>
                                </div>
                            )}

                            {addMode === 'invite' && modalType === 'add' ? (
                                <div className="space-y-8 max-w-xl mx-auto text-center py-8">
                                    <div className="w-24 h-24 bg-primary/10 text-primary rounded-[32px] mx-auto flex items-center justify-center mb-6">
                                        <Mail className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-2xl font-black text-text-main">Personel Daveti Gönder</h4>
                                    <p className="text-sm font-bold text-text-muted">Personelinizin e-posta adresini girin. Sisteme kayıt olması ve salonunuza dijital olarak bağlanması için bir davet linki göndereceğiz.</p>
                                    
                                    <div className="text-left space-y-3 pt-6">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            Personel E-Posta Adresi
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                            <input
                                                required
                                                type="email"
                                                value={formEmail}
                                                onChange={(e) => setFormEmail(e.target.value)}
                                                className="w-full pl-16 pr-8 py-5 bg-surface-alt border-2 border-border/50 rounded-3xl font-bold text-text-main outline-none focus:border-primary focus:bg-white focus:ring-8 focus:ring-primary/5 transition-all"
                                                placeholder="personel@firsat.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col lg:flex-row gap-12">
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <div className="w-40 h-40 md:w-52 md:h-52 rounded-[40px] overflow-hidden border-4 border-dashed border-gray-100 hover:border-primary transition-all group relative bg-surface-alt shadow-inner">
                                        <ImageUpload
                                            bucket="staff-photos"
                                            currentImage={formPhoto}
                                            onUpload={setFormPhoto}
                                            label="Profil Resmi"
                                            className="h-full"
                                        />
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-border">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Profesyonel Görsel Seçin</span>
                                    </div>
                                </div>

                                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            Tam Ad Soyad
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            className="w-full px-8 py-5 bg-surface-alt border-2 border-border/50 rounded-3xl font-black text-text-main text-lg outline-none focus:border-primary focus:bg-white focus:ring-8 focus:ring-primary/5 transition-all"
                                            placeholder="Örn: Ayşe Yılmaz"
                                        />
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            Uzmanlık Alanı
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formSpecialty}
                                            onChange={(e) => setFormSpecialty(e.target.value)}
                                            className="w-full px-8 py-5 bg-surface-alt border-2 border-border/50 rounded-3xl font-bold text-text-main text-lg outline-none focus:border-primary focus:bg-white focus:ring-8 focus:ring-primary/5 transition-all"
                                            placeholder="Örn: Saç Tasarımı"
                                        />
                                    </div>

                                    <div className="group space-y-3 md:col-span-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            E-Posta (Eşleştirme İçin)
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                            <input
                                                required
                                                type="email"
                                                value={formEmail}
                                                onChange={(e) => setFormEmail(e.target.value)}
                                                className="w-full pl-16 pr-8 py-5 bg-surface-alt border-2 border-border/50 rounded-3xl font-bold text-text-main outline-none focus:border-primary focus:bg-white focus:ring-8 focus:ring-primary/5 transition-all"
                                                placeholder="personel@firsat.com"
                                            />
                                        </div>
                                        <p className="text-[10px] text-text-muted font-bold ml-2">Personel bu e-posta ile giriş yaptığında takvimine erişebilir.</p>
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            TC Kimlik No
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={11}
                                            value={formTcNo}
                                            onChange={(e) => setFormTcNo(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-8 py-5 bg-surface-alt border-2 border-border/50 rounded-3xl font-bold text-text-main outline-none focus:border-primary focus:bg-white focus:ring-8 focus:ring-primary/5 transition-all"
                                            placeholder="11 Haneli TC No"
                                        />
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            Telefon Numarası
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                            <input
                                                type="tel"
                                                value={formPhone}
                                                onChange={(e) => setFormPhone(e.target.value)}
                                                className="w-full pl-16 pr-8 py-5 bg-surface-alt border-2 border-border/50 rounded-3xl font-bold text-text-main outline-none focus:border-primary focus:bg-white focus:ring-8 focus:ring-primary/5 transition-all"
                                                placeholder="05XX XXX XX XX"
                                            />
                                        </div>
                                    </div>

                                    <div className="group space-y-3 md:col-span-2 bg-amber-50/50 p-6 rounded-[32px] border border-amber-100">
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={formKvkkConsent}
                                                onChange={(e) => setFormKvkkConsent(e.target.checked)}
                                                className="w-6 h-6 rounded-lg border-2 border-amber-300 text-amber-600 focus:ring-amber-500"
                                            />
                                            <div className="flex-1">
                                                <span className="text-xs font-black text-amber-900 uppercase tracking-tight block">KVKK Görünürlük Onayı</span>
                                                <span className="text-[10px] text-amber-700 font-bold leading-tight">
                                                    Personelin iletişim bilgileri henüz doğrulanmamış olsa bile, salon detay sayfasında listelenmesine izin veriyorum.
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Service Selection */}
                            <div className="pt-12 border-t border-border">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 text-primary">
                                            <Briefcase className="w-4 h-4" /> Sunduğu Hizmetler
                                        </label>
                                        <p className="text-xs text-text-muted font-bold ml-1 mt-1">Bu personelin verebildiği hizmetleri seçin.</p>
                                    </div>
                                    <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/20 text-[10px] font-black text-primary uppercase">
                                        {selectedServiceIds.length} Seçili
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {salonServices.map((service) => {
                                        const isSelected = selectedServiceIds.includes(service.id);
                                        return (
                                            <button
                                                key={service.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedServiceIds(prev =>
                                                        isSelected ? prev.filter(id => id !== service.id) : [...prev, service.id]
                                                    );
                                                }}
                                                className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all text-left relative ${isSelected
                                                    ? 'bg-primary/10 border-primary text-primary shadow-md ring-4 ring-primary/5'
                                                    : 'bg-surface-alt border-border text-text-muted hover:border-primary/40 hover:bg-white'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${isSelected
                                                    ? 'bg-primary border-primary text-white scale-110'
                                                    : 'border-border bg-white group-hover:border-primary/50'
                                                    }`}>
                                                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                                </div>
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <span className="text-xs font-black truncate leading-tight">
                                                        {service.service_name || service.global_service?.name}
                                                    </span>
                                                    <span className="text-[10px] font-bold opacity-60">
                                                        {service.price} TL • {service.duration_min} dk
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {salonServices.length === 0 && (
                                        <div className="col-span-full p-12 rounded-[32px] bg-surface-alt border border-dashed border-border text-center">
                                            <p className="text-sm font-black text-text-muted opacity-40">Önce hizmet tanımlamalısınız kanka.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Working Hours Section (Only for Add) */}
                            {modalType === 'add' && (
                                <div className="pt-12 border-t border-border animate-in slide-in-from-bottom duration-500">
                                    <div className="mb-8">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            <Clock className="w-4 h-4 text-amber-500" /> İlk Çalışma Takvimi
                                        </label>
                                        <p className="text-xs text-text-muted font-bold ml-1 mt-1">Personelin haftalık mesai saatlerini belirleyin.</p>
                                    </div>
                                    <div className="bg-surface-alt rounded-[40px] p-8 border border-border shadow-inner">
                                        <WorkingHoursEditor
                                            hours={formWorkingHours as any}
                                            onChange={setFormWorkingHours as any}
                                            days={days}
                                        />
                                    </div>
                                </div>
                            )}
                            </>
                            )}

                            <div className="sticky bottom-0 bg-white/80 backdrop-blur-md -mx-10 -mb-10 p-10 mt-12 border-t border-border flex items-center justify-end gap-6 shadow-[0_-20px_50px_rgba(0,0,0,0.03)] selection-none">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-5 font-black text-text-muted hover:text-text-main transition-all text-lg"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-12 py-5 text-white rounded-[28px] font-black shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-4 disabled:opacity-50 ${modalType === 'add' ? 'bg-primary shadow-primary/20' : 'bg-amber-500 shadow-amber-500/20'}`}
                                >
                                    {saving ? (addMode === 'invite' ? 'Gönderiliyor...' : 'Kaydediliyor...') : (modalType === 'add' ? (addMode === 'invite' ? 'Davet Gönder' : 'Personeli Kaydet') : 'Değişiklikleri Kaydet')}
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : (addMode === 'invite' ? <Mail className="w-6 h-6" /> : <Save className="w-6 h-6" />)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Shift Modal (Existing) */}
            {showShiftModal && selectedStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-text-main/20 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[48px] shadow-2xl border border-border animate-in slide-in-from-bottom duration-500">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-10 py-8 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-text-main tracking-tight">{selectedStaff.name}</h3>
                                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mt-1">Haftalık Mesai Planı</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowShiftModal(false)}
                                className="p-4 hover:bg-gray-100 rounded-3xl transition-all group"
                            >
                                <X className="w-7 h-7 text-text-muted group-hover:text-text-main group-hover:rotate-90 transition-all duration-300" />
                            </button>
                        </div>

                        <div className="p-10 space-y-10">
                            <div className="bg-surface-alt/50 rounded-[40px] p-8 border border-border/50 shadow-inner">
                                <WorkingHoursEditor
                                    hours={workingHours}
                                    onChange={setWorkingHours}
                                    onUpdateOne={handleUpdateOneShift}
                                    days={days}
                                    readonly={false}
                                />
                            </div>

                            <div className="p-8 bg-blue-50/50 rounded-[32px] border border-blue-100/50 flex items-start gap-5 relative overflow-hidden">
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-100/20 rounded-full blur-2xl" />
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 shadow-sm">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-lg font-black text-blue-900 leading-none">Vardiya Bilgilendirmesi</p>
                                    <p className="text-xs text-blue-700/80 mt-2 font-bold leading-relaxed">
                                        Burada yaptığınız her değişiklik anında takvime yansır. İzin günleri için yanındaki anahtarı kapatmanız yeterlidir.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 py-8 border-t border-border flex items-center justify-end">
                            <button
                                onClick={() => setShowShiftModal(false)}
                                className="px-12 py-5 bg-text-main text-white rounded-[28px] font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Değişiklikleri Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Assign Existing Staff Modal */}
            {/* Invite Success Modal (WhatsApp / Copy / Email Share) */}
            {showInviteSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-text-main/30 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-white/20 animate-in zoom-in duration-300 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-10 text-center border-b border-border">
                            <div className="w-20 h-20 bg-green-500 text-white rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-text-main tracking-tight">Davet Oluşturuldu!</h3>
                            <p className="text-sm font-bold text-text-muted mt-2">
                                Personele aşağıdaki bağlantıyı paylaşarak sisteme katılmasını sağlayabilirsiniz.
                            </p>
                        </div>

                        {/* Link Display */}
                        <div className="px-10 py-8 space-y-6">
                            <div className="bg-surface-alt rounded-2xl p-4 border border-border flex items-center gap-3">
                                <ExternalLink className="w-5 h-5 text-text-muted shrink-0" />
                                <p className="text-xs font-bold text-text-main truncate flex-1 select-all">{lastInviteLink}</p>
                            </div>

                            {/* Share Actions */}
                            <div className="space-y-3">
                                {/* WhatsApp */}
                                <button
                                    onClick={() => {
                                        const wpMessage = encodeURIComponent(
                                            `Merhaba! 🎉\n\n${salonName || 'Salonumuz'} salonuna personel olarak davet edildiniz. Sisteme katılmak için aşağıdaki bağlantıya tıklayın:\n\n${lastInviteLink}`
                                        );
                                        window.open(`https://wa.me/?text=${wpMessage}`, '_blank');
                                    }}
                                    className="w-full flex items-center justify-center gap-3 py-5 bg-[#25D366] text-white rounded-[24px] font-black text-lg shadow-xl shadow-[#25D366]/20 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                    WhatsApp ile Paylaş
                                </button>

                                {/* Copy Link */}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(lastInviteLink);
                                        alert('Bağlantı panoya kopyalandı!');
                                    }}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-surface-alt text-text-main border border-border rounded-[24px] font-black hover:bg-gray-50 transition-all"
                                >
                                    <Copy className="w-5 h-5" />
                                    Bağlantıyı Kopyala
                                </button>

                                {/* Email */}
                                <button
                                    onClick={() => {
                                        const subject = encodeURIComponent(`${salonName || 'Salon'} - Personel Daveti`);
                                        const body = encodeURIComponent(
                                            `Merhaba,\n\n${salonName || 'Salonumuz'} salonuna personel olarak davet edildiniz.\n\nKatılmak için aşağıdaki bağlantıya tıklayın:\n${lastInviteLink}\n\nİyi çalışmalar!`
                                        );
                                        window.open(`mailto:${formEmail}?subject=${subject}&body=${body}`, '_blank');
                                    }}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-surface-alt text-text-main border border-border rounded-[24px] font-black hover:bg-gray-50 transition-all"
                                >
                                    <Mail className="w-5 h-5" />
                                    E-Posta ile Gönder
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-10 py-6 border-t border-border flex justify-end">
                            <button
                                onClick={() => setShowInviteSuccess(false)}
                                className="px-8 py-3 font-black text-text-muted hover:text-text-main transition-colors"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-text-main/30 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[40px] shadow-2xl border border-white/20 animate-in zoom-in duration-300">
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-10 py-8 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                                    <Users className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-text-main tracking-tight">Mevcut Personeli Ata</h3>
                                    <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mt-1 opacity-60">
                                        Diğer şubelerinizdeki personeller
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="p-4 hover:bg-gray-100 rounded-3xl transition-all group"
                            >
                                <X className="w-7 h-7 text-text-muted group-hover:text-text-main transition-all" />
                            </button>
                        </div>

                        <div className="p-10 space-y-4">
                            {allOwnerStaff.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {allOwnerStaff.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-6 bg-surface-alt rounded-[32px] border border-border group hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-[20px] bg-cover bg-center border-2 border-white shadow-md"
                                                    style={{ backgroundImage: `url(${member.photo || member.image || 'https://i.pravatar.cc/150'})` }}
                                                />
                                                <div>
                                                    <h4 className="text-lg font-black text-text-main">{member.name}</h4>
                                                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{member.role || 'Uzman'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAssignStaff(member)}
                                                disabled={saving}
                                                className="px-6 py-3 bg-white text-primary border border-primary/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                                            >
                                                {saving ? 'Atanıyor...' : 'Şubeye Ata'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Users className="w-10 h-10 text-text-muted/20" />
                                    </div>
                                    <h4 className="text-xl font-black text-text-main">Atanacak Personel Kalmadı</h4>
                                    <p className="text-sm text-text-muted font-bold mt-2">Tüm personelleriniz zaten bu şubede görevli kanka.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Loader2 = ({ className }: { className?: string }) => (
    <svg 
        className={className} 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);
