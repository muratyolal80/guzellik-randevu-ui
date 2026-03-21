import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmptyStrings() {
  console.log('--- Checking for Empty String UUIDs in salons table ---');
  
  // Note: We can't easily query for empty strings in UUID columns if they are truly UUID type,
  // but let's try to fetch all salons and check in JS.
  const { data: salons, error } = await supabase.from('salons').select('*');
  
  if (error) {
    console.error('Error fetching salons:', error.message);
    return;
  }

  console.log(`Checking ${salons.length} salons...`);
  salons.forEach(s => {
    const issues = [];
    if (s.city_id === '') issues.push('city_id is ""');
    if (s.district_id === '') issues.push('district_id is ""');
    if (s.primary_type_id === '') issues.push('primary_type_id is ""');
    
    if (issues.length > 0) {
      console.log(`Salon [${s.id}] "${s.name}" has issues:`, issues);
    }
  });

  console.log('--- Checking salon_details view directly ---');
  const { data: viewData, error: viewError } = await supabase.from('salon_details').select('*').limit(1);
  if (viewError) {
    console.log('❌ salon_details view error:', viewError.message);
  } else {
    console.log('✅ salon_details view is working (returned 1 row or empty)');
  }
}

checkEmptyStrings();
