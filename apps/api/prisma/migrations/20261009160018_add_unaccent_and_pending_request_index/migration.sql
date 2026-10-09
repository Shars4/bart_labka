-- Accent-insensitive search: "tigrik" finds "Tigrík". unaccent ships with
-- PostgreSQL (contrib) and is a trusted extension since PostgreSQL 13.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- One pending adoption request per applicant and animal. The service checks
-- this too, for a friendly message; the index also covers two identical
-- requests arriving at the same time. Emails are stored lowercase.
CREATE UNIQUE INDEX "adoption_requests_one_pending_per_email_key"
  ON "adoption_requests" ("animal_id", "email")
  WHERE "status" = 'PENDING';
