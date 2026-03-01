import { SubscriptionService } from '@/services/db';

/**
 * Utility class to enforce subscription limits throughout the application.
 */
export const LimitEnforcer = {
    /**
     * General check for resource limits (Staff, Branch, Gallery)
     * Throws an error if limit is reached.
     */
    async ensureLimit(salonId: string, resourceType: 'staff' | 'branch' | 'gallery_photo') {
        const result = await SubscriptionService.checkLimit(salonId, resourceType);
        if (!result.allowed) {
            throw new Error(`SUBSCRIPTION_LIMIT_REACHED:${resourceType.toUpperCase()}:${result.limit}`);
        }
        return result;
    },

    /**
     * Check if a specific feature is enabled (Advanced Reports, Campaigns, etc.)
     */
    async ensureFeature(salonId: string, featureName: 'has_advanced_reports' | 'has_campaigns' | 'has_sponsored') {
        const sub = await SubscriptionService.getSalonSubscription(salonId);
        const plan = sub?.subscription_plans;

        if (!plan || !plan[featureName]) {
            throw new Error(`FEATURE_NOT_AVAILABLE:${featureName.toUpperCase()}`);
        }
        return true;
    },

    /**
     * Specifically check for remaining SMS balance
     */
    async hasRemainingSms(salonId: string, needed: number = 1): Promise<boolean> {
        const sub = await SubscriptionService.getSalonSubscription(salonId);
        const plan = sub?.subscription_plans;

        if (!plan) return false;
        if (plan.max_sms_monthly === -1) return true; // Unlimited

        // In a real scenario, we would count sent SMS in current month from an 'sms_logs' table
        // For now, checking the static pakcet limit (assuming 0 balance = blocked)
        if (plan.max_sms_monthly <= 0) return false;

        return true;
    }
};
