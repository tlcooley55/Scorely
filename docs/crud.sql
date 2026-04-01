-- ============================================
-- SCORELY CRUD TEST QUERIES
-- Assumes your schema exists and seed data was loaded
-- ============================================

BEGIN;

-- =========================================================
-- 0) KNOWN TEST USERS
-- =========================================================
-- Existing auth/profile user IDs you gave earlier:
-- 4e108322-b35d-47b9-968f-790ff3362fea  -> alice
-- 21dadb99-b384-4faf-9171-599167715127  -> bob
-- 3be76e1a-0e38-4fc9-b300-1f916d61bf04  -> charlie


-- =========================================================
-- 1) CREATE TESTS
-- =========================================================

-- 1A. Create a new song
INSERT INTO public.songs (title, artist, album_art, genre, release_year)
VALUES (
  'Nights',
  'Frank Ocean',
  'https://example.com/album-art/nights.jpg',
  'R&B',
  2016
)
RETURNING *;

-- 1B. Create a rating for that song by Alice
INSERT INTO public.ratings (user_id, song_id, rating_value, review)
SELECT
  '4e108322-b35d-47b9-968f-790ff3362fea',
  s.song_id,
  5,
  'Late-night masterpiece.'
FROM public.songs s
WHERE s.title = 'Nights'
  AND s.artist = 'Frank Ocean'
LIMIT 1
RETURNING *;

-- 1C. Create a bookmark for Bob
INSERT INTO public.bookmarks (user_id, song_id)
SELECT
  '21dadb99-b384-4faf-9171-599167715127',
  s.song_id
FROM public.songs s
WHERE s.title = 'Nights'
  AND s.artist = 'Frank Ocean'
LIMIT 1
RETURNING *;

-- 1D. Create a friend/follow relationship
INSERT INTO public.friends (user_id, friend_user_id)
VALUES (
  '21dadb99-b384-4faf-9171-599167715127',
  '4e108322-b35d-47b9-968f-790ff3362fea'
)
ON CONFLICT (user_id, friend_user_id) DO NOTHING
RETURNING *;

-- 1E. Create a search log
INSERT INTO public.searches (user_id, query)
VALUES (
  '3be76e1a-0e38-4fc9-b300-1f916d61bf04',
  'Frank Ocean Nights'
)
RETURNING *;


-- =========================================================
-- 2) READ TESTS
-- =========================================================

-- 2A. Read all profiles
SELECT *
FROM public.profiles
ORDER BY created_at DESC;

-- 2B. Read all songs
SELECT *
FROM public.songs
ORDER BY created_at DESC, title ASC;

-- 2C. Read one song by title/artist
SELECT *
FROM public.songs
WHERE title = 'Nights'
  AND artist = 'Frank Ocean';

-- 2D. Read ratings with usernames and song info
SELECT
  r.rating_id,
  p.username,
  s.title,
  s.artist,
  r.rating_value,
  r.review,
  r.created_at
FROM public.ratings r
JOIN public.profiles p
  ON p.user_id = r.user_id
JOIN public.songs s
  ON s.song_id = r.song_id
ORDER BY r.created_at DESC;

-- 2E. Read all ratings by Alice
SELECT
  r.rating_id,
  s.title,
  s.artist,
  r.rating_value,
  r.review,
  r.created_at
FROM public.ratings r
JOIN public.songs s
  ON s.song_id = r.song_id
WHERE r.user_id = '4e108322-b35d-47b9-968f-790ff3362fea'
ORDER BY r.created_at DESC;

-- 2F. Read songs Alice rated 4 or 5 stars
SELECT
  s.song_id,
  s.title,
  s.artist,
  r.rating_value,
  r.review
FROM public.ratings r
JOIN public.songs s
  ON s.song_id = r.song_id
WHERE r.user_id = '4e108322-b35d-47b9-968f-790ff3362fea'
  AND r.rating_value >= 4
ORDER BY r.rating_value DESC, r.created_at DESC;

-- 2G. Read Bob's bookmarked songs
SELECT
  b.bookmark_id,
  s.song_id,
  s.title,
  s.artist,
  b.created_at
FROM public.bookmarks b
JOIN public.songs s
  ON s.song_id = b.song_id
WHERE b.user_id = '21dadb99-b384-4faf-9171-599167715127'
ORDER BY b.created_at DESC;

-- 2H. Read who Alice follows
SELECT
  f.friend_id,
  p.username AS follows_username,
  f.created_at
FROM public.friends f
JOIN public.profiles p
  ON p.user_id = f.friend_user_id
WHERE f.user_id = '4e108322-b35d-47b9-968f-790ff3362fea'
ORDER BY f.created_at DESC;

-- 2I. Read Alice's followers
SELECT
  f.friend_id,
  p.username AS follower_username,
  f.created_at
FROM public.friends f
JOIN public.profiles p
  ON p.user_id = f.user_id
WHERE f.friend_user_id = '4e108322-b35d-47b9-968f-790ff3362fea'
ORDER BY f.created_at DESC;

-- 2J. Friend activity feed:
-- show ratings from users Alice follows
SELECT
  p.username,
  s.title,
  s.artist,
  r.rating_value,
  r.review,
  r.created_at
FROM public.friends f
JOIN public.ratings r
  ON r.user_id = f.friend_user_id
JOIN public.profiles p
  ON p.user_id = r.user_id
JOIN public.songs s
  ON s.song_id = r.song_id
WHERE f.user_id = '4e108322-b35d-47b9-968f-790ff3362fea'
ORDER BY r.created_at DESC;

-- 2K. Search history for Charlie
SELECT *
FROM public.searches
WHERE user_id = '3be76e1a-0e38-4fc9-b300-1f916d61bf04'
ORDER BY searched_at DESC;

-- 2L. Aggregate rating per song
SELECT
  s.song_id,
  s.title,
  s.artist,
  COUNT(r.rating_id) AS ratings_count,
  ROUND(AVG(r.rating_value)::numeric, 2) AS avg_rating
FROM public.songs s
LEFT JOIN public.ratings r
  ON r.song_id = s.song_id
GROUP BY s.song_id, s.title, s.artist
ORDER BY avg_rating DESC NULLS LAST, ratings_count DESC, s.title ASC;


-- =========================================================
-- 3) UPDATE TESTS
-- =========================================================

-- 3A. Update a profile username
UPDATE public.profiles
SET username = 'alice_updated'
WHERE user_id = '4e108322-b35d-47b9-968f-790ff3362fea'
RETURNING *;

-- 3B. Restore username
UPDATE public.profiles
SET username = 'alice'
WHERE user_id = '4e108322-b35d-47b9-968f-790ff3362fea'
RETURNING *;

-- 3C. Update song metadata
UPDATE public.songs
SET genre = 'Alternative R&B',
    album_art = 'https://example.com/album-art/nights-updated.jpg'
WHERE title = 'Nights'
  AND artist = 'Frank Ocean'
RETURNING *;

-- 3D. Update rating + review
UPDATE public.ratings r
SET rating_value = 4,
    review = 'Still great, but grew on me differently.'
WHERE r.user_id = '4e108322-b35d-47b9-968f-790ff3362fea'
  AND r.song_id = (
    SELECT song_id
    FROM public.songs
    WHERE title = 'Nights'
      AND artist = 'Frank Ocean'
    LIMIT 1
  )
RETURNING *;

-- 3E. Upsert-style rating test
-- Useful because the schema only allows one rating per user/song
INSERT INTO public.ratings (user_id, song_id, rating_value, review)
SELECT
  '4e108322-b35d-47b9-968f-790ff3362fea',
  s.song_id,
  5,
  'Updated again with UPSERT.'
FROM public.songs s
WHERE s.title = 'Nights'
  AND s.artist = 'Frank Ocean'
LIMIT 1
ON CONFLICT (user_id, song_id)
DO UPDATE SET
  rating_value = EXCLUDED.rating_value,
  review = EXCLUDED.review
RETURNING *;


-- =========================================================
-- 4) DELETE TESTS
-- =========================================================

-- 4A. Delete a bookmark
DELETE FROM public.bookmarks
WHERE user_id = '21dadb99-b384-4faf-9171-599167715127'
  AND song_id = (
    SELECT song_id
    FROM public.songs
    WHERE title = 'Nights'
      AND artist = 'Frank Ocean'
    LIMIT 1
  )
RETURNING *;

-- 4B. Delete a friend relationship
DELETE FROM public.friends
WHERE user_id = '21dadb99-b384-4faf-9171-599167715127'
  AND friend_user_id = '4e108322-b35d-47b9-968f-790ff3362fea'
RETURNING *;

-- 4C. Delete a rating
DELETE FROM public.ratings
WHERE user_id = '4e108322-b35d-47b9-968f-790ff3362fea'
  AND song_id = (
    SELECT song_id
    FROM public.songs
    WHERE title = 'Nights'
      AND artist = 'Frank Ocean'
    LIMIT 1
  )
RETURNING *;

-- 4D. Delete a search log
DELETE FROM public.searches
WHERE user_id = '3be76e1a-0e38-4fc9-b300-1f916d61bf04'
  AND query = 'Frank Ocean Nights'
RETURNING *;

-- 4E. Delete the song
-- This should work after dependent rows are removed
DELETE FROM public.songs
WHERE title = 'Nights'
  AND artist = 'Frank Ocean'
RETURNING *;


-- =========================================================
-- 5) CONSTRAINT / NEGATIVE TESTS
-- =========================================================

-- 5A. Duplicate username test: should fail if 'alice' already exists
-- INSERT INTO public.profiles (user_id, username)
-- VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alice');

-- 5B. Invalid rating value: should fail due to CHECK between 1 and 5
-- INSERT INTO public.ratings (user_id, song_id, rating_value, review)
-- SELECT
--   '4e108322-b35d-47b9-968f-790ff3362fea',
--   s.song_id,
--   6,
--   'This should fail'
-- FROM public.songs s
-- WHERE s.title = 'Blinding Lights'
-- LIMIT 1;

-- 5C. Duplicate rating for same user/song: should fail unless using UPSERT
-- INSERT INTO public.ratings (user_id, song_id, rating_value, review)
-- SELECT
--   '4e108322-b35d-47b9-968f-790ff3362fea',
--   s.song_id,
--   5,
--   'Duplicate test'
-- FROM public.songs s
-- WHERE s.title = 'Blinding Lights'
-- LIMIT 1;

-- 5D. Duplicate friend relationship: should fail unless using ON CONFLICT DO NOTHING
-- INSERT INTO public.friends (user_id, friend_user_id)
-- VALUES (
--   '4e108322-b35d-47b9-968f-790ff3362fea',
--   '21dadb99-b384-4faf-9171-599167715127'
-- );

-- 5E. Foreign key failure: non-existent profile
-- INSERT INTO public.searches (user_id, query)
-- VALUES ('99999999-9999-9999-9999-999999999999', 'should fail');


-- =========================================================
-- 6) OPTIONAL CLEAN TEST MODE
-- =========================================================
-- Use one of these:
-- COMMIT;    -- keep changes
-- ROLLBACK;  -- undo everything after testing

ROLLBACK;
A few notes:
•	Your current schema uses friends, while the PRD describes this concept as one-way following. Functionally, the CRUD above treats friends like a follow table. 
•	Since ratings has UNIQUE (user_id, song_id), testing “update rating” is best done with either UPDATE or an INSERT ... ON CONFLICT DO UPDATE. 
•	I wrapped everything in a transaction and ended with ROLLBACK so you can test safely. Switch that to COMMIT when you want the changes to persist.

