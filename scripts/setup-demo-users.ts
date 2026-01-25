import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createDemoUsers() {
    console.log('🧹 Cleaning up old demo data...');

    const demoEmails = ['admin@demo.com', 'owner@demo.com', 'staff@demo.com', 'customer@demo.com'];

    for (const email of demoEmails) {
        // Find user by email
        const { data: users, error: findError } = await supabase.auth.admin.listUsers();
        if (findError) {
            console.error('Find users error:', findError.message);
            break;
        }

        const targetUser = users.users.find(u => u.email === email);
        if (targetUser) {
            console.log(`Deleting existing user: ${email} (${targetUser.id})`);
            // Delete from profiles first (though cascade might handle it)
            await supabase.from('profiles').delete().eq('id', targetUser.id);
            // Delete from auth
            const { error: delError } = await supabase.auth.admin.deleteUser(targetUser.id);
            if (delError) console.warn(`Delete error for ${email}:`, delError.message);
        }
    }

    const demoUsers = [
        { email: 'admin@demo.com', password: 'password123', role: 'SUPER_ADMIN', name: 'Admin', last: 'User' },
        { email: 'owner@demo.com', password: 'password123', role: 'SALON_OWNER', name: 'Owner', last: 'User' },
        { email: 'staff@demo.com', password: 'password123', role: 'STAFF', name: 'Staff', last: 'User' },
        { email: 'customer@demo.com', password: 'password123', role: 'CUSTOMER', name: 'Customer', last: 'User' },
    ];

    console.log('\n🚀 Creating new demo users via Admin API...');

    for (const userDef of demoUsers) {
        const { data, error } = await supabase.auth.admin.createUser({
            email: userDef.email,
            password: userDef.password,
            email_confirm: true,
            user_metadata: {
                first_name: userDef.name,
                last_name: userDef.last,
                role: userDef.role
            }
        });

        if (error) {
            console.error(`❌ Failed to create ${userDef.email}:`, error.message);
        } else {
            console.log(`✅ Created ${userDef.email} with ID: ${data.user.id}`);

            // Explicitly set the role in public.profiles just in case trigger is not enough
            const { error: profError } = await supabase
                .from('profiles')
                .update({ role: userDef.role })
                .eq('id', data.user.id);

            if (profError) {
                // If update fails (maybe row not created yet), try insert
                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    email: userDef.email,
                    first_name: userDef.name,
                    last_name: userDef.last,
                    role: userDef.role
                });
            }
        }
    }

    console.log('\n✨ Demo Seeding Completed!');
}

createDemoUsers().catch(console.error);
