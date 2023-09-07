/*
  Warnings:

  - You are about to drop the column `burned_value` on the `account_dana_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "account_dana_history" DROP COLUMN "burned_value",
ADD COLUMN     "given_up_value" DOUBLE PRECISION DEFAULT 0.0;
