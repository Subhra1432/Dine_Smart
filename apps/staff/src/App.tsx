// ═══════════════════════════════════════════
// DineSmart — Staff App Root
// ═══════════════════════════════════════════

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from './store/auth';
import { getMe } from './lib/api';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import BillingPage from './pages/BillingPage';
import KitchenPage from './pages/KitchenPage';
import MenuManagementPage from './pages/MenuManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InventoryPage from './pages/InventoryPage';
import CouponManagementPage from './pages/CouponManagementPage';
import SettingsPage from './pages/SettingsPage';
import RegisterPage from './pages/RegisterPage';
import SubscriptionPage from './pages/SubscriptionPage';
import FeedbackPage from './pages/FeedbackPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import { ThemeProvider } from './lib/ThemeProvider';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, isInitializing, user } = useAuthStore();

  // Still verifying the session — show a neutral loading screen, never redirect prematurely
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-700">
        {/* Saffron Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-10 mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-12">
          {/* Central Unit */}
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-stone-950 dark:bg-stone-900 border border-stone-200 dark:border-white/10 flex items-center justify-center shadow-[0_50px_100px_rgba(0,0,0,0.3)] dark:shadow-[0_50px_100px_rgba(0,0,0,0.6)] animate-in zoom-in duration-1000">
              <UtensilsCrossed size={48} className="text-white" />
              <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] animate-pulse" />
            </div>
            {/* Orbiting Elements */}
            <div className="absolute -inset-10 border border-primary/10 rounded-[3.5rem] animate-[spin_15s_linear_infinite]" />
            <div className="absolute -inset-5 border-2 border-stone-100 dark:border-stone-800/50 rounded-[3rem] animate-[ping_5s_linear_infinite]" />
          </div>

          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-5xl font-black text-stone-950 dark:text-white tracking-[-0.05em] uppercase">
              DineSmart <span className="text-primary tracking-normal italic">OS</span>
            </h1>
            <div className="flex items-center gap-8">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.6em] ml-4">Node Activation</p>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-primary/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="absolute bottom-24 flex gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary/30 animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'KITCHEN_STAFF') return <Navigate to="/kitchen" replace />;
    if (user.role === 'CASHIER') return <Navigate to="/billing" replace />;
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

function RoleBasedRedirect() {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  if (isInitializing) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'KITCHEN_STAFF') return <Navigate to="/kitchen" replace />;
  if (user?.role === 'CASHIER') return <Navigate to="/billing" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  const { isAuthenticated, setAuth, clearAuth, setInitialized } = useAuthStore();

  // On every page load/reload: verify the JWT is still valid with the server.
  // This prevents stale localStorage state from showing protected pages when the session expired.
  useEffect(() => {
    if (!isAuthenticated) {
      setInitialized();
      return;
    }

    getMe()
      .then((me: any) => {
        // Refresh user + restaurant data from server so it's always fresh
        setAuth(
          {
            userId: me.user.id,
            email: me.user.email,
            role: me.user.role,
            restaurantId: me.user.restaurantId,
            branchId: me.user.branchId,
          },
          me.restaurant
        );
      })
      .catch(() => {
        // JWT invalid / expired — clear stale state and let ProtectedRoute redirect
        clearAuth();
      })
      .finally(() => {
        setInitialized();
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="dinesmart-staff-theme">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/" element={<RoleBasedRedirect />} />

        <Route element={
          <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'CASHIER', 'KITCHEN_STAFF']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/kitchen" element={
            <ProtectedRoute allowedRoles={['MANAGER', 'KITCHEN_STAFF']}>
              <KitchenPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
              <OverviewPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/menu" element={
            <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
              <MenuManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/inventory" element={
            <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
              <InventoryPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/coupons" element={
            <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
              <CouponManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/subscription" element={
            <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
              <SubscriptionPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/admin/payment/cancel" element={<PaymentCancelPage />} />
          <Route path="/admin/feedback" element={
            <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
              <FeedbackPage />
            </ProtectedRoute>
          } />

          <Route path="/billing" element={
            <ProtectedRoute allowedRoles={['MANAGER', 'CASHIER']}>
              <BillingPage />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

