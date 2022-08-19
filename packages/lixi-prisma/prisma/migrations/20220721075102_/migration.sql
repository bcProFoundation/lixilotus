/*
  Warnings:

  - You are about to drop the column `handle_id` on the `page` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "page" DROP CONSTRAINT "page_handle_id_fkey";

-- AlterTable
ALTER TABLE "page" DROP COLUMN "handle_id";
