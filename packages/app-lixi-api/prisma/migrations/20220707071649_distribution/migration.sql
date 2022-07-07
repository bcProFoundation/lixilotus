-- AlterTable
ALTER TABLE "lixi" ADD COLUMN     "is_lottery" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "distribution" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lixiId" INTEGER,

    CONSTRAINT "distribution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "distribution" ADD CONSTRAINT "distribution_lixiId_fkey" FOREIGN KEY ("lixiId") REFERENCES "lixi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
