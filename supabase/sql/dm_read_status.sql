-- Run in Supabase SQL editor.
-- Adds read receipts support for DM messages.

alter table public.messages
  add column if not exists read_status boolean not null default false;

create index if not exists idx_messages_receiver_read_status_created_at
  on public.messages (receiver_id, read_status, created_at desc);

-- Allow receivers to mark their own incoming messages as read.
alter table public.messages enable row level security;

drop policy if exists "Messages: receiver can mark as read" on public.messages;
create policy "Messages: receiver can mark as read"
  on public.messages
  for update
  to authenticated
  using (receiver_id = auth.uid())
  with check (receiver_id = auth.uid());

