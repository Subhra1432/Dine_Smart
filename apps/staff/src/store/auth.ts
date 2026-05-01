// ═══════════════════════════════════════════
// DineSmart — Staff Auth Store
// ═══════════════════════════════════════════

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
  restaurantId: string;
  branchId: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  notificationSoundUrl?: string;
}

interface AuthStore {
  user: AuthUser | null;
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
  /** true while the app is verifying the session on first mount */
  isInitializing: boolean;
  setAuth: (user: AuthUser, restaurant: Restaurant) => void;
  clearAuth: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      restaurant: null,
      isAuthenticated: false,
      isInitializing: true,
      setAuth: (user, restaurant) => set({ user, restaurant, isAuthenticated: true }),
      clearAuth: () => set({ user: null, restaurant: null, isAuthenticated: false }),
      setInitialized: () => set({ isInitializing: false }),
    }),
    {
      name: 'dinesmart-auth',
      // don't persist isInitializing — it should always start as true
      partialize: (state) => ({
        user: state.user,
        restaurant: state.restaurant,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
