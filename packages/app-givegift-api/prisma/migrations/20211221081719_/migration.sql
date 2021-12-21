/*
  Warnings:

  - You are about to drop the column `end_at` on the `vault` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vault" DROP COLUMN "end_at",
ADD COLUMN     "expiry_at" TIMESTAMP(3);
