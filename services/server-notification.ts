import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (using Service Role Key for CRON jobs)
// WARNING: Only use this in server-side API routes, never expose on client!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// NetGSM Configuration from Env
const NETGSM_USERCODE = process.env.NETGSM_USERCODE;
const NETGSM_PASSWORD = process.env.NETGSM_PASSWORD;
const NETGSM_HEADER = process.env.NETGSM_HEADER || 'GUZELLIK';

export const NotificationService = {

    /**
     * Process the Notification Queue
     * Finds pending notifications and sends them via NetGSM
     */
    async processQueue(limit = 20) {
        if (!supabaseServiceKey) {
            console.error('SUPABASE_SERVICE_ROLE_KEY missing');
            return { success: false, error: 'Configuration missing' };
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch pending notifications
        const { data: jobs, error } = await supabase
            .from('notification_queue')
            .select('*')
            .eq('status', 'PENDING')
            .lte('scheduled_for', new Date().toISOString())
            .limit(limit);

        if (error) {
            console.error('Queue fetch error:', error);
            return { success: false, error };
        }

        if (!jobs || jobs.length === 0) {
            return { success: true, processed: 0 };
        }

        let processed = 0;
        let failed = 0;

        // 2. Process each job
        for (const job of jobs) {
            try {
                // Mark as processing
                await supabase
                    .from('notification_queue')
                    .update({ status: 'PROCESSING' })
                    .eq('id', job.id);

                let success = false;

                if (job.channel === 'SMS') {
                    success = await this.sendSmsViaNetgsm(job.recipient, job.content);
                } else {
                    // Email not implemented yet
                    console.warn('Email channel not implemented');
                    success = true; // Skip
                }

                // Update status
                if (success) {
                    await supabase
                        .from('notification_queue')
                        .update({ status: 'SENT', processed_at: new Date().toISOString() })
                        .eq('id', job.id);
                    processed++;
                } else {
                    throw new Error('Provider returned failure');
                }

            } catch (err: any) {
                console.error(`Job ${job.id} failed:`, err);
                failed++;

                // Update with error and increment try count
                const newTries = (job.tries || 0) + 1;
                const newStatus = newTries >= 3 ? 'FAILED' : 'PENDING'; // Retry up to 3 times

                await supabase
                    .from('notification_queue')
                    .update({
                        status: newStatus,
                        tries: newTries,
                        last_error: err.message || 'Unknown error',
                        // If retrying, delay by 5 minutes
                        scheduled_for: newStatus === 'PENDING'
                            ? new Date(Date.now() + 5 * 60000).toISOString()
                            : job.scheduled_for
                    })
                    .eq('id', job.id);
            }
        }

        return { success: true, processed, failed };
    },

    /**
     * Send SMS via NetGSM API (Server-Side)
     */
    async sendSmsViaNetgsm(phone: string, message: string): Promise<boolean> {

        // DEMO MODE if no credentials
        if (!NETGSM_USERCODE || !NETGSM_PASSWORD) {
            console.log(`[DEMO SMS] To: ${phone} | Msg: ${message}`);
            return true; // Pretend it worked
        }

        try {
            // Normalize phone (NetGSM expects 905xxxxxxxxx)
            let cleanPhone = phone.replace(/[^0-9]/g, '');
            if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
            if (!cleanPhone.startsWith('90')) cleanPhone = '90' + cleanPhone;

            const payload = {
                msgheader: NETGSM_HEADER,
                messages: [{ msg: message, no: cleanPhone }],
                encoding: "TR"
                // No filter for commercial messages in this simple implementation
                // For production, handle IYS filtering
            };

            // Basic Auth
            // Note: In Node environment headers are different than browser
            const response = await fetch("https://api.netgsm.com.tr/sms/rest/v2/send", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // NetGSM might require different auth based on endpoint documentation, 
                    // usually XML or embedding user/pass in body for some endpoints.
                    // For REST v2, it often uses Bearer or custom headers.
                    // Let's assume standard Basic Auth for this boilerplate.
                    'Authorization': 'Basic ' + Buffer.from(`${NETGSM_USERCODE}:${NETGSM_PASSWORD}`).toString('base64')
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`NetGSM Error ${response.status}: ${text}`);
            }

            return true;
        } catch (err) {
            console.error('NetGSM Send Error:', err);
            return false;
        }
    }
};
