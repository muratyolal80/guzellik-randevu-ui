'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, TrendingUp, Lightbulb, RefreshCw, AlertCircle } from 'lucide-react';

interface AIInsightsProps {
    salonId?: string;
    viewType: 'single' | 'all';
}

export default function AIInsights({ salonId, viewType }: AIInsightsProps) {
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState<{
        analysis: string;
        predictions: string;
        tips: string[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/owner/ai-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ salonId, viewType })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setInsights(data);
        } catch (err) {
            console.error('AI Fetch Error:', err);
            setError('Analiz oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [salonId, viewType]);

    if (loading) {
        return (
            <div className="p-10 bg-gradient-to-br from-primary/5 to-indigo-500/5 rounded-[40px] border border-primary/10 flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Brain className="w-10 h-10 text-primary animate-bounce shadow-primary/20" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-text-main tracking-tight">AI Verileri Analiz Ediyor...</h3>
                    <p className="text-sm text-text-secondary font-bold italic mt-2">Gemini 1.5 Flash ile işletmenizin geleceğini kurguluyoruz.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 bg-red-50 rounded-[40px] border border-red-100 flex flex-col items-center text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-red-900 font-bold">{error}</p>
                <button 
                    onClick={fetchInsights}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase"
                >
                    <RefreshCw className="w-4 h-4" /> Tekrar Dene
                </button>
            </div>
        );
    }

    if (!insights) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* AI Analysis Header Case */}
            <div className="p-10 bg-gradient-to-br from-indigo-900 via-primary to-indigo-800 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <Sparkles className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Brain className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">AI İş Analisti Görüşü</h2>
                    </div>
                    <p className="text-lg font-medium leading-relaxed italic text-white/90">
                        "{insights.analysis}"
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Predictions */}
                <div className="p-8 bg-white border border-border rounded-[40px] shadow-sm">
                    <h3 className="text-sm font-black text-text-main uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Gelecek Tahminleri
                    </h3>
                    <p className="text-sm font-bold text-text-secondary leading-relaxed italic">
                        {insights.predictions}
                    </p>
                </div>

                {/* Eylem Planı (Tips) */}
                <div className="p-8 bg-white border border-border rounded-[40px] shadow-sm">
                    <h3 className="text-sm font-black text-text-main uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Önerilen Aksiyonlar
                    </h3>
                    <div className="space-y-3">
                        {insights.tips.map((tip, idx) => (
                            <div key={idx} className="flex gap-4 items-start group">
                                <div className="w-6 h-6 rounded-lg bg-gray-50 text-text-muted flex items-center justify-center text-[10px] font-black group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    {idx + 1}
                                </div>
                                <p className="text-xs font-bold text-text-secondary leading-tight mt-1">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center h-4 opacity-30 select-none">
                <div className="w-1 h-1 bg-primary rounded-full mx-2"></div>
                <div className="w-1.5 h-1.5 bg-primary rounded-full mx-2"></div>
                <div className="w-1 h-1 bg-primary rounded-full mx-2"></div>
            </div>
        </div>
    );
}
