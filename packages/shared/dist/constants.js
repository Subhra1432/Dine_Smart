// ═══════════════════════════════════════════
// DineSmart OS — Shared Constants
// ═══════════════════════════════════════════
export const ROLES = {
    OWNER: 'OWNER',
    MANAGER: 'MANAGER',
    CASHIER: 'CASHIER',
    KITCHEN_STAFF: 'KITCHEN_STAFF',
};
export const ROLE_HIERARCHY = {
    OWNER: 4,
    MANAGER: 3,
    CASHIER: 2,
    KITCHEN_STAFF: 1,
};
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    SERVED: 'SERVED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};
export const ORDER_ITEM_STATUS = {
    PENDING: 'PENDING',
    PREPARING: 'PREPARING',
    READY: 'READY',
    SERVED: 'SERVED',
};
export const PAYMENT_STATUS = {
    UNPAID: 'UNPAID',
    PAID: 'PAID',
    PARTIAL: 'PARTIAL',
    REFUNDED: 'REFUNDED',
};
export const PAYMENT_METHOD = {
    CASH: 'CASH',
    UPI: 'UPI',
    CARD: 'CARD',
};
export const DISCOUNT_TYPE = {
    PERCENT: 'PERCENT',
    FLAT: 'FLAT',
};
export const PLAN = {
    STARTER: 'STARTER',
    GROWTH: 'GROWTH',
    PREMIUM: 'PREMIUM',
};
export const PLAN_LIMITS = {
    STARTER: {
        maxBranches: 2,
        maxTables: 20,
        aiRecommendations: false,
        aiDemandForecast: false,
        aiSmartPricing: false,
        inventory: false,
        analytics: false,
        whiteLabel: false,
        monthlyPrice: 999,
    },
    GROWTH: {
        maxBranches: 5,
        maxTables: 50,
        aiRecommendations: true,
        aiDemandForecast: true,
        aiSmartPricing: false,
        inventory: false,
        analytics: true,
        whiteLabel: false,
        monthlyPrice: 2499,
    },
    PREMIUM: {
        maxBranches: -1,
        maxTables: -1,
        aiRecommendations: true,
        aiDemandForecast: true,
        aiSmartPricing: true,
        inventory: true,
        analytics: true,
        whiteLabel: true,
        monthlyPrice: 7499,
    },
};
export const NOTIFICATION_TYPES = {
    ORDER_NEW: 'ORDER_NEW',
    ORDER_STATUS: 'ORDER_STATUS',
    PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
    LOW_STOCK: 'LOW_STOCK',
    REVIEW_NEW: 'REVIEW_NEW',
};
export const TAX_RATE = 0.05; // 5% GST
export const LOYALTY_POINTS_PER_RUPEE = 0.1; // 1 point per ₹10
export const LOYALTY_REDEMPTION_RATE = 0.1; // 100 points = ₹10
export const POPULAR_THRESHOLD = 50; // orders to be marked "popular"
//# sourceMappingURL=constants.js.map