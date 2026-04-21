alter table if exists public.top_songs
  drop constraint if exists top_songs_user_song_unique;
