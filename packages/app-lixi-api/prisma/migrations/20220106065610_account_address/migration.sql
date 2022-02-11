/*
  Warnings:

  - Added the required column `address` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "account" ADD COLUMN     "address" TEXT NOT NULL;
