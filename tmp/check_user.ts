import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUser() {
    console.log('Checking profiles for admin roles...')
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role')
    
    if (error) {
        console.error('Error fetching profiles:', error)
        return
    }

    console.log('Profiles found:', data.length)
    data.forEach(p => {
        console.log(`- ${p.email}: ${p.role}`)
    })

    const admins = data.filter(p => p.role === 'SUPER_ADMIN' || p.role === 'ADMIN')
    if (admins.length === 0) {
        console.warn('No SUPER_ADMIN or ADMIN found!')
    }
}

checkUser()
