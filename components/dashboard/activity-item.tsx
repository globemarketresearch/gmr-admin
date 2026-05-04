import { Skeleton } from '@/components/ui/skeleton';
import type { Activity, ActivityType } from '@/lib/types/dashboard';
import { formatRelativeTime } from '@/lib/utils/date';
import {
  FileText,
  FileEdit,
  FilePlus,
  FileX,
  PenSquare,
  UserPlus,
  UserCog,
  UserMinus,
  UserRoundCog,
  MessageSquare,
  CheckCircle,
  Megaphone,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Activity as ActivityIcon,
  type LucideIcon,
} from 'lucide-react';

const activityIcons: Record<ActivityType, LucideIcon> = {
  report_published: FileText,
  report_created: FilePlus,
  report_updated: FileEdit,
  report_deleted: FileX,
  blog_published: PenSquare,
  blog_created: FilePlus,
  blog_updated: FileEdit,
  blog_deleted: FileX,
  press_release_published: Megaphone,
  press_release_created: FilePlus,
  press_release_updated: FileEdit,
  press_release_deleted: FileX,
  user_created: UserPlus,
  user_updated: UserCog,
  user_deleted: UserMinus,
  user_role_changed: UserRoundCog,
  lead_received: MessageSquare,
  lead_processed: CheckCircle,
  auth_login: LogIn,
  auth_login_failed: ShieldAlert,
  auth_logout: LogOut,
  auth_token_refresh: RefreshCw,
};

const activityLabels: Record<ActivityType, string> = {
  report_published: 'Report Published',
  report_created: 'Report Created',
  report_updated: 'Report Updated',
  report_deleted: 'Report Deleted',
  blog_published: 'Blog Published',
  blog_created: 'Blog Created',
  blog_updated: 'Blog Updated',
  blog_deleted: 'Blog Deleted',
  press_release_published: 'Press Release Published',
  press_release_created: 'Press Release Created',
  press_release_updated: 'Press Release Updated',
  press_release_deleted: 'Press Release Deleted',
  user_created: 'User Created',
  user_updated: 'User Updated',
  user_deleted: 'User Deleted',
  user_role_changed: 'User Role Changed',
  lead_received: 'Lead Received',
  lead_processed: 'Lead Processed',
  auth_login: 'User Logged In',
  auth_login_failed: 'Login Failed',
  auth_logout: 'User Logged Out',
  auth_token_refresh: 'Session Refreshed',
};

const activityColors: Record<ActivityType, string> = {
  report_published: 'bg-blue-500/10 text-blue-500',
  report_created: 'bg-cyan-500/10 text-cyan-500',
  report_updated: 'bg-purple-500/10 text-purple-500',
  report_deleted: 'bg-red-500/10 text-red-500',
  blog_published: 'bg-green-500/10 text-green-500',
  blog_created: 'bg-emerald-500/10 text-emerald-500',
  blog_updated: 'bg-teal-500/10 text-teal-500',
  blog_deleted: 'bg-red-500/10 text-red-500',
  press_release_published: 'bg-indigo-500/10 text-indigo-500',
  press_release_created: 'bg-violet-500/10 text-violet-500',
  press_release_updated: 'bg-purple-500/10 text-purple-500',
  press_release_deleted: 'bg-red-500/10 text-red-500',
  user_created: 'bg-orange-500/10 text-orange-500',
  user_updated: 'bg-amber-500/10 text-amber-500',
  user_deleted: 'bg-red-500/10 text-red-500',
  user_role_changed: 'bg-yellow-500/10 text-yellow-500',
  lead_received: 'bg-pink-500/10 text-pink-500',
  lead_processed: 'bg-lime-500/10 text-lime-500',
  auth_login: 'bg-green-500/10 text-green-500',
  auth_login_failed: 'bg-red-500/10 text-red-500',
  auth_logout: 'bg-gray-500/10 text-gray-500',
  auth_token_refresh: 'bg-blue-500/10 text-blue-500',
};

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = activityIcons[activity.type] ?? ActivityIcon;
  const colorClass = activityColors[activity.type] ?? 'bg-gray-500/10 text-gray-500';
  const label = activityLabels[activity.type] ?? activity.title;

  return (
    <div className="flex items-start gap-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{label}</p>
        {activity.user?.name && (
          <p className="text-xs text-muted-foreground">{activity.user.name}</p>
        )}
        <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
      </div>
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-4">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
