-- SMS credits: purchases (paid to owner's Paystack) + usage ledger + audit
-- Run in Supabase SQL editor.

create table if not exists sms_credit_transactions (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('PURCHASE','USAGE','ADJUSTMENT')),
  credits       numeric(12,2) not null,          -- +purchase, -usage
  balance_after numeric(12,2) not null default 0,
  description   text,
  reference     text,                            -- paystack ref (purchases) or message ref
  amount_paid   numeric(12,2),                   -- GHS paid (purchases)
  recipient     text,                            -- phone (usage)
  message_id    uuid,
  created_by    uuid references profiles(id),
  created_at    timestamptz not null default now()
);

create index if not exists idx_sms_credit_tx_created on sms_credit_transactions(created_at desc);
create index if not exists idx_sms_credit_tx_type on sms_credit_transactions(type);

alter table sms_credit_transactions enable row level security;

drop policy if exists "Staff read sms credits" on sms_credit_transactions;
create policy "Staff read sms credits" on sms_credit_transactions
  for select to authenticated using (true);

drop policy if exists "Service role sms credits" on sms_credit_transactions;
create policy "Service role sms credits" on sms_credit_transactions
  for all to service_role using (true) with check (true);
