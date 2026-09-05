/**
 * Letronix API Client Library
 * Complete client for all Express Backend API endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get stored authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('letronix_auth_token');
}

/**
 * Set authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('letronix_auth_token', token);
  }
}

/**
 * Clear authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('letronix_auth_token');
  }
}

/**
 * Core fetch wrapper with JSON handling and authorization token injection
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = isJson && data.error ? data.error : response.statusText || 'An error occurred';
    throw new Error(errorMessage);
  }

  return data as T;
}

// ============================================================================
// 1. AUTHENTICATION & USER MANAGEMENT
// ============================================================================

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: 'customer' | 'seller' | 'admin';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfileUpdatePayload {
  full_name?: string;
  phone?: string;
  additional_phone?: string;
  address?: string;
  city?: string;
  region?: string;
  address_additional_info?: string;
  location?: string;
  role?: string;
  password?: string;
  email?: string;
}

export async function registerUser(payload: RegisterPayload) {
  const data = await apiFetch<{ token: string; user: any }>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (data.token) setAuthToken(data.token);
  return data;
}

export async function loginUser(payload: LoginPayload) {
  const data = await apiFetch<{ token: string; user: any }>('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (data.token) setAuthToken(data.token);
  return data;
}

export async function getUserProfile(userId?: string) {
  const path = userId ? `/profile/${userId}` : '/profile';
  return apiFetch(path, { method: 'GET' });
}

export async function updateUserProfile(payload: ProfileUpdatePayload, userId?: string) {
  const path = userId ? `/profile/${userId}` : '/profile';
  return apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function listAllUsers() {
  return apiFetch('/users', { method: 'GET' });
}

export async function deleteUser(userId: string) {
  return apiFetch(`/users/${userId}`, { method: 'DELETE' });
}

// ============================================================================
// 2. PRODUCTS, CATEGORIES & REVIEWS
// ============================================================================

export interface ProductQueryParams {
  category?: string;
  brand?: string;
  search?: string;
  seller_id?: string;
  shop?: string;
  color?: string;
}

export interface ProductCreatePayload {
  name: string;
  brand?: string;
  category_id?: string | number;
  price: number;
  discount?: number;
  stock?: number;
  condition?: string;
  colors?: string[] | string;
  color?: string;
  over_view?: Record<string, any>;
  specifications?: Record<string, any>;
  variants?: any[];
  images?: string[];
  seller_id?: string;
  shop_id?: string;
  user_id?: string;
}

export interface CategoryCreatePayload {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
}

export interface ReviewPayload {
  product_id: string | number;
  rating: number;
  comment?: string;
  user_id?: string;
}

export async function getAllProducts(params?: ProductQueryParams) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
  }
  const queryString = query.toString();
  return apiFetch(`/products${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
}

export async function getProductById(id: string | number) {
  return apiFetch(`/products/${id}`, { method: 'GET' });
}

export async function createProduct(payload: ProductCreatePayload) {
  return apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id: string | number, payload: Partial<ProductCreatePayload>) {
  return apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: string | number) {
  return apiFetch(`/products/${id}`, { method: 'DELETE' });
}

export async function getCategories() {
  return apiFetch('/categories', { method: 'GET' });
}

export async function createCategory(payload: CategoryCreatePayload) {
  return apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function addProductReview(payload: ReviewPayload) {
  return apiFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ============================================================================
// 3. SELLER STORE MANAGEMENT
// ============================================================================

export interface SellerStorePayload {
  store_name?: string;
  store_slug?: string;
  store_description?: string;
  store_logo?: string;
  store_banner?: string;
  store_phone?: string;
  store_email?: string;
  store_address?: string;
  payout_method?: string;
  momo_network?: string;
  momo_number?: string;
  momo_name?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_account_name?: string;
  subscription_plan?: string;
  user_id?: string;
}

export async function getSellerStore(userId?: string) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiFetch(`/sellers/store${query}`, { method: 'GET' });
}

export async function updateSellerStore(payload: SellerStorePayload) {
  return apiFetch('/sellers/store', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function listSellers() {
  return apiFetch('/sellers', { method: 'GET' });
}

export async function getSellerBySlug(slug: string) {
  return apiFetch(`/sellers/${encodeURIComponent(slug)}`, { method: 'GET' });
}

export async function verifySeller(sellerId: string, isVerified: boolean = true) {
  return apiFetch(`/sellers/${sellerId}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ is_verified: isVerified }),
  });
}

// ============================================================================
// 4. CART MANAGEMENT
// ============================================================================

export async function getCart(userId?: string) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiFetch(`/cart${query}`, { method: 'GET' });
}

export async function addToCart(productId: string | number, quantity: number = 1, userId?: string) {
  return apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity, user_id: userId }),
  });
}

export async function updateCartItemQuantity(cartItemId: string | number, quantity: number) {
  return apiFetch(`/cart/items/${cartItemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(cartItemId: string | number) {
  return apiFetch(`/cart/items/${cartItemId}`, { method: 'DELETE' });
}

export async function clearCart(userId?: string) {
  const path = userId ? `/cart/clear/${userId}` : '/cart/clear';
  return apiFetch(path, { method: 'DELETE' });
}

// ============================================================================
// 5. WISHLIST MANAGEMENT
// ============================================================================

export async function getWishlist(userId?: string) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiFetch(`/wishlist${query}`, { method: 'GET' });
}

export async function addToWishlist(productId: string | number, userId?: string) {
  return apiFetch('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, user_id: userId }),
  });
}

export async function removeFromWishlist(productId: string | number) {
  return apiFetch(`/wishlist/${productId}`, { method: 'DELETE' });
}

// ============================================================================
// 6. ORDERS & CHECKOUT
// ============================================================================

export interface OrderItemInput {
  product_id: string | number;
  quantity: number;
}

export interface OrderCreatePayload {
  items: OrderItemInput[];
  payment_reference?: string;
  payment_method?: string;
  shipping_address?: Record<string, any>;
  user_id?: string;
}

export async function createOrder(payload: OrderCreatePayload) {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUserOrders(userId?: string) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiFetch(`/orders/my-orders${query}`, { method: 'GET' });
}

export async function listAllOrders() {
  return apiFetch('/orders', { method: 'GET' });
}

export async function updateOrderStatus(orderId: string | number, status: string) {
  return apiFetch(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// 7. PAY SMALL SMALL (INSTALLMENT FINANCING)
// ============================================================================

export interface InstallmentPlanPayload {
  product_id?: string | number;
  product_name: string;
  product_brand?: string;
  product_image?: string;
  total_amount: number;
  down_payment: number;
  frequency?: string;
  installments_count?: number;
  payment_reference?: string;
  user_id?: string;
}

export async function getUserInstallmentPlans(userId?: string) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiFetch(`/pay-small-small${query}`, { method: 'GET' });
}

export async function createInstallmentPlan(payload: InstallmentPlanPayload) {
  return apiFetch('/pay-small-small', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function addInstallmentPayment(planId: string, amount: number, reference?: string) {
  return apiFetch(`/pay-small-small/${planId}/payments`, {
    method: 'POST',
    body: JSON.stringify({ amount, reference }),
  });
}

export async function updatePlanDeliveryStatus(planId: string, status: string) {
  return apiFetch(`/pay-small-small/${planId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// 8. SELLER WALLET & EARNINGS
// ============================================================================

export async function getWalletBalance(userId?: string) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiFetch(`/wallet/balance${query}`, { method: 'GET' });
}

export async function getWalletTransactions(userId?: string) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiFetch(`/wallet/transactions${query}`, { method: 'GET' });
}

export async function requestWithdrawal(amount: number, userId?: string) {
  return apiFetch('/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, user_id: userId }),
  });
}

// ============================================================================
// 9. PAYSTACK PAYMENTS VERIFICATION
// ============================================================================

export async function verifyPaystackTransaction(reference: string) {
  return apiFetch('/payments/paystack/verify', {
    method: 'POST',
    body: JSON.stringify({ reference }),
  });
}

// ============================================================================
// 10. SMS & UTILITIES
// ============================================================================

export async function sendSMS(to: string, message: string) {
  return apiFetch('/sms/send', {
    method: 'POST',
    body: JSON.stringify({ to, message }),
  });
}

export async function deleteCloudinaryAsset(publicId: string) {
  return apiFetch('/cloudinary/delete', {
    method: 'POST',
    body: JSON.stringify({ public_id: publicId }),
  });
}

const api = {
  apiFetch,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  // Auth
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  listAllUsers,
  deleteUser,
  // Products & Categories
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  addProductReview,
  // Seller
  getSellerStore,
  updateSellerStore,
  listSellers,
  getSellerBySlug,
  verifySeller,
  // Cart
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  // Wishlist
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  // Orders
  createOrder,
  getUserOrders,
  listAllOrders,
  updateOrderStatus,
  // Installments
  getUserInstallmentPlans,
  createInstallmentPlan,
  addInstallmentPayment,
  updatePlanDeliveryStatus,
  // Wallet
  getWalletBalance,
  getWalletTransactions,
  requestWithdrawal,
  // Payments
  verifyPaystackTransaction,
  // SMS & Uploads
  sendSMS,
  deleteCloudinaryAsset,
};

export default api;
