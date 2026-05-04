'use client';

import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import type ReactEChartsCore from 'echarts-for-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useChartGenerator } from '@/hooks/use-chart-generator';
import { buildEChartsConfig } from '@/lib/utils/chart-builder';
import worldMapData from '@/lib/data/world-map.json';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  ),
}) as typeof ReactEChartsCore;

// Register world map immediately when module loads (client-side only)
if (typeof window !== 'undefined') {
  try {
    echarts.registerMap('world', worldMapData as Parameters<typeof echarts.registerMap>[1]);
  } catch (error) {
    console.error('Failed to register world map:', error);
  }
}

export interface ChartPreviewRef {
  getChartInstance: () => ReactEChartsCore | null;
  getExportContainer: () => HTMLDivElement | null;
}

interface ChartPreviewProps {
  width?: number;
  height?: number;
}

export const ChartPreview = forwardRef<ChartPreviewRef, ChartPreviewProps>(
  ({ width = 1200, height = 600 }, ref) => {
    const chartRef = useRef<ReactEChartsCore>(null);
    const exportContainerRef = useRef<HTMLDivElement>(null);
    const { chartConfig, metadata, dataSource, logo } = useChartGenerator();

    const chartOption: EChartsOption = useMemo(() => {
      return buildEChartsConfig({
        chartType: chartConfig.chartType,
        orientation: chartConfig.orientation,
        metadata,
        dataSource,
        logo,
      });
    }, [chartConfig, metadata, dataSource, logo]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getChartInstance: () => chartRef.current,
      getExportContainer: () => exportContainerRef.current,
    }));

    // Handle window resize to ensure chart resizes properly
    React.useEffect(() => {
      const handleResize = () => {
        if (chartRef.current) {
          const instance = chartRef.current.getEchartsInstance();
          if (instance) {
            instance.resize();
          }
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Resize chart when width/height props change
    React.useEffect(() => {
      if (chartRef.current) {
        const instance = chartRef.current.getEchartsInstance();
        if (instance) {
          instance.resize();
        }
      }
    }, [width, height]);

    return (
      <div className="w-full bg-white rounded-md p-4 border border-border overflow-auto">
        {/* Clean export container without padding/borders */}
        <div
          ref={exportContainerRef}
          className="bg-white mx-auto"
          style={{ width: `${width}px`, maxWidth: '100%' }}
        >
          <ReactECharts
            ref={chartRef}
            option={chartOption}
            notMerge={true}
            style={{ height: `${height}px`, width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
    );
  }
);

ChartPreview.displayName = 'ChartPreview';
