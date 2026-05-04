'use client';

import { ReportFormTabs, type ReportFormTabsRef } from '@/components/reports/report-form-tabs';
import { useReport } from '@/hooks/use-report';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { ReportFormData } from '@/lib/types/reports';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function CreateReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { saveReport, isSaving } = useReport();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [createdReportId] = useState<string | null>(null);
  const formRef = useRef<ReportFormTabsRef>(null);

  // Role check
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      router.push('/reports');
    }
  }, [user, router]);

  const handleSaveTab = useCallback(
    async (tabKey: string, data: Partial<ReportFormData>) => {
      try {
        // Data now contains all form values from the tab
        // Ensure we have all required fields with defaults if needed
        const saveData: ReportFormData = {
          title: data.title || 'Untitled Report (Draft)',
          slug: data.slug || 'untitled-report-draft',
          summary: data.summary || 'Draft in progress',
          category_id: data.category_id || 0,
          geography: data.geography || ['Global'],
          price: data.price !== undefined ? data.price : 0,
          discountedPrice: data.discountedPrice !== undefined ? data.discountedPrice : 0,
          status: 'draft', // Always save as draft when using Save Report button
          pageCount: data.pageCount,
          formats: data.formats || [],
          marketMetrics: data.marketMetrics || {},
          authorIds: data.authorIds || [],
          sections: data.sections || {
            marketDetails: '',
            tableOfContents: { chapters: [] },
            keyPlayers: [],
          },
          faqs: data.faqs || [],
          metadata: data.metadata || {
            metaTitle: '',
            metaDescription: '',
            keywords: [],
            canonicalUrl: '',
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            ogType: 'article',
            twitterCard: 'summary_large_image',
            schemaJson: '',
            robotsDirective: 'index, follow',
          },
          publishDate: data.publishDate,
        };

        const result = await saveReport(createdReportId, saveData);

        if (result) {
          // If this was the first save, redirect to edit page
          if (!createdReportId) {
            toast.success('Report created successfully! Redirecting to edit page...');
            router.push(`/reports/${result.id}`);
            return;
          }

          setLastSaved(new Date());
          toast.success('Report saved successfully');
        }
      } catch (error) {
        console.error('Error saving report:', error);
        toast.error('Failed to save report');
      }
    },
    [saveReport, createdReportId, router]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Create New Report</h1>
            <p className="text-muted-foreground mt-2">
              Fill in the details below to create a new market research report
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              formRef.current?.fillWithSampleData();
              toast.success('Form filled with sample data');
            }}
            className="shrink-0"
          >
            Fill Sample Data
          </Button>
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
        ref={formRef}
        onSubmit={async data => {
          // Final submit - save as published or draft based on form data
          await saveReport(createdReportId, data);
        }}
        onSaveTab={handleSaveTab}
        isSaving={isSaving}
      />
    </div>
  );
}
