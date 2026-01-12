import { useState, useEffect } from 'react';
import { supabase, uploadPhoto, deletePhoto, getPhotoUrl } from '../lib/supabase';
import type { Photo } from '../types';
import { useAuth } from '../context/AuthContext';

interface UsePhotosOptions {
  stopId?: number;
  journalId?: string;
}

export function usePhotos(options: UsePhotosOptions = {}) {
  const { stopId, journalId } = options;
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    fetchPhotos();
  }, [user, stopId, journalId]);

  async function fetchPhotos() {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('photos')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (stopId) {
      query = query.eq('stop_id', stopId);
    }

    if (journalId) {
      query = query.eq('journal_id', journalId);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      setPhotos(data || []);
    }
    setLoading(false);
  }

  interface UploadOptions {
    stopId: number;
    journalId?: string;
    caption?: string;
    isPublic?: boolean;
  }

  async function upload(file: File, options: UploadOptions) {
    if (!user) return { error: new Error('Not authenticated') };

    setUploading(true);
    setError(null);

    try {
      // Upload to storage
      const { data: uploadData, error: uploadError } = await uploadPhoto(file, options.stopId, user.id);

      if (uploadError) {
        setError(uploadError.message);
        setUploading(false);
        return { error: uploadError };
      }

      // Create database record
      const { data, error: dbError } = await supabase
        .from('photos')
        .insert([
          {
            stop_id: options.stopId,
            journal_id: options.journalId || null,
            user_id: user.id,
            storage_path: uploadData?.path,
            caption: options.caption,
            is_public: options.isPublic || false,
          },
        ])
        .select()
        .single();

      if (dbError) {
        setError(dbError.message);
        setUploading(false);
        return { error: dbError };
      }

      setPhotos((prev) => [data, ...prev]);
      setUploading(false);
      return { data };
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setUploading(false);
      return { error };
    }
  }

  async function linkToJournal(photoId: string, journalId: string, isPublic: boolean) {
    const { data, error } = await supabase
      .from('photos')
      .update({ journal_id: journalId, is_public: isPublic })
      .eq('id', photoId)
      .select()
      .single();

    if (!error && data) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? data : p))
      );
    }

    return { data, error };
  }

  async function updatePublicStatus(photoId: string, isPublic: boolean) {
    const { data, error } = await supabase
      .from('photos')
      .update({ is_public: isPublic })
      .eq('id', photoId)
      .select()
      .single();

    if (!error && data) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? data : p))
      );
    }

    return { data, error };
  }

  async function updateAllPhotosPublicStatus(journalId: string, isPublic: boolean) {
    const { error } = await supabase
      .from('photos')
      .update({ is_public: isPublic })
      .eq('journal_id', journalId);

    if (!error) {
      setPhotos((prev) =>
        prev.map((p) => (p.journal_id === journalId ? { ...p, is_public: isPublic } : p))
      );
    }

    return { error };
  }

  async function remove(id: string, storagePath: string) {
    // Delete from storage
    const { error: storageError } = await deletePhoto(storagePath);
    if (storageError) {
      setError(storageError.message);
      return { error: storageError };
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (dbError) {
      setError(dbError.message);
      return { error: dbError };
    }

    setPhotos((prev) => prev.filter((p) => p.id !== id));
    return { error: null };
  }

  async function updateCaption(id: string, caption: string) {
    const { data, error } = await supabase
      .from('photos')
      .update({ caption })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? data : p))
      );
    }

    return { data, error };
  }

  return {
    photos,
    loading,
    uploading,
    error,
    upload,
    remove,
    updateCaption,
    linkToJournal,
    updatePublicStatus,
    updateAllPhotosPublicStatus,
    getUrl: getPhotoUrl,
    refetch: fetchPhotos,
  };
}
