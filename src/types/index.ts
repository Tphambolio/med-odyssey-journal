export interface Stop {
  id: number;
  name: string;
  country: string;
  lat: number;
  lon: number;
  type: string;
  arrival: string;
  departure: string;
  duration: string;
  distanceToNext: number;
  phase: string;
  schengen: boolean;
  season: string;
  marinaName?: string;
  marinaUrl?: string;
  cultureHighlight?: string;
  cultureUrl?: string;
  notes?: string;
  wikiUrl?: string;
  foodUrl?: string;
  adventureUrl?: string;
  provisionsUrl?: string;
}

export interface Phase {
  id: string;
  name: string;
  stops: number;
  days: number;
  schengen: boolean;
  color: string;
}

export interface Stats {
  totalDays: number;
  sailingDays: number;
  restDays: number;
  extendedStayDays: number;
  totalSchengenDays: number;
  schengen2026: number;
  schengen2027: number;
}

export interface JournalEntry {
  id: string;
  stop_id: number;
  user_id: string;
  title: string;
  content: string;
  mood?: 'great' | 'good' | 'okay' | 'challenging';
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'windy';
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

export interface Photo {
  id: string;
  stop_id: number;
  journal_id?: string;
  user_id: string;
  storage_path: string;
  caption?: string;
  taken_at?: string;
  lat?: number;
  lon?: number;
  is_public: boolean;
  created_at: string;
  temp_session_id?: string;
}

export interface Share {
  id: string;
  user_id: string;
  shared_with_email?: string;
  access_level: 'view' | 'comment';
  share_token: string;
  expires_at?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  journal_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
  replies?: Comment[];
}

export interface Reaction {
  id: string;
  journal_id: string;
  user_id: string;
  reaction_type: 'like' | 'heart' | 'amazed' | 'inspired';
  created_at: string;
}

export interface ReactionCounts {
  like?: number;
  heart?: number;
  amazed?: number;
  inspired?: number;
}

// Block-based journal content types
export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
}

export interface PhotoBlock {
  id: string;
  type: 'photo';
  photoId: string;
  caption?: string;
}

export type JournalBlock = TextBlock | PhotoBlock;
