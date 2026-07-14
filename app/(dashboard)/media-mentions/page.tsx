'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Newspaper } from 'lucide-react';
import { useMediaMentions } from '@/hooks/use-media-mentions';
import { MediaMentionList } from '@/components/media-mentions/media-mention-list';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';
import type { MediaMention } from '@/lib/types/media-mentions';

export default function MediaMentionsPage() {
  const router = useRouter();
  const { mediaMentions, total, isLoading, handleDelete } = useMediaMentions();
  const [filteredMentions, setFilteredMentions] = useState<MediaMention[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMentions(mediaMentions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = mediaMentions.filter(mention =>
        mention.title.toLowerCase().includes(query)
      );
      setFilteredMentions(filtered);
    }
  }, [searchQuery, mediaMentions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Mentions</h1>
          <p className="text-muted-foreground">
            Manage publications and citations featured on the Media Mentions page
          </p>
        </div>
        <Button onClick={() => router.push('/media-mentions/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Media Mention
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Media Mentions</CardTitle>
          <CardDescription>
            {total} total mention{total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media mentions by title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton rows={5} columns={4} showHeader={true} showActions={true} />
          ) : filteredMentions.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No media mentions found matching your search' : 'No media mentions yet'}
              </p>
            </div>
          ) : (
            <div className="fade-in">
              <MediaMentionList mediaMentions={filteredMentions} onDelete={handleDelete} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
