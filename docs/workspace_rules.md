# Scorely Workspace Rules

## 1) Project Structure
- Use `src/` for application code.
- Put reusable UI in `src/components/`.
- Put feature-specific code in `src/features/<feature>/`.
- Keep Supabase-related utilities in `src/lib/supabase/`.
- Keep documentation in `docs/`.
- Keep Supabase SQL/migrations in `supabase/`.

## 2) Environment Variables / Secrets
- Never commit [.env.local](cci:7://file:///c:/Users/temil/OneDrive/Documents/CSUCHICO%20Info/Spring%202026/MINS%20350/Coding/Scorely/.env.local:0:0-0:0).
- Commit [.env.example](cci:7://file:///c:/Users/temil/OneDrive/Documents/CSUCHICO%20Info/Spring%202026/MINS%20350/Coding/Scorely/.env.example:0:0-0:0) only (keys empty).
- `SUPABASE_SERVICE_ROLE_KEY` is server-only:
  - Do not use it in browser/client code.
  - Only import it in server code (server routes / server utilities).

## 3) Project Management (Trello Required)
- All work must be tracked in Trello before implementation begins.
- Each code change should map to a Trello card.
- Trello card title format:
  - `[Feature] Short description` (ex: `[Auth] Add Google login`)
- Trello card description must include:
  - Goal (1-2 sentences)
  - Acceptance Criteria (checklist)
  - Any DB changes (tables/columns/policies)
- Trello board columns (minimum):
  - Backlog
  - Ready
  - In Progress
  - Review / QA
  - Done
- Movement rules:
  - A card moves to **Ready** only when requirements/acceptance criteria are clear.
  - A card moves to **In Progress** only when a branch is created for it.
  - A card moves to **Review / QA** when the feature is implemented and ready to test.
  - A card moves to **Done** only when it meets the Definition of Done.
- Branch naming should reference the Trello card:
  - `feature/<trello-card-slug>` or `fix/<trello-card-slug>`

## 4) Supabase Rules (Security First)
- RLS (Row Level Security) must be enabled on user data tables.
- Users can only edit:
  - their own profile
  - their own ratings
  - their own follow relationships (as follower)
- If a table contains user-generated data, it must have an RLS policy before the feature is considered “done”.

## 5) Database Changes
- Prefer migrations over manual dashboard edits when possible.
- If changes are made in the dashboard for class reasons, replicate them in `supabase/` as SQL for version control.
- Keep schema consistent with the PRD:
  - `songs`, `profiles`, `ratings`, `follows`

## 6) Coding Conventions (TypeScript / Next.js)
- Use TypeScript for all new code.
- Prefer feature-based organization over “giant utils”.
- Keep data access in small functions (one responsibility per function).
- Validate user input before writing to the DB.

## 7) Git Workflow
- Work in small branches:
  - `feature/<name>` (ex: `feature/song-search`)
  - `fix/<name>` (ex: `fix/login-redirect`)
- Commit messages:
  - `feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`

## 8) Definition of Done (for any feature)
A feature is “done” only when:
- UI works as expected
- DB table/queries exist (if needed)
- RLS policies exist (if needed)
- No secrets committed
- Basic happy-path test is performed manually (documented if required)
- Trello card acceptance criteria are checked off

## 9) MVP Feature Priorities (Scorely)
1. Auth (email/password, magic link, Google)
2. Songs CRUD + search
3. Ratings (1–5) + optional review text
4. Follow/unfollow
5. Activity feed (rating create/update ordered by updated_at)