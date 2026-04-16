import type { Request } from 'express';
export declare function getProfile(restaurantId: string): Promise<{
    _count: {
        branches: number;
        tables: number;
        menuItems: number;
        orders: number;
    };
} & {
    name: string;
    id: string;
    createdAt: Date;
    isActive: boolean;
    slug: string;
    logoUrl: string | null;
    plan: import(".prisma/client").$Enums.Plan;
    planExpiresAt: Date | null;
}>;
export declare function updateProfile(restaurantId: string, data: {
    name?: string;
    logoUrl?: string;
}): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    isActive: boolean;
    slug: string;
    logoUrl: string | null;
    plan: import(".prisma/client").$Enums.Plan;
    planExpiresAt: Date | null;
}>;
export declare function getBranches(restaurantId: string): Promise<({
    _count: {
        tables: number;
        orders: number;
    };
} & {
    restaurantId: string;
    name: string;
    id: string;
    isActive: boolean;
    address: string;
    phone: string;
    timezone: string;
})[]>;
export declare function createBranch(restaurantId: string, data: {
    name: string;
    address: string;
    phone: string;
    timezone?: string;
}): Promise<{
    restaurantId: string;
    name: string;
    id: string;
    isActive: boolean;
    address: string;
    phone: string;
    timezone: string;
}>;
export declare function updateBranch(restaurantId: string, branchId: string, data: Record<string, unknown>): Promise<{
    restaurantId: string;
    name: string;
    id: string;
    isActive: boolean;
    address: string;
    phone: string;
    timezone: string;
}>;
export declare function deleteBranch(restaurantId: string, branchId: string): Promise<{
    restaurantId: string;
    name: string;
    id: string;
    isActive: boolean;
    address: string;
    phone: string;
    timezone: string;
}>;
export declare function getTables(restaurantId: string, branchId?: string): Promise<({
    branch: {
        name: string;
    };
    orders: {
        status: import(".prisma/client").$Enums.OrderStatus;
        id: string;
        createdAt: Date;
        total: number;
    }[];
} & {
    number: number;
    branchId: string;
    restaurantId: string;
    id: string;
    qrCodeUrl: string | null;
    isOccupied: boolean;
    capacity: number;
})[]>;
export declare function createTable(restaurantId: string, data: {
    branchId: string;
    number: number;
    capacity: number;
}): Promise<{
    number: number;
    branchId: string;
    restaurantId: string;
    id: string;
    qrCodeUrl: string | null;
    isOccupied: boolean;
    capacity: number;
}>;
export declare function updateTable(restaurantId: string, tableId: string, data: Record<string, unknown>): Promise<{
    number: number;
    branchId: string;
    restaurantId: string;
    id: string;
    qrCodeUrl: string | null;
    isOccupied: boolean;
    capacity: number;
}>;
export declare function deleteTable(restaurantId: string, tableId: string): Promise<{
    number: number;
    branchId: string;
    restaurantId: string;
    id: string;
    qrCodeUrl: string | null;
    isOccupied: boolean;
    capacity: number;
}>;
export declare function getTableQR(restaurantId: string, tableId: string, req?: Request): Promise<Buffer<ArrayBufferLike>>;
export declare function getUsers(restaurantId: string): Promise<{
    role: import(".prisma/client").$Enums.Role;
    branchId: string | null;
    branch: {
        name: string;
    } | null;
    id: string;
    createdAt: Date;
    email: string;
    isActive: boolean;
}[]>;
export declare function createUser(restaurantId: string, data: {
    email: string;
    password: string;
    role: string;
    branchId?: string;
}): Promise<{
    role: import(".prisma/client").$Enums.Role;
    branchId: string | null;
    id: string;
    email: string;
    isActive: boolean;
}>;
export declare function updateUser(restaurantId: string, userId: string, data: Record<string, unknown>): Promise<{
    role: import(".prisma/client").$Enums.Role;
    branchId: string | null;
    id: string;
    email: string;
    isActive: boolean;
}>;
export declare function deleteUser(restaurantId: string, userId: string): Promise<{
    role: import(".prisma/client").$Enums.Role;
    branchId: string | null;
    restaurantId: string;
    id: string;
    createdAt: Date;
    email: string;
    passwordHash: string;
    isActive: boolean;
    tokenVersion: number;
}>;
//# sourceMappingURL=restaurant.service.d.ts.map