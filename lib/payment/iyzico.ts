import Iyzipay from 'iyzipay';
import { PlatformService } from '@/services/db';

/**
 * iyzico Configuration Type
 */
export interface IyzicoConfig {
    mode: 'sandbox' | 'live';
    sandbox_apiKey: string;
    sandbox_secretKey: string;
    sandbox_baseUrl: string;
    live_apiKey: string;
    live_secretKey: string;
    live_baseUrl: string;
}

/** Fields of iyzico responses read by callers (SDK results are structurally compatible). */
export interface IyzicoResult {
    status: string;
    errorCode?: string;
    errorMessage?: string;
    subMerchantKey?: string;
    url?: string;
    token?: string;
}

type IyzicoCallback = (err: Error | null, result: IyzicoResult) => void;

interface IyzicoEndpoint {
    create(data: object, callback: IyzicoCallback): void;
}

/** Minimal view of the iyzipay SDK surface used here; iyziLink is missing from @types/iyzipay. */
export interface IyzicoClient {
    subMerchant: IyzicoEndpoint & { update(data: object, callback: IyzicoCallback): void };
    payment: IyzicoEndpoint;
    approval: IyzicoEndpoint;
    refund: IyzicoEndpoint;
    checkoutFormInitialize: IyzicoEndpoint;
    subscription: { initialize(data: object, callback: IyzicoCallback): void };
    subscriptionCheckoutForm?: { initialize(data: object, callback: IyzicoCallback): void };
    iyziLink?: IyzicoEndpoint;
}

/**
 * Dynamically initializes and returns an Iyzipay instance based on database settings.
 * DO NOT hardcode keys here.
 */
export async function getIyzicoInstance(): Promise<IyzicoClient> {
    // Fetch config from platform_settings table
    const config = await PlatformService.getSetting('iyzico_config') as IyzicoConfig;

    if (!config) {
        // Fallback to env for initial setup or if DB is empty
        return new Iyzipay({
            apiKey: process.env.IYZICO_API_KEY || '',
            secretKey: process.env.IYZICO_SECRET_KEY || '',
            uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
        });
    }

    const isLive = config.mode === 'live';

    return new Iyzipay({
        apiKey: isLive ? config.live_apiKey : config.sandbox_apiKey,
        secretKey: isLive ? config.live_secretKey : config.sandbox_secretKey,
        uri: isLive ? config.live_baseUrl : config.sandbox_baseUrl
    });
}

/**
 * iyzico Helper Wrapper with Dynamic Initialization
 */
export const IyzicoService = {
    async getOptions() {
        const config = await PlatformService.getSetting('iyzico_config') as IyzicoConfig;
        if (!config) {
            return {
                apiKey: process.env.IYZICO_API_KEY || '',
                secretKey: process.env.IYZICO_SECRET_KEY || '',
                uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
            };
        }
        const isLive = config.mode === 'live';
        return {
            apiKey: isLive ? config.live_apiKey : config.sandbox_apiKey,
            secretKey: isLive ? config.live_secretKey : config.sandbox_secretKey,
            uri: isLive ? config.live_baseUrl : config.sandbox_baseUrl
        };
    },

    async createSubMerchant(data: object): Promise<IyzicoResult> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.subMerchant.create(data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    async updateSubMerchant(data: object): Promise<IyzicoResult> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.subMerchant.update(data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    async createPayment(data: object): Promise<IyzicoResult> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.payment.create(data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    async approvePaymentItem(paymentTransactionId: string): Promise<IyzicoResult> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.approval.create({ paymentTransactionId }, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    async initializeSubscription(data: object): Promise<IyzicoResult> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.subscription.initialize(data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    /**
     * Güvenli Iyzico Checkout Formunu (Ödeme Sayfası veya Iframe) Başlatır.
     * Pazaryeri (Marketplace) ödemelerinde veya normal Kredi Kartı ödemelerinde idealdir.
     */
    async initializeCheckoutForm(data: object): Promise<IyzicoResult> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.checkoutFormInitialize.create(data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    /**
     * Güvenli Iyzico Abonelik (SaaS Paketi) Checkout Formunu Başlatır.
     * Firmaların paket satın almaları için kullanılır.
     */
    async initializeSubscriptionCheckoutForm(data: object): Promise<IyzicoResult> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            if (iyzico.subscriptionCheckoutForm) {
                iyzico.subscriptionCheckoutForm.initialize(data, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            } else {
                reject(new Error("iyzico.subscriptionCheckoutForm API is not supported in the current SDK version."));
            }
        });
    },

    async refund(data: object): Promise<IyzicoResult> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.refund.create(data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
};
