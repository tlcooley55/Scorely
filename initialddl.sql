-- Enable UUID generation helpers (Supabase default usually has this,
-- but including it makes the script portable).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========
-- Profiles (User app data)
-- =========
-- Uses Supabase built-in auth.users for authentication.
-- auth.users has: id (uuid), email, etc.
CREATE TABLE IF NOT EXISTS "public"."profiles" (
  "user_id" uuid PRIMARY KEY REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "username" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Helpful lookup index
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_username_key"
ON "public"."profiles" ("username");

-- =========
-- Songs
-- =========
CREATE TABLE IF NOT EXISTS "public"."songs" (
  "song_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "artist" text NOT NULL,
  "album_art" text,
  "genre" text,
  "release_year" integer,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- =========
-- Ratings
-- =========
CREATE TABLE IF NOT EXISTS "public"."ratings" (
  "rating_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
  "song_id" uuid NOT NULL REFERENCES "public"."songs"("song_id") ON DELETE CASCADE,
  "rating_value" integer NOT NULL CHECK ("rating_value" BETWEEN 1 AND 5),
  "review" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),

  -- Each user can only rate a song once
  CONSTRAINT "ratings_user_song_unique" UNIQUE ("user_id", "song_id")
);

CREATE INDEX IF NOT EXISTS "ratings_song_id_idx" ON "public"."ratings" ("song_id");
CREATE INDEX IF NOT EXISTS "ratings_user_id_idx" ON "public"."ratings" ("user_id");

-- =========
-- Bookmarks
-- =========
CREATE TABLE IF NOT EXISTS "public"."bookmarks" (
  "bookmark_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
  "song_id" uuid NOT NULL REFERENCES "public"."songs"("song_id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "bookmarks_song_id_idx" ON "public"."bookmarks" ("song_id");
CREATE INDEX IF NOT EXISTS "bookmarks_user_id_idx" ON "public"."bookmarks" ("user_id");

-- =========
-- Friends
-- =========
CREATE TABLE IF NOT EXISTS "public"."friends" (
  "friend_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
  "friend_user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),

  -- (Not requested, but prevents exact duplicates)
  CONSTRAINT "friends_user_friend_unique" UNIQUE ("user_id", "friend_user_id")
);

CREATE INDEX IF NOT EXISTS "friends_user_id_idx" ON "public"."friends" ("user_id");
CREATE INDEX IF NOT EXISTS "friends_friend_user_id_idx" ON "public"."friends" ("friend_user_id");

-- =========
-- Searches
-- =========
CREATE TABLE IF NOT EXISTS "public"."searches" (
  "search_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
  "query" text NOT NULL,
  "searched_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "searches_user_id_idx" ON "public"."searches" ("user_id");
CREATE INDEX IF NOT EXISTS "searches_searched_at_idx" ON "public"."searches" ("searched_at");
