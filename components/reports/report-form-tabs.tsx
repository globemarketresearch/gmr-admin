'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import type { ReportFormData, Report } from '@/lib/types/reports';
import { ReportDetailsTab } from './tabs/report-details-tab';
import { ContentTab } from './tabs/content-tab';
import { TOCTab } from './tabs/toc-tab';
import { SettingsTab } from './tabs/settings-tab';
import { ChartsTab } from './tabs/charts-tab';
import { reportFormSchema } from '@/lib/validation/report-schema';
import { Lock } from 'lucide-react';

export interface ReportFormTabsRef {
  fillWithSampleData: () => void;
}

interface ReportFormTabsProps {
  report?: Report;
  onSubmit: (data: ReportFormData) => Promise<void>;
  onSaveTab?: (tabKey: string, data: Partial<ReportFormData>) => Promise<void>;
  onPreview?: () => void;
  isSaving: boolean;
  currentScheduledDate?: string;
  onSchedule?: (date: Date) => Promise<void>;
  onCancelSchedule?: () => Promise<void>;
}

const getSampleData = (): ReportFormData => ({
  title: 'Global Telemedicine Market Research Report 2024-2031',
  slug: 'global-telemedicine-market-research-2024-2031',
  summary:
    'Comprehensive analysis of the global telemedicine market, covering market size, growth trends, key players, regional insights, and future opportunities. This report provides in-depth coverage of telemedicine adoption across healthcare sectors, technological advancements, regulatory landscape, and competitive dynamics shaping the industry through 2031.',
  description:
    'This comprehensive market research report analyzes the global telemedicine industry, providing detailed insights into market dynamics, competitive landscape, technological trends, and regional opportunities from 2024 to 2031.',
  category_id: 1, // Will need to be set based on available categories
  geography: ['Global', 'North America', 'Europe', 'Asia Pacific'],
  price: 3490,
  discountedPrice: 3090,
  currency: 'USD',
  status: 'draft',
  pageCount: 245,
  formats: ['PDF', 'Excel', 'Word'],
  thumbnailUrl: '',
  isFeatured: false,
  internalNotes: '',
  marketMetrics: {
    currentRevenue: '87.4 Billion USD',
    currentYear: 2024,
    forecastRevenue: '286.2 Billion USD',
    forecastYear: 2031,
    cagr: '18.4%',
    cagrStartYear: 2024,
    cagrEndYear: 2031,
  },
  authorIds: [],
  sections: {
    marketDetails:
      '<p><strong>By Service Type:</strong></p><ul><li>Teleconsultation (38%)</li><li>Telemonitoring (26%)</li><li>Teleradiology (14%)</li><li>Telepathology (9%)</li><li>Others (13%)</li></ul><p><strong>By Delivery Mode:</strong></p><ul><li>Web/Mobile (72%)</li><li>Call Centers (28%)</li></ul><p><strong>By End User:</strong></p><ul><li>Patients (42%)</li><li>Healthcare Providers (38%)</li><li>Payers (20%)</li></ul>',
    keyPlayers: [
      {
        name: 'Teladoc Health',
        marketShare: '14.2%',
        description:
          'Market leader with comprehensive virtual care platform serving 175+ countries',
      },
      {
        name: 'American Well (Amwell)',
        marketShare: '9.8%',
        description: 'Enterprise telehealth platform with strong hospital partnerships',
      },
      {
        name: 'MDLive',
        marketShare: '7.3%',
        description: 'Consumer-focused telemedicine services with insurance integration',
      },
      {
        name: 'Doctor on Demand',
        marketShare: '5.1%',
        description: 'On-demand video consultations with board-certified physicians',
      },
      {
        name: 'Grand Rounds',
        marketShare: '3.4%',
        description: 'Expert medical opinion and care navigation platform',
      },
    ],
    tableOfContents: {
      chapters: [
        {
          id: 'chapter-1',
          title: 'Preface',
          sections: [
            { id: 'section-1-1', title: 'Report Description and Scope', subsections: [] },
            { id: 'section-1-2', title: 'Research Scope', subsections: [] },
            {
              id: 'section-1-3',
              title: 'Research Methodology',
              subsections: [
                { id: 'subsection-1-3-1', title: 'Market Research Type' },
                { id: 'subsection-1-3-2', title: 'Market Research Methodology' },
              ],
            },
          ],
        },
        {
          id: 'chapter-2',
          title: 'Executive Summary',
          sections: [],
        },
        {
          id: 'chapter-3',
          title: 'Market Overview',
          sections: [
            { id: 'section-3-1', title: 'Market Definition', subsections: [] },
            { id: 'section-3-2', title: 'Market Evolution', subsections: [] },
            { id: 'section-3-3', title: 'Value Chain Analysis', subsections: [] },
          ],
        },
        {
          id: 'chapter-4',
          title: 'Market Dynamics',
          sections: [
            { id: 'section-4-1', title: 'Drivers', subsections: [] },
            { id: 'section-4-2', title: 'Restraints', subsections: [] },
            { id: 'section-4-3', title: 'Opportunities', subsections: [] },
            { id: 'section-4-4', title: 'Challenges', subsections: [] },
          ],
        },
        {
          id: 'chapter-5',
          title: 'Market Segmentation',
          sections: [
            { id: 'section-5-1', title: 'By Service Type', subsections: [] },
            { id: 'section-5-2', title: 'By Delivery Mode', subsections: [] },
            { id: 'section-5-3', title: 'By End User', subsections: [] },
            { id: 'section-5-4', title: 'By Geography', subsections: [] },
          ],
        },
        {
          id: 'chapter-6',
          title: 'Competitive Landscape',
          sections: [
            { id: 'section-6-1', title: 'Market Share Analysis', subsections: [] },
            { id: 'section-6-2', title: 'Company Profiles', subsections: [] },
            { id: 'section-6-3', title: 'Strategic Developments', subsections: [] },
          ],
        },
        {
          id: 'chapter-7',
          title: 'Regional Analysis',
          sections: [],
        },
        {
          id: 'chapter-8',
          title: 'Future Outlook and Opportunities',
          sections: [],
        },
        {
          id: 'chapter-9',
          title: 'Appendix',
          sections: [],
        },
      ],
    },
  },
  faqs: [
    {
      question: 'What is the projected market size for telemedicine by 2031?',
      answer:
        'The global telemedicine market is projected to reach $286.2 billion by 2031, growing from $87.4 billion in 2024 at a CAGR of 18.4%.',
    },
    {
      question: 'Which region dominates the telemedicine market?',
      answer:
        'North America currently dominates the telemedicine market with a 42% market share, driven by advanced infrastructure, favorable policies, and high adoption rates.',
    },
    {
      question: 'What are the main types of telemedicine services?',
      answer:
        'The main types include teleconsultation, telemonitoring, teleradiology, telepathology, and telepsychiatry, with teleconsultation being the largest segment.',
    },
    {
      question: 'Who are the leading players in the telemedicine market?',
      answer:
        'Leading players include Teladoc Health (15.3% market share), American Well/Amwell (12.7%), MDLive (9.2%), Doctor on Demand (7.8%), and Grand Rounds (5.4%).',
    },
  ],
  metadata: {
    metaTitle: 'Global Telemedicine Market Report 2024-2031 | $286.2B by 2031',
    metaDescription:
      'Comprehensive telemedicine market research covering size, growth, trends, and forecasts. Market projected to reach $286.2B by 2031 at 18.4% CAGR. Analysis of key players, regional insights, and opportunities.',
    keywords: [
      'telemedicine market',
      'telehealth',
      'virtual healthcare',
      'remote patient monitoring',
      'teleconsultation',
      'digital health',
      'healthcare IT',
    ],
    canonicalUrl: '',
    ogTitle: 'Global Telemedicine Market Research Report 2024-2031',
    ogDescription:
      'In-depth analysis of the $87.4B telemedicine market growing to $286.2B by 2031. Coverage of market trends, key players, regional analysis, and growth opportunities.',
    ogImage: '',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    schemaJson: '',
    robotsDirective: 'index, follow',
  },
});

export const ReportFormTabs = forwardRef<ReportFormTabsRef, ReportFormTabsProps>(
  function ReportFormTabs(
    {
      report,
      onSubmit,
      onSaveTab,
      onPreview,
      isSaving,
      currentScheduledDate,
      onSchedule,
      onCancelSchedule,
    },
    ref
  ) {
    const [activeTab, setActiveTab] = useState('details');

    const form = useForm({
      resolver: zodResolver(reportFormSchema),
      defaultValues: report
        ? {
            title: report.title,
            slug: report.slug,
            summary: report.summary,
            description: report.description,
            category_id: report.categoryId || 0,
            geography: report.geography,
            publishDate: report.publishDate ? report.publishDate.split('T')[0] : '',
            price: report.price,
            discountedPrice: report.discountedPrice,
            currency: report.currency,
            status: report.status,
            pageCount: report.pageCount,
            formats: report.formats || [],
            marketMetrics: report.marketMetrics || {},
            authorIds: (report.authorIds || []).map(id => String(id)),
            sections: {
              ...report.sections,
              keyPlayers: report.sections.keyPlayers || [],
            },
            faqs: report.faqs || [],
            metadata: report.metadata,
            thumbnailUrl: report.thumbnailUrl,
            isFeatured: report.isFeatured,
            internalNotes: report.internalNotes,
            internalLinks: report.internalLinks || [],
          }
        : {
            title: '',
            slug: '',
            summary: '',
            description: '',
            category_id: 0, // Will be set when categories are loaded
            geography: ['Global'],
            publishDate: new Date().toISOString().split('T')[0],
            price: 3490,
            discountedPrice: 3090,
            currency: 'USD',
            status: 'draft',
            pageCount: 220,
            formats: ['PDF', 'Excel', 'PowerPoint'],
            marketMetrics: {
              currentRevenue: '',
              currentYear: new Date().getFullYear(),
              forecastRevenue: '',
              forecastYear: 2035,
              cagr: '',
              cagrStartYear: new Date().getFullYear(),
              cagrEndYear: 2035,
            },
            authorIds: [],
            sections: {
              marketDetails: '',
              tableOfContents: { chapters: [] },
              keyPlayers: [],
            },
            faqs: [],
            metadata: {
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
            thumbnailUrl: '',
            isFeatured: false,
            internalNotes: '',
          },
    });

    useImperativeHandle(ref, () => ({
      fillWithSampleData: () => {
        form.reset(getSampleData());
      },
    }));

    return (
      <Form {...form}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="details">Report Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="toc">Table of Contents</TabsTrigger>
            {/* <TabsTrigger value="metrics">Market Metrics</TabsTrigger> */}
            <TabsTrigger value="charts" className="relative">
              <span className="flex items-center gap-1.5">
                Charts
                {!report?.id && <Lock className="h-3 w-3 opacity-60" />}
              </span>
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <ReportDetailsTab
              form={form}
              reportId={report?.id}
              onSaveTab={onSaveTab}
              isSaving={isSaving}
            />
          </TabsContent>

          <TabsContent value="content">
            <ContentTab
              form={form}
              onSaveTab={onSaveTab}
              isSaving={isSaving}
              reportId={report?.id}
            />
          </TabsContent>

          <TabsContent value="toc">
            <TOCTab form={form} onSaveTab={onSaveTab} isSaving={isSaving} />
          </TabsContent>

          <TabsContent value="charts">
            <ChartsTab
              form={form}
              reportId={report?.id}
              onSaveTab={onSaveTab}
              isSaving={isSaving}
            />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab
              form={form}
              onSubmit={onSubmit}
              onPreview={onPreview}
              isSaving={isSaving}
              currentScheduledDate={currentScheduledDate}
              onSchedule={onSchedule}
              onCancelSchedule={onCancelSchedule}
            />
          </TabsContent>
        </Tabs>
      </Form>
    );
  }
);
