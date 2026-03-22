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
    console.log('Promoting myolal@gmail.com to SUPER_ADMIN...')
    const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'SUPER_ADMIN' })
        .eq('email', 'myolal@gmail.com')
        .select()
    
    if (error) {
        console.error('Error promoting user:', error)
        return
    }

    if (data && data.length > 0) {
        console.log('Success! User promoted:', data[0].email, data[0].role)
    } else {
        console.warn('User not found or no change made.')
    }
}

run()
