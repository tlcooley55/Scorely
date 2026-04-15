begin;

-- Clean existing sample data
truncate table public.friends restart identity;
truncate table public.bookmarks restart identity;
truncate table public.top_songs restart identity;
truncate table public.ratings restart identity;
truncate table public.searches restart identity;
truncate table public.profiles restart identity;
truncate table public.songs restart identity;

-- Sample users (profiles)
insert into public.profiles (user_id, username, created_at)
values
  ('11111111-1111-4111-8111-111111111111', 'jane', now()),
  ('22222222-2222-4222-8222-222222222222', 'jake', now()),
  ('33333333-3333-4333-8333-333333333333', 'sam', now());

-- Sample songs
insert into public.songs (song_id, title, artist, album_art, genre, release_year, created_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Midnight Drive', 'Neon Skyline', 'https://example.com/art/midnight-drive.jpg', 'Synthwave', 2021, now()),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Golden Hour', 'The Daybreaks', 'https://example.com/art/golden-hour.jpg', 'Indie Pop', 2019, now()),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Rain on Glass', 'Amber Atlas', 'https://example.com/art/rain-on-glass.jpg', null, 2020, now()),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Paper Planes', 'Northbound', null, 'Alternative', null, now());

-- Sample ratings (one rating per user per song)
insert into public.ratings (rating_id, user_id, song_id, rating_value, review, created_at)
values
  ('e1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 5, 'Instant favorite. Great hook and production.', now()),
  ('e2222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 4, 'Really solid—perfect for late afternoon.', now()),
  ('e3333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 3, null, now()),
  ('e4444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 2, 'Not my style, but I can see the appeal.', now());

-- Sample Top 5 songs (manual selection ordered by position)
insert into public.top_songs (top_song_id, user_id, song_id, position, created_at)
values
  ('c1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, now()),
  ('c2222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 2, now()),
  ('c3333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 1, now());

-- Sample bookmarks
insert into public.bookmarks (bookmark_id, user_id, song_id, created_at)
values
  ('f1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', now()),
  ('f2222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', now());

-- Sample friends
insert into public.friends (friend_id, user_id, friend_user_id, created_at)
values
  ('a1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', now()),
  ('a2222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', now());

-- Sample searches
insert into public.searches (search_id, user_id, query, searched_at)
values
  ('b1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'midnight drive neon skyline', now()),
  ('b2222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'golden hour', now()),
  ('b3333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'synthwave 2021', now());

commit;
