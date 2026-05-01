import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      setLoggedIn: (val) => set({ isLoggedIn: val }),
      logout: () => set({ isLoggedIn: false }),
    }),
    {
      name: 'dinesmart-superadmin-auth',
    }
  )
);
