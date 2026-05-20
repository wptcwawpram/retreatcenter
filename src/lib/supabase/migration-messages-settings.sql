-- ============================================================
-- MIGRATION: Add messages + settings tables
-- Run this in Supabase SQL Editor if you already ran schema.sql
-- ============================================================

-- ── Messages (SMS log) ────────────────────────────────────
create table if not exists messages (
  id             uuid primary key default uuid_generate_v4(),
  to_phone       text not null,
  recipient_name text,
  channel        text not null default 'SMS',
  subject        text,
  body           text not null,
  status         text not null default 'SENT' check (status in ('SENT','FAILED','PENDING')),
  error          text,
  sent_by        uuid references profiles(id),
  created_at     timestamptz not null default now()
);

-- ── Settings (key-value store) ────────────────────────────
create table if not exists settings (
  key        text primary key,
  value      text not null,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────
create index if not exists idx_messages_sent_by on messages(sent_by);
create index if not exists idx_messages_created on messages(created_at);

-- ── RLS ───────────────────────────────────────────────────
alter table messages enable row level security;
alter table settings enable row level security;

drop policy if exists "Staff can read messages" on messages;
create policy "Staff can read messages"
  on messages for select to authenticated using (true);

drop policy if exists "Staff can send messages" on messages;
create policy "Staff can send messages"
  on messages for insert to authenticated with check (true);

drop policy if exists "Staff can read settings" on settings;
create policy "Staff can read settings"
  on settings for select to authenticated using (true);

drop policy if exists "Admins can manage settings" on settings;
create policy "Admins can manage settings"
  on settings for all to authenticated
  using (auth_user_role() in ('admin', 'manager'));

-- ── Service role bypass (needed for API routes) ───────────
drop policy if exists "Service role bypass messages" on messages;
create policy "Service role bypass messages"
  on messages for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role bypass settings" on settings;
create policy "Service role bypass settings"
  on settings for all
  to service_role
  using (true)
  with check (true);
