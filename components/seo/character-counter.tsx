'use client';

import { cn } from '@/lib/utils';

interface CharacterCounterProps {
  current: number;
  min?: number;
  max: number;
  optimal?: { min: number; max: number };
  pixelWidth?: { current: number; max: number };
  showPixelWidth?: boolean;
  variant?: 'default' | 'inline';
  className?: string;
}

export function CharacterCounter({
  current,
  min,
  max,
  optimal,
  pixelWidth,
  showPixelWidth = true,
  variant = 'default',
  className,
}: CharacterCounterProps) {
  const getColor = () => {
    if (current === 0) return 'text-muted-foreground';

    // Check pixel width first if provided
    if (pixelWidth && pixelWidth.current > pixelWidth.max) {
      return 'text-red-600';
    }

    if (optimal) {
      // In optimal range and within pixel limit (if provided)
      if (current >= optimal.min && current <= optimal.max) {
        if (!pixelWidth || pixelWidth.current <= pixelWidth.max) {
          return 'text-green-600';
        }
      }
      // Outside optimal range or approaching pixel limit
      if (current < optimal.min || current > optimal.max) {
        return 'text-yellow-600';
      }
    }

    if (current > max) return 'text-red-600';
    if (min && current < min) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getBgColor = () => {
    if (current === 0) return 'bg-muted-foreground';

    // Check pixel width first if provided
    if (pixelWidth && pixelWidth.current > pixelWidth.max) {
      return 'bg-red-600';
    }

    if (optimal) {
      // In optimal range and within pixel limit (if provided)
      if (current >= optimal.min && current <= optimal.max) {
        if (!pixelWidth || pixelWidth.current <= pixelWidth.max) {
          return 'bg-green-600';
        }
      }
      // Outside optimal range or approaching pixel limit
      if (current < optimal.min || current > optimal.max) {
        return 'bg-yellow-600';
      }
    }

    if (current > max) return 'bg-red-600';
    if (min && current < min) return 'bg-yellow-600';
    return 'bg-blue-600';
  };

  // Calculate percentage based on both character count and pixel width
  const charPercentage = (current / max) * 100;
  const pixelPercentage = pixelWidth ? (pixelWidth.current / pixelWidth.max) * 100 : 0;

  // Use the maximum of both percentages to show the most restrictive constraint
  const percentage = Math.min(Math.max(charPercentage, pixelPercentage), 100);

  const isInline = variant === 'inline';

  return (
    <div
      className={cn(isInline ? 'inline-flex items-center gap-2' : 'space-y-1.5 mt-1.5', className)}
    >
      <div
        className={cn(
          'flex items-center gap-1.5',
          isInline ? 'text-xs' : 'justify-between text-xs'
        )}
      >
        <span className={getColor()}>
          {current}/{max}
          {pixelWidth && showPixelWidth && (
            <span className="ml-1">
              ({pixelWidth.current}px / {pixelWidth.max}px)
            </span>
          )}
        </span>
      </div>
      {!isInline && (
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300 ease-in-out', getBgColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      {isInline && (
        <div className="h-1 w-16 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all', getBgColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
