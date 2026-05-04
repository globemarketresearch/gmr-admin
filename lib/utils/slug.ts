/**
 * Generates a URL-friendly slug from a title string
 * - Converts to lowercase
 * - Removes special characters (keeps alphanumeric and spaces)
 * - Replaces spaces with hyphens
 * - Removes duplicate hyphens
 * - Trims leading/trailing hyphens
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
