import { useState, useEffect } from 'react';
import { Send, User, Reply, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { Comment, UserProfile } from '../../types';

interface CommentSectionProps {
  journalId: string;
  onAuthRequired: () => void;
}

interface CommentWithProfile extends Comment {
  user_profile: UserProfile | null;
  replies: CommentWithProfile[];
}

export function CommentSection({ journalId, onAuthRequired }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [journalId]);

  async function fetchComments() {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profile:user_profiles(*)
        `)
        .eq('journal_id', journalId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize into threads
      const commentsMap = new Map<string, CommentWithProfile>();
      const topLevel: CommentWithProfile[] = [];

      (data || []).forEach((comment) => {
        const commentWithReplies: CommentWithProfile = {
          ...comment,
          user_profile: comment.user_profile,
          replies: [],
        };
        commentsMap.set(comment.id, commentWithReplies);
      });

      commentsMap.forEach((comment) => {
        if (comment.parent_comment_id) {
          const parent = commentsMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies.push(comment);
          }
        } else {
          topLevel.push(comment);
        }
      });

      setComments(topLevel);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent, parentId: string | null = null) {
    e.preventDefault();

    if (!user) {
      onAuthRequired();
      return;
    }

    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.from('comments').insert({
        journal_id: journalId,
        user_id: user.id,
        content: content.trim(),
        parent_comment_id: parentId,
      });

      if (error) throw error;

      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }

      fetchComments();
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!user) return;

    try {
      await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user.id);
      fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  function CommentItem({ comment, depth = 0 }: { comment: CommentWithProfile; depth?: number }) {
    const isOwner = user?.id === comment.user_id;
    const displayName = comment.user_profile?.display_name || 'Anonymous';

    return (
      <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-white">{displayName}</span>
                <span className="text-xs text-slate-500 ml-2">
                  {formatDate(comment.created_at)}
                </span>
              </div>
            </div>

            {isOwner && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Delete comment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Content */}
          <p className="text-slate-300 text-sm whitespace-pre-wrap">{comment.content}</p>

          {/* Actions */}
          {depth === 0 && (
            <div className="mt-3">
              <button
                onClick={() => {
                  if (!user) {
                    onAuthRequired();
                    return;
                  }
                  setReplyingTo(replyingTo === comment.id ? null : comment.id);
                }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 ml-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Replies */}
        {comment.replies.map((reply) => (
          <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Comment Form */}
      {user ? (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700 text-center">
          <p className="text-slate-400 mb-3">Sign in to leave a comment</p>
          <button
            onClick={onAuthRequired}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-slate-500 text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
