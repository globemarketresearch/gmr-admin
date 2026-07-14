'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, ExternalLink, Newspaper } from 'lucide-react';
import type { MediaMention } from '@/lib/types/media-mentions';
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

interface MediaMentionListProps {
  mediaMentions: MediaMention[];
  onDelete: (id: number | string) => Promise<boolean>;
}

export function MediaMentionList({ mediaMentions, onDelete }: MediaMentionListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    const success = await onDelete(deleteId);
    if (success) {
      setDeleteId(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Publication</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mediaMentions.map(mention => (
            <TableRow key={mention.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted overflow-hidden">
                    {mention.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mention.imageUrl}
                        alt={mention.title}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Newspaper className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="font-medium">{mention.title}</span>
                </div>
              </TableCell>
              <TableCell>
                {mention.link ? (
                  <a
                    href={mention.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>{mention.displayOrder}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/media-mentions/${mention.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(mention.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media Mention</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this media mention? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
