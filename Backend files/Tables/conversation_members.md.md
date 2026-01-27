
Purpose:
Defines who belongs to which conversation.

Columns:
- id (uuid, PK)
- conversation_id (uuid → conversations.id)
- user_id (uuid → profiles.id)
- role (text: admin | member)
- created_at (timestamp)

Constraints:
- UNIQUE (conversation_id, user_id)

Rules (RLS):
- Read: user can read own memberships
- Insert: user can add self (creator)
- Update/Delete: restricted (admin-only logic later)

Notes:
- Used for access control in messages