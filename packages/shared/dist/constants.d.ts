export declare const ROLES: {
    readonly OWNER: "OWNER";
    readonly MANAGER: "MANAGER";
    readonly CASHIER: "CASHIER";
    readonly KITCHEN_STAFF: "KITCHEN_STAFF";
};
export type Role = (typeof ROLES)[keyof typeof ROLES];
export declare const ROLE_HIERARCHY: Record<Role, number>;
export declare const ORDER_STATUS: {
    readonly PENDING: "PENDING";
    readonly CONFIRMED: "CONFIRMED";
    readonly PREPARING: "PREPARING";
    readonly READY: "READY";
    readonly SERVED: "SERVED";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
};
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export declare const ORDER_ITEM_STATUS: {
    readonly PENDING: "PENDING";
    readonly PREPARING: "PREPARING";
    readonly READY: "READY";
    readonly SERVED: "SERVED";
};
export type OrderItemStatus = (typeof ORDER_ITEM_STATUS)[keyof typeof ORDER_ITEM_STATUS];
export declare const PAYMENT_STATUS: {
    readonly UNPAID: "UNPAID";
    readonly PAID: "PAID";
    readonly PARTIAL: "PARTIAL";
    readonly REFUNDED: "REFUNDED";
};
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export declare const PAYMENT_METHOD: {
    readonly CASH: "CASH";
    readonly UPI: "UPI";
    readonly CARD: "CARD";
};
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export declare const DISCOUNT_TYPE: {
    readonly PERCENT: "PERCENT";
    readonly FLAT: "FLAT";
};
export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];
export declare const PLAN: {
    readonly STARTER: "STARTER";
    readonly GROWTH: "GROWTH";
    readonly PREMIUM: "PREMIUM";
};
export type Plan = (typeof PLAN)[keyof typeof PLAN];
export declare const PLAN_LIMITS: Record<Plan, {
    maxBranches: number;
    maxTables: number;
    aiRecommendations: boolean;
    aiDemandForecast: boolean;
    aiSmartPricing: boolean;
    inventory: boolean;
    analytics: boolean;
    whiteLabel: boolean;
    monthlyPrice: number;
}>;
export declare const NOTIFICATION_TYPES: {
    readonly ORDER_NEW: "ORDER_NEW";
    readonly ORDER_STATUS: "ORDER_STATUS";
    readonly PAYMENT_RECEIVED: "PAYMENT_RECEIVED";
    readonly LOW_STOCK: "LOW_STOCK";
    readonly REVIEW_NEW: "REVIEW_NEW";
};
export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
export declare const TAX_RATE = 0.05;
export declare const LOYALTY_POINTS_PER_RUPEE = 0.1;
export declare const LOYALTY_REDEMPTION_RATE = 0.1;
export declare const POPULAR_THRESHOLD = 50;
//# sourceMappingURL=constants.d.ts.map