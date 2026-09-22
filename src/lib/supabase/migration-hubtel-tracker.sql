-- Hubtel balance tracker (manual): a ledger of top-ups + SMS usage so the
-- superadmin always sees the estimated remaining Hubtel wallet balance.
-- Run in Supabase SQL editor. Balance/config live in the settings table.

create table if not exists hubtel_ledger (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('TOPUP','USAGE','ADJUSTMENT')),
  amount        numeric(12,4) not null,       -- GHS, +topup / -usage
  segments      int,                          -- SMS segments (usage)
  source        text,                         -- which project reported it
  description   text,
  balance_after numeric(12,4) not null default 0,
  created_by    uuid references profiles(id),
  created_at    timestamptz not null default now()
);

create index if not exists idx_hubtel_ledger_created on hubtel_ledger(created_at desc);

alter table hubtel_ledger enable row level security;

drop policy if exists "Service role hubtel_ledger" on hubtel_ledger;
create policy "Service role hubtel_ledger" on hubtel_ledger
  for all to service_role using (true) with check (true);
