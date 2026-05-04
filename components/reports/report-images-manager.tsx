'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload,
  X,
  Loader2,
  Pencil,
  Check,
  Image as ImageIcon,
  Eye,
  EyeOff,
  BarChart3,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchReportImages,
  uploadReportImage,
  updateReportImageMetadata,
  deleteReportImage,
} from '@/lib/api/report-images';
import type { ReportImage, ReportChart, ReportFormData } from '@/lib/types/reports';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChartBuilderDialog } from './chart-builder-dialog';

interface ReportImagesManagerProps {
  reportId?: number | string;
  disabled?: boolean;
  reportData?: ReportFormData;
}

export function ReportImagesManager({ reportId, disabled, reportData }: ReportImagesManagerProps) {
  const [images, setImages] = useState<ReportImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [previewImage, setPreviewImage] = useState<ReportImage | null>(null);
  const [showChartBuilder, setShowChartBuilder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images when component mounts or reportId changes
  useEffect(() => {
    if (reportId) {
      loadImages();
    }
  }, [reportId]);

  const loadImages = async () => {
    if (!reportId) return;

    try {
      setIsLoading(true);
      const fetchedImages = await fetchReportImages(reportId);
      setImages(fetchedImages);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load images';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !reportId) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 10MB.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setIsUploading(true);
      const uploadedImage = await uploadReportImage(reportId, file);
      setImages(prev => [...prev, uploadedImage]);
      toast.success('Image uploaded successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(message);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await deleteReportImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete image';
      toast.error(message);
    }
  };

  const handleStartEdit = (image: ReportImage) => {
    setEditingId(image.id);
    setEditTitle(image.title || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleSaveEdit = async (imageId: number) => {
    try {
      const updatedImage = await updateReportImageMetadata(imageId, {
        title: editTitle || undefined,
      });
      setImages(prev => prev.map(img => (img.id === imageId ? updatedImage : img)));
      setEditingId(null);
      setEditTitle('');
      toast.success('Title updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update title';
      toast.error(message);
    }
  };

  const handleToggleActive = async (image: ReportImage) => {
    try {
      const updatedImage = await updateReportImageMetadata(image.id, {
        isActive: !image.isActive,
      });
      setImages(prev => prev.map(img => (img.id === image.id ? updatedImage : img)));
      toast.success(`Image ${updatedImage.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update image status';
      toast.error(message);
    }
  };

  const handleCopyImage = async (image: any) => {
    try {
      // Check browser support first
      if (!navigator.clipboard || !ClipboardItem) {
        console.warn('Clipboard API not supported, copying URL instead');
        await navigator.clipboard.writeText(image.imageUrl);
        toast.success('Image URL copied to clipboard');
        return;
      }

      // Copy the image URL in multiple formats for compatibility
      const htmlContent = `<img src="${image.imageUrl}" alt="${image.title || ''}" />`;
      const plainText = image.imageUrl;

      // Create clipboard item with HTML and plain text
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      });

      // Write to clipboard
      await navigator.clipboard.write([clipboardItem]);
      toast.success('Image URL copied! You can now paste it into the editor');
    } catch (error) {
      console.error('Error copying image:', error);

      // If copying fails, fallback to copying the image URL as plain text
      try {
        await navigator.clipboard.writeText(image.imageUrl);
        toast.warning('Copied image URL as text. Paste it in the editor.');
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        const message = error instanceof Error ? error.message : 'Failed to copy image';
        toast.error(message);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleChartSave = async (chart: ReportChart) => {
    if (!reportId || !chart.imageData) {
      toast.error('Unable to save chart');
      return;
    }

    try {
      setIsUploading(true);

      // Convert base64 to blob
      const blob = await fetch(chart.imageData).then(r => r.blob());

      // Build a unique filename: {title}-{chartType}-{index}.png
      const sanitizedTitle = (chart.title || chart.name || 'chart')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const baseName = `${sanitizedTitle}-${chart.chartType}`;
      const existingCount = images.filter(img =>
        img.title?.toLowerCase().startsWith((chart.title || chart.name || '').toLowerCase())
      ).length;
      const fileName = `${baseName}-${existingCount}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Upload the image
      const uploadedImage = await uploadReportImage(reportId, file, chart.title || chart.name);

      setImages(prev => [...prev, uploadedImage]);
      toast.success('Chart created and uploaded successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload chart';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!reportId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Please save the report first to upload images.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowChartBuilder(true)}
          disabled={disabled || isUploading}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Add Chart
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Create charts or upload custom images (JPG, PNG, WebP, GIF - Max 10MB)
        </p>
      </div>

      {/* Images List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No images uploaded yet.</p>
              <p className="text-xs mt-1">Upload your first image to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map(image => (
            <Card key={image.id} className={!image.isActive ? 'opacity-50' : ''}>
              <CardContent className="p-4 space-y-3">
                {/* Image Preview */}
                <div
                  className="relative aspect-video bg-muted rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setPreviewImage(image)}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.title || 'Report image'}
                    className="object-cover w-full h-full"
                  />
                  {!image.isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                  )}
                </div>

                {/* Title Edit */}
                <div className="space-y-2">
                  {editingId === image.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="Image title (optional)"
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveEdit(image.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-muted-foreground flex-1 truncate">
                        {image.title || 'Untitled'}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(image)}
                        disabled={disabled}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(image)}
                      disabled={disabled}
                      className="flex-1"
                    >
                      {image.isActive ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Show
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyImage(image)}
                      disabled={disabled}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(image.id)}
                    disabled={disabled}
                    className="w-full"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground">
                  <p>ID: {image.id}</p>
                  <p>Uploaded: {new Date(image.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chart Builder Dialog */}
      <ChartBuilderDialog
        open={showChartBuilder}
        onOpenChange={setShowChartBuilder}
        onSave={handleChartSave}
        reportData={reportData}
      />

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.title || 'Image Preview'}</DialogTitle>
            <DialogDescription>
              Uploaded on {previewImage && new Date(previewImage.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {previewImage && (
            <div className="w-full">
              <img
                src={previewImage.imageUrl}
                alt={previewImage.title || 'Report image'}
                className="w-full h-auto rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
