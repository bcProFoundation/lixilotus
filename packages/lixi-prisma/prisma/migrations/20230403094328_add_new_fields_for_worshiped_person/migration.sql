/*
  Warnings:

  - You are about to drop the column `wikiDataId` on the `WorshipedPerson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorshipedPerson" DROP COLUMN "wikiDataId",
ADD COLUMN     "achievement" TEXT,
ADD COLUMN     "alias" TEXT,
ADD COLUMN     "country_of_citizenship" TEXT,
ADD COLUMN     "place_of_birth" TEXT,
ADD COLUMN     "place_of_burial" TEXT,
ADD COLUMN     "place_of_death" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "wikiAvatar" TEXT,
ADD COLUMN     "wiki_data_id" TEXT;
