
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkEntireFlow() {
    console.log(`🔄 Checking connection to ${supabaseUrl}...`);
    try {
        // 1. Check Salon
        const { data: salons, error: salonsError } = await supabase.from('salons').select('id, name, status').limit(5);
        if (salonsError || !salons?.length) {
            console.error('❌ Salons Query Error:', salonsError);
            return;
        }
        console.log(`✅ Salons found:`, salons.map(s => `${s.name} (${s.status})`));
        const salonId = salons[0].id;

        // 2. Check Staff
        const { data: staff, error: staffError } = await supabase.from('staff').select('id, name').eq('salon_id', salonId).limit(1);
        if (staffError || !staff?.length) {
            console.error('❌ Staff Query Error or no staff found:', staffError);
            return;
        }
        const staffId = staff[0].id;
        console.log(`✅ Staff: ${staff[0].name} (${staffId})`);

        // 3. Check Working Hours
        const dayOfWeek = new Date().getDay();
        const { data: hours, error: hoursError } = await supabase
            .from('working_hours')
            .select('*')
            .eq('staff_id', staffId)
            .eq('day_of_week', dayOfWeek);

        if (hoursError) {
            console.error('❌ Working Hours Error:', hoursError);
        } else {
            console.log(`✅ Working Hours for staff (Day ${dayOfWeek}):`, hours.length > 0 ? hours : 'NONE FOUND');
        }

        // 4. Check Services
        const { data: services, error: servicesError } = await supabase
            .from('salon_services')
            .select('id, service_name, duration_min')
            .eq('salon_id', salonId)
            .limit(1);

        if (servicesError || !services?.length) {
            console.error('❌ Services Query Error:', servicesError);
        } else {
            console.log(`✅ Service: ${services[0].service_name} (${services[0].id}) Duration: ${services[0].duration_min}min`);
        }

    } catch (err) {
        console.error('❌ Check Failed Exception:', err);
    }
}

checkEntireFlow();
