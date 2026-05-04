import { toPng } from 'html-to-image';
import type { ExportOptions } from '@/lib/types/chart-generator';
import { EXPORT_RESOLUTIONS } from '@/lib/config/chart-generator';

export async function exportChartAsImage(
  chartElement: HTMLElement,
  chartInstance: any,
  options: ExportOptions,
  chartTitle?: string
): Promise<void> {
  // Store original styles to restore later
  const originalWidth = chartElement.style.width;
  const originalHeight = chartElement.style.height;

  try {
    // Determine resolution based on preset or custom values
    let resolution: { width: number; height: number };

    if (options.resolution === 'custom' && options.customWidth && options.customHeight) {
      resolution = { width: options.customWidth, height: options.customHeight };
    } else if (options.resolution !== 'custom') {
      resolution = EXPORT_RESOLUTIONS[options.resolution];
    } else {
      throw new Error('Invalid resolution configuration');
    }

    // Calculate pixel ratio based on resolution size
    const pixelRatio = resolution.width >= 2400 || resolution.height >= 1400 ? 2 : 1;

    // Step 1: Temporarily set fixed dimensions on the chart container
    chartElement.style.width = `${resolution.width}px`;
    chartElement.style.height = `${resolution.height}px`;

    // Step 2: Directly resize the ECharts instance to match export dimensions
    if (chartInstance) {
      const echartsInstance = chartInstance.getEchartsInstance();
      if (echartsInstance) {
        echartsInstance.resize({
          width: resolution.width,
          height: resolution.height,
        });

        // Give ECharts time to complete the resize
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }

    // Step 3: Enhanced export options for clean rendering
    const exportOptions = {
      pixelRatio,
      width: resolution.width,
      height: resolution.height,
      backgroundColor: '#ffffff',
      cacheBust: true,
      style: {
        margin: '0',
        padding: '0',
        transform: 'scale(1)',
      },
      // Filter to ensure clean element capture
      filter: (node: HTMLElement) => {
        // Exclude elements with classes that might add unwanted spacing
        const excludeClasses = ['border', 'rounded-md', 'shadow'];
        const hasExcludedClass = excludeClasses.some(cls => node.className?.includes?.(cls));

        // Only include the chart container and its children
        return !hasExcludedClass || node.tagName === 'CANVAS' || node.tagName === 'DIV';
      },
    };

    let dataUrl: string;

    if (options.format === 'png') {
      dataUrl = await toPng(chartElement, exportOptions);
    } else {
      // WEBP format - html-to-image doesn't directly support webp
      // We'll export as PNG first, then convert using canvas
      const pngDataUrl = await toPng(chartElement, exportOptions);

      // Convert PNG to WEBP using canvas
      dataUrl = await convertPngToWebp(pngDataUrl, resolution.width, resolution.height);
    }

    // Trigger download
    downloadImage(dataUrl, options.format, chartTitle);
  } catch (error) {
    console.error('Error exporting chart:', error);
    throw new Error('Failed to export chart. Please try again.');
  } finally {
    // Step 4: Restore original responsive dimensions
    chartElement.style.width = originalWidth;
    chartElement.style.height = originalHeight;

    // Step 5: Resize ECharts back to responsive mode
    if (chartInstance) {
      const echartsInstance = chartInstance.getEchartsInstance();
      if (echartsInstance) {
        // Resize without specific dimensions to make it responsive again
        echartsInstance.resize();
      }
    }
  }
}

async function convertPngToWebp(
  pngDataUrl: string,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WEBP
      try {
        const webpDataUrl = canvas.toDataURL('image/webp', 0.95);
        resolve(webpDataUrl);
      } catch {
        reject(new Error('Browser does not support WEBP format'));
      }
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for conversion'));
    };
    img.src = pngDataUrl;
  });
}

function downloadImage(dataUrl: string, format: 'png' | 'webp', chartTitle?: string) {
  const link = document.createElement('a');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const sanitizedTitle = chartTitle
    ? chartTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 50)
    : 'chart';

  link.download = `${sanitizedTitle}-${timestamp}.${format}`;
  link.href = dataUrl;
  link.click();
}

export async function generateChartPreview(
  chartElement: HTMLElement,
  chartInstance: any,
  options: ExportOptions
): Promise<string> {
  // Store original styles to restore later
  const originalWidth = chartElement.style.width;
  const originalHeight = chartElement.style.height;

  try {
    // Determine resolution based on preset or custom values
    let resolution: { width: number; height: number };

    if (options.resolution === 'custom' && options.customWidth && options.customHeight) {
      resolution = { width: options.customWidth, height: options.customHeight };
    } else if (options.resolution !== 'custom') {
      resolution = EXPORT_RESOLUTIONS[options.resolution];
    } else {
      throw new Error('Invalid resolution configuration');
    }

    const pixelRatio = resolution.width >= 2400 || resolution.height >= 1400 ? 2 : 1;

    // Temporarily set fixed dimensions
    chartElement.style.width = `${resolution.width}px`;
    chartElement.style.height = `${resolution.height}px`;

    // Resize ECharts instance
    if (chartInstance) {
      const echartsInstance = chartInstance.getEchartsInstance();
      if (echartsInstance) {
        echartsInstance.resize({
          width: resolution.width,
          height: resolution.height,
        });
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }

    const exportOptions = {
      pixelRatio,
      width: resolution.width,
      height: resolution.height,
      backgroundColor: '#ffffff',
      cacheBust: true,
      style: {
        margin: '0',
        padding: '0',
        transform: 'scale(1)',
      },
      filter: (node: HTMLElement) => {
        const excludeClasses = ['border', 'rounded-md', 'shadow'];
        const hasExcludedClass = excludeClasses.some(cls => node.className?.includes?.(cls));
        return !hasExcludedClass || node.tagName === 'CANVAS' || node.tagName === 'DIV';
      },
    };

    let dataUrl: string;

    if (options.format === 'png') {
      dataUrl = await toPng(chartElement, exportOptions);
    } else {
      const pngDataUrl = await toPng(chartElement, exportOptions);
      dataUrl = await convertPngToWebp(pngDataUrl, resolution.width, resolution.height);
    }

    return dataUrl;
  } finally {
    // Restore original dimensions
    chartElement.style.width = originalWidth;
    chartElement.style.height = originalHeight;

    if (chartInstance) {
      const echartsInstance = chartInstance.getEchartsInstance();
      if (echartsInstance) {
        echartsInstance.resize();
      }
    }
  }
}

export function checkBrowserSupport(): { supported: boolean; message?: string } {
  // Check if html-to-image is supported
  if (typeof window === 'undefined') {
    return {
      supported: false,
      message: 'Image export is not available in server-side rendering',
    };
  }

  // Check for canvas support
  const canvas = document.createElement('canvas');
  if (!canvas.getContext || !canvas.getContext('2d')) {
    return {
      supported: false,
      message: 'Your browser does not support canvas rendering',
    };
  }

  return { supported: true };
}
