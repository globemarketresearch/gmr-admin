/**
 * Auto-link reports (SEO internal links).
 *
 * The "Auto-link reports" panel is shown on every create/edit page, but it never
 * changes content until an editor clicks it. This date only decides whether the
 * saved `internal_links` list is synced from the content as soon as the page loads
 * (items created on/after it) or left untouched until the panel is used (older items).
 */
export const AUTO_LINK_START_DATE = '2026-11-03T00:00:00Z';

/** Links each piece of content should end up with. */
export const AUTO_LINK_TARGET = 5;

export function isAutoLinkEligible(createdAt?: string | null): boolean {
  if (!createdAt) return true; // not saved yet → new item
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return created >= new Date(AUTO_LINK_START_DATE).getTime();
}
