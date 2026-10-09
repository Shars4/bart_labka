-- Invariants Prisma's schema language cannot express. They back up the
-- API's DTO validation, so data stays valid even if it is written by
-- something other than the API (seed, manual SQL, a future service).

-- Emails are compared case-insensitively by always storing them lowercase.
ALTER TABLE "users"
  ADD CONSTRAINT "users_email_lowercase_check" CHECK ("email" = lower("email")),
  ADD CONSTRAINT "users_name_length_check" CHECK (char_length(btrim("name")) >= 2);

ALTER TABLE "animals"
  ADD CONSTRAINT "animals_name_length_check" CHECK (char_length(btrim("name")) >= 2),
  ADD CONSTRAINT "animals_description_length_check" CHECK (char_length("description") BETWEEN 20 AND 2000),
  ADD CONSTRAINT "animals_birth_before_intake_check" CHECK ("birth_date" IS NULL OR "birth_date" <= "intake_date");

ALTER TABLE "adoption_requests"
  ADD CONSTRAINT "adoption_requests_email_lowercase_check" CHECK ("email" = lower("email")),
  ADD CONSTRAINT "adoption_requests_full_name_length_check" CHECK (char_length(btrim("full_name")) >= 2),
  ADD CONSTRAINT "adoption_requests_message_length_check" CHECK (char_length("message") BETWEEN 10 AND 2000);
