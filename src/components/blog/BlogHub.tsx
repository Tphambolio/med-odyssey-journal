import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, MessageCircle, Heart, Calendar, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../AuthModal';
import type { JournalEntry, Stop, ReactionCounts } from '../../types';
import stopsData from '../../data/stops.json';

const stops = stopsData as Stop[];

interface PublicJournal extends JournalEntry {
  stop?: Stop;
  reaction_counts?: ReactionCounts;
  comment_count?: number;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function BlogHub() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<PublicJournal[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    async function fetchPublicJournals() {
      try {
        const { data, error } = await supabase
          .from('journals')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Enrich journals with stop data and counts
        const enrichedJournals = await Promise.all(
          (data || []).map(async (journal) => {
            const stop = stops.find((s) => s.id === journal.stop_id);

            // Get reaction counts
            const { data: reactionData } = await supabase
              .rpc('get_reaction_counts', { p_journal_id: journal.id });

            // Get comment count
            const { data: commentData } = await supabase
              .rpc('get_comment_count', { p_journal_id: journal.id });

            return {
              ...journal,
              stop,
              reaction_counts: reactionData || {},
              comment_count: commentData || 0,
            };
          })
        );

        setJournals(enrichedJournals);
      } catch (err) {
        console.error('Error fetching public journals:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicJournals();
  }, []);

  const getTotalReactions = (counts: ReactionCounts | undefined): number => {
    if (!counts) return 0;
    return (counts.like || 0) + (counts.heart || 0) + (counts.amazed || 0) + (counts.inspired || 0);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMoodEmoji = (mood?: string): string => {
    const moods: Record<string, string> = {
      great: '😊',
      good: '🙂',
      okay: '😐',
      challenging: '😤',
    };
    return mood ? moods[mood] || '' : '';
  };

  const getWeatherEmoji = (weather?: string): string => {
    const weathers: Record<string, string> = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      stormy: '⛈️',
      windy: '💨',
    };
    return weather ? weathers[weather] || '' : '';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/blog" className="flex items-center gap-2">
              <Compass className="w-8 h-8 text-cyan-500" />
              <span className="text-xl font-bold text-white">Med Odyssey Journal</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Back to App
              </Link>
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Mediterranean Odyssey 2026-2027
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Follow our sailing adventure across 8 countries. Stories, photos, and memories from the journey.
          </p>
        </div>

        {/* Journals Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading journals...</p>
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
            <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No public journals yet</h3>
            <p className="text-slate-400">Check back soon for updates from the journey!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {journals.map((journal) => (
              <Link
                key={journal.id}
                to={`/blog/${slugify(journal.stop?.name || 'unknown')}/${journal.id}`}
                className="block bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-cyan-500/50 transition-colors group"
              >
                {/* Journal Card */}
                <div className="p-5">
                  {/* Stop info */}
                  {journal.stop && (
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{journal.stop.name}, {journal.stop.country}</span>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {journal.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-slate-400 line-clamp-3 mb-4">
                    {journal.content.substring(0, 150)}
                    {journal.content.length > 150 && '...'}
                  </p>

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(journal.created_at)}
                      </span>
                      {journal.mood && <span>{getMoodEmoji(journal.mood)}</span>}
                      {journal.weather && <span>{getWeatherEmoji(journal.weather)}</span>}
                    </div>

                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {getTotalReactions(journal.reaction_counts)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {journal.comment_count}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
