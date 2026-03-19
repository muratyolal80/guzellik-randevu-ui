import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSalon() {
  const { data, error } = await supabase
    .from('salons')
    .select('id, name, status, is_sponsored')
    .limit(10)

  if (error) {
    console.error('Error fetching salon:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('Found salons:')
    data.forEach(salon => {
      console.log(`- ID: ${salon.id}, Name: ${salon.name}, Status: ${salon.status}, Is Sponsored: ${salon.is_sponsored}`)
    })
  } else {
    console.log('No salon found with name containing "ethan"')
  }
}

checkSalon()
