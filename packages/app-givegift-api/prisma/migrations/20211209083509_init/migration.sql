/*
  Warnings:

  - Added the required column `status` to the `vault` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vault" ADD COLUMN     "status" TEXT NOT NULL;
