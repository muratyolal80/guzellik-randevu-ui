'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Store, Scissors, X, Command } from 'lucide-react';
import { GlobalSearchService } from '@/services/db';
import { useRouter } from 'next/navigation';

export default function GlobalSearchPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ salons: any[], services: any[] }>({ salons: [], services: [] });
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setResults({ salons: [], services: [] });
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const data = await GlobalSearchService.search(query);
                    setResults(data);
                    setSelectedIndex(0);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults({ salons: [], services: [] });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (item: any, type: 'salon' | 'service') => {
        setIsOpen(false);
        if (type === 'salon') {
            router.push(`/salon/${item.id}`);
        } else {
            router.push(`/?search=${encodeURIComponent(item.name)}`);
        }
    };

    const totalResults = results.salons.length + results.services.length;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % totalResults);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + totalResults) % totalResults);
        } else if (e.key === 'Enter') {
            if (totalResults > 0) {
                if (selectedIndex < results.salons.length) {
                    handleSelect(results.salons[selectedIndex], 'salon');
                } else {
                    handleSelect(results.services[selectedIndex - results.salons.length], 'service');
                }
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsOpen(false)}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-50">
                    <Search className="w-6 h-6 text-primary" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Salon veya hizmet ara... (Kesim, Boya, Manikür...)"
                        className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-text-main placeholder:text-gray-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400">ESC</span>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm font-bold text-text-secondary">Aranıyor...</p>
                        </div>
                    ) : totalResults > 0 ? (
                        <>
                            {results.salons.length > 0 && (
                                <section>
                                    <h4 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Salonlar</h4>
                                    <div className="grid gap-1">
                                        {results.salons.map((salon, i) => (
                                            <button
                                                key={salon.id}
                                                onClick={() => handleSelect(salon, 'salon')}
                                                className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${selectedIndex === i ? 'bg-primary/5 border-primary/10' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0">
                                                    {salon.image ? (
                                                        <img src={salon.image} alt={salon.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-primary">
                                                            <Store className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-bold text-text-main leading-tight truncate">{salon.name}</p>
                                                    <p className="text-xs font-medium text-text-secondary truncate">{salon.city_name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {results.services.length > 0 && (
                                <section>
                                    <h4 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Hizmetler</h4>
                                    <div className="grid gap-1">
                                        {results.services.map((service, i) => (
                                            <button
                                                key={service.id}
                                                onClick={() => handleSelect(service, 'service')}
                                                className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${selectedIndex === (i + results.salons.length) ? 'bg-primary/5 border-primary/10' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/5">
                                                    <Scissors className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-bold text-text-main leading-tight truncate">{service.name}</p>
                                                    <p className="text-xs font-medium text-text-secondary truncate">{service.category_name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    ) : query.length >= 2 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                <Search className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-black text-text-main mb-1">Sonuç Bulunamadı</h4>
                            <p className="text-sm font-medium text-text-secondary">"{query}" aramasıyla eşleşen bir salon veya hizmet bulunamadı.</p>
                        </div>
                    ) : (
                        <div className="py-10 text-center text-gray-400 text-sm font-bold flex flex-col items-center gap-3">
                            <Command className="w-10 h-10 opacity-20" />
                            Hızlıca bulmak için salon veya hizmet adını yazın
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest uppercase">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5 underline-offset-4"><span className="p-1 bg-white border border-gray-100 rounded shadow-sm">↓↑</span> Gezin</span>
                        <span className="flex items-center gap-1.5 underline-offset-4"><span className="p-1 bg-white border border-gray-100 rounded shadow-sm">ENTER</span> Seç</span>
                    </div>
                    <span>Antigravity Search v1.0</span>
                </div>
            </div>
        </div>
    );
}
