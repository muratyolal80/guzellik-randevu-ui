import { NextRequest, NextResponse } from 'next/server';
import { IyzicoService } from '@/lib/payment/iyzico';
import { SalonDataService, SubmerchantService } from '@/services/db';

/**
 * API route to create a sub-merchant on iyzico
 */
export async function POST(req: NextRequest) {
    try {
        const { salonId, subMerchantData } = await req.json();

        if (!salonId || !subMerchantData) {
            return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
        }

        // Call iyzico API
        const result = await IyzicoService.createSubMerchant(subMerchantData);

        if (result.status === 'success') {
            // Save subMerchantKey and update status in our database
            await SubmerchantService.saveRegistration(salonId, {
                sub_merchant_key: result.subMerchantKey,
                status: 'ACTIVE',
                // Keep existing data if any
                bank_name: subMerchantData.bankName,
                iban: subMerchantData.iban,
                account_owner: subMerchantData.contactName, // Assuming contactName is owner
                sub_merchant_type: subMerchantData.subMerchantType
            });

            return NextResponse.json(result);
        } else {
            return NextResponse.json({
                error: result.errorMessage || 'iyzico hatası',
                errorCode: result.errorCode
            }, { status: 400 });
        }
    } catch (error: any) {
        console.error('iyzico sub-merchant creation error:', error);
        return NextResponse.json({ error: 'Uygulama hatası' }, { status: 500 });
    }
}
