'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadCategoryImage } from '@/lib/api/categories';

interface CategoryImageUploadProps {
  categoryId: number;
  imageUrl?: string;
  onUploaded: (newImageUrl: string) => void;
}

export function CategoryImageUpload({
  categoryId,
  imageUrl: initialImageUrl,
  onUploaded,
}: CategoryImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadCategoryImage(categoryId, file);
      const newUrl = result.category.imageUrl ?? '';
      setImageUrl(newUrl);
      onUploaded(newUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Category thumbnail"
            width={40}
            height={40}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Upload className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
