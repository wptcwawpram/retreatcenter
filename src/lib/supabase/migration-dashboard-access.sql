-- Add dashboard_access column to profiles table
-- Stores custom page access for employees, overriding the default role-based access
-- When NULL, the app falls back to ROLE_DASHBOARD_ACCESS constants
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dashboard_access text[] DEFAULT NULL;

-- Add invite_token column for employee onboarding flow
-- Generated when an employee is created, included in SMS invite link
-- Cleared after the employee completes onboarding (verifies phone + sets password)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invite_token text DEFAULT NULL;
