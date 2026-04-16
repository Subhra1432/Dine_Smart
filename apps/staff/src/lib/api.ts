// ═══════════════════════════════════════════
// DineSmart — Staff API Client
// ═══════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_URL}/api/v1`;

// Module-level guards to prevent parallel refresh/redirect storms
let refreshPromise: Promise<Response> | null = null;
let isRedirecting = false;

// Extend the standard fetch RequestInit with our internal retry flag
interface FetchOptions extends RequestInit {
  _retry?: boolean;
}

async function fetchApi<T>(url: string, options?: FetchOptions): Promise<T> {
  // Reset redirect lock for every fresh (non-retry) request so login page works after a redirect
  if (!options?._retry) isRedirecting = false;

  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });

  const text = await res.text();
  if (!text) {
    if (!res.ok) throw new Error(`API returned ${res.status} with empty body`);
    return {} as T;
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse response: ${text.substring(0, 100)}...`);
  }

  // Skip refresh/redirect logic for auth endpoints — a 401 from /auth/login
  // means wrong credentials, NOT an expired session.
  const isAuthEndpoint = url.startsWith('/auth/');

  if (res.status === 401 && !options?._retry && !isAuthEndpoint) {
    // Singleton refresh: if a refresh is already in flight, all 401s share it
    if (!refreshPromise) {
      refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      }).finally(() => {
        refreshPromise = null; // reset after resolved/rejected
      });
    }

    try {
      const refreshRes = await refreshPromise;
      if (refreshRes.ok) {
        return fetchApi(url, { ...options, _retry: true });
      }
    } catch {}

    // Only redirect once — guard against multiple concurrent redirects
    if (!isRedirecting && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      isRedirecting = true;
      window.location.href = '/login';
    }
  }

  if (!data.success) {
    const error = new Error(data.error || 'API request failed') as any;
    error.details = data.details;
    throw error;
  }
  return data.data as T;
}

// Auth
export const login = (email: string, password: string) =>
  fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const logout = () => fetchApi('/auth/logout', { method: 'POST' });
export const getMe = () => fetchApi('/auth/me');
export const refreshToken = () => fetchApi('/auth/refresh', { method: 'POST' });

// Restaurant
export const getProfile = () => fetchApi('/restaurant/profile');
export const getBranches = () => fetchApi('/restaurant/branches');
export const getTables = (branchId?: string) => fetchApi(`/restaurant/tables${branchId ? `?branchId=${branchId}` : ''}`);
export const getUsers = () => fetchApi('/restaurant/users');
export const getSubscriptionPayments = () => fetchApi('/restaurant/subscription/payments');

// Menu
export const getCategories = () => fetchApi('/menu/categories');
export const getMenuItems = () => fetchApi('/menu/items');
export const getAddons = () => fetchApi('/menu/addons');
export const toggleAvailability = (id: string) => fetchApi(`/menu/items/${id}/toggle-availability`, { method: 'POST' });

// Billing
export const getBillingTables = () => fetchApi('/billing/tables');
export const getBillingOrders = (params?: string) => fetchApi(`/billing/orders${params ? `?${params}` : ''}`);
export const getOrderDetail = (id: string) => fetchApi(`/billing/orders/${id}`);
export const updateOrderStatus = (id: string, status: string) =>
  fetchApi(`/billing/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
export const updatePaymentStatus = (id: string, paymentStatus: string, paymentMethod?: string) =>
  fetchApi(`/billing/orders/${id}/payment`, { method: 'PUT', body: JSON.stringify({ paymentStatus, paymentMethod }) });
export const printBill = (id: string) => fetch(`${API_BASE}/billing/orders/${id}/print-bill`, { method: 'POST', credentials: 'include' });

// Kitchen
export const getKitchenOrders = () => fetchApi('/kitchen/orders');
export const updateItemStatus = (itemId: string, status: string) =>
  fetchApi(`/kitchen/order-items/${itemId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

// Analytics
export const getOverview = () => fetchApi('/analytics/overview');
export const getRevenue = (params?: string) => fetchApi(`/analytics/revenue${params ? `?${params}` : ''}`);
export const getMenuPerformance = () => fetchApi('/analytics/menu-performance');
export const getPeakHours = () => fetchApi('/analytics/peak-hours');
export const getTablePerformance = () => fetchApi('/analytics/table-performance');
export const getCustomerAnalytics = () => fetchApi('/analytics/customers');
export const getDemandForecast = (hours?: number) => fetchApi(`/ai/demand-forecast${hours ? `?hours=${hours}` : ''}`);
export const getPricingSuggestions = () => fetchApi('/ai/pricing-suggestions');

// Inventory
export const getInventoryItems = () => fetchApi('/inventory/items');
export const getInventoryAlerts = () => fetchApi('/inventory/alerts');
export const updateStock = (id: string, quantity: number, reason: string) =>
  fetchApi(`/inventory/items/${id}/stock`, { method: 'PUT', body: JSON.stringify({ quantity, reason }) });

// Coupons
export const getCoupons = () => fetchApi('/coupons');
export const createCoupon = (data: any) => fetchApi('/coupons', { method: 'POST', body: JSON.stringify(data) });
export const deleteCoupon = (id: string) => fetchApi(`/coupons/${id}`, { method: 'DELETE' });

// Notifications
export const getNotifications = (page?: number) => fetchApi(`/notifications?page=${page || 1}`);
export const markNotificationRead = (id: string) => fetchApi(`/notifications/${id}/read`, { method: 'PUT' });

// Loyalty
export const getLoyaltyAccounts = () => fetchApi('/loyalty');

export const getReviews = () => fetchApi('/restaurant/reviews');
