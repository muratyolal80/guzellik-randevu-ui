'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Çağıran kullanıcının SUPER_ADMIN olduğunu doğrular.
// Middleware yalnızca sayfa yönlendirmesini korur; server action endpoint'leri
// /_next/action/<id> üzerinden doğrudan çağrılabilir, bu yüzden burada da kontrol şart.
async function requireSuperAdmin(): Promise<{ authorized: true } | { authorized: false; error: string }> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: () => {},
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { authorized: false, error: 'Oturum açılmamış.' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'SUPER_ADMIN') {
        return { authorized: false, error: 'Bu işlem için yetkiniz yok.' };
    }

    return { authorized: true };
}

export async function adminCreateUserAction(formData: {
    email: string;
    full_name: string;
    phone?: string;
    role: string;
    password?: string;
}) {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) return { success: false, error: auth.error };

    try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: formData.email,
            password: formData.password || 'TemporaryPassword123!',
            email_confirm: true,
            user_metadata: {
                full_name: formData.full_name,
                first_name: formData.full_name.split(' ')[0],
                last_name: formData.full_name.split(' ').slice(1).join(' '),
                role: formData.role,
                phone: formData.phone
            }
        });

        if (authError) throw authError;

        revalidatePath('/admin/users');
        return { success: true, user: authData.user };
    } catch (error: any) {
        console.error('Admin Create User Error:', error);
        return { success: false, error: error.message || 'Kullanıcı oluşturulamadı.' };
    }
}

export async function adminUpdateUserAuthAction(userId: string, updates: {
    email?: string;
    phone?: string;
    password?: string;
}) {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) return { success: false, error: auth.error };

    try {
        const updateParams: any = {};
        if (updates.email) updateParams.email = updates.email;
        if (updates.phone) updateParams.phone = updates.phone;
        if (updates.password) updateParams.password = updates.password;

        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, updateParams);

        if (error) throw error;

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('Admin Update Auth Error:', error);
        return { success: false, error: error.message || 'Kullanıcı bilgileri güncellenemedi.' };
    }
}

export async function adminDeleteUserAuthAction(userId: string) {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) return { success: false, error: auth.error };

    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw error;

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('Admin Delete Auth Error:', error);
        return { success: false, error: error.message || 'Kullanıcı silinemedi.' };
    }
}
