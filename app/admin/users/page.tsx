'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { ProfileService } from '@/services/db/db_user';
import { Profile, UserRole } from '@/types';
import { 
    Search, 
    Filter, 
    MoreVertical, 
    Edit, 
    Trash2, 
    UserX, 
    ChevronRight, 
    X, 
    Mail, 
    Phone, 
    Shield, 
    UserCog,
    AlertCircle,
    LayoutDashboard,
    Save,
    RotateCcw,
    Users,
    Plus,
    CheckCircle2,
    XCircle,
    Key
} from 'lucide-react';
import { 
    adminCreateUserAction, 
    adminUpdateUserAuthAction, 
    adminDeleteUserAuthAction 
} from './actions';

const ROLE_LABELS: Record<string, { label: string, icon: any, color: string, bg: string }> = {
    'CUSTOMER': { label: 'MÜŞTERİ', icon: Users, color: 'text-gray-600', bg: 'bg-gray-100' },
    'STAFF': { label: 'PERSONEL', icon: UserCog, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    'SALON_OWNER': { label: 'SALON SAHİBİ', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100' },
    'SUPER_ADMIN': { label: 'ADMİN', icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
};

export default function AdminUserManagementPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<UserRole | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Drawer States
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Form States
    const [editForm, setEditForm] = useState<Partial<Profile & { password?: string }>>({});

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await ProfileService.adminGetProfiles({
                role: filter === 'all' ? undefined : filter
            });
            setUsers(data as Profile[]);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetails = (user: Profile) => {
        setSelectedUser(user);
        setEditForm({ ...user });
        setIsCreateMode(false);
        setIsDetailsOpen(true);
    };

    const handleOpenCreate = () => {
        setSelectedUser(null);
        setEditForm({ email: '', full_name: '', role: 'CUSTOMER', phone: '', is_active: true, password: '' });
        setIsCreateMode(true);
        setIsDetailsOpen(true);
    };

    const handleAction = async (task: () => Promise<any>, successMsg: string) => {
        try {
            setActionLoading(true);
            await task();
            alert(successMsg);
            setIsDetailsOpen(false);
            fetchUsers();
        } catch (error: any) {
            alert('Hata: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveUser = async () => {
        if (!editForm.email || !editForm.full_name) {
            alert('Lütfen e-posta ve isim alanlarını doldurun.');
            return;
        }

        if (isCreateMode) {
            handleAction(async () => {
                const res = await adminCreateUserAction(editForm as any);
                if (!res.success) throw new Error(res.error);
            }, 'Kullanıcı başarıyla oluşturuldu.');
        } else if (selectedUser) {
            handleAction(async () => {
                // 1. Update Auth Side (if email/phone changed)
                if (editForm.email !== selectedUser.email || editForm.phone !== selectedUser.phone || editForm.password) {
                    const authRes = await adminUpdateUserAuthAction(selectedUser.id, {
                        email: editForm.email,
                        phone: editForm.phone,
                        password: editForm.password
                    });
                    if (!authRes.success) throw new Error(authRes.error);
                }

                // 2. Update Profile Side
                await ProfileService.adminUpdateProfile(selectedUser.id, {
                    full_name: editForm.full_name,
                    role: editForm.role,
                    phone: editForm.phone,
                    is_active: editForm.is_active
                });
            }, 'Kullanıcı güncellendi.');
        }
    };

    const handleDeleteUser = async (hardDelete: boolean = false) => {
        if (!selectedUser) return;
        
        const confirmMsg = hardDelete 
            ? 'DİKKAT! Bu kullanıcıya ait TÜM VERİLER (Salonlar, Randevular vb.) KALICI OLARAK silinecektir. Emin misiniz?' 
            : 'Kullanıcıyı pasife alıp bilgilerini gizlemek istediğinize emin misiniz?';
            
        if (!confirm(confirmMsg)) return;

        handleAction(async () => {
            if (hardDelete) {
                // RPC calls cascade delete in DB
                await ProfileService.adminHardDelete(selectedUser.id);
                // Also delete from Auth
                const authRes = await adminDeleteUserAuthAction(selectedUser.id);
                if (!authRes.success) throw new Error(authRes.error);
            } else {
                // Soft delete (ProfileService existing logic modified to use adminToggleActive)
                await ProfileService.adminToggleActive(selectedUser.id, false);
            }
        }, hardDelete ? 'Kullanıcı tamamen silindi.' : 'Kullanıcı pasife alındı.');
    };

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery)
    );

    return (
        <AdminLayout>
            <div className="p-8 space-y-12 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-primary bg-primary/5 w-fit px-4 py-2 rounded-2xl">
                            <Users className="w-5 h-5" />
                            <span className="text-[11px] font-black tracking-[0.2em] uppercase">Sistem Yönetimi</span>
                        </div>
                        <h1 className="text-5xl font-black text-text-main tracking-tight">
                            Kullanıcı <span className="text-primary">Yönetimi</span>
                        </h1>
                        <p className="text-sm font-medium text-text-muted italic max-w-xl">
                            Platformdaki tüm müşterileri, personelleri ve salon sahiplerini buradan yönetin. Yetki verme, aktiflik durumu ve kaskad silme işlemlerini gerçekleştirebilirsiniz.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white border-2 border-gray-100 p-6 rounded-[32px] flex items-center gap-6 shadow-sm">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Toplam Kullanıcı</p>
                                <p className="text-2xl font-black text-text-main">{users.length}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleOpenCreate}
                            className="bg-primary text-white h-[84px] px-8 rounded-[32px] flex items-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                            <Plus className="w-6 h-6" />
                            <span className="text-xs font-black uppercase tracking-widest">Yeni Kullanıcı Ekle</span>
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white border-2 border-gray-50 p-8 rounded-[40px] shadow-sm space-y-8">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'all', label: 'TÜMÜ' },
                            { id: 'CUSTOMER', label: 'MÜŞTERİLER' },
                            { id: 'SALON_OWNER', label: 'İŞLETME SAHİPLERİ' },
                            { id: 'STAFF', label: 'PERSONELLER' },
                            { id: 'SUPER_ADMIN', label: 'YÖNETİCİLER' }
                        ].map(r => (
                            <button
                                key={r.id}
                                onClick={() => setFilter(r.id as any)}
                                className={`px-5 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all border-2 ${filter === r.id ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-gray-50 text-text-muted hover:border-primary/20'}`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="İsim, e-posta veya telefon ile ara..." 
                            className="w-full h-16 pl-16 pr-6 bg-gray-50 border-none rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white border-2 border-gray-100 rounded-[40px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Kullanıcı & Durum</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">İletişim</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Rol / Yetki</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Kayıt Tarihi</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 animate-pulse">
                                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Sistem taranıyor...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-32 text-center opacity-30">
                                            <div className="flex flex-col items-center gap-4">
                                                <UserX className="w-16 h-16" />
                                                <p className="text-sm font-black uppercase tracking-widest">Aranan kriterde kimse yok</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => handleOpenDetails(u)}>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-xl font-black ${ROLE_LABELS[u.role || 'CUSTOMER'].bg} ${ROLE_LABELS[u.role || 'CUSTOMER'].color} shadow-sm border border-black/5`}>
                                                        {u.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${u.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                                        {u.is_active ? <CheckCircle2 className="w-3 h-3 text-white" /> : <XCircle className="w-3 h-3 text-white" />}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-base font-black text-text-main group-hover:text-primary transition-colors uppercase whitespace-nowrap">
                                                        {u.full_name || 'İSİMSİZ KULLANICI'}
                                                        {!u.full_name && <span className="ml-2 text-[9px] text-red-500 lowercase normal-case italic font-medium">(İsim eksik)</span>}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase opacity-60">ID: {u.id.substring(0, 12)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2.5 text-xs font-bold text-text-main">
                                                    <Mail className="w-4 h-4 text-text-muted" /> {u.email}
                                                </div>
                                                {u.phone && (
                                                    <div className="flex items-center gap-2.5 text-[11px] font-medium text-text-secondary">
                                                        <Phone className="w-4 h-4 text-text-muted" /> {u.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 flex items-center gap-3 w-fit ${
                                                u.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-600 border-red-100' :
                                                u.role === 'SALON_OWNER' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                u.role === 'STAFF' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-gray-50 text-gray-600 border-gray-100'
                                            }`}>
                                                {React.createElement(ROLE_LABELS[u.role || 'CUSTOMER'].icon, { className: 'w-4 h-4' })}
                                                {ROLE_LABELS[u.role || 'CUSTOMER'].label}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black text-text-main">{u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '-'}</span>
                                                <span className="text-[11px] font-medium text-text-muted italic opacity-60">
                                                    {u.created_at ? new Date(u.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                <button className="h-10 px-4 bg-white border-2 border-gray-100 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all">
                                                    Detaylar
                                                </button>
                                                <ChevronRight className="w-6 h-6 text-gray-300" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* User Details / Create / Edit Drawer */}
                {isDetailsOpen && (
                    <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setIsDetailsOpen(false)}></div>
                        <div className="ml-auto w-full max-w-2xl bg-white h-full shadow-[-20px_0_50px_-12px_rgba(0,0,0,0.3)] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden rounded-l-[40px] border-l border-white/20">
                            
                            {/* Drawer Header */}
                            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-8">
                                    <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center text-3xl font-black ${ROLE_LABELS[editForm.role || 'CUSTOMER'].bg} ${ROLE_LABELS[editForm.role || 'CUSTOMER'].color} shadow-lg border-4 border-white`}>
                                        {editForm.full_name?.charAt(0) || (isCreateMode ? '+' : 'U')}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-black text-text-main uppercase tracking-tight leading-none">
                                            {isCreateMode ? 'YENİ KULLANICI' : (editForm.full_name || 'İSİMSİZ')}
                                        </h3>
                                        <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">
                                            {isCreateMode ? 'Sisteme manuel kayıt ekle' : `ID: ${selectedUser?.id}`}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailsOpen(false)} className="w-14 h-14 rounded-full hover:bg-white flex items-center justify-center transition-all border border-transparent shadow-none hover:shadow-xl hover:border-gray-100">
                                    <X className="w-8 h-8 text-text-muted" />
                                </button>
                            </div>

                            {/* Drawer Scrollable Content */}
                            <div className="flex-1 overflow-y-auto scroll-smooth border-t border-gray-50 p-10 space-y-12">
                                {/* Core Info Section */}
                                <div className="space-y-10">
                                    <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-4">
                                        <UserCog className="w-5 h-5" /> Temel Bilgiler
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Tam İsim</label>
                                            <div className="relative group">
                                                <input 
                                                    value={editForm.full_name || ''}
                                                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                                    placeholder="Ad Soyad"
                                                    className="w-full h-16 px-6 bg-white border-2 border-gray-100 rounded-2xl text-sm font-black focus:border-primary focus:shadow-lg focus:shadow-primary/5 transition-all outline-none"
                                                />
                                                <Shield className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200 group-focus-within:text-primary" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">E-Posta</label>
                                            <div className="relative group">
                                                <input 
                                                    value={editForm.email || ''}
                                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                    placeholder="email@adres.com"
                                                    className="w-full h-16 px-6 bg-white border-2 border-gray-100 rounded-2xl text-sm font-black focus:border-primary focus:shadow-lg focus:shadow-primary/5 transition-all outline-none"
                                                />
                                                <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200 group-focus-within:text-primary" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Telefon</label>
                                            <div className="relative group">
                                                <input 
                                                    value={editForm.phone || ''}
                                                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                                    placeholder="+90 5XX ..."
                                                    className="w-full h-16 px-6 bg-white border-2 border-gray-100 rounded-2xl text-sm font-black focus:border-primary focus:shadow-lg focus:shadow-primary/5 transition-all outline-none"
                                                />
                                                <Phone className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200 group-focus-within:text-primary" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Kullanıcı Rolü</label>
                                            <div className="relative">
                                                <select 
                                                    value={editForm.role}
                                                    onChange={e => setEditForm({ ...editForm, role: e.target.value as any })}
                                                    className="w-full h-16 px-6 bg-white border-2 border-gray-100 rounded-2xl text-sm font-black focus:border-primary transition-all outline-none appearance-none cursor-pointer pr-12"
                                                >
                                                    <option value="CUSTOMER">Müşteri</option>
                                                    <option value="STAFF">Personel</option>
                                                    <option value="SALON_OWNER">Salon Sahibi</option>
                                                    <option value="SUPER_ADMIN">Süper Admin</option>
                                                </select>
                                                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Security & Status Section */}
                                <div className="space-y-8 bg-gray-50/50 p-8 rounded-[32px] border-2 border-gray-100">
                                    <h4 className="text-[11px] font-black text-text-main uppercase tracking-[0.5em] flex items-center gap-4">
                                        <Shield className="w-5 h-5 text-emerald-600" /> Hesap Güvenliği & Durum
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                        <div className="flex items-center justify-between p-6 bg-white rounded-2xl border-2 border-transparent hover:border-emerald-100 transition-all cursor-pointer"
                                             onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}>
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-text-main">Hesap Durumu</p>
                                                <p className="text-[10px] font-bold text-text-muted lowercase italic">{editForm.is_active ? 'Hesap şu an aktif' : 'Hesap askıya alındı'}</p>
                                            </div>
                                            <div className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${editForm.is_active ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                                <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${editForm.is_active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Şifre {isCreateMode ? '' : '(Değiştirmek için yazın)'}</label>
                                            <div className="relative group">
                                                <input 
                                                    type="password"
                                                    value={editForm.password || ''}
                                                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="w-full h-16 px-6 bg-white border-2 border-gray-100 rounded-2xl text-sm font-black focus:border-primary transition-all outline-none"
                                                />
                                                <Key className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200 group-focus-within:text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                {!isCreateMode && (
                                    <div className="space-y-8 pt-6">
                                        <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.5em] flex items-center gap-4">
                                            <AlertCircle className="w-5 h-5" /> Tehlikeli İşlemler
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <button 
                                                onClick={() => handleDeleteUser(false)}
                                                className="p-8 bg-white border-2 border-gray-100 rounded-[32px] text-left hover:border-red-100 transition-all space-y-4 group"
                                            >
                                                <RotateCcw className="w-8 h-8 text-text-muted group-hover:text-red-500 transition-colors" />
                                                <div>
                                                    <p className="text-xs font-black text-text-main">Soft Delete</p>
                                                    <p className="text-[10px] font-medium text-text-muted leading-relaxed">Kullanıcıyı pasife al, verilerini sakla ama girişi engelle.</p>
                                                </div>
                                            </button>

                                            <button 
                                                onClick={() => handleDeleteUser(true)}
                                                className="p-8 bg-red-50/30 border-2 border-red-50 rounded-[32px] text-left hover:border-red-600 transition-all space-y-4 group"
                                            >
                                                <Trash2 className="w-8 h-8 text-red-600" />
                                                <div>
                                                    <p className="text-xs font-black text-red-600">Tamamen Sil (Cascade)</p>
                                                    <p className="text-[10px] font-medium text-red-800/60 leading-relaxed">Bağlı salonlar, randevular ve her şeyi kalıcı olarak yok et.</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="h-20"></div> {/* Bottom Spacer for scroll */}
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-10 bg-white border-t border-gray-100 flex gap-6">
                                <button 
                                    onClick={() => setIsDetailsOpen(false)}
                                    className="flex-1 h-16 bg-gray-50 text-text-muted rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                                >
                                    İptal
                                </button>
                                <button 
                                    onClick={handleSaveUser}
                                    disabled={actionLoading}
                                    className="flex-[2] h-16 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                                >
                                    {actionLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    {isCreateMode ? 'Sisteme Kaydet' : 'Değişiklikleri Uygula'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
