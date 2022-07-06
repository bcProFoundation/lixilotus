-- AlterTable
ALTER TABLE "lixi" ADD COLUMN     "is_lottery" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "distribution" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "distribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lixi_distribution" (
    "lixiId" INTEGER NOT NULL,
    "distributionId" TEXT NOT NULL,

    CONSTRAINT "lixi_distribution_pkey" PRIMARY KEY ("lixiId","distributionId")
);

-- AddForeignKey
ALTER TABLE "lixi_distribution" ADD CONSTRAINT "lixi_distribution_lixiId_fkey" FOREIGN KEY ("lixiId") REFERENCES "lixi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lixi_distribution" ADD CONSTRAINT "lixi_distribution_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "distribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
