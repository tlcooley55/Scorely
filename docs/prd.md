# Scorely — Product Requirements Document (PRD)

## 1. Overview
Scorely is a social music rating platform for users to track and reflect on songs they listen to. Users can rate songs (1–5 stars), optionally write short reviews, follow other users, and view rating activity over time.

## 2. Goals
- Provide an easy way to rate songs and reflect on listening taste.
- Enable discovery through social connections (following), not algorithmic recommendations.
- Maintain a personal rating history and a friend activity feed.

## 3. Non-Goals (v1)
- Music playback/streaming
- Algorithmic recommendations
- Albums and artists as full entities (store artist name as text only if needed)
- Group features, DMs, comments/likes (unless required by class)

## 4. Target Users / Personas
- Casual music listener who wants a simple rating journal.
- Social listener who follows friends to find new music.

## 5. Key Use Cases
- Search for a song and open its detail page.
- Rate a song 1–5 stars.
- (Optional) Add or edit a short review.
- View personal rating history (sorted by recent activity).
- Follow another user and view their recent ratings in a feed.

## 6. Functional Requirements (MVP)
### Authentication & Profiles (Supabase Auth)
- Users can sign up / sign in using:
  - Email/password
  - Magic link email
  - Google login
- Users can view a profile page with username/display name.
- Users can sign out.

### Songs
- Users can search songs in the app database (Option A).
- Users can view song details (title, artist, aggregate rating optional).

### Ratings & Reviews
- Users can create or update a rating for a song (1–5).
- Each user can have at most one rating per song (updates overwrite previous rating).
- Users can optionally add/edit a short review with their rating.
- Rating updates count as activity (created_at / updated_at).

### Following (one-way)
- Users can follow/unfollow other users.
- Users can view:
  - who they follow
  - who follows them (optional for v1)

### Activity
- Users can view their own rating activity over time.
- Users can view a feed of rating activity from users they follow.
- Activity is derived from rating create/update events.

## 7. Data Model (v1)
- profiles (id = auth.users.id, username, display_name, avatar_url, created_at)
- songs (id, title, artist, created_at)
- ratings (id, user_id, song_id, stars, review_text, created_at, updated_at, unique(user_id, song_id))
- follows (follower_id, following_id, created_at, pk(follower_id, following_id))

## 8. Permissions / Security (Supabase + RLS)
- Users can edit only their own profile.
- Users can create/update/delete only their own ratings.
- Users can follow/unfollow as themselves only.
- Reading:
  - Songs: readable by all authenticated users (or public if desired).
  - Ratings: readable by authenticated users; feed is computed by joins.

## 9. UX Requirements (MVP)
- Simple navigation: Search, Activity, Profile, Friends
- Fast rating flow (minimal clicks)
- Mobile-friendly layout (responsive)

## 10. Success Metrics (Class / MVP)
- A new user can sign up and rate a song in under 2 minutes.
- Feed loads showing followed users’ latest rating updates.
- No unauthorized edits (RLS enforced).

## 11. Risks / Open Questions
- Do we allow users to create new songs if not found in search?
- Do we display public profiles or require login to view?
- How do we prevent duplicate/near-duplicate song entries (title/artist variations)?

## 12. Milestones
1) Supabase project setup + Auth providers configured
2) DB schema + RLS policies
3) Song search + song detail pages
4) Ratings/reviews create/update + personal history
5) Follow/unfollow + activity feed