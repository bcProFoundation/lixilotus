-- DropForeignKey
ALTER TABLE "Worship" DROP CONSTRAINT "Worship_worshipedPersonId_fkey";

-- AlterTable
ALTER TABLE "Worship" ALTER COLUMN "worshipedPersonId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Worship" ADD CONSTRAINT "Worship_worshipedPersonId_fkey" FOREIGN KEY ("worshipedPersonId") REFERENCES "WorshipedPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
