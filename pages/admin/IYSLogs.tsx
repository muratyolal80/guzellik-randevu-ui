
import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { IYSService } from '../../services/db';
import { IYSLog } from '../../types';

export const IYSLogs: React.FC = () => {
    const [logs, setLogs] = useState<IYSLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            const data = await IYSService.getLogs();
            setLogs(data);
            setLoading(false);
        };
        fetchLogs();
        
        // Refresh every 5 seconds to show new logs in demo
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-text-main">İYS Kayıtları</h2>
                    <p className="text-text-secondary">Sistem üzerinden gönderilen SMS ve OTP logları.</p>
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="p-2 text-text-secondary hover:text-primary rounded-lg transition-colors border border-border bg-white"
                >
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-text-secondary font-semibold">
                            <th className="p-4">Tarih</th>
                            <th className="p-4">Telefon No</th>
                            <th className="p-4">Tip</th>
                            <th className="p-4">İçerik</th>
                            <th className="p-4 text-right">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-text-secondary">Yükleniyor...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-text-muted">Henüz kayıt bulunmamaktadır.</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm text-text-secondary whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString('tr-TR')}
                                    </td>
                                    <td className="p-4 text-sm font-bold text-text-main font-mono">
                                        {log.phone}
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                                            log.message_type === 'OTP' ? 'bg-blue-50 text-blue-600' :
                                            log.message_type === 'INFO' ? 'bg-purple-50 text-purple-600' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {log.message_type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-text-secondary max-w-xs truncate" title={log.content}>
                                        {log.content}
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                            log.status === 'SENT' ? 'bg-green-100 text-green-700' :
                                            log.status === 'DEMO' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};
