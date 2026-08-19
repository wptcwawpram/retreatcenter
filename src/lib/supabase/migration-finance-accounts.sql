-- Finance system overhaul: accounts, categories, transfers
-- Run in Supabase SQL editor

-- ── Financial Accounts (bank, momo, cash, etc.) ──────────
create table if not exists finance_accounts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('BANK','MOMO','CASH','PETTY_CASH','OTHER')),
  provider    text,
  account_number text,
  balance     numeric(12,2) not null default 0,
  currency    text not null default 'GHS',
  is_default  boolean not null default false,
  is_active   boolean not null default true,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Income Categories ────────────────────────────────────
create table if not exists finance_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('INCOME','EXPENSE')),
  icon        text,
  color       text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ── Add account_id to finance_records ────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finance_records' AND column_name = 'account_id') THEN
    ALTER TABLE finance_records ADD COLUMN account_id uuid REFERENCES finance_accounts(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finance_records' AND column_name = 'category_id') THEN
    ALTER TABLE finance_records ADD COLUMN category_id uuid REFERENCES finance_categories(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finance_records' AND column_name = 'reference') THEN
    ALTER TABLE finance_records ADD COLUMN reference text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finance_records' AND column_name = 'payment_method') THEN
    ALTER TABLE finance_records ADD COLUMN payment_method text;
  END IF;
END $$;

-- ── Account Transfers ────────────────────────────────────
create table if not exists finance_transfers (
  id              uuid primary key default gen_random_uuid(),
  from_account_id uuid not null references finance_accounts(id),
  to_account_id   uuid not null references finance_accounts(id),
  amount          numeric(12,2) not null,
  description     text,
  reference       text,
  transferred_by  uuid references profiles(id),
  created_at      timestamptz not null default now()
);

-- ── Fix existing finance_records RLS to include super_admin ──
drop policy if exists "Admins and managers can read finance" on finance_records;
create policy "Admins and managers can read finance"
  on finance_records for select to authenticated
  using (auth_user_role() in ('admin','super_admin','manager','accountant'));

drop policy if exists "Admins and managers can manage finance" on finance_records;
create policy "Admins and managers can manage finance"
  on finance_records for all to authenticated
  using (auth_user_role() in ('admin','super_admin','manager','accountant'));

-- ── RLS ──────────────────────────────────────────────────
alter table finance_accounts enable row level security;
alter table finance_categories enable row level security;
alter table finance_transfers enable row level security;

-- accounts
drop policy if exists "Admins can read finance accounts" on finance_accounts;
create policy "Admins can read finance accounts"
  on finance_accounts for select to authenticated
  using (auth_user_role() in ('admin','super_admin','manager','accountant'));

drop policy if exists "Admins can manage finance accounts" on finance_accounts;
create policy "Admins can manage finance accounts"
  on finance_accounts for all to authenticated
  using (auth_user_role() in ('admin','super_admin','manager','accountant'));

-- categories
drop policy if exists "Staff can read finance categories" on finance_categories;
create policy "Staff can read finance categories"
  on finance_categories for select to authenticated
  using (true);

drop policy if exists "Admins can manage finance categories" on finance_categories;
create policy "Admins can manage finance categories"
  on finance_categories for all to authenticated
  using (auth_user_role() in ('admin','super_admin','manager'));

-- transfers
drop policy if exists "Admins can read finance transfers" on finance_transfers;
create policy "Admins can read finance transfers"
  on finance_transfers for select to authenticated
  using (auth_user_role() in ('admin','super_admin','manager','accountant'));

drop policy if exists "Admins can manage finance transfers" on finance_transfers;
create policy "Admins can manage finance transfers"
  on finance_transfers for all to authenticated
  using (auth_user_role() in ('admin','super_admin','manager','accountant'));

-- ── Indexes ──────────────────────────────────────────────
create index if not exists idx_finance_accounts_type on finance_accounts(type);
create index if not exists idx_finance_categories_type on finance_categories(type);
create index if not exists idx_finance_records_account on finance_records(account_id);
create index if not exists idx_finance_transfers_from on finance_transfers(from_account_id);
create index if not exists idx_finance_transfers_to on finance_transfers(to_account_id);

-- ── Unique constraint to prevent duplicate categories ────
CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_categories_name_type ON finance_categories(name, type);

-- ── Seed default categories ─────────────────────────────
INSERT INTO finance_categories (name, type, sort_order) VALUES
  ('Room Booking', 'INCOME', 1),
  ('Hall Rental', 'INCOME', 2),
  ('Event Hosting', 'INCOME', 3),
  ('Kitchen Rental', 'INCOME', 4),
  ('Grounds Rental', 'INCOME', 5),
  ('Dining & Catering', 'INCOME', 6),
  ('Donations', 'INCOME', 7),
  ('Other Income', 'INCOME', 99),
  ('Salaries & Wages', 'EXPENSE', 1),
  ('Utilities (Water/Electricity)', 'EXPENSE', 2),
  ('Maintenance & Repairs', 'EXPENSE', 3),
  ('Supplies & Consumables', 'EXPENSE', 4),
  ('Equipment', 'EXPENSE', 5),
  ('Food & Catering', 'EXPENSE', 6),
  ('Transport', 'EXPENSE', 7),
  ('Marketing & Advertising', 'EXPENSE', 8),
  ('Insurance', 'EXPENSE', 9),
  ('Cleaning Supplies', 'EXPENSE', 10),
  ('Office Expenses', 'EXPENSE', 11),
  ('Other Expense', 'EXPENSE', 99)
ON CONFLICT DO NOTHING;

-- ── Seed default accounts ────────────────────────────────
INSERT INTO finance_accounts (name, type, provider, is_default) VALUES
  ('Main Cash', 'CASH', NULL, true)
ON CONFLICT DO NOTHING;
