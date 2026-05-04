/**
 * API Types aligned with Swagger schema
 * These types match the backend API responses exactly
 */

// ============ API Response Wrappers ============
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: ApiMeta;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
  cursor?: string;
}

// ============ User Types ============
export interface ApiUserReference {
  id: number;
  email: string;
  name: string;
}

export interface ApiUserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// ============ Authentication Types ============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: ApiUserResponse;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // seconds
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LogoutRequest {
  refresh_token?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'editor' | 'viewer';
  is_active?: boolean;
}

// ============ Category Types ============
export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============ Report Types ============
export interface ApiReportSections {
  marketDetails?: string;
  keyPlayers?: string;
  tableOfContents?: string;
}

export interface ApiMarketMetrics {
  currentRevenue?: string;
  currentYear?: number;
  forecastRevenue?: string;
  forecastYear?: number;
  cagr?: string;
  cagrStartYear?: number;
  cagrEndYear?: number;
}

export interface ApiKeyPlayer {
  name: string;
  marketShare?: string;
  description?: string;
}

export interface ApiFAQ {
  question: string;
  answer: string;
}

export interface ApiReportMetadata {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  schemaJson?: string;
  robotsDirective?: string;
}

export interface ApiChartMetadata {
  id: number;
  report_id: number;
  title: string;
  description?: string;
  chart_type: string;
  data_points?: number;
  order?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  report?: ApiReport;
}

export interface ApiReport {
  // Auto-managed fields (read-only)
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string; // ISO timestamp when report was soft-deleted
  view_count?: number; // Auto-managed
  download_count?: number; // Auto-managed
  publish_date?: string; // Auto-set when status changes to published
  scheduled_publish_enabled?: boolean;

  // Mandatory fields for creation
  title: string; // Min 10 characters
  slug: string; // Unique identifier
  summary?: string; // Min 50 characters (required in validation)
  category_id?: number; // Required, must reference valid category
  category_name?: string; // Category name (returned by backend)
  geography?: string[]; // At least one required
  sections?: ApiReportSections; // Required with all content

  // Optional basic info
  description?: string;
  thumbnail_url?: string;

  // Pricing (optional, defaults applied by backend)
  price?: number; // Defaults to 0
  discounted_price?: number; // Defaults to 0
  currency?: string; // Defaults to "USD"

  // Report details (optional)
  page_count?: number; // Defaults to 0
  formats?: string[]; // e.g., ["PDF", "Excel"]

  // Status & publishing (optional)
  status: 'draft' | 'published'; // Defaults to "draft"
  is_featured?: boolean; // Defaults to false

  // Authors & contributors (optional)
  author_ids?: number[]; // Array of user IDs

  // Market data (optional)
  market_metrics?: ApiMarketMetrics;

  // FAQs & metadata (optional)
  faqs?: ApiFAQ[];
  metadata?: ApiReportMetadata;

  // Legacy fields (optional)
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;

  // Additional optional fields
  sub_category_id?: number;
  market_segment_id?: number;
  internal_notes?: string; // Admin-only notes
  internal_links?: Array<{
    keyword: string;
    targetId: number;
    targetTitle: string;
    targetType: 'report' | 'blog' | 'press-release';
    targetUrl: string;
    linkedCount: number;
  }>;
}

export interface ApiReportWithRelations extends ApiReport {
  category_name?: string;
  sub_category_name?: string;
  market_segment_name?: string;
  author?: ApiUserReference;
  charts?: ApiChartMetadata[];
}

// ============ Request/Response Types ============
export interface ApiReportFilters {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published';
  category?: string;
  geography?: string;
  search?: string;
}

export interface ApiReportsListResponse extends ApiResponse<ApiReport[]> {
  data: ApiReport[];
  meta: ApiMeta;
}

export interface ApiReportDetailResponse extends ApiResponse<ApiReportWithRelations> {
  data: ApiReportWithRelations;
}

export interface ApiCategoriesListResponse extends ApiResponse<ApiCategory[]> {
  data: ApiCategory[];
  meta: ApiMeta;
}

export interface ApiCategoryDetailResponse extends ApiResponse<ApiCategory> {
  data: ApiCategory;
}

// ============ Type Guards ============
export function isApiError(response: unknown): response is ApiResponse<never> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response &&
    !!response.error
  );
}

export function hasApiData<T>(
  response: ApiResponse<T>
): response is Required<Pick<ApiResponse<T>, 'data'>> & ApiResponse<T> {
  return response && response.success === true && response.data !== undefined;
}

// ============ Form Submission Types ============
export type FormCategory = 'contact' | 'request-sample' | 'request-customization' | 'schedule-demo';
export type FormStatus = 'pending' | 'processed' | 'archived';

export interface ContactFormData {
  fullName: string;
  email: string;
  company: string;
  country?: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface RequestSampleFormData {
  fullName: string;
  email: string;
  company: string;
  country?: string;
  jobTitle: string;
  phone?: string;
  reportTitle: string;
  additionalInfo?: string;
}

export interface ScheduleDemoFormData {
  fullName: string;
  email: string;
  company: string;
  jobTitle?: string;
  phone?: string;
  companySize?: string;
  interests?: string;
  preferredDateTimeUTC?: string; // ISO UTC string of the selected slot
  userTimezone?: string; // IANA timezone name (client's TZ)
  preferredTimeLocal?: string; // formatted in client's TZ, e.g. "7:30 PM IST"
  additionalInfo?: string;
}

export interface FormSubmissionMetadata {
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  pageURL?: string;
}

export interface ApiFormSubmission {
  id: string;
  category: FormCategory;
  status: FormStatus;
  data: ContactFormData | RequestSampleFormData | ScheduleDemoFormData;
  metadata: FormSubmissionMetadata;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormSubmissionRequest {
  category: FormCategory;
  data: ContactFormData | RequestSampleFormData | ScheduleDemoFormData;
  metadata: FormSubmissionMetadata;
}

export interface FormSubmissionFilters {
  category?: FormCategory;
  status?: FormStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'company' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface FormSubmissionsListResponse extends ApiResponse<ApiFormSubmission[]> {
  data: ApiFormSubmission[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FormSubmissionDetailResponse extends ApiResponse<ApiFormSubmission> {
  data: ApiFormSubmission;
}

export interface FormSubmissionStats {
  total: number;
  byCategory: {
    contact: number;
    'request-sample': number;
    'request-customization': number;
  };
  byStatus: {
    pending: number;
    processed: number;
    archived: number;
  };
  recent: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface FormSubmissionStatsResponse extends ApiResponse<FormSubmissionStats> {
  data: FormSubmissionStats;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkDeleteResponse extends ApiResponse {
  deletedCount: number;
  deletedIds: string[];
}

// ============ Order Types ============

export type OrderStatus =
  | 'pending_payment'
  | 'payment_received'
  | 'processing'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface ApiOrder {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_company?: string;
  customer_phone?: string;
  customer_country?: string;
  report_id: number;
  report_title: string;
  report_slug: string;
  amount: number;
  currency: string;
  paypal_order_id?: string;
  paypal_capture_id?: string;
  status: OrderStatus;
  fulfilled_at?: string;
  fulfilled_by?: number;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderFilters {
  status?: OrderStatus | '';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface OrdersListResponse extends ApiResponse<ApiOrder[]> {
  data: ApiOrder[];
  meta: ApiMeta;
}

export interface OrderDetailResponse extends ApiResponse<ApiOrder> {
  data: ApiOrder;
}

export interface OrderStats {
  total: number;
  total_revenue: number;
  by_status: Record<string, number>;
  recent_count: number;
  recent_revenue: number;
}

export interface OrderStatsResponse extends ApiResponse<OrderStats> {
  data: OrderStats;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  admin_notes?: string;
}

// ============ Audit Log Types ============

export type AuditLogAction =
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.token_refresh'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.role_change'
  | 'report.create'
  | 'report.update'
  | 'report.delete'
  | 'report.publish'
  | 'category.create'
  | 'category.update'
  | 'category.delete'
  | 'author.create'
  | 'author.update'
  | 'author.delete'
  | 'blog.create'
  | 'blog.update'
  | 'blog.delete'
  | 'blog.publish'
  | 'press_release.create'
  | 'press_release.update'
  | 'press_release.delete'
  | 'press_release.publish';

export type AuditLogEntityType =
  | 'user'
  | 'report'
  | 'category'
  | 'author'
  | 'blog'
  | 'press_release';

export type AuditLogStatus = 'success' | 'failure';

export interface AuditLogFieldChange {
  old: unknown;
  new: unknown;
}

export interface ApiAuditLog {
  id: number;
  user_id?: number;
  user_email: string;
  user_role: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  ip_address: string;
  user_agent: string;
  request_id: string;
  changes?: Record<string, AuditLogFieldChange>;
  status: AuditLogStatus;
  error_message?: string;
  created_at: string;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  user_id?: number;
  action?: AuditLogAction | '';
  action_prefix?: string;
  entity_type?: AuditLogEntityType | '';
  entity_id?: number;
  status?: AuditLogStatus | '';
  start_date?: string;
  end_date?: string;
  ip_address?: string;
}

export interface AuditLogsListResponse extends ApiResponse<ApiAuditLog[]> {
  data: ApiAuditLog[];
  meta: ApiMeta;
}

export interface AuditLogDetailResponse extends ApiResponse<ApiAuditLog> {
  data: ApiAuditLog;
}
