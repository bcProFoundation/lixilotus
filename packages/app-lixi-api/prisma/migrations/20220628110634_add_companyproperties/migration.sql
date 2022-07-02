/*
  Warnings:

  - Added the required column `category` to the `company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mnemonic_hash` to the `company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "company" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "mnemonic_hash" TEXT NOT NULL;
