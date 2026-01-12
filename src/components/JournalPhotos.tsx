import { useRef } from 'react';
import { Plus, X, Loader2, ImageIcon } from 'lucide-react';
import { usePhotos } from '../hooks/usePhotos';
import { getPhotoUrl } from '../lib/supabase';
import type { Photo } from '../types';

interface JournalPhotosProps {
  journalId: string;
  stopId: number;
  isPublic: boolean;
}

export function JournalPhotos({ journalId, stopId, isPublic }: JournalPhotosProps) {
  const { photos, uploading, upload, remove, updateAllPhotosPublicStatus } = usePhotos({ journalId });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      await upload(file, { stopId, journalId, isPublic });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (photo: Photo) => {
    await remove(photo.id, photo.storage_path);
  };

  // Sync photo visibility when journal visibility changes
  const syncPublicStatus = async () => {
    await updateAllPhotosPublicStatus(journalId, isPublic);
  };

  return (
    <div className="border-t border-slate-700 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm text-slate-400">
          <ImageIcon className="w-4 h-4 inline mr-1" />
          Photos ({photos.length})
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id={`journal-photo-upload-${journalId}`}
        />
        <label
          htmlFor={`journal-photo-upload-${journalId}`}
          className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              Add Photos
            </>
          )}
        </label>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square">
              <img
                src={getPhotoUrl(photo.storage_path)}
                alt={photo.caption || 'Photo'}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handleDelete(photo)}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-slate-900 rounded-lg border border-dashed border-slate-700">
          <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No photos yet</p>
          <p className="text-xs text-slate-600 mt-1">Add photos to include in this journal entry</p>
        </div>
      )}

      {photos.length > 0 && photos.some(p => p.is_public !== isPublic) && (
        <button
          onClick={syncPublicStatus}
          className="mt-3 text-xs text-cyan-400 hover:text-cyan-300"
        >
          Sync photo visibility with journal ({isPublic ? 'make public' : 'make private'})
        </button>
      )}
    </div>
  );
}
