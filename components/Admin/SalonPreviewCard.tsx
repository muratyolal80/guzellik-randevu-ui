"use client";

import React from "react";
import { MapPin, Star, Phone, Clock, Heart } from "lucide-react";

interface SalonPreviewCardProps {
  data: any;
  owner?: any;
  cityName?: string;
  districtName?: string;
  typeName?: string;
}

export function SalonPreviewCard({ data, owner, cityName, districtName, typeName }: SalonPreviewCardProps) {
  return (
    <div className="sticky top-8 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Canlı Önizleme</h3>
        <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[10px] font-black animate-pulse">
          Yayınlandığında Görünecek Hal
        </span>
      </div>

      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/10 border border-slate-100 group transition-all duration-500 hover:shadow-primary/20">
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={data.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop"}
            alt="Salon Preview"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
          
          <button className="absolute top-4 right-4 p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
            <Heart className="w-5 h-5" />
          </button>

          {typeName && (
            <div className="absolute bottom-4 left-4">
              <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider">
                {typeName}
              </span>
            </div>
          )}
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {data.name || "Salon İsmi Henüz Girilmedi"}
              </h4>
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold uppercase tracking-wide">
                  {cityName ? `${cityName}, ${districtName || ""}` : "Konum Seçilmedi"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full border border-amber-100">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-black text-sm">4.9</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-bold">120+ Değerlendirme</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Telefon</span>
                <span className="text-xs font-black text-slate-700">{data.phone || "---"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Açılış</span>
                <span className="text-xs font-black text-slate-700">09:00 - 19:00</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between text-sm">
               <span className="text-slate-500 font-black uppercase text-[10px]">Hizmet Türleri</span>
               <span className="text-slate-900 font-black">Profesyonel Bakım</span>
             </div>
             <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-primary w-2/3 rounded-full shadow-lg shadow-primary/30"></div>
             </div>
          </div>

          <button className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
             Randevu Al <Clock className="w-5 h-5" />
          </button>
        </div>
      </div>

      {owner && (
        <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center gap-4 border border-white/10 shadow-xl shadow-slate-900/40 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
            {owner.avatar_url ? (
              <img src={owner.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black text-primary">
                {owner.full_name?.charAt(0) || "S"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-black text-sm truncate uppercase tracking-tight">{owner.full_name}</h5>
            <p className="text-xs text-slate-400 truncate font-medium">{owner.email}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="bg-primary/20 text-primary-foreground text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                SALON SAHİBİ
              </span>
              <span className="bg-white/10 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                AKTİF
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
