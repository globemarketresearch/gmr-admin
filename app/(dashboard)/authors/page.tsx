'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, User } from 'lucide-react';
import { useAuthors } from '@/hooks/use-authors';
import { AuthorList } from '@/components/authors/author-list';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';
import type { ReportAuthor } from '@/lib/types/reports';

export default function AuthorsPage() {
  const router = useRouter();
  const { authors, total, isLoading, handleDelete } = useAuthors();
  const [filteredAuthors, setFilteredAuthors] = useState<ReportAuthor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAuthors(authors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = authors.filter(
        author =>
          author.name.toLowerCase().includes(query) ||
          author.role?.toLowerCase().includes(query) ||
          author.bio?.toLowerCase().includes(query)
      );
      setFilteredAuthors(filtered);
    }
  }, [searchQuery, authors]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Team</h1>
          <p className="text-muted-foreground">Manage authors and researchers for your reports</p>
        </div>
        <Button onClick={() => router.push('/authors/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Author
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Authors</CardTitle>
          <CardDescription>
            {total} total author{total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search authors by name, role, or bio..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton rows={5} columns={4} showHeader={true} showActions={true} />
          ) : filteredAuthors.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No authors found matching your search' : 'No authors yet'}
              </p>
            </div>
          ) : (
            <div className="fade-in">
              <AuthorList authors={filteredAuthors} onDelete={handleDelete} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
