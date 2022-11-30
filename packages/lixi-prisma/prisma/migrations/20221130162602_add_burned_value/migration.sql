-- AlterTable
ALTER TABLE "Burn" ADD COLUMN     "burned_value" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "page" ADD COLUMN     "lotus_burn_down" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "lotus_burn_up" DECIMAL(65,30) NOT NULL DEFAULT 0.0;
