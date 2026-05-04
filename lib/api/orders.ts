import { apiClient } from './client';
import type {
  OrdersListResponse,
  OrderDetailResponse,
  OrderStatsResponse,
  OrderFilters,
  UpdateOrderStatusRequest,
  ApiResponse,
} from '@/lib/types/api-types';

/**
 * Fetches orders with filtering and pagination
 */
export async function fetchOrders(filters?: OrderFilters): Promise<OrdersListResponse> {
  return apiClient.get<OrdersListResponse>('/v1/orders', {
    params: filters as Record<string, unknown>,
  });
}

/**
 * Fetches a single order by ID
 */
export async function fetchOrderById(id: string | number): Promise<OrderDetailResponse> {
  return apiClient.get<OrderDetailResponse>(`/v1/orders/${id}`);
}

/**
 * Fetches order statistics
 */
export async function fetchOrderStats(): Promise<OrderStatsResponse> {
  return apiClient.get<OrderStatsResponse>('/v1/orders/stats');
}

/**
 * Updates the status and optional admin notes of an order
 */
export async function updateOrderStatus(
  id: string | number,
  req: UpdateOrderStatusRequest
): Promise<ApiResponse> {
  return apiClient.patch<ApiResponse>(`/v1/orders/${id}/status`, req);
}
