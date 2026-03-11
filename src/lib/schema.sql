-- ============================================================
-- DROP.FM — Supabase Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---- Venues ----
create table venues (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  slug                text unique not null,
  owner_id            uuid references auth.users(id) on delete cascade,
  plan                text default 'basic' check (plan in ('basic','pro','agency')),
  stripe_account_id   text,
  qr_code_url         text,
  settings            jsonb default '{
    "min_offer": 2,
    "max_offer": 20,
    "auction_mode": false,
    "dynamic_pricing": false,
    "blacklist_artists": [],
    "allowed_genres": []
  }'::jsonb,
  created_at          timestamptz default now()
);

-- ---- DJ Profiles ----
create table dj_profiles (
  id                uuid primary key default uuid_generate_v4(),
  venue_id          uuid references venues(id) on delete cascade,
  user_id           uuid references auth.users(id) on delete cascade,
  name              text not null,
  library_last_sync timestamptz,
  created_at        timestamptz default now()
);

-- ---- Track Library (importata da Rekordbox XML) ----
create table tracks (
  id        uuid primary key default uuid_generate_v4(),
  venue_id  uuid references venues(id) on delete cascade,
  title     text not null,
  artist    text not null,
  bpm       numeric(5,2),
  key       text,
  genre     text,
  duration  integer,  -- secondi
  created_at timestamptz default now()
);

-- Full text search index sui brani
create index tracks_search_idx on tracks
  using gin(to_tsvector('english', title || ' ' || artist));

-- ---- Song Requests ----
create table song_requests (
  id                        uuid primary key default uuid_generate_v4(),
  venue_id                  uuid references venues(id) on delete cascade,
  track_id                  uuid references tracks(id),
  amount                    numeric(10,2) not null,
  status                    text default 'pending'
                              check (status in ('pending','accepted','rejected','played')),
  dedication                text,
  customer_name             text,
  stripe_payment_intent_id  text unique not null,
  created_at                timestamptz default now(),
  accepted_at               timestamptz,
  played_at                 timestamptz
);

-- ---- RLS Policies ----
alter table venues       enable row level security;
alter table dj_profiles  enable row level security;
alter table tracks       enable row level security;
alter table song_requests enable row level security;

-- Venue: owner can do anything
-- INSERT separato: auth.uid() = owner_id copre anche il caso
-- in cui la sessione è appena creata (signUp con email confirmation)
create policy "venue_insert" on venues
  for insert with check (auth.uid() = owner_id);

-- Owner can see all their venues
create policy "venue_select" on venues
  for select using (auth.uid() = owner_id);

-- Public can read a venue by id (needed for QR code landing page)
create policy "venue_read_public" on venues
  for select using (true);

create policy "venue_update" on venues
  for update using (auth.uid() = owner_id);

create policy "venue_delete" on venues
  for delete using (auth.uid() = owner_id);

-- Tracks: readable by all (for the public queue page), writable by owner
create policy "tracks_read_all" on tracks
  for select using (true);
create policy "tracks_write_owner" on tracks
  for all using (
    auth.uid() = (select owner_id from venues where id = venue_id)
  );

-- Requests: readable by all, insertable by anyone (customers), manageable by owner
create policy "requests_read_all" on song_requests
  for select using (true);
create policy "requests_insert_all" on song_requests
  for insert with check (true);
create policy "requests_update_owner" on song_requests
  for update using (
    auth.uid() = (select owner_id from venues where id = venue_id)
  );

-- ---- Realtime ----
-- Abilita realtime su song_requests per i live updates
alter publication supabase_realtime add table song_requests;
alter publication supabase_realtime add table tracks;
