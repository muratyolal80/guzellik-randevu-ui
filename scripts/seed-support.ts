import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import path from 'path';

// Environment variables are loaded automatically via import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedSupportData() {
    console.log('🚀 Starting seed process...');

    try {
        // 1. Get a user to link tickets to
        const { data: users, error: userError } = await supabase.from('profiles').select('id, email, full_name').limit(1);

        if (userError || !users || users.length === 0) {
            console.error('Error: No users found in profiles table to link tickets to.');
            return;
        }

        const testUser = users[0];
        console.log(`👤 Using user: ${testUser.full_name} (${testUser.email})`);

        // 2. Sample Tickets
        const sampleTickets = [
            {
                user_id: testUser.id,
                subject: 'Ödeme Hakkında Bilgi',
                category: 'PAYMENT',
                message: 'Kredi kartı ile ödeme yaparken taksit seçeneklerini göremedim. Bilgi alabilir miyim?',
                status: 'OPEN'
            },
            {
                user_id: testUser.id,
                subject: 'Randevu İptal Sorunu',
                category: 'BOOKING',
                message: 'Yarınki randevumu iptal etmek istiyorum ama sistem hata veriyor.',
                status: 'IN_PROGRESS'
            },
            {
                user_id: testUser.id,
                subject: 'Yeni Şube Önerisi',
                category: 'OTHER',
                message: 'Kadıköy bölgesinde de bir şube açmanızı çok isteriz.',
                status: 'RESOLVED'
            }
        ];

        console.log('📝 Inserting tickets...');
        const { data: insertedTickets, error: ticketError } = await supabase
            .from('support_tickets')
            .insert(sampleTickets)
            .select();

        if (ticketError) throw ticketError;
        console.log(`✅ ${insertedTickets.length} tickets inserted.`);

        // 3. Sample Messages for threads
        const messages = [];
        for (const ticket of insertedTickets) {
            // First message from user
            messages.push({
                ticket_id: ticket.id,
                sender_id: testUser.id,
                sender_role: 'CUSTOMER',
                content: ticket.message
            });

            // If status is not OPEN, add a staff response
            if (ticket.status !== 'OPEN') {
                messages.push({
                    ticket_id: ticket.id,
                    sender_id: testUser.id, // In a real scenario, this would be a STAFF ID. Using user id for demo.
                    sender_role: 'STAFF',
                    content: ticket.status === 'IN_PROGRESS'
                        ? 'Talebiniz inceleniyor, en kısa sürede dönüş yapacağız.'
                        : 'Öneriniz için teşekkürler, değerlendirmeye aldık.'
                });
            }
        }

        console.log('💬 Inserting messages...');
        const { error: msgError } = await supabase.from('ticket_messages').insert(messages);
        if (msgError) throw msgError;

        console.log('✨ Seeding completed successfully!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    }
}

seedSupportData();
