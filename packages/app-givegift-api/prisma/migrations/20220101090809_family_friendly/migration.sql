/*
  Warnings:

  - Added the required column `is_family_friendly` to the `vault` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vault" ADD COLUMN     "is_family_friendly" BOOLEAN NOT NULL;
