-- CreateEnum
CREATE TYPE "user_two_factor_type" AS ENUM ('email', 'sms', 'authenticator');

-- DropIndex
DROP INDEX "account_mnemonic_hash_idx";

-- CreateTable
CREATE TABLE "handle" (
    "id" TEXT NOT NULL,
    "handle" VARCHAR(150) NOT NULL,
    "handle_number" OID NOT NULL,

    CONSTRAINT "handle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page" (
    "id" TEXT NOT NULL,
    "page_account_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL DEFAULT E'',
    "title" VARCHAR(255) NOT NULL DEFAULT E'',
    "description" VARCHAR(1000) NOT NULL DEFAULT E'',
    "avatar" VARCHAR(100) NOT NULL DEFAULT E'upload/photos/d-page.jpg',
    "cover" VARCHAR(100) NOT NULL DEFAULT E'upload/photos/d-cover.jpg',
    "parent_id" TEXT,
    "handle_id" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT E'',
    "website" TEXT NOT NULL DEFAULT E'',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "handle_handle_handle_number_key" ON "handle"("handle", "handle_number");

-- CreateIndex
CREATE UNIQUE INDEX "page_page_account_id_key" ON "page"("page_account_id");

-- CreateIndex
CREATE INDEX "account_mnemonic_hash_idx" ON "account" USING HASH ("mnemonic_hash");

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_handle_id_fkey" FOREIGN KEY ("handle_id") REFERENCES "handle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_page_account_id_fkey" FOREIGN KEY ("page_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
