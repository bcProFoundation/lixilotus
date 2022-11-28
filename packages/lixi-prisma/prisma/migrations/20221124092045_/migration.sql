-- AlterTable
ALTER TABLE "post" ADD COLUMN     "token_id" TEXT;

-- CreateTable
CREATE TABLE "token" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "tokenType" VARCHAR(255) NOT NULL DEFAULT '',
    "name" VARCHAR(255) NOT NULL DEFAULT '',
    "ticker" VARCHAR(255) NOT NULL DEFAULT '',
    "decimals" INTEGER NOT NULL,
    "tokenDocumentUrl" VARCHAR(1000) NOT NULL DEFAULT '',
    "totalBurned" TEXT NOT NULL DEFAULT '',
    "totalMinted" TEXT NOT NULL DEFAULT '',
    "lotusBurnUp" TEXT NOT NULL DEFAULT '0',
    "lotusBurnDown" TEXT NOT NULL DEFAULT '0',
    "initialTokenQuantity" TEXT NOT NULL DEFAULT '',
    "comments" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "createdDate" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_tokenId_key" ON "token"("tokenId");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE SET NULL ON UPDATE CASCADE;
