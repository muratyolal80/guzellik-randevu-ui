const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
    console.log('--- Database Role Audit ---')
    
    // 1. Check Enum
    const { data: enumValues, error: enumError } = await supabase.rpc('get_enum_values', { enum_name: 'user_role' })
    if (enumError) {
        // Fallback to manual query if RPC doesn't exist
        const { data: enumData, error: enumSqlError } = await supabase.run_sql && await supabase.run_sql('SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = \'user_role\'')
        console.log('Enum values (user_role):', enumData || 'Could not fetch')
    } else {
        console.log('Enum values (user_role):', enumValues)
    }

    // 2. Check Profiles
    const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, email, role, full_name')
    
    if (profError) {
        console.error('Error fetching profiles:', profError)
        return
    }

    console.log('Total profiles:', profiles.length)
    profiles.forEach(p => {
        console.log(`- ${p.email} [${p.role}]: ${p.full_name}`)
    })

    // 3. Any 'admin' that should be 'SUPER_ADMIN'?
    const needsUpdate = profiles.filter(p => p.role.toString().toUpperCase() === 'ADMIN')
    if (needsUpdate.length > 0) {
        console.log('Updating legacy admin roles to SUPER_ADMIN...')
        for (const p of needsUpdate) {
            const { error: upError } = await supabase
                .from('profiles')
                .update({ role: 'SUPER_ADMIN' })
                .eq('id', p.id)
            if (upError) console.error(`Failed to update ${p.email}:`, upError)
            else console.log(`Updated ${p.email} to SUPER_ADMIN`)
        }
    }
}

run()
