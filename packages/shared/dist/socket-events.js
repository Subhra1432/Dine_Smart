// ═══════════════════════════════════════════
// DineSmart OS — Socket Event Constants
// ═══════════════════════════════════════════
export const SOCKET_EVENTS = {
    // Server → Client events
    ORDER_NEW: 'order:new',
    ORDER_STATUS_UPDATED: 'order:status_updated',
    ORDER_ITEM_STATUS_UPDATED: 'order:item_status_updated',
    PAYMENT_CONFIRMED: 'payment:confirmed',
    INVENTORY_LOW_STOCK: 'inventory:low_stock',
    TABLE_OCCUPIED: 'table:occupied',
    TABLE_FREED: 'table:freed',
    NOTIFICATION_NEW: 'notification:new',
    // Client → Server events
    JOIN_TABLE: 'join:table',
    JOIN_KITCHEN: 'join:kitchen',
    JOIN_BILLING: 'join:billing',
    JOIN_RESTAURANT: 'join:restaurant',
    LEAVE_TABLE: 'leave:table',
};
export const SOCKET_ROOMS = {
    restaurant: (restaurantId) => `restaurant:${restaurantId}`,
    branch: (branchId) => `branch:${branchId}`,
    table: (tableId) => `table:${tableId}`,
    kitchen: (branchId) => `kitchen:${branchId}`,
    billing: (branchId) => `billing:${branchId}`,
};
//# sourceMappingURL=socket-events.js.map