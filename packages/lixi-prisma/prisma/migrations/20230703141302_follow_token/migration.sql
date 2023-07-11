-- DropForeignKey
ALTER TABLE "follow_page" DROP CONSTRAINT "follow_page_page_id_fkey";

-- AlterTable
ALTER TABLE "follow_page" ADD COLUMN     "token_id" TEXT,
ALTER COLUMN "page_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "follow_page_token_id_idx" ON "follow_page"("token_id");

-- AddForeignKey
ALTER TABLE "follow_page" ADD CONSTRAINT "follow_page_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_page" ADD CONSTRAINT "follow_page_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "token"("token_id") ON DELETE SET NULL ON UPDATE CASCADE;
