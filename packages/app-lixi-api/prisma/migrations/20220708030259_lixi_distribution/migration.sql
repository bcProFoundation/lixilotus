-- AlterTable
ALTER TABLE "lixi" ADD COLUMN     "is_lottery" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "lixi_distribution" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lixiId" INTEGER NOT NULL,

    CONSTRAINT "lixi_distribution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lixi_distribution" ADD CONSTRAINT "lixi_distribution_lixiId_fkey" FOREIGN KEY ("lixiId") REFERENCES "lixi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
