-- Add dashboard_access column to profiles table
-- This stores custom page access for employees, overriding the default role-based access
-- When NULL, the app falls back to ROLE_DASHBOARD_ACCESS constants

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dashboard_access text[] DEFAULT NULL;

-- Allow the column to be updated by authenticated users (existing RLS policies should cover this)
