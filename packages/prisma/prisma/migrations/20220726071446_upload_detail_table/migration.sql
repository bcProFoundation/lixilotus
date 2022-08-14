/*
  Warnings:

  - You are about to drop the column `upload_id` on the `lixi` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `cover` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `upload` table. All the data in the column will be lost.
  - You are about to drop the column `lixiId` on the `upload` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "upload" DROP CONSTRAINT "upload_accountId_fkey";

-- DropForeignKey
ALTER TABLE "upload" DROP CONSTRAINT "upload_lixiId_fkey";

-- DropIndex
DROP INDEX "upload_lixiId_key";

-- AlterTable
ALTER TABLE "lixi" DROP COLUMN "upload_id",
ADD COLUMN     "upload_detail_id" TEXT;

-- AlterTable
ALTER TABLE "page" DROP COLUMN "avatar",
DROP COLUMN "cover";

-- AlterTable
ALTER TABLE "upload" DROP COLUMN "accountId",
DROP COLUMN "lixiId";

-- CreateTable
CREATE TABLE "upload_detail" (
    "id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
    "upload_id" TEXT NOT NULL,
    "lixi_id" INTEGER,
    "page_cover_id" TEXT,
    "page_avatar_id" TEXT,

    CONSTRAINT "upload_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_upload_id_key" ON "upload_detail"("upload_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_lixi_id_key" ON "upload_detail"("lixi_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_page_cover_id_key" ON "upload_detail"("page_cover_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_page_avatar_id_key" ON "upload_detail"("page_avatar_id");

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_page_cover_id_fkey" FOREIGN KEY ("page_cover_id") REFERENCES "page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_page_avatar_id_fkey" FOREIGN KEY ("page_avatar_id") REFERENCES "page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_lixi_id_fkey" FOREIGN KEY ("lixi_id") REFERENCES "lixi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
