/*
  Warnings:

  - You are about to drop the column `messageSessionId` on the `message` table. All the data in the column will be lost.
  - You are about to drop the `message_session` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[lixiId]` on the table `page_message_session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PageMessageSessionStatus" AS ENUM ('PENDING', 'OPEN', 'ClOSE');

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_messageSessionId_fkey";

-- DropForeignKey
ALTER TABLE "message_session" DROP CONSTRAINT "message_session_lixiId_fkey";

-- DropForeignKey
ALTER TABLE "message_session" DROP CONSTRAINT "message_session_pageMessageSessionId_fkey";

-- AlterTable
ALTER TABLE "message" DROP COLUMN "messageSessionId",
ADD COLUMN     "pageMessageSessionId" TEXT;

-- AlterTable
ALTER TABLE "page_message_session" ADD COLUMN     "lixiId" INTEGER,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "sessionClosedAt" TIMESTAMP(3),
ADD COLUMN     "sessionOpenedAt" TIMESTAMP(3),
ADD COLUMN     "status" "PageMessageSessionStatus" DEFAULT 'ClOSE';

-- DropTable
DROP TABLE "message_session";

-- CreateIndex
CREATE UNIQUE INDEX "page_message_session_lixiId_key" ON "page_message_session"("lixiId");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_pageMessageSessionId_fkey" FOREIGN KEY ("pageMessageSessionId") REFERENCES "page_message_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_message_session" ADD CONSTRAINT "page_message_session_lixiId_fkey" FOREIGN KEY ("lixiId") REFERENCES "lixi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
