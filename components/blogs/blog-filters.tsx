'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { BlogFilters } from '@/lib/types/blogs';
import type { ReportAuthor } from '@/lib/types/reports';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchCategories, type Category } from '@/lib/api/categories';

interface BlogFiltersProps {
  filters: BlogFilters;
  onFiltersChange: (filters: BlogFilters) => void;
  authors?: ReportAuthor[];
}

export function BlogFiltersComponent({ filters, onFiltersChange, authors = [] }: BlogFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetchCategories({ limit: 100 });
      setCategories(response.categories.filter(cat => cat.isActive));
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchInput, page: 1 });
  };

  const clearFilters = () => {
    setSearchInput('');
    onFiltersChange({ page: 1 });
  };

  const hasActiveFilters =
    filters.status || filters.categoryId || filters.authorId || filters.tags || filters.search;

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search blog posts by title, excerpt, or tags..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Filter dropdowns and inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          value={filters.status || 'all'}
          onValueChange={value =>
            onFiltersChange({
              ...filters,
              status: value === 'all' ? undefined : (value as BlogFilters['status']),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.categoryId ? String(filters.categoryId) : 'all'}
          onValueChange={value =>
            onFiltersChange({
              ...filters,
              categoryId: value === 'all' ? undefined : parseInt(value, 10),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Filter by tag..."
          value={filters.tags || ''}
          onChange={e => {
            onFiltersChange({ ...filters, tags: e.target.value || undefined, page: 1 });
          }}
        />

        <Select
          value={filters.authorId ? String(filters.authorId) : 'all'}
          onValueChange={value =>
            onFiltersChange({
              ...filters,
              authorId: value === 'all' ? undefined : parseInt(value, 10),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Author" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Authors</SelectItem>
            {authors.map(author => (
              <SelectItem key={author.id} value={String(author.id)}>
                {author.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
