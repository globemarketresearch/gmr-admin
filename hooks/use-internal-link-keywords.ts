'use client';

import { useState, useCallback } from 'react';
import { fetchReports } from '@/lib/api/reports.api';
import { fetchBlogs } from '@/lib/api/blogs';
import { fetchPressReleases } from '@/lib/api/press-releases';
import type { InternalLinkEntry } from '@/lib/types/reports';

// ---------------------------------------------------------------------------
// Structural types — avoids importing @tiptap/react into this module
// ---------------------------------------------------------------------------
interface PmMark {
  type: { name: string };
}
interface PmResolvedPos {
  marks: () => readonly PmMark[];
}
interface PmNode {
  isText: boolean;
  text?: string;
  descendants: (cb: (node: PmNode, pos: number) => boolean | void) => void;
  resolve: (pos: number) => PmResolvedPos;
}
interface ChainResult {
  setTextSelection: (sel: { from: number; to: number }) => ChainResult;
  setLink: (attrs: { href: string }) => ChainResult;
  run: () => void;
}
export interface TiptapEditorLike {
  state: { doc: PmNode };
  chain: () => ChainResult;
  commands: { focus: (position?: 'end' | 'start' | number) => boolean };
  getHTML: () => string;
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------
export interface LinkTarget {
  id: number;
  title: string;
  slug: string;
  type: 'report' | 'blog' | 'press-release';
  url: string;
}

/** Per-keyword state entry (includes transient loading/notFound flags). */
export interface KeywordEntry {
  keyword: string;
  isSearching: boolean;
  linked: InternalLinkEntry | null; // null while searching or when not found
  notFound: boolean;
}

export type { InternalLinkEntry };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collect all unlinked positions of `keyword` in the editor document. */
function findAllOccurrences(
  editor: TiptapEditorLike,
  keyword: string
): Array<{ from: number; to: number }> {
  const doc = editor.state.doc;
  const kwLower = keyword.toLowerCase();
  const positions: Array<{ from: number; to: number }> = [];

  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const text = node.text || '';
    const lower = text.toLowerCase();
    let i = 0;
    while (i < lower.length) {
      const idx = lower.indexOf(kwLower, i);
      if (idx === -1) break;
      const from = pos + idx;
      const to = from + keyword.length;
      const hasLink = doc
        .resolve(from)
        .marks()
        .some(m => m.type.name === 'link');
      if (!hasLink) positions.push({ from, to });
      i = idx + 1;
    }
  });

  return positions;
}

/** Fisher-Yates shuffle — returns new array. */
function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/** Apply links in the editor and return the count of links inserted. */
function applyLinksInEditor(
  editor: TiptapEditorLike,
  keyword: string,
  targetUrl: string,
  maxInstances = 5
): number {
  const all = findAllOccurrences(editor, keyword);
  if (all.length === 0) return 0;
  const chosen = all.length <= maxInstances ? all : sample(all, maxInstances);
  chosen.sort((a, b) => b.from - a.from);
  for (const pos of chosen) {
    editor.chain().setTextSelection(pos).setLink({ href: targetUrl }).run();
  }
  editor.commands.focus('end');
  return chosen.length;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const MAX_LINKS = 5;

/**
 * Manages keyword-based internal linking.
 *
 * On `addKeyword`, the hook searches for matching content, auto-selects a
 * random result, applies a single link in the editor, and stores the result.
 * No results dropdown — one random match is used automatically.
 * Maximum of 5 linked keywords is enforced.
 */
export function useInternalLinkKeywords(initialLinks?: InternalLinkEntry[]) {
  const [entries, setEntries] = useState<KeywordEntry[]>(() =>
    (initialLinks ?? []).map(il => ({
      keyword: il.keyword,
      isSearching: false,
      linked: il,
      notFound: false,
    }))
  );

  const addKeyword = useCallback(async (text: string, editor: TiptapEditorLike | null) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    let isDuplicate = false;
    let isAtLimit = false;
    setEntries(prev => {
      if (prev.some(e => e.keyword.toLowerCase() === trimmed.toLowerCase())) {
        isDuplicate = true;
        return prev;
      }
      if (prev.filter(e => e.linked !== null).length >= MAX_LINKS) {
        isAtLimit = true;
        return prev;
      }
      return [...prev, { keyword: trimmed, isSearching: true, linked: null, notFound: false }];
    });
    if (isDuplicate || isAtLimit) return;

    try {
      const [reportsRes, blogsRes, prsRes] = await Promise.allSettled([
        fetchReports({
          search: trimmed,
          status: 'published',
          limit: 5,
        } as Parameters<typeof fetchReports>[0]),
        fetchBlogs({
          search: trimmed,
          status: 'published',
          limit: 5,
        } as Parameters<typeof fetchBlogs>[0]),
        fetchPressReleases({
          search: trimmed,
          status: 'published',
          limit: 5,
        } as Parameters<typeof fetchPressReleases>[0]),
      ]);

      const results: LinkTarget[] = [];

      if (reportsRes.status === 'fulfilled') {
        const items =
          (
            reportsRes.value as unknown as {
              data?: Array<{ id: number; title: string; slug: string }>;
            }
          )?.data ?? [];
        for (const r of items) {
          if (r.title && r.slug) {
            results.push({
              id: r.id,
              title: r.title,
              slug: r.slug,
              type: 'report',
              url: `/reports/${r.slug}`,
            });
          }
        }
      }

      if (blogsRes.status === 'fulfilled') {
        const items =
          (
            blogsRes.value as unknown as {
              blogs?: Array<{ id: string | number; title: string; slug: string }>;
            }
          )?.blogs ?? [];
        for (const b of items) {
          if (b.title && b.slug) {
            results.push({
              id: Number(b.id),
              title: b.title,
              slug: b.slug,
              type: 'blog',
              url: `/blog/${b.slug}`,
            });
          }
        }
      }

      if (prsRes.status === 'fulfilled') {
        const items =
          (
            prsRes.value as unknown as {
              pressReleases?: Array<{ id: string | number; title: string; slug: string }>;
            }
          )?.pressReleases ?? [];
        for (const pr of items) {
          if (pr.title && pr.slug) {
            results.push({
              id: Number(pr.id),
              title: pr.title,
              slug: pr.slug,
              type: 'press-release',
              url: `/press-release/${pr.slug}`,
            });
          }
        }
      }

      if (results.length === 0) {
        setEntries(prev =>
          prev.map(e => (e.keyword === trimmed ? { ...e, isSearching: false, notFound: true } : e))
        );
        return;
      }

      // Pick one result at random
      const chosen = results[Math.floor(Math.random() * results.length)];
      let linkedCount = 0;
      if (editor) {
        linkedCount = applyLinksInEditor(editor, trimmed, chosen.url, 1);
      }

      const linked: InternalLinkEntry = {
        keyword: trimmed,
        targetId: chosen.id,
        targetTitle: chosen.title,
        targetType: chosen.type,
        targetUrl: chosen.url,
        linkedCount,
      };

      setEntries(prev =>
        prev.map(e =>
          e.keyword === trimmed ? { ...e, isSearching: false, linked, notFound: false } : e
        )
      );
    } catch {
      setEntries(prev =>
        prev.map(e => (e.keyword === trimmed ? { ...e, isSearching: false, notFound: true } : e))
      );
    }
  }, []);

  const removeKeyword = useCallback((keyword: string) => {
    setEntries(prev => prev.filter(e => e.keyword !== keyword));
  }, []);

  /** Returns the serializable entries suitable for saving to the database. */
  const getSerializable = useCallback((): InternalLinkEntry[] => {
    return entries.filter(e => e.linked !== null).map(e => e.linked!);
  }, [entries]);

  return { entries, addKeyword, removeKeyword, getSerializable };
}
