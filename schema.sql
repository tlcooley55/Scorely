create extension if not exists pgcrypto;

create table if not exists public.songs (
  song_id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  album_art text,
  genre text,
  release_year integer,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  rating_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  song_id uuid not null references public.songs(song_id) on delete cascade,
  rating_value integer not null,
  review text,
  created_at timestamptz not null default now(),
  constraint ratings_rating_value_check check (rating_value between 1 and 5),
  constraint ratings_review_length_check check (review is null or char_length(review) <= 500),
  constraint ratings_user_song_unique unique (user_id, song_id)
);

create index if not exists ratings_user_id_idx on public.ratings(user_id);
create index if not exists ratings_song_id_idx on public.ratings(song_id);

create table if not exists public.top_songs (
  top_song_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  song_id uuid not null references public.songs(song_id) on delete cascade,
  position integer not null,
  created_at timestamptz not null default now(),
  constraint top_songs_position_check check (position between 1 and 5),
  constraint top_songs_user_position_unique unique (user_id, position)
);

create index if not exists top_songs_user_id_idx on public.top_songs(user_id);

create table if not exists public.bookmarks (
  bookmark_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  song_id uuid not null references public.songs(song_id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint bookmarks_user_song_unique unique (user_id, song_id)
);

create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);

create table if not exists public.friends (
  friend_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  friend_user_id uuid not null,
  created_at timestamptz not null default now(),
  constraint friends_not_self_check check (user_id <> friend_user_id),
  constraint friends_user_friend_unique unique (user_id, friend_user_id)
);

create index if not exists friends_user_id_idx on public.friends(user_id);
create index if not exists friends_friend_user_id_idx on public.friends(friend_user_id);

create table if not exists public.searches (
  search_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  query text not null,
  searched_at timestamptz not null default now(),
  constraint searches_query_length_check check (char_length(query) between 1 and 255)
);

create index if not exists searches_user_id_idx on public.searches(user_id);

create table if not exists public.profiles (
  user_id uuid primary key,
  username text not null,
  created_at timestamptz not null default now(),
  constraint profiles_username_length_check check (char_length(username) between 3 and 50),
  constraint profiles_username_unique unique (username)
);
