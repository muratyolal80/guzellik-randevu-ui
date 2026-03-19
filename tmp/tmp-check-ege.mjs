import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkEgeSpa() {
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('id', '6baba140-5ba8-4787-b162-dd2240590cb4')
    .single()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('--- EGE SPA CENTER ---')
  console.log(`Name: ${data.name}`)
  console.log(`Status: ${data.status}`)
  console.log(`Is Sponsored: ${data.is_sponsored}`)
}

checkEgeSpa()
