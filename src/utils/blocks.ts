import type { JournalBlock, TextBlock } from '../types';

/**
 * Generate a unique block ID
 */
export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new text block
 */
export function createTextBlock(content: string = ''): TextBlock {
  return {
    id: generateBlockId(),
    type: 'text',
    content,
  };
}

/**
 * Parse journal content into blocks
 * - If content is valid JSON array, parse it
 * - Otherwise, treat as legacy plain text and wrap in single text block
 */
export function parseBlocks(content: string): JournalBlock[] {
  if (!content || content.trim() === '') {
    return [createTextBlock('')];
  }

  // Try to parse as JSON blocks
  if (content.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate that each item has required block properties
        const isValidBlocks = parsed.every(
          (block) =>
            block &&
            typeof block === 'object' &&
            typeof block.id === 'string' &&
            (block.type === 'text' || block.type === 'photo')
        );
        if (isValidBlocks) {
          return parsed as JournalBlock[];
        }
      }
    } catch {
      // Not valid JSON, treat as plain text
    }
  }

  // Legacy plain text content - wrap in single text block
  return [createTextBlock(content)];
}

/**
 * Serialize blocks to JSON string for storage
 */
export function serializeBlocks(blocks: JournalBlock[]): string {
  return JSON.stringify(blocks);
}

/**
 * Check if content is in the new block format
 */
export function isBlockFormat(content: string): boolean {
  if (!content || !content.trim().startsWith('[')) {
    return false;
  }
  try {
    const parsed = JSON.parse(content);
    return (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every((b) => b && b.type && b.id)
    );
  } catch {
    return false;
  }
}

/**
 * Get plain text preview from blocks (for journal list display)
 */
export function getBlocksPreview(blocks: JournalBlock[], maxLength: number = 150): string {
  const textContent = blocks
    .filter((block): block is TextBlock => block.type === 'text')
    .map((block) => block.content)
    .join(' ')
    .trim();

  if (textContent.length <= maxLength) {
    return textContent;
  }

  return textContent.substring(0, maxLength).trim() + '...';
}

/**
 * Check if blocks have any actual content
 */
export function hasContent(blocks: JournalBlock[]): boolean {
  return blocks.some((block) => {
    if (block.type === 'text') {
      return block.content.trim().length > 0;
    }
    if (block.type === 'photo') {
      return !!block.photoId;
    }
    return false;
  });
}
