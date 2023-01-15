/*
  Warnings:

  - Changed the type of `from_account_id` on the `give_tip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `to_account_id` on the `give_tip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "give_tip" DROP COLUMN "from_account_id",
ADD COLUMN     "from_account_id" INTEGER NOT NULL,
DROP COLUMN "to_account_id",
ADD COLUMN     "to_account_id" INTEGER NOT NULL;
