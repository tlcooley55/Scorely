create table if not exists public.top_songs (
  top_song_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  song_id uuid not null references public.songs(song_id) on delete cascade,
  position integer not null,
  created_at timestamptz not null default now(),
  constraint top_songs_position_check check (position between 1 and 5),
  constraint top_songs_user_position_unique unique (user_id, position),
  constraint top_songs_user_song_unique unique (user_id, song_id)
);

create index if not exists top_songs_user_id_idx on public.top_songs(user_id);
