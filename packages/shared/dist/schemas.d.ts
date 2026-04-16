import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    restaurantName: z.ZodString;
    ownerName: z.ZodString;
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    restaurantName: string;
    ownerName: string;
    phone: string;
}, {
    email: string;
    password: string;
    restaurantName: string;
    ownerName: string;
    phone: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
}, {
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    refreshToken?: string | undefined;
}, {
    refreshToken?: string | undefined;
}>;
export declare const updateRestaurantSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    logoUrl?: string | undefined;
}, {
    name?: string | undefined;
    logoUrl?: string | undefined;
}>;
export declare const createBranchSchema: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodString;
    phone: z.ZodString;
    timezone: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    name: string;
    address: string;
    timezone: string;
}, {
    phone: string;
    name: string;
    address: string;
    timezone?: string | undefined;
}>;
export declare const updateBranchSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    phone?: string | undefined;
    name?: string | undefined;
    address?: string | undefined;
    timezone?: string | undefined;
    isActive?: boolean | undefined;
}, {
    phone?: string | undefined;
    name?: string | undefined;
    address?: string | undefined;
    timezone?: string | undefined;
    isActive?: boolean | undefined;
}>;
export declare const createTableSchema: z.ZodObject<{
    branchId: z.ZodString;
    number: z.ZodNumber;
    capacity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    number: number;
    branchId: string;
    capacity: number;
}, {
    number: number;
    branchId: string;
    capacity: number;
}>;
export declare const updateTableSchema: z.ZodObject<{
    number: z.ZodOptional<z.ZodNumber>;
    capacity: z.ZodOptional<z.ZodNumber>;
    isOccupied: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    number?: number | undefined;
    capacity?: number | undefined;
    isOccupied?: boolean | undefined;
}, {
    number?: number | undefined;
    capacity?: number | undefined;
    isOccupied?: boolean | undefined;
}>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sortOrder: number;
}, {
    name: string;
    sortOrder?: number | undefined;
}>;
export declare const updateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
}>;
export declare const createMenuItemSchema: z.ZodObject<{
    categoryId: z.ZodString;
    name: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    price: z.ZodNumber;
    imageUrl: z.ZodOptional<z.ZodString>;
    isVeg: z.ZodDefault<z.ZodBoolean>;
    preparationTimeMinutes: z.ZodDefault<z.ZodNumber>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    variants: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        additionalPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        additionalPrice: number;
    }, {
        name: string;
        additionalPrice: number;
    }>, "many">>;
    addonIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sortOrder: number;
    categoryId: string;
    description: string;
    price: number;
    isVeg: boolean;
    preparationTimeMinutes: number;
    tags: string[];
    variants: {
        name: string;
        additionalPrice: number;
    }[];
    addonIds: string[];
    imageUrl?: string | undefined;
}, {
    name: string;
    categoryId: string;
    price: number;
    sortOrder?: number | undefined;
    description?: string | undefined;
    imageUrl?: string | undefined;
    isVeg?: boolean | undefined;
    preparationTimeMinutes?: number | undefined;
    tags?: string[] | undefined;
    variants?: {
        name: string;
        additionalPrice: number;
    }[] | undefined;
    addonIds?: string[] | undefined;
}>;
export declare const updateMenuItemSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    price: z.ZodOptional<z.ZodNumber>;
    imageUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isVeg: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    preparationTimeMinutes: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    variants: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        additionalPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        additionalPrice: number;
    }, {
        name: string;
        additionalPrice: number;
    }>, "many">>>;
    addonIds: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
} & {
    isAvailable: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    sortOrder?: number | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    imageUrl?: string | undefined;
    isVeg?: boolean | undefined;
    preparationTimeMinutes?: number | undefined;
    tags?: string[] | undefined;
    variants?: {
        name: string;
        additionalPrice: number;
    }[] | undefined;
    addonIds?: string[] | undefined;
    isAvailable?: boolean | undefined;
}, {
    name?: string | undefined;
    sortOrder?: number | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    imageUrl?: string | undefined;
    isVeg?: boolean | undefined;
    preparationTimeMinutes?: number | undefined;
    tags?: string[] | undefined;
    variants?: {
        name: string;
        additionalPrice: number;
    }[] | undefined;
    addonIds?: string[] | undefined;
    isAvailable?: boolean | undefined;
}>;
export declare const createAddonSchema: z.ZodObject<{
    name: z.ZodString;
    price: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    price: number;
}, {
    name: string;
    price: number;
}>;
export declare const updateAddonSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
} & {
    isAvailable: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    price?: number | undefined;
    isAvailable?: boolean | undefined;
}, {
    name?: string | undefined;
    price?: number | undefined;
    isAvailable?: boolean | undefined;
}>;
export declare const createOrderSchema: z.ZodObject<{
    tableId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodString;
        variantId: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        addonIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        specialInstructions: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        addonIds: string[];
        menuItemId: string;
        quantity: number;
        specialInstructions: string;
        variantId?: string | undefined;
    }, {
        menuItemId: string;
        quantity: number;
        addonIds?: string[] | undefined;
        variantId?: string | undefined;
        specialInstructions?: string | undefined;
    }>, "many">;
    couponCode: z.ZodOptional<z.ZodString>;
    customerPhone: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    notes: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tableId: string;
    items: {
        addonIds: string[];
        menuItemId: string;
        quantity: number;
        specialInstructions: string;
        variantId?: string | undefined;
    }[];
    notes: string;
    couponCode?: string | undefined;
    customerPhone?: string | undefined;
    customerName?: string | undefined;
}, {
    tableId: string;
    items: {
        menuItemId: string;
        quantity: number;
        addonIds?: string[] | undefined;
        variantId?: string | undefined;
        specialInstructions?: string | undefined;
    }[];
    couponCode?: string | undefined;
    customerPhone?: string | undefined;
    customerName?: string | undefined;
    notes?: string | undefined;
}>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "CONFIRMED", "PREPARING", "READY", "SERVED", "COMPLETED", "CANCELLED"]>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
}, {
    status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
}>;
export declare const updateOrderItemStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "PREPARING", "READY", "SERVED"]>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "PREPARING" | "READY" | "SERVED";
}, {
    status: "PENDING" | "PREPARING" | "READY" | "SERVED";
}>;
export declare const updatePaymentStatusSchema: z.ZodObject<{
    paymentStatus: z.ZodEnum<["UNPAID", "PAID", "PARTIAL", "REFUNDED"]>;
    paymentMethod: z.ZodOptional<z.ZodEnum<["CASH", "UPI", "CARD"]>>;
}, "strip", z.ZodTypeAny, {
    paymentStatus: "UNPAID" | "PAID" | "PARTIAL" | "REFUNDED";
    paymentMethod?: "CASH" | "UPI" | "CARD" | undefined;
}, {
    paymentStatus: "UNPAID" | "PAID" | "PARTIAL" | "REFUNDED";
    paymentMethod?: "CASH" | "UPI" | "CARD" | undefined;
}>;
export declare const initiatePaymentSchema: z.ZodObject<{
    orderId: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
    itemIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    amount?: number | undefined;
    itemIds?: string[] | undefined;
}, {
    orderId: string;
    amount?: number | undefined;
    itemIds?: string[] | undefined;
}>;
export declare const razorpayWebhookSchema: z.ZodObject<{
    razorpay_order_id: z.ZodString;
    razorpay_payment_id: z.ZodString;
    razorpay_signature: z.ZodString;
}, "strip", z.ZodTypeAny, {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}, {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}>;
export declare const orderFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "CONFIRMED", "PREPARING", "READY", "SERVED", "COMPLETED", "CANCELLED"]>>;
    paymentStatus: z.ZodOptional<z.ZodEnum<["UNPAID", "PAID", "PARTIAL", "REFUNDED"]>>;
    tableId: z.ZodOptional<z.ZodString>;
    branchId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED" | undefined;
    branchId?: string | undefined;
    tableId?: string | undefined;
    paymentStatus?: "UNPAID" | "PAID" | "PARTIAL" | "REFUNDED" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    status?: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED" | undefined;
    branchId?: string | undefined;
    tableId?: string | undefined;
    paymentStatus?: "UNPAID" | "PAID" | "PARTIAL" | "REFUNDED" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const refundSchema: z.ZodObject<{
    reason: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    amount?: number | undefined;
}, {
    reason: string;
    amount?: number | undefined;
}>;
export declare const createInventoryItemSchema: z.ZodObject<{
    branchId: z.ZodString;
    name: z.ZodString;
    unit: z.ZodString;
    currentStock: z.ZodDefault<z.ZodNumber>;
    minThreshold: z.ZodDefault<z.ZodNumber>;
    costPrice: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    branchId: string;
    unit: string;
    currentStock: number;
    minThreshold: number;
    costPrice: number;
}, {
    name: string;
    branchId: string;
    unit: string;
    currentStock?: number | undefined;
    minThreshold?: number | undefined;
    costPrice?: number | undefined;
}>;
export declare const updateInventoryItemSchema: z.ZodObject<{
    branchId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    unit: z.ZodOptional<z.ZodString>;
    currentStock: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    minThreshold: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    costPrice: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    branchId?: string | undefined;
    unit?: string | undefined;
    currentStock?: number | undefined;
    minThreshold?: number | undefined;
    costPrice?: number | undefined;
}, {
    name?: string | undefined;
    branchId?: string | undefined;
    unit?: string | undefined;
    currentStock?: number | undefined;
    minThreshold?: number | undefined;
    costPrice?: number | undefined;
}>;
export declare const updateStockSchema: z.ZodObject<{
    quantity: z.ZodNumber;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    reason: string;
}, {
    quantity: number;
    reason: string;
}>;
export declare const menuItemInventorySchema: z.ZodObject<{
    menuItemId: z.ZodString;
    inventoryItemId: z.ZodString;
    quantityUsed: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    menuItemId: string;
    inventoryItemId: string;
    quantityUsed: number;
}, {
    menuItemId: string;
    inventoryItemId: string;
    quantityUsed: number;
}>;
export declare const createCouponSchema: z.ZodObject<{
    code: z.ZodEffects<z.ZodString, string, string>;
    discountType: z.ZodEnum<["PERCENT", "FLAT"]>;
    discountValue: z.ZodNumber;
    minOrderValue: z.ZodDefault<z.ZodNumber>;
    maxUses: z.ZodDefault<z.ZodNumber>;
    expiresAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    discountType: "PERCENT" | "FLAT";
    discountValue: number;
    minOrderValue: number;
    maxUses: number;
    expiresAt: string;
}, {
    code: string;
    discountType: "PERCENT" | "FLAT";
    discountValue: number;
    expiresAt: string;
    minOrderValue?: number | undefined;
    maxUses?: number | undefined;
}>;
export declare const updateCouponSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    discountType: z.ZodOptional<z.ZodEnum<["PERCENT", "FLAT"]>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    minOrderValue: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    maxUses: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    expiresAt: z.ZodOptional<z.ZodString>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    code?: string | undefined;
    isActive?: boolean | undefined;
    discountType?: "PERCENT" | "FLAT" | undefined;
    discountValue?: number | undefined;
    minOrderValue?: number | undefined;
    maxUses?: number | undefined;
    expiresAt?: string | undefined;
}, {
    code?: string | undefined;
    isActive?: boolean | undefined;
    discountType?: "PERCENT" | "FLAT" | undefined;
    discountValue?: number | undefined;
    minOrderValue?: number | undefined;
    maxUses?: number | undefined;
    expiresAt?: string | undefined;
}>;
export declare const validateCouponSchema: z.ZodObject<{
    code: z.ZodString;
    orderTotal: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    code: string;
    orderTotal: number;
}, {
    code: string;
    orderTotal: number;
}>;
export declare const redeemPointsSchema: z.ZodObject<{
    customerId: z.ZodString;
    points: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    points: number;
}, {
    customerId: string;
    points: number;
}>;
export declare const createReviewSchema: z.ZodObject<{
    orderId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    rating: number;
    comment: string;
}, {
    orderId: string;
    rating: number;
    comment?: string | undefined;
}>;
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["OWNER", "MANAGER", "CASHIER", "KITCHEN_STAFF"]>;
    branchId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    role: "OWNER" | "MANAGER" | "CASHIER" | "KITCHEN_STAFF";
    branchId?: string | undefined;
}, {
    email: string;
    password: string;
    role: "OWNER" | "MANAGER" | "CASHIER" | "KITCHEN_STAFF";
    branchId?: string | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["OWNER", "MANAGER", "CASHIER", "KITCHEN_STAFF"]>>;
    branchId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    isActive?: boolean | undefined;
    branchId?: string | undefined;
    role?: "OWNER" | "MANAGER" | "CASHIER" | "KITCHEN_STAFF" | undefined;
}, {
    email?: string | undefined;
    isActive?: boolean | undefined;
    branchId?: string | undefined;
    role?: "OWNER" | "MANAGER" | "CASHIER" | "KITCHEN_STAFF" | undefined;
}>;
export declare const analyticsQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    branchId: z.ZodOptional<z.ZodString>;
    granularity: z.ZodDefault<z.ZodEnum<["daily", "weekly", "monthly"]>>;
}, "strip", z.ZodTypeAny, {
    granularity: "daily" | "weekly" | "monthly";
    branchId?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
}, {
    branchId?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
    granularity?: "daily" | "weekly" | "monthly" | undefined;
}>;
export declare const updatePlanSchema: z.ZodObject<{
    plan: z.ZodEnum<["STARTER", "GROWTH", "PREMIUM"]>;
    planExpiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    plan: "STARTER" | "GROWTH" | "PREMIUM";
    planExpiresAt?: string | undefined;
}, {
    plan: "STARTER" | "GROWTH" | "PREMIUM";
    planExpiresAt?: string | undefined;
}>;
export declare const superAdminLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type CreateTableInput = z.infer<typeof createTableSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
//# sourceMappingURL=schemas.d.ts.map