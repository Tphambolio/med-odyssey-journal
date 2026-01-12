-- Med Odyssey Journal - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Journals table
create table if not exists journals (
  id uuid default uuid_generate_v4() primary key,
  stop_id integer not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  mood text check (mood in ('great', 'good', 'okay', 'challenging')),
  weather text check (weather in ('sunny', 'cloudy', 'rainy', 'stormy', 'windy')),
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Photos table
create table if not exists photos (
  id uuid default uuid_generate_v4() primary key,
  stop_id integer not null,
  journal_id uuid references journals(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade not null,
  storage_path text not null,
  caption text,
  taken_at timestamp with time zone,
  lat double precision,
  lon double precision,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Shares table
create table if not exists shares (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  shared_with_email text,
  access_level text default 'view' check (access_level in ('view', 'comment')) not null,
  share_token text unique not null,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_journals_user_id on journals(user_id);
create index if not exists idx_journals_stop_id on journals(stop_id);
create index if not exists idx_photos_user_id on photos(user_id);
create index if not exists idx_photos_stop_id on photos(stop_id);
create index if not exists idx_shares_token on shares(share_token);
create index if not exists idx_shares_user_id on shares(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table journals enable row level security;
alter table photos enable row level security;
alter table shares enable row level security;

-- Journals policies
create policy "Users can view their own journals"
  on journals for select
  using (auth.uid() = user_id);

create policy "Users can view public journals"
  on journals for select
  using (is_public = true);

create policy "Users can insert their own journals"
  on journals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own journals"
  on journals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own journals"
  on journals for delete
  using (auth.uid() = user_id);

-- Photos policies
create policy "Users can view their own photos"
  on photos for select
  using (auth.uid() = user_id);

create policy "Users can view public photos"
  on photos for select
  using (is_public = true);

create policy "Users can insert their own photos"
  on photos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own photos"
  on photos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own photos"
  on photos for delete
  using (auth.uid() = user_id);

-- Shares policies
create policy "Users can view their own shares"
  on shares for select
  using (auth.uid() = user_id);

create policy "Users can insert their own shares"
  on shares for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own shares"
  on shares for delete
  using (auth.uid() = user_id);

-- Create storage bucket for photos
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Storage policies for photos bucket
create policy "Users can upload photos to their folder"
  on storage.objects for insert
  with check (
    bucket_id = 'photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Users can delete their own photos"
  on storage.objects for delete
  using (
    bucket_id = 'photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at on journals
create trigger update_journals_updated_at
  before update on journals
  for each row
  execute function update_updated_at_column();
