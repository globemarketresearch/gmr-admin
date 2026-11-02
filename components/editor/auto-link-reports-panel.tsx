'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Link2, Loader2, Undo2, Wand2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useReportLinkIndex } from '@/hooks/use-report-link-index';
import { AUTO_LINK_TARGET } from '@/lib/config/auto-link';
import {
  autoLinkReports,
  hasLinkableText,
  listReportLinks,
  reportSlugFromHref,
  siteHostsFromIndex,
  unlinkReport,
  type MatchType,
} from '@/lib/utils/auto-link-reports';
import type { InternalLinkEntry } from '@/lib/types/reports';

const MATCH_META: Record<MatchType | 'manual', { label: string; className: string }> = {
  exact: { label: 'Exact', className: 'text-emerald-700 border-emerald-300 bg-emerald-50' },
  close: { label: 'Close', className: 'text-sky-700 border-sky-300 bg-sky-50' },
  keyword: { label: 'Keyword', className: 'text-amber-700 border-amber-300 bg-amber-50' },
  'single-keyword': {
    label: 'Keyword',
    className: 'text-amber-700 border-amber-300 bg-amber-50',
  },
  related: { label: 'Related', className: 'text-violet-700 border-violet-300 bg-violet-50' },
  manual: { label: 'Manual', className: 'text-muted-foreground' },
};

interface AutoLinkReportsPanelProps {
  /** Current rich-text HTML. */
  html: string;
  /** Receives the HTML with links added/removed. */
  onHtmlChange: (html: string) => void;
  /** Receives the report links for saving to `internal_links`. */
  onLinksChange?: (links: InternalLinkEntry[]) => void;
  /** Saved entries — used to show how each existing link was matched. */
  initialLinks?: InternalLinkEntry[];
  /** The report being edited (never links to itself). */
  excludeReportId?: number | string;
  /** Title of the item being edited — reports with the same market name are skipped. */
  selfTitle?: string;
  /** Category of the item being edited — same-category reports are preferred. */
  categoryId?: number | string | null;
  /**
   * Sync `internal_links` from the content as soon as the page loads (new items).
   * When false (older items), saved links are left exactly as they are until the
   * editor actually uses this panel.
   */
  syncOnLoad?: boolean;
}

export function AutoLinkReportsPanel({
  html,
  onHtmlChange,
  onLinksChange,
  initialLinks,
  excludeReportId,
  selfTitle,
  categoryId,
  syncOnLoad = true,
}: AutoLinkReportsPanelProps) {
  const { items, error, isLoading, ensureFresh } = useReportLinkIndex();
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const [undoHtml, setUndoHtml] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<number[]>([]);

  // slug → how it was matched (seeded from saved entries, updated by each run)
  const [matchBySlug, setMatchBySlug] = useState<Record<string, MatchType>>({});
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !items) return;
    seeded.current = true;
    const hosts = siteHostsFromIndex(items);
    const seed: Record<string, MatchType> = {};
    for (const l of initialLinks ?? []) {
      const slug = reportSlugFromHref(l.targetUrl, hosts);
      if (slug && l.matchType) seed[slug] = l.matchType as MatchType;
    }
    setMatchBySlug(seed);
  }, [items, initialLinks]);

  const bySlug = useMemo(
    () => new Map((items ?? []).map(it => [it.slug.toLowerCase(), it])),
    [items]
  );

  const links = useMemo(() => (items ? listReportLinks(html, items) : []), [html, items]);
  const count = links.length;
  const complete = count >= AUTO_LINK_TARGET;
  const hasText = hasLinkableText(html);

  const options = (extraExclude: number[] = []) => ({
    target: AUTO_LINK_TARGET,
    excludeReportIds: [
      ...(excludeReportId !== undefined && excludeReportId !== '' ? [Number(excludeReportId)] : []),
      ...removedIds,
      ...extraExclude,
    ],
    selfTitle,
    categoryId: categoryId ? Number(categoryId) : null,
  });

  // Legacy keyword-panel entries pointing at statistics / press releases are kept.
  const preserved = useMemo(
    () => (initialLinks ?? []).filter(l => l.targetType !== 'report'),
    [initialLinks]
  );

  // Keep `internal_links` in sync with the report links actually in the content.
  const onLinksChangeRef = useRef(onLinksChange);
  onLinksChangeRef.current = onLinksChange;
  const lastSent = useRef<string>('');
  useEffect(() => {
    if (!items || (!syncOnLoad && !touched)) return;
    const reportEntries: InternalLinkEntry[] = links.map(l => {
      const it = bySlug.get(l.slug);
      return {
        keyword: l.anchor,
        targetId: it?.id ?? 0,
        targetTitle: it?.title ?? l.anchor,
        targetType: 'report',
        targetUrl: l.href,
        linkedCount: 1,
        ...(matchBySlug[l.slug] ? { matchType: matchBySlug[l.slug] } : {}),
      };
    });
    const entries = [...preserved, ...reportEntries];
    const key = JSON.stringify(entries);
    if (key === lastSent.current) return;
    lastSent.current = key;
    onLinksChangeRef.current?.(entries);
  }, [links, items, bySlug, matchBySlug, preserved, syncOnLoad, touched]);

  const recordMatches = (added: { slug: string; matchType: MatchType }[]) => {
    if (added.length === 0) return;
    setMatchBySlug(prev => {
      const next = { ...prev };
      for (const a of added) next[a.slug.toLowerCase()] = a.matchType;
      return next;
    });
  };

  const handleAutoLink = async () => {
    setBusy(true);
    try {
      const fresh = await ensureFresh();
      const res = autoLinkReports(html, fresh, options());
      if (res.added.length === 0) {
        toast.info(`Already has ${res.totalCount} report links.`);
        return;
      }
      setUndoHtml(html);
      setTouched(true);
      recordMatches(res.added);
      onHtmlChange(res.html);
      const inline = res.added.filter(a => a.matchType !== 'related').length;
      const related = res.added.length - inline;
      toast.success(
        `Added ${res.added.length} report link${res.added.length === 1 ? '' : 's'}` +
          (related > 0 ? ` (${inline} in text, ${related} in “Related research”)` : '') +
          ` — ${res.totalCount}/${AUTO_LINK_TARGET} total.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Auto-linking failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (slug: string) => {
    if (!items) return;
    setBusy(true);
    try {
      const fresh = await ensureFresh();
      const removed = bySlug.get(slug);
      const extra = removed ? [removed.id] : [];
      if (removed) setRemovedIds(prev => [...prev, removed.id]);
      const without = unlinkReport(html, slug, fresh);
      // Refill the freed slot with the next-best match.
      const res = autoLinkReports(without, fresh, options(extra));
      setUndoHtml(html);
      setTouched(true);
      recordMatches(res.added);
      onHtmlChange(res.html);
      if (res.added.length > 0) {
        toast.success(`Replaced with “${res.added[0].anchor}”.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update links');
    } finally {
      setBusy(false);
    }
  };

  const handleUndo = () => {
    if (undoHtml === null) return;
    onHtmlChange(undoHtml);
    setUndoHtml(null);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="py-3 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Report Links</CardTitle>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                complete && 'text-emerald-700 border-emerald-300 bg-emerald-50'
              )}
            >
              {count}/{AUTO_LINK_TARGET}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {undoHtml !== null && (
              <Button type="button" variant="ghost" size="sm" onClick={handleUndo} disabled={busy}>
                <Undo2 className="h-3.5 w-3.5 mr-1" />
                Undo
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleAutoLink}
              disabled={busy || isLoading || !!error || complete || !hasText}
              title={
                !hasText
                  ? 'Add content first'
                  : complete
                    ? `Already has ${AUTO_LINK_TARGET} report links`
                    : `Link ${AUTO_LINK_TARGET - count} more published report(s)`
              }
            >
              {busy || isLoading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5 mr-1" />
              )}
              {complete ? `${AUTO_LINK_TARGET}/${AUTO_LINK_TARGET} linked` : 'Auto-link reports'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-4 pb-4 space-y-1.5">
        {error && <p className="text-xs text-destructive">Could not load reports: {error}</p>}

        {links.map(l => {
          const it = bySlug.get(l.slug);
          const meta = MATCH_META[matchBySlug[l.slug] ?? 'manual'];
          return (
            <div
              key={l.slug}
              className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30 text-sm"
            >
              <span className="flex-1 min-w-0 truncate">
                <span className="font-medium">{l.anchor || l.slug}</span>
                <span className="text-muted-foreground mx-1">→</span>
                <span className="text-foreground/80" title={it?.title ?? l.href}>
                  {it?.title ?? l.slug}
                </span>
              </span>
              <Badge
                variant="outline"
                className={cn('text-[10px] px-1.5 py-0 shrink-0', meta.className)}
              >
                {meta.label}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(l.slug)}
                disabled={busy}
                title="Remove and replace with the next-best match"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}

        {links.length === 0 && !error && (
          <p className="text-xs text-muted-foreground py-2 text-center">
            {hasText
              ? `Click “Auto-link reports” to add ${AUTO_LINK_TARGET} links to published reports mentioned in this content.`
              : 'Write the content first, then click “Auto-link reports”.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
