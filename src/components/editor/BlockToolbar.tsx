import { Type, ImageIcon, Plus } from 'lucide-react';

interface BlockToolbarProps {
  onAddText: () => void;
  onAddPhoto: () => void;
}

export function BlockToolbar({ onAddText, onAddPhoto }: BlockToolbarProps) {
  return (
    <div className="flex items-center gap-2 py-3">
      <span className="text-slate-500 text-sm mr-2">
        <Plus className="w-4 h-4 inline" /> Add:
      </span>
      <button
        type="button"
        onClick={onAddText}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
      >
        <Type className="w-4 h-4" />
        Text
      </button>
      <button
        type="button"
        onClick={onAddPhoto}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
      >
        <ImageIcon className="w-4 h-4" />
        Photo
      </button>
    </div>
  );
}
