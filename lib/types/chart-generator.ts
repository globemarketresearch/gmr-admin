// Chart Generator Type Definitions

export type ChartType = 'bar' | 'stacked-bar' | 'pie' | 'donut' | 'world-map';

export type ChartOrientation = 'vertical' | 'horizontal';

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-right';

export type ColorTheme = 'default' | 'custom';

export type AxisLabelDisplay = 'all' | 'first-second-last' | 'first-last' | 'none';

export interface ChartMetadata {
  title: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  unitSuffix?: string;
  decimalPrecision: 0 | 1 | 2;
  showLegend: boolean;
  showGridlines: boolean;
  axisLabelDisplay?: AxisLabelDisplay;
  mapColorScheme?: 'blue' | 'green' | 'red' | 'purple';
  source?: string;
}

export interface DataSeries {
  id: string;
  name: string;
  color: string;
  values: number[];
}

export interface DataSource {
  labels: string[]; // X-axis categories (e.g., years)
  series: DataSeries[]; // Multiple data series
}

export interface MapDataPoint {
  countryCode: string; // ISO 3166-1 alpha-3 code (e.g., 'USA', 'CHN')
  countryName: string; // Display name (e.g., 'United States', 'China')
  value: number; // Numeric value for the country
}

export interface MapDataSource {
  data: MapDataPoint[];
  minValue?: number; // Auto-calculated if not provided
  maxValue?: number; // Auto-calculated if not provided
}

export interface LogoConfig {
  file: File | null;
  previewUrl: string | null;
  position: LogoPosition;
  opacity: number; // 0-100
}

export interface ChartConfig {
  chartType: ChartType;
  orientation: ChartOrientation;
  colorTheme: ColorTheme;
}

export interface ChartConfiguration {
  chartType: ChartType;
  orientation: ChartOrientation;
  colorTheme: ColorTheme;
  metadata: ChartMetadata;
  dataSource: DataSource | MapDataSource;
  logo: LogoConfig;
}

export type ResolutionPreset = '1200x700' | '1920x1080' | '2400x1400' | '3840x2160' | 'custom';

export interface ExportOptions {
  format: 'png' | 'webp';
  resolution: ResolutionPreset;
  customWidth?: number;
  customHeight?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Serializable configuration (for JSON export - excludes File objects)
export interface SerializableChartConfiguration {
  chartType: ChartType;
  orientation: ChartOrientation;
  colorTheme: ColorTheme;
  metadata: ChartMetadata;
  dataSource: DataSource | MapDataSource;
  logo: {
    position: LogoPosition;
    opacity: number;
    // Note: file and previewUrl excluded - user must re-upload
  };
}
