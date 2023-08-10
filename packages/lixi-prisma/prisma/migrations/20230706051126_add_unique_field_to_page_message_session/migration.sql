/*
  Warnings:

  - A unique constraint covering the columns `[pageId]` on the table `page_message_session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId]` on the table `page_message_session` will be added. If there are existing duplicate values, this will fail.
  - Made the column `pageId` on table `page_message_session` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accountId` on table `page_message_session` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "page_message_session" DROP CONSTRAINT "page_message_session_accountId_fkey";

-- DropForeignKey
ALTER TABLE "page_message_session" DROP CONSTRAINT "page_message_session_pageId_fkey";

-- AlterTable
ALTER TABLE "page_message_session" ALTER COLUMN "pageId" SET NOT NULL,
ALTER COLUMN "accountId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "page_message_session_pageId_key" ON "page_message_session"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "page_message_session_accountId_key" ON "page_message_session"("accountId");

-- AddForeignKey
ALTER TABLE "page_message_session" ADD CONSTRAINT "page_message_session_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_message_session" ADD CONSTRAINT "page_message_session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
