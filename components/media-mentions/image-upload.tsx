'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, Newspaper } from 'lucide-react';
import { toast } from 'sonner';
import { uploadMediaMentionImage, deleteMediaMentionImage } from '@/lib/api/media-mentions';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  mediaMentionId?: number | string; // Optional: for editing existing media mentions
}

export function ImageUpload({ value, onChange, onRemove, disabled, mediaMentionId }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 10MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (mediaMentionId) {
      try {
        setIsUploading(true);
        const response = await uploadMediaMentionImage(mediaMentionId, file);

        if (response.data?.imageUrl) {
          onChange(response.data.imageUrl);
          toast.success('Image uploaded successfully');
        } else {
          throw new Error('No image URL returned from server');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload image';
        toast.error(message);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } else {
      toast.info('Please save the media mention first, then you can upload a logo');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    if (onRemove) {
      onRemove();
      return;
    }

    if (mediaMentionId && value) {
      try {
        setIsUploading(true);
        await deleteMediaMentionImage(mediaMentionId);
        onChange('');
        toast.success('Image removed successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to remove image';
        toast.error(message);
      } finally {
        setIsUploading(false);
      }
    } else {
      onChange('');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-md border bg-muted overflow-hidden">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Publication logo" className="h-full w-full object-contain" />
        ) : (
          <Newspaper className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
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
                Upload Logo
              </>
            )}
          </Button>

          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">JPG, PNG, WebP, or GIF. Max 10MB.</p>
      </div>
    </div>
  );
}
