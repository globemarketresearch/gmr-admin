import type {
  DataSource,
  MapDataSource,
  ChartMetadata,
  LogoConfig,
  ChartConfig,
  AxisLabelDisplay,
} from '@/lib/types/chart-generator';

// Professional color palette (muted, market-research grade)
export const DEFAULT_CHART_COLORS = [
  '#5B8EBC', // Muted blue
  '#7FC9A0', // Soft green
  '#F4A261', // Warm orange
  '#E76F51', // Terracotta
  '#8E7CC3', // Lavender
  '#6A9FB5', // Steel blue
  '#C9ADA7', // Dusty rose
  '#9A8C98', // Mauve
];

// Choropleth color schemes for world maps
export const MAP_COLOR_SCHEMES = {
  blue: {
    min: '#E3F2FD', // Light blue
    mid: '#5B8EBC', // Default blue
    max: '#1565C0', // Dark blue
  },
  green: {
    min: '#E8F5E9', // Light green
    mid: '#7FC9A0', // Default green
    max: '#2E7D32', // Dark green
  },
  red: {
    min: '#FFEBEE', // Light red
    mid: '#E76F51', // Default terracotta
    max: '#C62828', // Dark red
  },
  purple: {
    min: '#F3E5F5', // Light purple
    mid: '#8E7CC3', // Default lavender
    max: '#6A1B9A', // Dark purple
  },
};

// Data constraints
export const CHART_CONSTRAINTS = {
  MAX_ROWS: 20,
  MAX_SERIES: 8,
  MIN_ROWS: 2,
  MIN_SERIES: 1,
  TITLE_MAX_LENGTH: 100,
  SUBTITLE_MAX_LENGTH: 150,
  LABEL_MAX_LENGTH: 50,
  UNIT_SUFFIX_MAX_LENGTH: 20,
};

// World map specific constraints
export const MAP_CONSTRAINTS = {
  MAX_COUNTRIES: 200, // Maximum countries to display
  MIN_COUNTRIES: 1, // Minimum countries required
  COUNTRY_NAME_MAX_LENGTH: 50,
};

// Export resolutions
export const EXPORT_RESOLUTIONS = {
  '1200x700': { width: 1200, height: 700, label: 'Standard (1200 × 700)' },
  '1920x1080': { width: 1920, height: 1080, label: 'Full HD (1920 × 1080)' },
  '2400x1400': { width: 2400, height: 1400, label: 'High-Res (2400 × 1400)' },
  '3840x2160': { width: 3840, height: 2160, label: '4K (3840 × 2160)' },
};

// Graph size constraints
export const GRAPH_SIZE_CONSTRAINTS = {
  MIN_WIDTH: 400,
  MAX_WIDTH: 2000,
  MIN_HEIGHT: 300,
  MAX_HEIGHT: 1500,
  DEFAULT_WIDTH: 1200,
  DEFAULT_HEIGHT: 600,
};

// Logo constraints
export const LOGO_CONSTRAINTS = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  ACCEPTED_FORMATS: ['image/png', 'image/svg+xml'],
  ACCEPTED_MIME_TYPES: ['image/png', 'image/svg+xml'],
};

// Sample demo data (healthcare market research example)
export const SAMPLE_DATA: DataSource = {
  labels: ['2020', '2021', '2022', '2023', '2024'],
  series: [
    {
      id: 'hardware',
      name: 'Medical Hardware',
      color: DEFAULT_CHART_COLORS[0],
      values: [2.3, 2.6, 2.9, 3.2, 3.5],
    },
    {
      id: 'software',
      name: 'Healthcare Software',
      color: DEFAULT_CHART_COLORS[1],
      values: [1.1, 1.3, 1.6, 1.9, 2.3],
    },
    {
      id: 'services',
      name: 'Medical Services',
      color: DEFAULT_CHART_COLORS[2],
      values: [0.7, 0.8, 0.9, 1.1, 1.3],
    },
  ],
};

// Sample world map data
export const SAMPLE_MAP_DATA: MapDataSource = {
  data: [
    { countryCode: 'USA', countryName: 'United States', value: 350 },
    { countryCode: 'CHN', countryName: 'China', value: 420 },
    { countryCode: 'DEU', countryName: 'Germany', value: 180 },
    { countryCode: 'JPN', countryName: 'Japan', value: 230 },
    { countryCode: 'IND', countryName: 'India', value: 150 },
    { countryCode: 'GBR', countryName: 'United Kingdom', value: 120 },
    { countryCode: 'FRA', countryName: 'France', value: 110 },
    { countryCode: 'BRA', countryName: 'Brazil', value: 95 },
  ],
  minValue: 0,
  maxValue: 500,
};

// Default metadata
export const DEFAULT_METADATA: ChartMetadata = {
  title: 'Global Medical Device Market (USD Billion)',
  subtitle: 'Market size by segment, 2020-2024',
  xAxisLabel: 'Year',
  yAxisLabel: 'Revenue',
  unitSuffix: 'B',
  decimalPrecision: 1,
  showLegend: true,
  showGridlines: true,
  axisLabelDisplay: 'first-second-last',
  mapColorScheme: 'blue',
  source: 'Healthcare Foresights',
};

// Default chart configuration
export const DEFAULT_CHART_CONFIG: ChartConfig = {
  chartType: 'bar',
  orientation: 'vertical',
  colorTheme: 'default',
};

// Default logo configuration
export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  file: null,
  previewUrl: null,
  position: 'top-right',
  opacity: 80,
};
