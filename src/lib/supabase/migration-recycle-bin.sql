-- Recycle bin: soft-delete snapshots so deleted items can be restored or purged
-- Run in Supabase SQL editor.

create table if not exists deleted_items (
  id           uuid primary key default gen_random_uuid(),
  entity_type  text not null,        -- table name, e.g. 'bookings'
  entity_id    uuid not null,        -- original row id
  label        text,                 -- human label for the bin
  data         jsonb not null,       -- full row snapshot for restore
  deleted_by   uuid references profiles(id),
  deleted_at   timestamptz not null default now()
);

create index if not exists idx_deleted_items_deleted_at on deleted_items(deleted_at desc);
create index if not exists idx_deleted_items_entity on deleted_items(entity_type, entity_id);

alter table deleted_items enable row level security;

drop policy if exists "Staff read deleted_items" on deleted_items;
create policy "Staff read deleted_items" on deleted_items
  for select to authenticated using (true);

drop policy if exists "Service role deleted_items" on deleted_items;
create policy "Service role deleted_items" on deleted_items
  for all to service_role using (true) with check (true);
