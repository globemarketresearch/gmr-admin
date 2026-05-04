/**
 * Formats a large number into a compact string with K, M, B suffixes
 * @param value - The number to format
 * @returns Formatted string (e.g., 1234567 → "1.23M", 45200 → "45.2K")
 */
export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.?0+$/, '')}K`;
  }

  return value.toLocaleString();
}

/**
 * Formats a percentage value
 * @param value - The percentage value to format
 * @returns Formatted percentage string (e.g., 12.5 → "+12.5%")
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Formats a number as currency (USD)
 * @param value - The number to format as currency
 * @returns Formatted currency string (e.g., 4999 → "$4,999")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}
