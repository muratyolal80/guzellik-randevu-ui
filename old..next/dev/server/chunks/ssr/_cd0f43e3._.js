module.exports = [
"[project]/lib/supabase.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase,
    "supabaseUrl",
    ()=>supabaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-rsc] (ecmascript)");
;
const supabaseUrl = ("TURBOPACK compile-time value", "http://127.0.0.1:8000") || 'http://localhost:8000';
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY3MzcyMTU3LCJleHAiOjE5MjUwNTIxNTd9.Frv7rg6d7kXV1-sEDew5aIkGDk6xE1vE0UvM1Bo6tvU") || 'dummy_anon_key_for_build';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createBrowserClient"])(supabaseUrl, supabaseAnonKey);
}),
"[project]/services/db/db_core.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GlobalSearchService",
    ()=>GlobalSearchService,
    "MasterDataService",
    ()=>MasterDataService,
    "PlatformService",
    ()=>PlatformService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-rsc] (ecmascript)");
;
// Helper to check if we have a real connection
const isSupabaseConfigured = ()=>{
    return typeof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"] === "string" && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"].includes("localhost:8000");
};
const MasterDataService = {
    /**
   * Get all cities (81 Turkish provinces)
   */ async getCities (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("cities").select("*").order("name");
        if (error) throw error;
        return data || [];
    },
    /**
   * Get districts for a specific city
   */ async getDistrictsByCity (cityId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("districts").select("*").eq("city_id", cityId).order("name");
        if (error) throw error;
        return data || [];
    },
    /**
   * Get all salon types (Kuaför, Berber, SPA, etc.)
   */ async getSalonTypes (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_types").select("*").order("name");
        if (error) throw error;
        return data || [];
    },
    /**
   * Create new salon type
   */ async createSalonType (type, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_types").insert(type).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Update salon type
   */ async updateSalonType (id, updates, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_types").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Delete salon type
   */ async deleteSalonType (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("salon_types").delete().eq("id", id);
        if (error) throw error;
    },
    /**
   * Get all service categories (Saç, Tırnak, Makyaj, etc.)
   */ async getServiceCategories (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("service_categories").select("*").order("name");
        if (error) throw error;
        return data || [];
    },
    /**
   * Create new service category
   */ async createServiceCategory (category, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("service_categories").insert(category).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Update service category
   */ async updateServiceCategory (id, updates, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("service_categories").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Delete service category
   */ async deleteServiceCategory (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("service_categories").delete().eq("id", id);
        if (error) throw error;
    },
    /**
   * Get global services by category
   */ async getGlobalServicesByCategory (categoryId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("global_services").select("*").eq("category_id", categoryId).order("name");
        if (error) throw error;
        return data || [];
    },
    /**
   * Get all global services
   */ async getAllGlobalServices (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("global_services").select("*").order("name");
        if (error) throw error;
        return data || [];
    },
    /**
   * Get service categories for selected salon types
   * Returns unique categories associated with the given salon type IDs
   */ async getServiceCategoriesForSalonTypes (typeIds, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        if (!typeIds || typeIds.length === 0) return [];
        const { data, error } = await supabase.from("salon_type_categories").select(`
        category:service_categories(*)
      `).in("salon_type_id", typeIds);
        if (error) {
            console.error("Error fetching categories for salon types:", error);
            throw error;
        }
        // Extract and deduplicate categories
        const uniqueCategories = new Map();
        data?.forEach((item)=>{
            if (item.category) {
                uniqueCategories.set(item.category.id, item.category);
            }
        });
        return Array.from(uniqueCategories.values());
    },
    /**
   * Get global services by category IDs
   */ async getGlobalServicesByCategories (categoryIds, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        if (!categoryIds || categoryIds.length === 0) return [];
        const { data, error } = await supabase.from("global_services").select("*").in("category_id", categoryIds).order("name");
        if (error) {
            console.error("Error fetching services by categories:", error);
            throw error;
        }
        return data || [];
    },
    /**
   * Create new global service
   */ async createGlobalService (service, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("global_services").insert(service).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Update global service
   */ async updateGlobalService (id, updates, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("global_services").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Delete global service
   */ async deleteGlobalService (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("global_services").delete().eq("id", id);
        if (error) throw error;
    },
    /**
   * Get navigation menu data (for header)
   */ async getNavMenuData (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const [salonTypes, categories, allServices] = await Promise.all([
            this.getSalonTypes(supabase),
            this.getServiceCategories(supabase),
            this.getAllGlobalServices(supabase)
        ]);
        // Group services by category ID
        const servicesByCatId = {};
        allServices.forEach((service)=>{
            if (!servicesByCatId[service.category_id]) {
                servicesByCatId[service.category_id] = [];
            }
            servicesByCatId[service.category_id].push(service.name);
        });
        return {
            salonTypes,
            categories,
            servicesByCatId
        };
    }
};
const GlobalSearchService = {
    /**
   * Search across salons, services and cities
   */ async search (query, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        if (!query || query.length < 2) return {
            salons: [],
            services: []
        };
        const [salonsResp, servicesResp] = await Promise.all([
            supabase.from("salons").select("id, name, image, slug, city:cities(name)").ilike("name", `%${query}%`).eq("status", "APPROVED").limit(5),
            supabase.from("global_services").select("id, name, slug, category:service_categories(name)").ilike("name", `%${query}%`).limit(5)
        ]);
        const salons = (salonsResp.data || []).map((s)=>({
                ...s,
                name: String(s.name || ""),
                city_name: typeof s.city === "object" ? String(s.city?.name || "Belirtilmemiş") : String(s.city || "Belirtilmemiş")
            }));
        const services = (servicesResp.data || []).map((s)=>({
                ...s,
                name: String(s.name || ""),
                category_name: typeof s.category === "object" ? String(s.category?.name || "Diğer") : String(s.category || "Diğer")
            }));
        return {
            salons,
            services
        };
    }
};
const PlatformService = {
    /**
   * Get platform settings by key
   */ async getSetting (key, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("platform_settings").select("value").eq("key", key).maybeSingle();
        if (error) throw error;
        return data?.value;
    },
    /**
   * Update platform setting
   */ async updateSetting (key, value, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("platform_settings").upsert({
            key,
            value,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    }
};
}),
"[project]/services/db/db_finance.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FinanceService",
    ()=>FinanceService,
    "PaymentService",
    ()=>PaymentService,
    "SubmerchantService",
    ()=>SubmerchantService,
    "SubscriptionService",
    ()=>SubscriptionService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-rsc] (ecmascript)");
;
// Helper to check if we have a real connection
const isSupabaseConfigured = ()=>{
    return typeof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"] === "string" && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"].includes("localhost:8000");
};
const PaymentService = {
    // Record a new transaction
    async createTransaction (transaction, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("transactions").insert(transaction).select().single();
        if (error) throw error;
        return data;
    },
    // Get transactions for a salon (Owner view)
    async getSalonTransactions (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("transactions").select("*").eq("salon_id", salonId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data;
    },
    // Get transactions for a customer
    async getCustomerTransactions (customerId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("transactions").select("*, salons(name)").eq("customer_id", customerId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data;
    },
    /**
   * Record a payment in payment_history (New unified table)
   */ async recordPayment (payment, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("payment_history").insert(payment).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Get payment history for a salon
   */ async getSalonPaymentHistory (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("payment_history").select("*").eq("salon_id", salonId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data;
    }
};
const SubscriptionService = {
    /**
   * Get all available plans
   */ async getPlans (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("subscription_plans").select("*").order("sort_order", {
            ascending: true
        });
        if (error) throw error;
        return data;
    },
    /**
   * Get current subscription of a salon
   */ async getSalonSubscription (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("subscriptions").select("*, subscription_plans(*)").eq("salon_id", salonId).order("created_at", {
            ascending: false
        }).limit(1).maybeSingle();
        if (error) throw error;
        return data;
    },
    /**
   * Check if a salon can add more resources based on their plan
   * @param salonId Salon ID
   * @param resourceType 'staff' | 'branch' | 'gallery_photo'
   */ async checkLimit (salonId, resourceType, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const sub = await this.getSalonSubscription(salonId, supabase);
        let plan = sub?.subscription_plans;
        if (!plan) {
            // Default to STARTER limits if no sub found (e.g. during onboarding)
            const { data: defaultPlan } = await supabase.from("subscription_plans").select("*").eq("name", "STARTER").maybeSingle();
            if (!defaultPlan) {
                return {
                    allowed: false,
                    current: 0,
                    limit: 0
                };
            }
            plan = defaultPlan;
        }
        let current = 0;
        let limit = 0;
        if (resourceType === "staff") {
            const { count } = await supabase.from("staff").select("*", {
                count: "exact",
                head: true
            }).eq("salon_id", salonId);
            current = count || 0;
            limit = plan.max_staff;
        } else if (resourceType === "branch") {
            // Count total salons for the same owner
            const { data: currentSalon } = await supabase.from("salons").select("owner_id").eq("id", salonId).maybeSingle();
            if (currentSalon?.owner_id) {
                const { count } = await supabase.from("salons").select("*", {
                    count: "exact",
                    head: true
                }).eq("owner_id", currentSalon.owner_id);
                current = count || 0;
            } else {
                current = 1;
            }
            limit = plan.max_branches;
        } else if (resourceType === "gallery_photo") {
            const { count } = await supabase.from("salon_gallery").select("*", {
                count: "exact",
                head: true
            }).eq("salon_id", salonId);
            current = count || 0;
            limit = plan.max_gallery_photos;
        }
        return {
            allowed: limit === -1 || current < limit,
            current,
            limit
        };
    },
    /**
   * Start a subscription process.
   * If Credit Card, it calls the server API for iyzico processing.
   */ async subscribe (salonId, planId, paymentMethod, billingCycle = "MONTHLY", supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        if (paymentMethod === "CREDIT_CARD") {
            const response = await fetch("/api/subscription/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    salonId,
                    planId,
                    billingCycle
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Ödeme başlatılamadı");
            return data;
        }
        // Default: Just create the pending record for Bank Transfer
        return this.createSubscriptionRequest(salonId, planId, paymentMethod, billingCycle, supabase);
    },
    /**
   * Create a new subscription record (usually PENDING status)
   */ async createSubscriptionRequest (salonId, planId, paymentMethod, billingCycle = "MONTHLY", supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const days = billingCycle === "YEARLY" ? 365 : 30;
        const { data, error } = await supabase.from("subscriptions").upsert({
            salon_id: salonId,
            plan_id: planId,
            status: "PENDING",
            payment_method: paymentMethod,
            billing_cycle: billingCycle,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        }).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Notify platform about a bank transfer payment
   */ async notifyBankTransfer (subscriptionId, salonId, amount, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("payment_history").insert({
            salon_id: salonId,
            subscription_id: subscriptionId,
            amount: amount,
            payment_method: "BANK_TRANSFER",
            payment_type: "SUBSCRIPTION",
            status: "PENDING",
            bank_transfer_notified_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Update a subscription plan (Admin only)
   */ async updatePlan (planId, updates, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("subscription_plans").update(updates).eq("id", planId).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Check if a specific feature is enabled in salon's plan
   */ async checkFeatureAccess (salonId, feature, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const sub = await this.getSalonSubscription(salonId, supabase);
        return sub?.subscription_plans?.[feature] === true;
    },
    /**
   * Atomic RPC to activate salon and subscription
   */ async activateSalonAndSubscription (salonId, subscriptionId, adminNote, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.rpc("activate_salon_and_subscription", {
            p_salon_id: salonId,
            p_subscription_id: subscriptionId,
            p_admin_note: adminNote
        });
        if (error) throw error;
    }
};
const SubmerchantService = {
    /**
   * Get salon's sub-merchant registration info
   */ async getBySalonId (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_sub_merchants").select("*").eq("salon_id", salonId).maybeSingle();
        if (error) throw error;
        return data;
    },
    /**
   * Upsert sub-merchant registration (Application)
   */ async saveRegistration (salonId, registrationData, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_sub_merchants").upsert({
            salon_id: salonId,
            ...registrationData,
            updated_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        return data;
    }
};
const FinanceService = {
    /**
   * Get pending bank transfer payments for Admin
   */ async getPendingPayments (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("payment_history").select("*, salons(name, owner_id)").eq("status", "PENDING").order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data;
    },
    /**
   * Approve or reject a payment (Bank Transfer)
   */ async updatePaymentStatus (paymentId, status, adminNote, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data: payment, error: pError } = await supabase.from("payment_history").select("*").eq("id", paymentId).single();
        if (pError) throw pError;
        const { error } = await supabase.from("payment_history").update({
            status,
            metadata: {
                ...payment.metadata,
                admin_note: adminNote,
                updated_by_admin_at: new Date().toISOString()
            }
        }).eq("id", paymentId);
        if (error) throw error;
        // If it was a subscription payment, activate the subscription and the salon
        if (status === "SUCCESS" && payment.payment_type === "SUBSCRIPTION" && payment.subscription_id) {
            // Activate subscription
            await supabase.from("subscriptions").update({
                status: "ACTIVE"
            }).eq("id", payment.subscription_id);
            // Activate salon (Set to APPROVED)
            await supabase.from("salons").update({
                status: "APPROVED",
                is_verified: true
            }).eq("id", payment.salon_id);
        }
    },
    /**
   * Get financial reports (Overview)
   */ async getFinancialReports (filter = {}, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        let query = supabase.from("payment_history").select("*");
        if (filter.salonId) query = query.eq("salon_id", filter.salonId);
        if (filter.startDate) query = query.gte("created_at", filter.startDate);
        if (filter.endDate) query = query.lte("created_at", filter.endDate);
        const { data, error } = await query.order("created_at", {
            ascending: false
        });
        if (error) throw error;
        // Simple aggregation
        const totalRevenue = data.reduce((acc, curr)=>curr.status === "SUCCESS" ? acc + curr.amount : acc, 0);
        const successCount = data.filter((p)=>p.status === "SUCCESS").length;
        return {
            transactions: data,
            stats: {
                totalRevenue,
                successCount,
                failedCount: data.filter((p)=>p.status === "FAILED").length,
                pendingCount: data.filter((p)=>p.status === "PENDING").length
            }
        };
    }
};
}),
"[project]/services/db/db_salon.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FavoriteService",
    ()=>FavoriteService,
    "GalleryService",
    ()=>GalleryService,
    "ReviewService",
    ()=>ReviewService,
    "SalonDataService",
    ()=>SalonDataService,
    "WorkingHoursService",
    ()=>WorkingHoursService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_finance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_finance.ts [app-rsc] (ecmascript)");
;
;
// Helper to check if we have a real connection
const isSupabaseConfigured = ()=>{
    return typeof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"] === "string" && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"].includes("localhost:8000");
};
const SalonDataService = {
    /**
   * Helper: Normalize salon data to prevent [object Object] errors
   */ mapSalonDetail (salon) {
        if (!salon) return salon;
        return {
            ...salon,
            name: String(salon.name || ""),
            description: typeof salon.description === "object" ? JSON.stringify(salon.description) : salon.description || "",
            city_name: typeof salon.city_name === "object" ? salon.city_name?.name : String(salon.city_name || "Belirtilmemiş"),
            district_name: typeof salon.district_name === "object" ? salon.district_name?.name : String(salon.district_name || ""),
            neighborhood: typeof salon.neighborhood === "object" ? String(salon.neighborhood?.name || "") : String(salon.neighborhood || ""),
            avenue: typeof salon.avenue === "object" ? String(salon.avenue?.name || "") : String(salon.avenue || ""),
            street: typeof salon.street === "object" ? String(salon.street?.name || "") : String(salon.street || ""),
            building_no: typeof salon.building_no === "object" ? String(salon.building_no?.name || "") : String(salon.building_no || ""),
            apartment_no: typeof salon.apartment_no === "object" ? String(salon.apartment_no?.name || "") : String(salon.apartment_no || ""),
            address: typeof salon.address === "object" ? JSON.stringify(salon.address) : salon.address || "",
            geo_latitude: Number(salon.geo_latitude || 0),
            geo_longitude: Number(salon.geo_longitude || 0),
            average_rating: Number(salon.average_rating || 0),
            rating: Number(salon.rating || salon.average_rating || 0),
            features: Array.isArray(salon.features) ? salon.features.map((f)=>typeof f === "string" ? f : f.name || JSON.stringify(f)) : [],
            tags: Array.isArray(salon.assigned_types) ? salon.assigned_types.map((t)=>typeof t === "string" ? t : t.name || String(t)) : salon.type_name ? [
                String(salon.type_name)
            ] : [],
            coordinates: {
                lat: Number(salon.geo_latitude || 0),
                lng: Number(salon.geo_longitude || 0)
            },
            working_hours: Array.isArray(salon.working_hours) ? salon.working_hours.map((wh)=>({
                    day_of_week: Number(wh.day_of_week),
                    start_time: String(wh.start_time || "09:00:00"),
                    end_time: String(wh.end_time || "20:00:00"),
                    is_closed: Boolean(wh.is_closed)
                })) : []
        };
    },
    /**
   * Get all salons with detailed information (using view)
   */ async getSalons (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_details").select("*").eq("status", "APPROVED") // Only show approved salons
        .order("is_sponsored", {
            ascending: false
        }).order("average_rating", {
            ascending: false
        });
        if (error) throw error;
        return (data || []).map((s)=>this.mapSalonDetail(s));
    },
    /**
   * Get salons by user membership (Owner/Staff branches)
   */ async getSalonsByMembership (userId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // First, get the salon IDs from memberships
        const { data: memberships, error: memError } = await supabase.from("salon_memberships").select("salon_id").eq("user_id", userId).eq("is_active", true);
        if (memError) throw memError;
        if (!memberships || memberships.length === 0) return [];
        // Then fetch the salon details
        const salonIds = memberships.map((m)=>m.salon_id);
        const { data: salons, error: salonError } = await supabase.from("salon_details").select("*").in("id", salonIds);
        if (salonError) throw salonError;
        return (salons || []).map((s)=>this.mapSalonDetail(s));
    },
    /**
   * Get salon by ID with details
   */ async getSalonById (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_details").select("*").eq("id", id).single();
        if (error) throw error;
        return data ? this.mapSalonDetail(data) : null;
    },
    /**
   * Get salon by slug (for subdomain routing)
   */ async getSalonBySlug (slug, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_details").select("*").eq("slug", slug).single();
        if (error) throw error;
        return data ? this.mapSalonDetail(data) : null;
    },
    /**
   * Search salons by filters
   */ async searchSalons (filters, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        let query = supabase.from("salon_details").select("*");
        if (filters.cityId) {
            const { data: cityData } = await supabase.from("cities").select("name").eq("id", filters.cityId).single();
            if (cityData) {
                query = query.eq("city_name", cityData.name);
            }
        }
        // Always filter by approved status
        query = query.eq("status", "APPROVED");
        if (filters.districtId) {
            const { data: districtData } = await supabase.from("districts").select("name").eq("id", filters.districtId).single();
            if (districtData) {
                query = query.eq("district_name", districtData.name);
            }
        }
        if (filters.typeId) {
            // Use salon_assigned_types to filtering multi-type assignment
            const { data: assigned } = await supabase.from("salon_assigned_types").select("salon_id").eq("type_id", filters.typeId);
            if (assigned && assigned.length > 0) {
                const ids = assigned.map((a)=>a.salon_id);
                query = query.in("id", ids);
            } else {
                // No salons found for this type, return empty immediately to save query
                // Or create impossible condition
                // But better to just return empty if we want to be efficient
                return [];
            }
        }
        if (filters.query) {
            query = query.ilike("name", `%${filters.query}%`);
        }
        query = query.order("is_sponsored", {
            ascending: false
        }).order("average_rating", {
            ascending: false
        });
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((s)=>this.mapSalonDetail(s));
    },
    /**
   * Get salons by location (nearby)
   */ async getSalonsByLocation (lat, lng, radiusKm = 10, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // Simple bounding box search (for more accurate, use PostGIS)
        const latDelta = radiusKm / 111; // ~111km per degree latitude
        const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
        const { data, error } = await supabase.from("salon_details").select("*").gte("geo_latitude", lat - latDelta).lte("geo_latitude", lat + latDelta).gte("geo_longitude", lng - lngDelta).lte("geo_longitude", lng + lngDelta).eq("status", "APPROVED").order("is_sponsored", {
            ascending: false
        });
        if (error) throw error;
        return (data || []).map((s)=>this.mapSalonDetail(s));
    },
    /**
   * Create a new salon
   */ /**
   * Create a new salon
   */ async createSalon (salon, customHours, initialServices, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // Enforcement: Check branch limit for the owner
        // If owner already has a salon, check its plan's branch limit
        const { data: existingSalons } = await supabase.from("salons").select("id, status").eq("owner_id", salon.owner_id);
        let hijackedSalonId = null;
        if (existingSalons && existingSalons.length > 0) {
            const limitResult = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_finance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SubscriptionService"].checkLimit(existingSalons[0].id, "branch", supabase);
            if (!limitResult.allowed) {
                // If limit reached (e.g. 0 because no plan, or 1 on standard plan),
                // gracefully hijack into an UPDATE if we only have 1 salon and it's not active
                if (existingSalons.length === 1 && (limitResult.limit === 0 || existingSalons[0].status === 'PENDING' || existingSalons[0].status === 'SUBMITTED' || existingSalons[0].status === 'DRAFT')) {
                    console.warn("Hijacking createSalon to update existing pending salon to escape limit loops:", existingSalons[0].id);
                    hijackedSalonId = existingSalons[0].id;
                } else {
                    throw new Error(`SUBSCRIPTION_LIMIT_REACHED:BRANCH:${limitResult.limit}`);
                }
            }
        }
        const { type_ids, primary_type_id, ...salonData } = salon;
        // Use primary_type_id as fallback for type_id for backward compatibility
        const dbSalon = {
            ...salonData,
            type_id: primary_type_id || salonData.type_id
        };
        let data;
        if (hijackedSalonId) {
            const { data: updateData, error: updateError } = await supabase.from("salons").update(dbSalon).eq("id", hijackedSalonId).select().single();
            if (updateError) throw updateError;
            data = updateData;
        } else {
            const { data: insertData, error: insertError } = await supabase.from("salons").insert(dbSalon).select().single();
            if (insertError) throw insertError;
            data = insertData;
        }
        const salonId = data.id;
        // Insert Assignments
        if (type_ids && type_ids.length > 0) {
            const assignments = type_ids.map((tid)=>({
                    salon_id: salonId,
                    type_id: tid,
                    is_primary: tid === (primary_type_id || dbSalon.type_id)
                }));
            const { error: assignError } = await supabase.from("salon_assigned_types").insert(assignments);
            if (assignError) console.error("Error assigning salon types:", assignError);
        }
        // Prepare Working Hours
        let hoursToInsert;
        if (customHours && customHours.length > 0) {
            hoursToInsert = customHours.map((h)=>({
                    salon_id: salonId,
                    day_of_week: h.day_of_week,
                    start_time: h.start_time.length === 5 ? `${h.start_time}:00` : h.start_time,
                    end_time: h.end_time.length === 5 ? `${h.end_time}:00` : h.end_time,
                    is_closed: h.is_closed
                }));
        } else {
            // Create default working hours (Mon-Sat 09:00-19:00, Sun Closed)
            hoursToInsert = [
                1,
                2,
                3,
                4,
                5,
                6
            ].map((day)=>({
                    salon_id: salonId,
                    day_of_week: day,
                    start_time: "09:00:00",
                    end_time: "19:00:00",
                    is_closed: false
                }));
            hoursToInsert.push({
                salon_id: salonId,
                day_of_week: 0,
                start_time: "09:00:00",
                end_time: "19:00:00",
                is_closed: true
            });
        }
        const { error: hoursError } = await supabase.from("salon_working_hours").insert(hoursToInsert);
        if (hoursError) {
            console.error("Error inserting working hours:", hoursError);
        // We don't throw here to allow partial success, but logged.
        }
        if (initialServices && initialServices.length > 0) {
            const servicesToInsert = initialServices.map((s)=>({
                    salon_id: salonId,
                    global_service_id: s.global_service_id,
                    price: s.price,
                    duration_min: s.duration_min,
                    is_active: true
                }));
            const { error: servicesError } = await supabase.from("salon_services").insert(servicesToInsert);
            if (servicesError) {
                console.error("Error inserting services:", servicesError);
            }
        }
        return data;
    },
    /**
   * Update salon
   */ async updateSalon (id, updates, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // Extract multi-type fields to prevent them from being sent to 'salons' table
        const { type_ids, primary_type_id, ...salonUpdates } = updates;
        // If primary type is updated, sync it to the legacy type_id column
        if (primary_type_id) {
            salonUpdates.type_id = primary_type_id;
        }
        // Update main table
        const { data, error } = await supabase.from("salons").update(salonUpdates).eq("id", id).select();
        if (error) {
            console.error("Update error details:", {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint,
                table: "salons",
                updates: salonUpdates
            });
            throw error;
        }
        if (!data || data.length === 0) {
            throw new Error("Update successful but RLS policy prevented retrieving the updated data. Please refresh.");
        }
        // Handle Assignment Updates
        if (type_ids && type_ids.length > 0) {
            // Strategy: Delete all existing assignments and re-insert
            // This is safe because it's a join table without extra metadata (except is_primary which we re-calculate)
            const { error: deleteError } = await supabase.from("salon_assigned_types").delete().eq("salon_id", id);
            if (deleteError) {
                console.error("Error clearing old types:", deleteError);
            // We continue to try inserting even if delete failed (though unique constraint might hit)
            }
            const effectivePrimary = primary_type_id || data[0].type_id;
            const assignments = type_ids.map((tid)=>({
                    salon_id: id,
                    type_id: tid,
                    is_primary: tid === effectivePrimary
                }));
            const { error: insertError } = await supabase.from("salon_assigned_types").insert(assignments);
            if (insertError) console.error("Error updating salon types:", insertError);
        }
        return data[0];
    },
    /**
   * Update salon plan
   */ async updateSalonPlan (id, plan, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("salons").update({
            plan
        }).eq("id", id);
        if (error) throw error;
    },
    /**
   * Delete salon
   */ async deleteSalon (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("salons").delete().eq("id", id);
        if (error) throw error;
    },
    /**
   * Get salon details by owner user ID (Returns list of all salons owned)
   */ async getSalonsByOwner (ownerId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data: salonIds, error: salonError } = await supabase.from("salons").select("id").eq("owner_id", ownerId);
        if (salonError || !salonIds || salonIds.length === 0) return [];
        const { data, error } = await supabase.from("salon_details").select("*").in("id", salonIds.map((s)=>s.id));
        if (error) throw error;
        return (data || []).map((s)=>this.mapSalonDetail(s));
    },
    /**
   * Get single salon for owner (backward compatibility & dashboard)
   */ async getSalonByOwner (ownerId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const salons = await this.getSalonsByOwner(ownerId, supabase);
        return salons.length > 0 ? salons[0] : null;
    },
    /**
   * Get all salons for Admin (regardless of status)
   */ async getAllSalonsForAdmin (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_details").select("*").order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return (data || []).map((s)=>this.mapSalonDetail(s));
    },
    /**
   * Admin/System: Update salon status with optional reason
   */ async updateSalonStatus (id, status, reason, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("salons").update({
            status,
            rejected_reason: reason || null,
            updated_at: new Date().toISOString()
        }).eq("id", id);
        if (error) throw error;
    },
    /**
   * Admin: Approve a salon
   */ async approveSalon (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        await this.updateSalonStatus(id, "APPROVED", undefined, supabase);
    },
    /**
   * Admin: Request revision for a salon
   */ async requestRevision (id, reason, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        await this.updateSalonStatus(id, "REVISION_REQUESTED", reason, supabase);
    },
    /**
   * Admin: Reject a salon
   */ async rejectSalon (id, reason, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        await this.updateSalonStatus(id, "REJECTED", reason, supabase);
    },
    /**
   * Admin: Suspend a salon
   */ async suspendSalon (id, reason, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        await this.updateSalonStatus(id, "SUSPENDED", reason, supabase);
    },
    /**
   * Owner: Submit salon for approval
   */ async submitForApproval (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("salons").update({
            status: "SUBMITTED",
            updated_at: new Date().toISOString()
        }).eq("id", id);
        if (error) throw error;
    },
    /**
   * Get working hours for a salon
   */ async getSalonWorkingHours (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_working_hours").select("*").eq("salon_id", salonId).order("day_of_week");
        if (error) throw error;
        return data || [];
    },
    /**
   * Update salon working hours
   */ async updateSalonWorkingHours (id, updates, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("salon_working_hours").update(updates).eq("id", id);
        if (error) throw error;
    },
    /**
   * Initialize default working hours if missing
   */ async initializeDefaultWorkingHours (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const existing = await this.getSalonWorkingHours(salonId, supabase);
        if (existing && existing.length > 0) return existing;
        const defaultHours = [
            {
                salon_id: salonId,
                day_of_week: 1,
                start_time: "09:00",
                end_time: "20:00",
                is_closed: false
            },
            {
                salon_id: salonId,
                day_of_week: 2,
                start_time: "09:00",
                end_time: "20:00",
                is_closed: false
            },
            {
                salon_id: salonId,
                day_of_week: 3,
                start_time: "09:00",
                end_time: "20:00",
                is_closed: false
            },
            {
                salon_id: salonId,
                day_of_week: 4,
                start_time: "09:00",
                end_time: "20:00",
                is_closed: false
            },
            {
                salon_id: salonId,
                day_of_week: 5,
                start_time: "09:00",
                end_time: "20:00",
                is_closed: false
            },
            {
                salon_id: salonId,
                day_of_week: 6,
                start_time: "09:00",
                end_time: "20:00",
                is_closed: false
            },
            {
                salon_id: salonId,
                day_of_week: 0,
                start_time: "00:00",
                end_time: "00:00",
                is_closed: true
            }
        ];
        const { data, error } = await supabase.from("salon_working_hours").insert(defaultHours).select();
        if (error) throw error;
        return data || [];
    },
    /**
   * Get salon usage statistics against plan limits
   */ async getUsageStats (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_usage_stats").select("*").eq("salon_id", salonId).maybeSingle();
        if (error) throw error;
        return data;
    }
};
const WorkingHoursService = {
    /**
   * Get working hours for staff member
   */ async getWorkingHoursByStaff (staffId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("working_hours").select("*").eq("staff_id", staffId).order("day_of_week");
        if (error) throw error;
        return data || [];
    },
    /**
   * Set working hours for staff
   */ async setWorkingHours (hours, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("working_hours").upsert(hours, {
            onConflict: "staff_id,day_of_week"
        }).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Create a new staff member with default working hours
   */ async createStaff (staffData, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // Enforcement: Check subscription limit for staff
        if (staffData.salon_id) {
            const limitResult = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_finance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SubscriptionService"].checkLimit(staffData.salon_id, "staff", supabase);
            if (!limitResult.allowed) throw new Error(`SUBSCRIPTION_LIMIT_REACHED:STAFF:${limitResult.limit}`);
        }
        const { data, error } = await supabase.from("staff").insert({
            ...staffData,
            created_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        // Create default working hours (Mon-Sat 09-19, Sun Closed)
        const defaultHours = [
            1,
            2,
            3,
            4,
            5,
            6
        ].map((day)=>({
                staff_id: data.id,
                day_of_week: day,
                start_time: "09:00:00",
                end_time: "19:00:00",
                is_day_off: false
            }));
        defaultHours.push({
            staff_id: data.id,
            day_of_week: 0,
            start_time: "09:00:00",
            end_time: "19:00:00",
            is_day_off: true
        });
        await supabase.from("working_hours").insert(defaultHours);
        return data;
    },
    /**
   * Update existing staff
   */ async updateStaff (id, updates, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("staff").update({
            ...updates,
            updated_at: new Date().toISOString()
        }).eq("id", id).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Get working hours for a specific staff member
   */ async getStaffWorkingHours (staffId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("working_hours").select("*").eq("staff_id", staffId).order("day_of_week", {
            ascending: true
        });
        if (error) throw error;
        return data || [];
    },
    /**
   * Delete staff member
   */ async deleteStaff (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("staff").delete().eq("id", id);
        if (error) throw error;
    }
};
const ReviewService = {
    /**
   * Get reviews for a salon
   */ async getReviewsBySalon (salonId, limit = 50, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("verified_reviews_view") // Use the view for extra details
        .select("*").eq("salon_id", salonId).order("created_at", {
            ascending: false
        }).limit(limit);
        if (error) {
            // Fallback to regular table if view doesn't exist yet (during migration window)
            console.warn("View fetch failed, falling back to table", error);
            const { data: fallbackData, error: fallbackError } = await supabase.from("reviews").select("*").eq("salon_id", salonId).order("created_at", {
                ascending: false
            }).limit(limit);
            if (fallbackError) throw fallbackError;
            const finalData = (error ? fallbackData : data) || [];
            return finalData.map((r)=>({
                    ...r,
                    user_name: String(r.user_name || "Misafir"),
                    comment: typeof r.comment === "object" ? JSON.stringify(r.comment) : String(r.comment || ""),
                    service_name: typeof r.service_name === "object" ? r.service_name?.name : String(r.service_name || "")
                }));
        }
        // Fetch images for these reviews (from view)
        const reviewIds = (data || []).map((r)=>r.id);
        if (reviewIds.length > 0) {
            const { data: imageData } = await supabase.from("review_images").select("*").in("review_id", reviewIds);
            return (data || []).map((review)=>({
                    ...review,
                    user_name: String(review.user_name || "Misafir"),
                    comment: typeof review.comment === "object" ? JSON.stringify(review.comment) : String(review.comment || ""),
                    service_name: typeof review.service_name === "object" ? review.service_name?.name : String(review.service_name || ""),
                    images: imageData?.filter((img)=>img.review_id === review.id) || []
                }));
        }
        return (data || []).map((review)=>({
                ...review,
                user_name: String(review.user_name || "Misafir"),
                comment: typeof review.comment === "object" ? JSON.stringify(review.comment) : String(review.comment || ""),
                service_name: typeof review.service_name === "object" ? review.service_name?.name : String(review.service_name || "")
            }));
    },
    async createReview (review, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // Force is_verified to true if appointment_id is present
        const reviewData = {
            ...review,
            is_verified: !!review.appointment_id
        };
        const { data, error } = await supabase.from("reviews").insert(reviewData).select().single();
        if (error) {
            console.error("Error creating review:", error);
            throw error;
        }
        return data;
    },
    /**
   * Get eligible appointments for review (Completed appointments not yet reviewed)
   */ async getReviewableAppointments (userId, salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // 1. Get all completed appointments for this user
        let query = supabase.from("appointments").select("*, salon:salons(name, logo_url)").eq("customer_id", userId).eq("status", "COMPLETED").order("end_time", {
            ascending: false
        });
        if (salonId) {
            query = query.eq("salon_id", salonId);
        }
        const { data: appointments, error: apptError } = await query;
        if (apptError) throw apptError;
        if (!appointments || appointments.length === 0) return [];
        // 2. Get appointments that already have reviews
        let reviewQuery = supabase.from("reviews").select("appointment_id").eq("user_id", userId).not("appointment_id", "is", null);
        if (salonId) {
            reviewQuery = reviewQuery.eq("salon_id", salonId);
        }
        const { data: reviews, error: reviewError } = await reviewQuery;
        if (reviewError) throw reviewError;
        const reviewedAppointmentIds = new Set(reviews?.map((r)=>r.appointment_id) || []);
        // Filter out appointments that are already reviewed
        return appointments.filter((ppt)=>!reviewedAppointmentIds.has(ppt.id));
    },
    /**
   * Get salon rating summary
   */ async getSalonRating (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_ratings").select("*").eq("salon_id", salonId).single();
        if (error) return {
            average: 0,
            count: 0
        };
        return {
            average: data?.average_rating || 0,
            count: data?.review_count || 0
        };
    }
};
const GalleryService = {
    /**
   * Get all images for a salon gallery
   */ async getSalonGallery (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_gallery").select("*").eq("salon_id", salonId).order("display_order", {
            ascending: true
        });
        if (error) throw error;
        return data || [];
    },
    /**
   * Add image to salon gallery
   */ async addGalleryImage (image, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // Enforcement: Check subscription limit for gallery photos
        if (image.salon_id) {
            const limitResult = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_finance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SubscriptionService"].checkLimit(image.salon_id, "gallery_photo", supabase);
            if (!limitResult.allowed) throw new Error(`SUBSCRIPTION_LIMIT_REACHED:GALLERY_PHOTO:${limitResult.limit}`);
        }
        const { data, error } = await supabase.from("salon_gallery").insert(image).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Update gallery image (order, caption, cover status)
   */ async updateGalleryImage (id, updates, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_gallery").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Delete gallery image
   */ async deleteGalleryImage (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("salon_gallery").delete().eq("id", id);
        if (error) throw error;
    },
    /**
   * Set cover image for a salon
   */ async setCoverImage (salonId, imageId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // 1. Unset all cover images for this salon
        const { error: unsetErr } = await supabase.from("salon_gallery").update({
            is_cover: false
        }).eq("salon_id", salonId);
        if (unsetErr) throw unsetErr;
        // 2. Set the new cover image
        const { error: setErr } = await supabase.from("salon_gallery").update({
            is_cover: true
        }).eq("id", imageId);
        if (setErr) throw setErr;
        // 3. Update the main salons table image cache
        const { data: imgData } = await supabase.from("salon_gallery").select("image_url").eq("id", imageId).single();
        if (imgData) {
            const { error: salonErr } = await supabase.from("salons").update({
                image: imgData.image_url
            }).eq("id", salonId);
            if (salonErr) console.error("Could not update salon cover cache:", salonErr);
        }
    },
    /**
   * Get images for a specific review
   */ async getReviewImages (reviewId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("review_images").select("*").eq("review_id", reviewId);
        if (error) throw error;
        return data || [];
    },
    /**
   * Add image to a review
   */ async addReviewImage (image, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("review_images").insert(image).select().single();
        if (error) throw error;
        return data;
    }
};
const FavoriteService = {
    /**
   * Get user favorites (Current user)
   */ async getUserFavorites (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        return this.getFavorites(user.id, supabase);
    },
    /**
   * Get all favorites for a user
   */ async getFavorites (userId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("favorites").select(`
        *,
        salon:salon_details(*)
      `).eq("user_id", userId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    },
    /**
   * Check if a salon is in user's favorites
   */ async isFavorite (userId, salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("favorites").select("id").eq("user_id", userId).eq("salon_id", salonId).maybeSingle();
        if (error) return false;
        return !!data;
    },
    /**
   * Toggle favorite status
   */ async toggleFavorite (userId, salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const isFav = await this.isFavorite(userId, salonId, supabase);
        if (isFav) {
            const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("salon_id", salonId);
            if (error) throw error;
            return false;
        } else {
            const { error } = await supabase.from("favorites").insert({
                user_id: userId,
                salon_id: salonId
            });
            if (error) throw error;
            return true;
        }
    }
};
}),
"[project]/services/db/db_staff.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceService",
    ()=>ServiceService,
    "StaffAnalyticsService",
    ()=>StaffAnalyticsService,
    "StaffReviewService",
    ()=>StaffReviewService,
    "StaffService",
    ()=>StaffService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_finance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_finance.ts [app-rsc] (ecmascript)");
;
;
// Helper to check if we have a real connection
const isSupabaseConfigured = ()=>{
    return typeof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"] === "string" && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"].includes("localhost:8000");
};
const StaffService = {
    /**
   * Get all staff for a salon (with tenant check)
   */ async getStaffBySalon (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("staff").select("*").eq("salon_id", salonId).eq("is_active", true).order("name");
        if (error) throw error;
        return data || [];
    },
    /**
   * Get staff by ID (with tenant check)
   */ async getStaffById (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("staff").select("*").eq("id", id).single();
        if (error) throw error;
        return data;
    },
    /**
   * Create a new staff member with working hours
   */ async createStaff (staffData, customWorkingHours, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // Enforcement: Check subscription limit for staff
        if (staffData.salon_id) {
            const limitResult = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_finance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SubscriptionService"].checkLimit(staffData.salon_id, "staff", supabase);
            if (!limitResult.allowed) throw new Error(`SUBSCRIPTION_LIMIT_REACHED:STAFF:${limitResult.limit}`);
        }
        const { data, error } = await supabase.from("staff").insert({
            name: staffData.name,
            // map specialty to role if role is not provided
            role: staffData.role || staffData.specialty,
            phone: staffData.phone,
            photo: staffData.photo || staffData.image,
            salon_id: staffData.salon_id,
            user_id: staffData.user_id,
            created_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        let hoursToInsert;
        if (customWorkingHours && customWorkingHours.length > 0) {
            hoursToInsert = customWorkingHours.map((h)=>({
                    ...h,
                    staff_id: data.id,
                    // Ensure time format is HH:MM:SS
                    start_time: h.start_time.length === 5 ? `${h.start_time}:00` : h.start_time,
                    end_time: h.end_time.length === 5 ? `${h.end_time}:00` : h.end_time
                }));
        } else {
            // Create default working hours (Mon-Sat 09-19, Sun Closed)
            hoursToInsert = [
                1,
                2,
                3,
                4,
                5,
                6
            ].map((day)=>({
                    staff_id: data.id,
                    day_of_week: day,
                    start_time: "09:00:00",
                    end_time: "19:00:00",
                    is_day_off: false
                }));
            hoursToInsert.push({
                staff_id: data.id,
                day_of_week: 0,
                start_time: "09:00:00",
                end_time: "19:00:00",
                is_day_off: true
            });
        }
        await supabase.from("working_hours").insert(hoursToInsert);
        // 3. Auto-link to profile if email matches
        if (staffData.email && !staffData.user_id) {
            const { data: profile } = await supabase.from("profiles").select("id").eq("email", staffData.email).single();
            if (profile) {
                await supabase.from("staff").update({
                    user_id: profile.id
                }).eq("id", data.id);
                // Optionally update user role to STAFF
                await supabase.from("profiles").update({
                    role: "STAFF"
                }).eq("id", profile.id);
            }
        }
        return data;
    },
    /**
   * Update existing staff
   */ async updateStaff (id, updates, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("staff").update({
            ...updates,
            updated_at: new Date().toISOString()
        }).eq("id", id).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Get working hours for a specific staff member
   */ async getStaffWorkingHours (staffId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("working_hours").select("*").eq("staff_id", staffId).order("day_of_week", {
            ascending: true
        });
        if (error) throw error;
        return data || [];
    },
    /**
   * Delete staff member
   */ async deleteStaff (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("staff").delete().eq("id", id);
        if (error) throw error;
    },
    /**
   * Update staff working hours record
   */ async updateWorkingHours (id, updates, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("working_hours").update(updates).eq("id", id);
        if (error) throw error;
    },
    async linkStaffToServices (staffId, salonId, serviceIds, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        if (!serviceIds || serviceIds.length === 0) return;
        const assignments = serviceIds.map((serviceId)=>({
                staff_id: staffId,
                salon_id: salonId,
                salon_service_id: serviceId
            }));
        const { error } = await supabase.from("staff_services").insert(assignments);
        if (error) throw error;
    }
};
const ServiceService = {
    /**
   * Get services offered by a salon (with details)
   */ async getServicesBySalon (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_service_details").select("*").eq("salon_id", salonId).order("category_name").order("service_name");
        if (error) throw error;
        return data || [];
    },
    /**
   * Get all salon services in a single batch query (for search/homepage optimization)
   */ async getAllSalonServices (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_service_details").select("salon_id, service_name");
        if (error) throw error;
        return data || [];
    },
    /**
   * Get service by ID (with tenant check)
   */ async getServiceById (id, salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        let query = supabase.from("salon_service_details").select("*").eq("id", id);
        if (salonId) {
            query = query.eq("salon_id", salonId);
        }
        const { data, error } = await query.single();
        if (error) throw error;
        return data;
    },
    /**
   * Get all global services (for selection)
   */ async getGlobalServices (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("global_services").select("*").order("name");
        if (error) throw error;
        return data || [];
    },
    /**
   * Add a new service to a salon
   */ async createService (serviceData, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("salon_services").insert(serviceData).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Update an existing service (with tenant check)
   */ async updateService (id, updates, salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        let query = supabase.from("salon_services").update(updates).eq("id", id);
        if (salonId) {
            query = query.eq("salon_id", salonId);
        }
        const { data, error } = await query.select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Delete (or soft delete) a service (with tenant check)
   */ async deleteService (id, salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        let query = supabase.from("salon_services").delete().eq("id", id);
        if (salonId) {
            query = query.eq("salon_id", salonId);
        }
        const { error } = await query;
        if (error) throw error;
    }
};
const StaffReviewService = {
    /**
   * Get reviews for a staff member
   */ async getReviewsByStaff (staffId, limit = 50, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("staff_reviews").select("*").eq("staff_id", staffId).order("created_at", {
            ascending: false
        }).limit(limit);
        if (error) throw error;
        return data || [];
    },
    /**
   * Get reviews for all staff in a salon (detailed view)
   */ async getReviewsBySalon (salonId, limit = 50, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("staff_reviews_detailed").select("*").eq("salon_id", salonId).order("created_at", {
            ascending: false
        }).limit(limit);
        if (error) throw error;
        return data || [];
    },
    async createStaffReview (review, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // Force is_verified to true if appointment_id is present
        const reviewData = {
            ...review,
            is_verified: !!review.appointment_id
        };
        const { data, error } = await supabase.from("staff_reviews").insert(reviewData).select().single();
        if (error) {
            console.error("Error creating staff review:", error);
            throw error;
        }
        return data;
    },
    /**
   * Check if user already reviewed this staff for an appointment
   */ async hasReviewed (userId, staffId, appointmentId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data } = await supabase.from("staff_reviews").select("id").eq("user_id", userId).eq("staff_id", staffId).eq("appointment_id", appointmentId).maybeSingle();
        return !!data;
    },
    /**
   * Get appointments eligible for staff review
   */ async getReviewableAppointmentsForStaff (userId, staffId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data: appointments, error } = await supabase.from("appointments").select("*").eq("customer_id", userId).eq("staff_id", staffId).eq("status", "COMPLETED").order("end_time", {
            ascending: false
        });
        if (error) throw error;
        if (!appointments || appointments.length === 0) return [];
        const { data: existing } = await supabase.from("staff_reviews").select("appointment_id").eq("user_id", userId).eq("staff_id", staffId).not("appointment_id", "is", null);
        const reviewed = new Set(existing?.map((r)=>r.appointment_id) || []);
        return appointments.filter((a)=>!reviewed.has(a.id));
    },
    /**
   * Delete review
   */ async deleteReview (reviewId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("staff_reviews").delete().eq("id", reviewId);
        if (error) throw error;
    }
};
const StaffAnalyticsService = {
    /**
   * Get today's appointment count for a staff member (Real Data)
   */ async getTodayAppointmentsByStaff (staffId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const today = new Date().toISOString().split("T")[0];
        const { data } = await supabase.from("appointments").select("id", {
            count: "exact"
        }).eq("staff_id", staffId).gte("start_time", `${today}T00:00:00Z`).lte("start_time", `${today}T23:59:59Z`).in("status", [
            "PENDING",
            "CONFIRMED",
            "COMPLETED"
        ]);
        return data?.length || 0;
    },
    /**
   * Get weekly occupancy analysis (Real Data)
   */ async getWeeklyOccupancyByStaff (staffId, weekStart, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const weekDays = Array.from({
            length: 7
        }, (_, i)=>{
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            return d;
        });
        const results = [];
        for (const date of weekDays){
            const dateStr = date.toISOString().split("T")[0];
            // Get working hours for this day
            const { data: hours } = await supabase.from("working_hours").select("start_time, end_time, is_day_off").eq("staff_id", staffId).eq("day_of_week", date.getDay()).single();
            if (!hours || hours.is_day_off) {
                results.push({
                    date: dateStr,
                    occupancyPercent: 0,
                    bookedSlots: 0,
                    totalSlots: 0
                });
                continue;
            }
            // Calculate total slots (30 min slots)
            const [startH, startM] = hours.start_time.split(":").map(Number);
            const [endH, endM] = hours.end_time.split(":").map(Number);
            const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
            const totalSlots = Math.floor(totalMinutes / 30);
            // Get booked slots count
            const { data: appts } = await supabase.from("appointments").select(`
          start_time,
          end_time,
          service:salon_services(duration_min)
        `).eq("staff_id", staffId).gte("start_time", `${dateStr}T00:00:00Z`).lte("start_time", `${dateStr}T23:59:59Z`).in("status", [
                "PENDING",
                "CONFIRMED",
                "COMPLETED"
            ]);
            /*
       * Calculate actual booked slots
       * Ideally, this should check for overlaps, but for simplicity we assume
       * duration / 30 mins
       */ const bookedSlots = appts?.reduce((sum, a)=>{
                const duration = a.service?.duration_min || 30;
                return sum + Math.ceil(duration / 30);
            }, 0) || 0;
            const occupancyPercent = totalSlots > 0 ? bookedSlots / totalSlots * 100 : 0;
            results.push({
                date: dateStr,
                occupancyPercent: Math.round(occupancyPercent),
                bookedSlots,
                totalSlots
            });
        }
        return results;
    },
    /**
   * Get current real-time availability status
   */ async getCurrentAvailability (staffId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const now = new Date();
        const nowStr = now.toISOString();
        // Check if currently busy
        const { data: current } = await supabase.from("appointments").select(`
        *,
        service:salon_services(duration_min, global_service:global_services(name))
      `).eq("staff_id", staffId).lte("start_time", nowStr).gte("end_time", nowStr).in("status", [
            "CONFIRMED",
            "PENDING"
        ]).single();
        if (current) {
            return {
                isAvailable: false,
                currentAppointment: current,
                nextAvailableSlot: current.end_time
            };
        }
        // Find next appointment to determine free until when
        const { data: next } = await supabase.from("appointments").select("start_time").eq("staff_id", staffId).gte("start_time", nowStr).order("start_time", {
            ascending: true
        }).limit(1).single();
        return {
            isAvailable: true,
            nextAvailableSlot: next?.start_time || undefined
        };
    }
};
}),
"[project]/services/db/db_support.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuditLogService",
    ()=>AuditLogService,
    "IYSService",
    ()=>IYSService,
    "NotificationService",
    ()=>NotificationService,
    "SupportService",
    ()=>SupportService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-rsc] (ecmascript)");
;
// Helper to check if we have a real connection
const isSupabaseConfigured = ()=>{
    return typeof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"] === "string" && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"].includes("localhost:8000");
};
const SupportService = {
    /**
   * Get all tickets for a user
   */ async getTickets (userId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("support_tickets").select("*").eq("user_id", userId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    },
    /**
   * Create a new ticket with initial message
   */ async createTicket (userId, subject, category, message, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data: ticket, error: ticketError } = await supabase.from("support_tickets").insert({
            user_id: userId,
            subject,
            category,
            message,
            status: "OPEN"
        }).select().single();
        if (ticketError) throw ticketError;
        // Add initial message to thread
        const { error: msgError } = await supabase.from("ticket_messages").insert({
            ticket_id: ticket.id,
            sender_id: userId,
            sender_role: "CUSTOMER",
            content: message
        });
        if (msgError) console.warn("Initial message creation failed:", msgError.message);
        return ticket;
    },
    /**
   * Get ticket by ID
   */ async getTicketById (ticketId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("support_tickets").select("*").eq("id", ticketId).single();
        if (error) throw error;
        return data;
    },
    /**
   * Get messages for a specific ticket
   */ async getTicketMessages (ticketId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("ticket_messages").select("*").eq("ticket_id", ticketId).order("created_at", {
            ascending: true
        });
        if (error) throw error;
        return data || [];
    },
    /**
   * Get all tickets in the system (Admin only)
   */ async getAllTickets (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("support_tickets").select(`
        *,
        user:profiles(full_name, email)
      `).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    },
    /**
   * Add message to ticket (Reply)
   */ async addMessage (ticketId, senderId, senderRole, message, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error: msgError } = await supabase.from("ticket_messages").insert({
            ticket_id: ticketId,
            sender_id: senderId,
            sender_role: senderRole,
            content: message
        });
        if (msgError) throw msgError;
        // Update ticket status mainly if Admin replies or User re-opens
        // const newStatus = senderRole.includes("ADMIN") ? "IN_PROGRESS" : "OPEN";
        // Only update updated_at always, status conditionally
        // For simplicity, let's bump updated_at
        await supabase.from("support_tickets").update({
            updated_at: new Date().toISOString()
        }).eq("id", ticketId);
    },
    /**
   * Reply to a ticket as an Admin (Legacy support)
   */ async replyToTicket (ticketId, adminId, message, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        return this.addMessage(ticketId, adminId, "SUPER_ADMIN", message, supabase);
    },
    /**
   * Resolve/Close a ticket
   */ async resolveTicket (ticketId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // Try to resolve using safe RPC (for customers)
        const { error: rpcError } = await supabase.rpc("resolve_own_ticket", {
            p_ticket_id: ticketId
        });
        if (rpcError) {
            console.warn("RPC resolution failed, falling back to direct update:", rpcError);
            // Fallback for Admin or if logic changes
            const { error } = await supabase.from("support_tickets").update({
                status: "RESOLVED",
                updated_at: new Date().toISOString()
            }).eq("id", ticketId);
            if (error) throw error;
        }
    }
};
const IYSService = {
    /**
   * Log SMS send
   */ async logSMS (log, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("iys_logs").insert(log).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Get SMS logs by phone
   */ async getLogsByPhone (phone, limit = 50, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("iys_logs").select("*").eq("phone", phone).order("created_at", {
            ascending: false
        }).limit(limit);
        if (error) throw error;
        return data || [];
    },
    /**
   * Get all IYS logs (admin)
   */ async getAllLogs (limit = 100, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("iys_logs").select("*").order("created_at", {
            ascending: false
        }).limit(limit);
        if (error) throw error;
        return data || [];
    }
};
const NotificationService = {
    /**
   * Get notifications for a user
   */ async getNotifications (userId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    },
    /**
   * Mark notification as read
   */ async markAsRead (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("notifications").update({
            is_read: true
        }).eq("id", id);
        if (error) throw error;
    },
    /**
   * Send notification to user
   */ async sendNotification (notification, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // Map TypeScript field names to actual DB column names
        const { content, link, ...rest } = notification;
        const dbPayload = {
            ...rest,
            message: content ?? notification.message,
            action_url: link ?? notification.action_url,
            is_read: false,
            created_at: new Date().toISOString()
        };
        const { data, error } = await supabase.from("notifications").insert(dbPayload).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Mark all notifications as read for a user
   */ async markAllAsRead (userId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("notifications").update({
            is_read: true
        }).eq("user_id", userId).eq("is_read", false);
        if (error) throw error;
    }
};
const AuditLogService = {
    /**
   * Create a new audit log entry
   */ async logAction (log) {
        const { supabase: passedSupabase, ...logData } = log;
        const client = passedSupabase || __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"];
        const { error } = await client.from("audit_logs").insert(logData);
        if (error) {
            console.error("[AuditLogService] Error creating audit log:", error);
        }
    },
    /**
   * Get audit logs for a salon
   */ async getLogsBySalon (salonId, limit = 100, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("audit_logs").select(`
        *,
        user:profiles(full_name, email)
      `).eq("salon_id", salonId).order("created_at", {
            ascending: false
        }).limit(limit);
        if (error) throw error;
        return data || [];
    }
};
}),
"[project]/services/db/db_appointments.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppointmentService",
    ()=>AppointmentService,
    "CampaignService",
    ()=>CampaignService,
    "InviteService",
    ()=>InviteService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_support$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_support.ts [app-rsc] (ecmascript)");
;
;
// Helper to check if we have a real connection
const isSupabaseConfigured = ()=>{
    return typeof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"] === "string" && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"].includes("localhost:8000");
};
const AppointmentService = {
    /**
   * Get appointment by ID (with tenant check)
   */ async getAppointmentById (id, salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        let query = supabase.from("appointments").select("*").eq("id", id);
        if (salonId) {
            query = query.eq("salon_id", salonId);
        }
        const { data, error } = await query.single();
        if (error) throw error;
        return data;
    },
    /**
   * Get appointments for a salon
   */ async getAppointmentsBySalon (salonId, startDate, endDate, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        let query = supabase.from("appointments").select("*").eq("salon_id", salonId);
        if (startDate) {
            query = query.gte("start_time", startDate);
        }
        if (endDate) {
            query = query.lte("start_time", endDate);
        }
        query = query.order("start_time");
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },
    /**
   * Get appointments for a staff member
   */ async getAppointmentsByStaff (staffId, date, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const { data, error } = await supabase.from("appointments").select("*").eq("staff_id", staffId).gte("start_time", startOfDay.toISOString()).lte("start_time", endOfDay.toISOString()).order("start_time");
        if (error) throw error;
        return data || [];
    },
    /**
   * Get appointments by customer phone
   */ async getAppointmentsByPhone (phone, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("appointments").select("*").eq("customer_phone", phone).order("start_time", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    },
    /**
   * Create new appointment
   */ async createAppointment (appointment, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("appointments").insert(appointment).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Update appointment status (with tenant check)
   */ async updateAppointmentStatus (id, status, salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        let query = supabase.from("appointments").update({
            status
        }).eq("id", id);
        if (salonId) {
            query = query.eq("salon_id", salonId);
        }
        const { data, error } = await query.select().single();
        if (error) throw error;
        // Log the action for audit trail
        if (salonId) {
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_support$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuditLogService"].logAction({
                salon_id: salonId,
                action: `APPOINTMENT_STATUS_UPDATED_${status}`,
                resource_type: "appointment",
                resource_id: id,
                changes: {
                    status
                }
            }).catch((err)=>console.error("[AuditLog] Failed to log status update:", err));
        }
        return data;
    },
    /**
   * Cancel appointment
   */ async cancelAppointment (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        return this.updateAppointmentStatus(id, "CANCELLED", undefined, supabase);
    },
    /**
   * Update full appointment details (with tenant check)
   */ async updateAppointment (id, updates, salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        let query = supabase.from("appointments").update(updates).eq("id", id);
        if (salonId) {
            query = query.eq("salon_id", salonId);
        }
        const { data, error } = await query.select().single();
        if (error) throw error;
        return data;
    }
};
const InviteService = {
    /**
   * Create a new invite (Owner/Manager action)
   */ async createInvite (invite, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("invites").insert({
            ...invite,
            token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            status: "PENDING"
        }).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Get invite details by token (Public check)
   */ async getInviteByToken (token, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("invites").select("*, salon:salons(name)").eq("token", token).eq("status", "PENDING").single();
        if (error && error.code !== "PGRST116") throw error;
        return data;
    },
    /**
   * Accept invite and link to membership
   */ async acceptInvite (inviteId, userId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data: invite, error: fetchErr } = await supabase.from("invites").select("*").eq("id", inviteId).single();
        if (fetchErr) throw fetchErr;
        // 1. Create membership
        const { error: memErr } = await supabase.from("salon_memberships").insert({
            user_id: userId,
            salon_id: invite.salon_id,
            role: invite.role,
            is_active: true
        });
        if (memErr) throw memErr;
        // 2. Mark invite as accepted
        const { error: updErr } = await supabase.from("invites").update({
            status: "ACCEPTED",
            accepted_at: new Date().toISOString()
        }).eq("id", inviteId);
        if (updErr) throw updErr;
    }
};
const CampaignService = {
    /**
   * Validate a coupon code for a specific salon and amount
   */ async validateCoupon (code, salonId, amount, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("coupons").select("*").eq("code", code.toUpperCase()).eq("salon_id", salonId).eq("is_active", true).single();
        if (error || !data) throw new Error("Geçersiz veya süresi dolmuş kupon kodu.");
        // Check usage limit
        if (data.usage_limit && data.used_count >= data.usage_limit) {
            throw new Error("Bu kuponun kullanım sınırı dolmuştur.");
        }
        // Check expiry date
        if (data.end_date && new Date(data.end_date) < new Date()) {
            throw new Error("Bu kuponun süresi dolmuştur.");
        }
        // Check minimum purchase amount
        if (data.min_purchase_amount && amount < data.min_purchase_amount) {
            throw new Error(`Minimum sepet tutarı ${data.min_purchase_amount} TL olmalıdır.`);
        }
        return data;
    },
    /**
   * Get coupons for a salon (Admin/Owner view)
   */ async getSalonCoupons (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("coupons").select("*").eq("salon_id", salonId).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    },
    /**
   * Create a new coupon
   */ async createCoupon (coupon, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("coupons").insert(coupon).select().single();
        if (error) throw error;
        return data;
    },
    /**
   * Delete a coupon
   */ async deleteCoupon (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("coupons").delete().eq("id", id);
        if (error) throw error;
    },
    /**
   * Get all active packages for a salon
   */ async getSalonPackages (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("packages").select(`
        *,
        services:package_services(
          *,
          service:salon_services(*)
        )
      `).eq("salon_id", salonId).eq("is_active", true);
        if (error) throw error;
        return data || [];
    },
    /**
   * Create a new package
   */ async createPackage (packageData, services, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // 1. Create the package
        const { data: pkg, error: pkgError } = await supabase.from("packages").insert(packageData).select().single();
        if (pkgError) throw pkgError;
        // 2. Add services to the package
        const packageServices = services.map((s)=>({
                package_id: pkg.id,
                salon_service_id: s.salon_service_id,
                quantity: s.quantity
            }));
        const { error: srvError } = await supabase.from("package_services").insert(packageServices);
        if (srvError) throw srvError;
        return pkg;
    },
    /**
   * Delete a package
   */ async deletePackage (id, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("packages").delete().eq("id", id);
        if (error) throw error;
    }
};
}),
"[project]/services/db/db_user.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardService",
    ()=>DashboardService,
    "ProfileService",
    ()=>ProfileService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_support$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_support.ts [app-rsc] (ecmascript)");
;
;
// Helper to check if we have a real connection
const isSupabaseConfigured = ()=>{
    return typeof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"] === "string" && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseUrl"].includes("localhost:8000");
};
const DashboardService = {
    /**
   * Get main dashboard metrics for a user
   */ async getDashboardData (userId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
        const upcomingQuery = supabase.from("appointments").select("*", {
            count: "exact",
            head: true
        }).eq("status", "CONFIRMED").gt("start_time", new Date().toISOString()).eq("customer_id", userId);
        const reviewQuery = supabase.from("reviews").select("*", {
            count: "exact",
            head: true
        }).eq("user_id", userId);
        const spendingQuery = supabase.from("appointments").select(`
        salon_service:salon_services (
          price
        )
      `).in("status", [
            "CONFIRMED",
            "COMPLETED"
        ]).gte("start_time", startOfMonth).lte("start_time", endOfMonth).eq("customer_id", userId);
        const nextAppointmentQuery = supabase.from("appointments").select(`
        *,
        salon:salons (
          name,
          address,
          image,
          city:cities(name),
          district:districts(name)
        ),
        service:salon_services (
          price,
          global_service:global_services(name)
        )
      `).gt("start_time", new Date().toISOString()).eq("status", "CONFIRMED").eq("customer_id", userId).order("start_time", {
            ascending: true
        }).limit(1).maybeSingle();
        const [upcoming, reviews, spending, nextAppt] = await Promise.all([
            upcomingQuery,
            reviewQuery,
            spendingQuery,
            nextAppointmentQuery
        ]);
        const totalSpending = spending.data?.reduce((acc, curr)=>acc + (curr.salon_service?.price || 0), 0) || 0;
        return {
            upcomingCount: upcoming.count || 0,
            reviewCount: reviews.count || 0,
            monthlySpending: totalSpending,
            nextAppointment: nextAppt.data
        };
    },
    /**
   * Get advanced analytics for salon owners
   */ async getOwnerDashboardData (salonId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
        // 1. Income & Appointments over time
        const { data: appts, error } = await supabase.from("appointments").select(`
        id,
        start_time,
        status,
        service:salon_services (price, name)
      `).eq("salon_id", salonId).gte("start_time", thirtyDaysAgoStr).in("status", [
            "CONFIRMED",
            "COMPLETED"
        ]);
        if (error) throw error;
        // Process daily stats for charts
        const dailyStats = {};
        appts?.forEach((a)=>{
            const day = a.start_time.split("T")[0];
            if (!dailyStats[day]) {
                dailyStats[day] = {
                    date: day,
                    income: 0,
                    appointments: 0
                };
            }
            dailyStats[day].income += a.service?.price || 0;
            dailyStats[day].appointments += 1;
        });
        const chartData = Object.values(dailyStats).sort((a, b)=>a.date.localeCompare(b.date));
        // 2. Staff Performance
        const { data: staffData } = await supabase.from("staff").select(`
        id,
        name,
        appointments:appointments(id, status)
      `).eq("salon_id", salonId);
        const staffPerformance = staffData?.map((s)=>({
                name: s.name,
                appointments: s.appointments?.filter((a)=>a.status !== "CANCELLED").length || 0
            })).sort((a, b)=>b.appointments - a.appointments) || [];
        // 3. Service Popularity
        const serviceCounts = {};
        appts?.forEach((a)=>{
            const name = a.service?.name || "Diğer";
            serviceCounts[name] = (serviceCounts[name] || 0) + 1;
        });
        const serviceStats = Object.entries(serviceCounts).map(([name, value])=>({
                name,
                value
            })).sort((a, b)=>b.value - a.value).slice(0, 5);
        // 4. Summaries
        const totalIncome = appts?.reduce((acc, curr)=>acc + (curr.service?.price || 0), 0) || 0;
        return {
            chartData,
            staffPerformance,
            serviceStats,
            summary: {
                totalIncome,
                totalAppointments: appts?.length || 0,
                activeCustomers: new Set(appts?.map((a)=>a.customer_id)).size
            }
        };
    },
    /**
   * Get dynamic recommendations for the user
   */ async getRecommendedSalons (limit = 3, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        // Basic logic: high rating + sponsored
        const { data, error } = await supabase.from("salon_details").select("*").order("is_sponsored", {
            ascending: false
        }).order("average_rating", {
            ascending: false
        }).limit(limit);
        if (error) throw error;
        return data || [];
    },
    /**
   * Get platform-wide statistics for SUPER_ADMIN
   */ async getPlatformStats (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const today = new Date().toISOString().split("T")[0];
        const [salons, appointments, staff] = await Promise.all([
            supabase.from("salons").select("*", {
                count: "exact",
                head: true
            }),
            supabase.from("appointments").select("*", {
                count: "exact",
                head: true
            }).gte("start_time", `${today}T00:00:00Z`),
            supabase.from("staff").select("*", {
                count: "exact",
                head: true
            }).eq("is_active", true)
        ]);
        const { data: revenueData } = await supabase.from("appointments").select("service:salon_services(price)").eq("status", "COMPLETED");
        const totalRevenue = revenueData?.reduce((acc, curr)=>acc + (curr.service?.price || 0), 0) || 0;
        return {
            totalSalons: salons.count || 0,
            todayAppointments: appointments.count || 0,
            totalRevenue,
            activeStaff: staff.count || 0
        };
    }
};
const ProfileService = {
    /**
   * Get profile by ID
   */ async getProfile (userId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("profiles").select("*, default_city:cities(name)").eq("id", userId).single();
        if (error) throw error;
        return data;
    },
    /**
   * Update profile information
   */ async updateProfile (userId, updates, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("profiles").update({
            ...updates,
            updated_at: new Date().toISOString()
        }).eq("id", userId).select().single();
        if (error) throw error;
        // Log the action
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_support$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuditLogService"].logAction({
            salon_id: updates.default_city_id || "",
            user_id: userId,
            action: "PROFILE_UPDATED",
            resource_type: "profile",
            resource_id: userId,
            changes: updates,
            supabase
        }).catch((err)=>console.error("[AuditLog] Failed to log profile update:", err));
        return data;
    },
    /**
   * Request account deletion (Soft Delete)
   */ async requestAccountDeletion (supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.rpc("request_account_deletion");
        if (error) throw error;
        if (user) {
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_support$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuditLogService"].logAction({
                salon_id: "",
                user_id: user.id,
                action: "ACCOUNT_DELETION_REQUESTED",
                resource_type: "profile",
                resource_id: user.id,
                supabase
            }).catch((err)=>console.error("[AuditLog] Failed to log deletion request:", err));
        }
    },
    /**
   * Get active sessions for a user
   */ async getActiveSessions (userId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data, error } = await supabase.from("user_sessions").select("*").eq("user_id", userId).eq("is_revoked", false).order("last_active_at", {
            ascending: false
        });
        if (error) throw error;
        return data || [];
    },
    /**
   * Terminate a specific session
   */ async terminateSession (sessionId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("user_sessions").update({
            is_revoked: true
        }).eq("id", sessionId);
        if (error) throw error;
        if (user) {
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_support$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuditLogService"].logAction({
                salon_id: "",
                user_id: user.id,
                action: "SESSION_TERMINATED",
                resource_type: "session",
                resource_id: sessionId,
                supabase
            }).catch((err)=>console.error("[AuditLog] Failed to log session termination:", err));
        }
    },
    /**
   * Terminate all other sessions
   */ async terminateAllOtherSessions (userId, currentSessionId, supabase = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"]) {
        const { error } = await supabase.from("user_sessions").update({
            is_revoked: true
        }).eq("user_id", userId).neq("id", currentSessionId);
        if (error) throw error;
    }
};
}),
"[project]/services/db.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_core.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_salon$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_salon.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_staff$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_staff.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_appointments$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_appointments.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_finance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_finance.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_support$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_support.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_user.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
}),
"[project]/app/salon/[id]/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SalonLayout,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/services/db.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_salon$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/db/db_salon.ts [app-rsc] (ecmascript)");
;
;
async function generateMetadata({ params }, parent) {
    const { id } = await params;
    try {
        const salon = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$db$2f$db_salon$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SalonDataService"].getSalonById(id);
        if (!salon) {
            return {
                title: 'Güzellik Randevu - Salon Bulunamadı',
                description: 'Aradığınız güzellik salonu bulunamadı.'
            };
        }
        const title = `${salon.name} - ${salon.district_name}, ${salon.city_name} | Güzellik Randevu`;
        const description = salon.description || `${salon.name} salonu için online randevu al. ${salon.district_name} bölgesindeki en iyi güzellik hizmetleri.`;
        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: salon.image ? [
                    salon.image
                ] : [],
                type: 'website'
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: salon.image ? [
                    salon.image
                ] : []
            },
            keywords: [
                salon.name,
                salon.district_name,
                salon.city_name,
                'güzellik salonu',
                'randevu',
                'kuaför',
                'bakım',
                ...salon.tags || []
            ]
        };
    } catch (error) {
        return {
            title: 'Güzellik Randevu',
            description: 'Güzellik salonu randevu sistemi'
        };
    }
}
function SalonLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
}),
];

//# sourceMappingURL=_cd0f43e3._.js.map