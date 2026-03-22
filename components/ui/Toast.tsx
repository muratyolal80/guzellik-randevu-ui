'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev.slice(-2), { id, message, type }]); // Max 3 toasts
        
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div 
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${
                            toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                            toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                            toast.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                            'bg-blue-50 border-blue-100 text-blue-800'
                        }`}
                    >
                        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-500" />}
                        {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                        
                        <p className="text-sm font-bold truncate max-w-[300px]">{toast.message}</p>
                        
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 hover:opacity-70 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
