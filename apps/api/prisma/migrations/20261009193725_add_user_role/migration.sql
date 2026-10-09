-- A new enum value cannot be used in the transaction that adds it, so it
-- gets its own migration; the next one makes it the column default.
ALTER TYPE "user_role" ADD VALUE 'USER';
