
-- Seed data for local dev (replace with realistic values for your domain)
insert into public.assignments (title, dueDate) values
  ('Read syllabus', now() + interval '7 days'),
  ('Prototype 2', now() + interval '14 days')
on conflict do nothing;
