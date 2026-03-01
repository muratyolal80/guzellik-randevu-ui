import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Testing HomeClient queries...");
    try {
        const req1 = await supabase.from('salon_details').select('*').eq('status', 'APPROVED').order('is_sponsored', { ascending: false }).order('average_rating', { ascending: false });
        if (req1.error) console.error("SalonDataService.getSalons error:", req1.error);
        else console.log("getSalons success", req1.data.length);

        const req2 = await supabase.from('salon_types').select('*').order('name');
        if (req2.error) console.error("MasterDataService.getSalonTypes error:", req2.error);
        else console.log("getSalonTypes success", req2.data.length);

        const req3 = await supabase.from('global_services').select('*').order('name');
        if (req3.error) console.error("MasterDataService.getAllGlobalServices error:", req3.error);
        else console.log("getAllGlobalServices success", req3.data.length);

        const req4 = await supabase.from('cities').select('*').order('name');
        if (req4.error) console.error("MasterDataService.getCities error:", req4.error);
        else console.log("getCities success", req4.data.length);

        const req5 = await supabase.from('salon_service_details').select('salon_id, service_name');
        if (req5.error) console.error("ServiceService.getAllSalonServices error:", req5.error);
        else console.log("getAllSalonServices success", req5.data.length);

    } catch (e) {
        console.error("Exception:", e);
    }
}

test();
