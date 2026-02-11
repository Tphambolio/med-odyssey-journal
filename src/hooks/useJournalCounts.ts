import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface StopCounts {
  journalCount: number;
  photoCount: number;
}

/**
 * Fetches journal and photo counts per stop for the current user.
 * Returns a Map<stopId, { journalCount, photoCount }>.
 */
export function useJournalCounts() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Map<number, StopCounts>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCounts(new Map());
      setLoading(false);
      return;
    }

    async function fetchCounts() {
      setLoading(true);

      // Fetch journal counts grouped by stop_id
      const { data: journals } = await supabase
        .from('journals')
        .select('stop_id')
        .eq('user_id', user!.id);

      // Fetch photo counts grouped by stop_id
      const { data: photos } = await supabase
        .from('photos')
        .select('stop_id')
        .eq('user_id', user!.id);

      const map = new Map<number, StopCounts>();

      if (journals) {
        for (const j of journals) {
          const existing = map.get(j.stop_id) || { journalCount: 0, photoCount: 0 };
          existing.journalCount++;
          map.set(j.stop_id, existing);
        }
      }

      if (photos) {
        for (const p of photos) {
          const existing = map.get(p.stop_id) || { journalCount: 0, photoCount: 0 };
          existing.photoCount++;
          map.set(p.stop_id, existing);
        }
      }

      setCounts(map);
      setLoading(false);
    }

    fetchCounts();
  }, [user]);

  function getJournalCount(stopId: number): number {
    return counts.get(stopId)?.journalCount ?? 0;
  }

  function getPhotoCount(stopId: number): number {
    return counts.get(stopId)?.photoCount ?? 0;
  }

  return { counts, loading, getJournalCount, getPhotoCount };
}
