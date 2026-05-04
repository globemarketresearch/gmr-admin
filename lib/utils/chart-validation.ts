import type {
  ChartType,
  ChartMetadata,
  DataSource,
  MapDataSource,
  ValidationResult,
  ValidationError,
} from '@/lib/types/chart-generator';
import { CHART_CONSTRAINTS, MAP_CONSTRAINTS } from '@/lib/config/chart-generator';

export function validateChartConfiguration(
  metadata: ChartMetadata,
  dataSource: DataSource | MapDataSource,
  chartType: ChartType
): ValidationResult {
  const errors: ValidationError[] = [];

  // Route to appropriate validation based on chart type
  if (chartType === 'world-map') {
    return validateMapConfiguration(metadata, dataSource as MapDataSource);
  }

  // Continue with standard validation for other chart types
  const standardDataSource = dataSource as DataSource;

  // Title validation
  if (!metadata.title || !metadata.title.trim()) {
    errors.push({
      field: 'title',
      message: 'Chart title is required',
    });
  } else if (metadata.title.length > CHART_CONSTRAINTS.TITLE_MAX_LENGTH) {
    errors.push({
      field: 'title',
      message: `Title must be at most ${CHART_CONSTRAINTS.TITLE_MAX_LENGTH} characters`,
    });
  }

  // Subtitle validation
  if (metadata.subtitle && metadata.subtitle.length > CHART_CONSTRAINTS.SUBTITLE_MAX_LENGTH) {
    errors.push({
      field: 'subtitle',
      message: `Subtitle must be at most ${CHART_CONSTRAINTS.SUBTITLE_MAX_LENGTH} characters`,
    });
  }

  // Data source validation - minimum rows
  if (!standardDataSource.labels || standardDataSource.labels.length < CHART_CONSTRAINTS.MIN_ROWS) {
    errors.push({
      field: 'dataSource',
      message: `At least ${CHART_CONSTRAINTS.MIN_ROWS} data rows are required`,
    });
  }

  // Data source validation - maximum rows
  if (standardDataSource.labels && standardDataSource.labels.length > CHART_CONSTRAINTS.MAX_ROWS) {
    errors.push({
      field: 'dataSource',
      message: `Maximum ${CHART_CONSTRAINTS.MAX_ROWS} data rows allowed`,
    });
  }

  // Data source validation - minimum series
  if (
    !standardDataSource.series ||
    standardDataSource.series.length < CHART_CONSTRAINTS.MIN_SERIES
  ) {
    errors.push({
      field: 'dataSource',
      message: `At least ${CHART_CONSTRAINTS.MIN_SERIES} data series is required`,
    });
  }

  // Data source validation - maximum series
  if (
    standardDataSource.series &&
    standardDataSource.series.length > CHART_CONSTRAINTS.MAX_SERIES
  ) {
    errors.push({
      field: 'dataSource',
      message: `Maximum ${CHART_CONSTRAINTS.MAX_SERIES} data series allowed`,
    });
  }

  // Data source validation - labels match series values length
  if (standardDataSource.labels && standardDataSource.series) {
    const labelsLength = standardDataSource.labels.length;
    standardDataSource.series.forEach(series => {
      if (series.values.length !== labelsLength) {
        errors.push({
          field: 'dataSource',
          message: `Series "${series.name}" has ${series.values.length} values, but ${labelsLength} labels exist. They must match.`,
        });
      }
    });
  }

  // Data source validation - all values must be valid numbers
  if (standardDataSource.series) {
    standardDataSource.series.forEach(series => {
      const hasInvalidValues = series.values.some(val => typeof val !== 'number' || isNaN(val));
      if (hasInvalidValues) {
        errors.push({
          field: 'dataSource',
          message: `Series "${series.name}" contains invalid numeric values`,
        });
      }
    });
  }

  // Data source validation - empty labels
  if (standardDataSource.labels) {
    const hasEmptyLabels = standardDataSource.labels.some(label => !label || !label.trim());
    if (hasEmptyLabels) {
      errors.push({
        field: 'dataSource',
        message: 'All category labels must be non-empty',
      });
    }
  }

  // Data source validation - empty series names
  if (standardDataSource.series) {
    const hasEmptySeriesNames = standardDataSource.series.some(
      series => !series.name || !series.name.trim()
    );
    if (hasEmptySeriesNames) {
      errors.push({
        field: 'dataSource',
        message: 'All series must have a name',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateMapConfiguration(
  metadata: ChartMetadata,
  mapDataSource: MapDataSource
): ValidationResult {
  const errors: ValidationError[] = [];

  // Title validation (same as regular charts)
  if (!metadata.title || !metadata.title.trim()) {
    errors.push({
      field: 'title',
      message: 'Chart title is required',
    });
  } else if (metadata.title.length > CHART_CONSTRAINTS.TITLE_MAX_LENGTH) {
    errors.push({
      field: 'title',
      message: `Title must be at most ${CHART_CONSTRAINTS.TITLE_MAX_LENGTH} characters`,
    });
  }

  // Subtitle validation
  if (metadata.subtitle && metadata.subtitle.length > CHART_CONSTRAINTS.SUBTITLE_MAX_LENGTH) {
    errors.push({
      field: 'subtitle',
      message: `Subtitle must be at most ${CHART_CONSTRAINTS.SUBTITLE_MAX_LENGTH} characters`,
    });
  }

  // Map data validation - minimum countries
  if (!mapDataSource.data || mapDataSource.data.length < MAP_CONSTRAINTS.MIN_COUNTRIES) {
    errors.push({
      field: 'mapDataSource',
      message: `At least ${MAP_CONSTRAINTS.MIN_COUNTRIES} country is required`,
    });
  }

  // Map data validation - maximum countries
  if (mapDataSource.data && mapDataSource.data.length > MAP_CONSTRAINTS.MAX_COUNTRIES) {
    errors.push({
      field: 'mapDataSource',
      message: `Maximum ${MAP_CONSTRAINTS.MAX_COUNTRIES} countries allowed`,
    });
  }

  // Validate each country data point
  if (mapDataSource.data) {
    mapDataSource.data.forEach((point, index) => {
      // Validate country code
      if (!point.countryCode || !point.countryCode.trim()) {
        errors.push({
          field: 'mapDataSource',
          message: `Country code is required for data point ${index + 1}`,
        });
      } else if (point.countryCode.length !== 3) {
        errors.push({
          field: 'mapDataSource',
          message: `Country code "${point.countryCode}" must be 3 characters (ISO 3166-1 alpha-3)`,
        });
      }

      // Validate country name
      if (!point.countryName || !point.countryName.trim()) {
        errors.push({
          field: 'mapDataSource',
          message: `Country name is required for data point ${index + 1}`,
        });
      } else if (point.countryName.length > MAP_CONSTRAINTS.COUNTRY_NAME_MAX_LENGTH) {
        errors.push({
          field: 'mapDataSource',
          message: `Country name "${point.countryName}" exceeds maximum length of ${MAP_CONSTRAINTS.COUNTRY_NAME_MAX_LENGTH}`,
        });
      }

      // Validate value
      if (typeof point.value !== 'number' || isNaN(point.value)) {
        errors.push({
          field: 'mapDataSource',
          message: `Invalid value for country "${point.countryName}"`,
        });
      } else if (point.value < 0) {
        errors.push({
          field: 'mapDataSource',
          message: `Value for country "${point.countryName}" cannot be negative`,
        });
      }
    });

    // Check for duplicate country codes
    const countryCodes = mapDataSource.data.map(p => p.countryCode);
    const duplicates = countryCodes.filter((code, index) => countryCodes.indexOf(code) !== index);
    if (duplicates.length > 0) {
      errors.push({
        field: 'mapDataSource',
        message: `Duplicate country codes found: ${[...new Set(duplicates)].join(', ')}`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper to validate if a country name exists in ECharts world map
export const VALID_COUNTRY_NAMES = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cape Verde',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Korea',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Macedonia',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Swaziland',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
  // Common alternatives
  'United States of America',
  'USA',
  'UK',
  'UAE',
  'Dem. Rep. Congo',
  'Democratic Republic of the Congo',
  'Republic of the Congo',
  'South Korea',
  'North Korea',
];

export function validateCountryName(countryName: string): boolean {
  return VALID_COUNTRY_NAMES.some(name => name.toLowerCase() === countryName.toLowerCase());
}

export function validateLogoFile(file: File): { isValid: boolean; error?: string } {
  // File size validation
  if (file.size > 2 * 1024 * 1024) {
    return {
      isValid: false,
      error: 'Logo file size must not exceed 2MB',
    };
  }

  // File type validation
  const validTypes = ['image/png', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PNG and SVG formats are supported',
    };
  }

  return { isValid: true };
}
