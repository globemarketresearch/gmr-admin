'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchLinkSuggestions } from '@/lib/api/reports';
import type { LinkSuggestionItem } from '@/lib/api/reports.api';

const TTL_MS = 5 * 60 * 1000;

// Shared across every editor on the page — the list is ~800 small rows.
let cache: { at: number; items: LinkSuggestionItem[] } | null = null;
let inflight: Promise<LinkSuggestionItem[]> | null = null;

function load(force = false): Promise<LinkSuggestionItem[]> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return Promise.resolve(cache.items);
  if (!inflight) {
    inflight = fetchLinkSuggestions()
      .then(items => {
        cache = { at: Date.now(), items: items ?? [] };
        return cache.items;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Published reports (id, title, slug, keywords, category, public URL) for auto-linking. */
export function useReportLinkIndex(enabled = true) {
  const [items, setItems] = useState<LinkSuggestionItem[] | null>(cache?.items ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    load()
      .then(list => alive && setItems(list))
      .catch(
        err => alive && setError(err instanceof Error ? err.message : 'Failed to load reports')
      );
    return () => {
      alive = false;
    };
  }, [enabled]);

  /** Returns a fresh list (re-fetched when the cache is older than 5 minutes). */
  const ensureFresh = useCallback(async () => {
    const list = await load();
    setItems(list);
    return list;
  }, []);

  return { items, error, isLoading: enabled && !items && !error, ensureFresh };
}
