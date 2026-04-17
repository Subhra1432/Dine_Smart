// ═══════════════════════════════════════════
// DineSmart — Customer API Client
// ═══════════════════════════════════════════

const API_URL = (import.meta as any).env.VITE_API_URL || '';
const API_BASE = `${API_URL}/api/v1`;

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
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
    throw new Error(`Failed to parse JSON response: ${text.substring(0, 100)}...`);
  }

  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }
  return data.data as T;
}

export async function getPublicMenu(slug: string, tableId: string) {
  return fetchApi(`/menu/public/${slug}?tableId=${tableId}`);
}

export async function getCustomerHistory(slug: string, phone: string) {
  return fetchApi(`/menu/public/${slug}/history?phone=${encodeURIComponent(phone)}`);
}

export async function sendOtp(slug: string, phone: string) {
  return fetchApi(`/menu/public/${slug}/send-otp`, {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(slug: string, phone: string, code: string, name?: string) {
  return fetchApi(`/menu/public/${slug}/verify-otp`, {
    method: 'POST',
    body: JSON.stringify({ phone, code, name }),
  });
}

export async function placeOrder(body: {
  tableId: string;
  items: Array<{
    menuItemId: string;
    variantId?: string;
    quantity: number;
    addonIds: string[];
    specialInstructions: string;
  }>;
  couponCode?: string;
  customerPhone?: string;
  customerName?: string;
  notes?: string;
}) {
  return fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getOrderBySession(sessionId: string) {
  return fetchApi(`/orders/${sessionId}`);
}

export async function initiatePayment(orderId: string) {
  return fetchApi(`/orders/${orderId}/payment/initiate`, {
    method: 'POST',
  });
}

export async function validateCoupon(restaurantSlug: string, code: string, orderTotal: number) {
  return fetchApi(`/coupons/validate?restaurantSlug=${restaurantSlug}`, {
    method: 'POST',
    body: JSON.stringify({ code, orderTotal }),
  });
}

export async function getRecommendations(restaurantSlug: string, itemIds: string[]) {
  return fetchApi(`/ai/recommendations?restaurantSlug=${restaurantSlug}&itemIds=${itemIds.join(',')}`);
}

export async function requestPaymentAttention(orderId: string) {
  return fetchApi(`/orders/${orderId}/request-payment`, {
    method: 'POST',
  });
}

export async function submitReview(orderId: string, rating: number, comment: string, itemRatings?: Record<string, number>) {
  return fetchApi('/orders/reviews', {
    method: 'POST',
    body: JSON.stringify({ orderId, rating, comment, itemRatings }),
  });
}
