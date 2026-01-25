/**
 * Admin User Management Page
 * Manage users, ban/verify, change roles
 */

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AuditService } from '@/services/audit';

export default function AdminUserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('role', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`Kullanıcının rolünü ${newRole} olarak değiştirmek istediğinizden emin misiniz?`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            await AuditService.log({
                action: 'UPDATE',
                table_name: 'profiles',
                record_id: userId,
                new_values: { role: newRole }
            });

            alert('Rol güncellendi');
            fetchUsers();
        } catch (err) {
            console.error('Role change failed:', err);
            alert('Rol güncellenemedi');
        }
    };

    const ROLE_LABELS: Record<string, string> = {
        'CUSTOMER': 'Müşteri',
        'STAFF': 'Personel',
        'SALON_OWNER': 'Salon Sahibi',
        'SUPER_ADMIN': 'Süper Admin'
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-main">Kullanıcı Yönetimi</h1>
                    <p className="text-text-secondary mt-1">Tüm kullanıcıları yönetin</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['all', 'CUSTOMER', 'STAFF', 'SALON_OWNER', 'SUPER_ADMIN'].map(role => (
                    <button
                        key={role}
                        onClick={() => setFilter(role)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === role
                                ? 'bg-primary text-white'
                                : 'bg-white border border-border hover:bg-gray-50'
                            }`}
                    >
                        {role === 'all' ? 'Tümü' : ROLE_LABELS[role]}
                    </button>
                ))}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase">Kullanıcı</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase">Rol</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase">Kayıt Tarihi</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                                    Yükleniyor...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                                    Kullanıcı bulunamadı
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-text-main">{user.full_name || 'İsimsiz'}</p>
                                            <p className="text-sm text-text-secondary">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                                                user.role === 'SALON_OWNER' ? 'bg-blue-100 text-blue-700' :
                                                    user.role === 'STAFF' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {ROLE_LABELS[user.role] || user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">
                                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Rol Değiştir</option>
                                            {Object.entries(ROLE_LABELS).map(([role, label]) => (
                                                <option key={role} value={role} disabled={role === user.role}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
