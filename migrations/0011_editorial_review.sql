create table if not exists editorial_reviewers (
  user_id text primary key,
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists story_candidates (
  id text primary key,
  submitted_by text not null,
  title text not null,
  summary text not null default '',
  publisher text not null,
  author text,
  source_url text not null,
  published_at timestamptz,
  retrieved_at timestamptz not null default now(),
  category text not null default 'campus',
  country_code text,
  institution text,
  evidence jsonb not null default '[]'::jsonb,
  media jsonb,
  editorial_status text not null default 'pending'
    check (editorial_status in ('pending','changes_requested','approved','rejected','withdrawn')),
  freshness_expires_at timestamptz,
  reviewed_by text,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists story_candidates_queue_idx
  on story_candidates (editorial_status, created_at desc);
create index if not exists story_candidates_source_idx
  on story_candidates (source_url);
create index if not exists story_candidates_expiry_idx
  on story_candidates (freshness_expires_at);

create table if not exists story_review_events (
  id text primary key,
  candidate_id text not null references story_candidates(id),
  reviewer_id text not null,
  action text not null check (action in ('approved','rejected','changes_requested','withdrawn')),
  note text not null default '',
  checks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists story_review_events_candidate_idx
  on story_review_events (candidate_id, created_at asc);
