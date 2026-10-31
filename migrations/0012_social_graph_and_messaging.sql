-- Durable social graph and participant-based messaging foundation.
-- Existing demo conversations/messages are intentionally left untouched; the
-- application must migrate callers before switching reads/writes to these tables.

create table if not exists social_connections (
  id text primary key,
  requester_id text not null,
  addressee_id text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint social_connections_not_self check (requester_id <> addressee_id)
);
create unique index if not exists social_connections_pair_unique
  on social_connections (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists social_connections_incoming_idx
  on social_connections (addressee_id, status, created_at desc);
create index if not exists social_connections_outgoing_idx
  on social_connections (requester_id, status, created_at desc);

create table if not exists social_blocks (
  blocker_id text not null,
  blocked_id text not null,
  reason text not null default '',
  created_at timestamptz not null default now(),
  constraint social_blocks_pk primary key (blocker_id, blocked_id),
  constraint social_blocks_not_self check (blocker_id <> blocked_id)
);
create index if not exists social_blocks_reverse_idx
  on social_blocks (blocked_id, blocker_id);

create table if not exists social_conversations (
  id text primary key,
  kind text not null default 'direct' check (kind in ('direct', 'group')),
  created_by text not null,
  title text,
  last_message_id text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists social_conversations_updated_idx
  on social_conversations (updated_at desc);

create table if not exists social_conversation_members (
  conversation_id text not null references social_conversations(id) on delete cascade,
  user_id text not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  last_read_at timestamptz,
  muted_until timestamptz,
  primary key (conversation_id, user_id)
);
create index if not exists social_conversation_members_user_idx
  on social_conversation_members (user_id, joined_at desc)
  where left_at is null;

create table if not exists social_messages (
  id text primary key,
  conversation_id text not null references social_conversations(id) on delete cascade,
  sender_id text not null,
  body text not null default '',
  media_id text,
  share_kind text,
  share_json text,
  client_message_id text,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint social_messages_content check (
    length(btrim(body)) > 0 or media_id is not null or share_json is not null
  )
);
create index if not exists social_messages_conversation_idx
  on social_messages (conversation_id, created_at asc, id asc);
create unique index if not exists social_messages_idempotency_idx
  on social_messages (sender_id, client_message_id)
  where client_message_id is not null;

create table if not exists social_message_receipts (
  message_id text not null references social_messages(id) on delete cascade,
  user_id text not null,
  delivered_at timestamptz,
  read_at timestamptz,
  primary key (message_id, user_id)
);
create index if not exists social_message_receipts_unread_idx
  on social_message_receipts (user_id, delivered_at)
  where read_at is null;

create table if not exists social_reports (
  id text primary key,
  reporter_id text not null,
  reported_user_id text,
  conversation_id text references social_conversations(id) on delete set null,
  message_id text references social_messages(id) on delete set null,
  reason text not null,
  details text not null default '',
  status text not null default 'open'
    check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint social_reports_target check (
    reported_user_id is not null or message_id is not null or conversation_id is not null
  )
);
create index if not exists social_reports_queue_idx
  on social_reports (status, created_at asc);

-- Presence is ephemeral in meaning but persisted with expiry so stale sessions
-- cannot leave a user appearing online forever.
create table if not exists social_presence (
  user_id text primary key,
  state text not null default 'offline' check (state in ('online', 'away', 'offline')),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null default now()
);
create index if not exists social_presence_expiry_idx on social_presence (expires_at);
