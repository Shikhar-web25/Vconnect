-- Run this in Supabase SQL editor to unlock the latest Profile screen fields.
-- Safe to run multiple times.

alter table public.profiles
  add column if not exists skills text[] default '{}'::text[],
  add column if not exists social_links text[] default '{}'::text[],
  add column if not exists resume_url text,
  add column if not exists resume_file_name text;

-- Optional but recommended for private Cloudinary resume delivery support.
alter table public.profiles
  add column if not exists resume_public_id text,
  add column if not exists resume_format text,
  add column if not exists resume_resource_type text,
  add column if not exists resume_delivery_type text;

