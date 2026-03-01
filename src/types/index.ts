// Core data types for Mediterranean Odyssey

export interface Stop {
  id: number;
  name: string;
  country: string;
  lat: number;
  lon: number;
  type: 'marina' | 'anchorage';
  arrival: string;           // ISO date string (YYYY-MM-DD)
  departure: string;
  duration: string;          // e.g., "3 days"
  distanceToNext: number;    // km
  season: 'summer' | 'fall' | 'winter';
  phase: string;             // country name (e.g., "Croatia")

  // Marina details
  marinaUrl?: string;
  marinaName?: string;

  // Culture & enrichment
  cultureHighlight?: string;
  cultureUrl?: string;
  foodGuide?: string;
  foodUrl?: string;
  wikiUrl?: string;
  adventureUrl?: string;
  provisionsUrl?: string;

  // Notes/description
  notes?: string;

  // Navigation to next stop
  hoursToNext?: number;
  nmToNext?: number;

  // Route waypoints to avoid land crossings
  routeWaypoints?: [number, number][];
}

// Schengen countries on the route
const SCHENGEN_COUNTRIES = new Set(['Croatia', 'Greece', 'Italy']);

export function isSchengen(country: string): boolean {
  return SCHENGEN_COUNTRIES.has(country);
}

export interface Phase {
  id: string;
  name: string;              // Country name
  stops: number;
  days: number;
  schengen: boolean;
  color: string;
}

export interface TripStats {
  totalDays: number;
  sailingDays: number;
  restDays: number;
  extendedStayDays: number;
  totalSchengenDays: number;
  schengen2026: number;
  schengen2027: number;
}

// Alias for backward compatibility
export type Stats = TripStats;

// Filter state for the sidebar
export interface FilterState {
  countries: string[];
  types: ('marina' | 'anchorage')[];
  phases: string[];
  seasons: ('summer' | 'fall' | 'winter')[];
  searchQuery: string;
}

// Map state
export interface MapState {
  center: [number, number];
  zoom: number;
  selectedStop: Stop | null;
}

// App state
export interface AppState {
  stops: Stop[];
  phases: Phase[];
  stats: TripStats;
  filters: FilterState;
  map: MapState;
  loading: boolean;
  error: string | null;
}

// Default map settings
export const DEFAULT_MAP_CENTER: [number, number] = [38.5, 20.0];
export const DEFAULT_MAP_ZOOM = 6;

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
