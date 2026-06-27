import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

async function run() {
    console.log('--- Database Migration Audit ---')
    
    // 1. Check is_active in profiles
    const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { t_name: 'profiles' })
    if (colError) {
        // Fallback to direct query
        const { data: colData } = await supabase.from('profiles').select('*').limit(1)
        if (colData && colData.length > 0) {
           const hasIsActive = 'is_active' in colData[0]
           console.log('profiles has is_active:', hasIsActive)
        }
    } else {
        console.log('Columns in profiles:', cols)
    }

    // 2. Check if function exists
    const { data: func, error: funcError } = await supabase.rpc('check_function_exists', { f_name: 'admin_delete_user_cascade' })
    console.log('admin_delete_user_cascade exists:', !!func)

    // 3. User Role Enum
    const { data: userRoleEnum } = await supabase.rpc('get_enum_values', { enum_name: 'user_role' })
    console.log('user_role enum values:', userRoleEnum)
}

run()
