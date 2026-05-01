// ═══════════════════════════════════════════
// DineFlow — Customer Cart Store (Zustand)
// ═══════════════════════════════════════════

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
  addonIds: string[];
  addonNames: string[];
  addonPrices: number[];
  specialInstructions: string;
  imageUrl?: string;
  isVeg: boolean;
}

interface CartStore {
  items: CartItem[];
  couponCode: string;
  discount: number;
  customerPhone: string;
  customerName: string;
  sessionId: string | null;
  restaurantSlug: string;
  tableId: string;

  setRestaurantInfo: (slug: string, tableId: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string, variantId?: string) => void;
  updateQuantity: (menuItemId: string, quantity: number, variantId?: string) => void;
  updateSpecialInstructions: (menuItemId: string, instructions: string, variantId?: string) => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  setCustomerInfo: (phone: string, name: string) => void;
  clearCustomerInfo: () => void;
  setSessionId: (sessionId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
  items: [],
  couponCode: '',
  discount: 0,
  customerPhone: '',
  customerName: '',
  sessionId: null,
  restaurantSlug: '',
  tableId: '',

  setRestaurantInfo: (slug, tableId) => set({ restaurantSlug: slug, tableId }),

  addItem: (item) => set((state) => {
    const existing = state.items.find(
      (i) => i.menuItemId === item.menuItemId && i.variantId === item.variantId
    );
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.menuItemId === item.menuItemId && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      };
    }
    return { items: [...state.items, item] };
  }),

  removeItem: (menuItemId, variantId) => set((state) => ({
    items: state.items.filter(
      (i) => !(i.menuItemId === menuItemId && i.variantId === variantId)
    ),
  })),

  updateQuantity: (menuItemId, quantity, variantId) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter((i) => !(i.menuItemId === menuItemId && i.variantId === variantId)) };
    }
    return {
      items: state.items.map((i) =>
        i.menuItemId === menuItemId && i.variantId === variantId
          ? { ...i, quantity }
          : i
      ),
    };
  }),

  updateSpecialInstructions: (menuItemId, instructions, variantId) => set((state) => ({
    items: state.items.map((i) =>
      i.menuItemId === menuItemId && i.variantId === variantId
        ? { ...i, specialInstructions: instructions }
        : i
    ),
  })),

  setCoupon: (code, discount) => set({ couponCode: code, discount }),
  clearCoupon: () => set({ couponCode: '', discount: 0 }),
  setCustomerInfo: (phone, name) => set({ customerPhone: phone, customerName: name }),
  clearCustomerInfo: () => set({ customerPhone: '', customerName: '', sessionId: null }),
  setSessionId: (sessionId) => set({ sessionId }),
  clearCart: () => set({ items: [], couponCode: '', discount: 0, sessionId: null }),

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => {
      const addonTotal = item.addonPrices.reduce((a, b) => a + b, 0);
      return sum + (item.price + addonTotal) * item.quantity;
    }, 0);
  },

  getTax: () => {
    const subtotal = get().getSubtotal();
    const discount = Math.round(get().discount);
    return Math.round((subtotal - discount) * 0.05);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = Math.round(get().discount);
    const tax = Math.round((subtotal - discount) * 0.05);
    return subtotal - discount + tax;
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}),
    {
      name: 'dinesmart-cart-storage',
    }
  )
);
