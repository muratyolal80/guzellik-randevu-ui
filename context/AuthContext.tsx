import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email?: string, password?: string) => void; 
  signOut: () => void;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
       try {
           const { data, error } = await supabase.auth.getSession();
           if (error) throw error;
           
           if (data?.session) {
               // In a real app with configured DB, fetch profile here
           }
       } catch (error) {
           console.log("Auth session check skipped or failed (likely due to missing config)");
       } finally {
           setLoading(false);
       }
    };
    checkSession();
  }, []);

  const signIn = (email?: string, password?: string) => {
      // Admin Login Check
      if (email === 'info@guzellikrandevu.com.tr' && password === 'admin123') {
          setUser({
              id: 'admin_1',
              email: 'info@guzellikrandevu.com.tr',
              full_name: 'Sistem Yöneticisi',
              role: 'admin',
              avatar_url: 'https://ui-avatars.com/api/?name=Admin&background=C59F59&color=fff'
          });
      } else {
          // Standard User Mock Login
          setUser({
              id: '123',
              email: email || 'demo@salonrandevu.com',
              full_name: 'Demo Kullanıcı',
              role: 'user', 
              avatar_url: 'https://i.pravatar.cc/150?u=123'
          });
      }
  };

  const signOut = async () => {
      await supabase.auth.signOut();
      setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        signIn, 
        signOut,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);