/*
  Warnings:

  - A unique constraint covering the columns `[avatarAccountId]` on the table `upload_detail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coverAccountId]` on the table `upload_detail` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "upload_detail" ADD COLUMN     "avatarAccountId" INTEGER,
ADD COLUMN     "coverAccountId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_avatarAccountId_key" ON "upload_detail"("avatarAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_coverAccountId_key" ON "upload_detail"("coverAccountId");

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_avatarAccountId_fkey" FOREIGN KEY ("avatarAccountId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_coverAccountId_fkey" FOREIGN KEY ("coverAccountId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
