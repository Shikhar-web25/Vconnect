

Purpose:
Internships, hackathons, events, knowledge posts.

Columns:
- id (uuid, PK)
- title (text)
- description (text)
- category (text)
- link (text, nullable)
- created_by (uuid → profiles.id)
- created_at (timestamp)

Rules (RLS):
- Read: all authenticated users
- Insert: authenticated users
- Update/Delete: only creator

Notes:
- No realtime needed