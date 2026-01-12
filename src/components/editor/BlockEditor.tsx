import { useState, useEffect } from 'react';
import { TextBlockEditor } from './TextBlockEditor';
import { PhotoBlockEditor } from './PhotoBlockEditor';
import { BlockToolbar } from './BlockToolbar';
import { generateBlockId, createTextBlock } from '../../utils/blocks';
import type { JournalBlock, PhotoBlock, Photo } from '../../types';

interface BlockEditorProps {
  blocks: JournalBlock[];
  onChange: (blocks: JournalBlock[]) => void;
  stopId: number;
  sessionId: string;
}

export function BlockEditor({ blocks, onChange, stopId, sessionId }: BlockEditorProps) {
  // Track photos uploaded during this session
  const [uploadedPhotos, setUploadedPhotos] = useState<Map<string, Photo>>(new Map());

  // Ensure there's always at least one block
  useEffect(() => {
    if (blocks.length === 0) {
      onChange([createTextBlock('')]);
    }
  }, [blocks, onChange]);

  const updateBlock = (index: number, updates: Partial<JournalBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates } as JournalBlock;
    onChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    if (blocks.length <= 1) {
      // Don't delete the last block, just clear it
      if (blocks[0].type === 'text') {
        onChange([createTextBlock('')]);
      }
      return;
    }
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const addTextBlock = () => {
    onChange([...blocks, createTextBlock('')]);
  };

  const addPhotoBlock = () => {
    const newBlock: PhotoBlock = {
      id: generateBlockId(),
      type: 'photo',
      photoId: '',
    };
    onChange([...blocks, newBlock]);
  };

  const handlePhotoUploaded = (blockId: string, photo: Photo) => {
    // Update the block with the photo ID
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index !== -1) {
      updateBlock(index, { photoId: photo.id });
    }
    // Track the photo
    setUploadedPhotos((prev) => new Map(prev).set(photo.id, photo));
  };

  const getPhotoForBlock = (block: PhotoBlock): Photo | null => {
    if (!block.photoId) return null;
    return uploadedPhotos.get(block.photoId) || null;
  };

  return (
    <div className="space-y-4 pl-10">
      {blocks.map((block, index) => (
        <div key={block.id}>
          {block.type === 'text' ? (
            <TextBlockEditor
              block={block}
              onChange={(content) => updateBlock(index, { content })}
              onDelete={() => deleteBlock(index)}
              onMoveUp={() => moveBlock(index, 'up')}
              onMoveDown={() => moveBlock(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < blocks.length - 1}
              placeholder={index === 0 ? 'Start writing your story...' : 'Continue...'}
            />
          ) : (
            <PhotoBlockEditor
              block={block}
              stopId={stopId}
              sessionId={sessionId}
              photo={getPhotoForBlock(block)}
              onPhotoUploaded={(photo) => handlePhotoUploaded(block.id, photo)}
              onCaptionChange={(caption) => updateBlock(index, { caption })}
              onDelete={() => deleteBlock(index)}
              onMoveUp={() => moveBlock(index, 'up')}
              onMoveDown={() => moveBlock(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < blocks.length - 1}
            />
          )}
        </div>
      ))}

      <BlockToolbar onAddText={addTextBlock} onAddPhoto={addPhotoBlock} />
    </div>
  );
}

// Export a function to get all photo IDs from blocks (for linking on save)
export function getPhotoIdsFromBlocks(blocks: JournalBlock[]): string[] {
  return blocks
    .filter((b): b is PhotoBlock => b.type === 'photo' && !!b.photoId)
    .map((b) => b.photoId);
}
