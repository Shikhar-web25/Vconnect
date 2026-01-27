

Backend is implemented using **Supabase**.

Features covered:
- Authentication (Supabase Auth)
- User profiles
- Reddit-style posts & comments
- 1-to-1 and group chat with realtime messages
- Opportunities / knowledge section
- Row Level Security (RLS) on all tables

Frontend connects directly to Supabase using:
- Project URL
- Anon public API key

No separate backend server is used.

## Authentication
- Supabase Auth
- auth.users table
- profiles.id = auth.users.id (1:1 mapping)

## Realtime
- Enabled only for `messages` table