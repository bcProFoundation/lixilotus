/*
  Warnings:

  - Made the column `netword_type` on table `lixi` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "lixi" ALTER COLUMN "netword_type" SET NOT NULL;
