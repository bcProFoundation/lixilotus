/*
  Warnings:

  - You are about to drop the column `sender` on the `email_template` table. All the data in the column will be lost.
  - Added the required column `description` to the `email_template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_template" DROP COLUMN "sender",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "email_template_translation" ADD COLUMN     "sender" TEXT NOT NULL DEFAULT E'';
