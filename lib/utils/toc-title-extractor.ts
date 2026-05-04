/**
 * Extracts the market name from a report title for use in TOC templates
 *
 * Examples:
 * - "Global Healthcare Market Analysis" → "Healthcare"
 * - "Digital Health Market Report" → "Digital Health"
 * - "Global AI-Powered Diagnostics Market 2024" → "AI-Powered Diagnostics"
 * - "Some Random Title" → "XXX"
 */
export function extractMarketNameFromTitle(title: string): string {
  const trimmed = title.trim();

  if (!trimmed) {
    return 'XXX';
  }

  // Pattern 1: "Global XXX Market" - extract text between "Global" and "Market"
  const globalMatch = trimmed.match(/Global\s+(.+?)\s+Market/i);
  if (globalMatch && globalMatch[1]) {
    return globalMatch[1].trim();
  }

  // Pattern 2: "XXX Market" (no Global) - extract from start until "Market"
  const marketMatch = trimmed.match(/^(.+?)\s+Market/i);
  if (marketMatch && marketMatch[1]) {
    return marketMatch[1].trim();
  }

  // Fallback: if no "Market" keyword found
  return 'XXX';
}
