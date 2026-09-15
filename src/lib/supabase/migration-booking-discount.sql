-- Booking pricing breakdown + discount persistence
-- Run in Supabase SQL editor.
-- Lets the admin edit bookings without losing the original (pre-discount) price,
-- re-edit a discount, and reconstruct the exact room/hall selection.

DO $$
BEGIN
  -- Original room/lodging portion (before discount)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'room_amount') THEN
    ALTER TABLE bookings ADD COLUMN room_amount numeric(12,2) NOT NULL DEFAULT 0;
  END IF;

  -- Subtotal = room_amount + hall_amount, BEFORE any discount
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'subtotal') THEN
    ALTER TABLE bookings ADD COLUMN subtotal numeric(12,2) NOT NULL DEFAULT 0;
  END IF;

  -- Discount metadata (so it can be shown + re-edited)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'discount_type') THEN
    ALTER TABLE bookings ADD COLUMN discount_type text;  -- 'amount' | 'percent'
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'discount_value') THEN
    ALTER TABLE bookings ADD COLUMN discount_value numeric(12,2) NOT NULL DEFAULT 0;  -- raw value entered
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'discount_amount') THEN
    ALTER TABLE bookings ADD COLUMN discount_amount numeric(12,2) NOT NULL DEFAULT 0;  -- computed cash discount
  END IF;

  -- Structured room/hall selection so the edit form can reconstruct the exact choices
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'selection') THEN
    ALTER TABLE bookings ADD COLUMN selection jsonb;
  END IF;
END $$;

-- Backfill existing rows: treat current total_amount as the subtotal (no discount recorded),
-- and derive room_amount from total minus hall.
UPDATE bookings
SET
  subtotal = COALESCE(subtotal, 0),
  room_amount = CASE WHEN room_amount = 0 THEN GREATEST(0, total_amount - COALESCE(hall_amount, 0)) ELSE room_amount END
WHERE subtotal = 0;

UPDATE bookings
SET subtotal = total_amount + COALESCE(discount_amount, 0)
WHERE subtotal = 0 AND total_amount > 0;
