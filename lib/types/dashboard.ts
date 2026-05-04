export type ActivityType =
  | 'report_published'
  | 'report_created'
  | 'report_updated'
  | 'report_deleted'
  | 'blog_published'
  | 'blog_created'
  | 'blog_updated'
  | 'blog_deleted'
  | 'press_release_published'
  | 'press_release_created'
  | 'press_release_updated'
  | 'press_release_deleted'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_role_changed'
  | 'lead_received'
  | 'lead_processed'
  | 'auth_login'
  | 'auth_login_failed'
  | 'auth_logout'
  | 'auth_token_refresh';

export interface Activity {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  entityType: string;
  entityId: number;
  user?: {
    id: number;
    email: string;
    name: string;
  };
  timestamp: string; // ISO 8601 format
}

export interface ActivityResponse {
  activities: Activity[];
  total: number;
}

export interface TopReport {
  id: number;
  title: string;
  slug: string;
  viewCount: number;
  downloadCount: number;
}

export interface TopCategory {
  id: number;
  name: string;
  slug: string;
  reportCount: number;
}

export interface ReportStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  change: number;
  topPerformers?: TopReport[];
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  review: number;
  change: number;
}

export interface PressReleaseStats {
  total: number;
  published: number;
  draft: number;
  review: number;
  change: number;
}

export interface UserStats {
  total: number;
  active: number;
  byRole: Record<string, number>;
  change: number;
}

export interface LeadStats {
  total: number;
  pending: number;
  processed: number;
  byCategory: Record<string, number>;
  recent: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface ContentCreationStats {
  reportsThisMonth: number;
  blogsThisMonth: number;
  pressReleasesThisMonth: number;
}

export interface PerformanceStats {
  topReports?: TopReport[];
  topCategories?: TopCategory[];
}

export interface DashboardStats {
  reports: ReportStats;
  blogs: BlogStats;
  pressReleases: PressReleaseStats;
  users?: UserStats; // Only for admins
  leads: LeadStats;
  contentCreation: ContentCreationStats;
  performance?: PerformanceStats;
}
