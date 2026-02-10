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
    signInWithEmail: (email: string, password: string) => Promise<Profile | null>;
    signInWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string, firstName: string, lastName: string, role?: UserRole) => Promise<{ user: any; session: any } | undefined>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isAdmin: boolean;
    isOwner: boolean;
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
                    first_name: user.user_metadata?.first_name || (user.user_metadata?.full_name ? user.user_metadata.full_name.split(' ')[0] : null),
                    last_name: user.user_metadata?.last_name || (user.user_metadata?.full_name ? user.user_metadata.full_name.split(' ').slice(1).join(' ') : null),
                    avatar_url: user.user_metadata?.avatar_url || null,
                    role: user.user_metadata?.role || ROLES.CUSTOMER
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
            // Force refresh session from server with a timeout
            // This prevents the app from hanging if the browser extension or network causes getSession to hang
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Session check timeout')), 5000)
            );

            const { data, error } = await Promise.race([
                supabase.auth.getSession(),
                timeoutPromise
            ]) as any;

            const session = data?.session;

            if (error) throw error;

            if (session?.user) {
                let profile = await fetchProfile(session.user.id);

                // If profile doesn't exist after retries, try to create it manually
                if (!profile) {
                    profile = await createProfileManually(session.user);
                }

                // Set user with profile data or fallback to session data
                if (profile) {
                    // Update user with profile data, ensuring phone is set if available in session but not profile
                    setUser({
                        ...profile,
                        phone: profile.phone || session.user.phone
                    });
                } else {
                    // Last resort fallback
                    setUser({
                        id: session.user.id,
                        email: session.user.email!,
                        role: (session.user.user_metadata?.role as UserRole) || ROLES.CUSTOMER,
                        first_name: session.user.user_metadata?.first_name || session.user.user_metadata?.full_name?.split(' ')[0],
                        last_name: session.user.user_metadata?.last_name || session.user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
                        avatar_url: session.user.user_metadata?.avatar_url,
                        phone: session.user.phone
                    });
                }
            } else {
                setUser(null); // Explicitly set to null when no session
            }
        } catch (error: any) {
            if (error.message === 'Session check timeout') {
                console.warn('[AuthContext] Session check timed out. Proceeding as unauthenticated.');
                // Don't clear user here immediately if we want to be optimistic, but safest is to assume no session.
                // However, falling back to unauthenticated is better than hanging.
            } else {
                console.error('[AuthContext] Session check error:', error);
            }
            setUser(null);
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
                if (event === 'SIGNED_IN') {
                    router.refresh();
                }

                if (session?.user) {
                    let profile = await fetchProfile(session.user.id);

                    // If profile still doesn't exist after retries, try to create it manually
                    if (!profile) {
                        profile = await createProfileManually(session.user);
                    }

                    // Set user with profile data or fallback to session data
                    const userData = profile ? {
                        ...profile,
                        phone: profile.phone || session.user.phone
                    } : {
                        id: session.user.id,
                        email: session.user.email!,
                        role: (session.user.user_metadata?.role as UserRole) || ROLES.CUSTOMER,
                        first_name: session.user.user_metadata?.first_name || session.user.user_metadata?.full_name?.split(' ')[0],
                        last_name: session.user.user_metadata?.last_name || session.user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
                        avatar_url: session.user.user_metadata?.avatar_url,
                        phone: session.user.phone
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

    const signInWithEmail = async (email: string, password: string): Promise<Profile | null> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }

        if (data.user) {
            // Fetch profile immediately to return it for redirection logic
            // This avoids race conditions where state hasn't updated yet
            const profile = await fetchProfile(data.user.id);

            // If profile is missing, fallback to basic user data structure like in refreshUser
            if (!profile) {
                return {
                    id: data.user.id,
                    email: data.user.email!,
                    role: (data.user.user_metadata?.role as UserRole) || ROLES.CUSTOMER,
                    first_name: data.user.user_metadata?.first_name || data.user.user_metadata?.full_name?.split(' ')[0],
                    last_name: data.user.user_metadata?.last_name || data.user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
                    avatar_url: data.user.user_metadata?.avatar_url,
                    phone: data.user.phone
                } as Profile;
            }

            return profile;
        }

        return null;
    };

    const signUp = async (email: string, password: string, firstName: string, lastName: string, role: UserRole = 'CUSTOMER') => {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:3000/';

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`, // Keep for backward compatibility if needed by generic providers
                    role: role,
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
            isAdmin: user?.role === 'SUPER_ADMIN' || (user?.role as string) === 'ADMIN',
            isOwner: user?.role === 'SALON_OWNER' || (user?.role as string) === 'OWNER' || user?.role === 'SUPER_ADMIN' || (user?.role as string) === 'ADMIN',
            isStaff: user?.role === 'STAFF',
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);