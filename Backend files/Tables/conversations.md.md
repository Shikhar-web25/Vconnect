
Purpose:
Replies to posts.

Columns:
- id (uuid, PK)
- post_id (uuid → posts.id)
- user_id (uuid → profiles.id)
- content (text)
- created_at (timestamp)

Rules (RLS):
- Read: all authenticated users
- Insert: authenticated users
- Update/Delete: only comment owner

Notes:
- ON DELETE CASCADE from posts