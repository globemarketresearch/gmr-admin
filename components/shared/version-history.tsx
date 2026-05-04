'use client';

import { Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRelativeTime } from '@/lib/utils/date';

interface BaseVersion {
  id: string;
  versionNumber: number;
  summary: string;
  createdAt: string;
  author: {
    name?: string | null;
    email: string;
  };
}

interface VersionHistoryProps<T extends BaseVersion> {
  versions: T[];
  onRestore?: (version: T) => void;
  contentType?: string;
}

export function VersionHistory<T extends BaseVersion>({
  versions,
  onRestore,
  contentType = 'content',
}: VersionHistoryProps<T>) {
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Version History
        </CardTitle>
        <CardDescription>Track changes to your {contentType}</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedVersions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No version history yet. Versions are created when the {contentType} is published.
          </p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {sortedVersions.map((version, index) => (
                <div
                  key={version.id}
                  className={`relative pl-4 pb-4 ${
                    index !== sortedVersions.length - 1 ? 'border-l-2 border-muted' : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-primary" />

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">v{version.versionNumber}</Badge>
                      {onRestore && index !== 0 && (
                        <Button variant="ghost" size="sm" onClick={() => onRestore(version)}>
                          Restore
                        </Button>
                      )}
                    </div>
                    <p className="text-sm font-medium">{version.summary}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{version.author.name || version.author.email}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(version.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
