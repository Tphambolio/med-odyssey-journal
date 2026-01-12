import { useRef, useState } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, ImageIcon, Loader2, X } from 'lucide-react';
import { supabase, uploadPhoto, deletePhoto, getPhotoUrl } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { PhotoBlock, Photo } from '../../types';

interface PhotoBlockEditorProps {
  block: PhotoBlock;
  stopId: number;
  sessionId: string;
  photo: Photo | null;
  onPhotoUploaded: (photo: Photo) => void;
  onCaptionChange: (caption: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function PhotoBlockEditor({
  block,
  stopId,
  sessionId,
  photo,
  onPhotoUploaded,
  onCaptionChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: PhotoBlockEditorProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      // Upload to storage
      const { data: uploadData, error: uploadError } = await uploadPhoto(file, stopId, user.id);

      if (uploadError) {
        setError(uploadError.message);
        setUploading(false);
        return;
      }

      // Create database record with temp_session_id (no journal_id yet)
      const { data: photoData, error: dbError } = await supabase
        .from('photos')
        .insert({
          stop_id: stopId,
          user_id: user.id,
          storage_path: uploadData?.path,
          is_public: false,
          temp_session_id: sessionId,
        })
        .select()
        .single();

      if (dbError) {
        setError(dbError.message);
        setUploading(false);
        return;
      }

      onPhotoUploaded(photoData);
    } catch (err) {
      setError('Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (photo) {
      // Delete from storage and database
      await deletePhoto(photo.storage_path);
      await supabase.from('photos').delete().eq('id', photo.id);
    }
    onDelete();
  };

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
        onClick={handleRemovePhoto}
        className="absolute -right-10 top-2 p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete block"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="p-4">
        {photo ? (
          /* Photo preview */
          <div>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 mb-3">
              <img
                src={getPhotoUrl(photo.storage_path)}
                alt={block.caption || 'Photo'}
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="Add a caption..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        ) : (
          /* Upload placeholder */
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id={`photo-upload-${block.id}`}
            />
            <label
              htmlFor={`photo-upload-${block.id}`}
              className={`flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-slate-700/30 transition-colors ${
                uploading ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-3" />
                  <span className="text-slate-400">Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-slate-500 mb-3" />
                  <span className="text-slate-400">Click to add a photo</span>
                  <span className="text-slate-600 text-sm mt-1">or drag and drop</span>
                </>
              )}
            </label>
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
