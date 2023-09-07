/*
  Warnings:

  - Changed the type of `burn_for_type` on the `account_dana_history` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "account_dana_history" DROP COLUMN "burn_for_type",
ADD COLUMN     "burn_for_type" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "BurnForType";
