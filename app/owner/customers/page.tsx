'use client';

import React, { useState, useEffect } from 'react';
import { CustomerService, SalonDataService } from '@/services/db';
import { SalonCustomer, CustomerNote } from '@/types';
import { 
    Users, 
    Search, 
    Filter, 
    MoreVertical, 
    Calendar, 
    CreditCard, 
    Star, 
    MessageSquare, 
    ChevronRight,
    UserCircle,
    Plus,
    X,
    TrendingUp,
    ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function OwnerCustomers() {
    const { user } = useAuth();
    const [salonId, setSalonId] = useState<string | null>(null);
    const [customers, setCustomers] = useState<SalonCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<SalonCustomer | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [notes, setNotes] = useState<CustomerNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    useEffect(() => {
        // Get salonId from local storage or context (Simulating owner's salon selection)
        const savedSalonId = localStorage.getItem('owner_selected_salon_id');
        if (savedSalonId) {
            setSalonId(savedSalonId);
            fetchCustomers(savedSalonId);
        } else {
            // Fetch first salon of owner if not selected
            fetchInitialSalon();
        }
    }, []);

    const fetchInitialSalon = async () => {
        if (!user?.id) return;
        try {
            const salons = await SalonDataService.getSalonsByOwner(user.id);
            if (salons && salons.length > 0) {
                setSalonId(salons[0].id);
                localStorage.setItem('owner_selected_salon_id', salons[0].id);
                fetchCustomers(salons[0].id);
            }
        } catch (err) {
            console.error('Salonlar çekilemedi:', err);
        }
    };

    const fetchCustomers = async (id: string) => {
        try {
            setLoading(true);
            // First sync to update stats
            await CustomerService.syncSalonCustomers(id);
            const data = await CustomerService.getCustomersBySalon(id);
            setCustomers(data);
        } catch (err) {
            console.error('Müşteriler çekilemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotes = async (customerId: string) => {
        if (!salonId) return;
        try {
            const data = await CustomerService.getCustomerNotes(salonId, customerId);
            setNotes(data);
        } catch (err) {
            console.error('Notlar çekilemedi:', err);
        }
    };

    const handleOpenDetail = (customer: SalonCustomer) => {
        setSelectedCustomer(customer);
        fetchNotes(customer.customer_id);
        setShowDetailModal(true);
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !salonId || !selectedCustomer) return;
        setSavingNote(true);
        try {
            await CustomerService.addCustomerNote({
                salon_id: salonId,
                customer_id: selectedCustomer.customer_id,
                note: newNote,
            });
            setNewNote('');
            fetchNotes(selectedCustomer.customer_id);
        } catch (err) {
            console.error('Not eklenemedi:', err);
        } finally {
            setSavingNote(false);
        }
    };

    const filteredCustomers = customers.filter(c => 
        c.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.profile?.phone?.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-text-main tracking-tight flex items-center gap-3">
                        <Users className="w-10 h-10 text-primary" /> Müşterilerim
                    </h1>
                    <p className="text-text-muted font-bold mt-2">Müşteri ilişkilerini yönetin ve sadakati artırın.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Müşteri ara..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white border-2 border-border/50 rounded-2xl w-full md:w-80 outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all font-bold"
                        />
                    </div>
                    <button className="p-4 bg-white border-2 border-border/50 rounded-2xl hover:border-primary transition-all group">
                        <Filter className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors" />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-primary to-primary-hover p-8 rounded-[40px] text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                    <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-700" />
                    <p className="text-white/80 font-black uppercase tracking-widest text-[10px]">Toplam Müşteri</p>
                    <h3 className="text-5xl font-black mt-2">{customers.length}</h3>
                    <div className="mt-6 flex items-center gap-2 bg-white/20 w-fit px-4 py-2 rounded-2xl backdrop-blur-md">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold">+12% Bu Ay</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-border/50 shadow-card relative overflow-hidden group">
                    <Star className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/5 group-hover:scale-110 transition-transform duration-700" />
                    <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Sadık Müşteriler</p>
                    <h3 className="text-5xl font-black mt-2 text-text-main">
                        {customers.filter(c => (c.total_appointments || 0) > 3).length}
                    </h3>
                    <p className="text-xs text-text-muted font-bold mt-6">3 ve üzeri randevusu olanlar</p>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-border/50 shadow-card relative overflow-hidden group">
                    <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                    <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Ortalama Harcama</p>
                    <h3 className="text-5xl font-black mt-2 text-text-main">
                        ₺{customers.length > 0 
                            ? Math.round(customers.reduce((acc, c) => acc + (c.total_spent || 0), 0) / customers.length) 
                            : 0
                        }
                    </h3>
                    <p className="text-xs text-text-muted font-bold mt-6">Müşteri başına ortalama gelir</p>
                </div>
            </div>

            {/* Customer List */}
            <div className="bg-white rounded-[40px] border-2 border-border/50 shadow-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-alt border-b border-border">
                            <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Müşteri Bilgisi</th>
                            <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Randevu Sayısı</th>
                            <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Toplam Harcama</th>
                            <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Son Ziyaret</th>
                            <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-primary/5 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-surface-alt border border-border flex items-center justify-center overflow-hidden">
                                            {customer.profile?.avatar_url ? (
                                                <img src={customer.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircle className="w-8 h-8 text-text-muted" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-text-main text-lg group-hover:text-primary transition-colors">
                                                {customer.profile?.full_name || 'İsimsiz Müşteri'}
                                            </p>
                                            <p className="text-xs text-text-muted font-bold">{customer.profile?.phone || 'Telefon yok'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                                            {customer.total_appointments}
                                        </span>
                                        <span className="text-xs font-bold text-text-muted">Randevu</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-black text-text-main">₺{customer.total_spent?.toLocaleString('tr-TR')}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-text-secondary text-sm font-bold">
                                        <Calendar className="w-4 h-4" />
                                        {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString('tr-TR') : 'Hiç randevu yok'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <button 
                                        onClick={() => handleOpenDetail(customer)}
                                        className="px-6 py-3 bg-white border-2 border-border/50 rounded-xl hover:border-primary hover:bg-primary hover:text-white transition-all font-black text-xs uppercase tracking-widest"
                                    >
                                        Detay
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredCustomers.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <Users className="w-16 h-16 text-text-muted/20 mx-auto" />
                        <h4 className="text-xl font-black text-text-muted">Müşteri bulunamadı.</h4>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-text-main/60 backdrop-blur-md" onClick={() => setShowDetailModal(false)} />
                    <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-border flex items-center justify-between bg-surface-alt">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-white border-2 border-border flex items-center justify-center overflow-hidden shadow-xl shadow-primary/5">
                                    {selectedCustomer.profile?.avatar_url ? (
                                        <img src={selectedCustomer.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle className="w-10 h-10 text-text-muted" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-text-main leading-tight">{selectedCustomer.profile?.full_name}</h2>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-sm font-bold text-text-muted">{selectedCustomer.profile?.phone}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-border" />
                                        <span className="text-sm font-bold text-primary italic uppercase tracking-widest">{selectedCustomer.loyalty_points || 0} Sadakat Puanı</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="p-4 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Notes Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-primary" /> Müşteri Notları
                                    </h4>
                                    <span className="bg-primary/5 px-3 py-1 rounded-full text-[10px] font-black text-primary border border-primary/20">
                                        {notes.length} Not
                                    </span>
                                </div>
                                
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {notes.map((note) => (
                                        <div key={note.id} className="bg-surface-alt p-5 rounded-3xl border border-border relative group">
                                            <p className="text-sm text-text-main font-medium leading-relaxed">{note.note}</p>
                                            <div className="mt-4 flex items-center gap-2">
                                                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <TrendingUp className="w-3 h-3 text-primary" />
                                                </div>
                                                <span className="text-[10px] font-black text-text-muted uppercase">
                                                    {note.staff_name || 'İşletme'} • {new Date(note.created_at || '').toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {notes.length === 0 && (
                                        <div className="py-10 text-center border-2 border-dashed border-border rounded-3xl">
                                            <p className="text-sm text-text-muted font-bold tracking-tight">Henüz not eklenmemiş.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 space-y-3">
                                    <textarea 
                                        placeholder="Yeni not ekleyin (örn: alerjiler, stil tercihleri...)"
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="w-full p-6 bg-surface-alt border-2 border-border/50 rounded-3xl font-medium text-sm outline-none focus:border-primary focus:bg-white transition-all min-h-[100px] resize-none"
                                    />
                                    <button 
                                        onClick={handleAddNote}
                                        disabled={savingNote || !newNote.trim()}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {savingNote ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-5 h-5" />}
                                        Notu Kaydet
                                    </button>
                                </div>
                            </div>

                            {/* Loyalty & Safety */}
                            <div className="space-y-8">
                                <div className="bg-surface-alt p-8 rounded-[40px] border border-border space-y-6">
                                    <h4 className="text-xs font-black text-text-main uppercase tracking-widest">Sadakat Programı</h4>
                                    <div className="space-y-4">
                                        <div className="bg-white p-6 rounded-3xl border border-border">
                                            <p className="text-[10px] font-black text-text-muted uppercase mb-1">Puan Bakiyesi</p>
                                            <h3 className="text-3xl font-black text-primary">{selectedCustomer.loyalty_points || 0}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button className="py-3 bg-white border border-border rounded-xl font-bold text-xs hover:border-primary hover:text-primary transition-all text-center uppercase tracking-tighter">+10 Puan</button>
                                            <button className="py-3 bg-white border border-border rounded-xl font-bold text-xs hover:border-primary hover:text-primary transition-all text-center uppercase tracking-tighter">+50 Puan</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 space-y-4">
                                    <div className="flex items-center gap-3 text-red-600">
                                        <ShieldAlert className="w-6 h-6" />
                                        <h4 className="font-black text-xs uppercase tracking-widest leading-none">Risk Yönetimi</h4>
                                    </div>
                                    <p className="text-xs text-red-700 font-medium leading-relaxed">Müşteriyi engellemek, gelecekteki randevu taleplerini otomatik olarak reddeder.</p>
                                    <button className="w-full py-4 border-2 border-red-200 text-red-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
                                        Müşteriyi Engelle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
