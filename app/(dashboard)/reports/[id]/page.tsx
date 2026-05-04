'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ReportFormTabs } from '@/components/reports/report-form-tabs';
import { useReport } from '@/hooks/use-report';
import { useAuth } from '@/contexts/auth-context';
import { FormSkeleton } from '@/components/ui/skeletons/form-skeleton';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReportFormData } from '@/lib/types/reports';
import { toast } from 'sonner';

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    report,
    isLoading,
    error,
    fetchReport,
    saveReport,
    isSaving,
    scheduleReportPublish,
    cancelReportSchedule,
  } = useReport();
  const reportId = parseInt(params.id as string, 10);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (reportId && !isNaN(reportId)) {
      fetchReport(reportId);
    }
  }, [reportId, fetchReport]);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      router.push('/reports');
    }
  }, [user, router]);

  const handleSaveTab = useCallback(
    async (tabKey: string, data: Partial<ReportFormData>) => {
      if (!report?.id) return;

      try {
        // For existing reports, we can do partial updates
        // The API should handle merging the partial data with the existing report
        await saveReport(report.id, data as ReportFormData);

        setLastSaved(new Date());
        toast.success('Report saved successfully');
      } catch (error) {
        console.error('Error saving report:', error);
        toast.error('Failed to save report');
      }
    },
    [saveReport, report]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-accent rounded-md animate-pulse" />
          <div className="h-5 w-96 bg-accent rounded-md animate-pulse" />
        </div>
        <FormSkeleton sections={2} fieldsPerSection={5} showTabs={true} />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-lg">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold mb-2">Failed to load report</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => reportId && !isNaN(reportId) && fetchReport(reportId)}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Report</h1>
          <p className="text-muted-foreground mt-2">{report.title}</p>
        </div>
        <div className="text-sm">
          {isSaving ? (
            <span className="text-muted-foreground">Saving...</span>
          ) : lastSaved ? (
            <span className="text-green-600">
              All changes saved at {lastSaved.toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      </div>

      <ReportFormTabs
        report={report}
        onSubmit={async data => {
          // Final submit - save with form data
          if (report?.id) {
            await saveReport(report.id, data);
          }
        }}
        onSaveTab={handleSaveTab}
        onPreview={() => router.push(`/reports/${report.id}/preview`)}
        isSaving={isSaving}
        currentScheduledDate={report.scheduled_publish_enabled ? report.publishDate : undefined}
        onSchedule={async date => {
          await scheduleReportPublish(String(reportId), date);
        }}
        onCancelSchedule={async () => {
          await cancelReportSchedule(String(reportId));
        }}
      />
    </div>
  );
}
