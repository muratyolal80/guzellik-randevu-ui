import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkErhan() {
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .ilike('name', '%erhan%')
    .single()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('--- ERHAN SALON ---')
  console.log(`Name: ${data.name}`)
  console.log(`Status: ${data.status}`)
  console.log(`Owner ID: ${data.owner_id}`)
}

checkErhan()
