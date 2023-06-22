-- DropIndex
DROP INDEX "repost_account_id_idx";

-- DropIndex
DROP INDEX "repost_post_id_idx";

-- AlterTable
ALTER TABLE "repost" ADD COLUMN     "repost_fee" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "txid" TEXT;
