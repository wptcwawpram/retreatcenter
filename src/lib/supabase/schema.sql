-- ============================================================
-- WPTC Retreat Centre — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up the database.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Helper: auto-update updated_at ─────────────────────────
create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── Helper: generate booking reference ─────────────────────
-- Format: WPT-YYYYMMDD-NNN (e.g. WPT-20260518-001)
create or replace function generate_booking_reference()
returns trigger as $$
declare
  today_str text;
  seq int;
begin
  today_str := to_char(now(), 'YYYYMMDD');
  select count(*) + 1 into seq
    from bookings
    where reference like 'WPT-' || today_str || '-%';
  new.reference := 'WPT-' || today_str || '-' || lpad(seq::text, 3, '0');
  return new;
end;
$$ language plpgsql;


-- ════════════════════════════════════════════════════════════
-- TABLES
-- ════════════════════════════════════════════════════════════

-- ── Profiles (extends auth.users) ──────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null,
  role        text not null default 'receptionist'
              check (role in ('admin', 'receptionist', 'housekeeping', 'manager')),
  phone       text,
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function trigger_set_updated_at();

-- ── Rooms ──────────────────────────────────────────────────
create table if not exists rooms (
  id              uuid primary key default uuid_generate_v4(),
  number          text not null unique,
  name            text not null,
  type            text not null
                  check (type in ('2_IN_1','4_IN_1','6_IN_1','SUITE_FAN','SUITE_AC','APARTMENT','3_IN_1','KITCHEN')),
  building        text not null default 'Main',
  floor           int not null default 0,
  capacity        int not null default 2,
  beds            int not null default 1,
  price_per_night numeric(10,2) not null default 0,
  status          text not null default 'AVAILABLE'
                  check (status in ('AVAILABLE','OCCUPIED','MAINTENANCE','CLEANING','RESERVED','BLOCKED','DIRTY','AWAITING_INSPECTION')),
  amenities       text[] not null default '{}',
  has_ac          boolean not null default false,
  has_tv          boolean not null default false,
  has_fridge      boolean not null default false,
  description     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists rooms_updated_at on rooms;
create trigger rooms_updated_at
  before update on rooms
  for each row execute function trigger_set_updated_at();

-- ── Venues / Halls ─────────────────────────────────────────
create table if not exists venues (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  description     text,
  capacity        int not null default 0,
  price_per_day   numeric(10,2) not null default 0,
  amenities       text[] not null default '{}',
  is_available    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists venues_updated_at on venues;
create trigger venues_updated_at
  before update on venues
  for each row execute function trigger_set_updated_at();

-- ── Guests ─────────────────────────────────────────────────
create table if not exists guests (
  id          uuid primary key default uuid_generate_v4(),
  full_name   text not null,
  email       text,
  phone       text not null,
  id_type     text,
  id_number   text,
  address     text,
  nationality text not null default 'Ghanaian',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists guests_updated_at on guests;
create trigger guests_updated_at
  before update on guests
  for each row execute function trigger_set_updated_at();

-- ── Bookings ───────────────────────────────────────────────
create table if not exists bookings (
  id               uuid primary key default uuid_generate_v4(),
  reference        text not null unique,
  guest_id         uuid not null references guests(id) on delete restrict,
  room_ids         uuid[] not null default '{}',
  check_in         date not null,
  check_out        date not null,
  nights           int not null default 1,
  adults           int not null default 1,
  children         int not null default 0,
  total_amount     numeric(10,2) not null default 0,
  paid_amount      numeric(10,2) not null default 0,
  balance          numeric(10,2) not null default 0,
  status           text not null default 'PENDING'
                   check (status in ('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','NO_SHOW')),
  booking_type     text not null default 'INDIVIDUAL'
                   check (booking_type in ('INDIVIDUAL','GROUP','EVENT')),
  special_requests text,
  hall_id          uuid references venues(id),
  hall_days        int not null default 0,
  hall_amount      numeric(10,2) not null default 0,
  payment_status   text not null default 'UNPAID'
                   check (payment_status in ('UNPAID','PARTIAL','PAID','REFUNDED')),
  source           text not null default 'WALK_IN'
                   check (source in ('WEBSITE','WALK_IN','PHONE','AGENT')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

drop trigger if exists bookings_updated_at on bookings;
create trigger bookings_updated_at
  before update on bookings
  for each row execute function trigger_set_updated_at();

drop trigger if exists bookings_generate_reference on bookings;
create trigger bookings_generate_reference
  before insert on bookings
  for each row execute function generate_booking_reference();

-- ── Payments ───────────────────────────────────────────────
create table if not exists payments (
  id                  uuid primary key default uuid_generate_v4(),
  booking_id          uuid not null references bookings(id) on delete cascade,
  amount              numeric(10,2) not null,
  method              text not null
                      check (method in ('CASH','MOBILE_MONEY','CARD','BANK_TRANSFER','PAYSTACK')),
  status              text not null default 'PENDING'
                      check (status in ('PENDING','COMPLETED','FAILED','REFUNDED')),
  reference           text not null default '',
  paystack_reference  text,
  notes               text,
  recorded_by         uuid references profiles(id),
  created_at          timestamptz not null default now()
);

-- ── Housekeeping Tasks ─────────────────────────────────────
create table if not exists housekeeping_tasks (
  id            uuid primary key default uuid_generate_v4(),
  room_id       uuid not null references rooms(id) on delete cascade,
  assigned_to   uuid references profiles(id),
  type          text not null default 'CLEANING'
                check (type in ('CLEANING','DEEP_CLEAN','MAINTENANCE','INSPECTION')),
  priority      text not null default 'NORMAL'
                check (priority in ('LOW','NORMAL','HIGH','URGENT')),
  status        text not null default 'PENDING'
                check (status in ('PENDING','IN_PROGRESS','COMPLETED')),
  notes         text,
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- ── Complaints ─────────────────────────────────────────────
create table if not exists complaints (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid references bookings(id),
  guest_id    uuid references guests(id),
  room_id     uuid references rooms(id),
  category    text not null
              check (category in ('NOISE','CLEANLINESS','MAINTENANCE','SERVICE','FOOD','OTHER')),
  subject     text not null,
  description text not null,
  status      text not null default 'OPEN'
              check (status in ('OPEN','IN_PROGRESS','RESOLVED','CLOSED')),
  priority    text not null default 'NORMAL'
              check (priority in ('LOW','NORMAL','HIGH')),
  resolved_by uuid references profiles(id),
  resolution  text,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

-- ── Inventory ──────────────────────────────────────────────
create table if not exists inventory_items (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  category        text not null,
  quantity        int not null default 0,
  min_quantity    int not null default 0,
  unit            text not null default 'pcs',
  cost_per_unit   numeric(10,2) not null default 0,
  supplier        text,
  last_restocked  timestamptz,
  created_at      timestamptz not null default now()
);

-- ── Events ─────────────────────────────────────────────────
create table if not exists events (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  organizer   text not null,
  venue_id    uuid references venues(id),
  start_date  date not null,
  end_date    date not null,
  attendees   int not null default 0,
  amount      numeric(10,2) not null default 0,
  status      text not null default 'UPCOMING'
              check (status in ('UPCOMING','IN_PROGRESS','COMPLETED','CANCELLED')),
  notes       text,
  created_at  timestamptz not null default now()
);

-- ── Finance Records ────────────────────────────────────────
create table if not exists finance_records (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null check (type in ('INCOME','EXPENSE')),
  category    text not null,
  description text not null,
  amount      numeric(10,2) not null,
  date        date not null default current_date,
  recorded_by uuid references profiles(id),
  booking_id  uuid references bookings(id),
  created_at  timestamptz not null default now()
);

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


-- ════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════

create index if not exists idx_rooms_status       on rooms(status);
create index if not exists idx_rooms_type         on rooms(type);
create index if not exists idx_bookings_status    on bookings(status);
create index if not exists idx_bookings_guest     on bookings(guest_id);
create index if not exists idx_bookings_checkin   on bookings(check_in);
create index if not exists idx_bookings_checkout  on bookings(check_out);
create index if not exists idx_bookings_reference on bookings(reference);
create index if not exists idx_payments_booking   on payments(booking_id);
create index if not exists idx_payments_status    on payments(status);
create index if not exists idx_housekeeping_room  on housekeeping_tasks(room_id);
create index if not exists idx_housekeeping_status on housekeeping_tasks(status);
create index if not exists idx_complaints_status  on complaints(status);
create index if not exists idx_events_dates       on events(start_date, end_date);
create index if not exists idx_finance_date       on finance_records(date);
create index if not exists idx_finance_type       on finance_records(type);
create index if not exists idx_guests_phone       on guests(phone);
create index if not exists idx_messages_sent_by   on messages(sent_by);
create index if not exists idx_messages_created   on messages(created_at);


-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

alter table profiles          enable row level security;
alter table rooms             enable row level security;
alter table venues            enable row level security;
alter table guests            enable row level security;
alter table bookings          enable row level security;
alter table payments          enable row level security;
alter table housekeeping_tasks enable row level security;
alter table complaints        enable row level security;
alter table inventory_items   enable row level security;
alter table events            enable row level security;
alter table finance_records   enable row level security;
alter table messages          enable row level security;
alter table settings          enable row level security;

-- ── Helper: get current user's role ────────────────────────
create or replace function auth_user_role()
returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- ── Profiles ───────────────────────────────────────────────
drop policy if exists "Authenticated users can read all profiles" on profiles;
create policy "Authenticated users can read all profiles"
  on profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid());

drop policy if exists "Admins can insert profiles" on profiles;
create policy "Admins can insert profiles"
  on profiles for insert
  to authenticated
  with check (auth_user_role() = 'admin');

drop policy if exists "Admins can delete profiles" on profiles;
create policy "Admins can delete profiles"
  on profiles for delete
  to authenticated
  using (auth_user_role() = 'admin');

-- ── Rooms ──────────────────────────────────────────────────
drop policy if exists "Authenticated users can read rooms" on rooms;
create policy "Authenticated users can read rooms"
  on rooms for select
  to authenticated
  using (true);

drop policy if exists "Admins and managers can manage rooms" on rooms;
create policy "Admins and managers can manage rooms"
  on rooms for all
  to authenticated
  using (auth_user_role() in ('admin', 'manager'));

-- ── Venues ─────────────────────────────────────────────────
drop policy if exists "Authenticated users can read venues" on venues;
create policy "Authenticated users can read venues"
  on venues for select
  to authenticated
  using (true);

drop policy if exists "Admins and managers can manage venues" on venues;
create policy "Admins and managers can manage venues"
  on venues for all
  to authenticated
  using (auth_user_role() in ('admin', 'manager'));

-- ── Guests ─────────────────────────────────────────────────
drop policy if exists "Authenticated users can read guests" on guests;
create policy "Authenticated users can read guests"
  on guests for select
  to authenticated
  using (true);

drop policy if exists "Staff can insert guests" on guests;
create policy "Staff can insert guests"
  on guests for insert
  to authenticated
  with check (true);

drop policy if exists "Staff can update guests" on guests;
create policy "Staff can update guests"
  on guests for update
  to authenticated
  using (true);

drop policy if exists "Admins can delete guests" on guests;
create policy "Admins can delete guests"
  on guests for delete
  to authenticated
  using (auth_user_role() = 'admin');

-- ── Bookings ───────────────────────────────────────────────
drop policy if exists "Authenticated users can read bookings" on bookings;
create policy "Authenticated users can read bookings"
  on bookings for select
  to authenticated
  using (true);

drop policy if exists "Staff can insert bookings" on bookings;
create policy "Staff can insert bookings"
  on bookings for insert
  to authenticated
  with check (true);

drop policy if exists "Staff can update bookings" on bookings;
create policy "Staff can update bookings"
  on bookings for update
  to authenticated
  using (true);

drop policy if exists "Admins can delete bookings" on bookings;
create policy "Admins can delete bookings"
  on bookings for delete
  to authenticated
  using (auth_user_role() = 'admin');

-- ── Payments ───────────────────────────────────────────────
drop policy if exists "Authenticated users can read payments" on payments;
create policy "Authenticated users can read payments"
  on payments for select
  to authenticated
  using (true);

drop policy if exists "Staff can insert payments" on payments;
create policy "Staff can insert payments"
  on payments for insert
  to authenticated
  with check (true);

drop policy if exists "Admins can manage payments" on payments;
create policy "Admins can manage payments"
  on payments for all
  to authenticated
  using (auth_user_role() in ('admin', 'manager'));

-- ── Housekeeping Tasks ─────────────────────────────────────
drop policy if exists "Authenticated users can read housekeeping tasks" on housekeeping_tasks;
create policy "Authenticated users can read housekeeping tasks"
  on housekeeping_tasks for select
  to authenticated
  using (true);

drop policy if exists "Staff can insert housekeeping tasks" on housekeeping_tasks;
create policy "Staff can insert housekeeping tasks"
  on housekeeping_tasks for insert
  to authenticated
  with check (true);

drop policy if exists "Staff can update housekeeping tasks" on housekeeping_tasks;
create policy "Staff can update housekeeping tasks"
  on housekeeping_tasks for update
  to authenticated
  using (true);

drop policy if exists "Staff can delete housekeeping tasks" on housekeeping_tasks;
create policy "Staff can delete housekeeping tasks"
  on housekeeping_tasks for delete
  to authenticated
  using (true);

-- ── Complaints ─────────────────────────────────────────────
drop policy if exists "Authenticated users can read complaints" on complaints;
create policy "Authenticated users can read complaints"
  on complaints for select
  to authenticated
  using (true);

drop policy if exists "Staff can insert complaints" on complaints;
create policy "Staff can insert complaints"
  on complaints for insert
  to authenticated
  with check (true);

drop policy if exists "Staff can update complaints" on complaints;
create policy "Staff can update complaints"
  on complaints for update
  to authenticated
  using (true);

drop policy if exists "Admins can delete complaints" on complaints;
create policy "Admins can delete complaints"
  on complaints for delete
  to authenticated
  using (auth_user_role() = 'admin');

-- ── Inventory ──────────────────────────────────────────────
drop policy if exists "Authenticated users can read inventory" on inventory_items;
create policy "Authenticated users can read inventory"
  on inventory_items for select
  to authenticated
  using (true);

drop policy if exists "Admins and managers can manage inventory" on inventory_items;
create policy "Admins and managers can manage inventory"
  on inventory_items for all
  to authenticated
  using (auth_user_role() in ('admin', 'manager'));

-- ── Events ─────────────────────────────────────────────────
drop policy if exists "Authenticated users can read events" on events;
create policy "Authenticated users can read events"
  on events for select
  to authenticated
  using (true);

drop policy if exists "Staff can insert events" on events;
create policy "Staff can insert events"
  on events for insert
  to authenticated
  with check (true);

drop policy if exists "Staff can update events" on events;
create policy "Staff can update events"
  on events for update
  to authenticated
  using (true);

drop policy if exists "Admins can delete events" on events;
create policy "Admins can delete events"
  on events for delete
  to authenticated
  using (auth_user_role() = 'admin');

-- ── Finance Records ────────────────────────────────────────
drop policy if exists "Admins and managers can read finance" on finance_records;
create policy "Admins and managers can read finance"
  on finance_records for select
  to authenticated
  using (auth_user_role() in ('admin', 'super_admin', 'manager', 'accountant'));

drop policy if exists "Admins and managers can manage finance" on finance_records;
create policy "Admins and managers can manage finance"
  on finance_records for all
  to authenticated
  using (auth_user_role() in ('admin', 'super_admin', 'manager', 'accountant'));

-- ── Messages ──────────────────────────────────────────────
drop policy if exists "Staff can read messages" on messages;
create policy "Staff can read messages"
  on messages for select
  to authenticated
  using (true);

drop policy if exists "Staff can send messages" on messages;
create policy "Staff can send messages"
  on messages for insert
  to authenticated
  with check (true);

-- ── Settings ──────────────────────────────────────────────
drop policy if exists "Staff can read settings" on settings;
create policy "Staff can read settings"
  on settings for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage settings" on settings;
create policy "Admins can manage settings"
  on settings for all
  to authenticated
  using (auth_user_role() in ('admin', 'manager'));


-- ════════════════════════════════════════════════════════════
-- SEED DATA
-- ════════════════════════════════════════════════════════════

-- ── Rooms (sample per type, based on WPTC rate sheet) ──────
insert into rooms (number, name, type, building, floor, capacity, beds, price_per_night, has_ac, has_tv, has_fridge, amenities, description) values
  ('101', '2-in-1 Room 101',  '2_IN_1',    'Main',         1, 2, 2, 150.00, false, false, false, '{"fan","towels","wardrobe"}',             'Standard twin room with fan'),
  ('102', '2-in-1 Room 102',  '2_IN_1',    'Main',         1, 2, 2, 150.00, false, false, false, '{"fan","towels","wardrobe"}',             'Standard twin room with fan'),
  ('201', '4-in-1 Room 201',  '4_IN_1',    'Main',         2, 4, 4, 200.00, false, false, false, '{"fan","towels","wardrobe"}',             'Quad room — great for families or groups'),
  ('202', '4-in-1 Room 202',  '4_IN_1',    'Main',         2, 4, 4, 200.00, false, false, false, '{"fan","towels","wardrobe"}',             'Quad room — great for families or groups'),
  ('301', '6-in-1 Room 301',  '6_IN_1',    'Main',         3, 6, 6, 270.00, false, false, false, '{"fan","towels"}',                        'Dormitory-style room for large groups'),
  ('302', '6-in-1 Room 302',  '6_IN_1',    'Main',         3, 6, 6, 270.00, false, false, false, '{"fan","towels"}',                        'Dormitory-style room for large groups'),
  ('S01', 'Suite (Fan) S01',  'SUITE_FAN', 'Suite Block',  1, 2, 1, 350.00, false, true,  true,  '{"fan","tv","fridge","towels","wardrobe"}','Comfortable suite with fan, TV & fridge'),
  ('S02', 'Suite (AC) S02',   'SUITE_AC',  'Suite Block',  1, 2, 1, 750.00, true,  true,  true,  '{"ac","tv","fridge","towels","wardrobe"}','Premium air-conditioned suite'),
  ('A01', 'Holy Family Apt',  'APARTMENT', 'Holy Family',  1, 4, 2, 750.00, true,  true,  true,  '{"ac","tv","fridge","kitchen","towels"}', 'Self-contained apartment with kitchen'),
  ('T01', '3-in-1 Room T01',  '3_IN_1',    'Annex',        1, 3, 3, 100.00, false, false, false, '{"fan","towels"}',                        'Budget triple room'),
  ('T02', '3-in-1 Room T02',  '3_IN_1',    'Annex',        1, 3, 3, 100.00, false, false, false, '{"fan","towels"}',                        'Budget triple room'),
  ('K01', 'Kitchen K01',      'KITCHEN',   'Annex',        1, 2, 1, 100.00, false, false, false, '{"fan","kitchenette"}',                   'Room with kitchenette access')
on conflict (number) do nothing;

-- ── Venues / Halls (WPTC rate sheet) ───────────────────────
-- Only insert if venues table is empty (avoids duplicates on re-run)
insert into venues (name, description, capacity, price_per_day, amenities)
select * from (values
  ('Faith Hall (No AC)',          'Main conference hall without air conditioning',           200, 400.00::numeric,  '{"chairs","tables","PA system","projector"}'::text[]),
  ('Faith Hall (With AC)',        'Main conference hall with air conditioning',              200, 550.00::numeric,  '{"chairs","tables","PA system","projector","ac"}'::text[]),
  ('Pavilion (With Canopy)',      'Open-air pavilion with canopy coverage',                 300, 900.00::numeric,  '{"chairs","tables","canopy","lighting"}'::text[]),
  ('Pavilion (Without Canopy)',   'Open-air pavilion without canopy',                       300, 700.00::numeric,  '{"chairs","tables","lighting"}'::text[]),
  ('Kitchen & Dining (55+)',      'Full kitchen and dining hall for 55+ guests',              60, 500.00::numeric,  '{"kitchen","tables","chairs","serving area"}'::text[]),
  ('Kitchen & Dining (30-50)',    'Kitchen and dining hall for 30-50 guests',                 50, 400.00::numeric,  '{"kitchen","tables","chairs","serving area"}'::text[]),
  ('Kitchen & Dining (Below 20)', 'Kitchen and dining for small groups under 20',            20, 250.00::numeric,  '{"kitchen","tables","chairs"}'::text[]),
  ('Wedding Grounds',             'Scenic outdoor wedding grounds with landscaped gardens', 500, 4000.00::numeric, '{"chairs","decoration area","parking","lighting","gardens"}'::text[])
) as v(name, description, capacity, price_per_day, amenities)
where not exists (select 1 from venues limit 1);
