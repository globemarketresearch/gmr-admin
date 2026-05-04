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
import { Pencil, Trash2, Linkedin } from 'lucide-react';
import type { ReportAuthor } from '@/lib/types/reports';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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

interface AuthorListProps {
  authors: ReportAuthor[];
  onDelete: (id: number | string) => Promise<boolean>;
}

export function AuthorList({ authors, onDelete }: AuthorListProps) {
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
            <TableHead>Author</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Bio</TableHead>
            <TableHead>LinkedIn</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {authors.map(author => (
            <TableRow key={author.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    {author.imageUrl ? (
                      <AvatarImage src={author.imageUrl} alt={author.name} />
                    ) : (
                      <AvatarFallback>
                        {author.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium">{author.name}</span>
                </div>
              </TableCell>
              <TableCell>{author.role || '-'}</TableCell>
              <TableCell className="max-w-md truncate">{author.bio || '-'}</TableCell>
              <TableCell>
                {author.linkedinUrl ? (
                  <a
                    href={author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/authors/${author.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(author.id)}>
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
            <AlertDialogTitle>Delete Author</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this author? This action cannot be undone. If the
              author is referenced in any reports, the deletion will fail.
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
