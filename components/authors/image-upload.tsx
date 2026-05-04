'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadAuthorImage, deleteAuthorImage } from '@/lib/api/authors';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  fallbackText?: string;
  metadata?: Record<string, string>;
  authorId?: number | string; // Optional: for editing existing authors
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  fallbackText = 'AU',
  authorId,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    // If authorId exists, upload immediately (editing existing author)
    if (authorId) {
      try {
        setIsUploading(true);
        const response = await uploadAuthorImage(authorId, file);

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
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } else {
      // No authorId means we're creating a new author
      // For now, show a message that the author needs to be saved first
      toast.info('Please save the author first, then you can upload an image');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    // If authorId exists and we have a custom onRemove handler, use it
    if (onRemove) {
      onRemove();
      return;
    }

    // If authorId exists, delete the image via API
    if (authorId && value) {
      try {
        setIsUploading(true);
        await deleteAuthorImage(authorId);
        onChange('');
        toast.success('Image removed successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to remove image';
        toast.error(message);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Just clear the field
      onChange('');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24">
        {value ? (
          <AvatarImage src={value} alt="Author avatar" />
        ) : (
          <AvatarFallback className="text-lg">{fallbackText}</AvatarFallback>
        )}
      </Avatar>

      <div className="flex flex-col gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
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
                Upload Image
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

        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP. Max 10MB.
        </p>
      </div>
    </div>
  );
}
