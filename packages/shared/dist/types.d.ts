import type { Role, OrderStatus, OrderItemStatus, PaymentStatus, PaymentMethod, DiscountType, Plan, NotificationType } from './constants.js';
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}
export interface ApiErrorResponse {
    success: false;
    error: string;
    details?: Array<{
        field: string;
        message: string;
    }>;
}
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface SuperAdminType {
    id: string;
    email: string;
    createdAt: string;
}
export interface RestaurantType {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    plan: Plan;
    planExpiresAt: string | null;
    isActive: boolean;
    createdAt: string;
}
export interface BranchType {
    id: string;
    restaurantId: string;
    name: string;
    address: string;
    phone: string;
    timezone: string;
    isActive: boolean;
}
export interface UserType {
    id: string;
    restaurantId: string;
    email: string;
    role: Role;
    branchId: string | null;
    isActive: boolean;
}
export interface TableType {
    id: string;
    branchId: string;
    restaurantId: string;
    number: number;
    qrCodeUrl: string | null;
    isOccupied: boolean;
    capacity: number;
}
export interface CategoryType {
    id: string;
    restaurantId: string;
    name: string;
    sortOrder: number;
    isActive: boolean;
}
export interface MenuItemType {
    id: string;
    restaurantId: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean;
    isVeg: boolean;
    preparationTimeMinutes: number;
    sortOrder: number;
    tags: string[];
    orderCount: number;
    variants?: MenuItemVariantType[];
    addons?: AddonType[];
}
export interface MenuItemVariantType {
    id: string;
    menuItemId: string;
    name: string;
    additionalPrice: number;
}
export interface AddonType {
    id: string;
    restaurantId: string;
    name: string;
    price: number;
    isAvailable: boolean;
}
export interface OrderType {
    id: string;
    restaurantId: string;
    branchId: string;
    tableId: string;
    sessionId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod | null;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
    items?: OrderItemType[];
    table?: TableType;
}
export interface OrderItemType {
    id: string;
    orderId: string;
    menuItemId: string;
    variantId: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    addons: string[];
    specialInstructions: string;
    status: OrderItemStatus;
    menuItem?: MenuItemType;
    variant?: MenuItemVariantType;
}
export interface PaymentType {
    id: string;
    orderId: string;
    restaurantId: string;
    amount: number;
    method: PaymentMethod;
    gatewayOrderId: string | null;
    gatewayPaymentId: string | null;
    status: string;
    createdAt: string;
}
export interface InventoryItemType {
    id: string;
    restaurantId: string;
    branchId: string;
    name: string;
    unit: string;
    currentStock: number;
    minThreshold: number;
    costPrice: number;
}
export interface CouponType {
    id: string;
    restaurantId: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue: number;
    maxUses: number;
    usedCount: number;
    expiresAt: string;
    isActive: boolean;
}
export interface LoyaltyAccountType {
    id: string;
    restaurantId: string;
    customerId: string;
    points: number;
    totalEarned: number;
}
export interface CustomerType {
    id: string;
    restaurantId: string;
    phone: string;
    name: string | null;
    email: string | null;
    createdAt: string;
}
export interface ReviewType {
    id: string;
    orderId: string;
    restaurantId: string;
    rating: number;
    comment: string;
    createdAt: string;
}
export interface NotificationEntityType {
    id: string;
    restaurantId: string;
    branchId: string | null;
    type: NotificationType;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
}
export interface JwtAccessPayload {
    userId: string;
    restaurantId: string;
    role: Role;
    branchId: string | null;
}
export interface JwtRefreshPayload {
    userId: string;
    tokenVersion: number;
}
export interface JwtSuperAdminPayload {
    superAdminId: string;
    scope: 'superadmin';
}
export interface MenuGroupedResponse {
    restaurant: {
        id: string;
        name: string;
        logoUrl: string | null;
    };
    table: {
        id: string;
        number: number;
    };
    categories: Array<CategoryType & {
        items: MenuItemType[];
    }>;
}
export interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
}
export interface MenuPerformanceItem {
    menuItemId: string;
    name: string;
    orderCount: number;
    revenue: number;
}
export interface PeakHourData {
    hour: number;
    dayOfWeek: number;
    orderCount: number;
}
export interface TablePerformanceData {
    tableId: string;
    tableNumber: number;
    avgRevenue: number;
    totalOrders: number;
    avgSessionMinutes: number;
}
export interface DashboardOverview {
    todayRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    tableTurnoverRate: number;
    pendingPayments: number;
}
export interface PlatformStats {
    mrr: number;
    totalRestaurants: number;
    activeRestaurants: number;
    totalOrdersToday: number;
    churnRate: number;
}
export interface RecommendationItem {
    menuItemId: string;
    name: string;
    price: number;
    imageUrl: string | null;
    confidence: number;
}
export interface DemandForecast {
    menuItemId: string;
    name: string;
    expectedOrders: number;
    isHighDemand: boolean;
}
export interface PricingSuggestion {
    menuItemId: string;
    name: string;
    currentPrice: number;
    suggestedPrice: number;
    reason: string;
}
//# sourceMappingURL=types.d.ts.map