
Purpose:
Stores chat messages (DM & group).

Columns:
- id (uuid, PK)
- conversation_id (uuid → conversations.id)
- sender_id (uuid → profiles.id)
- content (text)
- created_at (timestamp)
- is_deleted (boolean, default false)

Realtime:
- ENABLED

Rules (RLS):
- Read: only members of the conversation
- Insert: sender must be a member
- Delete: sender can delete own messages

Indexes:
- (conversation_id, created_at)

Notes:
- Main realtime table