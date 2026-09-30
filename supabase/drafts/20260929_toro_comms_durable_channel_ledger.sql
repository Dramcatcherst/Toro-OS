-- REVIEW DRAFT ONLY: do not apply until the existing OpenClaw adapter, owner
-- binding, backup and retention policy have been inspected. No connector is
-- activated by this migration.
-- Reuses the live integrations.communication_channel_bindings, _sessions and
-- _receipts tables. This is content/structured-record storage, not a second
-- session, identity, idempotency or task system.

-- The composite FK prevents a content row from referring to a receipt from
-- a different session. The existing receipts.id primary key makes this safe.
create unique index if not exists communication_channel_receipts_id_session_idx
  on integrations.communication_channel_receipts (id, session_id);
create unique index if not exists communication_channel_sessions_id_org_idx
  on integrations.communication_channel_sessions (id, org_id);

create table if not exists integrations.communication_channel_content (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete restrict,
  session_id uuid not null,
  source_receipt_id uuid not null,
  kind text not null check (kind in
    ('message','guest_list','maintenance_note','receipt','closing','news')),
  record_key text not null check (length(record_key) between 4 and 180),
  title text null check (title is null or length(title) between 1 and 180),
  content_text text null check (content_text is null or length(content_text) <= 10000),
  media_kind text not null default 'none' check (media_kind in
    ('none','image','audio','document')),
  extraction_state text not null default 'none' check (extraction_state in
    ('none','pending','needs_review','verified','failed')),
  evidence_refs text[] not null default '{}',
  status text not null default 'needs_review' check (status in
    ('needs_review','verified','superseded','closed')),
  version int not null default 1 check (version > 0),
  supersedes_id uuid null references integrations.communication_channel_content(id) on delete restrict,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (source_receipt_id, session_id)
    references integrations.communication_channel_receipts(id, session_id) on delete restrict,
  foreign key (session_id, org_id)
    references integrations.communication_channel_sessions(id, org_id) on delete restrict,
  unique (session_id, kind, record_key, version),
  unique (session_id, source_receipt_id, kind),
  check (cardinality(evidence_refs) <= 20),
  check (media_kind = 'none' or evidence_refs <> '{}'),
  check (kind = 'message' or (title is not null and content_text is not null))
);

create index if not exists communication_channel_content_history_idx
  on integrations.communication_channel_content (session_id, occurred_at desc, id desc);
create index if not exists communication_channel_content_text_idx
  on integrations.communication_channel_content
  using gin (to_tsvector('simple', coalesce(content_text, '')));
create index if not exists communication_channel_content_record_idx
  on integrations.communication_channel_content
  (session_id, kind, record_key, version desc);

alter table integrations.communication_channel_content enable row level security;
revoke all on integrations.communication_channel_content from public, anon, authenticated;
grant select, insert, update on integrations.communication_channel_content to service_role;
-- No anon/authenticated policy or broad search RPC. TORO server must resolve
-- the current verified channel identity and membership, then constrain the
-- session by binding, org and actor before any history/date/text read.
-- Raw transport IDs, passwords, media bytes and credential-bearing URLs are
-- forbidden in these columns. Retention and deletion require reviewed policy.
