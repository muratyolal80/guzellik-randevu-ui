import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NotificationService } from '@/services/server-notification';

/**
 * CRON Job Endpoint
 * Can be called by Vercel Cron, GitHub Actions, or simple curl
 * 
 * GET /api/cron/reminders
 */

// Init Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
    // Security Check (simple secret)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseServiceKey) {
        return NextResponse.json({ error: 'Creation failed: Service key missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // ---------------------------------------------------------
        // 1. GENERATE REMINDERS (24 Hours Before)
        // ---------------------------------------------------------

        // Find appointments tomorrow (between 24h and 25h from now)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startRange = new Date(tomorrow.getTime()); // +24h
        startRange.setMinutes(0, 0, 0);
        const endRange = new Date(tomorrow.getTime() + 60 * 60000); // +25h

        const { data: upcomingAppts, error: fetchError } = await supabase
            .from('appointments')
            .select(`
        id, start_time, customer_phone, customer_name,
        salon:salons(name)
      `)
            .eq('status', 'CONFIRMED')
            .gte('start_time', startRange.toISOString())
            .lt('start_time', endRange.toISOString());

        let queuedCount = 0;

        if (upcomingAppts && upcomingAppts.length > 0) {
            // Get template
            const { data: tmpl } = await supabase
                .from('notification_templates')
                .select('content')
                .eq('slug', 'reminder_24h')
                .single();

            const templateText = tmpl?.content || 'Randevu Hatırlatma: Yarın {{time}} saatinde randevunuz var.';

            for (const apt of upcomingAppts) {
                // Check if already queued to prevent dupes (optional optimization)

                // Format content
                const timeStr = new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

                // Supabase join can return array or object depending on relationship type
                const salondata: any = apt.salon;
                const salonName = Array.isArray(salondata) ? salondata[0]?.name : salondata?.name;

                const msg = templateText
                    .replace('{{customer_name}}', apt.customer_name || 'Sayın Müşteri')
                    .replace('{{salon_name}}', salonName || 'Güzellik Merkezi')
                    .replace('{{time}}', timeStr);

                // Queue it
                await supabase.rpc('queue_notification', {
                    p_channel: 'SMS',
                    p_recipient: apt.customer_phone,
                    p_content: msg,
                    p_related_id: apt.id,
                    p_related_table: 'appointments'
                });

                queuedCount++;
            }
        }

        // ---------------------------------------------------------
        // 2. PROCESS QUEUE (Send the SMS)
        // ---------------------------------------------------------

        const result = await NotificationService.processQueue(50); // Process up to 50 items

        return NextResponse.json({
            success: true,
            generated_reminders: queuedCount,
            queue_processed: result.processed,
            queue_failed: result.failed
        });

    } catch (err: any) {
        console.error('Cron Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
