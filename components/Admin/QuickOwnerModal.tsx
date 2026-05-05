"use client";

import React, { useState } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface QuickOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: any) => void;
}

export function QuickOwnerModal({ isOpen, onClose, onSuccess }: QuickOwnerModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "Password123!",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      showToast("Lütfen isim ve e-posta alanlarını doldurun.", "warning");
      return;
    }

    setLoading(true);
    try {
      const { adminCreateUserAction } = await import("@/app/admin/users/actions");
      const res = await adminCreateUserAction({
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        password: formData.password,
        role: "SALON_OWNER"
      });

      if (!res.success || !res.user) {
        throw new Error(res.error || "Bilinmeyen bir hata oluştu.");
      }
      
      const newProfile = {
        id: res.user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: "SALON_OWNER",
        avatar_url: null,
      };

      showToast("Yeni salon sahibi başarıyla oluşturuldu.", "success");
      onSuccess(newProfile);
      onClose();
    } catch (err: any) {
      showToast(err.message || "Kayıt sırasında bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Hızlı Sahip Kaydı</h2>
              <p className="text-xs text-slate-500 font-medium">Yeni bir salon sahibi ekleyin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Ad Soyad</label>
            <input
              type="text"
              placeholder="Ahmet Yılmaz"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium h-14"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">E-posta</label>
            <input
              type="email"
              placeholder="ahmet@example.com"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium h-14"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Telefon</label>
            <input
              type="tel"
              placeholder="0 (5xx) xxx xx xx"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium h-14"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <p className="text-[10px] text-slate-400 italic">
            * Varsayılan şifre "Password123!" atanacaktır.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-50 text-slate-600 rounded-2xl font-black hover:bg-gray-100 transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kaydet ve Seç"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
