'use client';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils/date';
import type { ApiAuditLog, AuditLogFieldChange } from '@/lib/types/api-types';

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

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(empty)';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function ChangeItem({ field, change }: { field: string; change: AuditLogFieldChange }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{field}</p>
      <div className="grid grid-cols-1 gap-1">
        <div className="rounded px-2 py-1 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
          <span className="text-xs text-red-700 dark:text-red-400 font-mono break-all">
            - {formatValue(change.old)}
          </span>
        </div>
        <div className="rounded px-2 py-1 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
          <span className="text-xs text-green-700 dark:text-green-400 font-mono break-all">
            + {formatValue(change.new)}
          </span>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-sm text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-sm break-all">{value}</span>
    </div>
  );
}

interface AuditLogDetailProps {
  log: ApiAuditLog | null;
  open: boolean;
  onClose: () => void;
}

export function AuditLogDetail({ log, open, onClose }: AuditLogDetailProps) {
  if (!log) return null;

  const label = ACTION_LABELS[log.action] ?? log.action;
  const hasChanges = log.changes && Object.keys(log.changes).length > 0;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{label}</DialogTitle>
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
          </div>
          <DialogDescription>{formatDate(log.created_at)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">User</h4>
            <DetailRow label="Email" value={log.user_email} />
            <DetailRow label="Role" value={<span className="capitalize">{log.user_role}</span>} />
            {log.user_id != null && (
              <DetailRow label="User ID" value={<span className="font-mono">{log.user_id}</span>} />
            )}
          </div>

          <Separator />

          {/* Entity Info */}
          {log.entity_type && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Entity</h4>
                <DetailRow
                  label="Type"
                  value={<span className="capitalize">{log.entity_type}</span>}
                />
                {log.entity_id != null && (
                  <DetailRow
                    label="ID"
                    value={<span className="font-mono">#{log.entity_id}</span>}
                  />
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Request Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Request</h4>
            <DetailRow
              label="IP Address"
              value={<span className="font-mono">{log.ip_address || '-'}</span>}
            />
            {log.request_id && (
              <DetailRow
                label="Request ID"
                value={<span className="font-mono text-xs">{log.request_id}</span>}
              />
            )}
            {log.user_agent && (
              <DetailRow
                label="User Agent"
                value={<span className="text-xs text-muted-foreground">{log.user_agent}</span>}
              />
            )}
          </div>

          {/* Changes Diff */}
          {hasChanges && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Changes</h4>
                {Object.entries(log.changes!).map(([field, change]) => (
                  <ChangeItem key={field} field={field} change={change} />
                ))}
              </div>
            </>
          )}

          {/* Error Message */}
          {log.error_message && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-red-600">Error</h4>
                <div className="rounded px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-700 dark:text-red-400">{log.error_message}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
