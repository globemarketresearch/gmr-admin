'use client';

import { Twitter, Share2 } from 'lucide-react';
import Image from 'next/image';

interface SEOPreviewCardProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'twitter' | 'facebook' | 'both';
}

export function SEOPreviewCard({
  title,
  description,
  image,
  url = 'https://example.com',
  type = 'both',
}: SEOPreviewCardProps) {
  const truncateText = (text: string, max: number) => {
    return text.length > max ? text.slice(0, max) + '...' : text;
  };

  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'example.com';
    }
  })();

  return (
    <div className="space-y-4">
      {(type === 'twitter' || type === 'both') && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            Twitter Card Preview
          </h4>
          <div className="border rounded-lg overflow-hidden max-w-lg bg-card">
            {image && (
              <div className="aspect-[2/1] bg-muted relative">
                <Image src={image} alt="Preview" fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="p-3">
              <div className="text-sm text-muted-foreground mb-1">{hostname}</div>
              <div className="font-medium text-sm line-clamp-1">{truncateText(title, 70)}</div>
              <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {truncateText(description, 200)}
              </div>
            </div>
          </div>
        </div>
      )}

      {(type === 'facebook' || type === 'both') && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Facebook/LinkedIn Preview
          </h4>
          <div className="border rounded-lg overflow-hidden max-w-lg bg-card">
            {image && (
              <div className="aspect-[1.91/1] bg-muted relative">
                <Image src={image} alt="Preview" fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="p-3 border-t">
              <div className="text-xs text-muted-foreground uppercase mb-1">{hostname}</div>
              <div className="font-semibold text-base line-clamp-2 mb-1">
                {truncateText(title, 95)}
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {truncateText(description, 200)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
