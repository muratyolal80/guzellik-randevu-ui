import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Testing getCities...");
    const req1 = await supabase.from('cities').select('*').limit(1);
    if (req1.error) console.error("cities:", req1.error);

    console.log("Testing getSalonTypes...");
    const req2 = await supabase.from('salon_types').select('*').limit(1);
    if (req2.error) console.error("salon_types:", req2.error);

    console.log("Testing getAllGlobalServices...");
    const req3 = await supabase.from('global_services').select('*').limit(1);
    if (req3.error) console.error("global_services:", req3.error);

    console.log("Testing getSalons (salon_details)...");
    const req4 = await supabase.from('salon_details').select('*').limit(1);
    if (req4.error) console.error("salon_details:", req4.error);

    console.log("Testing getAllSalonServices...");
    const req5 = await supabase.from('salon_services').select('salon_id, service_name:global_services!inner(name)').limit(1);
    if (req5.error) console.error("salon_services:", req5.error);

    console.log("Done");
}

test();
