import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

async function run() {
    const { data: profiles, error } = await supabase.from('profiles').select('email, role')
    if (error) {
        fs.writeFileSync('tmp/profiles.txt', 'Error: ' + JSON.stringify(error))
        return
    }
    const output = profiles.map(p => `${p.email} [${p.role}]`).join('\n')
    fs.writeFileSync('tmp/profiles.txt', output)
}

run()
