
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, signOut } = useAuth();
    const location = useLocation();

    const menuItems = [
        { icon: 'dashboard', label: 'Panel', path: '/admin' },
        { icon: 'category', label: 'Salon Tipleri', path: '/admin/types' },
        { icon: 'store', label: 'Salonlar', path: '/admin/salons' },
        { icon: 'spa', label: 'Hizmet Tipleri', path: '/admin/service-types' },
        { icon: 'cut', label: 'Hizmetler', path: '/admin/services' },
        { icon: 'sms', label: 'İYS Kayıtları', path: '/admin/iys-logs' },
        { icon: 'settings', label: 'Ayarlar', path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-border flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-border flex items-center gap-2">
                    <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white font-display font-bold text-xl">A</div>
                    <div>
                        <h1 className="font-display font-bold text-lg text-text-main leading-none">Yönetim</h1>
                        <span className="text-xs text-text-secondary">Güzellik Randevu Admin</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path} 
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-white font-bold shadow-md' : 'text-text-secondary hover:bg-gray-50 hover:text-primary'}`}
                            >
                                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{item.icon}</span>
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                         <div className="size-8 rounded-full bg-gray-200 bg-cover" style={{backgroundImage: `url('${user?.avatar_url}')`}}></div>
                         <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-text-main truncate">{user?.full_name}</p>
                             <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                         </div>
                    </div>
                    <button onClick={signOut} className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
                        <span className="material-symbols-outlined text-lg">logout</span> Çıkış Yap
                    </button>
                    <Link to="/" className="w-full flex items-center gap-2 px-4 py-2 text-text-secondary hover:bg-gray-50 rounded-lg transition-colors text-sm mt-1">
                        <span className="material-symbols-outlined text-lg">home</span> Siteye Dön
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};
