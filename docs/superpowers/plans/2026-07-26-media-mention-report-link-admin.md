# Media Mention Report Link — Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin optionally attach a published Report to a Media Mention via a searchable picker, with a caption field auto-filled from the report's title.

**Architecture:** Add a `ReportSelector` combobox component (cmdk `Command` + Radix `Popover`, modeled directly on the existing `AuthorSelector` pattern) backed by the already-existing `GET /v1/reports/link-suggestions` endpoint (`fetchLinkSuggestions()` in `lib/api/reports.api.ts`), which already returns only published, non-deleted reports — no new backend query needed for the picker itself. Wire it into `MediaMentionForm` alongside a new `reportLinkText` input, with paired Zod validation and title auto-fill on selection.

**Tech Stack:** Next.js App Router, react-hook-form + zod, ShadCN `Command`/`Popover` (cmdk), existing `apiClient`.

## Global Constraints

- This repo has no component test framework configured (`npm run type-check` / `npm run lint` / `npm run build` are the available verification commands — no `npm test`). Verification steps in this plan use those, plus manual QA in the dev server, matching existing convention (no `*.test.tsx` files exist for any component in this repo).
- Prettier: 100-char line width, single quotes, 2-space indent, trailing commas (ES5), semicolons — run `npm run format` before committing if unsure.
- Use `@/` path alias for all imports (per `CLAUDE.md`).
- `reportId` and `reportLinkText` are optional together, but if either is set, both must be set (paired validation) — enforced client-side in the Zod schema, mirroring the backend's own validation.
- The picker must only ever offer published reports — satisfied for free by `fetchLinkSuggestions()`, which already filters `status='published' AND deleted_at IS NULL` server-side. Do not re-implement that filter client-side or reach for `fetchReports()` instead.

---

### Task 1: Extend `MediaMention` types

**Files:**
- Modify: `lib/types/media-mentions.ts`

**Interfaces:**
- Produces: `MediaMention.reportId?: number`, `MediaMention.reportLinkText?: string`, `MediaMention.reportSlug?: string`, `MediaMention.reportTitle?: string`; `MediaMentionFormData.reportId?: number`, `MediaMentionFormData.reportLinkText?: string`. These are consumed by Tasks 2 and 3.

- [ ] **Step 1: Edit the file**

```ts
import type { ApiResponse, ApiMeta } from './reports';

export interface MediaMention {
  id: number;
  title: string;
  link?: string;
  imageUrl?: string;
  displayOrder: number;
  reportId?: number;
  reportLinkText?: string;
  reportSlug?: string;
  reportTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaMentionFormData {
  title: string;
  link?: string;
  imageUrl?: string;
  displayOrder?: number;
  reportId?: number;
  reportLinkText?: string;
}

export interface MediaMentionsResponse extends ApiResponse<MediaMention[]> {
  data: MediaMention[];
  meta: ApiMeta;
}

export interface MediaMentionResponse extends ApiResponse<MediaMention> {
  data: MediaMention;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run type-check`
Expected: this file alone produces no new errors (downstream errors in `media-mention-form.tsx` are expected until Task 3 — check only that this file's own diagnostics are clean, e.g. `npm run type-check 2>&1 | grep media-mentions.ts` shows nothing).

- [ ] **Step 3: Commit**

```bash
git add lib/types/media-mentions.ts
git commit -m "feat: add report reference fields to MediaMention types"
```

---

### Task 2: `ReportSelector` combobox component

**Files:**
- Create: `components/media-mentions/report-selector.tsx`

**Interfaces:**
- Consumes: `fetchLinkSuggestions()` and `LinkSuggestionItem` from `@/lib/api/reports.api` (existing — returns `{ id, title, slug, meta_keywords }[]`, published-only, no params).
- Produces: `<ReportSelector value={number | undefined} onChange={(report: LinkSuggestionItem | null) => void} initialLabel={string} disabled={boolean} />` — consumed by Task 3.

- [ ] **Step 1: Write the component**

```tsx
// components/media-mentions/report-selector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { fetchLinkSuggestions, type LinkSuggestionItem } from '@/lib/api/reports.api';
import { cn } from '@/lib/utils';

interface ReportSelectorProps {
  value?: number;
  onChange: (report: LinkSuggestionItem | null) => void;
  initialLabel?: string;
  disabled?: boolean;
}

export function ReportSelector({
  value,
  onChange,
  initialLabel,
  disabled = false,
}: ReportSelectorProps) {
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState<LinkSuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetchLinkSuggestions();
      setReports(response.data || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedReport = reports.find(r => r.id === value);
  const triggerLabel = selectedReport?.title ?? (value ? initialLabel : undefined);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          {triggerLabel ? (
            <div className="flex items-center gap-2 truncate">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{triggerLabel}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              Select report...
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search reports..." />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Loading reports...</CommandEmpty>
            ) : reports.length === 0 ? (
              <CommandEmpty>No published reports found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {value !== undefined && (
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                    className="text-muted-foreground"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear selection
                  </CommandItem>
                )}
                {reports.map(rep => (
                  <CommandItem
                    key={rep.id}
                    value={rep.title}
                    onSelect={() => {
                      onChange(rep);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn('mr-2 h-4 w-4', value === rep.id ? 'opacity-100' : 'opacity-0')}
                    />
                    <span className="truncate">{rep.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

`initialLabel` covers the edit-page moment before `fetchLinkSuggestions()` resolves — it lets the trigger show the previously-saved `reportTitle` without waiting on the fetch, exactly the gap `AuthorSelector` doesn't have to handle (that component's callers don't pre-populate a value from another source).

- [ ] **Step 2: Verify it compiles**

Run: `npm run type-check`
Expected: no errors from this new file.

- [ ] **Step 3: Commit**

```bash
git add components/media-mentions/report-selector.tsx
git commit -m "feat: add ReportSelector combobox for media mentions"
```

---

### Task 3: Wire `ReportSelector` + caption field into `MediaMentionForm`

**Files:**
- Modify: `components/media-mentions/media-mention-form.tsx`

**Interfaces:**
- Consumes: `ReportSelector` (Task 2), `MediaMentionFormData.reportId`/`reportLinkText` (Task 1).

- [ ] **Step 1: Update imports and the Zod schema**

At the top of the file, add the import and replace the schema:

```tsx
import { ReportSelector } from './report-selector';
```

```tsx
const mediaMentionFormSchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    link: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    imageUrl: z.string().optional(),
    displayOrder: z.number().optional(),
    reportId: z.number().optional(),
    reportLinkText: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasReport = data.reportId !== undefined && data.reportId !== null;
    const hasLinkText = !!data.reportLinkText;

    if (hasReport && !hasLinkText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Report link text is required when a report is selected',
        path: ['reportLinkText'],
      });
    }
    if (hasLinkText && !hasReport) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a report to go with this link text',
        path: ['reportId'],
      });
    }
  });
```

- [ ] **Step 2: Update `defaultValues`**

```tsx
  const form = useForm<MediaMentionFormData>({
    resolver: zodResolver(mediaMentionFormSchema),
    defaultValues: mediaMention
      ? {
          title: mediaMention.title,
          link: mediaMention.link || '',
          imageUrl: mediaMention.imageUrl || '',
          displayOrder: mediaMention.displayOrder ?? 0,
          reportId: mediaMention.reportId,
          reportLinkText: mediaMention.reportLinkText || '',
        }
      : {
          title: '',
          link: '',
          imageUrl: '',
          displayOrder: 0,
          reportId: undefined,
          reportLinkText: '',
        },
  });
```

- [ ] **Step 3: Add the two new form fields**

Insert after the `displayOrder` `FormField` block, still inside `<CardContent>`:

```tsx
            <FormField
              control={form.control}
              name="reportId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Report</FormLabel>
                  <FormControl>
                    <ReportSelector
                      value={field.value}
                      initialLabel={mediaMention?.reportTitle}
                      onChange={report => {
                        field.onChange(report ? report.id : undefined);
                        form.setValue('reportLinkText', report ? report.title : '', {
                          shouldValidate: true,
                        });
                      }}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional — link this mention to one of your published reports
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportLinkText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Link Text</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Global VFX Market" {...field} />
                  </FormControl>
                  <FormDescription>
                    Auto-filled from the report title when you select one above — edit for a custom
                    caption
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
```

- [ ] **Step 4: Verify it compiles and lints**

Run: `npm run type-check && npm run lint`
Expected: no errors.

- [ ] **Step 5: Manual QA in the dev server**

Run: `npm run dev`, then in a browser:
1. Go to `/media-mentions/new`, fill in a title, open the "Related Report" picker, search for a report, select it — confirm "Report Link Text" auto-fills with the report's title.
2. Edit the auto-filled text to a custom caption, save — confirm no validation error.
3. Create a mention with only a title (no report fields) — confirm it still saves.
4. Try to save with `reportLinkText` filled but no report selected — confirm a validation error appears under "Related Report".
5. Open an existing mention that has a report linked — confirm the picker shows the correct report immediately (via `initialLabel`) even before the full list finishes loading.
6. Use "Clear selection" on a linked report — confirm both `reportId` and you can then clear the caption text and save to fully unlink.

- [ ] **Step 6: Commit**

```bash
git add components/media-mentions/media-mention-form.tsx
git commit -m "feat: add report picker and caption field to media mention form"
```

---

## Final Verification

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Manual QA checklist in Task 3 Step 5 completed against a running backend that has Task 4 of the backend plan deployed (report validation) — otherwise saving with an unpublished `reportId` will succeed client-side and fail only when you check the public site
