import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendAppointmentSMS } from '@/lib/messaging/sms';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * CRON JOB ENDPOINT
 * This should be called every 15-30 minutes by an external service (GitHub Actions, Vercel Cron, or a Linux Crontab)
 * It finds upcoming appointments that need a reminder and haven't received one yet.
 */
export async function GET(request: NextRequest) {
  // Simple auth check for cron (use a secret header in production)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // 1. Get Salons with reminders enabled
    const { data: salons } = await supabaseAdmin
      .from('salons')
      .select('id, name, reminder_hours_before')
      .eq('reminder_enabled', true);

    if (!salons || salons.length === 0) {
      return NextResponse.json({ message: 'No salons with reminders enabled found.' });
    }

    let totalSent = 0;
    const errors = [];

    for (const salon of salons) {
      const hoursBefore = salon.reminder_hours_before || 2;
      
      // Calculate the window: Appointments starting between (NOW + hoursBefore - 30m) and (NOW + hoursBefore)
      // We use a small window to avoid sending multiple reminders if cron runs frequently, 
      // but reminder_sent flag is the primary guard.
      const windowStart = new Date(now.getTime() + (hoursBefore * 60 * 60 * 1000) - (60 * 60 * 1000)); // 1 hour window to be safe
      const windowEnd = new Date(now.getTime() + (hoursBefore * 60 * 60 * 1000));

      const { data: appointments } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('salon_id', salon.id)
        .eq('status', 'CONFIRMED')
        .eq('reminder_sent', false)
        .gte('start_time', windowStart.toISOString())
        .lte('start_time', windowEnd.toISOString());

      if (appointments && appointments.length > 0) {
        for (const appt of appointments) {
          try {
            const appointmentDate = new Date(appt.start_time);
            const timeStr = format(appointmentDate, 'HH:mm', { locale: tr });
            const dateStr = format(appointmentDate, 'd MMMM', { locale: tr });
            
            const message = `Hatirlatma: Sayin ${appt.customer_name}, ${salon.name} salonundaki randevunuz bugun saat ${timeStr}'dedir. Sizi bekliyoruz.`;
            
            const cleanPhone = appt.customer_phone?.replace(/\D/g, '') || '';
            if (cleanPhone) {
              await sendAppointmentSMS(salon.id, cleanPhone, message);
              
              // Mark as sent
              await supabaseAdmin
                .from('appointments')
                .update({ reminder_sent: true })
                .eq('id', appt.id);
                
              totalSent++;
            }
          } catch (err: any) {
            console.error(`Error sending reminder for appointment ${appt.id}:`, err);
            errors.push({ id: appt.id, error: err.message });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalSent,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString()
    });

  } catch (err: any) {
    console.error('Reminder Cron Error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
