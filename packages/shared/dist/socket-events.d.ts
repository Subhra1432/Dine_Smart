export declare const SOCKET_EVENTS: {
    readonly ORDER_NEW: "order:new";
    readonly ORDER_STATUS_UPDATED: "order:status_updated";
    readonly ORDER_ITEM_STATUS_UPDATED: "order:item_status_updated";
    readonly PAYMENT_CONFIRMED: "payment:confirmed";
    readonly INVENTORY_LOW_STOCK: "inventory:low_stock";
    readonly TABLE_OCCUPIED: "table:occupied";
    readonly TABLE_FREED: "table:freed";
    readonly NOTIFICATION_NEW: "notification:new";
    readonly JOIN_TABLE: "join:table";
    readonly JOIN_KITCHEN: "join:kitchen";
    readonly JOIN_BILLING: "join:billing";
    readonly JOIN_RESTAURANT: "join:restaurant";
    readonly LEAVE_TABLE: "leave:table";
};
export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
export declare const SOCKET_ROOMS: {
    readonly restaurant: (restaurantId: string) => string;
    readonly branch: (branchId: string) => string;
    readonly table: (tableId: string) => string;
    readonly kitchen: (branchId: string) => string;
    readonly billing: (branchId: string) => string;
};
//# sourceMappingURL=socket-events.d.ts.map