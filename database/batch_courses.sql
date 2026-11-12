-- Run in the existing Supabase project's SQL editor before enabling live admin edits.
create table if not exists public.batch_courses (
 id text primary key check (id ~ '^[a-z0-9-]+$'),
 category text not null check (category in ('ielts','pte')),
 status text not null default 'hidden' check (status in ('open','full','hidden')),
 details jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.batch_courses enable row level security;
-- Public metadata can be read; public UI suppresses hidden batches. Never store secrets in details.
create policy "Public active batch read" on public.batch_courses for select to anon, authenticated using (true);
create policy "Admin batch insert" on public.batch_courses for insert to authenticated with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','super_admin')));
create policy "Admin batch update" on public.batch_courses for update to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','super_admin'))) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','super_admin')));
create policy "Admin batch delete" on public.batch_courses for delete to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','super_admin')));
-- Seed data from data/batch-courses.json using the admin interface after migration.
