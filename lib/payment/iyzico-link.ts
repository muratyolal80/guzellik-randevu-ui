import { getIyzicoInstance, type IyzicoResult } from './iyzico';

/**
 * iyzico Link API Wrapper
 * Supports Marketplace (subMerchantKey) for split payments.
 */
export const IyzicoLinkService = {
    /**
     * Create a dynamic payment link
     * If subMerchantKey is provided, payments will be split.
     */
    async createLink(data: {
        name: string;
        description: string;
        price: number;
        currency?: string;
        subMerchantKey?: string;
        subMerchantPrice?: number;
    }): Promise<IyzicoResult> {
        const iyzico = await getIyzicoInstance();

        const requestData = {
            locale: 'tr',
            conversationId: `link_${Date.now()}`,
            name: data.name,
            description: data.description,
            price: data.price,
            currency: data.currency || 'TRY',
            installmentRequested: true,
            subMerchantKey: data.subMerchantKey,
            subMerchantPrice: data.subMerchantPrice
        };

        return new Promise((resolve, reject) => {
            if (iyzico.iyziLink) {
                iyzico.iyziLink.create(requestData, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            } else {
                reject(new Error('iyzico Link API is not available in the current SDK version.'));
            }
        });
    }
};
