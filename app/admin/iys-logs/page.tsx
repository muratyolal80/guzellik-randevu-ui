'use client';

import React from 'react';
import { AdminLayout } from '../../../components/AdminLayout';

export default function IYSLogs() {
    const logs = [
        { id: 1, date: '2024-10-26 14:30', type: 'E-posta', recipient: 'test@example.com', status: 'Başarılı' },
        { id: 2, date: '2024-10-26 14:32', type: 'SMS', recipient: '5551234567', status: 'Başarısız' },
    ];

    return (
        <AdminLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-main">IYS Logları</h2>
                <p className="text-text-secondary">Gönderilen IYS mesajlarının durumu.</p>
            </div>
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
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
                                <td className="p-4 text-sm text-text-main">{log.type}</td>
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
            </div>
        </AdminLayout>
    );
}

