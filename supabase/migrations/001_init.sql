-- =========================================================
-- Worker Registration MVP — Supabase SQL Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  photo_url         TEXT,
  mobile_number     TEXT NOT NULL CHECK (mobile_number ~ '^[6-9][0-9]{9}$'),
  father_name       TEXT NOT NULL CHECK (char_length(father_name) BETWEEN 2 AND 100),
  address           TEXT NOT NULL CHECK (char_length(address) BETWEEN 10 AND 500),
  aadhaar_number    TEXT NOT NULL CHECK (aadhaar_number ~ '^\d{12}$'),
  pan_number        TEXT NOT NULL CHECK (pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workers_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Public can only INSERT (for worker registration)
CREATE POLICY "public_can_insert" ON workers
  FOR INSERT
  WITH CHECK (true);

-- Authenticated users (admins) can do everything
CREATE POLICY "admin_full_access" ON workers
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =========================================================
-- Storage Bucket for worker photos
-- Run separately in Supabase Dashboard → Storage → New Bucket
-- OR uncomment and run these SQL commands:
-- =========================================================

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('worker-photos', 'worker-photos', false);

-- Allow authenticated users to view photos
-- CREATE POLICY "admin_can_view_photos" ON storage.objects
--   FOR SELECT USING (bucket_id = 'worker-photos' AND auth.role() = 'authenticated');

-- Allow service role to upload (done via server API route)
-- CREATE POLICY "service_can_upload" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'worker-photos');

-- =========================================================
-- Indexes for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_workers_registration_date ON workers (registration_date DESC);
CREATE INDEX IF NOT EXISTS idx_workers_mobile ON workers (mobile_number);
CREATE INDEX IF NOT EXISTS idx_workers_full_name ON workers (full_name);
CREATE INDEX IF NOT EXISTS idx_workers_status ON workers (status);
