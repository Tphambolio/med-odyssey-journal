import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Compass, Calendar, MapPin, Share2, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../AuthModal';
import { ReactionBar } from '../reactions/ReactionBar';
import { CommentSection } from '../comments/CommentSection';
import { parseBlocks } from '../../utils/blocks';
import type { JournalEntry, Stop, Photo, JournalBlock, TextBlock, PhotoBlock } from '../../types';
import stopsData from '../../data/stops.json';

const stops = stopsData as Stop[];

export function PublicJournalPage() {
  const { journalId } = useParams<{ stopSlug: string; journalId: string }>();
  const { user } = useAuth();
  const [journal, setJournal] = useState<JournalEntry | null>(null);
  const [stop, setStop] = useState<Stop | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  // Parse blocks from journal content
  const blocks = useMemo(() => {
    if (!journal) return [];
    return parseBlocks(journal.content);
  }, [journal]);

  // Create a map of photos by ID for quick lookup
  const photosMap = useMemo(() => {
    const map = new Map<string, Photo>();
    photos.forEach((photo) => map.set(photo.id, photo));
    return map;
  }, [photos]);

  useEffect(() => {
    async function fetchJournal() {
      if (!journalId) return;

      try {
        // Fetch journal
        const { data: journalData, error: journalError } = await supabase
          .from('journals')
          .select('*')
          .eq('id', journalId)
          .eq('is_public', true)
          .single();

        if (journalError) throw journalError;
        if (!journalData) {
          setLoading(false);
          return;
        }

        setJournal(journalData);

        // Find stop
        const foundStop = stops.find((s) => s.id === journalData.stop_id);
        setStop(foundStop || null);

        // Fetch public photos for this journal
        const { data: photosData } = await supabase
          .from('photos')
          .select('*')
          .eq('journal_id', journalId)
          .eq('is_public', true)
          .order('created_at', { ascending: true });

        setPhotos(photosData || []);
      } catch (err) {
        console.error('Error fetching journal:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchJournal();
  }, [journalId]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMoodEmoji = (mood?: string): string => {
    const moods: Record<string, string> = {
      great: '😊 Great',
      good: '🙂 Good',
      okay: '😐 Okay',
      challenging: '😤 Challenging',
    };
    return mood ? moods[mood] || '' : '';
  };

  const getWeatherEmoji = (weather?: string): string => {
    const weathers: Record<string, string> = {
      sunny: '☀️ Sunny',
      cloudy: '☁️ Cloudy',
      rainy: '🌧️ Rainy',
      stormy: '⛈️ Stormy',
      windy: '💨 Windy',
    };
    return weather ? weathers[weather] || '' : '';
  };

  const getPhotoUrl = (path: string): string => {
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  };

  // Render a single block
  const renderBlock = (block: JournalBlock) => {
    if (block.type === 'text') {
      const textBlock = block as TextBlock;
      if (!textBlock.content.trim()) return null;
      return (
        <div key={block.id} className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-6">
          {textBlock.content}
        </div>
      );
    }

    if (block.type === 'photo') {
      const photoBlock = block as PhotoBlock;
      const photo = photosMap.get(photoBlock.photoId);
      if (!photo) return null;

      return (
        <figure key={block.id} className="mb-6">
          <button
            onClick={() => setLightboxPhoto(photo)}
            className="w-full cursor-zoom-in"
          >
            <img
              src={getPhotoUrl(photo.storage_path)}
              alt={photoBlock.caption || 'Photo'}
              className="w-full rounded-lg"
            />
          </button>
          {photoBlock.caption && (
            <figcaption className="mt-2 text-sm text-slate-400 text-center">
              {photoBlock.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h1 className="text-xl font-medium text-white mb-2">Journal not found</h1>
          <p className="text-slate-400 mb-4">This journal may not exist or is not public.</p>
          <Link
            to="/blog"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/blog"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Blog</span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <span className="text-sm text-slate-400">{user.email}</span>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Stop info */}
        {stop && (
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <MapPin className="w-5 h-5 text-cyan-500" />
            <span className="text-lg">{stop.name}, {stop.country}</span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">{journal.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(journal.created_at)}
          </span>
          {journal.mood && <span>{getMoodEmoji(journal.mood)}</span>}
          {journal.weather && <span>{getWeatherEmoji(journal.weather)}</span>}
        </div>

        {/* Content - render blocks */}
        <article className="mb-8">
          {blocks.map((block) => renderBlock(block))}
        </article>

        {/* Reactions & Share */}
        <div className="flex items-center justify-between py-4 border-t border-b border-slate-700 mb-8">
          <ReactionBar journalId={journal.id} onAuthRequired={() => setAuthModalOpen(true)} />

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-medium text-white">Comments</h2>
          </div>

          <CommentSection
            journalId={journal.id}
            onAuthRequired={() => setAuthModalOpen(true)}
          />
        </div>
      </main>

      {/* Photo Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={getPhotoUrl(lightboxPhoto.storage_path)}
            alt={lightboxPhoto.caption || 'Photo'}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
