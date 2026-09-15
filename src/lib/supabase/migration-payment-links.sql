-- Link finance income records to the payment that created them.
-- Run in Supabase SQL editor.
-- Lets deleting/editing a payment also reverse or update its income record.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finance_records' AND column_name = 'payment_id') THEN
    ALTER TABLE finance_records ADD COLUMN payment_id uuid REFERENCES payments(id) ON DELETE SET NULL;
  END IF;
END $$;
