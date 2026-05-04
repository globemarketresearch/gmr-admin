import type { ReportSectionMeta } from '@/lib/types/reports';

// Section metadata for rendering
export const REPORT_SECTIONS: ReportSectionMeta[] = [
  {
    key: 'marketDetails',
    label: 'Market Details',
    placeholder: 'Describe the overall market landscape...',
    required: true,
  },
];

// Categories (expand as needed)
export const REPORT_CATEGORIES = [
  'Animal Health',
  'Biotechnology',
  'Clinical Diagnostics',
  'Dental',
  'Healthcare IT',
  'Healthcare Services',
  'Laboratory Equipment',
  'Life Sciences',
  'Medical Devices',
  'Medical Imaging',
  'Pharmaceuticals',
  'Therapeutic Area',
] as const;

// Geographies
export const GEOGRAPHIES = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East & Africa',
  'Global',
] as const;

// Report Formats
export const REPORT_FORMATS = ['PDF', 'Excel', 'Word', 'PowerPoint'] as const;

// Pagination defaults
export const REPORTS_PER_PAGE = 10;
export const MAX_REPORTS_PER_PAGE = 50;
