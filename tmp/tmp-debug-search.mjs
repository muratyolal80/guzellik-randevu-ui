import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugSearch() {
  console.log('--- DEBUG SEARCH ---')
  
  // 1. Search by name (case insensitive)
  const { data: byName, error: err1 } = await supabase
    .from('salons')
    .select('id, name, status, updated_at')
    .ilike('name', '%ethan%')

  if (err1) console.error('Error 1:', err1)
  else {
    console.log(`Search by 'ethan' found ${byName.length} results:`)
    byName.forEach(s => console.log(`  - [${s.status}] "${s.name}" (ID: ${s.id})`))
  }

  // 2. Search by owner or most recent
  const { data: recent, error: err2 } = await supabase
    .from('salons')
    .select('id, name, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(10)

  if (err2) console.error('Error 2:', err2)
  else {
    console.log('\nTop 10 Most Recent Salons:')
    recent.forEach(s => console.log(`  - [${s.status}] "${s.name}" (ID: ${s.id}) Updated: ${s.updated_at}`))
  }
}

debugSearch()
