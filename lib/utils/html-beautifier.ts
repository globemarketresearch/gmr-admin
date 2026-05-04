/**
 * Beautifies HTML code with proper indentation and formatting
 */
export function beautifyHtml(html: string): string {
  if (!html) return '';

  let formatted = '';
  let indent = 0;
  const tab = '  '; // 2 spaces for indentation

  // Split by tags
  const tokens = html.split(/(<[^>]+>)/g).filter(token => token.trim());

  tokens.forEach(token => {
    const trimmed = token.trim();

    if (!trimmed) return;

    // Self-closing tags or content
    if (!trimmed.startsWith('<')) {
      // Text content
      formatted += tab.repeat(indent) + trimmed + '\n';
    } else if (trimmed.startsWith('</')) {
      // Closing tag
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + trimmed + '\n';
    } else if (trimmed.endsWith('/>') || isSelfClosing(trimmed)) {
      // Self-closing tag
      formatted += tab.repeat(indent) + trimmed + '\n';
    } else {
      // Opening tag
      formatted += tab.repeat(indent) + trimmed + '\n';

      // Don't indent for inline elements
      if (!isInlineElement(trimmed)) {
        indent++;
      }
    }
  });

  return formatted.trim();
}

/**
 * Minifies/compresses HTML by removing extra whitespace
 */
export function minifyHtml(html: string): string {
  return html
    .replace(/\n\s+/g, ' ') // Replace newlines and multiple spaces with single space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/>\s+</g, '><') // Remove spaces between tags
    .trim();
}

/**
 * Check if tag is self-closing
 */
function isSelfClosing(tag: string): boolean {
  const selfClosingTags = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ];

  const tagName = tag.match(/<(\w+)/)?.[1]?.toLowerCase();
  return tagName ? selfClosingTags.includes(tagName) : false;
}

/**
 * Check if element is inline (shouldn't add indentation)
 */
function isInlineElement(tag: string): boolean {
  const inlineTags = [
    'a',
    'abbr',
    'b',
    'bdi',
    'bdo',
    'br',
    'cite',
    'code',
    'data',
    'dfn',
    'em',
    'i',
    'kbd',
    'mark',
    'q',
    's',
    'samp',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'time',
    'u',
    'var',
  ];

  const tagName = tag.match(/<(\w+)/)?.[1]?.toLowerCase();
  return tagName ? inlineTags.includes(tagName) : false;
}
