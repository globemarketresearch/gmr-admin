"use client";

import { useState, useEffect } from "react";
import { Search, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchReportImages } from "@/lib/api/report-images";
import { ReportImage } from "@/lib/types/reports";

interface ImagePickerDialogProps {
  reportId: number | string;
  open: boolean;
  onClose: () => void;
  onSelect: (image: ReportImage) => void;
}

export function ImagePickerDialog({ reportId, open, onClose, onSelect }: ImagePickerDialogProps) {
  const [images, setImages] = useState<ReportImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<ReportImage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && reportId) {
      loadImages();
    }
  }, [open, reportId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredImages(images);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredImages(
        images.filter(
          (img) =>
            img.title?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, images]);

  const loadImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchReportImages(reportId, true);
      setImages(data);
      setFilteredImages(data);
    } catch (err) {
      setError("Failed to load images. Please try again.");
      console.error("Error loading images:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (image: ReportImage) => {
    onSelect(image);
    onClose();
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images by title or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-destructive mb-2">{error}</p>
              <Button variant="outline" onClick={loadImages}>
                Try Again
              </Button>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery
                  ? "No images match your search"
                  : "No images available"}
              </p>
              <p className="text-sm text-muted-foreground">
                {!searchQuery && "Upload images first using the Report Images Manager."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={image.imageUrl}
                      alt={image.title || "Report image"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate mb-2">
                      {image.title || "Untitled Image"}
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleSelect(image)}
                    >
                      Insert
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
