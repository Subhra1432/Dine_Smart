export declare function getCategories(restaurantId: string): Promise<({
    _count: {
        menuItems: number;
    };
} & {
    restaurantId: string;
    name: string;
    id: string;
    sortOrder: number;
    isActive: boolean;
})[]>;
export declare function createCategory(restaurantId: string, data: {
    name: string;
    sortOrder?: number;
}): Promise<{
    restaurantId: string;
    name: string;
    id: string;
    sortOrder: number;
    isActive: boolean;
}>;
export declare function updateCategory(restaurantId: string, categoryId: string, data: Record<string, unknown>): Promise<{
    restaurantId: string;
    name: string;
    id: string;
    sortOrder: number;
    isActive: boolean;
}>;
export declare function deleteCategory(restaurantId: string, categoryId: string): Promise<{
    restaurantId: string;
    name: string;
    id: string;
    sortOrder: number;
    isActive: boolean;
}>;
export declare function getMenuItems(restaurantId: string, categoryId?: string): Promise<({
    category: {
        name: string;
    };
    variants: {
        menuItemId: string;
        name: string;
        id: string;
        additionalPrice: number;
    }[];
    menuItemAddons: ({
        addon: {
            restaurantId: string;
            name: string;
            id: string;
            price: number;
            isAvailable: boolean;
        };
    } & {
        menuItemId: string;
        addonId: string;
    })[];
} & {
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
})[]>;
export declare function createMenuItem(restaurantId: string, data: {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isVeg?: boolean;
    preparationTimeMinutes?: number;
    sortOrder?: number;
    tags?: string[];
    variants?: Array<{
        name: string;
        additionalPrice: number;
    }>;
    addonIds?: string[];
}): Promise<({
    variants: {
        menuItemId: string;
        name: string;
        id: string;
        additionalPrice: number;
    }[];
    menuItemAddons: ({
        addon: {
            restaurantId: string;
            name: string;
            id: string;
            price: number;
            isAvailable: boolean;
        };
    } & {
        menuItemId: string;
        addonId: string;
    })[];
} & {
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
}) | null>;
export declare function updateMenuItem(restaurantId: string, itemId: string, data: Record<string, unknown>): Promise<({
    category: {
        restaurantId: string;
        name: string;
        id: string;
        sortOrder: number;
        isActive: boolean;
    };
    variants: {
        menuItemId: string;
        name: string;
        id: string;
        additionalPrice: number;
    }[];
    menuItemAddons: ({
        addon: {
            restaurantId: string;
            name: string;
            id: string;
            price: number;
            isAvailable: boolean;
        };
    } & {
        menuItemId: string;
        addonId: string;
    })[];
} & {
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
}) | null>;
export declare function deleteMenuItem(restaurantId: string, itemId: string): Promise<{
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
}>;
export declare function toggleAvailability(restaurantId: string, itemId: string): Promise<{
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
}>;
export declare function getAddons(restaurantId: string): Promise<{
    restaurantId: string;
    name: string;
    id: string;
    price: number;
    isAvailable: boolean;
}[]>;
export declare function createAddon(restaurantId: string, data: {
    name: string;
    price: number;
}): Promise<{
    restaurantId: string;
    name: string;
    id: string;
    price: number;
    isAvailable: boolean;
}>;
export declare function updateAddon(restaurantId: string, addonId: string, data: Record<string, unknown>): Promise<{
    restaurantId: string;
    name: string;
    id: string;
    price: number;
    isAvailable: boolean;
}>;
export declare function deleteAddon(restaurantId: string, addonId: string): Promise<{
    restaurantId: string;
    name: string;
    id: string;
    price: number;
    isAvailable: boolean;
}>;
export declare function getPublicMenu(restaurantSlug: string, tableId: string): Promise<{
    restaurant: {
        id: string;
        name: string;
        logoUrl: string | null;
    };
    table: {
        id: string;
        number: number;
    };
    categories: {
        items: {
            isPopular: boolean;
            addons: {
                name: string;
                id: string;
                price: number;
            }[];
            variants: {
                menuItemId: string;
                name: string;
                id: string;
                additionalPrice: number;
            }[];
            menuItemAddons: ({
                addon: {
                    name: string;
                    id: string;
                    price: number;
                };
            } & {
                menuItemId: string;
                addonId: string;
            })[];
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
        }[];
        menuItems: ({
            variants: {
                menuItemId: string;
                name: string;
                id: string;
                additionalPrice: number;
            }[];
            menuItemAddons: ({
                addon: {
                    name: string;
                    id: string;
                    price: number;
                };
            } & {
                menuItemId: string;
                addonId: string;
            })[];
        } & {
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
        })[];
        restaurantId: string;
        name: string;
        id: string;
        sortOrder: number;
        isActive: boolean;
    }[];
}>;
export declare function getPublicHistory(restaurantSlug: string, phone: string): Promise<({
    branch: {
        name: string;
    };
    items: ({
        menuItem: {
            name: string;
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
})[]>;
export declare function sendOtp(phone: string): Promise<{
    success: boolean;
}>;
export declare function verifyOtp(restaurantSlug: string, phone: string, code: string, name?: string): Promise<{
    success: boolean;
    customer: {
        restaurantId: string;
        name: string | null;
        id: string;
        createdAt: Date;
        email: string | null;
        phone: string;
    };
}>;
//# sourceMappingURL=menu.service.d.ts.map