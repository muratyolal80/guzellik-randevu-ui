import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'customer' | 'business'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
        signIn(email, password); // Pass credentials to context
        setLoading(false);
        // Admin redirect logic is handled in App.tsx or manually here if needed, 
        // but for now we redirect to home, and if they are admin, they see the Admin link
        if (email === 'info@guzellikrandevu.com.tr') {
            navigate('/admin');
        } else {
            navigate('/');
        }
    }, 1500);
  };

  const fillAdminCredentials = () => {
      setEmail('info@guzellikrandevu.com.tr');
      setPassword('admin123');
      setUserType('business');
  };

  return (
    <div className="min-h-screen flex bg-background">
        {/* Left Side - Image (Visible on large screens) */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
             <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="background" />
             <div className="absolute inset-0 bg-gray-900/40"></div>
             <div className="absolute bottom-0 left-0 p-16 text-white z-10">
                 <h2 className="text-4xl font-display font-bold mb-4">Güzelliği Keşfet</h2>
                 <p className="text-lg text-gray-200 max-w-md">Binlerce salon, uzman profesyoneller ve size özel randevu deneyimi.</p>
             </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 bg-white">
            <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 mb-6">
                        <span className="material-symbols-outlined text-primary text-3xl">spa</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-text-main tracking-tight">
                        {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        {isLogin ? 'Randevularınızı yönetmek için giriş yapın.' : 'Güzellik dünyasına adım atın.'}
                    </p>
                </div>

                <div className="mt-8">
                    {/* User Type Switcher */}
                    <div className="flex p-1 bg-gray-50 rounded-xl mb-8 border border-border">
                        <button 
                            onClick={() => setUserType('customer')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${userType === 'customer' ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200' : 'text-text-secondary hover:text-text-main'}`}
                        >
                            Müşteri
                        </button>
                        <button 
                            onClick={() => setUserType('business')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${userType === 'business' ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200' : 'text-text-secondary hover:text-text-main'}`}
                        >
                            İşletme / Uzman
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-text-main">E-posta Adresi</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 text-lg">mail</span>
                                </div>
                                <input 
                                    id="email" 
                                    name="email" 
                                    type="email" 
                                    required 
                                    className="block w-full pl-10 h-12 bg-white border border-gray-300 rounded-xl text-text-main placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm transition-colors" 
                                    placeholder="ornek@email.com (Admin: info@guzellikrandevu.com.tr)"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-text-main">Şifre</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 text-lg">lock</span>
                                </div>
                                <input 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    required 
                                    className="block w-full pl-10 h-12 bg-white border border-gray-300 rounded-xl text-text-main placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm transition-colors" 
                                    placeholder="•••••••• (Admin: admin123)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded bg-white" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">Beni hatırla</label>
                            </div>
                            {isLogin && (
                                <div className="text-sm">
                                    <a href="#" className="font-bold text-primary hover:text-primary-hover">Şifremi unuttum?</a>
                                </div>
                            )}
                        </div>

                        <div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="size-4 rounded-full border-2 border-white border-r-transparent animate-spin"></span>
                                        İşleniyor...
                                    </span>
                                ) : (
                                    isLogin ? 'Giriş Yap' : 'Kayıt Ol'
                                )}
                            </button>
                        </div>
                    </form>
                    
                    {/* Quick Admin Login for Demo */}
                    <div className="flex justify-center mt-4">
                        <button onClick={fillAdminCredentials} className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                            Demo Admin Doldur
                        </button>
                    </div>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-text-muted">Veya devam et</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors">
                                <span className="sr-only">Google</span>
                                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
                            </button>
                            <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors">
                                <span className="sr-only">Apple</span>
                                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-text-secondary">
                            {isLogin ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
                            <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-primary hover:text-primary-hover transition-colors">
                                {isLogin ? 'Hemen Kayıt Olun' : 'Giriş Yapın'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};