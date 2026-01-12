import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { JournalEntry } from '../types';
import { useAuth } from '../context/AuthContext';

export function useJournals(stopId?: number) {
  const { user } = useAuth();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setJournals([]);
      setLoading(false);
      return;
    }

    fetchJournals();
  }, [user, stopId]);

  async function fetchJournals() {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('journals')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (stopId) {
      query = query.eq('stop_id', stopId);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      setJournals(data || []);
    }
    setLoading(false);
  }

  async function createJournal(entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('journals')
      .insert([
        {
          ...entry,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setJournals((prev) => [data, ...prev]);
    }

    return { data, error };
  }

  async function updateJournal(id: string, updates: Partial<JournalEntry>) {
    const { data, error } = await supabase
      .from('journals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setJournals((prev) =>
        prev.map((j) => (j.id === id ? data : j))
      );

      // Sync photo visibility if is_public changed
      if (updates.is_public !== undefined) {
        await supabase
          .from('photos')
          .update({ is_public: updates.is_public })
          .eq('journal_id', id);
      }
    }

    return { data, error };
  }

  async function deleteJournal(id: string) {
    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', id);

    if (!error) {
      setJournals((prev) => prev.filter((j) => j.id !== id));
    }

    return { error };
  }

  return {
    journals,
    loading,
    error,
    createJournal,
    updateJournal,
    deleteJournal,
    refetch: fetchJournals,
  };
}
