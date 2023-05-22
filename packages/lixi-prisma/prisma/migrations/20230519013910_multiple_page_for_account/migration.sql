-- DropIndex
DROP INDEX "page_page_account_id_key";

-- AlterTable
ALTER TABLE "page" ADD COLUMN     "encrypted_mnemonic" TEXT,
ADD COLUMN     "salt" VARCHAR(10);
