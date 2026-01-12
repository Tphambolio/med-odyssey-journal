import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, BookOpen, Sun, Cloud, CloudRain, Wind, Zap, Globe, Lock, ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useJournals } from '../hooks/useJournals';
import { BlockEditor, getPhotoIdsFromBlocks } from './editor';
import { parseBlocks, serializeBlocks, hasContent, getBlocksPreview, createTextBlock } from '../utils/blocks';
import type { JournalEntry, JournalBlock } from '../types';

interface JournalEditorProps {
  stopId: number;
  isLoggedIn: boolean;
}

const moodOptions = [
  { value: 'great', label: 'Great', emoji: '😄' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'challenging', label: 'Challenging', emoji: '😓' },
] as const;

const weatherOptions = [
  { value: 'sunny', label: 'Sunny', icon: Sun },
  { value: 'cloudy', label: 'Cloudy', icon: Cloud },
  { value: 'rainy', label: 'Rainy', icon: CloudRain },
  { value: 'windy', label: 'Windy', icon: Wind },
  { value: 'stormy', label: 'Stormy', icon: Zap },
] as const;

// Generate a unique session ID for temporary photo uploads
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function JournalEditor({ stopId, isLoggedIn }: JournalEditorProps) {
  const { journals, loading, createJournal, updateJournal, deleteJournal } = useJournals(stopId);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<JournalBlock[]>([createTextBlock('')]);
  const [mood, setMood] = useState<JournalEntry['mood']>();
  const [weather, setWeather] = useState<JournalEntry['weather']>();
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Session ID for temporary photo uploads (stable per editing session)
  const sessionId = useMemo(() => generateSessionId(), [isEditing]);

  const resetForm = () => {
    setTitle('');
    setBlocks([createTextBlock('')]);
    setMood(undefined);
    setWeather(undefined);
    setIsPublic(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setBlocks(parseBlocks(entry.content));
    setMood(entry.mood);
    setWeather(entry.weather);
    setIsPublic(entry.is_public);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !hasContent(blocks)) return;

    setSaving(true);

    const content = serializeBlocks(blocks);
    const photoIds = getPhotoIdsFromBlocks(blocks);

    if (editingId) {
      // Update existing journal
      await updateJournal(editingId, { title, content, mood, weather, is_public: isPublic });

      // Link any new photos to this journal
      if (photoIds.length > 0) {
        await supabase
          .from('photos')
          .update({ journal_id: editingId, is_public: isPublic, temp_session_id: null })
          .in('id', photoIds);
      }
    } else {
      // Create new journal
      const { data: newJournal } = await createJournal({
        stop_id: stopId,
        title,
        content,
        mood,
        weather,
        is_public: isPublic,
      });

      // Link photos to the new journal
      if (newJournal && photoIds.length > 0) {
        await supabase
          .from('photos')
          .update({ journal_id: newJournal.id, is_public: isPublic, temp_session_id: null })
          .in('id', photoIds);
      }
    }

    setSaving(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteJournal(id);
    setDeleteConfirm(null);
  };

  // Helper to get content preview for journal list
  const getPreview = (content: string): string => {
    const entryBlocks = parseBlocks(content);
    return getBlocksPreview(entryBlocks, 150);
  };

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Sign in to write journal entries</h3>
        <p className="text-slate-400">Create an account to document your sailing adventures.</p>
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
      {/* New Entry Button / Form */}
      {isEditing ? (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">
              {editingId ? 'Edit Entry' : 'New Journal Entry'}
            </h3>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
          />

          {/* Block Editor */}
          <div className="mb-4">
            <BlockEditor
              blocks={blocks}
              onChange={setBlocks}
              stopId={stopId}
              sessionId={sessionId}
            />
          </div>

          {/* Mood Selection */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">How was your day?</label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    mood === option.value
                      ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400'
                      : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span>{option.emoji}</span>
                  <span className="text-sm hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weather Selection */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Weather conditions</label>
            <div className="flex flex-wrap gap-2">
              {weatherOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setWeather(option.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      weather === option.value
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400'
                        : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Public Toggle */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors w-full ${
                isPublic
                  ? 'bg-cyan-600/20 border-cyan-500'
                  : 'bg-slate-900 border-slate-600 hover:border-slate-500'
              }`}
            >
              {isPublic ? (
                <Globe className="w-5 h-5 text-cyan-400" />
              ) : (
                <Lock className="w-5 h-5 text-slate-400" />
              )}
              <div className="text-left">
                <div className={`text-sm font-medium ${isPublic ? 'text-cyan-400' : 'text-white'}`}>
                  {isPublic ? 'Public on Blog' : 'Private'}
                </div>
                <div className="text-xs text-slate-500">
                  {isPublic
                    ? 'Visible to everyone on the public blog'
                    : 'Only you can see this entry'}
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !hasContent(blocks)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Entry
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors mb-6"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      )}

      {/* Journal Entries List */}
      {journals.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No journal entries yet. Write your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {journals.map((entry) => (
            <div
              key={entry.id}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-medium text-white">{entry.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span>
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {entry.mood && (
                      <span>{moodOptions.find((m) => m.value === entry.mood)?.emoji}</span>
                    )}
                    {entry.weather && (
                      <span>
                        {(() => {
                          const W = weatherOptions.find((w) => w.value === entry.weather);
                          return W ? <W.icon className="w-4 h-4" /> : null;
                        })()}
                      </span>
                    )}
                    {entry.is_public ? (
                      <span className="flex items-center gap-1 text-cyan-400" title="Public on blog">
                        <Globe className="w-3 h-3" />
                        <span className="text-xs">Public</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1" title="Private">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                    {/* Photo count indicator */}
                    {(() => {
                      const entryBlocks = parseBlocks(entry.content);
                      const photoCount = entryBlocks.filter((b) => b.type === 'photo').length;
                      if (photoCount > 0) {
                        return (
                          <span className="flex items-center gap-1 text-slate-400">
                            <ImageIcon className="w-3 h-3" />
                            <span className="text-xs">{photoCount}</span>
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-slate-400" />
                  </button>

                  {deleteConfirm === entry.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(entry.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-slate-300 line-clamp-3">{getPreview(entry.content)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
