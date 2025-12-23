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

    // Fetch profile from database
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data as Profile;
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            return null;
        }
    };

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    if (profile) {
                        setUser(profile);
                    } else {
                        // Fallback if profile doesn't exist yet (should be handled by trigger, but just in case)
                        setUser({
                            id: session.user.id,
                            email: session.user.email!,
                            role: 'user',
                            full_name: session.user.user_metadata?.full_name,
                            avatar_url: session.user.user_metadata?.avatar_url
                        });
                    }
                }
            } catch (error) {
                console.log("Auth session check skipped or failed", error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                setUser(profile || {
                    id: session.user.id,
                    email: session.user.email!,
                    role: 'user'
                });
                setLoading(false);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = (email?: string, password?: string) => {
        // Admin Login Check (Mock)
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
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            // State update handled by onAuthStateChange
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
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                }
            });

            if (error) throw error;
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