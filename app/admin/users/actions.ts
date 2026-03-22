'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function adminCreateUserAction(formData: {
    email: string;
    full_name: string;
    phone?: string;
    role: string;
    password?: string;
}) {
    try {
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: formData.email,
            password: formData.password || 'TemporaryPassword123!',
            email_confirm: true,
            user_metadata: {
                full_name: formData.full_name,
                first_name: formData.full_name.split(' ')[0],
                last_name: formData.full_name.split(' ').slice(1).join(' '),
                role: formData.role
            }
        });

        if (authError) throw authError;

        // Note: The public.profiles trigger will handle profile creation automatically.
        // But we might want to ensure it's updated if metadata didn't fire correctly.
        
        revalidatePath('/admin/users');
        return { success: true, user: authData.user };
    } catch (error: any) {
        console.error('Admin Create User Error:', error);
        return { success: false, error: error.message };
    }
}

export async function adminUpdateUserAuthAction(userId: string, updates: {
    email?: string;
    phone?: string;
    password?: string;
}) {
    try {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            email: updates.email,
            phone: updates.phone,
            password: updates.password
        });

        if (error) throw error;
        
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('Admin Update Auth Error:', error);
        return { success: false, error: error.message };
    }
}

export async function adminDeleteUserAuthAction(userId: string) {
    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw error;
        
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('Admin Delete Auth Error:', error);
        return { success: false, error: error.message };
    }
}
