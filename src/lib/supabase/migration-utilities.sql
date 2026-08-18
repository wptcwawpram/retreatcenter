-- Utilities tracking for retreat center
-- Tracks: power outages, generator usage, water levels, maintenance

-- Utility types: POWER, GENERATOR, WATER, OTHER
-- Event types: OUTAGE_START, OUTAGE_END, GENERATOR_START, GENERATOR_STOP,
--              FUEL_READING, WATER_READING, WATER_REFILL, MAINTENANCE, NOTE

CREATE TABLE IF NOT EXISTS utility_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  utility_type TEXT NOT NULL CHECK (utility_type IN ('POWER', 'GENERATOR', 'WATER', 'OTHER')),
  event_type TEXT NOT NULL,
  reading_value NUMERIC,          -- e.g. fuel % or water tank %
  description TEXT,
  logged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Current status snapshot (one row per utility type)
CREATE TABLE IF NOT EXISTS utility_status (
  utility_type TEXT PRIMARY KEY CHECK (utility_type IN ('POWER', 'GENERATOR', 'WATER')),
  status TEXT NOT NULL DEFAULT 'NORMAL',  -- NORMAL, OUTAGE, RUNNING, STANDBY, LOW, CRITICAL
  current_reading NUMERIC,                -- latest % reading
  last_event TEXT,
  last_event_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default status rows
INSERT INTO utility_status (utility_type, status, current_reading, last_event)
VALUES
  ('POWER', 'NORMAL', NULL, 'System initialized'),
  ('GENERATOR', 'STANDBY', 100, 'System initialized'),
  ('WATER', 'NORMAL', 100, 'System initialized')
ON CONFLICT (utility_type) DO NOTHING;

-- RLS
ALTER TABLE utility_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read utility_logs" ON utility_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert utility_logs" ON utility_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update utility_logs" ON utility_logs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete utility_logs" ON utility_logs FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read utility_status" ON utility_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update utility_status" ON utility_status FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert utility_status" ON utility_status FOR INSERT TO authenticated WITH CHECK (true);
