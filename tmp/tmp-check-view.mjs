import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkView() {
  const { data, error } = await supabase
    .from('salon_details')
    .select('id, name, status')
    .limit(20)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('--- SALON_DETAILS VIEW ---')
  data.forEach(s => {
    console.log(`[${s.status}] "${s.name}" (ID: ${s.id})`)
  })
}

checkView()
