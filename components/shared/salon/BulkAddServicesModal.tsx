'use client';

import React, { useEffect, useState } from 'react';
import { MasterDataService, ServiceService, SalonDataService } from '@/services/db';
import type { GlobalService, ServiceCategory } from '@/types';
import { Sparkles, X, Loader2, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

interface BulkAddServicesModalProps {
    salonId: string;
    /** Mevcut hizmetlerin global_service_id listesi (duplicate engelleme) */
    existingGlobalServiceIds: string[];
    onClose: () => void;
    onAdded: (addedCount: number) => void;
}

interface CategoryGroup {
    category: ServiceCategory;
    services: GlobalService[];
}

/**
 * Salon tipine göre standart hizmetleri toplu eklemek için modal.
 *
 * Akış:
 *   1. salon.type_id → salon_type_categories → service_categories → global_services
 *   2. Kategori bazlı gruplandırılmış servis listesi
 *   3. Kullanıcı checkbox ile seçim (default: hepsi seçili)
 *   4. Tek tıkla salon_services'a batch insert (smart defaults: avg_price, avg_duration)
 *
 * Duplicate koruma: mevcut hizmetler listede gri/seçilemez.
 */
export default function BulkAddServicesModal({
    salonId,
    existingGlobalServiceIds,
    onClose,
    onAdded,
}: BulkAddServicesModalProps) {
    const [groups, setGroups] = useState<CategoryGroup[]>([]);
    const [salonName, setSalonName] = useState('');
    const [salonTypeName, setSalonTypeName] = useState('');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedCount, setSavedCount] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                setLoading(true);
                setError(null);

                const salon = await SalonDataService.getSalonById(salonId);
                if (!salon) {
                    setError('Salon bulunamadı.');
                    return;
                }
                if (cancelled) return;
                setSalonName(salon.name);
                setSalonTypeName(salon.type_name || 'Genel');

                if (!salon.type_id) {
                    setError('Bu salonun tipi belirlenmemiş. Önce salon tipini ayarlayın.');
                    return;
                }

                const categories = await MasterDataService.getServiceCategoriesForSalonTypes([salon.type_id]);
                if (cancelled) return;

                if (categories.length === 0) {
                    setError('Bu salon tipi için tanımlı kategori yok.');
                    return;
                }

                const allServices = await MasterDataService.getGlobalServicesByCategories(
                    categories.map((c) => c.id),
                );
                if (cancelled) return;

                const byCategory = new Map<string, CategoryGroup>();
                categories.forEach((c) => byCategory.set(c.id, { category: c, services: [] }));
                allServices.forEach((s: GlobalService) => {
                    const grp = byCategory.get(s.category_id || '');
                    if (grp) grp.services.push(s);
                });

                const sortedGroups = Array.from(byCategory.values())
                    .filter((g) => g.services.length > 0)
                    .map((g) => ({
                        ...g,
                        services: [...g.services].sort((a, b) => a.name.localeCompare(b.name, 'tr')),
                    }));

                if (cancelled) return;
                setGroups(sortedGroups);

                // Default: var olmayan tüm hizmetler seçili (akıllı default)
                const defaultSelected = new Set<string>();
                sortedGroups.forEach((g) =>
                    g.services.forEach((s) => {
                        if (!existingGlobalServiceIds.includes(s.id)) defaultSelected.add(s.id);
                    }),
                );
                setSelected(defaultSelected);
            } catch (err: any) {
                if (!cancelled) setError(err?.message || 'Yüklenemedi');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [salonId, existingGlobalServiceIds]);

    const toggleService = (id: string) => {
        if (existingGlobalServiceIds.includes(id)) return; // mevcut: seçilemez
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleCategoryAll = (group: CategoryGroup) => {
        const selectableIds = group.services
            .filter((s) => !existingGlobalServiceIds.includes(s.id))
            .map((s) => s.id);
        const allOn = selectableIds.every((id) => selected.has(id));
        setSelected((prev) => {
            const next = new Set(prev);
            if (allOn) selectableIds.forEach((id) => next.delete(id));
            else selectableIds.forEach((id) => next.add(id));
            return next;
        });
    };

    const handleSave = async () => {
        if (selected.size === 0) return;
        setSaving(true);
        setError(null);
        try {
            const allServices = groups.flatMap((g) => g.services);
            const toInsert = allServices.filter((s) => selected.has(s.id));

            // Batch insert via tek-tek (ServiceService.createService kullanıyor;
            // limit kontrolü her seferinde olur — küçük listelerde sorun değil)
            let count = 0;
            for (const svc of toInsert) {
                try {
                    await ServiceService.createService({
                        salon_id: salonId,
                        global_service_id: svc.id,
                        price: svc.avg_price || 100,
                        duration_min: svc.avg_duration_min || 30,
                        max_participants: 1,
                        requires_resource: false,
                    });
                    count++;
                } catch (singleErr: any) {
                    console.warn(`[BulkAddServices] failed for ${svc.name}:`, singleErr?.message);
                    if ((singleErr?.message || '').includes('SUBSCRIPTION_LIMIT_REACHED')) {
                        setError('Plan limiti aşıldı. Daha fazlasını eklemek için planınızı yükseltin.');
                        break;
                    }
                }
            }

            setSavedCount(count);
            setTimeout(() => {
                onAdded(count);
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err?.message || 'Toplu ekleme başarısız.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-amber-50/50 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text-main">Standart Hizmetleri Toplu Ekle</h3>
                            <p className="text-xs font-bold text-text-muted">
                                {salonName ? `${salonName} · ` : ''}{salonTypeName} tipine özel öneriler
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={saving} className="p-2 rounded-xl text-text-muted hover:bg-gray-100 disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-bold text-text-muted">Hizmetler yükleniyor...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <p className="text-sm font-bold text-rose-700">{error}</p>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-sm font-bold text-text-muted">Bu salon tipi için tanımlı hizmet yok.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-xs font-bold text-blue-800">
                                Tüm hizmetler varsayılan olarak seçili. İstemediklerini kaldırabilirsin.
                                Fiyat ve süre eklendikten sonra düzenlenebilir.
                            </div>

                            {groups.map((g) => {
                                const selectableIds = g.services
                                    .filter((s) => !existingGlobalServiceIds.includes(s.id))
                                    .map((s) => s.id);
                                const allOn = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));
                                const someOn = selectableIds.some((id) => selected.has(id));
                                return (
                                    <div key={g.category.id} className="border border-border rounded-2xl overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-text-muted" />
                                                <h4 className="text-sm font-black text-text-main">{g.category.name}</h4>
                                                <span className="text-[10px] font-bold text-text-muted">
                                                    ({g.services.length})
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => toggleCategoryAll(g)}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                            >
                                                {allOn ? 'Hiçbirini Seçme' : someOn ? 'Tümünü Seç' : 'Tümünü Seç'}
                                            </button>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {g.services.map((s) => {
                                                const isExisting = existingGlobalServiceIds.includes(s.id);
                                                const isSelected = selected.has(s.id);
                                                return (
                                                    <label
                                                        key={s.id}
                                                        className={`flex items-center gap-3 px-4 py-3 transition ${
                                                            isExisting
                                                                ? 'bg-gray-50 cursor-not-allowed opacity-60'
                                                                : 'hover:bg-amber-50/30 cursor-pointer'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            disabled={isExisting || saving}
                                                            onChange={() => toggleService(s.id)}
                                                            className="w-4 h-4 accent-primary"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-text-main truncate">
                                                                {s.name}
                                                                {isExisting && (
                                                                    <span className="ml-2 text-[10px] font-black uppercase text-emerald-700">
                                                                        ✓ ZATEN VAR
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-[11px] font-bold text-text-muted">
                                                                {s.avg_duration_min ? `${s.avg_duration_min} dk` : ''}
                                                                {s.avg_duration_min && s.avg_price ? ' · ' : ''}
                                                                {s.avg_price ? `~${s.avg_price}₺ önerilen` : ''}
                                                            </p>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {savedCount !== null && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <p className="text-sm font-bold text-emerald-800">
                                {savedCount} hizmet başarıyla eklendi
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-gray-50/30 rounded-b-3xl flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-text-muted">
                        Seçili: <span className="text-primary text-base">{selected.size}</span> hizmet
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="px-5 h-11 rounded-2xl border border-border bg-white text-text-main font-black text-xs uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50"
                        >
                            Vazgeç
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || loading || selected.size === 0 || savedCount !== null}
                            className="px-6 h-11 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary-hover disabled:opacity-40 flex items-center gap-2"
                        >
                            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                            {savedCount !== null ? 'Eklendi' : saving ? 'Ekleniyor...' : `${selected.size} Hizmeti Ekle`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
