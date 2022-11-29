-- AlterTable
ALTER TABLE "post" ADD COLUMN     "lotus_burn_down" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "lotus_burn_up" TEXT NOT NULL DEFAULT '0';
