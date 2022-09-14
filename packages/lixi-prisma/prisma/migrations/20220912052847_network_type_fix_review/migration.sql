/*
  Warnings:

  - You are about to drop the column `netword_type` on the `lixi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lixi" DROP COLUMN "netword_type",
ADD COLUMN     "network_type" TEXT NOT NULL DEFAULT 'single-ip';
