/*
  Warnings:

  - You are about to alter the column `lotus_burn_down` on the `page` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `lotus_burn_up` on the `page` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - The `lotus_burn_down` column on the `token` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lotus_burn_up` column on the `token` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "page" ALTER COLUMN "lotus_burn_down" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lotus_burn_up" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "token" DROP COLUMN "lotus_burn_down",
ADD COLUMN     "lotus_burn_down" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
DROP COLUMN "lotus_burn_up",
ADD COLUMN     "lotus_burn_up" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
