'use client';

import { useEffect, useState } from 'react';
import { X, Database, CheckCircle2, Save, AlertCircle, Loader2 } from 'lucide-react';
import { ResourceService } from '@/services/db';
import { ServiceResourceService } from '@/services/db/db_service_resources';
import type { SalonResource } from '@/types';

interface ServiceResourceLinkModalProps {
  serviceId: string | null;
  salonId: string;
  serviceName?: string;
  onClose: () => void;
}

interface LinkRow {
  resource_id: string;
  qty: number;
  selected: boolean;
}

/**
 * Sprint D (R2) — Hizmete kaynak atama modali.
 * salon_service_resources tablosunda CRUD.
 */
export default function ServiceResourceLinkModal({
  serviceId,
  salonId,
  serviceName,
  onClose,
}: ServiceResourceLinkModalProps) {
  const [resources, setResources] = useState<SalonResource[]>([]);
  const [rows, setRows] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      ResourceService.getResourcesBySalon(salonId),
      ServiceResourceService.getLinksByService(serviceId),
    ])
      .then(([res, links]) => {
        setResources(res);
        const initialRows: LinkRow[] = res.map((r) => {
          const existing = links.find((l) => l.resource_id === r.id);
          return {
            resource_id: r.id,
            qty: existing?.qty ?? 1,
            selected: !!existing,
          };
        });
        setRows(initialRows);
      })
      .catch((err) => setError(err.message || 'Veri çekilemedi'))
      .finally(() => setLoading(false));
  }, [serviceId, salonId]);

  if (!serviceId) return null;

  const toggleRow = (idx: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r))
    );
  };

  const updateQty = (idx: number, qty: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, qty: Math.max(1, qty) } : r))
    );
  };

  async function handleSave() {
    if (!serviceId) return;
    setSaving(true);
    setError(null);
    try {
      const toSave = rows
        .filter((r) => r.selected)
        .map((r) => ({ resource_id: r.resource_id, qty: r.qty }));
      await ServiceResourceService.replaceLinks(serviceId, toSave);
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Database className="text-primary" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-main tracking-tight">KAYNAK GEREKSİNİMİ</h3>
              <p className="text-[11px] font-bold text-text-muted truncate max-w-[400px]">
                {serviceName || 'Hizmet'} için kullanılacak kaynaklar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-xl text-text-muted hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : resources.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-center">
              <AlertCircle size={32} className="text-amber-500" />
              <p className="text-sm font-bold text-text-main">Henüz kaynak tanımlanmamış</p>
              <p className="text-xs text-text-muted">
                Önce <strong>/owner/resources</strong> sayfasından koltuk / oda / ekipman ekleyin.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs font-bold text-blue-800 leading-relaxed">
                Bu hizmet için gereken kaynakları seç ve gerekli sayıyı belirle. Randevu sırasında
                kaynak kapasitesi otomatik kontrol edilir; aşan slotlar bookable görünmez.
              </div>

              <div className="space-y-2">
                {rows.map((row, idx) => {
                  const res = resources[idx];
                  if (!res) return null;
                  return (
                    <label
                      key={res.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition ${
                        row.selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-white hover:border-border/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={() => toggleRow(idx)}
                        className="w-5 h-5 rounded accent-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-text-main truncate">{res.name}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          Kapasite: {res.capacity} · {res.is_active ? 'Aktif' : 'Pasif'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase">Adet</label>
                        <input
                          type="number"
                          min={1}
                          max={res.capacity}
                          value={row.qty}
                          onChange={(e) => updateQty(idx, parseInt(e.target.value) || 1)}
                          disabled={!row.selected}
                          className="w-16 h-10 px-2 rounded-xl border border-border bg-white text-center font-bold text-sm disabled:opacity-50"
                        />
                      </div>
                    </label>
                  );
                })}
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-xs font-bold text-rose-700">
                  {error}
                </div>
              )}

              {saved && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={16} /> Kaynak gereksinimi güncellendi.
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-border bg-gray-50/50 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 h-12 rounded-2xl border border-border bg-white text-text-main font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || resources.length === 0}
            className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary-hover transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            <Save size={14} />
            {saved ? 'Kaydedildi' : saving ? 'Kaydediliyor' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
