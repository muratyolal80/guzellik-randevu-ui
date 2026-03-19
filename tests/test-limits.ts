import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = 'http://127.0.0.1:8000';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY3MzcyMTU3LCJleHAiOjE5MjUwNTIxNTd9.Frv7rg6d7kXV1-sEDew5aIkGDk6xE1vE0UvM1Bo6tvU';

const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

async function checkSalonLimits() {
    const salonId = "4dfeca52-fb3f-4f44-9a4c-6857ce2aaf3b";

    console.log("Checking limits for salon:", salonId);

    // 1. Check subscriptions
    const { data: sub, error: subError } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    console.log("Subscription Record:");
    if (subError) console.error(subError);
    else console.log(JSON.stringify(sub, null, 2) || "NO SUBSCRIPTION FOUND");

    // 2. Check current gallery count
    const { count, error: countError } = await supabase
        .from("salon_gallery")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId);

    console.log("Current Photo Count:", count);
    if (countError) console.error(countError);
}

checkSalonLimits();
