import type { CreateOrderInput } from '@dinesmart/shared';
export declare function createOrder(data: CreateOrderInput): Promise<{
    table: {
        number: number;
        branchId: string;
        restaurantId: string;
        id: string;
        qrCodeUrl: string | null;
        isOccupied: boolean;
        capacity: number;
    };
    items: ({
        menuItem: {
            description: string;
            restaurantId: string;
            name: string;
            id: string;
            categoryId: string;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
            isVeg: boolean;
            preparationTimeMinutes: number;
            sortOrder: number;
            tags: string[];
            orderCount: number;
        };
        variant: {
            menuItemId: string;
            name: string;
            id: string;
            additionalPrice: number;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.OrderItemStatus;
        orderId: string;
        menuItemId: string;
        id: string;
        variantId: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        addons: string[];
        specialInstructions: string;
    })[];
} & {
    status: import(".prisma/client").$Enums.OrderStatus;
    branchId: string;
    restaurantId: string;
    id: string;
    createdAt: Date;
    paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    total: number;
    tableId: string;
    sessionId: string;
    paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
    subtotal: number;
    tax: number;
    discount: number;
    notes: string;
    customerId: string | null;
    updatedAt: Date;
}>;
export declare function getOrderBySession(sessionId: string): Promise<({
    restaurant: {
        name: string;
        slug: string;
    };
    table: {
        number: number;
        branchId: string;
        restaurantId: string;
        id: string;
        qrCodeUrl: string | null;
        isOccupied: boolean;
        capacity: number;
    };
    items: ({
        menuItem: {
            description: string;
            restaurantId: string;
            name: string;
            id: string;
            categoryId: string;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
            isVeg: boolean;
            preparationTimeMinutes: number;
            sortOrder: number;
            tags: string[];
            orderCount: number;
        };
        variant: {
            menuItemId: string;
            name: string;
            id: string;
            additionalPrice: number;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.OrderItemStatus;
        orderId: string;
        menuItemId: string;
        id: string;
        variantId: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        addons: string[];
        specialInstructions: string;
    })[];
} & {
    status: import(".prisma/client").$Enums.OrderStatus;
    branchId: string;
    restaurantId: string;
    id: string;
    createdAt: Date;
    paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    total: number;
    tableId: string;
    sessionId: string;
    paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
    subtotal: number;
    tax: number;
    discount: number;
    notes: string;
    customerId: string | null;
    updatedAt: Date;
})[]>;
export declare function getOrder(orderId: string, restaurantId?: string): Promise<{
    customer: {
        restaurantId: string;
        name: string | null;
        id: string;
        createdAt: Date;
        email: string | null;
        phone: string;
    } | null;
    table: {
        number: number;
        branchId: string;
        restaurantId: string;
        id: string;
        qrCodeUrl: string | null;
        isOccupied: boolean;
        capacity: number;
    };
    items: ({
        menuItem: {
            description: string;
            restaurantId: string;
            name: string;
            id: string;
            categoryId: string;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
            isVeg: boolean;
            preparationTimeMinutes: number;
            sortOrder: number;
            tags: string[];
            orderCount: number;
        };
        variant: {
            menuItemId: string;
            name: string;
            id: string;
            additionalPrice: number;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.OrderItemStatus;
        orderId: string;
        menuItemId: string;
        id: string;
        variantId: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        addons: string[];
        specialInstructions: string;
    })[];
    payments: {
        status: string;
        restaurantId: string;
        orderId: string;
        id: string;
        createdAt: Date;
        method: import(".prisma/client").$Enums.PaymentMethod;
        amount: number;
        gatewayOrderId: string | null;
        gatewayPaymentId: string | null;
    }[];
} & {
    status: import(".prisma/client").$Enums.OrderStatus;
    branchId: string;
    restaurantId: string;
    id: string;
    createdAt: Date;
    paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    total: number;
    tableId: string;
    sessionId: string;
    paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
    subtotal: number;
    tax: number;
    discount: number;
    notes: string;
    customerId: string | null;
    updatedAt: Date;
}>;
export declare function updateOrderStatus(orderId: string, restaurantId: string, status: string): Promise<{
    table: {
        number: number;
        branchId: string;
        restaurantId: string;
        id: string;
        qrCodeUrl: string | null;
        isOccupied: boolean;
        capacity: number;
    };
    items: ({
        menuItem: {
            description: string;
            restaurantId: string;
            name: string;
            id: string;
            categoryId: string;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
            isVeg: boolean;
            preparationTimeMinutes: number;
            sortOrder: number;
            tags: string[];
            orderCount: number;
        };
    } & {
        status: import(".prisma/client").$Enums.OrderItemStatus;
        orderId: string;
        menuItemId: string;
        id: string;
        variantId: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        addons: string[];
        specialInstructions: string;
    })[];
} & {
    status: import(".prisma/client").$Enums.OrderStatus;
    branchId: string;
    restaurantId: string;
    id: string;
    createdAt: Date;
    paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    total: number;
    tableId: string;
    sessionId: string;
    paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
    subtotal: number;
    tax: number;
    discount: number;
    notes: string;
    customerId: string | null;
    updatedAt: Date;
}>;
export declare function updatePayment(orderId: string, restaurantId: string, paymentStatus: string, paymentMethod?: string): Promise<{
    status: import(".prisma/client").$Enums.OrderStatus;
    branchId: string;
    restaurantId: string;
    id: string;
    createdAt: Date;
    paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    total: number;
    tableId: string;
    sessionId: string;
    paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
    subtotal: number;
    tax: number;
    discount: number;
    notes: string;
    customerId: string | null;
    updatedAt: Date;
}>;
export declare function initiatePayment(orderId: string): Promise<{
    orderId: string;
    stripeSessionId: any;
    stripeSessionUrl: any;
    amount: number;
    currency: string;
    restaurantName: string;
}>;
export declare function handlePaymentWebhook(payload: any): Promise<{
    success: boolean;
} | undefined>;
export declare function requestPaymentAttention(orderId: string): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=orders.service.d.ts.map