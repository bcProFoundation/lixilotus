/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[worshipedPerson_avatar_id]` on the table `upload_detail` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "account" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "upload_detail" ADD COLUMN     "worshipedPerson_avatar_id" TEXT;

-- CreateTable
CREATE TABLE "WorshipedPerson" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quote" TEXT DEFAULT '',
    "date_of_birth" TIMESTAMPTZ(6),
    "date_of_death" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "total_worship_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cityId" INTEGER,
    "countryId" INTEGER,
    "stateId" INTEGER,

    CONSTRAINT "WorshipedPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worship" (
    "id" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "worshipedPersonId" TEXT NOT NULL,
    "lotus_worship_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "location" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Worship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_worshipedPerson_avatar_id_key" ON "upload_detail"("worshipedPerson_avatar_id");

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_worshipedPerson_avatar_id_fkey" FOREIGN KEY ("worshipedPerson_avatar_id") REFERENCES "WorshipedPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipedPerson" ADD CONSTRAINT "WorshipedPerson_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipedPerson" ADD CONSTRAINT "WorshipedPerson_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipedPerson" ADD CONSTRAINT "WorshipedPerson_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "state"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worship" ADD CONSTRAINT "Worship_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worship" ADD CONSTRAINT "Worship_worshipedPersonId_fkey" FOREIGN KEY ("worshipedPersonId") REFERENCES "WorshipedPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
