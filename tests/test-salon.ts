import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = 'http://127.0.0.1:8000';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY3MzcyMTU3LCJleHAiOjE5MjUwNTIxNTd9.Frv7rg6d7kXV1-sEDew5aIkGDk6xE1vE0UvM1Bo6tvU';

const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

async function testSalons() {
    console.log("Fetching salons from salon_details view...");
    try {
        const { data, error } = await supabase
            .from("salon_details")
            .select("*")
            .eq("status", "APPROVED")
            .order("is_sponsored", { ascending: false })
            .order("average_rating", { ascending: false });

        if (error) {
            console.error("Supabase Error:", error);
            return;
        }

        console.log(`Successfully fetched ${data?.length || 0} salons.`);
        if (data && data.length > 0) {
            console.log("First salon object keys:", Object.keys(data[0]));
        } else {
            console.log("No approved salons found in the database. Are they marked as APPROVED?");
        }
    } catch (err: any) {
        console.error("Unexpected Error:", err.message || err);
    }
}

testSalons();
