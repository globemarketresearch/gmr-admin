'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  FileEdit,
  Send,
  Globe,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';

type StatusValue = 'draft' | 'review' | 'published';

interface StatusConfig {
  label: string;
  description: string;
}

interface WorkflowStatusProps<T extends StatusValue> {
  currentStatus: T;
  onStatusChange: (newStatus: T) => Promise<void>;
  isSaving: boolean;
  isAdmin?: boolean;
  statusConfig: Record<StatusValue, StatusConfig>;
  workflowTransitions: Record<StatusValue, readonly StatusValue[]>;
}

const STATUS_ICONS: Record<StatusValue, LucideIcon> = {
  draft: FileEdit,
  review: Clock,
  published: Globe,
};

export function WorkflowStatus<T extends StatusValue>({
  currentStatus,
  onStatusChange,
  isSaving,
  isAdmin = false,
  statusConfig,
  workflowTransitions,
}: WorkflowStatusProps<T>) {
  const config = statusConfig[currentStatus];
  const allowedTransitions = workflowTransitions[currentStatus] as readonly T[];
  const StatusIcon: LucideIcon = STATUS_ICONS[currentStatus];

  const getTransitionLabel = (toStatus: T): string => {
    switch (toStatus) {
      case 'review':
        return 'Submit for Review';
      case 'published':
        return 'Publish Now';
      case 'draft':
        return 'Unpublish / Move to Draft';
      default:
        return toStatus;
    }
  };

  const getTransitionDescription = (toStatus: T): string => {
    switch (toStatus) {
      case 'review':
        return 'Send to editors for approval';
      case 'published':
        return 'Make visible to public';
      case 'draft':
        return 'Hide from public, continue editing';
      default:
        return '';
    }
  };

  const canTransitionTo = (toStatus: T): boolean => {
    // Admin can always publish directly
    if (isAdmin && toStatus === 'published') return true;
    // Non-admin can't publish directly from draft
    if (!isAdmin && currentStatus === 'draft' && toStatus === 'published') {
      return false;
    }
    return allowedTransitions.includes(toStatus);
  };

  const availableTransitions = (['draft', 'review', 'published'] as T[]).filter(
    status => status !== currentStatus && canTransitionTo(status)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="h-5 w-5" />
          Workflow Status
        </CardTitle>
        <CardDescription>Manage publication workflow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">Current Status</p>
            <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
          </div>
          <Badge
            variant={
              currentStatus === 'published'
                ? 'default'
                : currentStatus === 'review'
                  ? 'outline'
                  : 'secondary'
            }
            className="text-sm"
          >
            {config.label}
          </Badge>
        </div>

        <Separator />

        {/* Workflow visualization */}
        <div className="flex items-center justify-between py-2">
          <div
            className={`flex flex-col items-center gap-1 ${currentStatus === 'draft' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div
              className={`p-2 rounded-full ${currentStatus === 'draft' ? 'bg-primary/10' : 'bg-muted'}`}
            >
              <FileEdit className="h-4 w-4" />
            </div>
            <span className="text-xs">Draft</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div
            className={`flex flex-col items-center gap-1 ${currentStatus === 'review' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div
              className={`p-2 rounded-full ${currentStatus === 'review' ? 'bg-primary/10' : 'bg-muted'}`}
            >
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-xs">Review</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div
            className={`flex flex-col items-center gap-1 ${currentStatus === 'published' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div
              className={`p-2 rounded-full ${currentStatus === 'published' ? 'bg-primary/10' : 'bg-muted'}`}
            >
              <Globe className="h-4 w-4" />
            </div>
            <span className="text-xs">Published</span>
          </div>
        </div>

        <Separator />

        {/* Available transitions */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Available Actions</div>
          {availableTransitions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {currentStatus === 'draft' && !isAdmin
                ? 'Submit for review to proceed with publishing.'
                : 'No actions available.'}
            </div>
          ) : (
            <div className="space-y-2">
              {availableTransitions.map(toStatus => (
                <Button
                  key={toStatus}
                  type="button"
                  variant={toStatus === 'published' ? 'default' : 'outline'}
                  size="lg"
                  className="w-full justify-start"
                  disabled={isSaving}
                  onClick={() => onStatusChange(toStatus)}
                >
                  {toStatus === 'published' ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : toStatus === 'review' ? (
                    <Send className="h-4 w-4 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  )}
                  <div className="text-left">
                    <div className="text-sm">{getTransitionLabel(toStatus)}</div>
                    <div className="text-xs text-muted-foreground">
                      {getTransitionDescription(toStatus)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
