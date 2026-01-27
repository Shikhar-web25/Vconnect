
Purpose:
Doubt / discussion posts (Reddit-style feed).

Columns:
- id (uuid, PK)
- user_id (uuid → profiles.id)
- content (text)
- created_at (timestamp)

Rules (RLS):
- Read: all authenticated users
- Insert: authenticated users
- Update/Delete: only post owner

Relations:
- One post → many comments