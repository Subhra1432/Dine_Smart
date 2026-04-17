export declare function registerRestaurant(data: {
    email: string;
    password: string;
    restaurantName: string;
    ownerName: string;
    phone: string;
}): Promise<{
    user: {
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    };
    restaurant: {
        id: string;
        name: string;
        slug: string;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}>;
export declare function login(email: string, password: string): Promise<{
    user: {
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        restaurantId: string;
        branchId: string | null;
    };
    restaurant: {
        id: string;
        name: string;
        slug: string;
        plan: import(".prisma/client").$Enums.Plan;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}>;
export declare function refreshAccessToken(refreshToken: string): Promise<{
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}>;
export declare function forgotPassword(email: string): Promise<{
    message: string;
    resetToken?: undefined;
} | {
    message: string;
    resetToken: string;
}>;
export declare function resetPassword(token: string, newPassword: string): Promise<{
    message: string;
}>;
export declare function logout(userId: string): Promise<void>;
export declare function superAdminLogin(email: string, password: string): Promise<{
    token: string;
    admin: {
        id: string;
        email: string;
    };
}>;
//# sourceMappingURL=auth.service.d.ts.map