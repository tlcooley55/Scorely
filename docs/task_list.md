# Scorely Trello-Ready Task List (from userstories.md)

Each item below is a Trello card.

## Trello Cards

- **[Auth] [UI] User can create an account**
  - Acceptance: User can sign up with email/password via Supabase Auth.
  - Acceptance: After sign up, user is redirected into the app.
  - Acceptance: A `profiles` row is created/available for the new user.

- **[Auth] [UI] User can sign in (email/password, magic link, Google)**
  - Acceptance: Email/password sign-in works.
  - Acceptance: Magic link sign-in works (email received + link completes sign-in).
  - Acceptance: Google OAuth sign-in works.
  - Acceptance: Authenticated routes are blocked when signed out.

- **[DB] Create core database tables (songs, ratings, follows, profiles)**
  - Acceptance: Tables exist in Supabase with appropriate primary keys.
  - Acceptance: `ratings` has `user_id`, `song_id`, `stars`, optional `review_text`, timestamps.
  - Acceptance: `follows` supports one-way follow (`follower_id`, `following_id`).

- **[DB] Enforce rating rules (1 rating per user per song, stars 1–5)**
  - Acceptance: DB constraint prevents duplicate `(user_id, song_id)` ratings.
  - Acceptance: Stars are restricted to values 1 through 5 (DB constraint and/or validation).
  - Acceptance: Updating a rating changes `updated_at`.

- **[DB] [Auth] Add RLS policies for profiles, ratings, follows**
  - Acceptance: Users can read profiles (at minimum for viewing friends).
  - Acceptance: Users can insert/update only their own ratings.
  - Acceptance: Users can follow/unfollow only as themselves (only modify rows where `follower_id = auth.uid()`).

- **[Songs] [UI] Song search page**
  - Acceptance: Search returns songs by title and/or artist.
  - Acceptance: Results show enough info to pick the right song (title + artist).
  - Acceptance: Selecting a result navigates to the song detail page.

- **[Songs] [DB] Add “create song” flow (Option A)**
  - Acceptance: User can add a new song (title + artist) when it doesn’t exist.
  - Acceptance: Duplicate prevention exists (basic: warn when title+artist already exists).
  - Acceptance: Newly created song appears in search results.

- **[Songs] [UI] Song detail page**
  - Acceptance: Displays song title and artist.
  - Acceptance: Displays the current user’s rating state for that song (if any).
  - Acceptance: From this page, user can rate/review the song.

- **[Ratings] [UI] Rate a song 1–5 stars**
  - Acceptance: User can set a star rating (1–5) for a song.
  - Acceptance: Rating persists in the database for that user and song.
  - Acceptance: Re-rating updates the existing rating (not a new duplicate row).

- **[Ratings] [UI] Write a short review with a rating**
  - Acceptance: Review text is optional.
  - Acceptance: Review text is saved with the rating.
  - Acceptance: Review text displays when viewing the user’s rating again.

- **[Feed] [Ratings] [UI] My listening history page (all ratings)**
  - Acceptance: Shows the user’s ratings ordered by most recently updated.
  - Acceptance: Each entry shows song + stars + review snippet (if present).
  - Acceptance: Clicking an entry opens the song detail page.

- **[Feed] [UI] Filter listening history by 4–5 star ratings**
  - Acceptance: User can toggle a filter to show only ratings with stars >= 4.
  - Acceptance: Filter does not change stored data; it only changes what is displayed.

- **[Social] [UI] View another user’s profile**
  - Acceptance: User can navigate to a friend/user profile (by username or user list).
  - Acceptance: Profile displays recent ratings (at least a short list).
  - Acceptance: Profile includes Follow/Unfollow button.

- **[Social] [DB] Follow a user (one-way)**
  - Acceptance: Clicking Follow creates a row in `follows`.
  - Acceptance: Clicking Unfollow removes that follow relationship.
  - Acceptance: A user cannot follow themselves.

- **[Social] [Feed] [UI] Friend “Top 5 songs” on profile**
  - Acceptance: Profile shows top 5 songs based on highest rating, breaking ties by most recently updated.
  - Acceptance: Each top song links to its song detail page.

- **[Feed] [Social] [UI] Following feed (activity = rating create/update)**
  - Acceptance: Feed shows ratings from users you follow.
  - Acceptance: Feed is sorted by rating `updated_at` (most recent first).
  - Acceptance: Entries show user + song + stars + review snippet.
