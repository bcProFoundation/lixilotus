/*
  Warnings:

  - You are about to alter the column `lotus_burn_down` on the `post` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `lotus_burn_up` on the `post` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Burn" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "post" ALTER COLUMN "lotus_burn_down" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lotus_burn_up" SET DATA TYPE DOUBLE PRECISION;
