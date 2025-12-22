import React from 'react';
import Link from 'next/link';
import { Salon, Staff, Service, SalonServiceDetail, SalonDetail } from '@/types';

interface BookingSummaryProps {
  salon: Salon | SalonDetail;
  staff?: Staff | null;
  services: Service[] | SalonServiceDetail[];
  totalPrice: number;
  totalDuration: string;
  step: number; // 1: Staff, 2: Time, 3: Confirm
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({ 
  salon, 
  staff, 
  services, 
  totalPrice, 
  totalDuration, 
  step 
}) => {
  return (
    <div className="w-full lg:w-80 shrink-0">
      <div className="sticky top-24 flex flex-col gap-4">
        
        {/* Step 3 & 4 Visuals (Salon Image Card for Time/Confirm pages) */}
        {step >= 2 && (
             <div className="rounded-xl bg-white border border-border overflow-hidden shadow-md mb-2">
             <div className="h-32 w-full bg-cover bg-center relative" style={{ backgroundImage: `url("${salon.image}")` }}>
               <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
               <div className="absolute bottom-4 left-4">
                 <h3 className="text-white text-lg font-bold leading-tight">{salon.name}</h3>
                 <div className="flex items-center gap-1 text-primary text-sm mt-1">
                   <span className="material-symbols-outlined text-[16px] fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                   <span className="font-bold">{'average_rating' in salon ? salon.average_rating : 0}</span>
                   <span className="text-gray-300 font-normal">• {'city_name' in salon ? `${salon.district_name}, ${salon.city_name}` : salon.address}</span>
                 </div>
               </div>
             </div>
           </div>
        )}

        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card flex flex-col">
          <div className="p-4 border-b border-border bg-gray-50">
            <h3 className="text-text-main font-bold text-lg">Randevu Özeti</h3>
            <p className="text-text-secondary text-xs">Seçimleriniz aşağıdadır</p>
          </div>
          
          <div className="p-4 flex flex-col gap-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {services.map((service) => {
              // Handle both Service and SalonServiceDetail types
              const serviceName = 'service_name' in service ? service.service_name : service.name;
              const serviceDuration = 'duration_min' in service ? `${service.duration_min} dk` : service.duration;
              const servicePrice = service.price;

              return (
                <div key={service.id} className="flex justify-between items-start gap-2">
                  <div className="flex flex-col">
                    <span className="text-text-main text-sm font-medium">{serviceName}</span>
                    <span className="text-text-secondary text-xs">{serviceDuration}</span>
                  </div>
                  <span className="text-primary font-bold text-sm whitespace-nowrap">{servicePrice} TL</span>
                </div>
              );
            })}

            {staff && (
              <div className="mt-2 pt-4 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-border relative">
                  <div className="size-8 rounded-full bg-cover bg-center border border-gray-200" style={{ backgroundImage: `url("${staff.image}")` }}></div>
                  <div className="flex flex-col">
                    <span className="text-text-main text-xs font-bold">{staff.name}</span>
                    <span className="text-primary text-[10px]">{staff.role}</span>
                  </div>
                  {step === 1 && (
                     <button className="ml-auto text-text-muted hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                     </button>
                  )}
                   {step === 2 && (
                       <Link href={`/booking/${salon.id}/staff`} className="ml-auto text-primary text-[10px] font-bold hover:underline">Değiştir</Link>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-text-secondary text-sm">Toplam Süre</span>
              <span className="text-text-main text-sm font-medium">{totalDuration}</span>
            </div>
            <div className="flex justify-between items-end mb-4">
              <span className="text-text-secondary text-sm">Toplam Tutar</span>
              <span className="text-text-main text-xl font-bold">{totalPrice} TL</span>
            </div>
            
            {step === 1 && (
                <button disabled={!staff} className={`w-full h-12 rounded-lg font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2 ${staff ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-gray-100 text-text-muted cursor-not-allowed'}`}>
                  {staff ? 'Devam Et' : 'Personel Seçiniz'}
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
            )}
            
            {step < 3 && (
                <p className="text-center text-text-muted text-[10px] mt-2">Ödeme aşamasına henüz geçilmedi.</p>
            )}
          </div>
        </div>

        {/* Help Box - Only show on step 1 */}
        {step === 1 && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 mt-0.5">help</span>
            <div>
                <p className="text-blue-900 text-sm font-bold">Yardıma mı ihtiyacınız var?</p>
                <p className="text-blue-700 text-xs mt-1">Personel seçimi konusunda kararsız kaldıysanız bizi arayabilirsiniz.</p>
                <a href="#" className="text-blue-600 text-xs font-bold mt-2 inline-block hover:underline">0212 555 01 23</a>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};