-- Store the Paystack payment reference on the booking so admins can re-check
-- a payment (catches "paid but the booking never updated" from a missed webhook).
-- Run in Supabase SQL editor.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_reference') THEN
    ALTER TABLE bookings ADD COLUMN payment_reference text;
  END IF;
END $$;
