'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Save } from 'lucide-react';
import { GEOGRAPHIES, REPORT_FORMATS } from '@/lib/config/reports';
import { fetchCategories, type Category } from '@/lib/api/categories';
import type { UseFormReturn } from 'react-hook-form';
import type { ReportFormData } from '@/lib/types/reports';

interface BasicInformationTabProps {
  form: UseFormReturn<ReportFormData>;
  onSaveTab?: (tabKey: string, data: Partial<ReportFormData>) => Promise<void>;
  isSaving: boolean;
}

export function BasicInformationTab({ form, onSaveTab, isSaving }: BasicInformationTabProps) {
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

  const handleSaveTab = async () => {
    const values = form.getValues();
    if (onSaveTab) {
      await onSaveTab('basic', {
        title: values.title,
        summary: values.summary,
        category_id: values.category_id,
        geography: values.geography,
        publishDate: values.publishDate,
        price: values.price,
        discountedPrice: values.discountedPrice,
        pageCount: values.pageCount,
        formats: values.formats,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Global Healthcare Market Analysis 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief overview of the report (50-200 characters)"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={value => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                    disabled={isLoadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingCategories ? 'Loading categories...' : 'Select category'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="geography"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Geography</FormLabel>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {GEOGRAPHIES.map(geo => (
                      <div key={geo} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value?.includes(geo)}
                          onCheckedChange={checked => {
                            const updated = checked
                              ? [...field.value, geo]
                              : field.value.filter((g: string) => g !== geo);
                            field.onChange(updated);
                          }}
                        />
                        <label className="text-sm">{geo}</label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="publishDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pageCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="145"
                      {...field}
                      value={field.value || ''}
                      onChange={e =>
                        field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Formats</FormLabel>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {REPORT_FORMATS.map(format => (
                      <div key={format} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value?.includes(format)}
                          onCheckedChange={checked => {
                            const updated = checked
                              ? [...(field.value || []), format]
                              : field.value?.filter((f: string) => f !== format) || [];
                            field.onChange(updated);
                          }}
                        />
                        <label className="text-sm">{format}</label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="3490"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountedPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discounted Price (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="3090"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {onSaveTab && (
        <div className="flex justify-end">
          <Button onClick={handleSaveTab} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Report'}
          </Button>
        </div>
      )}
    </div>
  );
}
