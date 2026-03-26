-- Run in Supabase SQL editor.
-- Enables native tag storage for Discover posts.

alter table public.posts
  add column if not exists tags text[] default '{}'::text[];

create index if not exists idx_posts_created_at_desc
  on public.posts (created_at desc);

