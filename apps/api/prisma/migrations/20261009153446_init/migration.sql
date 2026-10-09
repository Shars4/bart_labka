-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "species" AS ENUM ('DOG', 'CAT', 'RABBIT', 'OTHER');

-- CreateEnum
CREATE TYPE "sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "animal_size" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "animal_status" AS ENUM ('AVAILABLE', 'RESERVED', 'ADOPTED');

-- CreateEnum
CREATE TYPE "adoption_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'ADMIN',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "species" "species" NOT NULL,
    "breed" VARCHAR(60),
    "sex" "sex" NOT NULL,
    "size" "animal_size" NOT NULL,
    "birth_date" DATE,
    "intake_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "image_url" VARCHAR(500),
    "is_vaccinated" BOOLEAN NOT NULL DEFAULT false,
    "is_neutered" BOOLEAN NOT NULL DEFAULT false,
    "status" "animal_status" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by_id" INTEGER,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoption_requests" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(20),
    "message" TEXT NOT NULL,
    "status" "adoption_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "animal_id" INTEGER NOT NULL,

    CONSTRAINT "adoption_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "animals_status_species_idx" ON "animals"("status", "species");

-- CreateIndex
CREATE INDEX "animals_intake_date_idx" ON "animals"("intake_date");

-- CreateIndex
CREATE INDEX "animals_created_by_id_idx" ON "animals"("created_by_id");

-- CreateIndex
CREATE INDEX "adoption_requests_animal_id_status_idx" ON "adoption_requests"("animal_id", "status");

-- CreateIndex
CREATE INDEX "adoption_requests_status_created_at_idx" ON "adoption_requests"("status", "created_at");

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
