'use client';

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import type {
  ChartType,
  ChartOrientation,
  ColorTheme,
  ChartMetadata,
  DataSource,
  MapDataSource,
  DataSeries,
  LogoConfig,
  ChartConfig,
  ValidationResult,
  SerializableChartConfiguration,
} from '@/lib/types/chart-generator';
import {
  DEFAULT_CHART_CONFIG,
  DEFAULT_METADATA,
  DEFAULT_LOGO_CONFIG,
  SAMPLE_DATA,
  SAMPLE_MAP_DATA,
  DEFAULT_CHART_COLORS,
} from '@/lib/config/chart-generator';
import { validateChartConfiguration, validateLogoFile } from '@/lib/utils/chart-validation';

interface ChartGeneratorContextType {
  // State
  chartConfig: ChartConfig;
  metadata: ChartMetadata;
  dataSource: DataSource | MapDataSource;
  logo: LogoConfig;
  validationResult: ValidationResult;

  // Chart config actions
  setChartType: (type: ChartType) => void;
  setOrientation: (orientation: ChartOrientation) => void;
  setColorTheme: (theme: ColorTheme) => void;

  // Metadata actions
  updateMetadata: (updates: Partial<ChartMetadata>) => void;

  // Data source actions
  updateDataSource: (dataSource: DataSource | MapDataSource) => void;
  addDataRow: () => void;
  removeDataRow: (index: number) => void;
  updateDataLabel: (index: number, label: string) => void;
  addDataSeries: () => void;
  removeDataSeries: (seriesId: string) => void;
  updateSeriesName: (seriesId: string, name: string) => void;
  updateSeriesColor: (seriesId: string, color: string) => void;
  updateSeriesValue: (seriesId: string, index: number, value: number) => void;

  // Logo actions
  uploadLogo: (file: File) => Promise<void>;
  updateLogoPosition: (position: LogoConfig['position']) => void;
  updateLogoOpacity: (opacity: number) => void;
  removeLogo: () => void;

  // General actions
  resetConfiguration: () => void;
  validateConfiguration: () => ValidationResult;
  exportConfiguration: () => string;
  importConfiguration: (json: string) => void;
}

const ChartGeneratorContext = createContext<ChartGeneratorContextType | undefined>(undefined);

export function ChartGeneratorProvider({ children }: { children: ReactNode }) {
  const [chartConfig, setChartConfig] = useState<ChartConfig>(DEFAULT_CHART_CONFIG);
  const [metadata, setMetadata] = useState<ChartMetadata>(DEFAULT_METADATA);
  const [dataSource, setDataSource] = useState<DataSource | MapDataSource>(SAMPLE_DATA);
  const [logo, setLogo] = useState<LogoConfig>(DEFAULT_LOGO_CONFIG);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });

  // Chart config actions
  const setChartType = useCallback((type: ChartType) => {
    setChartConfig(prev => {
      // Switch to appropriate data structure
      if (type === 'world-map') {
        setDataSource(SAMPLE_MAP_DATA);
      } else if (prev.chartType === 'world-map') {
        // Switching from world-map to another type
        setDataSource(SAMPLE_DATA);
      }
      return { ...prev, chartType: type };
    });
  }, []);

  const setOrientation = useCallback((orientation: ChartOrientation) => {
    setChartConfig(prev => ({ ...prev, orientation }));
  }, []);

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setChartConfig(prev => ({ ...prev, colorTheme: theme }));

    // If switching to default theme, reset series colors
    if (theme === 'default') {
      setDataSource(prev => {
        if ('series' in prev) {
          return {
            ...prev,
            series: prev.series.map((series, index) => ({
              ...series,
              color: DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
            })),
          };
        }
        return prev;
      });
    }
  }, []);

  // Metadata actions
  const updateMetadata = useCallback((updates: Partial<ChartMetadata>) => {
    setMetadata(prev => ({ ...prev, ...updates }));
  }, []);

  // Data source actions
  const updateDataSource = useCallback((newDataSource: DataSource | MapDataSource) => {
    setDataSource(newDataSource);
  }, []);

  const addDataRow = useCallback(() => {
    setDataSource(prev => {
      if ('series' in prev) {
        const newLabel = `Category ${prev.labels.length + 1}`;
        const newLabels = [...prev.labels, newLabel];
        const newSeries = prev.series.map(series => ({
          ...series,
          values: [...series.values, 0],
        }));
        return { labels: newLabels, series: newSeries };
      }
      return prev;
    });
  }, []);

  const removeDataRow = useCallback((index: number) => {
    setDataSource(prev => {
      if ('series' in prev) {
        const newLabels = prev.labels.filter((_, i) => i !== index);
        const newSeries = prev.series.map(series => ({
          ...series,
          values: series.values.filter((_, i) => i !== index),
        }));
        return { labels: newLabels, series: newSeries };
      }
      return prev;
    });
  }, []);

  const updateDataLabel = useCallback((index: number, label: string) => {
    setDataSource(prev => {
      if ('series' in prev) {
        const newLabels = [...prev.labels];
        newLabels[index] = label;
        return { ...prev, labels: newLabels };
      }
      return prev;
    });
  }, []);

  const addDataSeries = useCallback(() => {
    setDataSource(prev => {
      if ('series' in prev) {
        const newSeriesId = `series-${Date.now()}`;
        const colorIndex = prev.series.length % DEFAULT_CHART_COLORS.length;
        const newSeries: DataSeries = {
          id: newSeriesId,
          name: `Series ${prev.series.length + 1}`,
          color: DEFAULT_CHART_COLORS[colorIndex],
          values: new Array(prev.labels.length).fill(0),
        };
        return { ...prev, series: [...prev.series, newSeries] };
      }
      return prev;
    });
  }, []);

  const removeDataSeries = useCallback((seriesId: string) => {
    setDataSource(prev => {
      if ('series' in prev) {
        return {
          ...prev,
          series: prev.series.filter(s => s.id !== seriesId),
        };
      }
      return prev;
    });
  }, []);

  const updateSeriesName = useCallback((seriesId: string, name: string) => {
    setDataSource(prev => {
      if ('series' in prev) {
        return {
          ...prev,
          series: prev.series.map(s => (s.id === seriesId ? { ...s, name } : s)),
        };
      }
      return prev;
    });
  }, []);

  const updateSeriesColor = useCallback((seriesId: string, color: string) => {
    setDataSource(prev => {
      if ('series' in prev) {
        return {
          ...prev,
          series: prev.series.map(s => (s.id === seriesId ? { ...s, color } : s)),
        };
      }
      return prev;
    });
  }, []);

  const updateSeriesValue = useCallback((seriesId: string, index: number, value: number) => {
    setDataSource(prev => {
      if ('series' in prev) {
        return {
          ...prev,
          series: prev.series.map(s => {
            if (s.id === seriesId) {
              const newValues = [...s.values];
              newValues[index] = value;
              return { ...s, values: newValues };
            }
            return s;
          }),
        };
      }
      return prev;
    });
  }, []);

  // Logo actions
  const uploadLogo = useCallback(async (file: File) => {
    const validation = validateLogoFile(file);

    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid logo file');
      throw new Error(validation.error);
    }

    const previewUrl = URL.createObjectURL(file);

    setLogo(prev => ({
      ...prev,
      file,
      previewUrl,
    }));

    toast.success('Logo uploaded successfully');
  }, []);

  const updateLogoPosition = useCallback((position: LogoConfig['position']) => {
    setLogo(prev => ({ ...prev, position }));
  }, []);

  const updateLogoOpacity = useCallback((opacity: number) => {
    setLogo(prev => ({ ...prev, opacity }));
  }, []);

  const removeLogo = useCallback(() => {
    if (logo.previewUrl) {
      URL.revokeObjectURL(logo.previewUrl);
    }
    setLogo(DEFAULT_LOGO_CONFIG);
    toast.success('Logo removed');
  }, [logo.previewUrl]);

  // General actions
  const resetConfiguration = useCallback(() => {
    setChartConfig(DEFAULT_CHART_CONFIG);
    setMetadata(DEFAULT_METADATA);
    setDataSource(SAMPLE_DATA);

    if (logo.previewUrl) {
      URL.revokeObjectURL(logo.previewUrl);
    }
    setLogo(DEFAULT_LOGO_CONFIG);

    setValidationResult({ isValid: true, errors: [] });
    toast.success('Configuration reset to defaults');
  }, [logo.previewUrl]);

  const validateConfiguration = useCallback((): ValidationResult => {
    const result = validateChartConfiguration(metadata, dataSource, chartConfig.chartType);
    setValidationResult(result);
    return result;
  }, [metadata, dataSource, chartConfig.chartType]);

  const exportConfiguration = useCallback((): string => {
    const config: SerializableChartConfiguration = {
      chartType: chartConfig.chartType,
      orientation: chartConfig.orientation,
      colorTheme: chartConfig.colorTheme,
      metadata,
      dataSource,
      logo: {
        position: logo.position,
        opacity: logo.opacity,
      },
    };

    return JSON.stringify(config, null, 2);
  }, [chartConfig, metadata, dataSource, logo]);

  const importConfiguration = useCallback((json: string) => {
    try {
      const config: SerializableChartConfiguration = JSON.parse(json);

      setChartConfig({
        chartType: config.chartType,
        orientation: config.orientation,
        colorTheme: config.colorTheme,
      });
      setMetadata(config.metadata);
      setDataSource(config.dataSource);
      setLogo(prev => ({
        ...prev,
        position: config.logo.position,
        opacity: config.logo.opacity,
      }));

      // Validate imported configuration
      const result = validateChartConfiguration(
        config.metadata,
        config.dataSource,
        config.chartType
      );
      setValidationResult(result);

      if (result.isValid) {
        toast.success('Configuration imported successfully');
      } else {
        toast.warning('Configuration imported but contains validation errors');
      }
    } catch {
      toast.error('Invalid configuration file');
      throw new Error('Failed to import configuration');
    }
  }, []);

  const value: ChartGeneratorContextType = {
    chartConfig,
    metadata,
    dataSource,
    logo,
    validationResult,
    setChartType,
    setOrientation,
    setColorTheme,
    updateMetadata,
    updateDataSource,
    addDataRow,
    removeDataRow,
    updateDataLabel,
    addDataSeries,
    removeDataSeries,
    updateSeriesName,
    updateSeriesColor,
    updateSeriesValue,
    uploadLogo,
    updateLogoPosition,
    updateLogoOpacity,
    removeLogo,
    resetConfiguration,
    validateConfiguration,
    exportConfiguration,
    importConfiguration,
  };

  return <ChartGeneratorContext.Provider value={value}>{children}</ChartGeneratorContext.Provider>;
}

export function useChartGeneratorContext() {
  const context = React.useContext(ChartGeneratorContext);
  if (context === undefined) {
    throw new Error('useChartGeneratorContext must be used within a ChartGeneratorProvider');
  }
  return context;
}
