'use client';

import React from 'react';
import { ScrollText } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { EmptyState } from '@/components/ui/EmptyState';

// Raw IYS channel codes -> Turkish labels (unknown codes fall back to the raw value).
const TYPE_LABELS: Record<string, string> = {
    EMAIL: 'E-posta',
    EPOSTA: 'E-posta',
    'E-posta': 'E-posta',
    SMS: 'SMS',
    CALL: 'Arama',
    ARAMA: 'Arama',
};

export default function IYSLogs() {
    const logs = [
        { id: 1, date: '2024-10-26 14:30', type: 'EMAIL', recipient: 'test@example.com', status: 'Başarılı' },
        { id: 2, date: '2024-10-26 14:32', type: 'SMS', recipient: '5551234567', status: 'Başarısız' },
    ];

    return (
        <AdminLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-main">IYS Logları</h2>
                <p className="text-text-secondary">Gönderilen IYS mesajlarının durumu.</p>
            </div>
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
                {logs.length === 0 ? (
                    <EmptyState icon={ScrollText} title="Henüz IYS kaydı yok" description="Gönderilen IYS mesajları burada listelenecek." />
                ) : (
                <table className="w-full min-w-[560px] text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-text-secondary font-semibold">
                            <th className="p-4">Tarih</th>
                            <th className="p-4">Tip</th>
                            <th className="p-4">Alıcı</th>
                            <th className="p-4">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-sm text-text-secondary">{log.date}</td>
                                <td className="p-4 text-sm text-text-main">{TYPE_LABELS[log.type] ?? log.type}</td>
                                <td className="p-4 text-sm text-text-main">{log.recipient}</td>
                                <td className="p-4 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === 'Başarılı' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
            </div>
        </AdminLayout>
    );
}
