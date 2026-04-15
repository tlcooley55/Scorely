
-- Prototype 2 schema template
-- Replace this file with your Analyst-provided schema.
-- Example shown for 'assignments' table used by the starter API.
-- You may delete/replace as needed.

create table if not exists public.assignments (
  id bigserial primary key,
  title text not null,
  dueDate timestamptz
);

-- Add your real tables, FKs, and constraints here.
