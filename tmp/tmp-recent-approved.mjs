import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugRecentlyApproved() {
  const { data, error } = await supabase
    .from('salons')
    .select('id, name, status, updated_at, owner_id')
    .eq('status', 'APPROVED')
    .order('updated_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('--- RECENTLY APPROVED SALONS ---')
  data.forEach(s => {
    console.log(`- "${s.name}" (ID: ${s.id}) - Approved/Updated: ${s.updated_at}`)
  })
}

debugRecentlyApproved()
