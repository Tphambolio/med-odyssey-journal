import { useState, useEffect } from 'react';
import { Heart, ThumbsUp, Sparkles, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { ReactionCounts } from '../../types';

interface ReactionBarProps {
  journalId: string;
  onAuthRequired: () => void;
}

type ReactionType = 'like' | 'heart' | 'amazed' | 'inspired';

const reactionConfig: Record<ReactionType, { icon: typeof Heart; label: string; color: string }> = {
  like: { icon: ThumbsUp, label: 'Like', color: 'text-blue-400' },
  heart: { icon: Heart, label: 'Love', color: 'text-red-400' },
  amazed: { icon: Sparkles, label: 'Amazed', color: 'text-yellow-400' },
  inspired: { icon: Star, label: 'Inspired', color: 'text-purple-400' },
};

export function ReactionBar({ journalId, onAuthRequired }: ReactionBarProps) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ReactionCounts>({});
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [journalId, user]);

  async function fetchReactions() {
    try {
      // Get counts
      const { data: countsData } = await supabase
        .rpc('get_reaction_counts', { p_journal_id: journalId });

      setCounts(countsData || {});

      // Get user's reaction if logged in
      if (user) {
        const { data: userReactionData } = await supabase
          .from('reactions')
          .select('reaction_type')
          .eq('journal_id', journalId)
          .eq('user_id', user.id)
          .single();

        setUserReaction(userReactionData?.reaction_type as ReactionType || null);
      }
    } catch (err) {
      console.error('Error fetching reactions:', err);
    }
  }

  async function handleReaction(type: ReactionType) {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (userReaction === type) {
        // Remove reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('journal_id', journalId)
          .eq('user_id', user.id);

        setUserReaction(null);
        setCounts((prev) => ({
          ...prev,
          [type]: Math.max(0, (prev[type] || 0) - 1),
        }));
      } else {
        if (userReaction) {
          // Update existing reaction
          await supabase
            .from('reactions')
            .update({ reaction_type: type })
            .eq('journal_id', journalId)
            .eq('user_id', user.id);

          setCounts((prev) => ({
            ...prev,
            [userReaction]: Math.max(0, (prev[userReaction] || 0) - 1),
            [type]: (prev[type] || 0) + 1,
          }));
        } else {
          // Insert new reaction
          await supabase
            .from('reactions')
            .insert({
              journal_id: journalId,
              user_id: user.id,
              reaction_type: type,
            });

          setCounts((prev) => ({
            ...prev,
            [type]: (prev[type] || 0) + 1,
          }));
        }
        setUserReaction(type);
      }
    } catch (err) {
      console.error('Error updating reaction:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {(Object.entries(reactionConfig) as [ReactionType, typeof reactionConfig['like']][]).map(
        ([type, config]) => {
          const Icon = config.icon;
          const count = counts[type] || 0;
          const isActive = userReaction === type;

          return (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              disabled={loading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
                isActive
                  ? `bg-slate-700 ${config.color}`
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={config.label}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
              {count > 0 && <span className="text-sm">{count}</span>}
            </button>
          );
        }
      )}
    </div>
  );
}
