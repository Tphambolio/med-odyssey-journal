import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const auth = supabase.auth;
export const storage = supabase.storage;

// Sign in with magic link
export async function signInWithMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Upload photo to storage
export async function uploadPhoto(file: File, stopId: number, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${stopId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  return { data, error };
}

// Get public URL for photo
export function getPhotoUrl(path: string) {
  const { data } = supabase.storage.from('photos').getPublicUrl(path);
  return data.publicUrl;
}

// Delete photo from storage
export async function deletePhoto(path: string) {
  const { error } = await supabase.storage.from('photos').remove([path]);
  return { error };
}
