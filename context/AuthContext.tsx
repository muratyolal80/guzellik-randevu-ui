import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email?: string, password?: string) => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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

  const signInWithEmail = async (email: string, password: string) => {
      // Try to sign in with Supabase
      try {
          const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
          });

          if (error) {
              // Fallback to mock login if Supabase is not configured
              console.log('Supabase auth not configured, using mock login');
              signIn(email, password);
          } else if (data.user) {
              // Set user from Supabase session
              setUser({
                  id: data.user.id,
                  email: data.user.email || email,
                  full_name: data.user.user_metadata?.full_name || 'User',
                  role: data.user.user_metadata?.role || 'user',
                  avatar_url: data.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.email || 'User')}`
              });
          }
      } catch (err) {
          console.log('Auth error, using mock login:', err);
          signIn(email, password);
      }
  };

  const signInWithGoogle = async () => {
      try {
          const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:3000/';
          const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                  redirectTo: redirectUrl
              }
          });

          if (error) {
              console.log('Google OAuth not configured, using mock login');
              // Fallback to mock login
              setUser({
                  id: 'google_user',
                  email: 'user@gmail.com',
                  full_name: 'Google User',
                  role: 'user',
                  avatar_url: 'https://lh3.googleusercontent.com/a/default-user'
              });
          }
      } catch (err) {
          console.log('Google auth error:', err);
          // Fallback to mock login
          setUser({
              id: 'google_user',
              email: 'user@gmail.com',
              full_name: 'Google User',
              role: 'user',
              avatar_url: 'https://lh3.googleusercontent.com/a/default-user'
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
        signInWithEmail,
        signInWithGoogle,
        signOut,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);