-- CreateTable
CREATE TABLE "upload" (
    "id" TEXT NOT NULL,
    "originalFilename" VARCHAR NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "url" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "sha" TEXT,
    "extension" VARCHAR(10),
    "thumbnailWidth" INTEGER,
    "thumbnailHeight" INTEGER,
    "type" VARCHAR,
    "lixiId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upload_sha_key" ON "upload"("sha");

-- CreateIndex
CREATE UNIQUE INDEX "upload_lixiId_key" ON "upload"("lixiId");

-- AddForeignKey
ALTER TABLE "upload" ADD CONSTRAINT "upload_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload" ADD CONSTRAINT "upload_lixiId_fkey" FOREIGN KEY ("lixiId") REFERENCES "lixi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "upload" DROP CONSTRAINT "upload_accountId_fkey";

-- DropForeignKey
ALTER TABLE "upload" DROP CONSTRAINT "upload_lixiId_fkey";

-- AlterTable
ALTER TABLE "upload" ALTER COLUMN "lixiId" DROP NOT NULL,
ALTER COLUMN "accountId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "upload" ADD CONSTRAINT "upload_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload" ADD CONSTRAINT "upload_lixiId_fkey" FOREIGN KEY ("lixiId") REFERENCES "lixi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
