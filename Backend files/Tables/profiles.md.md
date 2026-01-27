

Purpose:
Stores public user information.

Columns:
- id (uuid, PK) → auth.users.id
- username (text)
- bio (text)
- avatar_url (text)
- created_at (timestamp)

Rules (RLS):
- Read: all authenticated users
- Insert: user can create own profile
- Update: user can update only own profile
- Delete: disabled / restricted

Notes:
- profiles is linked 1:1 with auth.users