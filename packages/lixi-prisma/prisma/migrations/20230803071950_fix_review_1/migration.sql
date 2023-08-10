/*
  Warnings:

  - You are about to drop the column `authorId` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `isPageOwner` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `pageMessageSessionId` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `access_chat_fee` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `followerFreeMessage` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `page_message_session` table. All the data in the column will be lost.
  - You are about to drop the column `latestMessage` on the `page_message_session` table. All the data in the column will be lost.
  - You are about to drop the column `lixiId` on the `page_message_session` table. All the data in the column will be lost.
  - You are about to drop the column `pageId` on the `page_message_session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lixi_id]` on the table `page_message_session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `author_id` to the `message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_id` to the `page_message_session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `page_id` to the `page_message_session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_authorId_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_pageMessageSessionId_fkey";

-- DropForeignKey
ALTER TABLE "page_message_session" DROP CONSTRAINT "page_message_session_accountId_fkey";

-- DropForeignKey
ALTER TABLE "page_message_session" DROP CONSTRAINT "page_message_session_lixiId_fkey";

-- DropForeignKey
ALTER TABLE "page_message_session" DROP CONSTRAINT "page_message_session_pageId_fkey";

-- DropIndex
DROP INDEX "page_message_session_lixiId_key";

-- AlterTable
ALTER TABLE "message" DROP COLUMN "authorId",
DROP COLUMN "isPageOwner",
DROP COLUMN "pageMessageSessionId",
ADD COLUMN     "author_id" INTEGER NOT NULL,
ADD COLUMN     "is_page_owner" BOOLEAN,
ADD COLUMN     "page_message_session_id" TEXT;

-- AlterTable
ALTER TABLE "page" DROP COLUMN "access_chat_fee",
DROP COLUMN "followerFreeMessage",
ADD COLUMN     "access_message_fee" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "follower_free_message" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "page_message_session" DROP COLUMN "accountId",
DROP COLUMN "latestMessage",
DROP COLUMN "lixiId",
DROP COLUMN "pageId",
ADD COLUMN     "account_id" INTEGER NOT NULL,
ADD COLUMN     "latest_message" TEXT,
ADD COLUMN     "lixi_id" INTEGER,
ADD COLUMN     "page_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "page_message_session_lixi_id_key" ON "page_message_session"("lixi_id");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_page_message_session_id_fkey" FOREIGN KEY ("page_message_session_id") REFERENCES "page_message_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_message_session" ADD CONSTRAINT "page_message_session_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_message_session" ADD CONSTRAINT "page_message_session_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_message_session" ADD CONSTRAINT "page_message_session_lixi_id_fkey" FOREIGN KEY ("lixi_id") REFERENCES "lixi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
