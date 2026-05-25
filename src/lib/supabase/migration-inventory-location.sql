-- ════════════════════════════════════════════════════════════
-- MIGRATION: Add location column to inventory_items
-- Run this in your Supabase SQL Editor
-- ════════════════════════════════════════════════════════════

-- Add location column with default 'General'
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS location text NOT NULL DEFAULT 'General';

-- Update existing items to 'General' (already handled by default)
-- No data migration needed — new items will be created with proper locations

-- WPTC Location Guide:
-- ─────────────────────
-- Administration       — Admin offices, reception, shop
-- Faith Block          — Rooms 1-12, Suite 1 & Suite 2
-- Dominion Block       — Rooms 13-21
-- Holy Family          — 3 rooms, hall, dining (kitchen disabled)
-- Dining               — Main dining/kitchen area
-- Store                — Main store rooms
-- Reception Store      — Store room in reception
-- Public Washroom & Laundry — Mini block
-- Workers Quarters     — 3 staff rooms
