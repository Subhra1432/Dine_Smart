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
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export const SOCKET_ROOMS = {
  restaurant: (restaurantId: string) => `restaurant:${restaurantId}`,
  branch: (branchId: string) => `branch:${branchId}`,
  table: (tableId: string) => `table:${tableId}`,
  kitchen: (branchId: string) => `kitchen:${branchId}`,
  billing: (branchId: string) => `billing:${branchId}`,
} as const;
