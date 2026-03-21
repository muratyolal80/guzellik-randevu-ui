import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase config in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostics() {
  console.log('--- Database Diagnostics ---');
  
  const tables = ['salons', 'salon_types', 'global_services', 'cities', 'districts', 'service_categories'];
  
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`Error counting ${table}:`, error.message);
    } else {
      console.log(`${table} count: ${count}`);
    }
  }

  console.log('\n--- Status Check ---');
  const { data: statusData, error: statusError } = await supabase
    .from('salons')
    .select('status, count')
    .select('status');
  
  if (statusError) {
    console.error('Error checking salon statuses:', statusError.message);
  } else {
    const statuses = statusData.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    console.log('Salon Statuses:', statuses);
  }

  console.log('\n--- View Check (salon_details) ---');
  const { count: viewCount, error: viewError } = await supabase
    .from('salon_details')
    .select('*', { count: 'exact', head: true });
  
  if (viewError) {
    console.error('Error checking salon_details view:', viewError.message);
  } else {
    console.log('salon_details (view) count:', viewCount);
  }

  console.log('\n--- UUID Check ---');
  const { data: cities } = await supabase.from('cities').select('id, name').limit(5);
  console.log('Sample Cities:', cities);

  const { data: types } = await supabase.from('salon_types').select('id, name').limit(5);
  console.log('Sample Salon Types:', types);
}

runDiagnostics();
