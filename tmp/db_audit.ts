import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
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
    
    // Check Profiles
    const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, email, role, full_name')
    
    if (profError) {
        console.error('Error fetching profiles:', profError)
        return
    }

    console.log('Total profiles:', profiles.length)
    const adminProfiles = profiles.filter(p => 
        p.role === 'SUPER_ADMIN' || 
        p.role === 'ADMIN' || 
        p.email.includes('admin')
    )

    if (adminProfiles.length === 0) {
        console.log('No admins found in top profiles. Listing first 5:')
        profiles.slice(0, 5).forEach(p => console.log(`- ${p.email} [${p.role}]`))
    } else {
        adminProfiles.forEach(p => {
            console.log(`- ${p.email} [${p.role}]: ${p.full_name}`)
        })
    }

    // Check if any profile has 'admin' (lowercase) or 'ADMIN' as a string
    // even if it's not in the enum (though that shouldn't happen)
}

run()
