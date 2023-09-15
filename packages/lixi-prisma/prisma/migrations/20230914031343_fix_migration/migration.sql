-- AlterTable
ALTER TABLE "account_dana" RENAME CONSTRAINT "AccountDana_pkey" TO "account_dana_pkey";

-- RenameForeignKey
ALTER TABLE "account_dana" RENAME CONSTRAINT "AccountDana_account_id_fkey" TO "account_dana_account_id_fkey";

-- RenameIndex
ALTER INDEX "AccountDana_account_id_key" RENAME TO "account_dana_account_id_key";
