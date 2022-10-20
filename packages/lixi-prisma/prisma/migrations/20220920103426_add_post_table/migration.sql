/*
  Warnings:

  - A unique constraint covering the columns `[post_cover_id]` on the table `upload_detail` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "upload_detail" ADD COLUMN     "post_cover_id" TEXT;

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "post_account_id" INTEGER NOT NULL,
    "page_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadDetailId" TEXT,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_post_account_id_key" ON "post"("post_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_post_cover_id_key" ON "upload_detail"("post_cover_id");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_post_account_id_fkey" FOREIGN KEY ("post_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_post_cover_id_fkey" FOREIGN KEY ("post_cover_id") REFERENCES "post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
