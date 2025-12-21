import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MOCK_SALONS, MOCK_STAFF, MOCK_SERVICES } from '../../constants';
import { Layout } from '../../components/Layout';
import { BookingSummary } from '../../components/BookingSummary';
import { GeminiChat } from '../../components/GeminiChat';

export const StaffSelection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const salon = MOCK_SALONS.find(s => s.id === id) || MOCK_SALONS[0];
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const selectedStaff = selectedStaffId ? MOCK_STAFF.find(s => s.id === selectedStaffId) : null;
  // Mock selected services (normally comes from context)
  const selectedServices = MOCK_SERVICES.slice(0, 2); 
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = "1 saat 5 dk";

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaffId(staffId);
  };

  const handleNext = () => {
      if (selectedStaffId) {
          navigate(`/booking/${id}/time`);
      }
  };

  return (
    <Layout>
      <div className="layout-container px-4 md:px-10 py-8 max-w-[1440px] mx-auto w-full bg-background min-h-screen">
        {/* Stepper */}
        <div className="mb-8 w-full max-w-[960px] mx-auto">
          <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
            <span className="text-text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-green-500">check_circle</span>
              Hizmetler
            </span>
            <span className="material-symbols-outlined text-text-muted text-sm">chevron_right</span>
            <span className="text-primary font-bold flex items-center gap-1">
              <span className="flex items-center justify-center size-5 rounded-full bg-primary text-white text-xs font-bold">2</span>
              Personel Seçimi
            </span>
            <span className="material-symbols-outlined text-text-muted text-sm">chevron_right</span>
            <span className="text-text-muted">Randevu Zamanı</span>
            <span className="material-symbols-outlined text-text-muted text-sm">chevron_right</span>
            <span className="text-text-muted">Onay</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 w-full justify-center">
          <div className="flex-1 flex flex-col max-w-[960px] relative pb-24">
            <div className="mb-8">
              <h1 className="text-text-main text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">Uzmanını Seç</h1>
              <p className="text-text-secondary text-base font-normal">Seçtiğiniz hizmetler için uygun profesyonellerimiz.</p>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
               <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary text-white px-4 transition-transform active:scale-95 font-bold text-sm shadow-md">Tüm Personel</button>
               <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-border hover:border-primary text-text-secondary hover:text-primary px-4 transition-colors text-sm font-medium shadow-sm"><span className="material-symbols-outlined text-[18px]">star</span>En Yüksek Puan</button>
               <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-border hover:border-primary text-text-secondary hover:text-primary px-4 transition-colors text-sm font-medium shadow-sm"><span className="material-symbols-outlined text-[18px]">workspace_premium</span>Kıdemli Uzman</button>
            </div>

            {/* Any Staff Option */}
            <div className="mb-8">
               <div 
                  onClick={() => handleStaffSelect('any')} 
                  className={`group cursor-pointer relative overflow-hidden rounded-xl border transition-all duration-300 shadow-sm ${selectedStaffId === 'any' ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-white border-border hover:border-primary/50 hover:shadow-md'}`}
                >
                  <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                           <span className="material-symbols-outlined !text-3xl">bolt</span>
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors">Herhangi Bir Personel</h3>
                           <p className="text-text-secondary text-sm mt-1">En erken uygunluk için otomatik atama yapılır.</p>
                        </div>
                     </div>
                     {selectedStaffId === 'any' && (
                        <div className="shrink-0 h-10 px-6 rounded-lg bg-primary text-white font-bold text-sm flex items-center gap-2 justify-center animate-fade-in-up shadow-md">
                            Seçildi <span className="material-symbols-outlined text-[18px]">check</span>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {MOCK_STAFF.map((s) => (
                  <div 
                    key={s.id} 
                    onClick={() => handleStaffSelect(s.id)} 
                    className={`group bg-white rounded-xl border overflow-hidden transition-all duration-300 flex flex-col cursor-pointer relative ${selectedStaffId === s.id ? 'border-primary ring-1 ring-primary shadow-md scale-[1.02]' : 'border-border hover:border-primary/50 hover:shadow-lg'}`}
                  >
                     {selectedStaffId === s.id && (
                        <div className="absolute top-3 right-3 text-primary z-10">
                            <span className="material-symbols-outlined filled">check_circle</span>
                        </div>
                     )}
                     <div className="p-5 flex gap-4">
                        <div className="relative shrink-0">
                           <div className="size-20 rounded-full bg-cover bg-center border border-gray-100 shadow-inner" style={{ backgroundImage: `url("${s.image}")` }}></div>
                           {s.isOnline && <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white size-4 rounded-full" title="Online"></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start">
                              <h3 className="text-lg font-bold text-text-main truncate">{s.name}</h3>
                              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded text-xs font-bold text-yellow-600 border border-yellow-100">
                                 <span className="material-symbols-outlined text-[14px] filled">star</span> {s.rating}
                              </div>
                           </div>
                           <p className="text-primary text-sm font-medium mb-1">{s.role}</p>
                           <p className="text-text-secondary text-xs line-clamp-2">{s.specialty} konusunda uzman.</p>
                        </div>
                     </div>
                     <div className={`mt-auto border-t p-3 transition-colors ${selectedStaffId === s.id ? 'border-primary/20 bg-primary/5' : 'border-border bg-gray-50'}`}>
                        <button className={`w-full h-9 rounded font-bold text-sm transition-colors flex items-center justify-center gap-2 ${selectedStaffId === s.id ? 'bg-primary text-white shadow-sm' : 'bg-white border border-border text-text-secondary group-hover:bg-primary group-hover:text-white group-hover:border-primary'}`}>
                           {selectedStaffId === s.id ? 'Seçildi' : 'Seç'}
                        </button>
                     </div>
                  </div>
               ))}
            </div>
            
            {/* Fixed Bottom Next Button Container */}
             <div className={`fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border p-4 flex justify-center z-50 transition-transform duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] ${selectedStaffId ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="w-full max-w-[960px] flex justify-between items-center px-4">
                    <div className="hidden md:flex flex-col">
                        <span className="text-text-secondary text-xs">Seçilen Personel</span>
                        <span className="text-text-main font-bold">{selectedStaffId === 'any' ? 'Herhangi Bir Personel' : selectedStaff?.name}</span>
                    </div>
                    <button 
                        onClick={handleNext}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-primary/40 transition-all text-lg"
                    >
                      Devam Et
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>

          </div>

          <BookingSummary 
             salon={salon} 
             services={selectedServices} 
             staff={selectedStaffId === 'any' ? { id: 'any', name: 'Herhangi Bir Personel', role: 'Otomatik Atama', rating: 0, image: 'https://i.pravatar.cc/150?u=any', specialty: '' } : selectedStaff}
             totalPrice={totalPrice}
             totalDuration={totalDuration}
             step={1}
          />
        </div>
      </div>
      <GeminiChat />
    </Layout>
  );
};