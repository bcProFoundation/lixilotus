-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_page_id_fkey";

-- AlterTable
ALTER TABLE "post" ALTER COLUMN "page_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "page"("id") ON DELETE SET NULL ON UPDATE CASCADE;
