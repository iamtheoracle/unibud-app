-- Production domains added during UNIBUD reconciliation.
-- All user-owned records are scoped by user_id. No seed/demo rows are inserted.

create table if not exists p2p_orders (
  id text primary key,
  buyer_user_id text not null,
  seller_user_id text,
  listing_id text not null,
  status text not null default 'pending',
  amount_kobo integer not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists p2p_orders_buyer_idx on p2p_orders (buyer_user_id, created_at desc);
create index if not exists p2p_orders_seller_idx on p2p_orders (seller_user_id, created_at desc);
create index if not exists p2p_orders_listing_idx on p2p_orders (listing_id, created_at desc);

create table if not exists marketing_campaigns (
  id text primary key,
  owner_user_id text not null,
  name text not null,
  objective text not null default '',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists marketing_campaigns_owner_idx on marketing_campaigns (owner_user_id, updated_at desc);

create table if not exists marketing_events (
  id text primary key,
  campaign_id text,
  owner_user_id text not null,
  event_type text not null,
  entity_id text,
  metadata text not null default '{}',
  occurred_at timestamptz not null default now()
);
create index if not exists marketing_events_owner_idx on marketing_events (owner_user_id, occurred_at desc);
create index if not exists marketing_events_campaign_idx on marketing_events (campaign_id, occurred_at desc);

create table if not exists tracking_items (
  id text primary key,
  user_id text not null,
  kind text not null,
  title text not null,
  status text not null default 'open',
  target_id text,
  metadata text not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tracking_items_user_idx on tracking_items (user_id, updated_at desc);

create table if not exists tracking_events (
  id text primary key,
  user_id text not null,
  tracking_item_id text,
  event_type text not null,
  status text,
  note text not null default '',
  metadata text not null default '{}',
  occurred_at timestamptz not null default now()
);
create index if not exists tracking_events_user_idx on tracking_events (user_id, occurred_at desc);
create index if not exists tracking_events_item_idx on tracking_events (tracking_item_id, occurred_at desc);

create table if not exists goals (
  id text primary key,
  user_id text not null,
  scope text not null default 'academic',
  title text not null,
  target_value numeric,
  current_value numeric not null default 0,
  status text not null default 'active',
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists goals_user_idx on goals (user_id, updated_at desc);

create table if not exists history_events (
  id text primary key,
  user_id text not null,
  event_type text not null,
  action text not null,
  entity_id text,
  metadata text not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists history_events_user_idx on history_events (user_id, created_at desc);

create table if not exists data_export_jobs (
  id text primary key,
  user_id text not null,
  status text not null default 'requested',
  format text not null default 'json',
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  file_ref text
);
create index if not exists data_export_jobs_user_idx on data_export_jobs (user_id, requested_at desc);


create table if not exists user_reports (
  id text primary key,
  user_id text not null,
  kind text not null,
  body text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_reports_user_idx on user_reports(user_id, created_at desc);
