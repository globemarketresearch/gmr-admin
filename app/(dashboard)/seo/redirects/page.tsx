'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Pencil, TrendingUp, ArrowRightLeft, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useRedirects } from '@/hooks/use-redirects';
import type {
  Redirect,
  RedirectType,
  CreateRedirectRequest,
  UpdateRedirectRequest,
} from '@/lib/types/redirects';
import { REDIRECT_TYPE_LABELS, REDIRECT_TYPES } from '@/lib/types/redirects';

const TYPE_BADGE_VARIANT: Record<RedirectType, string> = {
  301: 'bg-blue-100 text-blue-800',
  302: 'bg-yellow-100 text-yellow-800',
  307: 'bg-purple-100 text-purple-800',
  308: 'bg-indigo-100 text-indigo-800',
  410: 'bg-red-100 text-red-800',
  451: 'bg-orange-100 text-orange-800',
};

const DESTINATION_REQUIRED_TYPES: RedirectType[] = [301, 302, 307, 308];

interface FormState {
  sourceUrl: string;
  destinationUrl: string;
  redirectType: RedirectType;
  notes: string;
}

const DEFAULT_FORM: FormState = {
  sourceUrl: '',
  destinationUrl: '',
  redirectType: 301,
  notes: '',
};

export default function RedirectsPage() {
  const {
    redirects,
    total,
    totalPages,
    currentPage,
    isLoading,
    fetchRedirects,
    createRedirectItem,
    updateRedirectItem,
    deleteRedirectItem,
    toggleRedirectItem,
    bulkDelete,
  } = useRedirects();

  const [search, setSearch] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('');
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Redirect | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(
    (s: string, enabled: string, p: number) => {
      fetchRedirects({ search: s, enabled: enabled || undefined, page: p, limit: 20 });
    },
    [fetchRedirects]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadData(search, enabledFilter, page);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, enabledFilter, page, loadData]);

  const openCreate = () => {
    setEditingRedirect(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  const openEdit = (rd: Redirect) => {
    setEditingRedirect(rd);
    setForm({
      sourceUrl: rd.sourceUrl,
      destinationUrl: rd.destinationUrl ?? '',
      redirectType: rd.redirectType as RedirectType,
      notes: rd.notes ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const needsDest = DESTINATION_REQUIRED_TYPES.includes(form.redirectType);

      if (editingRedirect) {
        const data: UpdateRedirectRequest = {
          sourceUrl: form.sourceUrl,
          destinationUrl: needsDest ? form.destinationUrl || undefined : null,
          redirectType: form.redirectType,
          notes: form.notes,
        };
        const result = await updateRedirectItem(editingRedirect.id, data);
        if (result) {
          setDialogOpen(false);
          loadData(search, enabledFilter, page);
        }
      } else {
        const data: CreateRedirectRequest = {
          sourceUrl: form.sourceUrl,
          destinationUrl: needsDest ? form.destinationUrl || undefined : null,
          redirectType: form.redirectType,
          notes: form.notes,
        };
        const result = await createRedirectItem(data);
        if (result) {
          setDialogOpen(false);
          loadData(search, enabledFilter, page);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rd: Redirect) => {
    const result = await toggleRedirectItem(rd.id);
    if (result) {
      loadData(search, enabledFilter, page);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteRedirectItem(deleteTarget.id);
    setDeleteTarget(null);
    loadData(search, enabledFilter, page);
  };

  const handleBulkDelete = async () => {
    await bulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    loadData(search, enabledFilter, page);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === redirects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(redirects.map(r => r.id)));
    }
  };

  const needsDest = DESTINATION_REQUIRED_TYPES.includes(form.redirectType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-8 w-8" />
            URL Redirects
          </h1>
          <p className="text-muted-foreground">Manage URL redirect rules — {total} total</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Redirect
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search source URL, destination, notes…"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={enabledFilter === 'true'}
            onCheckedChange={checked => {
              setEnabledFilter(checked ? 'true' : '');
              setPage(1);
            }}
            id="enabled-filter"
          />
          <Label htmlFor="enabled-filter">Enabled only</Label>
        </div>
        {selectedIds.size > 0 && (
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={redirects.length > 0 && selectedIds.size === redirects.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Source URL</TableHead>
              <TableHead>Destination URL</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-24">Hits</TableHead>
              <TableHead className="w-32">Created</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : redirects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No redirects found.
                </TableCell>
              </TableRow>
            ) : (
              redirects.map(rd => (
                <TableRow key={rd.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(rd.id)}
                      onCheckedChange={() => toggleSelect(rd.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <span
                      className="font-mono text-sm truncate max-w-[200px] block"
                      title={rd.sourceUrl}
                    >
                      {rd.sourceUrl}
                    </span>
                  </TableCell>
                  <TableCell>
                    {rd.destinationUrl ? (
                      <span
                        className="font-mono text-sm truncate max-w-[200px] block text-muted-foreground"
                        title={rd.destinationUrl}
                      >
                        {rd.destinationUrl}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_BADGE_VARIANT[rd.redirectType as RedirectType]}`}
                    >
                      {rd.redirectType}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rd.isEnabled}
                      onCheckedChange={() => handleToggle(rd)}
                      aria-label="Toggle redirect"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      {rd.hitCount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(rd.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(rd)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(rd)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRedirect ? 'Edit Redirect' : 'Add Redirect'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Source URL */}
            <div className="space-y-1">
              <Label htmlFor="sourceUrl">Source URL *</Label>
              <Input
                id="sourceUrl"
                placeholder="/old-page-path"
                value={form.sourceUrl}
                onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Must start with /</p>
            </div>

            {/* Redirect Type */}
            <div className="space-y-1">
              <Label htmlFor="redirectType">Redirect Type *</Label>
              <Select
                value={String(form.redirectType)}
                onValueChange={v =>
                  setForm(f => ({ ...f, redirectType: Number(v) as RedirectType }))
                }
              >
                <SelectTrigger id="redirectType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REDIRECT_TYPES.map(t => (
                    <SelectItem key={t} value={String(t)}>
                      {REDIRECT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destination URL — hidden for 410/451 */}
            {needsDest && (
              <div className="space-y-1">
                <Label htmlFor="destinationUrl">Destination URL *</Label>
                <Input
                  id="destinationUrl"
                  placeholder="/new-page-path or https://example.com/page"
                  value={form.destinationUrl}
                  onChange={e => setForm(f => ({ ...f, destinationUrl: e.target.value }))}
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about this redirect…"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingRedirect ? 'Save Changes' : 'Create Redirect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Redirect?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the redirect for{' '}
              <span className="font-mono font-semibold">{deleteTarget?.sourceUrl}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Redirects?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {selectedIds.size} redirect(s). This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
