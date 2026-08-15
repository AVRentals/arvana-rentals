-- ─────────────────────────────────────────────────────────────
-- MIGRATION: apply-then-approve-then-account flow
-- Run this ONCE in the Supabase SQL Editor.
--
-- schema.sql already includes everything below — this file exists only
-- because your database was created before these columns did. Running it
-- twice is safe (IF NOT EXISTS / DROP ... IF EXISTS everywhere).
-- ─────────────────────────────────────────────────────────────

-- 1. Insurance is now answered by every applicant, not just gig workers.
--    'own'    = they have a policy and uploaded proof
--    'arvana' = they want us to add coverage
--    Anyone who wants neither is refused by the form and never gets here.
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS insurance_choice TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS insurance_doc_path TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_insurance_choice_check'
  ) THEN
    ALTER TABLE quote_requests
      ADD CONSTRAINT quote_requests_insurance_choice_check
      CHECK (insurance_choice IS NULL OR insurance_choice IN ('own','arvana'));
  END IF;
END $$;

-- 2. Which car they were looking at when they applied.
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS car_interest TEXT;

-- 3. Applications now get approved or declined, not just "contacted".
ALTER TABLE quote_requests DROP CONSTRAINT IF EXISTS quote_requests_status_check;
ALTER TABLE quote_requests
  ADD CONSTRAINT quote_requests_status_check
  CHECK (status IN ('new','contacted','approved','declined','closed'));

-- ─────────────────────────────────────────────────────────────
-- Done. Verify with:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'quote_requests' ORDER BY ordinal_position;
-- ─────────────────────────────────────────────────────────────

-- 4. Let a signed-in applicant read their own application, so the booking
--    flow can confirm they were approved. Host-only SELECT stays in place
--    for everything else.
DROP POLICY IF EXISTS "Applicants can view their own application" ON quote_requests;
CREATE POLICY "Applicants can view their own application"
  ON quote_requests FOR SELECT
  USING (email = auth.jwt() ->> 'email');
