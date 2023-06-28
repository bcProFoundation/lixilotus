/*
  Warnings:

  - You are about to drop the column `original_language` on the `post_translation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "post" ADD COLUMN     "original_language" TEXT;

-- AlterTable
ALTER TABLE "post_translation" DROP COLUMN "original_language";
