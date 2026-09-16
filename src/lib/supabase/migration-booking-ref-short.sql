-- Shorten booking reference year: WPT-YYYYMMDD-NNN -> WPT-YYMMDD-NNN
-- e.g. WPT-20260912-001 becomes WPT-260912-001
-- Run in Supabase SQL editor. Only affects NEW bookings; existing refs are unchanged.

create or replace function generate_booking_reference()
returns trigger as $$
declare
  today_str text;
  seq int;
begin
  today_str := to_char(now(), 'YYMMDD');
  select count(*) + 1 into seq
    from bookings
    where reference like 'WPT-' || today_str || '-%';
  new.reference := 'WPT-' || today_str || '-' || lpad(seq::text, 3, '0');
  return new;
end;
$$ language plpgsql;
