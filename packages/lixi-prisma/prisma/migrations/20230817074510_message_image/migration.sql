-- AlterTable
ALTER TABLE "upload_detail" ADD COLUMN     "messageId" TEXT;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
