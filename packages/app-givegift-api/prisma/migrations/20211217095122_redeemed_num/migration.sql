/*
  Warnings:

  - You are about to drop the column `redeemed` on the `vault` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vault" DROP COLUMN "redeemed",
ADD COLUMN     "redeemed_num" INTEGER NOT NULL DEFAULT 0;
