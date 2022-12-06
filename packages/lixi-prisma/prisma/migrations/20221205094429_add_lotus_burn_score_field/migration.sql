-- AlterTable
ALTER TABLE "page" ADD COLUMN     "lotus_burn_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "lotus_burn_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "token" ADD COLUMN     "lotus_burn_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
