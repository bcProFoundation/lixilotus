/*
  Warnings:

  - The `lotus_burn_down` column on the `post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lotus_burn_up` column on the `post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "post" DROP COLUMN "lotus_burn_down",
ADD COLUMN     "lotus_burn_down" BIGINT NOT NULL DEFAULT 0,
DROP COLUMN "lotus_burn_up",
ADD COLUMN     "lotus_burn_up" BIGINT NOT NULL DEFAULT 0;
