-- Run this in Supabase SQL Editor.
-- Performance indexes + lightweight error-monitoring table.

create index if not exists idx_posts_user_created_at
  on public.posts (user_id, created_at desc);

create index if not exists idx_comments_user_created_at
  on public.comments (user_id, created_at desc);

create index if not exists idx_messages_sender_receiver_created_at
  on public.messages (sender_id, receiver_id, created_at desc);

create index if not exists idx_messages_receiver_created_at
  on public.messages (receiver_id, created_at desc);

create table if not exists public.client_errors (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  message text not null,
  stack text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.client_errors enable row level security;

drop policy if exists "Client errors insert own" on public.client_errors;
create policy "Client errors insert own"
  on public.client_errors
  for insert
  to authenticated
  with check (true);

drop policy if exists "Client errors read admin only" on public.client_errors;
create policy "Client errors read admin only"
  on public.client_errors
  for select
  to authenticated
  using (false);
