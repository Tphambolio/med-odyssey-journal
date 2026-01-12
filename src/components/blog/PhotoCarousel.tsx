import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Photo } from '../../types';

interface PhotoCarouselProps {
  photos: Photo[];
}

export function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const getUrl = (path: string) => {
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  };

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const lightboxPrevious = useCallback(() => {
    setLightboxIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrevious();
      if (e.key === 'ArrowRight') lightboxNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxPrevious, lightboxNext]);

  if (photos.length === 0) {
    return null;
  }

  // Single photo - simple display
  if (photos.length === 1) {
    return (
      <div className="mb-8">
        <button
          onClick={() => openLightbox(0)}
          className="w-full aspect-video rounded-xl overflow-hidden bg-slate-800 cursor-zoom-in"
        >
          <img
            src={getUrl(photos[0].storage_path)}
            alt={photos[0].caption || 'Photo'}
            className="w-full h-full object-cover"
          />
        </button>
        {photos[0].caption && (
          <p className="mt-2 text-sm text-slate-400 text-center">{photos[0].caption}</p>
        )}

        {/* Lightbox */}
        {lightboxOpen && (
          <Lightbox
            photos={photos}
            currentIndex={lightboxIndex}
            getUrl={getUrl}
            onClose={closeLightbox}
            onPrevious={lightboxPrevious}
            onNext={lightboxNext}
          />
        )}
      </div>
    );
  }

  // Multiple photos - carousel
  return (
    <div className="mb-8">
      {/* Main carousel */}
      <div className="relative">
        <button
          onClick={() => openLightbox(currentIndex)}
          className="w-full aspect-video rounded-xl overflow-hidden bg-slate-800 cursor-zoom-in"
        >
          <img
            src={getUrl(photos[currentIndex].storage_path)}
            alt={photos[currentIndex].caption || 'Photo'}
            className="w-full h-full object-cover transition-opacity"
          />
        </button>

        {/* Navigation arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Counter */}
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 rounded-full text-white text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Caption */}
      {photos[currentIndex].caption && (
        <p className="mt-2 text-sm text-slate-400 text-center">{photos[currentIndex].caption}</p>
      )}

      {/* Thumbnail strip */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
              index === currentIndex
                ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={getUrl(photo.storage_path)}
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          getUrl={getUrl}
          onClose={closeLightbox}
          onPrevious={lightboxPrevious}
          onNext={lightboxNext}
        />
      )}
    </div>
  );
}

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  getUrl: (path: string) => string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

function Lightbox({ photos, currentIndex, getUrl, onClose, onPrevious, onNext }: LightboxProps) {
  const photo = photos[currentIndex];

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrevious(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Image container */}
      <div
        className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getUrl(photo.storage_path)}
          alt={photo.caption || 'Photo'}
          className="max-h-[80vh] object-contain rounded-lg"
        />

        {/* Caption and counter */}
        <div className="mt-4 text-center">
          {photo.caption && (
            <p className="text-white mb-2">{photo.caption}</p>
          )}
          {photos.length > 1 && (
            <p className="text-slate-400 text-sm">
              {currentIndex + 1} of {photos.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
