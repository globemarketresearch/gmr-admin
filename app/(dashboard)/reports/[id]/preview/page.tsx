'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useReport } from '@/hooks/use-report';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/format';

export default function PreviewReportPage() {
  const params = useParams();
  const { report, isLoading, error, fetchReport } = useReport();
  const reportId = parseInt(params.id as string, 10);

  useEffect(() => {
    if (reportId && !isNaN(reportId)) {
      fetchReport(reportId);
    }
  }, [reportId, fetchReport]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !report) {
    return <div>Error loading report</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/reports/${report.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Report
          </Link>
        </Button>
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={report.status === 'published' ? 'default' : 'secondary'}>
                {report.status}
              </Badge>
            </div>
            <CardTitle className="text-3xl">{report.title}</CardTitle>
            <p className="text-muted-foreground">{report.summary}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Category: {report.category}</span>
              <span>•</span>
              <span>Geography: {report.geography.join(', ')}</span>
              <span>•</span>
              <span>Price: {formatCurrency(report.price)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="prose max-w-none">
          {/* Render each section */}
          {Object.entries(report.sections).map(([key, content]) => {
            // Skip non-string values
            if (typeof content !== 'string') return null;
            if (!content?.trim()) return null;
            return (
              <div key={key} className="mb-8">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
