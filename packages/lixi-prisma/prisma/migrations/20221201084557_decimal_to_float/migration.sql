/*
  Warnings:

  - You are about to alter the column `burned_value` on the `Burn` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Burn" ALTER COLUMN "burned_value" SET DATA TYPE DOUBLE PRECISION;
