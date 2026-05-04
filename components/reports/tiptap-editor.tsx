'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { Extension, mergeAttributes } from '@tiptap/core';
import { useEffect, useState, useRef, useCallback } from 'react';
import { DOMSerializer } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Link as LinkIcon,
  Table as TableIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Columns3,
  Rows3,
  TableProperties,
  Trash2,
  Plus,
  Search,
  Code,
  Eye,
  IndentIncrease,
  IndentDecrease,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImagePickerDialog } from './image-picker-dialog';
import { FindReplaceDialog } from './find-replace-dialog';
import { ReportImage } from '@/lib/types/reports';
import { beautifyHtml, minifyHtml } from '@/lib/utils/html-beautifier';

const CURSOR_MARKER = '___CURSOR_MARKER_8x7z___';

// const isInternalLink = (href: string): boolean => {
//   if (!href) return false;
//   if (href.startsWith('#') || href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
//     return true;
//   }
//   try {
//     const url = new URL(href);
//     if (typeof window !== 'undefined') {
//       return url.hostname === window.location.hostname;
//     }
//   } catch {
//     return true;
//   }
//   return false;
// };

const CustomLink = Link.extend({
  renderHTML({ HTMLAttributes }) {
    // const href = HTMLAttributes.href || '';
    // const rel = isInternalLink(href) ? 'dofollow' : 'nofollow noopener noreferrer';
    const rel = 'dofollow';
    return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { rel }), 0];
  },
});

const INDENT_SIZE = 40; // px per indent level
const MAX_INDENT = 8;

const IndentExtension = Extension.create({
  name: 'indent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element: HTMLElement) => {
              const ml = element.style.marginLeft;
              if (ml) {
                const val = parseInt(ml, 10);
                if (!isNaN(val) && val > 0) return Math.round(val / INDENT_SIZE);
              }
              return 0;
            },
            renderHTML: (attributes: Record<string, unknown>) => {
              const indent = attributes.indent as number;
              if (!indent) return {};
              return { style: `margin-left: ${indent * INDENT_SIZE}px` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      increaseIndent:
        () =>
        ({ tr, state, dispatch }: any) => {
          const { from, to } = state.selection;
          state.doc.nodesBetween(from, to, (node: any, pos: number) => {
            if (['paragraph', 'heading'].includes(node.type.name)) {
              const indent = Math.min((node.attrs.indent || 0) + 1, MAX_INDENT);
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
            }
          });
          if (dispatch) dispatch(tr);
          return true;
        },
      decreaseIndent:
        () =>
        ({ tr, state, dispatch }: any) => {
          const { from, to } = state.selection;
          state.doc.nodesBetween(from, to, (node: any, pos: number) => {
            if (['paragraph', 'heading'].includes(node.type.name)) {
              const indent = Math.max((node.attrs.indent || 0) - 1, 0);
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
            }
          });
          if (dispatch) dispatch(tr);
          return true;
        },
    } as any;
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.isActive('listItem')) {
          return this.editor.commands.sinkListItem('listItem');
        }
        return (this.editor.commands as any).increaseIndent();
      },
      'Shift-Tab': () => {
        if (this.editor.isActive('listItem')) {
          return this.editor.commands.liftListItem('listItem');
        }
        return (this.editor.commands as any).decreaseIndent();
      },
    };
  },
});

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  reportId?: number | string;
  onEditorReady?: (editor: import('@tiptap/react').Editor | null) => void;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className,
  reportId,
  onEditorReady,
}: TiptapEditorProps) {
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [showHtmlCode, setShowHtmlCode] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');
  const [htmlCursorPos, setHtmlCursorPos] = useState(-1);
  const [pendingVisualCursorPos, setPendingVisualCursorPos] = useState(-1);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5],
        },
      }),
      CustomLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'tiptap-table-row',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'tiptap-table-cell',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'tiptap-table-header',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      IndentExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] p-4',
      },
      handleClick: (_view, _pos, event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest('a')) {
          event.preventDefault();
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        // Check for HTML content first (from our Copy button)
        const htmlContent = clipboardData.getData('text/html');
        if (htmlContent) {
          // Try to extract image src from HTML
          const imgMatch = htmlContent.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i);
          if (imgMatch) {
            const src = imgMatch[1];
            const alt = imgMatch[2] || '';

            // Insert the image using the URL
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({
                  src,
                  alt,
                })
              )
            );
            return true;
          }
        }

        // Check for plain text URL
        const plainText = clipboardData.getData('text/plain');
        if (plainText) {
          // Check if it's a URL pointing to an image
          const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
          if (urlPattern.test(plainText.trim())) {
            // Insert as image
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({
                  src: plainText.trim(),
                  alt: '',
                })
              )
            );
            return true;
          }
        }

        // Let TipTap handle normally
        return false;
      },
    },
  });

  // Expose editor instance to parent
  useEffect(() => {
    onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  // Sync editor content when the content prop changes from outside
  useEffect(() => {
    if (!editor) return;

    // Get current editor content as HTML
    const currentContent = editor.getHTML();

    // Only update if the content is different to avoid unnecessary updates
    // and prevent cursor jumping while typing
    if (content !== currentContent) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Place cursor and scroll textarea when switching to code view
  useEffect(() => {
    if (showHtmlCode && htmlCursorPos >= 0 && htmlTextareaRef.current) {
      const textarea = htmlTextareaRef.current;
      textarea.focus();
      const pos = Math.min(htmlCursorPos, textarea.value.length);
      textarea.setSelectionRange(pos, pos);

      // Scroll to make cursor visible - compute line number and scroll
      const textBeforeCursor = textarea.value.substring(0, pos);
      const lineCount = textBeforeCursor.split('\n').length;
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 18;
      const visibleLines = Math.floor(textarea.clientHeight / lineHeight);
      textarea.scrollTop = Math.max(0, (lineCount - Math.floor(visibleLines / 2)) * lineHeight);

      setHtmlCursorPos(-1);
    }
  }, [showHtmlCode, htmlCursorPos]);

  // After switching back to visual view, focus the editor at the mapped
  // position and scroll it into view. Must run after EditorContent re-mounts,
  // otherwise ProseMirror has no DOM to scroll and the viewport jumps to the top.
  useEffect(() => {
    if (showHtmlCode || pendingVisualCursorPos < 0 || !editor) return;

    const raf = requestAnimationFrame(() => {
      const safePos = Math.min(pendingVisualCursorPos, editor.state.doc.content.size);
      editor.chain().focus().setTextSelection(safePos).scrollIntoView().run();
      setPendingVisualCursorPos(-1);
    });

    return () => cancelAnimationFrame(raf);
  }, [showHtmlCode, pendingVisualCursorPos, editor]);

  // Serialize a ProseMirror doc fragment to HTML string
  const serializeFragment = useCallback(
    (fragment: any) => {
      if (!editor) return '';
      const serializer = DOMSerializer.fromSchema(editor.schema);
      const div = document.createElement('div');
      div.appendChild(serializer.serializeFragment(fragment));
      return div.innerHTML;
    },
    [editor]
  );

  // Count text characters (excluding HTML tags) before a position in an HTML string
  const countTextCharsBeforePos = useCallback((html: string, pos: number): number => {
    let count = 0;
    let inTag = false;
    for (let i = 0; i < pos && i < html.length; i++) {
      if (html[i] === '<') {
        inTag = true;
        continue;
      }
      if (html[i] === '>') {
        inTag = false;
        continue;
      }
      if (!inTag) count++;
    }
    return count;
  }, []);

  // Convert a text character offset into a ProseMirror document position
  const textOffsetToPmPos = useCallback((doc: any, textOffset: number): number => {
    let result = doc.content.size; // default to end so out-of-range offsets land at end, not start
    let textCount = 0;
    let found = false;

    doc.descendants((node: any, pos: number) => {
      if (found) return false;
      if (node.isText) {
        const len = node.text!.length;
        if (textCount + len >= textOffset) {
          result = pos + (textOffset - textCount);
          found = true;
          return false;
        }
        textCount += len;
      }
    });

    return result;
  }, []);

  // Snap cursor position out of an HTML tag if it's between < and >
  const snapOutOfTag = useCallback((html: string, pos: number): number => {
    let i = pos - 1;
    while (i >= 0) {
      if (html[i] === '>') break;
      if (html[i] === '<') {
        let j = pos;
        while (j < html.length && html[j] !== '>') j++;
        return j < html.length ? j + 1 : pos;
      }
      i--;
    }
    return pos;
  }, []);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run();
  };

  const insertImage = (image: ReportImage) => {
    editor
      .chain()
      .focus()
      .setImage({
        src: image.imageUrl,
        alt: image.title || 'Report image',
        title: image.title || undefined,
      })
      .run();
  };

  const alignImageLeft = () => {
    editor
      .chain()
      .focus()
      .updateAttributes('image', {
        class: 'tiptap-image tiptap-image-left',
      })
      .run();
  };

  const alignImageCenter = () => {
    editor
      .chain()
      .focus()
      .updateAttributes('image', {
        class: 'tiptap-image tiptap-image-center',
      })
      .run();
  };

  const alignImageRight = () => {
    editor
      .chain()
      .focus()
      .updateAttributes('image', {
        class: 'tiptap-image tiptap-image-right',
      })
      .run();
  };

  const setImageWidth = (width: string) => {
    const currentAttrs = editor.getAttributes('image');
    const currentClass = currentAttrs.class || 'tiptap-image';

    // Remove any existing width style
    let style = currentAttrs.style || '';
    style = style.replace(/max-width:\s*\d+%;?/g, '').trim();

    // Add new width
    if (width === '100') {
      // Full width, no max-width needed
      style = style || undefined;
    } else {
      style = `${style} max-width: ${width}%;`.trim();
    }

    editor
      .chain()
      .focus()
      .updateAttributes('image', {
        class: currentClass,
        style: style || undefined,
      })
      .run();
  };

  const toggleHtmlView = () => {
    if (!showHtmlCode) {
      // Switching to HTML view - inject marker at cursor, serialize, beautify, find marker
      try {
        const { from } = editor.state.selection;
        const tempTr = editor.state.tr.insertText(CURSOR_MARKER, from);
        const tempDoc = editor.state.apply(tempTr).doc;
        const htmlWithMarker = serializeFragment(tempDoc.content);
        const beautifiedWithMarker = beautifyHtml(htmlWithMarker);
        const markerIdx = beautifiedWithMarker.indexOf(CURSOR_MARKER);
        const beautified = beautifiedWithMarker.replace(CURSOR_MARKER, '');

        setHtmlCode(beautified);
        setHtmlCursorPos(markerIdx >= 0 ? markerIdx : 0);
      } catch {
        // Fallback: just beautify without cursor positioning
        setHtmlCode(beautifyHtml(editor.getHTML()));
        setHtmlCursorPos(0);
      }
    } else {
      // Switching back to visual view - map textarea cursor back to ProseMirror position
      const textarea = htmlTextareaRef.current;
      const cursorPos = textarea ? textarea.selectionStart : 0;

      // Snap cursor out of any HTML tag
      const safeCursorPos = snapOutOfTag(htmlCode, cursorPos);

      // Insert marker at cursor position in beautified HTML
      const htmlWithMarker =
        htmlCode.slice(0, safeCursorPos) + CURSOR_MARKER + htmlCode.slice(safeCursorPos);

      // Minify and set content (without marker)
      const minifiedClean = minifyHtml(htmlCode);
      editor.commands.setContent(minifiedClean);
      onChange(minifiedClean);

      // Find ProseMirror position from the marker's location. Don't apply the
      // selection here — EditorContent is still unmounted at this point, so
      // ProseMirror would have no DOM to scroll. Store the position and let
      // the post-remount effect focus + scrollIntoView.
      try {
        const minifiedWithMarker = minifyHtml(htmlWithMarker);
        const markerInMinified = minifiedWithMarker.indexOf(CURSOR_MARKER);
        if (markerInMinified >= 0) {
          const htmlBefore = minifiedWithMarker.slice(0, markerInMinified);
          // Count actual text characters (not tags) before marker
          const textOffset = countTextCharsBeforePos(htmlBefore, htmlBefore.length);
          const pmPos = textOffsetToPmPos(editor.state.doc, textOffset);
          setPendingVisualCursorPos(pmPos);
        } else {
          // Marker was removed by minifier — fall back to end of document
          setPendingVisualCursorPos(editor.state.doc.content.size);
        }
      } catch {
        // Cursor positioning failed — fall back to end of document
        setPendingVisualCursorPos(editor.state.doc.content.size);
      }
    }
    setShowHtmlCode(!showHtmlCode);
  };

  const handleHtmlCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlCode(e.target.value);
  };

  return (
    <div className={cn('border rounded-md', className)}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 border-b p-2 flex flex-wrap gap-1 bg-muted">
        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-background' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-background' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-background' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-background' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-background' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-background' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive('heading', { level: 4 }) ? 'bg-background' : ''}
        >
          <Heading4 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive('heading', { level: 5 }) ? 'bg-background' : ''}
        >
          <Heading5 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-background' : ''}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-background' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (editor.isActive('listItem')) {
              editor.chain().focus().sinkListItem('listItem').run();
            } else {
              (editor.chain().focus() as any).increaseIndent().run();
            }
          }}
          disabled={editor.isActive('listItem') && !editor.can().sinkListItem('listItem')}
          title="Increase indent"
        >
          <IndentIncrease className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (editor.isActive('listItem')) {
              editor.chain().focus().liftListItem('listItem').run();
            } else {
              (editor.chain().focus() as any).decreaseIndent().run();
            }
          }}
          disabled={editor.isActive('listItem') && !editor.can().liftListItem('listItem')}
          title="Decrease indent"
        >
          <IndentDecrease className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-background' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-background' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-background' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-background' : ''}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Link & Table */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-background' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Button type="button" variant="ghost" size="sm" onClick={insertTable}>
          <TableIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsImagePickerOpen(true)}
          disabled={!reportId}
          title={!reportId ? 'Save report to add images' : 'Insert image'}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Find & Replace */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsFindReplaceOpen(true)}
          title="Find and Replace"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* HTML Code View Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleHtmlView}
          className={showHtmlCode ? 'bg-background' : ''}
          title={showHtmlCode ? 'Switch to visual editor' : 'View HTML code'}
        >
          {showHtmlCode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
        </Button>

        {/* Table manipulation controls - only show when inside a table */}
        {editor.isActive('table') && (
          <>
            <Separator orientation="vertical" className="h-8" />

            {/* Row operations */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              title="Add row before"
            >
              <Plus className="h-3 w-3" />
              <Rows3 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Add row after"
            >
              <Rows3 className="h-4 w-4" />
              <Plus className="h-3 w-3" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Delete row"
            >
              <Rows3 className="h-4 w-4" />
              <Trash2 className="h-3 w-3" />
            </Button>

            <Separator orientation="vertical" className="h-8" />

            {/* Column operations */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Add column before"
            >
              <Plus className="h-3 w-3" />
              <Columns3 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Add column after"
            >
              <Columns3 className="h-4 w-4" />
              <Plus className="h-3 w-3" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Delete column"
            >
              <Columns3 className="h-4 w-4" />
              <Trash2 className="h-3 w-3" />
            </Button>

            <Separator orientation="vertical" className="h-8" />

            {/* Cell operations */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().mergeCells().run()}
              disabled={!editor.can().mergeCells()}
              title="Merge cells"
            >
              <TableProperties className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().splitCell().run()}
              disabled={!editor.can().splitCell()}
              title="Split cell"
            >
              <TableProperties className="h-4 w-4 rotate-180" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
              title="Toggle header row"
            >
              <Rows3 className="h-4 w-4 font-bold" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
              title="Toggle header column"
            >
              <Columns3 className="h-4 w-4 font-bold" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Delete table"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}

        {/* Image alignment controls - only show when an image is selected */}
        {editor.isActive('image') && (
          <>
            <Separator orientation="vertical" className="h-8" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={alignImageLeft}
              title="Align image left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={alignImageCenter}
              title="Align image center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={alignImageRight}
              title="Align image right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>

            <Select onValueChange={setImageWidth} defaultValue="100">
              <SelectTrigger className="w-24 h-8">
                <SelectValue placeholder="Width" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25%</SelectItem>
                <SelectItem value="50">50%</SelectItem>
                <SelectItem value="75">75%</SelectItem>
                <SelectItem value="100">100%</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}

        <Separator orientation="vertical" className="h-8" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor content */}
      {showHtmlCode ? (
        <div className="relative">
          <textarea
            ref={htmlTextareaRef}
            value={htmlCode}
            onChange={handleHtmlCodeChange}
            className="w-full min-h-[300px] max-h-[600px] p-4 font-mono text-sm focus:outline-none resize-y bg-muted/30 border-0"
            placeholder="HTML code will appear here..."
            spellCheck={false}
          />
          <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            HTML Code View
          </div>
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}

      {/* Image Picker Dialog */}
      {reportId && (
        <ImagePickerDialog
          reportId={reportId}
          open={isImagePickerOpen}
          onClose={() => setIsImagePickerOpen(false)}
          onSelect={insertImage}
        />
      )}

      {/* Find and Replace Dialog */}
      <FindReplaceDialog
        editor={editor}
        open={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
      />
    </div>
  );
}
