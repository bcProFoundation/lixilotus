-- AlterTable
ALTER TABLE "page" ADD COLUMN     "create_comment_fee" TEXT NOT NULL DEFAULT '0.00055',
ADD COLUMN     "create_post_fee" TEXT NOT NULL DEFAULT '1.0';
