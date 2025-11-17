/**
 * API response type definitions
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Standard response with count
 */
export interface StandardResponse<T> {
  success: boolean;
  count?: number;
  data: T;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * API Error response
 */
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Response wrappers for specific entities
 */
export interface PurchaseInvoicesResponse {
  total: number;
  invoices: any[]; // Will be typed with PurchaseInvoice
}

export interface TransactionsResponse {
  success: boolean;
  count: number;
  data: any[]; // Will be typed with Transaction
}

export interface ContactsResponse {
  total: number;
  contacts: any[]; // Will be typed with Contact
}

export interface SubscriptionsResponse {
  total: number;
  subscriptions: any[]; // Will be typed with Subscription
}
