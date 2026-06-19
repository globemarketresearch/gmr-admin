'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { fetchFormSubmissions } from '@/lib/api/leads';
import type { ApiFormSubmission, ContactFormData } from '@/lib/types/api-types';

function getLeadName(lead: ApiFormSubmission): string {
  return (lead.data as ContactFormData).fullName ?? 'Unknown';
}

function getLeadEmail(lead: ApiFormSubmission): string {
  return (lead.data as ContactFormData).email ?? '';
}

export function NotificationPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leads, setLeads] = useState<ApiFormSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen || leads.length > 0) return;
    setLoading(true);
    try {
      const res = await fetchFormSubmissions({ status: 'pending', limit: 5, page: 1, sortBy: 'createdAt', sortOrder: 'desc' });
      setLeads(res.data);
      setTotal(res.pagination.total);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const goToLeads = () => {
    setOpen(false);
    router.push('/leads');
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {total > 0 && (
            <span className="absolute right-1 top-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">Notifications</p>
          {total > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
              {total} unprocessed
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : leads.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">No unprocessed leads</p>
        ) : (
          <>
            <ul className="divide-y">
              {leads.map(lead => (
                <li key={lead.id}>
                  <button
                    onClick={goToLeads}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm font-medium truncate">{getLeadName(lead)}</p>
                    <p className="text-xs text-muted-foreground truncate">{getLeadEmail(lead)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            {total > 5 && (
              <div className="border-t p-2">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={goToLeads}>
                  Load more ({total - 5} more)
                </Button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
