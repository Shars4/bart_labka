-- Accounts for adopters: role USER (new default), email verification and
-- the link from an adoption request to the account that sent it.

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified_at" TIMESTAMPTZ(3),
ALTER COLUMN "role" SET DEFAULT 'USER';

-- Existing accounts are the seeded admins; treat their emails as verified.
UPDATE "users" SET "email_verified_at" = "created_at";

-- AlterTable
ALTER TABLE "adoption_requests" ADD COLUMN     "user_id" INTEGER;

-- CreateIndex
CREATE INDEX "adoption_requests_user_id_idx" ON "adoption_requests"("user_id");

-- AddForeignKey
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
