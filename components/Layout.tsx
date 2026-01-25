
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useActiveSalon } from '@/context/ActiveSalonContext';
import { MasterService, SalonDataService, NotificationService } from '@/services/db';
import { UserMenu } from './common/UserMenu';
import { SalonType, ServiceCategory, SalonDetail, Notification } from '@/types';
import {
  Building2,
  ChevronDown,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut, isAdmin, isOwner } = useAuth();
  const { activeSalon, setActiveSalon } = useActiveSalon();
  const pathname = usePathname();
  const isBooking = pathname.includes('/booking');

  // Dynamic Menu State
  const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [servicesByCat, setServicesByCat] = useState<Record<string, string[]>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Multi-Branch State
  const [mySalons, setMySalons] = useState<SalonDetail[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  useEffect(() => {
    const fetchMenuData = async () => {
      const { salonTypes, categories, servicesByCatId } = await MasterService.getNavMenuData();
      setSalonTypes(salonTypes);
      setCategories(categories);
      setServicesByCat(servicesByCatId);
    };

    const fetchOwnerData = async () => {
      if (isOwner && user) {
        try {
          const salons = await SalonDataService.getSalonsByMembership(user.id);
          setMySalons(salons);

          // Notifications
          const notifs = await NotificationService.getNotifications(user.id);
          setNotifications(notifs);

          // Auto-select if none selected
          if (!activeSalon && salons.length > 0) {
            setActiveSalon(salons[0]);
          }
        } catch (err) {
          console.error('Error fetching owner data for layout:', err);
        }
      }
    };

    fetchMenuData();
    fetchOwnerData();
  }, [isOwner, user, activeSalon, setActiveSalon]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border bg-surface/90 backdrop-blur-md px-4 md:px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-10 flex items-center justify-center bg-primary rounded-full text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <span className="font-display font-bold text-xl">G</span>
            </div>
            <h2 className="text-text-main text-2xl font-display font-bold leading-tight tracking-[-0.015em] hidden sm:block">
              Güzellik <span className="text-primary">Randevu</span>
            </h2>
          </Link>
        </div>

        {/* Central Navigation with Dynamic Dropdowns */}
        <nav className="hidden lg:flex items-center gap-1 mx-4">

          {/* 1. Salonlar Dropdown (Salon Types) */}
          <div className="relative group px-3 py-3">
            <Link
              href="/"
              className={`text-sm font-bold transition-colors flex items-center gap-1 group-hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-text-secondary'}`}
              suppressHydrationWarning
            >
              Salonlar
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </Link>

            <div className="absolute top-full left-0 mt-0 w-64 bg-surface border border-border rounded-xl shadow-soft opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
              <div className="py-2">
                <Link href="/?type=all" className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-alt hover:text-primary hover:pl-5 transition-all font-bold">Tüm Salonlar</Link>
                {salonTypes.map((type) => (
                  <Link
                    key={type.id}
                    href={`/?type=${type.slug}`}
                    className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-alt hover:text-primary hover:pl-5 transition-all"
                  >
                    {type.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Service Categories (Dynamic) */}
          {categories.map((cat, index) => {
            const services = servicesByCat[cat.id] || [];
            const hasDropdown = services.length > 0;

            // Handle dropdown positioning for items on the right side of the screen
            const isRightAligned = index > 3;

            if (hasDropdown) {
              return (
                <div key={cat.id} className="relative group px-2 py-3">
                  <Link
                    href={`/?search=${encodeURIComponent(cat.name)}`}
                    className="text-sm font-medium text-text-secondary hover:text-primary transition-colors flex items-center gap-0.5"
                  >
                    {cat.name}
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </Link>
                  <div className={`absolute top-full mt-0 w-64 bg-surface border border-border rounded-xl shadow-soft opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform overflow-hidden z-50 max-h-[80vh] overflow-y-auto custom-scrollbar ${isRightAligned ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}`}>
                    <div className="py-2">
                      <Link href={`/?search=${encodeURIComponent(cat.name)}`} className="block px-4 py-2 text-sm font-bold text-text-main hover:bg-surface-alt hover:pl-5 transition-all border-b border-gray-100">
                        Tüm {cat.name} Hizmetleri
                      </Link>
                      {services.map((serviceName, idx) => (
                        <Link
                          key={idx}
                          href={`/?search=${encodeURIComponent(serviceName)}`}
                          className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-alt hover:text-primary hover:pl-5 transition-all"
                        >
                          {serviceName}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // Simple Link for categories without services
            return (
              <Link
                key={cat.id}
                href={`/?search=${encodeURIComponent(cat.name)}`}
                className="px-2 py-3 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
              >
                {cat.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 justify-end gap-3 items-center shrink-0">

          {/* OWNER: Branch Selector */}
          {isOwner && mySalons.length > 0 && (
            <div className="relative group/branch hidden xl:flex">
              <button
                onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-all font-sans"
              >
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm border border-primary/10">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start leading-none pr-1">
                  <span className="text-[9px] font-black text-primary/60 uppercase tracking-tighter">Aktif Şube</span>
                  <span className="text-xs font-black text-text-main truncate max-w-[100px]">
                    {activeSalon?.name || 'Seçiniz'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-primary/60 transition-transform ${isBranchMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isBranchMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-border rounded-2xl shadow-xl z-[100] p-2 animate-in slide-in-from-top-2 duration-200">
                  <p className="px-4 py-2 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-gray-50 mb-1">Şubeleriniz</p>
                  <div className="max-h-64 overflow-y-auto no-scrollbar space-y-1">
                    {mySalons.map(salon => (
                      <button
                        key={salon.id}
                        onClick={() => {
                          setActiveSalon(salon);
                          setIsBranchMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeSalon?.id === salon.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-text-secondary'}`}
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-sm font-black">{salon.name}</span>
                          <span className="text-[10px] font-bold opacity-60 italic">{salon.city_name}</span>
                        </div>
                        {activeSalon?.id === salon.id && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-50">
                    <Link
                      href="/owner/onboarding"
                      className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-gray-50 text-text-main text-xs font-black uppercase tracking-wider hover:bg-gray-100 transition-all border border-dashed border-gray-300"
                    >
                      <span className="text-lg leading-none">+</span> Yeni Şube Ekle
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Specific Icons (Notif etc) */}
          {user && (
            <div className="relative group/notif">
              <button
                onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                className="relative p-2.5 bg-gray-50 rounded-xl hover:bg-white border border-transparent hover:border-border transition-all shadow-sm"
              >
                <Bell className="w-5 h-5 text-text-secondary" />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white ring-1 ring-primary/20 animate-pulse"></span>
                )}
              </button>

              {isNotifMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-border rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Bildirimler</h3>
                    <span className="text-[10px] font-black text-white bg-primary px-2 py-0.5 rounded-full">{notifications.filter(n => !n.is_read).length} YENİ</span>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map(n => (
                        <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-primary/[0.02]' : ''}`}>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                              {n.type === 'SYSTEM' ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-black text-text-main leading-tight">{n.title}</p>
                              <p className="text-[11px] text-text-secondary leading-normal line-clamp-2">{n.message}</p>
                              <p className="text-[9px] font-bold text-text-muted uppercase mt-1">Bildirim Zamanı</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center grayscale opacity-30">
                        <Bell className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs font-bold italic tracking-wide">Henüz bildirim yok.</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50/50">
                    <button className="w-full py-2.5 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-white rounded-xl transition-all border border-transparent hover:border-border font-sans">
                      Tümünü Gör
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isBooking && isAdmin && (
            <Link href="/admin" className="hidden xl:flex items-center justify-center px-4 py-2 bg-text-main hover:bg-black text-white text-xs font-bold rounded-full shadow-lg transition-all hover:scale-105 whitespace-nowrap">
              Yönetim
            </Link>
          )}

          {!isBooking && isOwner && !isAdmin && (
            <Link href="/owner/dashboard" className="hidden xl:flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 whitespace-nowrap">
              İşletme
            </Link>
          )}

          {!isBooking && user?.role === 'STAFF' && !isOwner && (
            <Link href="/staff/dashboard" className="hidden xl:flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 whitespace-nowrap">
              Personel
            </Link>
          )}

          {/* User Menu Component */}
          <UserMenu />

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-text-main p-2 hover:bg-surface-alt rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        {/* Mobile Menu Overlay/Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-full max-w-[300px] bg-surface shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="size-8 bg-primary rounded-full flex items-center justify-center text-white font-display font-bold">G</div>
                  <span className="font-display font-bold text-lg text-text-main">Menü</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-text-secondary hover:text-text-main p-2"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Dashboards for logged in users */}
                {(isAdmin || isOwner || user?.role === 'STAFF') && (
                  <div className="space-y-4">
                    <p className="text-xs font-black text-text-muted uppercase tracking-wider">Panellerim</p>
                    <div className="flex flex-col gap-2">
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl bg-text-main text-white font-bold transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                          <span className="material-symbols-outlined">admin_panel_settings</span>
                          Yönetim Paneli
                        </Link>
                      )}
                      {isOwner && (
                        <Link href="/owner/dashboard" className="flex items-center gap-3 p-3 rounded-xl bg-primary text-white font-bold transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                          <span className="material-symbols-outlined">storefront</span>
                          İşletme Paneli
                        </Link>
                      )}
                      {user?.role === 'STAFF' && !isOwner && (
                        <Link href="/staff/dashboard" className="flex items-center gap-3 p-3 rounded-xl bg-primary text-white font-bold transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                          <span className="material-symbols-outlined">badge</span>
                          Personel Paneli
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-xs font-black text-text-muted uppercase tracking-wider">Kategoriler</p>
                  <div className="flex flex-col gap-1">
                    <Link href="/?type=all" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-alt text-text-main font-bold transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="material-symbols-outlined text-primary">apps</span>
                      Tüm Salonlar
                    </Link>
                    {salonTypes.map(type => (
                      <Link
                        key={type.id}
                        href={`/?type=${type.slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-alt text-text-secondary hover:text-primary font-medium transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        {type.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-black text-text-muted uppercase tracking-wider">Hizmet Alanları</p>
                  <div className="flex flex-col gap-1">
                    {categories.map(cat => (
                      <Link
                        key={cat.id}
                        href={`/?search=${encodeURIComponent(cat.name)}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-alt text-text-secondary hover:text-text-main font-medium transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px] text-text-muted">content_cut</span>
                          {cat.name}
                        </span>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-text-muted">{servicesByCat[cat.id]?.length || 0}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {!user && (
                  <div className="pt-6 border-t border-border flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="w-full py-3 text-center border-2 border-border rounded-xl text-text-main font-black hover:bg-surface-alt transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/register"
                      className="w-full py-3 text-center bg-primary text-white rounded-xl font-black hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </header>

      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>

      <footer className="border-t border-border bg-white pt-16 pb-8 mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="size-8 bg-primary rounded-full flex items-center justify-center text-white font-display text-lg font-bold">G</div>
                <span className="font-display font-bold text-xl text-text-main">Güzellik <span className="text-primary">Randevu</span></span>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary mb-6">
                Türkiye'nin en kapsamlı kişisel bakım ve güzellik platformu. Randevunuzu kolayca alın, güzelliğinize güzellik katın.
              </p>
            </div>
            <div>
              <h4 className="text-text-main font-bold mb-6">Hızlı Erişim</h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">İletişim</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Kariyer</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-text-main font-bold mb-6">Kategoriler</h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                {salonTypes.slice(0, 5).map(t => (
                  <li key={t.id}><Link href={`/?type=${t.slug}`} className="hover:text-primary transition-colors">{t.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-text-main font-bold mb-6">İşletmeler İçin</h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors">İşletme Ekle</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Yönetim Paneli</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Başarı Hikayeleri</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Destek</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-text-muted">
            <p>© 2024 Güzellik Randevu. Tüm hakları saklıdır.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">Gizlilik Politikası</a>
              <a href="#" className="hover:text-primary transition-colors">Kullanım Şartları</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
