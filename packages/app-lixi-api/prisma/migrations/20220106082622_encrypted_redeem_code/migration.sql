/*
  Warnings:

  - Added the required column `encrypted_redeem_code` to the `vault` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vault" ADD COLUMN     "encrypted_redeem_code" TEXT NOT NULL;
