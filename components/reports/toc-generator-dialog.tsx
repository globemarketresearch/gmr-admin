"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { TableOfContentsStructure } from '@/lib/types/reports';
import { extractMarketNameFromTitle } from '@/lib/utils/toc-title-extractor';
import {
  getDefaultTemplate,
  replaceTemplatePlaceholders,
  parseTemplateToTOC,
  ParseError,
} from '@/lib/utils/toc-template-parser';

interface TOCGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportTitle: string;
  currentTOC: TableOfContentsStructure;
  onImport: (toc: TableOfContentsStructure) => void;
}

type DialogStep = 'preview' | 'edit' | 'result';

export function TOCGeneratorDialog({
  open,
  onOpenChange,
  reportTitle,
  currentTOC,
  onImport,
}: TOCGeneratorDialogProps) {
  const [step, setStep] = useState<DialogStep>('preview');
  const [editedText, setEditedText] = useState<string>('');
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [hasExistingData, setHasExistingData] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>('');
  const [marketName, setMarketName] = useState<string>('');
  const [previewLines, setPreviewLines] = useState<string[]>([]);
  const [parsedTOC, setParsedTOC] = useState<TableOfContentsStructure | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep('preview');
      setParseErrors([]);
      setLoadError('');
      setParsedTOC(null);
      loadTemplate();
    }
  }, [open]);

  // Check if existing TOC data exists
  useEffect(() => {
    const hasData = currentTOC?.chapters && currentTOC.chapters.length > 0;
    setHasExistingData(hasData);
  }, [currentTOC]);

  const loadTemplate = () => {
    setLoading(true);
    setLoadError('');

    try {
      // Extract market name from title
      const extracted = extractMarketNameFromTitle(reportTitle);
      setMarketName(extracted);

      // Get template
      const templateText = getDefaultTemplate();

      // Replace placeholders
      const processedText = replaceTemplatePlaceholders(templateText, extracted);
      setEditedText(processedText);

      // Generate preview (first 10 lines)
      const lines = processedText.split('\n').filter(line => line.trim());
      setPreviewLines(lines.slice(0, 10));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToEdit = () => {
    setStep('edit');
  };

  const handleImportTOC = () => {
    setLoading(true);
    setParseErrors([]);

    try {
      const result = parseTemplateToTOC(editedText);

      if (result.success && result.data) {
        setParsedTOC(result.data);
        setStep('result');
      } else if (result.errors) {
        setParseErrors(result.errors);
        setStep('result');
      }
    } catch (error) {
      setParseErrors([{
        line: 0,
        message: error instanceof Error ? error.message : 'Unknown parsing error',
      }]);
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEdit = () => {
    setStep('edit');
    setParseErrors([]);
    setParsedTOC(null);
  };

  const handleConfirmImport = () => {
    if (parsedTOC) {
      onImport(parsedTOC);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const getDialogTitle = () => {
    switch (step) {
      case 'preview':
        return 'Generate TOC from Template';
      case 'edit':
        return 'Edit Template Text';
      case 'result':
        return parseErrors.length > 0 ? 'Parsing Errors' : 'Import Successful';
      default:
        return 'Generate TOC';
    }
  };

  const getTOCSummary = (toc: TableOfContentsStructure) => {
    const chapterCount = toc.chapters.length;
    const sectionCount = toc.chapters.reduce((sum, ch) => sum + ch.sections.length, 0);
    const subsectionCount = toc.chapters.reduce(
      (sum, ch) => sum + ch.sections.reduce((s, sec) => s + sec.subsections.length, 0),
      0
    );
    return { chapterCount, sectionCount, subsectionCount };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {step === 'preview' && 'Preview the generated table of contents before editing'}
            {step === 'edit' && 'Edit the template text before importing'}
            {step === 'result' && parseErrors.length === 0 && 'Table of contents imported successfully'}
            {step === 'result' && parseErrors.length > 0 && 'Fix the errors below and try again'}
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {loading && step === 'preview' && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Load Error */}
        {loadError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        {/* Preview Step */}
        {!loading && !loadError && step === 'preview' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Extracted Market Name:</h4>
              <div className="bg-muted p-3 rounded-md">
                <code className="text-sm font-mono">{marketName}</code>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All &quot;XXX&quot; placeholders will be replaced with this value
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Template Preview (First 10 lines):</h4>
              <div className="bg-muted p-3 rounded-md font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
                {previewLines.map((line, index) => (
                  <div key={index} className="whitespace-pre">{line}</div>
                ))}
              </div>
            </div>

            {hasExistingData && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This will replace your existing table of contents data.
                  You can continue to edit with the TOC Editor after importing.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleContinueToEdit}>
                Continue to Edit
              </Button>
            </div>
          </div>
        )}

        {/* Edit Step */}
        {step === 'edit' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Template Text (editable):
              </label>
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="font-mono text-xs min-h-[400px]"
                placeholder="Paste or edit your TOC template here..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: Use tabs or spaces to separate numbers from titles. Chapters start with &quot;Chapter no.&quot;
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('preview')}>
                Back
              </Button>
              <Button onClick={handleImportTOC} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Import TOC
              </Button>
            </div>
          </div>
        )}

        {/* Result Step - Success */}
        {step === 'result' && parseErrors.length === 0 && parsedTOC && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully parsed table of contents!
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-md space-y-2">
              <h4 className="text-sm font-medium">Summary:</h4>
              <ul className="text-sm space-y-1">
                <li>• {getTOCSummary(parsedTOC).chapterCount} chapters</li>
                <li>• {getTOCSummary(parsedTOC).sectionCount} sections</li>
                <li>• {getTOCSummary(parsedTOC).subsectionCount} subsections</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirmImport}>
                Confirm Import
              </Button>
            </div>
          </div>
        )}

        {/* Result Step - Errors */}
        {step === 'result' && parseErrors.length > 0 && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Found {parseErrors.length} parsing error{parseErrors.length > 1 ? 's' : ''}
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-md max-h-64 overflow-y-auto">
              <h4 className="text-sm font-medium mb-2">Errors:</h4>
              <ul className="space-y-2 text-xs">
                {parseErrors.map((error, index) => (
                  <li key={index} className="text-red-600">
                    <strong>Line {error.line}:</strong> {error.message}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleBackToEdit}>
                Back to Edit
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
