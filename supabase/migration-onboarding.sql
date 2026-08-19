-- ─────────────────────────────────────────────────────────────
-- MIGRATION: guided onboarding after signup
-- Run once in the Supabase SQL Editor. Safe to run twice.
-- ─────────────────────────────────────────────────────────────

-- Tracks where a new renter is in the guided setup. Until
-- onboarding_completed_at is set, signing in lands them on /welcome
-- instead of dropping them on an empty dashboard.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Phone confirmation. There's no SMS service wired up yet, so the renter
-- confirms the number and Daniel texts them to verify it — phone_confirmed
-- flips when he marks it done. Swapping in real OTP later only changes what
-- sets this column.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_confirmed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_confirm_requested_at TIMESTAMPTZ;

-- Identity check. Set by Stripe Identity once that's connected; until then
-- Daniel's manual license review on the application counts as verification.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT false;

-- Renters need to update their own profile during onboarding. There's
-- already an UPDATE policy (auth.uid() = id) — this just makes sure a user
-- can read their own row even if the public-read policy is ever tightened.
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
