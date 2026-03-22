'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { ProfileService, NotificationService } from '@/services/db';
import { Profile } from '@/types';
import {
    Search,
    User,
    Mail,
    Phone,
    ShieldCheck,
    Calendar,
    MoreVertical,
    Trash2,
    X,
    Filter,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    UserCog,
    UserCheck,
    UserX,
    LayoutDashboard,
    Save,
    RotateCcw,
    Users
} from 'lucide-react';

export default function AdminUserManagementPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'CUSTOMER' | 'STAFF' | 'SALON_OWNER' | 'SUPER_ADMIN'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Details Drawer State
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Edit Form State
    const [editForm, setEditForm] = useState<Partial<Profile>>({});

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await ProfileService.adminGetProfiles({
                role: filter,
            });
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Kullanıcılar yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetails = (user: Profile) => {
        setSelectedUser(user);
        setEditForm({
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role
        });
        setIsDetailsOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            await ProfileService.adminUpdateProfile(selectedUser.id, editForm);
            alert('Kullanıcı bilgileri başarıyla güncellendi.');
            setIsDetailsOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Güncelleme sırasında bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Bu kullanıcıyı "Silindi" olarak işaretlemek ve erişimini kısıtlamak istediğinize emin misiniz?')) return;
        
        setActionLoading(true);
        try {
            await ProfileService.adminDeleteProfile(userId);
            alert('Kullanıcı başarıyla silindi.');
            setIsDetailsOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Silme işlemi sırasında bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                u.full_name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.phone?.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const ROLE_LABELS: Record<string, { label: string, color: string, bg: string, icon: any }> = {
        'CUSTOMER': { label: 'Müşteri', color: 'text-gray-600', bg: 'bg-gray-100', icon: User },
        'STAFF': { label: 'Personel', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: UserCheck },
        'SALON_OWNER': { label: 'Salon Sahibi', color: 'text-blue-700', bg: 'bg-blue-50', icon: ShieldCheck },
        'SUPER_ADMIN': { label: 'Süper Admin', color: 'text-red-700', bg: 'bg-red-50', icon: UserCog }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-text-main tracking-tight italic">Kullanıcı Yönetimi</h2>
                        <p className="text-text-secondary font-medium mt-1">Platformdaki tüm kullanıcıları, rolleri ve üyeliklerini yönetin.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white border-2 border-primary/10 rounded-[28px] shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Toplam Kullanıcı</p>
                                <p className="text-xl font-black text-text-main">{users.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search Bar */}
                <div className="bg-white p-6 rounded-[32px] border-2 border-gray-100 shadow-sm space-y-6">
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
                                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest transition-all border-2 ${filter === r.id ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-gray-50 text-text-muted hover:border-primary/20 hover:text-primary'}`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="İsim, e-posta veya telefon ile ara..." 
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white border-2 border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100 italic">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Kullanıcı Bilgileri</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">İletişim</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Rol / Yetki</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Kayıt Tarihi</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Aksiyon</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Veriler Yükleniyor...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-32 text-center opacity-30 italic">
                                            <div className="flex flex-col items-center gap-4">
                                                <UserX className="w-12 h-12" />
                                                <p className="text-sm font-black uppercase tracking-widest">Kayıt Bulunamadı</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => handleOpenDetails(u)}>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${ROLE_LABELS[u.role || 'CUSTOMER'].bg} ${ROLE_LABELS[u.role || 'CUSTOMER'].color} shadow-sm border border-black/5`}>
                                                    {u.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-text-main group-hover:text-primary transition-colors uppercase">{u.full_name || 'İSİMSİZ KULLANICI'}</span>
                                                    <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase opacity-60">ID: {u.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-text-main">
                                                    <Mail className="w-3.5 h-3.5 text-text-muted" /> {u.email}
                                                </div>
                                                {u.phone && (
                                                    <div className="flex items-center gap-2 text-[11px] font-medium text-text-secondary">
                                                        <Phone className="w-3.5 h-3.5 text-text-muted" /> {u.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 flex items-center gap-2 w-fit ${
                                                u.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-600 border-red-100' :
                                                u.role === 'SALON_OWNER' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                u.role === 'STAFF' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-gray-50 text-gray-600 border-gray-100'
                                            }`}>
                                                {React.createElement(ROLE_LABELS[u.role || 'CUSTOMER'].icon, { className: 'w-3 h-3' })}
                                                {ROLE_LABELS[u.role || 'CUSTOMER'].label}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-text-main">{u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '-'}</span>
                                                <span className="text-[10px] font-medium text-text-muted italic">{u.created_at ? new Date(u.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleOpenDetails(u); }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* User Details / Edit Drawer */}
                {isDetailsOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/5" onClick={() => setIsDetailsOpen(false)}></div>
                        <div className="ml-auto w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
                            
                            {/* Drawer Header */}
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${ROLE_LABELS[selectedUser.role || 'CUSTOMER'].bg} ${ROLE_LABELS[selectedUser.role || 'CUSTOMER'].color} shadow-sm border border-black/5`}>
                                        {selectedUser.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-text-main uppercase tracking-tight">{selectedUser.full_name || 'İSİMSİZ'}</h3>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">{selectedUser.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailsOpen(false)} className="w-12 h-12 rounded-full hover:bg-white flex items-center justify-center transition-all border border-transparent hover:border-border">
                                    <X className="w-6 h-6 text-text-muted" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-10 pb-40">
                                {/* Edit Form */}
                                <div className="space-y-8">
                                    <h4 className="text-[11px] font-black text-text-muted uppercase tracking-[0.4em] flex items-center gap-3">
                                        <UserCog className="w-4 h-4 text-blue-500" /> Profili Düzenle
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Tam İsim</label>
                                            <input 
                                                value={editForm.full_name || ''}
                                                onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                                className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">E-Posta Adresi</label>
                                            <input 
                                                value={editForm.email || ''}
                                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Telefon</label>
                                            <input 
                                                value={editForm.phone || ''}
                                                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Kullanıcı Rolü</label>
                                            <select 
                                                value={editForm.role}
                                                onChange={e => setEditForm({ ...editForm, role: e.target.value as any })}
                                                className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="CUSTOMER">Müşteri</option>
                                                <option value="STAFF">Personel</option>
                                                <option value="SALON_OWNER">Salon Sahibi</option>
                                                <option value="SUPER_ADMIN">Süper Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="pt-10 border-t border-gray-100">
                                    <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.4em] flex items-center gap-3 mb-6">
                                        <AlertCircle className="w-4 h-4" /> Tehlikeli İşlemler
                                    </h4>
                                    <div className="bg-red-50/50 border-2 border-red-100 rounded-[32px] p-8 space-y-4">
                                        <p className="text-[11px] font-medium text-red-800 leading-relaxed italic">
                                            Kullanıcıyı sistemden tamamen silmek yerine "Silindi" (Soft Delete) işaretlemek daha güvenlidir. Bu işlemde e-posta ve isim anonimleştirilirken veritabanı bütünlüğü korunur.
                                        </p>
                                        <button 
                                            onClick={() => handleDeleteUser(selectedUser.id)}
                                            disabled={actionLoading}
                                            className="w-full py-4 bg-white border-2 border-red-200 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-red-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" /> Kullanıcıyı Pasife Al ve Sil
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-8 bg-gray-50/80 border-t border-gray-100 flex gap-4 mt-auto">
                                <button 
                                    onClick={() => setIsDetailsOpen(false)}
                                    className="flex-1 py-4 bg-white border-2 border-gray-200 text-text-muted rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-gray-400 transition-all"
                                >
                                    İptal
                                </button>
                                <button 
                                    onClick={handleUpdateUser}
                                    disabled={actionLoading}
                                    className="flex-[2] py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Save className="w-4 h-4" /> Güncellemeleri Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
