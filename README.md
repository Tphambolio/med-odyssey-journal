# Med Odyssey Journal

A personal trip companion app for the Mediterranean sailing odyssey 2026-2027. Document your journey with photos, journal entries, and share highlights with family and friends.

## Features

- **101 Stops**: Browse all planned stops across 8 countries
- **Photo Gallery**: Upload and organize photos for each stop
- **Journal Entries**: Write journal entries with mood and weather tracking
- **Magic Link Auth**: Secure, passwordless authentication via email
- **Privacy Controls**: Everything private by default, share when ready
- **Mobile Friendly**: Works great on iPad, phone, and desktop

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Storage + Auth)
- **Icons**: Lucide React

## Getting Started

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings > API** and copy:
   - Project URL
   - Anon public key

### 2. Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL to create tables and policies

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

### Netlify

1. Push code to GitHub
2. Import project in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy

## Project Structure

```
med-odyssey-journal/
├── src/
│   ├── components/       # React components
│   ├── context/          # Auth context provider
│   ├── data/             # Stop data (JSON)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Supabase client
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   └── index.css         # Tailwind imports
├── supabase/
│   └── migrations/       # Database schema SQL
└── .env.example          # Environment template
```

## Authentication

The app uses Supabase Magic Link authentication:
1. User enters email
2. Supabase sends a magic link
3. User clicks link to sign in
4. Session persists across browser sessions

## Data Model

### Journals
- Linked to stops by `stop_id`
- Title, content, mood, weather
- Public/private toggle

### Photos
- Stored in Supabase Storage
- Metadata in PostgreSQL
- Linked to stops and optionally journals

### Shares
- Share tokens for public links
- Optional email invites
- Expiration dates

## License

Private project for personal use.
