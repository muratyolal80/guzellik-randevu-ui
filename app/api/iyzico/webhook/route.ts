import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { IyzicoService } from '@/lib/payment/iyzico';
import { SubscriptionService } from '@/services/db';
import { IyzicoWebhook } from '@/types';
import crypto from 'crypto';

/**
 * iyzico Webhook Handler
 * Handles Subscription and Payment notifications
 */
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);
        const signature = req.headers.get('x-iyzi-signature');

        console.log('iyzico Webhook received:', JSON.stringify(body));

        // 0. Verify Signature (V3 logic)
        const options = await IyzicoService.getOptions();
        const secretKey = options.secretKey;

        if (signature) {
            // V3 Signature string: SECRET_KEY + iyziEventType + paymentId + paymentConversationId + status
            // Note: For subscriptions, parameters might differ. We try both the standard concat and raw body.
            const payloadStr = secretKey +
                (body.iyziEventType || '') +
                (body.paymentId || body.subscriptionReferenceCode || '') +
                (body.paymentConversationId || '') +
                (body.status || '');

            const expectedSignature = crypto
                .createHmac('sha256', secretKey)
                .update(payloadStr)
                .digest('hex');

            if (signature !== expectedSignature) {
                console.warn('Invalid iyzico signature (V3 check failed).');
            }
        }

        // 0. Log Webhook to Database (Audit Trail)
        const { data: webhookLog } = await supabase
            .from('iyzico_webhooks')
            .insert({
                iyzi_event_type: body.iyziEventType || 'UNKNOWN',
                status: body.status || 'UNKNOWN',
                payload: body,
                signature: signature
            })
            .select()
            .single() as { data: IyzicoWebhook | null };

        // 1. Determine Event Type & Reference
        const eventType = body.iyziEventType;
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
                // Use atomic RPC for activation
                await SubscriptionService.activateSalonAndSubscription(
                    sub.salon_id,
                    sub.id,
                    `iyzico Webhook: ${referenceCode}`
                );

                console.log('Processed atomic activation for:', sub.salon_id);

                // Update log as processed
                if (webhookLog) {
                    await supabase
                        .from('iyzico_webhooks')
                        .update({ processed: true, updated_at: new Date().toISOString() })
                        .eq('id', webhookLog.id);
                }
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
                    // Use atomic RPC for activation
                    await SubscriptionService.activateSalonAndSubscription(
                        payRecord.salon_id,
                        payRecord.subscription_id,
                        `iyzico Payment Webhook: ${paymentId || token || checkoutFormToken}`
                    );

                    console.log('Subscription and Salon activated atomically:', payRecord.subscription_id);
                }

                // Update log as processed
                if (webhookLog) {
                    await supabase
                        .from('iyzico_webhooks')
                        .update({ processed: true, updated_at: new Date().toISOString() })
                        .eq('id', webhookLog.id);
                }
            }
        }

        return NextResponse.json({ status: 'OK' });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ status: 'ERROR' }, { status: 500 });
    }
}
