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

/**
 * Dynamically initializes and returns an Iyzipay instance based on database settings.
 * DO NOT hardcode keys here.
 */
export async function getIyzicoInstance() {
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

    async createSubMerchant(data: any): Promise<any> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.subMerchant.create(data, (err: any, result: any) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    async updateSubMerchant(data: any): Promise<any> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.subMerchant.update(data, (err: any, result: any) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    async createPayment(data: any): Promise<any> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.payment.create(data, (err: any, result: any) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    async approvePaymentItem(paymentTransactionId: string): Promise<any> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.approval.create({ paymentTransactionId }, (err: any, result: any) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    async initializeSubscription(data: any): Promise<any> {
        const iyzico = await getIyzicoInstance();
        return new Promise((resolve, reject) => {
            iyzico.subscription.initialize(data, (err: any, result: any) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
};
