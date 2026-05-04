'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Tag } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchCategories, type Category } from '@/lib/api/categories';
import { CategoryImageUpload } from '@/components/categories/category-image-upload';


export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories({ limit: 100 })
      .then(res => setCategories(res.categories))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = searchQuery.trim()
    ? categories.filter(c => {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
      })
    : categories;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Browse all research categories</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>{categories.length} total categor{categories.length !== 1 ? 'ies' : 'y'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or slug..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton rows={5} columns={4} showHeader={true} showActions={false} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No categories found matching your search' : 'No categories yet'}
              </p>
            </div>
          ) : (
            <div className="fade-in">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(category => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <CategoryImageUpload
                          categoryId={category.id}
                          imageUrl={category.imageUrl}
                          onUploaded={(newImageUrl) => {
                            setCategories(prev =>
                              prev.map(c =>
                                c.id === category.id ? { ...c, imageUrl: newImageUrl } : c
                              )
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-semibold">{category.name}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        {category.isActive ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
