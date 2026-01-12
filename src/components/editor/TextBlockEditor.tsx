import { useRef, useEffect } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { TextBlock } from '../../types';

interface TextBlockEditorProps {
  block: TextBlock;
  onChange: (content: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  placeholder?: string;
}

export function TextBlockEditor({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  placeholder = 'Write your story...',
}: TextBlockEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(100, textarea.scrollHeight)}px`;
    }
  }, [block.content]);

  return (
    <div className="group relative bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
      {/* Block controls */}
      <div className="absolute -left-10 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="p-1 text-slate-600 cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>
        <button
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute -right-10 top-2 p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete block"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Text area */}
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-transparent text-white placeholder-slate-500 focus:outline-none resize-none min-h-[100px]"
      />
    </div>
  );
}
