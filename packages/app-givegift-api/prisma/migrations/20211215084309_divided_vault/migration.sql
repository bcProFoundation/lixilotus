-- AlterTable
ALTER TABLE "vault" ADD COLUMN     "divided_value" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "vault_type" INTEGER NOT NULL DEFAULT 0;
