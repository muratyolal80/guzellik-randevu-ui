import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/types';

// Role constants for type safety
const ROLES = {
    CUSTOMER: 'CUSTOMER' as UserRole,
    STAFF: 'STAFF' as UserRole,
    SALON_OWNER: 'SALON_OWNER' as UserRole,
    SUPER_ADMIN: 'SUPER_ADMIN' as UserRole,
};

interface AuthContextType {
    user: Profile | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string, fullName?: string) => Promise<{ user: any; session: any } | undefined>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isAdmin: boolean;
    isStaff: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch profile from database
    const fetchProfile = async (userId: string, retryCount = 0): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Handle "not found" error - profile might not be created yet by trigger
                if (error.code === 'PGRST116' && retryCount < 3) {
                    // Profile not found, retry
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return fetchProfile(userId, retryCount + 1);
                }

                // Only log if it's a real error (not just "not found")
                if (error.code !== 'PGRST116') {
                    console.warn('Profile fetch error:', error.message);
                }
                return null;
            }

            return data as Profile;
        } catch (err) {
            // Only log unexpected errors
            if (err instanceof Error) {
                console.warn('Unexpected profile fetch error:', err.message);
            }
            return null;
        }
    };

    // Create profile manually if trigger failed
    const createProfileManually = async (user: any): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || null,
                    avatar_url: user.user_metadata?.avatar_url || null,
                    role: ROLES.CUSTOMER
                })
                .select()
                .single();

            if (error) {
                // If duplicate key, try to fetch existing profile
                if (error.code === '23505') {
                    return await fetchProfile(user.id, 0);
                }
                console.warn('Profile creation error:', error.message);
                return null;
            }

            return data as Profile;
        } catch (err) {
            if (err instanceof Error) {
                console.warn('Unexpected profile creation error:', err.message);
            }
            return null;
        }
    };

    const refreshUser = useCallback(async () => {
        try {
            // Force refresh session from server
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;

            if (session?.user) {
                let profile = await fetchProfile(session.user.id);

                // If profile doesn't exist after retries, try to create it manually
                if (!profile) {
                    profile = await createProfileManually(session.user);
                }

                // Set user with profile data or fallback to session data
                if (profile) {
                    setUser(profile);
                } else {
                    // Last resort fallback
                    setUser({
                        id: session.user.id,
                        email: session.user.email!,
                        role: ROLES.CUSTOMER,
                        full_name: session.user.user_metadata?.full_name,
                        avatar_url: session.user.user_metadata?.avatar_url
                    });
                }
            } else {
                setUser(null); // Explicitly set to null when no session
            }
        } catch (error) {
            console.error('[AuthContext] Session check error:', error);
            setUser(null); // Also clear user on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth State Change:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    let profile = await fetchProfile(session.user.id);

                    // If profile still doesn't exist after retries, try to create it manually
                    if (!profile) {
                        profile = await createProfileManually(session.user);
                    }

                    // Set user with profile data or fallback to session data
                    const userData = profile || {
                        id: session.user.id,
                        email: session.user.email!,
                        role: ROLES.CUSTOMER,
                        full_name: session.user.user_metadata?.full_name,
                        avatar_url: session.user.user_metadata?.avatar_url
                    };

                    setUser(userData);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
            
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [refreshUser]);

    const signInWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }
        // State update handled by onAuthStateChange
    };

    const signUp = async (email: string, password: string, fullName?: string) => {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:3000/';

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'CUSTOMER',
                },
                emailRedirectTo: redirectUrl,
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        // User is automatically logged in after signUp (if email confirmation is disabled)
        // Profile will be created automatically by database trigger
        // Return data for immediate use if needed
        return data;
    };

    const signInWithGoogle = async () => {
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

        if (error) {
            throw new Error(error.message);
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
        } else {
            setUser(null);
            router.push('/'); // Redirect to home page after sign out
            router.refresh(); // Ensure server components re-render
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signInWithEmail,
            signInWithGoogle,
signUp,
            signOut,
            refreshUser,
            isAdmin: user?.role === 'SUPER_ADMIN' || user?.role === 'SALON_OWNER',
            isStaff: user?.role === 'STAFF',
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);