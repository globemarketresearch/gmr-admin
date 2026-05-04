'use client';

import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChartGenerator } from '@/hooks/use-chart-generator';
import type { LogoPosition } from '@/lib/types/chart-generator';

export function LogoUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logo, uploadLogo, updateLogoPosition, updateLogoOpacity, removeLogo } =
    useChartGenerator();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadLogo(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
    }

    // Reset input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Logo Upload (Optional)</Label>
        <p className="text-xs text-muted-foreground mt-1">PNG or SVG, max 2MB</p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          size="sm"
        >
          <Upload className="mr-2 h-4 w-4" />
          {logo.previewUrl ? 'Change Logo' : 'Upload Logo'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />

        {logo.previewUrl && (
          <Button type="button" variant="ghost" size="sm" onClick={removeLogo}>
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      {logo.previewUrl && (
        <div className="border rounded-md p-4 space-y-4 bg-muted/30">
          <div>
            <Label className="text-sm mb-2 block">Preview</Label>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.previewUrl}
              alt="Logo preview"
              className="h-16 w-auto border border-border rounded bg-white p-2"
            />
          </div>

          <div>
            <Label htmlFor="logo-position" className="text-sm">
              Position
            </Label>
            <Select
              value={logo.position}
              onValueChange={value => updateLogoPosition(value as LogoPosition)}
            >
              <SelectTrigger id="logo-position" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="logo-opacity" className="text-sm">
                Opacity
              </Label>
              <span className="text-sm text-muted-foreground">{logo.opacity}%</span>
            </div>
            <input
              id="logo-opacity"
              type="range"
              min="0"
              max="100"
              step="5"
              value={logo.opacity}
              onChange={e => updateLogoOpacity(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
