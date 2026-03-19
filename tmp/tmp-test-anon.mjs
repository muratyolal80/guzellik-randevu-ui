import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAnonAccess() {
  console.log('Testing anon access to salon_details...')
  const { data, error } = await supabase
    .from('salon_details')
    .select('id, name')
    .limit(5)

  if (error) {
    console.error('Anon Error:', error.message)
    console.error('Details:', error.details)
  } else {
    console.log('Anon Success! Found:', data.length, 'salons')
  }
}

testAnonAccess()
