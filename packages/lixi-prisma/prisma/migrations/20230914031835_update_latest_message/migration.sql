/*
  Warnings:

  - You are about to drop the column `latest_message` on the `page_message_session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[latestMessageId]` on the table `page_message_session` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "page_message_session" DROP COLUMN "latest_message",
ADD COLUMN     "latestMessageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "page_message_session_latestMessageId_key" ON "page_message_session"("latestMessageId");

-- AddForeignKey
ALTER TABLE "page_message_session" ADD CONSTRAINT "page_message_session_latestMessageId_fkey" FOREIGN KEY ("latestMessageId") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
