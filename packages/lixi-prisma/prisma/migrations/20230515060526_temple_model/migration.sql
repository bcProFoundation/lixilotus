/*
  Warnings:

  - A unique constraint covering the columns `[temple_avatar_id]` on the table `upload_detail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[temple_cover_id]` on the table `upload_detail` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Worship" ADD COLUMN     "templeId" TEXT;

-- AlterTable
ALTER TABLE "upload_detail" ADD COLUMN     "temple_avatar_id" TEXT,
ADD COLUMN     "temple_cover_id" TEXT;

-- CreateTable
CREATE TABLE "Temple" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "achievement" TEXT,
    "description" TEXT,
    "alias" TEXT,
    "religion" TEXT,
    "address" TEXT,
    "president" TEXT,
    "website" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "date_of_completed" TIMESTAMPTZ(6),
    "day_of_completed" INTEGER,
    "month_of_completed" INTEGER,
    "year_of_completed" INTEGER,
    "total_worship_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cityId" INTEGER,
    "countryId" INTEGER,
    "stateId" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Temple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_on_temple" (
    "id" TEXT NOT NULL,
    "temple_id" TEXT NOT NULL,
    "worshiped_person_id" TEXT NOT NULL,

    CONSTRAINT "person_on_temple_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_temple_avatar_id_key" ON "upload_detail"("temple_avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_temple_cover_id_key" ON "upload_detail"("temple_cover_id");

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_temple_avatar_id_fkey" FOREIGN KEY ("temple_avatar_id") REFERENCES "Temple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_temple_cover_id_fkey" FOREIGN KEY ("temple_cover_id") REFERENCES "Temple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worship" ADD CONSTRAINT "Worship_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Temple" ADD CONSTRAINT "Temple_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Temple" ADD CONSTRAINT "Temple_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Temple" ADD CONSTRAINT "Temple_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Temple" ADD CONSTRAINT "Temple_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "state"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_on_temple" ADD CONSTRAINT "person_on_temple_temple_id_fkey" FOREIGN KEY ("temple_id") REFERENCES "Temple"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_on_temple" ADD CONSTRAINT "person_on_temple_worshiped_person_id_fkey" FOREIGN KEY ("worshiped_person_id") REFERENCES "WorshipedPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
