/*
  Warnings:

  - A unique constraint covering the columns `[normalizedContent]` on the table `hashtag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `normalizedContent` to the `hashtag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hashtag" ADD COLUMN     "normalizedContent" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "hashtag_normalizedContent_key" ON "hashtag"("normalizedContent");
