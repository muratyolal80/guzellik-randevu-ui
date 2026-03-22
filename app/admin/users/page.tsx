'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { ProfileService } from '@/services/db/db_user';
import { Profile, UserRole } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { Breadcrumbs } from '@/components/Admin/Breadcrumbs';
import { 
    Search, 
    Trash2, 
    UserX, 
    ChevronRight, 
    X, 
    Mail, 
    Phone, 
    Shield, 
    UserCog,
    AlertCircle,
    Save,
    RotateCcw,
    Users,
    Plus,
    CheckCircle2,
    XCircle,
    Key,
    Download,
    ChevronLeft,
    MoreVertical
} from 'lucide-react';
import { 
    adminCreateUserAction, 
    adminUpdateUserAuthAction, 
    adminDeleteUserAuthAction 
} from './actions';
import { getErrorMessage } from '@/lib/error-mapping';

const ROLE_LABELS: Record<string, { label: string, icon: any, color: string, bg: string, border: string }> = {
    'CUSTOMER': { label: 'MÜŞTERİ', icon: Users, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
    'STAFF': { label: 'PERSONEL', icon: UserCog, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    'SALON_OWNER': { label: 'SALON SAHİBİ', icon: Shield, color: 'text-blue-700', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    'SUPER_ADMIN': { label: 'ADMİN', icon: Shield, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100' },
};

export default function AdminUserManagementPage() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<Profile[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<UserRole | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    
    // Selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // Drawer States
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Form States
    const [editForm, setEditForm] = useState<Partial<Profile & { password?: string }>>({});

    useEffect(() => {
        setPage(1); // Reset page on filter change
    }, [filter]);

    useEffect(() => {
        fetchUsers();
    }, [filter, page, searchQuery]); // Search query debouncing would be better, but adding search to fetch

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { profiles, totalCount } = await ProfileService.adminGetProfiles({
                role: filter === 'all' ? undefined : filter,
                search: searchQuery,
                page,
                pageSize
            });
            setUsers(profiles);
            setTotalCount(totalCount);
        } catch (error: any) {
            console.error('Failed to fetch users:', error);
            showToast(getErrorMessage(error), 'error');
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
        setEditForm({ email: '', full_name: '', role: 'CUSTOMER', phone: '', is_active: true, password: '', id: '' });
        setIsCreateMode(true);
        setIsDetailsOpen(true);
    };

    const handleAction = async (task: () => Promise<any>, successMsg: string) => {
        try {
            setActionLoading(true);
            await task();
            showToast(successMsg, 'success');
            setIsDetailsOpen(false);
            fetchUsers();
        } catch (error: any) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveUser = async () => {
        if (!editForm.email || (!isCreateMode && !selectedUser)) return;
        if (!editForm.full_name) {
            showToast('Lütfen isim alanını doldurun.', 'warning');
            return;
        }

        if (isCreateMode) {
            handleAction(async () => {
                const res = await adminCreateUserAction(editForm as any);
                if (!res.success) throw new Error(res.error);
            }, 'Kullanıcı başarıyla oluşturuldu.');
        } else if (selectedUser) {
            handleAction(async () => {
                if (editForm.email !== selectedUser.email || editForm.phone !== selectedUser.phone || editForm.password) {
                    const authRes = await adminUpdateUserAuthAction(selectedUser.id, {
                        email: editForm.email,
                        phone: editForm.phone,
                        password: editForm.password
                    });
                    if (!authRes.success) throw new Error(authRes.error);
                }

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
                await ProfileService.adminHardDelete(selectedUser.id);
                const authRes = await adminDeleteUserAuthAction(selectedUser.id);
                if (!authRes.success) throw new Error(authRes.error);
            } else {
                await ProfileService.adminToggleActive(selectedUser.id, false);
            }
        }, hardDelete ? 'Kullanıcı tamamen silindi.' : 'Kullanıcı pasife alındı.');
    };

    const handleToggleSelection = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === users.length) setSelectedIds([]);
        else setSelectedIds(users.map(u => u.id));
    };

    const exportToCSV = () => {
        const headers = ["ID", "Full Name", "Email", "Phone", "Role", "Active", "Created At"];
        const rows = users.map(u => [
            u.id,
            u.full_name || '',
            u.email || '',
            u.phone || '',
            u.role || '',
            u.is_active ? 'Yes' : 'No',
            u.created_at || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `kullanicilar_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('CSV dosyası başarıyla dışa aktarıldı.', 'success');
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <AdminLayout>
            <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen pb-32">
                <Breadcrumbs items={[{ label: 'Kullanıcı Yönetimi' }]} />
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-primary bg-primary/10 w-fit px-5 py-2.5 rounded-2xl border border-primary/20">
                            <Users className="w-5 h-5" />
                            <span className="text-[11px] font-black tracking-[0.2em] uppercase">Sistem Kontrol</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                            Kullanıcı <span className="text-primary">Yönetimi</span>
                        </h1>
                        <p className="text-sm font-medium text-slate-500 italic max-w-xl leading-relaxed">
                            Ekosistemdeki tüm aktörleri merkezi olarak denetleyin. Yetki dağıtımı, güvenlik protokolleri ve veri bütünlüğü operasyonlarını bu panel üzerinden yürütebilirsiniz.
                        </p>
                    </div>

                    <div className="flex gap-6 items-center">
                        {/* Stats Card - Unified Height */}
                        <div className="bg-white border border-slate-100 h-24 px-8 rounded-[32px] flex items-center gap-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] group transition-all hover:bg-slate-50 border-b-4 border-b-slate-200">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-white transition-all">
                                <Users className="w-7 h-7" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Toplam Kullanıcı</p>
                                <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">{users.length}</p>
                            </div>
                        </div>

                        {/* Add Button - Unified Height */}
                        <button 
                            onClick={handleOpenCreate}
                            className="bg-primary text-white h-24 px-10 rounded-[32px] flex items-center gap-5 hover:translate-y-[-4px] active:scale-95 transition-all shadow-[0_20px_50px_-15px_rgba(var(--primary-rgb),0.3)] group overflow-hidden relative border-b-4 border-b-primary-dark/20"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                            <Plus className="w-7 h-7 relative z-10" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] relative z-10">Yeni Kullanıcı Ekle</span>
                        </button>
                    </div>
                </div>

                {/* Filters & Search - Premium Design */}
                <div className="bg-white border-2 border-slate-100 p-8 rounded-[44px] shadow-sm space-y-8 backdrop-blur-3xl">
                    <div className="flex flex-wrap gap-2.5">
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
                                className={`px-7 py-3.5 rounded-2xl text-[10px] font-black tracking-widest transition-all border-2 ${filter === r.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-y-[-2px]' : 'bg-white border-slate-50 text-slate-400 hover:border-primary/30 hover:text-slate-600 hover:bg-slate-50/50'}`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative group flex-1">
                            <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                            <input 
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="İsim, e-posta veya telefon numarası ile dinamik sorgulama yapın..." 
                                className="w-full h-18 pl-18 pr-8 bg-slate-50 border-2 border-transparent rounded-[28px] text-base font-bold text-slate-800 focus:bg-white focus:border-primary/20 transition-all outline-none shadow-inner group-hover:bg-slate-100/50"
                            />
                        </div>
                        
                        <button 
                            onClick={exportToCSV}
                            className="bg-white border-2 border-slate-100 h-18 px-8 rounded-[28px] flex items-center gap-4 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 shadow-sm"
                        >
                            <Download className="w-5 h-5 text-primary" />
                            CSV Dışa Aktar
                        </button>
                    </div>
                </div>

                {/* Users Table - High Performance */}
                <div className="bg-white border-2 border-slate-100 rounded-[48px] overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border-b-8 border-b-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-7">
                                        <div 
                                            onClick={handleSelectAll}
                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.length === users.length && users.length > 0 ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200'}`}
                                        >
                                            {selectedIds.length === users.length && users.length > 0 && <CheckCircle2 className="w-4 h-4" />}
                                        </div>
                                    </th>
                                    <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">PROFİL & STATUS</th>
                                    <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">İLETİŞİM KANALLARI</th>
                                    <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">YETKİ SEVİYESİ</th>
                                    <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">SİSTEME GIRİŞ</th>
                                    <th className="px-12 py-7 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">AKSİYON</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-32 text-center">
                                            <div className="flex flex-col items-center gap-5">
                                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Sistem senkronize ediliyor...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-40 text-center grayscale opacity-40">
                                            <div className="flex flex-col items-center gap-6">
                                                <UserX className="w-20 h-20 text-slate-200" />
                                                <p className="text-base font-black uppercase tracking-[0.2em] text-slate-400">Veri seti eşleşmesi bulunamadı</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.map((u: Profile) => (
                                    <tr 
                                        key={u.id} 
                                        className={`hover:bg-slate-50/50 transition-all group cursor-pointer border-l-4 ${selectedIds.includes(u.id) ? 'bg-indigo-50/50 border-l-primary' : 'border-l-transparent hover:border-l-primary/50'}`} 
                                    >
                                        <td className="px-6 py-9" onClick={(e) => { e.stopPropagation(); handleToggleSelection(u.id); }}>
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(u.id) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-white border-slate-200 group-hover:border-primary/30'}`}>
                                                {selectedIds.includes(u.id) && <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                        </td>
                                        <td className="px-12 py-9" onClick={() => handleOpenDetails(u)}>
                                            <div className="flex items-center gap-7">
                                                <div className="relative shrink-0">
                                                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl font-black ${ROLE_LABELS[u.role || 'CUSTOMER'].bg} ${ROLE_LABELS[u.role || 'CUSTOMER'].color} shadow-sm border ${ROLE_LABELS[u.role || 'CUSTOMER'].border}`}>
                                                        {u.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full border-[5px] border-white flex items-center justify-center ${u.is_active ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-300 shadow-slate-100'} shadow-lg`}>
                                                        {u.is_active ? <CheckCircle2 className="w-3 h-3 text-white" /> : <XCircle className="w-3 h-3 text-white" />}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">
                                                        {u.full_name || 'İSİMSİZ KULLANICI'}
                                                        {!u.full_name && <span className="ml-3 text-[10px] text-rose-500 lowercase normal-case italic font-bold">(Profil Eksik)</span>}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 tracking-[0.1em] uppercase bg-slate-100 w-fit px-2 py-0.5 rounded-md">REF: {u.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-9">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Mail className="w-4 h-4 text-slate-400" /></div>
                                                    {u.email}
                                                </div>
                                                {u.phone && (
                                                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Phone className="w-4 h-4 text-slate-400" /></div>
                                                        {u.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-12 py-9">
                                            <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 flex items-center gap-3.5 w-fit ${
                                                u.role === 'SUPER_ADMIN' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                u.role === 'SALON_OWNER' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                u.role === 'STAFF' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {React.createElement(ROLE_LABELS[u.role || 'CUSTOMER'].icon, { className: 'w-4.5 h-4.5' })}
                                                {ROLE_LABELS[u.role || 'CUSTOMER'].label}
                                            </span>
                                        </td>
                                        <td className="px-12 py-9">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-black text-slate-900">{u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : 'MİRAS VERİ'}</span>
                                                <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                                                    {u.created_at ? new Date(u.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '00:00'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-9 text-right">
                                            <div className="flex items-center justify-end gap-4 translate-x-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">İncele</span>
                                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
                                                    <ChevronRight className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border-2 border-slate-100 p-8 rounded-[36px] shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        GÖSTERİLEN: <span className="text-slate-900">{users.length}</span> / TOPLAM: <span className="text-slate-900">{totalCount}</span>
                    </p>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all active:scale-95"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                            {[...Array(totalPages)].map((_, i) => {
                                const p = i + 1;
                                // Basic pagination logic: show first, last, and current +/- 1
                                if (totalPages > 5 && p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
                                    if (p === 2 || p === totalPages - 1) return <span key={p} className="text-slate-300">...</span>;
                                    return null;
                                }
                                return (
                                    <button 
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xs font-black transition-all active:scale-95 ${page === p ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-50 text-slate-400 hover:border-primary/30 hover:text-primary'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            disabled={page === totalPages || totalPages === 0}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all active:scale-95"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Bulk Actions Floating Bar */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[80] animate-in slide-in-from-bottom-10 duration-500">
                        <div className="bg-slate-900 text-white px-10 py-6 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-10">
                            <div className="flex items-center gap-4 border-r border-white/10 pr-10">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black">{selectedIds.length}</div>
                                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Seçili Kullanıcı</span>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <button className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-3 group">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                    Aktife Al
                                </button>
                                <button className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-3 group">
                                    <XCircle className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                                    Pasife Al
                                </button>
                                <button 
                                    onClick={() => setSelectedIds([])}
                                    className="p-3 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Details / Create / Edit Drawer - Improved Solidity & Scroll */}
                {isDetailsOpen && (
                    <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-300 pointer-events-auto">
                        {/* Overlay - Slightly darker for better focus */}
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsDetailsOpen(false)}></div>
                        
                        {/* Drawer Body - Solid background, NO glassmorphism to fix "transparent" look */}
                        <div className="ml-auto w-full max-w-2xl bg-[#ffffff] h-full shadow-[-40px_0_100px_-20px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden rounded-l-[48px] border-l border-white/30 relative z-10">
                            
                            {/* Drawer Header - Solid slate background with high contrast */}
                            <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/100 shrink-0">
                                <div className="flex items-center gap-8">
                                    <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-4xl font-black ${ROLE_LABELS[editForm.role || 'CUSTOMER'].bg} ${ROLE_LABELS[editForm.role || 'CUSTOMER'].color} shadow-2xl border-4 border-white`}>
                                        {editForm.full_name?.charAt(0) || (isCreateMode ? '+' : 'U')}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none truncate max-w-[300px]">
                                            {isCreateMode ? 'YENİ KAYIT' : (editForm.full_name || 'İSİMSİZ')}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] bg-white px-2 py-1 rounded-md border border-slate-100">
                                                {isCreateMode ? 'SİSTEME MANUEL EKLEME' : `PROFİL ID: ${selectedUser?.id.substring(0, 16)}...`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailsOpen(false)} className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center transition-all border border-slate-100 shadow-xl group">
                                    <X className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                                </button>
                            </div>

                            {/* Drawer Scrollable Content - Robust scroll handling with flex-grow and overflow */}
                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-white p-12 space-y-12">
                                {/* Core Info Section */}
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                    <h4 className="text-[12px] font-black text-primary uppercase tracking-[0.6em] flex items-center gap-4 border-b border-primary/10 pb-4">
                                        <UserCog className="w-6 h-6" /> KİMLİK & ERİŞİM BİLGİLERİ
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Tam İsim (Yasal Ad Soyad)</label>
                                            <div className="relative group p-1 bg-slate-50 rounded-3xl border-2 border-transparent focus-within:border-primary/30 transition-all">
                                                <input 
                                                    value={editForm.full_name || ''}
                                                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                                    placeholder="Lütfen ad soyad giriniz"
                                                    className="w-full h-16 px-8 bg-white border border-slate-200 rounded-2xl text-base font-black text-slate-900 focus:shadow-[0_8px_25px_-10px_rgba(0,0,0,0.1)] transition-all outline-none"
                                                />
                                                <Shield className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-200 group-focus-within:text-primary transition-colors" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">İletişim E-Postası</label>
                                                <div className="relative group p-1 bg-slate-50 rounded-3xl border-2 border-transparent focus-within:border-primary/30 transition-all">
                                                    <input 
                                                        value={editForm.email || ''}
                                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                        placeholder="örnek@mail.com"
                                                        className="w-full h-16 px-8 bg-white border border-slate-200 rounded-2xl text-base font-black text-slate-900 focus:shadow-[0_8px_25px_-10px_rgba(0,0,0,0.1)] transition-all outline-none"
                                                    />
                                                    <Mail className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-200 group-focus-within:text-primary transition-colors" />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Telefon Hattı</label>
                                                <div className="relative group p-1 bg-slate-50 rounded-3xl border-2 border-transparent focus-within:border-primary/30 transition-all">
                                                    <input 
                                                        value={editForm.phone || ''}
                                                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                                        placeholder="+90 XXX XXX XX XX"
                                                        className="w-full h-16 px-8 bg-white border border-slate-200 rounded-2xl text-base font-black text-slate-900 focus:shadow-[0_8px_25px_-10px_rgba(0,0,0,0.1)] transition-all outline-none"
                                                    />
                                                    <Phone className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-200 group-focus-within:text-primary transition-colors" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Sistem Rolü ve Yetki</label>
                                            <div className="relative p-1 bg-slate-50 rounded-3xl border-2 border-transparent focus-within:border-primary/20 transition-all">
                                                <select 
                                                    value={editForm.role}
                                                    onChange={e => setEditForm({ ...editForm, role: e.target.value as any })}
                                                    className="w-full h-16 px-8 bg-white border border-slate-200 rounded-2xl text-base font-black text-slate-900 focus:shadow-[0_8px_25px_-10px_rgba(0,0,0,0.1)] transition-all outline-none appearance-none cursor-pointer pr-16"
                                                >
                                                    <option value="CUSTOMER">STANDART MÜŞTERİ</option>
                                                    <option value="STAFF">PERSONEL ÜYESİ</option>
                                                    <option value="SALON_OWNER">SALON İŞLETMECİSİ</option>
                                                    <option value="SUPER_ADMIN">SİSTEM YÖNETİCİSİ</option>
                                                </select>
                                                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronRight className="w-6 h-6 rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Security & Account Integrity Section */}
                                <div className="space-y-10 p-10 bg-slate-50/100 border-2 border-slate-100 rounded-[40px] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                                    <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.6em] flex items-center gap-4">
                                        <Shield className="w-6 h-6 text-emerald-600" /> HESAP GÜVENLİK PROTOKOLLERİ
                                    </h4>

                                    <div className="grid grid-cols-1 gap-10">
                                        <div className="flex items-center justify-between p-8 bg-white rounded-[32px] border-2 border-slate-100 hover:border-emerald-200 transition-all cursor-pointer shadow-sm group"
                                             onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}>
                                            <div className="space-y-2">
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Kayıt Aktiflik Durumu</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${editForm.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase italic">
                                                        {editForm.is_active ? 'Erişim aktif - kullanıcı sisteme giriş yapabilir' : 'Erişim askıya alındı - tüm operasyonlar durduruldu'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`w-18 h-10 rounded-full p-1.5 transition-all duration-500 shadow-inner ${editForm.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <div className={`w-7 h-7 bg-white rounded-full transition-all duration-500 shadow-[0_2px_10px_rgba(0,0,0,0.1)] ${editForm.is_active ? 'translate-x-8 scale-110' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                                                Erişim Şifresi {isCreateMode ? '(Zorunlu)' : '(Yalnızca güncellemek için girin)'}
                                            </label>
                                            <div className="relative group p-1 bg-slate-50 rounded-3xl border-2 border-transparent focus-within:border-indigo-300 transition-all">
                                                <input 
                                                    type="password"
                                                    value={editForm.password || ''}
                                                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                                    placeholder="••••••••••••"
                                                    className="w-full h-16 px-8 bg-white border border-slate-200 rounded-2xl text-base font-black text-slate-900 focus:shadow-[0_8px_25px_-10px_rgba(0,0,0,0.1)] transition-all outline-none"
                                                />
                                                <Key className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-200 group-focus-within:text-indigo-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone - High Contrast */}
                                {!isCreateMode && (
                                    <div className="space-y-10 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                                        <h4 className="text-[12px] font-black text-rose-600 uppercase tracking-[0.6em] flex items-center gap-4">
                                            <AlertCircle className="w-6 h-6 border-b-2 border-rose-100" /> KRİTİK İŞLEM MERKEZİ
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <button 
                                                onClick={() => handleDeleteUser(false)}
                                                className="p-10 bg-white border-2 border-slate-100 rounded-[44px] text-left hover:border-rose-100 hover:bg-rose-50/5 transition-all space-y-5 group flex flex-col shadow-sm"
                                            >
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-500 transition-all">
                                                    <RotateCcw className="w-7 h-7" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-black text-slate-900 group-hover:text-rose-700 uppercase tracking-tight">Hesabı Pasifleştir</p>
                                                    <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">Veriler korunur ancak kullanıcının sisteme tüm erişimi anında kesilir.</p>
                                                </div>
                                            </button>

                                            <button 
                                                onClick={() => handleDeleteUser(true)}
                                                className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[44px] text-left hover:border-rose-600 hover:bg-rose-100 transition-all space-y-5 group flex flex-col shadow-sm"
                                            >
                                                <div className="w-14 h-14 rounded-2xl bg-rose-200/50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
                                                    <Trash2 className="w-7 h-7" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-black text-rose-700 uppercase tracking-tight text-white group-hover:text-rose-900">KALICI OLARAK SİL</p>
                                                    <p className="text-[11px] font-semibold text-rose-800/60 leading-relaxed italic">UYARI: Bağlı tüm salonlar, randevular ve finansal kayıtlar geri döndürülemez şekilde yok edilir.</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="h-24 shrink-0"></div> {/* Extra bottom space for perfect scroll experience */}
                            </div>

                            {/* Drawer Footer - Solid backround and shadow to separate from scroll area */}
                            <div className="p-12 bg-white border-t border-slate-100 flex gap-8 shrink-0 relative z-20 shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.05)]">
                                <button 
                                    onClick={() => setIsDetailsOpen(false)}
                                    className="flex-1 h-20 bg-slate-50 text-slate-500 rounded-3xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-700 transition-all border border-slate-100"
                                >
                                    Pencereyi Kapat
                                </button>
                                <button 
                                    onClick={handleSaveUser}
                                    disabled={actionLoading}
                                    className="flex-[2] h-20 bg-primary text-white rounded-3xl text-[12px] font-black uppercase tracking-widest shadow-[0_15px_35px_-10px_rgba(var(--primary-rgb),0.5)] hover:translate-y-[-4px] active:scale-95 transition-all flex items-center justify-center gap-5 disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {actionLoading ? (
                                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="w-6 h-6" />
                                    )}
                                    {isCreateMode ? 'SİSTEME KAYDET' : 'GÜNCELLEMELERİ YAYINLA'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Global style for custom scrollbar that works and looks better */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f8fafc;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </AdminLayout>
    );
}
