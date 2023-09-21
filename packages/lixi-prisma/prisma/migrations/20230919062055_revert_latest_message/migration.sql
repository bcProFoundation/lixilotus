/*
  Warnings:

  - You are about to drop the column `latestMessageId` on the `page_message_session` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "page_message_session" DROP CONSTRAINT "page_message_session_latestMessageId_fkey";

-- DropIndex
DROP INDEX "page_message_session_latestMessageId_key";

-- AlterTable
ALTER TABLE "page_message_session" DROP COLUMN "latestMessageId";
