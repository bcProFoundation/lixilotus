-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "create_fee" DOUBLE PRECISION,
ADD COLUMN     "txid" TEXT;

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "create_fee" DOUBLE PRECISION,
ADD COLUMN     "txid" TEXT;
