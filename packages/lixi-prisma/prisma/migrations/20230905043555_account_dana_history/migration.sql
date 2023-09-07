/*
  Warnings:

  - You are about to drop the column `total_dana` on the `account` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BurnForType" AS ENUM ('PAGE', 'POST', 'COMMENT', 'ACCOUNT', 'TOKEN', 'WORSHIP');

-- CreateEnum
CREATE TYPE "BurnType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- AlterTable
ALTER TABLE "account" DROP COLUMN "total_dana";

-- CreateTable
CREATE TABLE "account_dana_history" (
    "id" TEXT NOT NULL,
    "txid" TEXT NOT NULL,
    "burn_type" "BurnType" NOT NULL,
    "burned_by_account_id" INTEGER NOT NULL,
    "burn_for_type" "BurnForType" NOT NULL,
    "burned_for_id" TEXT NOT NULL,
    "burned_value" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "dana_score_after_burn" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_dana_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "account_dana_history" ADD CONSTRAINT "account_dana_history_burned_by_account_id_fkey" FOREIGN KEY ("burned_by_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
