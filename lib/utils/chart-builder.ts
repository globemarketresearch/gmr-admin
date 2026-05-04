import type { EChartsOption } from 'echarts';
import type {
  ChartType,
  ChartOrientation,
  ChartMetadata,
  DataSource,
  MapDataSource,
  LogoConfig,
  AxisLabelDisplay,
} from '@/lib/types/chart-generator';
import { MAP_COLOR_SCHEMES } from '@/lib/config/chart-generator';

interface ChartBuilderConfig {
  chartType: ChartType;
  orientation: ChartOrientation;
  metadata: ChartMetadata;
  dataSource: DataSource | MapDataSource;
  logo: LogoConfig;
}

export function buildEChartsConfig(config: ChartBuilderConfig): EChartsOption {
  const { chartType, orientation, metadata, dataSource, logo } = config;

  // Base configuration
  const baseConfig: EChartsOption = {
    backgroundColor: '#ffffff',
    title: {
      text: metadata.title,
      subtext: metadata.subtitle,
      left: 40,
      top: 20,
      textStyle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      subtextStyle: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
    },
    tooltip: {
      trigger:
        chartType === 'pie' || chartType === 'donut'
          ? 'item'
          : chartType === 'world-map'
            ? 'item'
            : 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#1a1a1a',
        fontSize: 13,
      },
      formatter:
        chartType === 'pie' || chartType === 'donut'
          ? '{b}'
          : chartType === 'world-map'
            ? (params: any) => {
                return `${params.name}<br/>${params.value || 'No data'}${metadata.unitSuffix || ''}`;
              }
            : undefined,
    },
    legend:
      metadata.showLegend && chartType !== 'world-map'
        ? {
            show: true,
            bottom: metadata.source ? 25 : 10,
            left: 'center',
            itemGap: 20,
            itemWidth: 14,
            itemHeight: 14,
            textStyle: {
              fontSize: 12,
              color: '#4b5563',
            },
          }
        : { show: false },
  };

  // Add grid configuration for bar charts
  if (chartType !== 'pie' && chartType !== 'donut' && chartType !== 'world-map') {
    const standardDataSource = dataSource as DataSource;
    // Calculate bottom spacing based on legend and source text
    let bottomSpacing = '8%';
    if (metadata.showLegend && metadata.source) {
      bottomSpacing = '15%';
    } else if (metadata.showLegend) {
      bottomSpacing = '12%';
    } else if (metadata.source) {
      bottomSpacing = '10%';
    }

    baseConfig.grid = {
      left: '10%',
      right: '10%',
      bottom: bottomSpacing,
      top: metadata.subtitle ? '20%' : '15%',
      containLabel: true,
    };

    // X-axis configuration
    if (orientation === 'vertical') {
      baseConfig.xAxis = {
        type: 'category',
        data: standardDataSource.labels,
        name: metadata.xAxisLabel,
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          fontSize: 13,
          color: '#6b7280',
          fontWeight: 500,
        },
        axisLine: {
          lineStyle: {
            color: '#d1d5db',
          },
        },
        axisLabel: {
          color: '#4b5563',
          fontSize: 12,
        },
        splitLine: {
          show: false,
        },
      };

      baseConfig.yAxis = {
        type: 'value',
        name: metadata.yAxisLabel,
        nameTextStyle: {
          fontSize: 13,
          color: '#6b7280',
          fontWeight: 500,
        },
        axisLabel: {
          color: '#4b5563',
          fontSize: 12,
          formatter: (value: number) => {
            const formatted = Number(value.toFixed(metadata.decimalPrecision));
            return formatted + (metadata.unitSuffix || '');
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#d1d5db',
          },
        },
        splitLine: {
          show: metadata.showGridlines,
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed',
          },
        },
      };
    } else {
      // Horizontal orientation
      baseConfig.xAxis = {
        type: 'value',
        name: metadata.xAxisLabel,
        nameTextStyle: {
          fontSize: 13,
          color: '#6b7280',
          fontWeight: 500,
        },
        axisLabel: {
          color: '#4b5563',
          fontSize: 12,
          formatter: (value: number) => {
            const formatted = Number(value.toFixed(metadata.decimalPrecision));
            return formatted + (metadata.unitSuffix || '');
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#d1d5db',
          },
        },
        splitLine: {
          show: metadata.showGridlines,
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed',
          },
        },
      };

      const standardDataSource = dataSource as DataSource;
      baseConfig.yAxis = {
        type: 'category',
        data: standardDataSource.labels,
        name: metadata.yAxisLabel,
        nameLocation: 'middle',
        nameGap: 80,
        nameTextStyle: {
          fontSize: 13,
          color: '#6b7280',
          fontWeight: 500,
        },
        axisLine: {
          lineStyle: {
            color: '#d1d5db',
          },
        },
        axisLabel: {
          color: '#4b5563',
          fontSize: 12,
        },
        splitLine: {
          show: false,
        },
      };
    }
  } else if (chartType === 'world-map') {
    // Clear axis and grid for map
    baseConfig.grid = undefined;
    baseConfig.xAxis = undefined;
    baseConfig.yAxis = undefined;

    // Add visualMap for choropleth coloring
    const mapData = dataSource as MapDataSource;
    const colorScheme = MAP_COLOR_SCHEMES[metadata.mapColorScheme || 'blue'];

    baseConfig.visualMap = {
      min: mapData.minValue ?? 0,
      max: mapData.maxValue ?? 100,
      text: ['High', 'Low'],
      realtime: false,
      calculable: true,
      inRange: {
        color: [colorScheme.min, colorScheme.mid, colorScheme.max],
      },
      textStyle: {
        color: '#4b5563',
        fontSize: 12,
      },
      left: 'left',
      bottom: '10%',
    };
  } else {
    // Explicitly clear axis and grid for pie/donut charts to prevent collision
    baseConfig.grid = undefined;
    baseConfig.xAxis = undefined;
    baseConfig.yAxis = undefined;
  }

  // Build series configuration
  baseConfig.series = buildSeriesConfig(chartType, orientation, dataSource, metadata);

  // Build graphics array for logo and source text
  const graphics: any[] = [];

  // Add logo graphic if logo exists
  if (logo.previewUrl) {
    graphics.push(buildLogoGraphic(logo));
  }

  // Add source text if provided
  if (metadata.source) {
    graphics.push(buildSourceTextGraphic(metadata.source));
  }

  // Set graphic if we have any
  if (graphics.length > 0) {
    baseConfig.graphic = graphics;
  }

  return baseConfig;
}

function buildSeriesConfig(
  chartType: ChartType,
  orientation: ChartOrientation,
  dataSource: DataSource | MapDataSource,
  metadata: ChartMetadata
): EChartsOption['series'] {
  if (chartType === 'donut') {
    // Donut chart series - similar to pie but with inner radius
    const standardDataSource = dataSource as DataSource;
    const donutData =
      standardDataSource.series.length > 0
        ? standardDataSource.series[0].values.map((val, idx) => ({
            value: Number(val.toFixed(metadata.decimalPrecision)),
            name: standardDataSource.labels[idx],
          }))
        : [];

    // If multiple series for donut chart, aggregate like pie
    if (standardDataSource.series.length > 1) {
      const aggregatedData = standardDataSource.labels.map((label, labelIdx) => {
        const totalValue = standardDataSource.series.reduce(
          (sum, series) => sum + (series.values[labelIdx] || 0),
          0
        );
        return {
          value: Number(totalValue.toFixed(metadata.decimalPrecision)),
          name: label,
        };
      });

      return [
        {
          type: 'pie',
          radius: ['40%', '70%'], // Inner and outer radius for donut
          center: ['50%', '50%'],
          data: aggregatedData,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}',
            fontSize: 12,
            color: '#4b5563',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
        },
      ];
    }

    return [
      {
        type: 'pie',
        radius: ['40%', '70%'], // Key difference: inner radius creates donut hole
        center: ['50%', '50%'],
        data: donutData,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}',
          fontSize: 12,
          color: '#4b5563',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    ];
  }

  if (chartType === 'world-map') {
    const mapData = dataSource as MapDataSource;

    // Transform MapDataSource to ECharts map format
    const echartsMapData = mapData.data.map(point => ({
      name: point.countryName,
      value: Number(point.value.toFixed(metadata.decimalPrecision)),
    }));

    return [
      {
        type: 'map',
        map: 'world', // Uses built-in world map
        roam: false, // Disable zoom/pan as requested
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 1,
          areaColor: '#f5f5f5', // Default color for countries with no data
        },
        emphasis: {
          itemStyle: {
            areaColor: '#FFA500',
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            color: '#1a1a1a',
            fontSize: 12,
          },
        },
        label: {
          show: false, // Don't show labels by default
          fontSize: 10,
          color: '#4b5563',
        },
        data: echartsMapData,
      },
    ];
  }

  if (chartType === 'pie') {
    const standardDataSource = dataSource as DataSource;
    // Pie chart series
    const pieData =
      standardDataSource.series.length > 0
        ? standardDataSource.series[0].values.map((val, idx) => ({
            value: Number(val.toFixed(metadata.decimalPrecision)),
            name: standardDataSource.labels[idx],
          }))
        : [];

    // If multiple series for pie chart, use first series data with all series colors
    if (standardDataSource.series.length > 1) {
      // Aggregate all series for pie chart
      const aggregatedData = standardDataSource.labels.map((label, labelIdx) => {
        const totalValue = standardDataSource.series.reduce(
          (sum, series) => sum + (series.values[labelIdx] || 0),
          0
        );
        return {
          value: Number(totalValue.toFixed(metadata.decimalPrecision)),
          name: label,
        };
      });

      return [
        {
          type: 'pie',
          radius: ['0%', '65%'],
          center: ['50%', '50%'],
          data: aggregatedData,
          itemStyle: {
            borderRadius: 5,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}',
            fontSize: 12,
            color: '#4b5563',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
        },
      ];
    }

    return [
      {
        type: 'pie',
        radius: ['0%', '65%'],
        center: ['50%', '50%'],
        data: pieData,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}',
          fontSize: 12,
          color: '#4b5563',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    ];
  }

  // Bar chart series (stacked or regular)
  const standardDataSource = dataSource as DataSource;
  const labelDisplay = metadata.axisLabelDisplay || 'first-second-last';
  const totalDataPoints = standardDataSource.labels.length;

  return standardDataSource.series.map(series => ({
    name: series.name,
    type: 'bar',
    data: series.values.map(val => Number(val.toFixed(metadata.decimalPrecision))),
    stack: chartType === 'stacked-bar' ? 'total' : undefined,
    itemStyle: {
      color: series.color,
      borderRadius: orientation === 'vertical' ? [5, 5, 0, 0] : [0, 5, 5, 0],
    },
    label: {
      show: true,
      position: orientation === 'vertical' ? 'top' : 'right',
      formatter: (params: any) => {
        const dataIndex = params.dataIndex;

        // Determine if this label should be shown based on labelDisplay setting
        let shouldShow = true;
        if (labelDisplay === 'none') {
          shouldShow = false;
        } else if (labelDisplay === 'first-last') {
          shouldShow = dataIndex === 0 || dataIndex === totalDataPoints - 1;
        } else if (labelDisplay === 'first-second-last') {
          shouldShow = dataIndex === 0 || dataIndex === 1 || dataIndex === totalDataPoints - 1;
        }
        // 'all' shows everything by default

        if (!shouldShow) {
          return '';
        }

        const value = Number(params.value.toFixed(metadata.decimalPrecision));
        return value + (metadata.unitSuffix || '');
      },
      fontSize: 12,
      color: '#4b5563',
      fontWeight: 500,
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
      },
    },
    barMaxWidth: 60,
  }));
}

function buildLogoGraphic(logo: LogoConfig) {
  const positions = {
    'top-left': { left: 20, top: 20 },
    'top-right': { right: 20, top: 20 },
    'bottom-right': { right: 20, bottom: 20 },
  };

  return {
    type: 'image',
    ...positions[logo.position],
    style: {
      image: logo.previewUrl || '',
      width: 100,
      height: 40,
      opacity: logo.opacity / 100,
    },
    z: 100,
  };
}

function buildSourceTextGraphic(sourceText: string) {
  return {
    type: 'text',
    left: 'center',
    bottom: 5,
    style: {
      text: `Source: ${sourceText}`,
      fontSize: 11,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fill: '#666666',
      fontWeight: 400,
    },
    z: 100,
  };
}
