
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MasterService } from '@/services/db';
import { UserMenu } from './common/UserMenu';
import { SalonType, ServiceCategory } from '@/types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, signOut, isAdmin } = useAuth();
  const isBooking = pathname.includes('/booking');

  // Dynamic Menu State
  const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [servicesByCat, setServicesByCat] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchMenuData = async () => {
      const { salonTypes, categories, servicesByCatId } = await MasterService.getNavMenuData();
      setSalonTypes(salonTypes);
      setCategories(categories);
      setServicesByCat(servicesByCatId);
    };
    fetchMenuData();
  }, []);

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
          {!isBooking && isAdmin && (
            <Link href="/admin" className="hidden xl:flex items-center justify-center px-4 py-2 bg-text-main hover:bg-black text-white text-xs font-bold rounded-full shadow-lg transition-all hover:scale-105 whitespace-nowrap">
              Yönetim
            </Link>
          )}
          {!isBooking && user?.role === 'STAFF' && !isAdmin && (
            <Link href="/booking/1/staff" className="hidden xl:flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 whitespace-nowrap">
              İşletme Ekle
            </Link>
          )}

          {/* User Menu Component */}
          <UserMenu />

          <div className="lg:hidden text-text-main cursor-pointer p-2 hover:bg-surface-alt rounded-full transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </div>
        </div>

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
