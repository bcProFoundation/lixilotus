/*
  Warnings:

  - You are about to drop the column `sessionClosedAt` on the `page_message_session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionOpenedAt` on the `page_message_session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "page_message_session" DROP COLUMN "sessionClosedAt",
DROP COLUMN "sessionOpenedAt",
ADD COLUMN     "session_closed_at" TIMESTAMP(3),
ADD COLUMN     "session_opened_at" TIMESTAMP(3);
