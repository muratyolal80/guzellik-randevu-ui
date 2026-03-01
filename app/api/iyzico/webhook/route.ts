import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * iyzico Webhook Handler
 * Handles Subscription and Payment notifications
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('iyzico Webhook received:', JSON.stringify(body));

        // 1. Determine Event Type
        const eventType = body.iyziEventType; // SUBSCRIPTION_ORDER_SUCCESS etc.
        const referenceCode = body.subscriptionReferenceCode;

        if (eventType === 'SUBSCRIPTION_ORDER_SUCCESS') {
            console.log('Processing successful subscription order:', referenceCode);

            // Find subscription by iyzico reference
            const { data: sub, error: subError } = await supabase
                .from('subscriptions')
                .select('id, salon_id')
                .eq('iyzico_subscription_ref', referenceCode)
                .single();

            if (sub && !subError) {
                // Update subscription status
                await supabase
                    .from('subscriptions')
                    .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
                    .eq('id', sub.id);

                // Update salon status
                await supabase
                    .from('salons')
                    .update({ status: 'ACTIVE', is_verified: true, updated_at: new Date().toISOString() })
                    .eq('id', sub.salon_id);

                // Record in payment history if needed (optional since orders have their own history)
            }
        }

        // 2. Standard Payment or Link Payment Webhook
        const paymentId = body.paymentId;
        const token = body.token; // iyzico Link token
        const checkoutFormToken = body.checkoutFormToken; // iyzico Checkout Form token
        const status = body.status;

        if ((paymentId || token || checkoutFormToken) && status === 'SUCCESS') {
            console.log('Processing successful payment:', paymentId || token || checkoutFormToken);

            // Find payment record
            let query = supabase.from('payment_history').select('*');

            if (paymentId) query = query.eq('iyzico_payment_id', paymentId);
            else if (token) query = query.eq('iyzico_link_id', token);
            else if (checkoutFormToken) query = query.eq('metadata->>checkout_form_token', checkoutFormToken);

            const { data: payRecord } = await query.maybeSingle();

            if (payRecord) {
                // Update payment history
                await supabase
                    .from('payment_history')
                    .update({
                        status: 'SUCCESS',
                        iyzico_payment_id: paymentId || payRecord.iyzico_payment_id,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', payRecord.id);

                // Case 1: Appointment Payment
                if (payRecord.appointment_id) {
                    await supabase
                        .from('appointments')
                        .update({
                            status: 'CONFIRMED',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', payRecord.appointment_id);

                    console.log('Appointment confirmed automatically:', payRecord.appointment_id);
                }

                // Case 2: Subscription Payment
                if (payRecord.subscription_id) {
                    await supabase
                        .from('subscriptions')
                        .update({
                            status: 'ACTIVE',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', payRecord.subscription_id);

                    // Also activate the salon if it was pending/draft
                    await supabase
                        .from('salons')
                        .update({
                            status: 'ACTIVE',
                            is_verified: true,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', payRecord.salon_id);

                    console.log('Subscription and Salon activated automatically:', payRecord.subscription_id);
                }
            }
        }

        return NextResponse.json({ status: 'OK' });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ status: 'ERROR' }, { status: 500 });
    }
}
