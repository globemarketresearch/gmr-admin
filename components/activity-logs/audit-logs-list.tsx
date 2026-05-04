'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Eye,
  FileText,
  FileEdit,
  FilePlus,
  FileX,
  PenSquare,
  Megaphone,
  UserPlus,
  UserCog,
  UserMinus,
  UserRoundCog,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Tag,
  Activity as ActivityIcon,
  type LucideIcon,
} from 'lucide-react';
import { formatRelativeTime, formatDate } from '@/lib/utils/date';
import type { ApiAuditLog } from '@/lib/types/api-types';

const ACTION_ICONS: Record<string, LucideIcon> = {
  'auth.login': LogIn,
  'auth.login_failed': ShieldAlert,
  'auth.logout': LogOut,
  'auth.token_refresh': RefreshCw,
  'user.create': UserPlus,
  'user.update': UserCog,
  'user.delete': UserMinus,
  'user.role_change': UserRoundCog,
  'report.create': FilePlus,
  'report.update': FileEdit,
  'report.delete': FileX,
  'report.publish': FileText,
  'category.create': Tag,
  'category.update': Tag,
  'category.delete': Tag,
  'author.create': UserPlus,
  'author.update': UserCog,
  'author.delete': UserMinus,
  'blog.create': PenSquare,
  'blog.update': PenSquare,
  'blog.delete': FileX,
  'blog.publish': PenSquare,
  'press_release.create': Megaphone,
  'press_release.update': Megaphone,
  'press_release.delete': FileX,
  'press_release.publish': Megaphone,
};

const ACTION_LABELS: Record<string, string> = {
  'auth.login': 'User Logged In',
  'auth.login_failed': 'Login Failed',
  'auth.logout': 'User Logged Out',
  'auth.token_refresh': 'Token Refreshed',
  'user.create': 'User Created',
  'user.update': 'User Updated',
  'user.delete': 'User Deleted',
  'user.role_change': 'Role Changed',
  'report.create': 'Report Created',
  'report.update': 'Report Updated',
  'report.delete': 'Report Deleted',
  'report.publish': 'Report Published',
  'category.create': 'Category Created',
  'category.update': 'Category Updated',
  'category.delete': 'Category Deleted',
  'author.create': 'Author Created',
  'author.update': 'Author Updated',
  'author.delete': 'Author Deleted',
  'blog.create': 'Blog Created',
  'blog.update': 'Blog Updated',
  'blog.delete': 'Blog Deleted',
  'blog.publish': 'Blog Published',
  'press_release.create': 'Press Release Created',
  'press_release.update': 'Press Release Updated',
  'press_release.delete': 'Press Release Deleted',
  'press_release.publish': 'Press Release Published',
};

const ACTION_COLORS: Record<string, string> = {
  'auth.login': 'bg-green-500/10 text-green-600',
  'auth.login_failed': 'bg-red-500/10 text-red-600',
  'auth.logout': 'bg-gray-500/10 text-gray-600',
  'auth.token_refresh': 'bg-blue-500/10 text-blue-600',
  'user.create': 'bg-orange-500/10 text-orange-600',
  'user.update': 'bg-amber-500/10 text-amber-600',
  'user.delete': 'bg-red-500/10 text-red-600',
  'user.role_change': 'bg-yellow-500/10 text-yellow-600',
  'report.create': 'bg-cyan-500/10 text-cyan-600',
  'report.update': 'bg-purple-500/10 text-purple-600',
  'report.delete': 'bg-red-500/10 text-red-600',
  'report.publish': 'bg-blue-500/10 text-blue-600',
  'category.create': 'bg-emerald-500/10 text-emerald-600',
  'category.update': 'bg-teal-500/10 text-teal-600',
  'category.delete': 'bg-red-500/10 text-red-600',
  'author.create': 'bg-violet-500/10 text-violet-600',
  'author.update': 'bg-indigo-500/10 text-indigo-600',
  'author.delete': 'bg-red-500/10 text-red-600',
  'blog.create': 'bg-green-500/10 text-green-600',
  'blog.update': 'bg-teal-500/10 text-teal-600',
  'blog.delete': 'bg-red-500/10 text-red-600',
  'blog.publish': 'bg-green-500/10 text-green-600',
  'press_release.create': 'bg-indigo-500/10 text-indigo-600',
  'press_release.update': 'bg-purple-500/10 text-purple-600',
  'press_release.delete': 'bg-red-500/10 text-red-600',
  'press_release.publish': 'bg-indigo-500/10 text-indigo-600',
};

interface AuditLogsListProps {
  logs: ApiAuditLog[];
  onSelect: (log: ApiAuditLog) => void;
}

export function AuditLogsList({ logs, onSelect }: AuditLogsListProps) {
  if (logs.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No activity logs found</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map(log => {
            const Icon = ACTION_ICONS[log.action] ?? ActivityIcon;
            const label = ACTION_LABELS[log.action] ?? log.action;
            const colorClass = ACTION_COLORS[log.action] ?? 'bg-gray-500/10 text-gray-600';

            return (
              <TableRow key={log.id} className="cursor-pointer" onClick={() => onSelect(log)}>
                <TableCell>
                  <span
                    className="text-sm text-muted-foreground whitespace-nowrap"
                    title={formatDate(log.created_at)}
                  >
                    {formatRelativeTime(log.created_at)}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{log.user_email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{log.user_role}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${colorClass}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm">{label}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {log.entity_type ? (
                    <span className="text-sm text-muted-foreground">
                      <span className="capitalize">{log.entity_type}</span>
                      {log.entity_id != null && (
                        <span className="font-mono text-xs ml-1">#{log.entity_id}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={log.status === 'success' ? 'default' : 'destructive'}
                    className={
                      log.status === 'success'
                        ? 'bg-green-100 text-green-800 border-green-200 text-xs'
                        : 'bg-red-100 text-red-800 border-red-200 text-xs'
                    }
                  >
                    {log.status === 'success' ? 'Success' : 'Failed'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">
                    {log.ip_address || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={e => {
                      e.stopPropagation();
                      onSelect(log);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
