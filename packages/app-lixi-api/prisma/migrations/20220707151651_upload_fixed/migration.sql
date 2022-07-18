/*
  Warnings:

  - You are about to drop the column `createdAt` on the `upload` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `upload` table. All the data in the column will be lost.
  - You are about to drop the column `originalFilename` on the `upload` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailHeight` on the `upload` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailWidth` on the `upload` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `upload` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `upload` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(10)`.
  - Added the required column `created_at` to the `upload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_size` to the `upload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_filename` to the `upload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `upload` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "upload" DROP COLUMN "createdAt",
DROP COLUMN "fileSize",
DROP COLUMN "originalFilename",
DROP COLUMN "thumbnailHeight",
DROP COLUMN "thumbnailWidth",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "file_size" INTEGER NOT NULL,
ADD COLUMN     "original_filename" VARCHAR NOT NULL,
ADD COLUMN     "thumbnail_height" INTEGER,
ADD COLUMN     "thumbnail_width" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL,
ALTER COLUMN "type" SET DATA TYPE VARCHAR(10);
