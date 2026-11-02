/**
 * Auto-link reports — inserts exactly N (default 5) internal links to published
 * reports into rich-text HTML content, for SEO.
 *
 * Matching runs in tiers and stops as soon as N links are placed:
 *   1. exact          — full market name ("Automotive Electronics Market")
 *   2. close          — name variants without "Market", plurals, hyphens, &/and,
 *                       parenthetical acronyms ("automotive electronics", "HPC ASIC")
 *   3. keyword        — 2–4 word phrase whose words all belong to a report name and
 *                       cover most of its *distinctive* words ("smart jewelry")
 *   4. single-keyword — one rare word (used by ≤3 report names) that is a major part
 *                       of a report name ("cybersecurity")
 *   5. related        — last resort: appends a "Related research" line with the most
 *                       relevant remaining reports, guaranteeing N links
 *
 * Word rarity is IDF over all report names, so common words ("smart", "digital",
 * "systems") carry little weight and generic market words are ignored entirely.
 *
 * This module is intentionally dependency-free (no `@/` imports) so it can be
 * exercised outside Next.js. The DOM is only used for applying links; pass
 * `parseHtml` to run it where `DOMParser` is unavailable.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface LinkIndexItem {
  id: number;
  title: string;
  slug: string;
  meta_keywords?: string | null;
  category_id?: number | null;
  /** Public report URL built by the backend from CLIENT_URL. */
  url?: string | null;
}

export type MatchType = 'exact' | 'close' | 'keyword' | 'single-keyword' | 'related';

export interface PlannedLink {
  reportId: number;
  slug: string;
  title: string;
  url: string;
  anchor: string;
  matchType: MatchType;
}

export interface AutoLinkOptions {
  /** Total report links the content should end up with (existing ones count). */
  target?: number;
  /** Reports that must never be linked (the report being edited, removed picks). */
  excludeReportIds?: number[];
  /** Title of the item being edited — reports with the same market name are skipped. */
  selfTitle?: string;
  /** Category of the item being edited — same-category reports are preferred. */
  categoryId?: number | null;
  /** HTML parser override (tests / non-browser environments). */
  parseHtml?: (html: string) => Document;
}

export interface AutoLinkResult {
  html: string;
  added: PlannedLink[];
  /** Distinct reports that were already linked before this run. */
  existingCount: number;
  /** existingCount + added.length */
  totalCount: number;
}

export const AUTO_LINK_TARGET = 5;

// ---------------------------------------------------------------------------
// Text normalisation
// ---------------------------------------------------------------------------

const STOP = new Set(
  (
    'a an the and or of for in on with to by from at as into via vs ' +
    'market global industry size share growth trend forecast analysis report outlook ' +
    'usd billion million bn mn trillion exceed reach hit projected value revenue'
  ).split(' ')
);

/**
 * Weak words: part of a report's identity ("India Packaging" ≠ "Packaging",
 * "Facility Management" ≠ "Facility"), so they count towards how much of a report
 * name a phrase covers — but they never carry a link on their own.
 */
const WEAK = new Set(
  // business-generic words that appear in many report names but identify none
  (
    'opportunity segment type application product end use user key player company region ' +
    'high performance advanced digital smart sustainable supply demand chain management ' +
    'service solution system technology platform software equipment device material ' +
    'powered based support design new next generation modern innovative integrated ' +
    'commercial industrial premium professional safety security consumer financial ' +
    // geography
    'regional asia pacific apac north south east west america american europe european emea ' +
    'latin middle africa african world worldwide international domestic country countries ' +
    'us usa uk china chinese india indian japan japanese germany german korea korean'
  ).split(' ')
);

function stem(w: string): string {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && /(sses|xes|ches|shes)$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !/(ss|us|is)$/.test(w)) return w.slice(0, -1);
  return w;
}

const isStop = (t: string) => STOP.has(t) || /^\d/.test(t) || t.length < 2;
/** Words that can carry a link on their own (not generic, not a region). */
const isDistinctive = (t: string) => !isStop(t) && !WEAK.has(t);

interface Tok {
  n: string; // normalised + stemmed
  s: number; // start offset in source text
  e: number; // end offset
}

const TOKEN_RE = /[\p{L}\p{N}]+(?:['’][\p{L}]+)*|&/gu;

function tokenize(text: string): Tok[] {
  const out: Tok[] = [];
  for (const m of text.matchAll(TOKEN_RE)) {
    const raw = m[0];
    const n =
      raw === '&'
        ? 'and'
        : raw
            .toLowerCase()
            .replace(/['’]s$/, '')
            .replace(/['’]/g, '');
    out.push({ n: stem(n), s: m.index!, e: m.index! + raw.length });
  }
  return out;
}

/** Characters allowed between two words of one phrase (no sentence punctuation). */
const GAP_OK = /^[\s\u00a0\-\u2010\u2011\u2013\u2014/()]{0,4}$/;

function gapOk(text: string, a: Tok, b: Tok): boolean {
  const gap = text.slice(a.e, b.s);
  if (GAP_OK.test(gap)) return true;
  // "2.5D" — a decimal point between digits joins the number.
  return gap === '.' && /\d$/.test(text.slice(a.s, a.e)) && /^\d/.test(text.slice(b.s, b.e));
}

const splitCamel = (s: string) =>
  s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

/** "Automotive Electronics Market Size to Exceed…" → "Automotive Electronics Market" */
export function marketNameFromTitle(title: string): string {
  const m = title.match(/^(.*?\bmarkets?\b)/i);
  return (m ? m[1] : title).replace(/^\s*global\s+/i, '').trim();
}

// ---------------------------------------------------------------------------
// Report index
// ---------------------------------------------------------------------------

interface IndexedReport {
  item: LinkIndexItem;
  name: string; // market name used as anchor in the "related" fallback
  tokens: Set<string>; // non-stop tokens of the market name (weak words included)
  idfSum: number;
  seq: string; // " w1 w2 … " — every normalised word of the name, for contiguity checks
}

interface PhraseEntry {
  r: number; // index into reports[]
  tier: 0 | 1; // 0 = exact, 1 = close
  meta: boolean; // derived from meta keywords (slightly lower priority)
  prio: number; // 0 = literal name, 1 = acronym form, 2 = meta keyword
  acr: boolean; // bare acronym ("MFA") — must appear in capitals in the text
}

interface ReportIndex {
  reports: IndexedReport[];
  phrases: Map<string, PhraseEntry[]>;
  byToken: Map<string, number[]>;
  idf: Map<string, number>;
  df: Map<string, number>;
  bySlug: Map<string, number>;
  maxPhraseLen: number;
}

const indexCache = new WeakMap<LinkIndexItem[], ReportIndex>();

function buildIndex(items: LinkIndexItem[]): ReportIndex {
  const cached = indexCache.get(items);
  if (cached) return cached;

  const reports: IndexedReport[] = [];
  const df = new Map<string, number>();
  const byToken = new Map<string, number[]>();
  const bySlug = new Map<string, number>();

  for (const item of items) {
    if (!item?.title || !item.slug) continue;
    const name = marketNameFromTitle(item.title);
    const base = name.replace(/\(([^)]*)\)/g, ' $1 ').replace(/\bmarkets?\b/gi, ' ');
    const tokens = new Set(
      tokenize(base)
        .map(t => t.n)
        .filter(t => !isStop(t))
    );
    const seqToks = tokenize(base).map(t => t.n);
    if (seqToks[0] === 'global') seqToks.shift();
    const r = reports.length;
    reports.push({ item, name, tokens, idfSum: 0, seq: ` ${seqToks.join(' ')} ` });
    bySlug.set(item.slug.toLowerCase(), r);
    for (const t of tokens) {
      df.set(t, (df.get(t) ?? 0) + 1);
      const list = byToken.get(t);
      if (list) list.push(r);
      else byToken.set(t, [r]);
    }
  }

  const N = reports.length || 1;
  const idf = new Map<string, number>();
  for (const [t, d] of df) idf.set(t, Math.log((N + 1) / (d + 0.5)));
  for (const rep of reports) {
    rep.idfSum = [...rep.tokens].reduce((s, t) => s + (idf.get(t) ?? 0), 0);
  }

  // --- phrase variants (exact + close) -----------------------------------
  const phrases = new Map<string, PhraseEntry[]>();
  let maxPhraseLen = 1;

  const addPhrase = (text: string, r: number, meta: boolean, acronym = false) => {
    const toks = tokenize(text).map(t => t.n);
    if (toks.length === 0) return;
    if (toks[0] === 'global') toks.shift();
    const hasMarket = toks[toks.length - 1] === 'market';
    const core = hasMarket ? toks.slice(0, -1) : toks;
    const distinctive = core.filter(isDistinctive);
    // Multi-word names made only of generic words ("Advanced Material") are still
    // specific as a whole phrase; anything else needs a distinctive word.
    if (distinctive.length === 0 && (meta || core.length < 2 || core.every(t => WEAK.has(t)))) {
      return;
    }

    // Meta keywords often describe neighbouring markets ("Custom ASIC Market",
    // "Luxury Market"). Accept one only if its words mostly belong to this
    // report's own name and cover a good part of it.
    if (meta) {
      const rep = reports[r];
      const uniq = [...new Set(distinctive)];
      const all = uniq.reduce((sum, t) => sum + (idf.get(t) ?? 0), 0);
      const own = uniq
        .filter(t => rep.tokens.has(t))
        .reduce((sum, t) => sum + (idf.get(t) ?? 0), 0);
      if (all <= 0 || rep.idfSum <= 0) return;
      if (own / all < 0.6 || own / rep.idfSum < 0.5) return;
    }

    const put = (key: string[], tier: 0 | 1) => {
      const k = key.join(' ');
      const list = phrases.get(k) ?? [];
      const acr = acronym && key.length === 1;
      const prio = meta ? 2 : acronym ? 1 : 0;
      if (!list.some(e => e.r === r && e.tier <= tier)) list.push({ r, tier, meta, prio, acr });
      phrases.set(k, list);
      maxPhraseLen = Math.max(maxPhraseLen, key.length);
    };

    if (hasMarket) put(toks, 0);

    // Close variant (without "market") — guard against ambiguous single words.
    if (meta && distinctive.length < 2) return;
    if (core.length === 1) {
      const t = core[0];
      if (!isDistinctive(t)) return;
      const d = df.get(t) ?? 0;
      const ok = acronym ? t.length >= 3 && d <= 2 : t.length >= 4 && d <= 3;
      if (!ok) return;
    }
    put(core, 1);
  };

  reports.forEach((rep, r) => {
    const name = rep.name;
    addPhrase(name, r, false);
    const noParen = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    if (noParen !== name) addPhrase(noParen, r, false);
    const acr = name.match(/\(([^)]+)\)\s*(.*)$/);
    if (acr) addPhrase(`${acr[1]} ${acr[2]}`.trim(), r, false, true);

    for (let kw of (rep.item.meta_keywords ?? '').split(/[,;|]/)) {
      kw = kw.trim();
      if (!kw) continue;
      if (!/\s/.test(kw)) kw = splitCamel(kw);
      let prev = '';
      while (prev !== kw) {
        prev = kw;
        kw = kw.replace(/\s+(size|share|trends?|growth|analysis|forecast|outlook|report)\s*$/i, '');
      }
      if (!/\bmarkets?\s*$/i.test(kw)) continue;
      addPhrase(kw, r, true);
    }
  });

  // A phrase that is literally some report's own name belongs to that report:
  // drop acronym- and meta-derived claims on it from other reports.
  for (const [k, list] of phrases) {
    const best = Math.min(...list.map(e => e.prio));
    phrases.set(
      k,
      list.filter(e => e.prio === best)
    );
  }

  const index = { reports, phrases, byToken, idf, df, bySlug, maxPhraseLen };
  indexCache.set(items, index);
  return index;
}

// ---------------------------------------------------------------------------
// Report-link detection helpers (string based — usable without a DOM)
// ---------------------------------------------------------------------------

const REPORT_PATH_RE = /^\/reports\/([^/?#"\s]+)/i;

const normHost = (h: string) => h.toLowerCase().replace(/^www\./, '');

/**
 * Hosts of the public site, taken from the report URLs the backend returns
 * (built from CLIENT_URL) — nothing is hard-coded here.
 */
export function siteHostsFromIndex(items: LinkIndexItem[]): Set<string> {
  const hosts = new Set<string>();
  for (const it of items) {
    if (!it?.url) continue;
    try {
      hosts.add(normHost(new URL(it.url).host));
    } catch {
      /* relative or malformed — ignore */
    }
  }
  return hosts;
}

/** Report slug for a site-internal report link (relative or on a site host), else null. */
export function reportSlugFromHref(href: string, siteHosts: Set<string>): string | null {
  const h = (href || '').trim();
  let path = h;
  if (/^https?:\/\//i.test(h)) {
    try {
      const u = new URL(h);
      if (!siteHosts.has(normHost(u.host))) return null;
      path = u.pathname;
    } catch {
      return null;
    }
  }
  const m = path.match(REPORT_PATH_RE);
  return m ? decodeURIComponent(m[1]).toLowerCase() : null;
}

/** Distinct report slugs linked anywhere in the HTML. */
export function getLinkedReportSlugs(html: string, siteHosts: Set<string>): string[] {
  const slugs = new Set<string>();
  for (const m of (html || '').matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)) {
    const slug = reportSlugFromHref(m[1].replace(/&amp;/g, '&'), siteHosts);
    if (slug) slugs.add(slug);
  }
  return [...slugs];
}

export const countReportLinks = (html: string, items: LinkIndexItem[]) =>
  getLinkedReportSlugs(html, siteHostsFromIndex(items)).length;

// ---------------------------------------------------------------------------
// DOM → text blocks
// ---------------------------------------------------------------------------

interface Segment {
  node: Text;
  start: number; // offset of node text within block text
  end: number;
}

interface Block {
  text: string;
  segments: Segment[];
  blocked: Array<[number, number]>; // ranges inside existing links
  heading: boolean;
}

const BLOCK_TAGS = new Set([
  'P',
  'LI',
  'TD',
  'TH',
  'BLOCKQUOTE',
  'DIV',
  'FIGCAPTION',
  'DT',
  'DD',
  'SECTION',
  'ARTICLE',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
]);
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'svg', 'SVG']);

function collectBlocks(root: Node): Block[] {
  const blocks: Block[] = [];

  const newBlock = (heading: boolean): Block => {
    const b: Block = { text: '', segments: [], blocked: [], heading };
    blocks.push(b);
    return b;
  };

  const walk = (node: Node, block: Block, inLink: boolean) => {
    for (let child = node.firstChild; child; child = child.nextSibling) {
      if (child.nodeType === 3) {
        const t = child as Text;
        const value = t.data;
        if (!value) continue;
        const start = block.text.length;
        block.text += value;
        block.segments.push({ node: t, start, end: block.text.length });
        if (inLink) block.blocked.push([start, block.text.length]);
      } else if (child.nodeType === 1) {
        const el = child as Element;
        const tag = el.tagName.toUpperCase();
        if (SKIP_TAGS.has(tag)) continue;
        if (BLOCK_TAGS.has(tag)) {
          const heading = /^H[1-6]$/.test(tag) || block.heading;
          walk(el, newBlock(heading), inLink);
          // Text following a nested block continues in a fresh block so offsets stay simple.
          block = newBlock(block.heading);
        } else {
          walk(el, block, inLink || tag === 'A');
        }
      }
    }
  };

  walk(root, newBlock(false), false);
  return blocks.filter(b => b.text.trim().length > 0);
}

// ---------------------------------------------------------------------------
// Candidate generation
// ---------------------------------------------------------------------------

interface Candidate {
  r: number;
  tier: 0 | 1 | 2 | 3;
  score: number;
  block: number;
  s: number;
  e: number;
}

const TIER_TYPES: MatchType[] = ['exact', 'close', 'keyword', 'single-keyword'];

function overlaps(a: [number, number], b: [number, number]) {
  return a[0] < b[1] && b[0] < a[1];
}

/** Text inside a URL / slug / e-mail ("north-america-physical-ai-market", "x.com/y"). */
function inUrlLike(text: string, s: number, e: number): boolean {
  let a = s;
  let b = e;
  while (a > 0 && !/\s/.test(text[a - 1])) a--;
  while (b < text.length && !/\s/.test(text[b])) b++;
  const chunk = text.slice(a, b);
  if (/https?:|www\.|@|\/|\.[a-z]{2,}\b/i.test(chunk)) return true;
  // long hyphen-joined slugs: 4+ hyphenated parts that extend past the match
  return (a < s || b > e) && chunk.split('-').length >= 4;
}

/** Widen [s,e) to include an adjacent bracket so the anchor is balanced; null if impossible. */
function balanceParens(text: string, s: number, e: number): [number, number] | null {
  const seg = () => text.slice(s, e);
  const count = (c: string) => seg().split(c).length - 1;
  let open = count('(');
  let close = count(')');
  if (close > open) {
    let i = s - 1;
    while (i >= 0 && /\s/.test(text[i])) i--;
    if (text[i] === '(') {
      s = i;
      open++;
    }
  }
  if (open > close) {
    let i = e;
    while (i < text.length && /\s/.test(text[i])) i++;
    if (text[i] === ')') {
      e = i + 1;
      close++;
    }
  }
  return open === close ? [s, e] : null;
}

function generateCandidates(
  blocks: Block[],
  index: ReportIndex,
  excluded: Set<number>,
  categoryId: number | null | undefined
): { candidates: Candidate[]; relevance: (r: number) => number } {
  const { reports, phrases, byToken, idf, df, maxPhraseLen } = index;
  const blockTokens = blocks.map(b => tokenize(b.text));

  // Document-level relevance of each report (how much the content talks about it).
  const tf = new Map<string, number>();
  for (const toks of blockTokens) for (const t of toks) tf.set(t.n, (tf.get(t.n) ?? 0) + 1);
  const relCache = new Map<number, number>();
  const relevance = (r: number) => {
    let v = relCache.get(r);
    if (v === undefined) {
      // Distinctive words only — "Asia Pacific" in the text says nothing about topic.
      let num = 0;
      let den = 0;
      for (const t of reports[r].tokens) {
        if (!isDistinctive(t)) continue;
        const w = idf.get(t) ?? 0;
        num += w * Math.min(tf.get(t) ?? 0, 3);
        den += w;
      }
      v = den > 0 ? num / (3 * den) : 0;
      relCache.set(r, v);
    }
    return v;
  };
  const catBoost = (r: number) =>
    categoryId && reports[r].item.category_id === categoryId ? 0.15 : 0;

  const out: Candidate[] = [];

  blocks.forEach((block, bi) => {
    if (block.heading) return;
    const toks = blockTokens[bi];
    if (toks.length === 0) return;
    const text = block.text;

    // run[i] = number of tokens starting at i joined only by allowed gaps
    const run = new Array<number>(toks.length).fill(1);
    for (let i = toks.length - 2; i >= 0; i--) {
      if (gapOk(text, toks[i], toks[i + 1])) run[i] = run[i + 1] + 1;
    }

    const blocked = (s: number, e: number) => block.blocked.some(b => overlaps(b, [s, e]));

    // Every phrase occurrence of ANY report (excluded ones too, e.g. the item's own
    // market). Used so "Oil Market" is never linked inside "Star Anise Oil Market".
    const spans: Array<{ r: number; tier: number; s: number; e: number }> = [];
    const local: Candidate[] = [];

    const push = (r: number, tier: Candidate['tier'], score: number, s0: number, e0: number) => {
      if (excluded.has(r)) return;
      const bal = balanceParens(text, s0, e0);
      if (!bal) return;
      const [s, e] = bal;
      if (blocked(s, e) || inUrlLike(text, s, e)) return;
      local.push({ r, tier, score, block: bi, s, e });
    };

    for (let i = 0; i < toks.length; i++) {
      // Tier 0/1: exact + close phrase variants
      const maxL = Math.min(maxPhraseLen, run[i]);
      for (let L = maxL; L >= 1; L--) {
        const entries = phrases.get(
          toks
            .slice(i, i + L)
            .map(t => t.n)
            .join(' ')
        );
        if (!entries) continue;
        const s = toks[i].s;
        const e = toks[i + L - 1].e;
        const raw = text.slice(s, e);
        for (const en of entries) {
          if (en.acr && raw !== raw.toUpperCase()) continue; // "San" ≠ "SAN"
          spans.push({ r: en.r, tier: en.tier, s, e });
          const score = relevance(en.r) + catBoost(en.r) - (en.meta ? 0.05 : 0) + L * 0.01;
          push(en.r, en.tier, score, s, e);
        }
      }

      // Tier 2: 2–4 word keyword windows whose words all belong to one report name
      const first = toks[i].n;
      if (isDistinctive(first) && byToken.has(first)) {
        for (let L = 2; L <= Math.min(4, run[i]); L++) {
          const win = toks.slice(i, i + L);
          const last = win[L - 1].n;
          if (!isDistinctive(last) || !byToken.has(last)) continue;
          const distinct = new Set(win.map(t => t.n).filter(isDistinctive));
          if (distinct.size < 2) continue;
          // The phrase must be a contiguous piece of the report name.
          const piece = ` ${win.map(t => t.n).join(' ')} `;
          const lastSet = new Set(byToken.get(last));
          for (const r of byToken.get(first)!) {
            if (excluded.has(r) || !lastSet.has(r)) continue;
            const rep = reports[r];
            if (rep.idfSum <= 0 || !rep.seq.includes(piece)) continue;
            let cov = 0;
            for (const t of new Set(win.map(w => w.n))) {
              if (rep.tokens.has(t)) cov += idf.get(t) ?? 0;
            }
            const coverage = cov / rep.idfSum;
            if (coverage < 0.55) continue;
            push(r, 2, coverage * 0.7 + relevance(r) * 0.3 + catBoost(r), win[0].s, win[L - 1].e);
          }
        }
      }

      // Tier 3: single rare keyword that is most of a report's name and recurs in the text
      const t = toks[i];
      if (
        isDistinctive(t.n) &&
        t.e - t.s >= 6 &&
        (df.get(t.n) ?? 99) <= 3 &&
        (tf.get(t.n) ?? 0) >= 2
      ) {
        for (const r of byToken.get(t.n) ?? []) {
          if (reports[r].idfSum <= 0) continue;
          const coverage = (idf.get(t.n) ?? 0) / reports[r].idfSum;
          if (coverage < 0.75) continue;
          push(r, 3, coverage * 0.7 + relevance(r) * 0.3 + catBoost(r), t.s, t.e);
        }
      }
    }

    // Drop candidates sitting inside a longer (or better-tier) phrase of another report.
    for (const c of local) {
      const shadowed = spans.some(
        m => m.r !== c.r && m.s <= c.s && c.e <= m.e && (m.e - m.s > c.e - c.s || m.tier < c.tier)
      );
      if (!shadowed) out.push(c);
    }
  });

  return { candidates: out, relevance: (r: number) => relevance(r) + catBoost(r) };
}

function selectCandidates(
  cands: Candidate[],
  needed: number,
  anchorKey: (c: Candidate) => string,
  takenAnchors: Set<string>
): Candidate[] {
  const sorted = [...cands].sort(
    (a, b) => a.tier - b.tier || b.score - a.score || a.block - b.block || a.s - b.s
  );
  const chosen: Candidate[] = [];
  const usedReports = new Set<number>();
  const usedAnchors = new Set<string>(takenAnchors);

  // Pass 1: one link per paragraph. Pass 2: allow sharing a paragraph.
  for (const onePerBlock of [true, false]) {
    for (const c of sorted) {
      if (chosen.length >= needed) break;
      if (usedReports.has(c.r)) continue;
      if (usedAnchors.has(anchorKey(c))) continue; // same words never link twice
      if (onePerBlock && chosen.some(x => x.block === c.block)) continue;
      if (chosen.some(x => x.block === c.block && overlaps([x.s, x.e], [c.s, c.e]))) continue;
      chosen.push(c);
      usedReports.add(c.r);
      usedAnchors.add(anchorKey(c));
    }
    if (chosen.length >= needed) break;
  }
  return chosen;
}

// ---------------------------------------------------------------------------
// Applying links
// ---------------------------------------------------------------------------

function defaultParse(html: string): Document {
  return new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, 'text/html');
}

function locate(block: Block, offset: number, isEnd: boolean): { node: Text; offset: number } {
  for (const seg of block.segments) {
    if (isEnd ? offset <= seg.end && offset > seg.start : offset < seg.end && offset >= seg.start) {
      return { node: seg.node, offset: offset - seg.start };
    }
  }
  const last = block.segments[block.segments.length - 1];
  return { node: last.node, offset: last.end - last.start };
}

function makeAnchor(doc: Document, url: string): HTMLAnchorElement {
  const a = doc.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'dofollow');
  a.setAttribute('class', 'text-primary underline');
  return a;
}

function wrapRange(doc: Document, block: Block, s: number, e: number, url: string) {
  const start = locate(block, s, false);
  const end = locate(block, e, true);
  const range = doc.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  const a = makeAnchor(doc, url);
  a.appendChild(range.extractContents());
  range.insertNode(a);
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function autoLinkReports(
  html: string,
  items: LinkIndexItem[],
  options: AutoLinkOptions = {}
): AutoLinkResult {
  const target = options.target ?? AUTO_LINK_TARGET;
  const index = buildIndex(items);
  const siteHosts = siteHostsFromIndex(items);

  const existingSlugs = getLinkedReportSlugs(html, siteHosts);
  const existingCount = existingSlugs.length;
  const needed = Math.max(0, target - existingCount);
  if (needed === 0 || index.reports.length === 0) {
    return { html, added: [], existingCount, totalCount: existingCount };
  }

  // Exclusions: explicit ids, already-linked reports, and the item itself.
  const excluded = new Set<number>();
  const excludeIds = new Set(options.excludeReportIds ?? []);
  const selfKey = options.selfTitle
    ? tokenize(marketNameFromTitle(options.selfTitle))
        .map(t => t.n)
        .join(' ')
    : '';
  index.reports.forEach((rep, r) => {
    if (excludeIds.has(rep.item.id)) excluded.add(r);
    if (
      selfKey &&
      tokenize(rep.name)
        .map(t => t.n)
        .join(' ') === selfKey
    )
      excluded.add(r);
  });
  for (const slug of existingSlugs) {
    const r = index.bySlug.get(slug);
    if (r !== undefined) excluded.add(r);
  }

  const doc = (options.parseHtml ?? defaultParse)(html || '');
  const body = doc.body;
  const blocks = collectBlocks(body);

  const { candidates: cands, relevance } = generateCandidates(
    blocks,
    index,
    excluded,
    options.categoryId
  );
  const anchorKey = (c: Candidate) =>
    tokenize(blocks[c.block].text.slice(c.s, c.e))
      .map(t => t.n)
      .join(' ');
  // Words that are already a link in the content are never linked again elsewhere.
  const takenAnchors = new Set<string>();
  for (const b of blocks) {
    for (const [s0, e0] of b.blocked) {
      const key = tokenize(b.text.slice(s0, e0))
        .map(t => t.n)
        .join(' ');
      if (key) takenAnchors.add(key);
    }
  }
  const chosen = selectCandidates(cands, needed, anchorKey, takenAnchors);

  // Backend-provided URL (CLIENT_URL based); relative path if an older API omits it.
  const urlFor = (r: number) => {
    const it = index.reports[r].item;
    return it.url || `/reports/${it.slug}`;
  };
  const toPlanned = (r: number, anchor: string, matchType: MatchType): PlannedLink => {
    const it = index.reports[r].item;
    return { reportId: it.id, slug: it.slug, title: it.title, url: urlFor(r), anchor, matchType };
  };

  // Apply inline links back-to-front so earlier offsets stay valid.
  const added: PlannedLink[] = chosen.map(c =>
    toPlanned(c.r, blocks[c.block].text.slice(c.s, c.e), TIER_TYPES[c.tier])
  );
  [...chosen]
    .sort((a, b) => b.block - a.block || b.s - a.s)
    .forEach(c => wrapRange(doc, blocks[c.block], c.s, c.e, urlFor(c.r)));

  // Tier 5 fallback: "Related research" line to guarantee the target count.
  // Same-category reports first, then by how much the content talks about them.
  if (added.length < needed) {
    const sameCat = (r: number) =>
      options.categoryId && index.reports[r].item.category_id === options.categoryId ? 1 : 0;
    const used = new Set([...excluded, ...chosen.map(c => c.r)]);
    const rest = index.reports
      .map((_, r) => r)
      .filter(r => !used.has(r))
      .sort((a, b) => sameCat(b) - sameCat(a) || relevance(b) - relevance(a) || a - b)
      .slice(0, needed - added.length);
    if (rest.length > 0) {
      // Re-use an existing "Related research" line (e.g. after a link was removed).
      let p = findRelatedParagraph(body);
      if (!p) {
        p = doc.createElement('p');
        body.appendChild(p);
      }
      const anchors = Array.from(p.querySelectorAll('a'));
      for (const r of rest) {
        const a = makeAnchor(doc, urlFor(r));
        a.textContent = index.reports[r].name;
        anchors.push(a);
        added.push(toPlanned(r, index.reports[r].name, 'related'));
      }
      rebuildRelatedParagraph(doc, p, anchors);
    }
  }

  return {
    html: body.innerHTML,
    added,
    existingCount,
    totalCount: existingCount + added.length,
  };
}

const RELATED_LABEL = 'Related research:';

function findRelatedParagraph(body: HTMLElement): HTMLElement | null {
  for (const p of Array.from(body.querySelectorAll('p'))) {
    const first = p.firstElementChild;
    if (first?.tagName === 'STRONG' && first.textContent?.trim() === RELATED_LABEL) {
      return p as HTMLElement;
    }
  }
  return null;
}

/** "Related research: A, B, C" — removed when no links remain. */
function rebuildRelatedParagraph(doc: Document, p: HTMLElement, anchors: Element[]) {
  if (anchors.length === 0) {
    p.remove();
    return;
  }
  while (p.firstChild) p.removeChild(p.firstChild);
  const label = doc.createElement('strong');
  label.textContent = `${RELATED_LABEL} `;
  p.appendChild(label);
  anchors.forEach((a, i) => {
    if (i > 0) p.appendChild(doc.createTextNode(', '));
    p.appendChild(a);
  });
}

/**
 * Removes the link(s) pointing at `slug`. Inline links keep their text; an entry
 * in the "Related research" line is removed entirely (and the line with it once
 * it is empty).
 */
export function unlinkReport(
  html: string,
  slug: string,
  items: LinkIndexItem[],
  options: Pick<AutoLinkOptions, 'parseHtml'> = {}
): string {
  const siteHosts = siteHostsFromIndex(items);
  const doc = (options.parseHtml ?? defaultParse)(html || '');
  const target = slug.toLowerCase();
  const related = findRelatedParagraph(doc.body);
  doc.body.querySelectorAll('a[href]').forEach(a => {
    if (reportSlugFromHref(a.getAttribute('href') || '', siteHosts) !== target) return;
    const parent = a.parentNode!;
    if (related && related.contains(a)) {
      parent.removeChild(a);
      return;
    }
    while (a.firstChild) parent.insertBefore(a.firstChild, a);
    parent.removeChild(a);
  });
  if (related) rebuildRelatedParagraph(doc, related, Array.from(related.querySelectorAll('a')));
  return doc.body.innerHTML;
}

export interface ReportLinkInContent {
  slug: string;
  href: string;
  anchor: string;
  /** Lives in the "Related research" line rather than inline. */
  related: boolean;
}

/** Report links currently in the HTML, one per report, in document order. */
export function listReportLinks(
  html: string,
  items: LinkIndexItem[],
  options: Pick<AutoLinkOptions, 'parseHtml'> = {}
): ReportLinkInContent[] {
  if (!html) return [];
  const siteHosts = siteHostsFromIndex(items);
  const doc = (options.parseHtml ?? defaultParse)(html);
  const related = findRelatedParagraph(doc.body);
  const seen = new Set<string>();
  const out: ReportLinkInContent[] = [];
  doc.body.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    const slug = reportSlugFromHref(href, siteHosts);
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    out.push({
      slug,
      href,
      anchor: (a.textContent || '').trim(),
      related: !!related && related.contains(a),
    });
  });
  return out;
}

/** True when the HTML has any visible text to link. */
export function hasLinkableText(html: string): boolean {
  return (
    (html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim().length > 0
  );
}
