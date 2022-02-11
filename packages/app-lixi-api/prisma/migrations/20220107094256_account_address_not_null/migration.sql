/*
  Warnings:

  - Made the column `address` on table `account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "account" ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "address" SET DEFAULT E'';
