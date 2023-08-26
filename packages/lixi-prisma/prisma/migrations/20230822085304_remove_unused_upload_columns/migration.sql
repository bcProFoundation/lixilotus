/*
  Warnings:

  - You are about to drop the column `sha320` on the `upload` table. All the data in the column will be lost.
  - You are about to drop the column `sha40` on the `upload` table. All the data in the column will be lost.
  - You are about to drop the column `sha800` on the `upload` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "upload" DROP COLUMN "sha320",
DROP COLUMN "sha40",
DROP COLUMN "sha800";
