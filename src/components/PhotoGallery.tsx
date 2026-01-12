import { useState, useRef } from 'react';
import { Plus, X, Loader2, Trash2, ImageOff } from 'lucide-react';
import { usePhotos } from '../hooks/usePhotos';

interface PhotoGalleryProps {
  stopId: number;
  isLoggedIn: boolean;
}

export function PhotoGallery({ stopId, isLoggedIn }: PhotoGalleryProps) {
  const { photos, loading, uploading, upload, remove, getUrl } = usePhotos({ stopId });
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      await upload(file, { stopId });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, path: string) => {
    await remove(id, path);
    setDeleteConfirm(null);
    setSelectedPhoto(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <ImageOff className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Sign in to add photos</h3>
        <p className="text-slate-400">Create an account to upload and organize your trip photos.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Upload Button */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className={`inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg cursor-pointer transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Photos
            </>
          )}
        </label>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
          <ImageOff className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No photos yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo.id)}
              className="aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <img
                src={getUrl(photo.storage_path)}
                alt={photo.caption || 'Photo'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {(() => {
            const photo = photos.find((p) => p.id === selectedPhoto);
            if (!photo) return null;

            return (
              <div className="max-w-4xl max-h-[90vh] flex flex-col">
                <img
                  src={getUrl(photo.storage_path)}
                  alt={photo.caption || 'Photo'}
                  className="max-h-[80vh] object-contain rounded-lg"
                />

                <div className="flex items-center justify-between mt-4 px-2">
                  {photo.caption && (
                    <p className="text-white">{photo.caption}</p>
                  )}

                  {deleteConfirm === photo.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">Delete this photo?</span>
                      <button
                        onClick={() => handleDelete(photo.id, photo.storage_path)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(photo.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
