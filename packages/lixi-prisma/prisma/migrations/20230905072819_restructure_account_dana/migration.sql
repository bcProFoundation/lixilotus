/*
  Warnings:

  - You are about to drop the column `dana_given` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `dana_received` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `burned_by_account_id` on the `account_dana_history` table. All the data in the column will be lost.
  - You are about to drop the column `dana_score_after_burn` on the `account_dana_history` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountDanaHistoryType" AS ENUM ('GIVEN', 'RECEIVED');

-- DropForeignKey
ALTER TABLE "account_dana_history" DROP CONSTRAINT "account_dana_history_burned_by_account_id_fkey";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "dana_given",
DROP COLUMN "dana_received";

-- AlterTable
ALTER TABLE "account_dana_history" DROP COLUMN "burned_by_account_id",
DROP COLUMN "dana_score_after_burn",
ADD COLUMN     "accountDanaId" TEXT,
ADD COLUMN     "given_down_value" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "received_down_value" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "received_up_value" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "type" "AccountDanaHistoryType",
ALTER COLUMN "burned_value" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AccountDana" (
    "id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
    "dana_given" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "dana_received" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "AccountDana_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountDana_account_id_key" ON "AccountDana"("account_id");

-- AddForeignKey
ALTER TABLE "AccountDana" ADD CONSTRAINT "AccountDana_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_dana_history" ADD CONSTRAINT "account_dana_history_accountDanaId_fkey" FOREIGN KEY ("accountDanaId") REFERENCES "AccountDana"("id") ON DELETE SET NULL ON UPDATE CASCADE;
