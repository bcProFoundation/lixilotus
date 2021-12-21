/*
  Warnings:

  - You are about to drop the column `encrypted_mnemonic` on the `vault` table. All the data in the column will be lost.
  - Added the required column `account_id` to the `vault` table without a default value. This is not possible if the table is not empty.
  - Added the required column `derivation_path` to the `vault` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encrypted_privkey` to the `vault` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encrypted_pubkey` to the `vault` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vault" DROP COLUMN "encrypted_mnemonic",
ADD COLUMN     "account_id" INTEGER NOT NULL,
ADD COLUMN     "derivation_path" TEXT NOT NULL,
ADD COLUMN     "encrypted_privkey" TEXT NOT NULL,
ADD COLUMN     "encrypted_pubkey" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "encrypted_mnemonic" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vault" ADD CONSTRAINT "vault_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
