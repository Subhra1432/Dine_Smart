// ═══════════════════════════════════════════
// DineSmart — Staff App Root
// ═══════════════════════════════════════════

import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import { ThemeProvider } from './lib/ThemeProvider';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, isInitializing, user } = useAuthStore();

  // Still verifying the session — show a neutral loading screen, never redirect prematurely
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading DineSmart...</p>
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
          <Route path="/kitchen" element={<KitchenPage />} />
          
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
            <ProtectedRoute allowedRoles={['OWNER']}>
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
          <Route path="/admin/feedback" element={
            <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
              <FeedbackPage />
            </ProtectedRoute>
          } />

          <Route path="/billing" element={
            <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'CASHIER']}>
              <BillingPage />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

