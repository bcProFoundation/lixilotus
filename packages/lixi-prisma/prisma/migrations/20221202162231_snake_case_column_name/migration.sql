/*
  Warnings:

  - You are about to drop the column `createdAt` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `createdDate` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `initialTokenQuantity` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `lotusBurnDown` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `lotusBurnUp` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `tokenDocumentUrl` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `tokenId` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `tokenType` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `totalBurned` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `totalMinted` on the `token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token_id]` on the table `token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token_id` to the `token` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "token_tokenId_key";

-- AlterTable
ALTER TABLE "token" DROP COLUMN "createdAt",
DROP COLUMN "createdDate",
DROP COLUMN "initialTokenQuantity",
DROP COLUMN "lotusBurnDown",
DROP COLUMN "lotusBurnUp",
DROP COLUMN "tokenDocumentUrl",
DROP COLUMN "tokenId",
DROP COLUMN "tokenType",
DROP COLUMN "totalBurned",
DROP COLUMN "totalMinted",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "initial_token_quantity" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lotus_burn_down" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "lotus_burn_up" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "token_document_url" VARCHAR(1000) NOT NULL DEFAULT '',
ADD COLUMN     "token_id" TEXT NOT NULL,
ADD COLUMN     "token_type" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "total_burned" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "total_minted" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "token_token_id_key" ON "token"("token_id");
